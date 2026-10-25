import React, { useState, useEffect } from 'react';
import { Radio, ArrowLeft, RefreshCw, Home, ShieldAlert, Cpu } from 'lucide-react';

export const NotFoundView = ({ onBackHome, requestedPath = '/ruta-no-encontrada' }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      if (onBackHome) onBackHome();
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onBackHome]);

  return (
    <div className="min-h-[650px] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-[#0a152e]/90 border border-cyan-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl shadow-blue-950/80 space-y-6 relative overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-300">
        
        {/* Subtle Background Blueprint Grid */}
        <div className="absolute inset-0 bg-blueprint-grid opacity-30 pointer-events-none"></div>
        
        {/* Radar Graphic */}
        <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping"></div>
          <div className="w-24 h-24 rounded-full bg-[#060b18] border-2 border-[#00f0ff] flex items-center justify-center shadow-xl shadow-cyan-500/30 relative z-10">
            <Radio className="w-10 h-10 text-[#00f0ff] animate-pulse" />
          </div>
        </div>

        {/* 404 Text */}
        <div className="space-y-2 relative z-10">
          <span className="px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-cyan-950/80 text-[#00f0ff] border border-cyan-500/30">
            Error 404 • Nodo Fuera de Línea
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight pt-2">
            Ruta IT No Encontrada
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            El recurso o endpoint <code className="bg-[#060b18] text-[#00f0ff] px-2 py-0.5 rounded border border-blue-500/20 font-mono text-xs">{requestedPath}</code> no existe o fue reubicado en la matriz de Blueprint by QuintoNodo.
          </p>
        </div>

        {/* Auto Redirect Countdown Badge */}
        <div className="bg-[#060b18]/80 p-4 rounded-2xl border border-blue-500/20 max-w-sm mx-auto flex items-center justify-center space-x-3 text-xs text-slate-300 relative z-10">
          <RefreshCw className="w-4 h-4 text-[#00f0ff] animate-spin" />
          <span>
            Redireccionando automáticamente al inicio en <b className="text-white text-sm font-extrabold">{countdown}s</b>...
          </span>
        </div>

        {/* Immediate Return Button */}
        <div className="pt-2 flex justify-center relative z-10">
          <button
            onClick={onBackHome}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center space-x-2 transition-transform active:scale-95"
          >
            <Home className="w-4 h-4 text-[#060b18]" />
            <span className="text-[#060b18]">Regresar al Panel Principal de Blueprint</span>
          </button>
        </div>

      </div>
    </div>
  );
};
