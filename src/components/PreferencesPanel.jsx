import React, { useState, useEffect } from 'react';
import { Cookie, X, Sliders } from 'lucide-react';

export const CookieBanner = ({ forceOpen, onCloseForce }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [supportAiEnabled, setSupportAiEnabled] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('blueprint_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setIsCustomizeOpen(true);
    }
  }, [forceOpen]);

  const savePreferences = (type) => {
    const preferences = {
      essential: true,
      analytics: type === 'all' ? true : type === 'essential' ? false : analyticsEnabled,
      supportAi: type === 'all' ? true : type === 'essential' ? false : supportAiEnabled,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('blueprint_cookie_consent', JSON.stringify(preferences));
    setIsOpen(false);
    setIsCustomizeOpen(false);
    if (onCloseForce) onCloseForce();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-xl z-50 animate-in slide-in-from-bottom-6 duration-300">
      <div className="bg-[#0a152e]/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-blue-950/80 text-white space-y-4">
        
        {/* Encabezado del Banner */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-cyan-500/30 flex items-center justify-center text-[#00f0ff] shadow-md shadow-cyan-500/20">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Política de Cookies y Privacidad</h4>
              <p className="text-[11px] text-cyan-300 font-medium">Blueprint by QuintoNodo Tech</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (onCloseForce) onCloseForce();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Descripción */}
        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          Utilizamos cookies esenciales para el funcionamiento seguro de la plataforma, la generación de cotizaciones con inteligencia artificial y la geolocalización de especialistas en tiempo real. Puedes configurar tus preferencias o aceptarlas conforme a nuestra política de tratamiento de datos personales (Ley 1581 de 2012).
        </p>

        {/* Configuración Granular */}
        {isCustomizeOpen && (
          <div className="bg-[#060b18]/80 p-4 rounded-2xl border border-blue-500/20 space-y-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Cookies Esenciales (Obligatorias)</span>
                <span className="text-[11px] text-slate-400">Seguridad de la sesión, preferencias de moneda y órdenes de servicio.</span>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                Siempre Activas
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-blue-500/10">
              <div>
                <span className="font-bold text-white block">Cookies de Asistente IA y Cotizador</span>
                <span className="text-[11px] text-slate-400">Conservan el historial de simulaciones y presupuestos recientes.</span>
              </div>
              <input
                type="checkbox"
                checked={supportAiEnabled}
                onChange={(e) => setSupportAiEnabled(e.target.checked)}
                className="rounded border-blue-400 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer accent-[#00f0ff]"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-blue-500/10">
              <div>
                <span className="font-bold text-white block">Cookies de Rendimiento y Telemetría</span>
                <span className="text-[11px] text-slate-400">Optimizan la precisión del mapa de cobertura y tiempos de arribo.</span>
              </div>
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="rounded border-blue-400 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer accent-[#00f0ff]"
              />
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-blue-950/60 border border-blue-500/20 transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isCustomizeOpen ? 'Ocultar Opciones' : 'Personalizar'}</span>
          </button>

          <button
            type="button"
            onClick={() => savePreferences('essential')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-[#0f2042] border border-blue-400/30 transition-colors"
          >
            Solo Esenciales
          </button>

          <button
            type="button"
            onClick={() => savePreferences(isCustomizeOpen ? 'custom' : 'all')}
            className="px-4 py-2 rounded-xl text-xs font-extrabold text-[#060b18] bg-gradient-to-r from-[#00f0ff] to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-lg shadow-cyan-500/25 transition-transform active:scale-95"
          >
            {isCustomizeOpen ? 'Guardar Preferencias' : 'Aceptar Todas'}
          </button>
        </div>

      </div>
    </div>
  );
};
