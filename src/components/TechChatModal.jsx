import React, { useState } from 'react';
import { X, Send, Phone, Bike, Star, MessageSquare } from 'lucide-react';
import { playSoundEffect } from '../utils/soundEffects';

export const TechChatModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const tech = order.technician || {
    name: 'Juan Aguirre',
    title: 'Director Técnico • Infraestructura & Servidores B2B',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    vehicle: 'Nodo Móvil Blueprint #01',
    rating: 4.97
  };

  const [messages, setMessages] = useState([
    { sender: 'tech', text: `¡Hola! Voy en camino a ${order.address}. Llego en aproximadamente ${order.etaMinutes || 14} minutos con el kit de diagnóstico.`, time: 'Ahora' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    const prompt = inputText;
    setInputText('');
    playSoundEffect('notification');

    // Technician automatic reply simulation
    setTimeout(() => {
      let reply = 'Recibido. Voy atento al tráfico y llevo todo el instrumental y repuestos certificados.';
      if (prompt.toLowerCase().includes('piso') || prompt.toLowerCase().includes('estacionamiento') || prompt.toLowerCase().includes('oficina')) {
        reply = 'Entendido, me anunciaré en recepción del piso u oficina indicada.';
      } else if (prompt.toLowerCase().includes('pantalla') || prompt.toLowerCase().includes('celular') || prompt.toLowerCase().includes('oled')) {
        reply = 'Llevo el módulo de pantalla OLED grado original sellado de fábrica con programador TrueTone.';
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'tech',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      playSoundEffect('status_update');
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md">
      <div className="bg-[#0a152e] rounded-3xl w-full max-w-lg border border-cyan-500/30 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-white">
        
        {/* Header */}
        <div className="bg-[#060b18] p-4 border-b border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={tech.avatar} 
              alt={tech.name} 
              className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500/40"
            />
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                {tech.name}
                <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-500/40 px-2 py-0.2 rounded-full font-bold">
                  En Camino
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">{tech.vehicle} • Solicitud #{order.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a 
              href={`tel:${tech.phone}`}
              className="p-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-emerald-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button onClick={onClose} className="p-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="p-4 space-y-3 h-72 overflow-y-auto bg-blueprint-grid">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none font-medium'
                  : 'bg-[#0f2042] text-slate-200 border border-blue-500/20 rounded-bl-none'
              }`}>
                {m.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-[#060b18] border-t border-blue-500/15 flex space-x-1.5 overflow-x-auto text-[11px]">
          <button 
            onClick={() => setInputText('¿Llevas los repuestos originales y herramienta?')}
            className="px-2.5 py-1 rounded-lg bg-blue-950 text-cyan-200 hover:bg-blue-900 whitespace-nowrap font-medium border border-blue-500/20"
          >
            ¿Llevas los repuestos?
          </button>
          <button 
            onClick={() => setInputText('Subir por el ascensor principal al piso 4')}
            className="px-2.5 py-1 rounded-lg bg-blue-950 text-cyan-200 hover:bg-blue-900 whitespace-nowrap font-medium border border-blue-500/20"
          >
            Subir al Piso 4
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSend} className="p-3 bg-[#060b18] border-t border-blue-500/20 flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje al especialista en camino..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#0a152e] border border-blue-500/30 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#00f0ff]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] text-[#060b18] font-bold text-xs flex items-center justify-center shadow-md shadow-cyan-500/20 transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
