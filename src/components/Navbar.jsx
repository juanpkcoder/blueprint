import React from 'react';
import { 
  MapPin, Headphones, ClipboardList, 
  Zap, Bot, Award, Lock, Cookie, Wrench
} from 'lucide-react';

export const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  onOpenBookingModal, 
  activeOrdersCount, 
  currency = 'dual',
  onCurrencyChange,
  onOpenCookies,
  onOpenSecurity,
  onOpenTechProfiles
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#060b18]/90 border-b border-blue-500/20 shadow-2xl shadow-blue-950/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          
          {/* Logo y Sede Única Oficial Bogotá */}
          <div className="flex items-center gap-4 min-w-0">
            <div 
              onClick={() => setActiveTab('request')}
              className="flex items-center cursor-pointer group shrink-0"
            >
              <img 
                src="/blueprint-logo.svg" 
                alt="Blueprint by QuintoNodo Tech" 
                className="h-9 sm:h-10 w-auto shrink-0 object-contain group-hover:scale-105 transition-transform duration-300" 
              />
            </div>

            {/* Sede Única Oficial: Bogotá, D.C. */}
            <div className="hidden md:flex items-center bg-[#0a152e] border border-cyan-500/30 rounded-2xl px-3.5 py-1.5 text-xs text-slate-300 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#00f0ff] mr-2 shrink-0 animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Sede Central Oficial</span>
                <span className="font-extrabold text-white text-xs">Bogotá, D.C.</span>
              </div>
            </div>
          </div>

          {/* Controles Superiores: Divisa, Portafolio Técnico, Privacidad y Solicitud Exprés */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Selector de Divisa Bimoneda (COP / USD / Dual) */}
            <div className="inline-flex bg-[#0a152e] p-1 rounded-xl border border-blue-500/30 text-xs">
              <button
                type="button"
                onClick={() => onCurrencyChange && onCurrencyChange('cop')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  currency === 'cop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Mostrar tarifas en pesos colombianos (COP)"
              >
                COP ($)
              </button>
              <button
                type="button"
                onClick={() => onCurrencyChange && onCurrencyChange('usd')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  currency === 'usd' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Mostrar tarifas en dólares estadounidenses (USD)"
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => onCurrencyChange && onCurrencyChange('dual')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  currency === 'dual' ? 'bg-gradient-to-r from-blue-600 to-[#00f0ff] text-[#060b18]' : 'text-slate-400 hover:text-white'
                }`}
                title="Mostrar tarifas combinadas en COP y USD"
              >
                Dual
              </button>
            </div>

            {/* Botón de Especialistas y Evidencias Técnicas */}
            <button
              type="button"
              onClick={onOpenTechProfiles}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0a152e] hover:bg-blue-950 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-colors shadow-sm"
              title="Ver perfiles y galería de intervenciones de nuestros especialistas"
            >
              <Wrench className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span className="hidden lg:inline">Referencias Técnicas</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={onOpenCookies}
                className="p-2 rounded-xl bg-[#0a152e] hover:bg-blue-950 text-slate-400 hover:text-cyan-300 border border-blue-500/20 transition-colors"
                title="Preferencias de cookies y privacidad"
              >
                <Cookie className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onOpenSecurity}
                className="p-2 rounded-xl bg-[#0a152e] hover:bg-blue-950 text-slate-400 hover:text-cyan-300 border border-blue-500/20 transition-colors"
                title="Políticas de seguridad, confidencialidad (NDA) y SLA"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <button
              type="button"
              onClick={onOpenBookingModal}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:from-blue-500 hover:to-cyan-400 font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 whitespace-nowrap transition-transform active:scale-95"
              title="Solicitar atención técnica inmediata"
            >
              <Zap className="w-3.5 h-3.5 text-[#060b18]" />
              <span className="text-[#060b18] font-black">Solicitar Servicio</span>
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación para Clientes */}
        <div className="border-t border-blue-500/10 -mx-4 sm:mx-0 px-4 sm:px-0">
          <nav className="flex items-center gap-1 h-12 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&>button]:shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('request')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'request'
                  ? 'bg-blue-600/30 text-[#00f0ff] border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeTab === 'request' ? 'text-[#00f0ff]' : 'text-slate-400'}`} />
              <span>Servicios IT</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'subscriptions'
                  ? 'bg-blue-600/30 text-[#00f0ff] border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              <Award className={`w-4 h-4 ${activeTab === 'subscriptions' ? 'text-[#00f0ff]' : 'text-slate-400'}`} />
              <span>Suscripciones y SLA</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('aibot')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'aibot'
                  ? 'bg-blue-600/30 text-[#00f0ff] border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-[#00f0ff] hover:bg-cyan-950/40'
              }`}
            >
              <Bot className="w-4 h-4 text-[#00f0ff] animate-pulse" />
              <span>Cotizador IA</span>
              <span className="bg-cyan-950 text-[#00f0ff] text-[9px] px-1.5 py-0.5 rounded-full font-black border border-cyan-500/40">
                PRO
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tracking')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'tracking'
                  ? 'bg-blue-600/30 text-[#00f0ff] border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              <MapPin className={`w-4 h-4 ${activeTab === 'tracking' ? 'text-[#00f0ff]' : 'text-slate-400'}`} />
              <span>Rastreo GPS</span>
              {activeOrdersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping absolute top-1.5 right-1.5"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('remote')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'remote'
                  ? 'bg-blue-600/30 text-[#00f0ff] border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              <Headphones className={`w-4 h-4 ${activeTab === 'remote' ? 'text-[#00f0ff]' : 'text-slate-400'}`} />
              <span>Soporte Remoto</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-blue-600/30 text-[#00f0ff] border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              <ClipboardList className={`w-4 h-4 ${activeTab === 'orders' ? 'text-[#00f0ff]' : 'text-slate-400'}`} />
              <span>Mis Solicitudes</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
