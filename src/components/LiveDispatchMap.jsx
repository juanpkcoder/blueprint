import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, MessageSquare, ShieldCheck, Clock, Navigation, 
  CheckCircle2, AlertCircle, ArrowRight, UserCheck, Bike, Truck, 
  Play, Sparkles, RefreshCw, Star, X, Wrench, Building2, Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSoundEffect } from '../utils/soundEffects';

export const LiveTrackingMap = ({ activeOrder, onUpdateOrderStatus, onOpenChat, onSelectOrder }) => {
  const [techProgress, setTechProgress] = useState(0.4); // 0 to 1 along path
  const [simulating, setSimulating] = useState(true);

  // Default coordinates if no active order selected
  const order = activeOrder || {
    id: 'BPT-9042',
    customerName: 'Fintech Andina SAS',
    serviceName: 'Mantenimiento Preventivo Integral de 12 Puestos IT',
    address: 'Cra. 7 # 71-21, Chapinero, Bogotá D.C.',
    urgency: 'Express (< 60m)',
    status: 'en_camino',
    etaMinutes: 14,
    technician: {
      name: 'Juan Aguirre',
      title: 'Director Técnico • Infraestructura & Servidores B2B',
      rating: 4.97,
      jobsCompleted: 412,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      vehicle: 'Nodo Móvil Blueprint #01',
      plate: 'BPT-101 Bogotá',
      phone: '+57 310 000 0101'
    }
  };

  // Simulate technician GPS movement along path
  useEffect(() => {
    if (!simulating || order.status !== 'en_camino') return;
    
    const interval = setInterval(() => {
      setTechProgress(prev => {
        if (prev >= 0.95) {
          onUpdateOrderStatus && onUpdateOrderStatus(order.id, 'en_sitio');
          playSoundEffect('status_update');
          return 1.0;
        }
        return prev + 0.05;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [simulating, order.status, order.id, onUpdateOrderStatus]);

  const handleNextStatusStep = () => {
    const statuses = ['solicitado', 'tecnico_asignado', 'en_camino', 'en_sitio', 'completado'];
    const currentIndex = statuses.indexOf(order.status);
    if (currentIndex < statuses.length - 1) {
      const nextStatus = statuses[currentIndex + 1];
      if (nextStatus === 'completado') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
        playSoundEffect('success');
      } else {
        playSoundEffect('status_update');
      }
      onUpdateOrderStatus && onUpdateOrderStatus(order.id, nextStatus);
    }
  };

  // Coordinates for visual path simulation
  const currentX = 18 + (78 - 18) * techProgress;
  const currentY = 22 + (70 - 22) * techProgress;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'solicitado':
        return { text: 'Buscando Técnico...', bg: 'bg-blue-950 text-[#00f0ff] border-cyan-500/30' };
      case 'tecnico_asignado':
        return { text: 'Especialista Asignado', bg: 'bg-blue-950 text-[#00f0ff] border-cyan-500/30' };
      case 'en_camino':
        return { text: 'En Camino (GPS En Vivo)', bg: 'bg-cyan-950 text-cyan-300 border-cyan-500/50 animate-pulse' };
      case 'en_sitio':
        return { text: 'Técnico en Sitio', bg: 'bg-indigo-950 text-indigo-300 border-indigo-500/40' };
      case 'completado':
        return { text: 'Servicio Concluido', bg: 'bg-emerald-950 text-emerald-300 border-emerald-500/40' };
      default:
        return { text: 'En Proceso', bg: 'bg-slate-900 text-slate-300 border-slate-700' };
    }
  };

  const currentBadge = getStatusBadge(order.status);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Control */}
      <div className="bg-[#0a152e] p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-500/20 shadow-xl text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-cyan-500/30 flex items-center justify-center text-[#00f0ff]">
            <Navigation className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              Rastreo GPS en Tiempo Real
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${currentBadge.bg}`}>
                {currentBadge.text}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Orden: <span className="font-mono text-[#00f0ff] font-bold">{order.id}</span> • {order.serviceName}
            </p>
          </div>
        </div>

        {/* Demo Controller Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSimulating(!simulating)}
            className="px-3 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 text-xs font-semibold text-cyan-200 border border-blue-500/20 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Pausar Simulación GPS' : 'Reanudar GPS'}</span>
          </button>
          
          <button
            onClick={handleNextStatusStep}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:opacity-90 text-[#060b18] text-xs font-black shadow-md shadow-cyan-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-[#060b18]" />
            <span>Avanzar Estado</span>
          </button>
        </div>
      </div>

      {/* Main Delivery Layout: Map Left + Tech Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Simulated Delivery Map (2 Columns) */}
        <div className="lg:col-span-2 bg-[#0a152e] rounded-3xl p-4 border border-blue-500/20 shadow-2xl relative overflow-hidden min-h-[480px] flex flex-col justify-between">
          
          {/* Simulated Dark Map Canvas Container */}
          <div className="absolute inset-0 bg-[#060b18] overflow-hidden">
            {/* Grid Lines simulating city streets in dark mode */}
            <svg className="w-full h-full opacity-70" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-dark" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0f2042" strokeWidth="1.5" />
                  <circle cx="30" cy="30" r="1.5" fill="#1e3a8a" />
                </pattern>
                <linearGradient id="routeGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0070f3" />
                  <stop offset="100%" stopColor="#00f0ff" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-dark)" />

              {/* City Road Network Vector Paths */}
              <path d="M 50 100 Q 200 80 300 200 T 600 350" stroke="#162d59" strokeWidth="16" fill="none" />
              <path d="M 100 400 L 700 150" stroke="#162d59" strokeWidth="12" fill="none" />
              <path d="M 250 50 L 250 500" stroke="#162d59" strokeWidth="10" fill="none" />

              {/* Active Route Curve Line */}
              <path 
                d="M 120 120 Q 300 180 550 350" 
                stroke="url(#routeGradDark)" 
                strokeWidth="6" 
                strokeDasharray="8 6" 
                fill="none" 
                className="animate-pulse"
              />
            </svg>

            {/* Start Marker (Blueprint Hub) */}
            <div className="absolute top-[20%] left-[16%] flex flex-col items-center">
              <div className="bg-[#0a152e] text-[#00f0ff] border border-cyan-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold shadow-md mb-1">
                Hub Técnico QuintoNodo
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-950 border-2 border-[#00f0ff] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00f0ff]"></div>
              </div>
            </div>

            {/* Moving Technician Marker */}
            <div 
              className="absolute transition-all duration-1000 ease-out -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              style={{ left: `${currentX}%`, top: `${currentY}%` }}
            >
              {/* Tech Popup Bubble */}
              <div className="bg-[#0a152e] border border-cyan-500/40 text-white text-xs px-3 py-1 rounded-xl shadow-2xl flex items-center space-x-2 -mt-10 whitespace-nowrap mb-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping"></span>
                <span className="font-bold text-[#00f0ff]">{order.technician?.name || 'Técnico Blueprint'}</span>
                <span className="text-[10px] text-slate-300 font-mono">({Math.round((1 - techProgress) * (order.etaMinutes || 15))}m ETA)</span>
              </div>

              {/* Vehicle Icon Pin */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-[#00f0ff] text-[#060b18] flex items-center justify-center shadow-xl shadow-cyan-500/40 border-2 border-[#060b18] animate-radar">
                <Bike className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>

            {/* Destination Customer Marker */}
            <div className="absolute top-[68%] left-[76%] flex flex-col items-center z-10">
              <div className="bg-[#0a152e] text-cyan-300 border border-blue-500/30 text-[11px] px-3 py-1 rounded-xl font-bold shadow-lg mb-1 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>Ubicación ({order.customerName})</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-cyan-950/80 border-2 border-[#00f0ff] flex items-center justify-center animate-bounce shadow-md">
                <MapPin className="w-5 h-5 text-[#00f0ff] fill-[#00f0ff]/30" />
              </div>
            </div>
          </div>

          {/* Floating ETA & Map Overlay Bar */}
          <div className="relative z-10 mt-auto bg-[#0a152e]/95 backdrop-blur-md p-4 rounded-2xl border border-blue-500/25 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-cyan-500/30 flex items-center justify-center text-[#00f0ff] font-black text-lg shadow-sm">
                {order.status === 'en_sitio' ? '0' : Math.max(1, Math.round((1 - techProgress) * (order.etaMinutes || 15)))}
                <span className="text-[10px] ml-0.5 font-bold">m</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Tiempo Estimado de Llegada (ETA)</p>
                <p className="text-sm font-bold text-white">
                  {order.status === 'en_sitio' ? 'Especialista ya está en tus instalaciones' : 'Móvil técnico en ruta prioritaria'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-[#060b18] border border-blue-500/20 text-slate-300 flex items-center space-x-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>Distancia: <b>2.4 km</b></span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#060b18] border border-blue-500/20 text-slate-300 flex items-center space-x-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>GPS Encriptado</span>
              </div>
            </div>
          </div>

        </div>

        {/* Technician Profile Card & Timeline (1 Column) */}
        <div className="space-y-6">
          
          {/* Technician Profile Card */}
          <div className="bg-[#0a152e] rounded-3xl p-5 border border-blue-500/20 shadow-xl space-y-4 text-white">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Especialista Asignado</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Certificado Blueprint
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <img 
                src={order.technician?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} 
                alt={order.technician?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/30 shadow-md"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white truncate">{order.technician?.name}</h3>
                <p className="text-xs text-slate-400 truncate">{order.technician?.title}</p>
                <div className="flex items-center space-x-3 mt-1.5 text-xs">
                  <div className="flex items-center text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                    <span>{order.technician?.rating || '4.95'}</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 font-medium">{order.technician?.jobsCompleted || 380}+ servicios</span>
                </div>
              </div>
            </div>

            {/* Vehicle & Plate details */}
            <div className="bg-[#060b18] rounded-xl p-3 border border-blue-500/20 flex items-center justify-between text-xs font-medium">
              <div className="flex items-center space-x-2 text-slate-300">
                <Bike className="w-4 h-4 text-[#00f0ff]" />
                <span>{order.technician?.vehicle}</span>
              </div>
              <span className="font-mono text-[#00f0ff] bg-blue-950 px-2.5 py-0.5 rounded border border-cyan-500/30 font-bold">
                {order.technician?.plate}
              </span>
            </div>

            {/* Direct Contact Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${order.technician?.phone}`}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold border border-blue-500/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Llamar</span>
              </a>

              <button
                onClick={() => onOpenChat && onOpenChat(order)}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-[#0f2042] hover:bg-blue-800 text-[#00f0ff] text-xs font-bold border border-cyan-500/30 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#00f0ff]" />
                <span>Chat Directo</span>
              </button>
            </div>
          </div>

          {/* Delivery Timeline Card */}
          <div className="bg-[#0a152e] rounded-3xl p-5 border border-blue-500/20 shadow-xl space-y-4 text-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Progreso de la Orden
            </h4>

            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-950">
              
              {/* Step 1 */}
              <div className="flex items-start space-x-3 relative">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">1. Solicitud Recibida &amp; Validada</p>
                  <p className="text-[11px] text-slate-400 font-medium">Cotización y diagnóstico inicial verificado.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start space-x-3 relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm ${
                  ['tecnico_asignado', 'en_camino', 'en_sitio', 'completado'].includes(order.status)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-950 text-slate-500 border border-blue-800'
                }`}>
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${['tecnico_asignado', 'en_camino', 'en_sitio', 'completado'].includes(order.status) ? 'text-white' : 'text-slate-500'}`}>
                    2. Especialista Asignado
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">{order.technician?.name}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start space-x-3 relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm ${
                  ['en_camino', 'en_sitio', 'completado'].includes(order.status)
                    ? 'bg-[#00f0ff] text-[#060b18] animate-pulse font-black'
                    : 'bg-blue-950 text-slate-500 border border-blue-800'
                }`}>
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${['en_camino', 'en_sitio', 'completado'].includes(order.status) ? 'text-white' : 'text-slate-500'}`}>
                    3. En Camino (Monitoreo GPS)
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">Ruta optimizada sin tráfico por el nodo.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start space-x-3 relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm ${
                  ['en_sitio', 'completado'].includes(order.status)
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-950 text-slate-500 border border-blue-800'
                }`}>
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${['en_sitio', 'completado'].includes(order.status) ? 'text-white' : 'text-slate-500'}`}>
                    4. Técnico en Sitio &amp; Diagnóstico
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">Reparación de hardware o soporte corporativo.</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start space-x-3 relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm ${
                  order.status === 'completado'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-blue-950 text-slate-500 border border-blue-800'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${order.status === 'completado' ? 'text-emerald-300' : 'text-slate-500'}`}>
                    5. Servicio Concluido con Éxito
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">Garantía por escrito y factura electrónica emitida.</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
