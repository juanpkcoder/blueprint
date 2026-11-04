// Servicio de Sincronización en Tiempo Real de Soporte Remoto y Mesa de Ayuda
// Prioridad: 1) Supabase PostgreSQL (Producción Vercel) -> 2) Relay SSE Local -> 3) Almacenamiento Local

import { supabaseRest, isSupabaseConfigured } from './supabaseClient';

const getRelayApiBase = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_RELAY_API_URL) {
    return import.meta.env.VITE_RELAY_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5175/api/remote-support';
  }
  return null;
};

const API_BASE = getRelayApiBase();
const STORAGE_KEY = 'blueprint_remote_support_sessions_v1';

const mapRowToSession = (row) => ({
  id: row.id,
  createdAt: row.created_label || new Date(row.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  customerName: row.customer_name,
  company: row.company || '',
  issue: row.issue,
  remoteTool: row.remote_tool || 'AnyDesk',
  connectionId: row.connection_id || '',
  status: row.status || 'esperando_tecnico',
  assignedTech: row.assigned_tech || null,
  messages: Array.isArray(row.messages) ? row.messages : [],
  logs: Array.isArray(row.logs) ? row.logs : []
});

const mapSessionToRow = (session) => ({
  id: session.id,
  customer_name: session.customerName,
  company: session.company || null,
  issue: session.issue,
  remote_tool: session.remoteTool || 'AnyDesk',
  connection_id: session.connectionId || null,
  status: session.status || 'esperando_tecnico',
  assigned_tech: session.assignedTech || null,
  messages: session.messages || [],
  logs: session.logs || [],
  created_label: session.createdAt,
  updated_at: new Date().toISOString()
});

class RemoteSupportService {
  constructor() {
    this.sessions = this.loadLocalSessions();
    this.listeners = new Set();
    this.eventSource = null;
    this.pollTimer = null;
    this.initRealtime();
  }

  loadLocalSessions() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignorar error de lectura local
    }
    return [];
  }

  saveLocalSessions(sessions) {
    this.sessions = sessions;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // Ignorar error de escritura local
    }
    this.notifyListeners();
  }

  initRealtime() {
    if (typeof window === 'undefined') return;

    if (isSupabaseConfigured()) {
      this.startSupabasePolling();
      return;
    }

    if (!API_BASE) return;

    try {
      this.eventSource = new EventSource(`${API_BASE}/events`);

      this.eventSource.addEventListener('INITIAL_STATE', (e) => {
        try {
          const serverSessions = JSON.parse(e.data);
          if (Array.isArray(serverSessions)) {
            this.saveLocalSessions(serverSessions);
          }
        } catch {
          // Ignorar evento malformado
        }
      });

      this.eventSource.addEventListener('SESSION_CREATED', (e) => {
        try {
          const newSession = JSON.parse(e.data);
          const exists = this.sessions.some(s => s.id === newSession.id);
          if (!exists) {
            this.saveLocalSessions([newSession, ...this.sessions]);
          }
        } catch {
          // Ignorar evento malformado
        }
      });

      this.eventSource.addEventListener('SESSION_CLAIMED', (e) => {
        try {
          const updatedSession = JSON.parse(e.data);
          const updated = this.sessions.map(s => s.id === updatedSession.id ? updatedSession : s);
          this.saveLocalSessions(updated);
        } catch {
          // Ignorar evento malformado
        }
      });

      this.eventSource.addEventListener('NEW_MESSAGE', (e) => {
        try {
          const { sessionId, message } = JSON.parse(e.data);
          const updated = this.sessions.map(s => {
            if (s.id === sessionId) {
              const msgExists = (s.messages || []).some(m => m.id === message.id);
              if (!msgExists) {
                return {
                  ...s,
                  messages: [...(s.messages || []), message]
                };
              }
            }
            return s;
          });
          this.saveLocalSessions(updated);
        } catch {
          // Ignorar evento malformado
        }
      });

      this.eventSource.onerror = () => {
        // Respaldo local automático si el servidor relay no está activo
      };
    } catch (e) {
      console.warn('Conexión SSE no disponible, operando con sincronización local:', e);
    }
  }

  startSupabasePolling() {
    if (this.pollTimer || typeof window === 'undefined') return;
    this.pollTimer = window.setInterval(() => {
      if (this.listeners.size > 0 && document.visibilityState === 'visible') {
        this.getSessions().catch(() => {});
      }
    }, 5000);
  }

  async getSessions() {
    if (isSupabaseConfigured()) {
      try {
        const rows = await supabaseRest.select('remote_sessions', 'select=*&order=created_at.desc&limit=40');
        if (Array.isArray(rows)) {
          const mapped = rows.map(mapRowToSession);
          this.saveLocalSessions(mapped);
          return mapped;
        }
      } catch {
        // Continuar con respaldo siguiente
      }
    }

    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/sessions`);
        if (res.ok) {
          const data = await res.json();
          this.saveLocalSessions(data);
          return data;
        }
      } catch {
        // Continuar con sesiones locales
      }
    }
    return this.sessions;
  }

  async createSession(sessionData) {
    const sessionCode = `REM-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const baseSession = {
      id: sessionCode,
      createdAt: nowLabel,
      timestamp: Date.now(),
      customerName: sessionData.customerName || 'Cliente Particular',
      company: sessionData.company || '',
      issue: sessionData.issue || 'Asistencia técnica remota general',
      remoteTool: sessionData.remoteTool || 'AnyDesk / RustDesk',
      connectionId: sessionData.connectionId || '',
      status: 'esperando_tecnico',
      assignedTech: null,
      messages: [
        {
          id: `msg-${Date.now()}-0`,
          sender: 'system',
          senderName: 'Blueprint Core',
          text: `Solicitud #${sessionCode} registrada en la Mesa de Ayuda. En breve un especialista tomará tu caso en tiempo real.`,
          time: nowLabel
        }
      ],
      logs: [
        `[${new Date().toLocaleTimeString()}] [SISTEMA] Sesión creada #${sessionCode}`,
        `[${new Date().toLocaleTimeString()}] [SEGURIDAD] Canal cifrado en espera del especialista asignado.`
      ]
    };

    if (isSupabaseConfigured()) {
      try {
        const inserted = await supabaseRest.insert('remote_sessions', mapSessionToRow(baseSession));
        const finalSession = Array.isArray(inserted) && inserted[0] ? mapRowToSession(inserted[0]) : baseSession;
        this.saveLocalSessions([finalSession, ...this.sessions.filter(s => s.id !== finalSession.id)]);
        return finalSession;
      } catch {
        // Continuar con respaldo
      }
    }

    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData)
        });
        if (res.ok) {
          const newSession = await res.json();
          this.saveLocalSessions([newSession, ...this.sessions.filter(s => s.id !== newSession.id)]);
          return newSession;
        }
      } catch {
        // Continuar con creación local
      }
    }

    this.saveLocalSessions([baseSession, ...this.sessions]);
    return baseSession;
  }

  async claimSession(sessionId, techData) {
    const current = this.sessions.find(s => s.id === sessionId);
    const claimMsg = {
      id: `msg-${Date.now()}`,
      sender: 'system',
      senderName: 'Mesa de Ayuda',
      text: `🟢 El especialista ${techData.techName} (${techData.techBadge || 'Nodo Técnico'}) ha tomado tu solicitud en tiempo real.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (isSupabaseConfigured() && current) {
      try {
        const nextMessages = [...(current.messages || []), claimMsg];
        const nextLogs = [
          ...(current.logs || []),
          `[${new Date().toLocaleTimeString()}] [ASIGNACIÓN] Caso asumido por ${techData.techName}`
        ];
        const updatedRows = await supabaseRest.update(
          'remote_sessions',
          `id=eq.${encodeURIComponent(sessionId)}`,
          {
            status: 'en_atencion',
            assigned_tech: techData,
            messages: nextMessages,
            logs: nextLogs,
            updated_at: new Date().toISOString()
          }
        );
        if (Array.isArray(updatedRows) && updatedRows[0]) {
          const mapped = mapRowToSession(updatedRows[0]);
          this.saveLocalSessions(this.sessions.map(s => s.id === sessionId ? mapped : s));
          return mapped;
        }
      } catch {
        // Continuar con respaldo
      }
    }

    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(sessionId)}/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(techData)
        });
        if (res.ok) {
          const updated = await res.json();
          this.saveLocalSessions(this.sessions.map(s => s.id === sessionId ? updated : s));
          return updated;
        }
      } catch {
        // Continuar con asignación local
      }
    }

    const updated = this.sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          status: 'en_atencion',
          assignedTech: techData,
          messages: [...(s.messages || []), claimMsg]
        };
      }
      return s;
    });
    this.saveLocalSessions(updated);
    return updated.find(s => s.id === sessionId);
  }

  async sendMessage(sessionId, messageData) {
    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      sender: messageData.sender,
      senderName: messageData.senderName,
      text: messageData.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (isSupabaseConfigured()) {
      try {
        const rows = await supabaseRest.select('remote_sessions', `id=eq.${encodeURIComponent(sessionId)}&select=messages`);
        const latestMsgs = Array.isArray(rows) && rows[0] && Array.isArray(rows[0].messages)
          ? rows[0].messages
          : (this.sessions.find(s => s.id === sessionId)?.messages || []);
        const nextMessages = [...latestMsgs, newMsg];
        await supabaseRest.update(
          'remote_sessions',
          `id=eq.${encodeURIComponent(sessionId)}`,
          { messages: nextMessages, updated_at: new Date().toISOString() }
        );
        const updated = this.sessions.map(s => (s.id === sessionId ? { ...s, messages: nextMessages } : s));
        this.saveLocalSessions(updated);
        return newMsg;
      } catch {
        // Continuar con respaldo
      }
    }

    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(sessionId)}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData)
        });
        if (res.ok) {
          const relayMsg = await res.json();
          const updated = this.sessions.map(s => {
            if (s.id === sessionId) {
              return {
                ...s,
                messages: [...(s.messages || []), relayMsg]
              };
            }
            return s;
          });
          this.saveLocalSessions(updated);
          return relayMsg;
        }
      } catch {
        // Continuar con envío local
      }
    }

    const updated = this.sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: [...(s.messages || []), newMsg]
        };
      }
      return s;
    });
    this.saveLocalSessions(updated);
    return newMsg;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    if (isSupabaseConfigured()) {
      this.startSupabasePolling();
    }
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(fn => {
      try {
        fn(this.sessions);
      } catch {
        // Ignorar error en listener
      }
    });
  }
}

export const remoteSupportService = new RemoteSupportService();
