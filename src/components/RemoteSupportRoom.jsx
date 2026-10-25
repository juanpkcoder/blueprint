import React, { useState, useEffect } from 'react';
import { 
  Headphones, Shield, Monitor, Send, Terminal, CheckCircle2, 
  Copy, RefreshCw, Cpu, Activity, AlertCircle, PhoneCall, Zap, Lock
} from 'lucide-react';
import { playSoundEffect } from '../utils/soundEffects';

export const RemoteSupportRoom = () => {
  const [sessionCode] = useState(`BPT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState([
    '[SYSTEM] Iniciando consola de soporte remoto seguro Blueprint by QuintoNodo...',
    '[SECURITY] Estableciendo túnel encriptado SSL/TLS 256-bit AES...',
    `[SESSION] Token único de conexión generado: ${sessionCode}`,
    '[STATUS] Ingeniero de guardia asignado. Esperando handshake...'
  ]);

  const [chatMessages, setChatMessages] = useState([
    { sender: 'tech', text: '¡Hola! Soy Juan Diego Barreto de Soporte Remoto Blueprint QuintoNodo. Para iniciar el control remoto asistido, por favor indícame tu ID de AnyDesk, TeamViewer o RustDesk.', time: 'Ahora' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Simulate remote connection & diagnostic log stream
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setConnected(true);
      playSoundEffect('notification');
      setLogs(prev => [
        ...prev,
        '[CONN] 🟢 Juan Diego Barreto (QuintoNodo) conectado a la sesión segura.',
        '[DIAGNOSTIC] Ejecutando análisis de hardware, latencia y telemetría...'
      ]);
    }, 3500);

    const timer2 = setTimeout(() => {
      setLogs(prev => [
        ...prev,
        '[DIAGNOSTIC] Latencia de red: 12ms | Ancho de banda: 350 Mbps simétricos.',
        '[SECURITY] Escaneo antimalware en ejecución en segundo plano...',
        '[SYSTEM] Memoria RAM disponible: 74% | Temperatura CPU: 42°C (Óptima)'
      ]);
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    playSoundEffect('notification');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = {
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    playSoundEffect('notification');

    // Simulate technician fast reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'tech',
          text: 'Perfecto, recibido. Estoy sincronizando el entorno y aplicando las políticas de optimización del nodo.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      playSoundEffect('status_update');
    }, 1500);
  };

  return (
    <div className="space-y-6 text-white">
      
      {/* Top Banner Control */}
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
                Consola de Soporte Remoto Inmediato
              </h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                connected 
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' 
                  : 'bg-cyan-950 text-cyan-400 border-cyan-500/40 animate-pulse'
              }`}>
                {connected ? '● En Sesión Segura' : '○ Conectando...'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Túnel SSL 256-Bit • Asistencia para PCs, Laptops, Servidores y Diagnóstico Remoto
            </p>
          </div>
        </div>

        {/* Session Code Display */}
        <div className="bg-[#060b18] px-5 py-3 rounded-2xl border border-cyan-500/30 flex items-center space-x-4 shadow-xl">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
              Token de Sesión
            </span>
            <span className="text-xl font-mono font-black text-[#00f0ff] tracking-wider">
              {sessionCode}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-cyan-300 border border-blue-500/30 transition-all active:scale-95"
            title="Copiar Código de Sesión"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grid: Remote Viewer & Terminal Logs (Left) + Technician Live Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Remote Screen Mockup & Terminal Stream (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Virtual Screen Viewer */}
          <div className="bg-[#0a152e] rounded-3xl p-5 border border-blue-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#00f0ff]" />
                Pantalla Virtual Remota (Visor de Diagnóstico)
              </span>
              <span className="text-cyan-400 font-mono text-[11px] bg-blue-950 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                Res: 1920x1080 @ 60fps • 0 Latency
              </span>
            </div>

            {/* Virtual Screen Canvas */}
            <div className="w-full h-72 sm:h-80 bg-[#060b18] rounded-2xl border border-blue-500/20 relative overflow-hidden flex flex-col justify-between p-6">
              
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>SESSION_TARGET: HOST-ENTERPRISE-01</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Encriptación Activa
                </span>
              </div>

              {/* Center graphic */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-blue-950/80 border border-cyan-500/30 flex items-center justify-center mx-auto text-[#00f0ff] shadow-xl shadow-cyan-500/20">
                  <Activity className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    {connected ? 'Sesión de Soporte Remoto en Curso' : 'Esperando Conexión del Especialista...'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    El técnico tiene acceso visual supervisado. Puedes pausar o revocar la sesión en cualquier momento.
                  </p>
                </div>
              </div>

              {/* Status footer bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-blue-500/15 pt-3">
                <span>Software compatible: AnyDesk / TeamViewer / RustDesk</span>
                <span className="text-[#00f0ff] font-bold">Blueprint QuintoNodo SLA 99.9%</span>
              </div>

            </div>
          </div>

          {/* Diagnostic Console Terminal */}
          <div className="bg-[#060b18] rounded-3xl p-5 border border-blue-500/20 shadow-xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 border-b border-blue-500/20 pb-2">
              <span className="flex items-center gap-2 font-bold text-[#00f0ff]">
                <Terminal className="w-4 h-4" />
                Registro de Comandos &amp; Telemetría
              </span>
              <span className="text-[10px] text-emerald-400">STATUS: LIVE STREAMING</span>
            </div>

            <div className="space-y-1.5 h-36 overflow-y-auto text-slate-300">
              {logs.map((log, index) => (
                <div key={index} className="leading-relaxed">
                  <span className="text-slate-500 mr-2">&gt;</span>
                  <span className={log.includes('🟢') ? 'text-emerald-400 font-bold' : log.includes('TOKEN') || log.includes('SESSION') ? 'text-[#00f0ff]' : ''}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Technician Live Chat (1 Column) */}
        <div className="bg-[#0a152e] rounded-3xl border border-blue-500/20 shadow-2xl flex flex-col justify-between overflow-hidden h-[540px]">
          
          {/* Chat Header */}
          <div className="bg-[#060b18] p-4 border-b border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-[#00f0ff] p-[2px]">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250" 
                  alt="Juan Diego Barreto" 
                  className="w-full h-full rounded-[14px] object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Juan Diego Barreto</h4>
                <p className="text-[11px] text-cyan-300 font-medium">Ingeniero de Soporte Remoto • QuintoNodo</p>
              </div>
            </div>

            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
          </div>

          {/* Chat Messages Body */}
          <div className="p-4 space-y-3 flex-1 overflow-y-auto bg-blueprint-grid">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none font-medium'
                      : 'bg-[#0f2042] border border-blue-500/20 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-500 px-1 font-mono">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-3 bg-[#060b18] border-t border-blue-500/20 flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe tu AnyDesk ID o consulta..."
              className="flex-1 bg-[#0a152e] border border-blue-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00f0ff]"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] text-[#060b18] hover:opacity-90 font-bold transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
