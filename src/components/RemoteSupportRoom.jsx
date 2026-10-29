import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, Monitor, Send, Terminal, 
  Copy, Zap, Check, Clock
} from 'lucide-react';
import { remoteSupportService } from '../services/remoteSupportService';
import { sanitizeText } from '../utils/securityUtils';
import { playSoundEffect } from '../utils/soundEffects';

export const RemoteSupportRoom = () => {
  const [sessionsList, setSessionsList] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [formError, setFormError] = useState('');
  
  const [requestForm, setRequestForm] = useState({
    customerName: '',
    company: '',
    issue: '',
    remoteTool: 'AnyDesk',
    connectionId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messagesEndRef = useRef(null);
  const prevStatusRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    remoteSupportService.getSessions().then(sessions => {
      if (!isMounted || !Array.isArray(sessions)) return;
      setSessionsList(sessions);
      if (sessions.length > 0) {
        setActiveSessionId(prev => prev || sessions[0].id);
      }
    });

    const unsub = remoteSupportService.subscribe(sessions => {
      if (!isMounted || !Array.isArray(sessions)) return;
      setSessionsList(sessions);
      setActiveSessionId(prev => {
        if (prev) return prev;
        return sessions.length > 0 ? sessions[0].id : null;
      });
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const activeSession = isCreatingNew
    ? null
    : (sessionsList.find(s => s.id === activeSessionId) || sessionsList[0] || null);

  useEffect(() => {
    if (!activeSession) {
      prevStatusRef.current = null;
      return;
    }
    if (prevStatusRef.current === 'esperando_tecnico' && activeSession.status === 'en_atencion') {
      playSoundEffect('tech_assigned');
    }
    prevStatusRef.current = activeSession.status;
  }, [activeSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleCopyCode = () => {
    if (!activeSession) return;
    navigator.clipboard.writeText(activeSession.id);
    setCopied(true);
    playSoundEffect('notification');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    const cleanName = sanitizeText(requestForm.customerName, 100);
    const cleanIssue = sanitizeText(requestForm.issue, 400);

    if (!cleanName || !cleanIssue) {
      setFormError('Por favor ingresa tu nombre completo y describe el requerimiento técnico.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    try {
      const newSession = await remoteSupportService.createSession({
        customerName: cleanName,
        company: sanitizeText(requestForm.company, 120),
        issue: cleanIssue,
        remoteTool: sanitizeText(requestForm.remoteTool, 60),
        connectionId: sanitizeText(requestForm.connectionId, 60)
      });
      setSessionsList(prev => [newSession, ...prev.filter(s => s.id !== newSession.id)]);
      setActiveSessionId(newSession.id);
      setIsCreatingNew(false);
      setRequestForm({
        customerName: '',
        company: '',
        issue: '',
        remoteTool: 'AnyDesk',
        connectionId: ''
      });
      playSoundEffect('order_created');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const cleanMsg = sanitizeText(inputMessage, 400);
    if (!cleanMsg || !activeSession) return;

    setInputMessage('');

    await remoteSupportService.sendMessage(activeSession.id, {
      sender: 'client',
      senderName: activeSession.customerName || 'Cliente',
      text: cleanMsg
    });
    playSoundEffect('notification');
  };

  const isAssigned = activeSession?.status === 'en_atencion' && activeSession?.assignedTech;

  return (
    <div className="space-y-6 text-white">
      
      {/* Encabezado Superior */}
      <div className="bg-[#0a152e] p-6 rounded-3xl border border-blue-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-[#00f0ff] p-[2px] shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-[#060b18] rounded-[14px] flex items-center justify-center">
              <Headphones className="w-7 h-7 text-[#00f0ff] animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black text-white tracking-wide">
                Mesa de Ayuda • Soporte Remoto en Tiempo Real
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                Sede Central Bogotá, D.C.
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isAssigned
                ? `Conectado y atendido en vivo por ${activeSession.assignedTech.techName}`
                : 'Canal de asistencia cifrado TLS / AES-256 atendido por ingenieros certificados de guardia'}
            </p>
          </div>
        </div>

        {activeSession && (
          <div className="flex items-center space-x-3 bg-[#060b18] px-4 py-2.5 rounded-2xl border border-blue-500/30">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Código de Sesión</span>
              <span className="font-mono text-sm font-black text-[#00f0ff]">#{activeSession.id}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-cyan-300 transition-colors"
              title="Copiar código de sesión"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Formulario de Solicitud de Soporte Remoto */}
      {!activeSession ? (
        <div className="bg-[#0a152e] rounded-3xl border border-blue-500/20 p-6 sm:p-10 max-w-2xl mx-auto shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-950 text-[#00f0ff] border border-cyan-500/30 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white">Solicitar Asistencia Remota Inmediata</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Registra los datos de tu requerimiento. Nuestro equipo de ingenieros recibirá la alerta de inmediato y el primer especialista disponible asumirá tu caso en línea.
            </p>
          </div>

          <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={requestForm.customerName}
                  onChange={(e) => setRequestForm({ ...requestForm, customerName: e.target.value })}
                  placeholder="Ej.: Andrés Morales"
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Empresa o Razón Social (Opcional)</label>
                <input
                  type="text"
                  maxLength={120}
                  value={requestForm.company}
                  onChange={(e) => setRequestForm({ ...requestForm, company: e.target.value })}
                  placeholder="Ej.: Inversiones Andinas S.A.S."
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Descripción de la Falla o Requerimiento *</label>
              <textarea
                required
                rows={3}
                maxLength={400}
                value={requestForm.issue}
                onChange={(e) => setRequestForm({ ...requestForm, issue: e.target.value })}
                placeholder="Describe el inconveniente: lentitud del sistema, configuración de correo corporativo, acceso VPN o impresoras..."
                className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Herramienta de Asistencia Remota</label>
                <select
                  value={requestForm.remoteTool}
                  onChange={(e) => setRequestForm({ ...requestForm, remoteTool: e.target.value })}
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
                >
                  <option value="AnyDesk">AnyDesk (Recomendado)</option>
                  <option value="RustDesk">RustDesk (Código Abierto)</option>
                  <option value="TeamViewer">TeamViewer</option>
                  <option value="Asistencia Rápida de Windows">Asistencia Rápida de Windows</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">ID o Código de Conexión de tu Equipo</label>
                <input
                  type="text"
                  maxLength={60}
                  value={requestForm.connectionId}
                  onChange={(e) => setRequestForm({ ...requestForm, connectionId: e.target.value })}
                  placeholder="Ej.: 1 938 492 102"
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>
            </div>

            {formError && (
              <p className="text-xs text-rose-400 font-semibold">{formError}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              {sessionsList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="py-3.5 px-5 rounded-2xl bg-blue-950 hover:bg-blue-900 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  Volver a Sesión Activa
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:opacity-95 text-[#060b18] font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isSubmitting ? 'Conectando con la Mesa de Ayuda...' : 'Iniciar Sesión de Soporte en Vivo'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Sala de Soporte Bidireccional en Tiempo Real */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="space-y-5">
            
            <div className={`p-5 rounded-3xl border transition-all ${
              isAssigned 
                ? 'bg-emerald-950/40 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
                : 'bg-amber-950/40 border-amber-500/40 shadow-lg shadow-amber-500/10'
            }`}>
              <div className="flex items-center space-x-3">
                {isAssigned ? (
                  <img 
                    src={activeSession.assignedTech.techAvatar} 
                    alt={activeSession.assignedTech.techName} 
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#060b18] border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-amber-400 animate-spin" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isAssigned ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`}></span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                      {isAssigned ? 'Especialista en Línea' : 'Asignando Especialista'}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-black text-white mt-0.5">
                    {isAssigned ? activeSession.assignedTech.techName : 'Mesa de Ayuda QuintoNodo'}
                  </h4>
                  
                  <p className="text-[11px] text-cyan-300">
                    {isAssigned ? activeSession.assignedTech.techTitle : 'Notificando a nuestros ingenieros de guardia en Bogotá...'}
                  </p>
                </div>
              </div>

              {!isAssigned && (
                <div className="mt-3 pt-3 border-t border-amber-500/20 text-[11px] text-amber-300 leading-snug">
                  Tu requerimiento se encuentra priorizado en la cola de atención. En cuanto un especialista tome tu solicitud, verás su perfil aquí y comenzará la asistencia.
                </div>
              )}
            </div>

            <div className="bg-[#0a152e] p-5 rounded-3xl border border-blue-500/20 space-y-3 text-xs">
              <h5 className="font-extrabold text-white text-xs uppercase tracking-wider">Detalles de la Conexión</h5>
              
              <div className="space-y-2 bg-[#060b18] p-3.5 rounded-2xl border border-blue-500/10">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cliente:</span>
                  <span className="font-bold text-white">{activeSession.customerName}</span>
                </div>
                {activeSession.company && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Empresa:</span>
                    <span className="font-bold text-cyan-300">{activeSession.company}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Herramienta:</span>
                  <span className="font-bold text-white">{activeSession.remoteTool}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ID de Conexión:</span>
                  <span className="font-mono text-cyan-300 font-bold">{activeSession.connectionId || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hora de registro:</span>
                  <span className="text-slate-300">{activeSession.createdAt}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="w-full py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                + Registrar Nueva Solicitud de Soporte
              </button>
            </div>

            <div className="bg-[#060b18] p-4 rounded-3xl border border-blue-500/20 font-mono text-[11px] text-cyan-300 space-y-1.5 max-h-48 overflow-y-auto">
              <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] pb-1 border-b border-blue-500/20">
                <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>Registro de Conexión Cifrada</span>
              </div>
              {(activeSession.logs || []).map((log, index) => (
                <p key={index} className="leading-tight">{log}</p>
              ))}
            </div>

          </div>

          <div className="lg:col-span-2 bg-[#0a152e] rounded-3xl border border-blue-500/20 p-5 flex flex-col justify-between shadow-2xl min-h-[550px]">
            
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">
                    Chat en Vivo con el Especialista Técnico
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isAssigned
                      ? `Conectado con ${activeSession.assignedTech.techName} • Atención en tiempo real`
                      : 'Puedes adelantar detalles adicionales mientras el especialista se conecta'}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                isAssigned ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
              }`}>
                {isAssigned ? '● En Línea' : '⏳ En Espera'}
              </span>
            </div>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 [scrollbar-width:thin] my-4 flex-1">
              {(activeSession.messages || []).map(msg => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="text-center my-3">
                      <span className="inline-block bg-[#060b18] border border-blue-500/25 px-4 py-1.5 rounded-full text-[11px] text-cyan-300 font-semibold shadow-sm">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isMe = msg.sender === 'client';

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                      <span className="font-bold text-white">{msg.senderName}</span>
                      <span>• {msg.time}</span>
                    </div>
                    <div className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed shadow-md ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-[#060b18] text-slate-100 border border-cyan-500/30 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="pt-3 border-t border-blue-500/20 flex gap-2">
              <input
                type="text"
                maxLength={400}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu mensaje o consulta técnica..."
                className="flex-1 bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:opacity-95 disabled:opacity-40 text-[#060b18] font-black text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Send className="w-4 h-4 fill-current" />
                <span>Enviar</span>
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
};
