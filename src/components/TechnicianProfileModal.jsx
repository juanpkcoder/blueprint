import React, { useState, useEffect } from 'react';
import { 
  Wrench, Star, Image as ImageIcon
} from 'lucide-react';
import { techProfileService } from '../services/technicianProfileService';

export const TechnicianProfileModal = ({ isOpen, onClose, onSelectTechForService }) => {
  const [profiles, setProfiles] = useState(techProfileService.getProfiles());
  const [selectedTechId, setSelectedTechId] = useState(profiles[0]?.id || 'tech-1');
  const [selectedReference, setSelectedReference] = useState(null);

  useEffect(() => {
    const unsub = techProfileService.subscribe((updated) => {
      setProfiles(updated);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const currentTech = profiles.find(t => t.id === selectedTechId) || profiles[0];
  const portfolio = currentTech?.portfolio || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0a152e] w-full max-w-4xl rounded-3xl border border-cyan-500/30 p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-blue-500/20 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30 shadow-md">
              <Wrench className="w-5 h-5 text-[#00f0ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  Especialistas de QuintoNodo y Galería de Referencias
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                  Sede Bogotá, D.C.
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Registro fotográfico de intervenciones técnicas, reparaciones móviles y mantenimiento de servidores
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-blue-950 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Selector de Especialistas */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {profiles.map(tech => (
            <button
              type="button"
              key={tech.id}
              onClick={() => setSelectedTechId(tech.id)}
              className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                selectedTechId === tech.id
                  ? 'bg-gradient-to-r from-blue-600 to-[#00f0ff] text-[#060b18] border-transparent shadow-lg shadow-cyan-500/20'
                  : 'bg-[#060b18] text-slate-300 border-blue-500/20 hover:border-cyan-400/40'
              }`}
            >
              <img src={tech.avatar} alt={tech.name} className="w-5 h-5 rounded-md object-cover" />
              <span>{tech.name}</span>
            </button>
          ))}
        </div>

        {/* Ficha del Especialista */}
        {currentTech && (
          <div className="bg-[#060b18] p-5 rounded-2xl border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img 
                src={currentTech.avatar} 
                alt={currentTech.name} 
                className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg shrink-0" 
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-white text-base">{currentTech.name}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-blue-950 text-[#00f0ff] text-[10px] font-bold border border-cyan-500/30">
                    {currentTech.vehicle || 'Nodo Técnico'}
                  </span>
                </div>
                <p className="text-xs text-cyan-300 font-semibold">{currentTech.title}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {currentTech.rating || 4.9}
                  </span>
                  <span>• {currentTech.jobsCompleted || 300}+ órdenes finalizadas</span>
                  <span>• Sede: Bogotá, D.C.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSelectTechForService) {
                  onSelectTechForService(currentTech);
                }
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] text-[#060b18] font-black text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 whitespace-nowrap self-end md:self-center"
            >
              Solicitar con {currentTech.name.split(' ')[0]}
            </button>
          </div>
        )}

        {/* Cuadrícula de Referencias */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#00f0ff]" />
              Galería de Intervenciones y Referencias Técnicas ({portfolio.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Evidencias documentadas en laboratorio y en sedes corporativas
            </span>
          </div>

          {portfolio.length === 0 ? (
            <div className="bg-[#060b18] p-8 text-center rounded-2xl border border-blue-500/20">
              <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Este especialista aún no cuenta con fotografías adicionales publicadas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.map(ref => (
                <div 
                  key={ref.id}
                  onClick={() => setSelectedReference(ref)}
                  className="bg-[#060b18] rounded-2xl border border-blue-500/20 overflow-hidden hover:border-cyan-400/50 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                    <img 
                      src={ref.imageUrl} 
                      alt={ref.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#060b18]/80 text-[#00f0ff] text-[10px] font-bold border border-cyan-500/30 backdrop-blur-sm">
                      {ref.category}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 text-[10px] text-slate-300 bg-[#060b18]/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {ref.date}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h5 className="font-bold text-white text-xs leading-snug group-hover:text-cyan-300 transition-colors">
                      {ref.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {ref.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vista Ampliada de Referencia */}
        {selectedReference && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#030712]/90 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-[#0a152e] w-full max-w-2xl rounded-3xl border border-cyan-500/40 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">{selectedReference.category}</span>
                <button
                  type="button"
                  onClick={() => setSelectedReference(null)}
                  className="w-7 h-7 rounded-lg bg-blue-950 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden max-h-80 bg-black flex items-center justify-center">
                <img 
                  src={selectedReference.imageUrl} 
                  alt={selectedReference.title} 
                  className="w-full max-h-80 object-contain"
                />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-white">{selectedReference.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedReference.description}</p>
                <span className="text-[10px] text-slate-500 mt-2 block">Fecha de intervención: {selectedReference.date}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
