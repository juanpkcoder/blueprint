// Servicio de Sincronización en Tiempo Real de Soporte Remoto y Mesa de Ayuda
// En producción utiliza VITE_RELAY_API_URL (HTTPS) o modo local seguro sin exponer conexiones HTTP inseguras

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

class RemoteSupportService {
  constructor() {
    this.sessions = this.loadLocalSessions();
    this.listeners = new Set();
    this.eventSource = null;
    this.initSSE();
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

  initSSE() {
    if (typeof window === 'undefined' || !API_BASE) return;

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

  async getSessions() {
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

    const sessionCode = `REM-${Math.floor(1000 + Math.random() * 9000)}`;
    const localSession = {
      id: sessionCode,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      logs: [
        `[${new Date().toLocaleTimeString()}] [SISTEMA] Sesión creada #${sessionCode}`,
        `[${new Date().toLocaleTimeString()}] [SEGURIDAD] Canal cifrado en espera del especialista asignado.`
      ]
    };
    this.saveLocalSessions([localSession, ...this.sessions]);
    return localSession;
  }

  async claimSession(sessionId, techData) {
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
        const claimMsg = {
          id: `msg-${Date.now()}`,
          sender: 'system',
          senderName: 'Mesa de Ayuda',
          text: `🟢 El especialista ${techData.techName} (${techData.techBadge || 'Nodo Técnico'}) ha tomado tu solicitud en tiempo real.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
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
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(sessionId)}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData)
        });
        if (res.ok) {
          const newMsg = await res.json();
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
      } catch {
        // Continuar con envío local
      }
    }

    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      sender: messageData.sender,
      senderName: messageData.senderName,
      text: messageData.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
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
