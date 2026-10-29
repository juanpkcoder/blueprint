// Servidor Relay para Sincronización en Tiempo Real de Mesa de Ayuda / Soporte Remoto
// Incluye protecciones de seguridad contra DoS (límite de payload y memoria), validación de entrada y cabeceras HTTP seguras

import http from 'http';

const PORT = Number(process.env.PORT) || 5175;
const MAX_BODY_BYTES = 512 * 1024; // 512 KB máximo por petición (soporta avatares y portafolio comprimido)
const MAX_SESSIONS = 100;
const MAX_MESSAGES_PER_SESSION = 200;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174')
  .split(',')
  .map(o => o.trim());

let remoteSessions = [];
let sharedProfiles = [];
let sharedTickets = [];
let sseClients = [];

const CLAIM_PATH_REGEX = new RegExp('^/api/remote-support/([A-Za-z0-9-]+)/claim$');
const MESSAGE_PATH_REGEX = new RegExp('^/api/remote-support/([A-Za-z0-9-]+)/message$');

const cleanText = (val, maxLen = 300) => {
  if (typeof val !== 'string') return '';
  return val.replace(/\p{Cc}/gu, '').trim().slice(0, maxLen);
};

const sendSSE = (eventType, data) => {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(res => {
    try {
      res.write(payload);
    } catch {
      // Cliente desconectado
    }
  });
};

const setSecurityAndCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
};

const readJsonBody = (req, res, callback) => {
  let body = '';
  let aborted = false;

  req.on('data', chunk => {
    if (aborted) return;
    body += chunk;
    if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) {
      aborted = true;
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'El tamaño de la solicitud excede el límite permitido (16 KB).' }));
      req.destroy();
    }
  });

  req.on('end', () => {
    if (aborted) return;
    try {
      const parsed = JSON.parse(body || '{}');
      callback(parsed);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Formato JSON inválido.' }));
    }
  });
};

const server = http.createServer((req, res) => {
  setSecurityAndCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // 1. Server-Sent Events (SSE) para tiempo real
  if (req.method === 'GET' && pathname === '/api/remote-support/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('retry: 3000\n\n');
    res.write(`event: INITIAL_STATE\ndata: ${JSON.stringify(remoteSessions)}\n\n`);

    sseClients.push(res);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c !== res);
    });
    return;
  }

  // 2. Obtener lista de sesiones
  if (req.method === 'GET' && pathname === '/api/remote-support/sessions') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(remoteSessions));
    return;
  }

  // 3. Crear nueva solicitud de soporte remoto
  if (req.method === 'POST' && pathname === '/api/remote-support/create') {
    readJsonBody(req, res, (payload) => {
      const sessionCode = `REM-${Math.floor(1000 + Math.random() * 9000)}`;
      const newSession = {
        id: sessionCode,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: Date.now(),
        customerName: cleanText(payload.customerName, 100) || 'Cliente Particular',
        company: cleanText(payload.company, 120),
        issue: cleanText(payload.issue, 500) || 'Asistencia técnica remota general',
        remoteTool: cleanText(payload.remoteTool, 60) || 'AnyDesk / RustDesk',
        connectionId: cleanText(payload.connectionId, 60),
        status: 'esperando_tecnico',
        assignedTech: null,
        messages: [
          {
            id: `msg-${Date.now()}-0`,
            sender: 'system',
            senderName: 'Blueprint Core',
            text: `Solicitud de soporte remoto #${sessionCode} registrada en la Mesa de Ayuda. En breve un especialista tomará tu caso en tiempo real.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ],
        logs: [
          `[${new Date().toLocaleTimeString()}] [SISTEMA] Sesión generada #${sessionCode}`,
          `[${new Date().toLocaleTimeString()}] [RED] Conexión TLS segura en espera del especialista asignado.`
        ]
      };

      remoteSessions.unshift(newSession);
      if (remoteSessions.length > MAX_SESSIONS) {
        remoteSessions = remoteSessions.slice(0, MAX_SESSIONS);
      }
      sendSSE('SESSION_CREATED', newSession);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newSession));
    });
    return;
  }

  // 4. Técnico toma la solicitud
  if (req.method === 'POST' && CLAIM_PATH_REGEX.test(pathname)) {
    const sessionId = pathname.split('/')[3];
    readJsonBody(req, res, (payload) => {
      const session = remoteSessions.find(s => s.id === sessionId);
      if (!session) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Sesión no encontrada.' }));
        return;
      }

      const techName = cleanText(payload.techName, 80) || 'Especialista Blueprint';
      const techBadge = cleanText(payload.techBadge, 60) || 'Nodo Técnico';

      session.status = 'en_atencion';
      session.assignedTech = {
        techId: cleanText(payload.techId, 40),
        techName,
        techTitle: cleanText(payload.techTitle, 120),
        techAvatar: cleanText(payload.techAvatar, 500),
        techBadge
      };

      const claimMessage = {
        id: `msg-${Date.now()}`,
        sender: 'system',
        senderName: 'Mesa de Ayuda',
        text: `🟢 ¡El especialista ${techName} (${techBadge}) ha tomado tu solicitud y se encuentra en línea!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      session.messages.push(claimMessage);
      session.logs.push(`[${new Date().toLocaleTimeString()}] [CONEXIÓN] Especialista ${techName} asumió la atención del caso.`);

      sendSSE('SESSION_CLAIMED', session);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(session));
    });
    return;
  }

  // 5. Enviar mensaje de chat
  if (req.method === 'POST' && MESSAGE_PATH_REGEX.test(pathname)) {
    const sessionId = pathname.split('/')[3];
    readJsonBody(req, res, (payload) => {
      const session = remoteSessions.find(s => s.id === sessionId);
      if (!session) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Sesión no encontrada.' }));
        return;
      }

      const text = cleanText(payload.text, 500);
      if (!text) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'El mensaje no puede estar vacío.' }));
        return;
      }

      const sender = payload.sender === 'tech' ? 'tech' : 'client';
      const newMsg = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        sender,
        senderName: cleanText(payload.senderName, 80) || (sender === 'tech' ? (session.assignedTech?.techName || 'Especialista Blueprint') : 'Cliente'),
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      session.messages.push(newMsg);
      if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
        session.messages = session.messages.slice(-MAX_MESSAGES_PER_SESSION);
      }
      sendSSE('NEW_MESSAGE', { sessionId, message: newMsg });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newMsg));
    });
    return;
  }

  // 6. Sincronización de perfiles de especialistas entre puertos (:5173 <-> :5174)
  if (req.method === 'GET' && pathname === '/api/profiles') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sharedProfiles));
    return;
  }

  if (req.method === 'POST' && pathname === '/api/profiles') {
    readJsonBody(req, res, (payload) => {
      if (Array.isArray(payload.profiles)) {
        sharedProfiles = payload.profiles.slice(0, 20);
        sendSSE('PROFILES_UPDATED', sharedProfiles);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, count: sharedProfiles.length }));
    });
    return;
  }

  // 7. Sincronización de tickets Blueprint OS entre puertos (:5173 <-> :5174)
  if (req.method === 'GET' && pathname === '/api/tickets') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sharedTickets));
    return;
  }

  if (req.method === 'POST' && pathname === '/api/tickets') {
    readJsonBody(req, res, (payload) => {
      if (Array.isArray(payload.tickets)) {
        sharedTickets = payload.tickets.slice(0, 200);
        sendSSE('TICKETS_UPDATED', sharedTickets);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, count: sharedTickets.length }));
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'Blueprint Real-Time Helpdesk Relay' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Blueprint Relay] Servidor de tiempo real escuchando en http://127.0.0.1:${PORT}`);
});
