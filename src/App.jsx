import React, { useState, useEffect } from 'react';
import { 
  Zap, Smartphone, Headphones, ShieldCheck, 
  Award, ChevronRight, Radio, Bot, X, Building2
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LiveTrackingMap } from './components/LiveDispatchMap';
import { ServiceBookingModal } from './components/ServiceBookingModal';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { RemoteSupportRoom } from './components/RemoteSupportRoom';
import { CustomerOrders } from './components/CustomerOrders';
import { TechChatModal } from './components/TechChatModal';
import { BlueprintAiAssistant } from './components/BlueprintAiAssistant';
import { CookieBanner } from './components/PreferencesPanel';
import { SecurityPolicyModal } from './components/SecurityPolicyModal';
import { NotFoundView } from './components/NotFoundView';
import { TechnicianProfileModal } from './components/TechnicianProfileModal';
import { INITIAL_ORDERS, CITY_LOCATIONS, SERVICE_CATEGORIES } from './data/mockData';
import { formatCOP, convertUSDToCOP } from './utils/currencyUtils';
import { playSoundEffect } from './utils/soundEffects';

export function App() {
  const [activeTab, setActiveTab] = useState('request'); // 'request' | 'subscriptions' | 'aibot' | 'tracking' | 'remote' | 'orders' | '404'
  const [selectedCity] = useState(CITY_LOCATIONS[0]);
  const [currency, setCurrency] = useState('dual'); // 'cop' | 'usd' | 'dual'

  // Persistencia de órdenes del cliente en almacenamiento local
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('blueprint_orders_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error al recuperar órdenes guardadas:', e);
    }
    return INITIAL_ORDERS;
  });

  const [activeOrderTrack, setActiveOrderTrack] = useState(() => {
    return (orders && orders.length > 0) ? orders[0] : INITIAL_ORDERS[0];
  });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingServiceCategory, setBookingServiceCategory] = useState(null);
  const [preselectedPlan, setPreselectedPlan] = useState(null);
  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const [isFloatingAiOpen, setIsFloatingAiOpen] = useState(false);
  const [isTechProfilesOpen, setIsTechProfilesOpen] = useState(false);

  // Modales de cumplimiento legal y privacidad
  const [isCookieConfigOpen, setIsCookieConfigOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('blueprint_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (orders.length > 0) {
      const active = orders.find(o => o.status !== 'completado') || orders[0];
      setActiveOrderTrack(active);
    }
  }, [orders]);

  const handleCreateOrder = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    setActiveOrderTrack(newOrder);
    setActiveTab('tracking');
    playSoundEffect('order_created');
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    }));
  };

  const handleRateOrder = (orderId, ratingStars, feedback) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, rating: ratingStars, notes: `${o.notes} [Calificación: ${feedback}]` };
      }
      return o;
    }));
  };

  const handleOpenBookingWithCategory = (catId) => {
    setPreselectedPlan(null);
    setBookingServiceCategory(catId);
    setIsBookingModalOpen(true);
    if (isFloatingAiOpen) setIsFloatingAiOpen(false);
  };

  const formatDisplayPrice = (usdVal) => {
    const copFormatted = formatCOP(convertUSDToCOP(usdVal));
    if (currency === 'cop') return `${copFormatted} COP`;
    if (currency === 'usd') return `$${usdVal} USD`;
    return `${copFormatted} (~$${usdVal} USD)`;
  };

  const activeOrdersCount = orders.filter(o => o.status !== 'completado').length;

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 flex flex-col font-sans selection:bg-[#00f0ff] selection:text-[#060b18] relative">
      
      {/* Barra de Navegación */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBookingModal={() => {
          setBookingServiceCategory(null);
          setIsBookingModalOpen(true);
        }}
        activeOrdersCount={activeOrdersCount}
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenCookies={() => setIsCookieConfigOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onOpenTechProfiles={() => setIsTechProfilesOpen(true)}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* PESTAÑA 1: PORTADA DE SERVICIOS IT Y RESUMEN EJECUTIVO */}
        {activeTab === 'request' && (
          <div key="tab-request" className="space-y-12 tab-transition">
            
            {/* Encabezado Principal */}
            <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-[#0a152e] via-[#081329] to-[#060b18] border border-cyan-500/30 shadow-2xl shadow-blue-950/80 overflow-hidden">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-[#0070f3]/20 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-1/3 -mb-20 w-80 h-80 rounded-full bg-[#00f0ff]/15 blur-3xl pointer-events-none"></div>
              <div className="absolute inset-0 bg-blueprint-grid opacity-35 pointer-events-none"></div>
              
              <div className="relative z-10 max-w-3xl space-y-6">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-sm">
                  <Radio className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
                  <span>Plataforma Tecnológica B2B y B2C • 5 Nodos Especializados</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Soporte IT Corporativo, <span className="text-gradient-cyan">Reparación Móvil y Licenciamiento</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                  Continuidad operativa para empresas mediante <b>contratos de mantenimiento IT con SLA garantizado</b>, servicio técnico exprés para <b>smartphones y portátiles</b> con repuestos originales, y <b>licenciamiento oficial</b> de Microsoft y Kaspersky.
                </p>

                {/* Botones de Acción Principal */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingServiceCategory(null);
                      setIsBookingModalOpen(true);
                    }}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-[#0070f3] to-[#00f0ff] hover:opacity-95 text-white font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-3 transform active:scale-95 transition-all duration-200"
                  >
                    <Zap className="w-5 h-5 fill-white" />
                    <span>Solicitar Técnico Exprés</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('aibot')}
                    className="px-6 py-4 rounded-2xl bg-[#0a152e] hover:bg-[#0f2042] text-[#00f0ff] border border-cyan-500/40 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg"
                  >
                    <Bot className="w-5 h-5 text-[#00f0ff] animate-pulse" />
                    <span>Cotizador Inteligente con IA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('subscriptions')}
                    className="px-6 py-4 rounded-2xl bg-blue-950/50 hover:bg-blue-900/50 text-slate-200 border border-blue-500/25 font-bold text-sm flex items-center justify-center space-x-2 transition-all"
                  >
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span>Planes y Contratos IT</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Franja de Indicadores Operativos en Tiempo Real (Bogotá, D.C.) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0a152e]/90 p-5 rounded-3xl border border-blue-500/25 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tiempo Arribo Bogotá</span>
                  <span className="text-2xl font-black text-[#00f0ff] font-mono">&lt; 38 min</span>
                  <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">● 5 Nodos en Guardia GPS</span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-blue-950 border border-cyan-500/30 flex items-center justify-center text-[#00f0ff]">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
              </div>

              <div className="bg-[#0a152e]/90 p-5 rounded-3xl border border-blue-500/25 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cumplimiento SLA B2B</span>
                  <span className="text-2xl font-black text-white font-mono">99.94 %</span>
                  <span className="text-[11px] text-cyan-300 font-semibold block mt-0.5">Garantía por Contrato</span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-blue-950 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#0a152e]/90 p-5 rounded-3xl border border-blue-500/25 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Servicios Ejecutados</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">+1.320</span>
                  <span className="text-[11px] text-slate-300 font-semibold block mt-0.5">Calificación 4.95 ★</span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-blue-950 border border-cyan-500/30 flex items-center justify-center text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div
                onClick={() => setIsTechProfilesOpen(true)}
                className="bg-[#0a152e]/90 p-5 rounded-3xl border border-cyan-500/30 hover:border-[#00f0ff] shadow-xl flex items-center justify-between cursor-pointer transition-all group"
              >
                <div>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">Equipo QuintoNodo</span>
                  <span className="text-lg font-black text-white group-hover:text-[#00f0ff] transition-colors block">5 Especialistas</span>
                  <span className="text-[11px] text-[#00f0ff] font-bold flex items-center gap-1 mt-0.5">
                    Ver Perfiles y Portafolio <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-blue-950 border border-cyan-500/30 flex items-center justify-center text-[#00f0ff] group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Tarjetas de Categorías de Servicio */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Soluciones Tecnológicas Especializadas en {selectedCity.name}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Selecciona una categoría para agendar atención en sitio, diagnóstico de laboratorio o soporte remoto inmediato
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('subscriptions')}
                  className="text-xs font-bold text-[#00f0ff] flex items-center gap-1 hover:underline"
                >
                  <span>Explorar Planes Mensuales IT</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {SERVICE_CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      if (cat.id === 'soporte_remoto') setActiveTab('remote');
                      else handleOpenBookingWithCategory(cat.id);
                    }}
                    className="bg-[#0a152e] p-6 rounded-3xl border border-blue-500/20 hover:border-cyan-400/50 cursor-pointer transition-all duration-300 group hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-950 border border-cyan-500/30 flex items-center justify-center text-[#00f0ff] group-hover:scale-110 transition-transform shadow-md shadow-cyan-500/20">
                        {cat.id === 'mantenimiento_b2b' && <Building2 className="w-7 h-7" />}
                        {cat.id === 'reparacion_movil' && <Smartphone className="w-7 h-7" />}
                        {cat.id === 'licencias_software' && <ShieldCheck className="w-7 h-7" />}
                        {cat.id === 'soporte_remoto' && <Headphones className="w-7 h-7" />}
                      </div>

                      <div>
                        <h3 className="text-lg font-extrabold text-white group-hover:text-[#00f0ff] transition-colors leading-snug">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-cyan-300 font-bold mt-1">{cat.tagline}</p>
                        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{cat.description}</p>
                      </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-blue-500/15 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">
                        Desde <b className="text-white text-xs sm:text-sm font-black">{formatDisplayPrice(cat.basePrice)}</b>
                      </span>
                      <span className="text-xs font-bold text-[#00f0ff] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Solicitar <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Los 5 Pilares de Garantía QuintoNodo */}
            <div className="space-y-4 pt-2">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider">
                  Los 5 Nodos de Respaldo
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  ¿Por qué elegir a Blueprint by QuintoNodo?
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#0a152e] p-5 rounded-2xl space-y-2 border border-blue-500/20 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30 font-bold">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-white">Despacho Exprés (&lt; 60 min)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Asignación georreferenciada que moviliza al especialista más cercano a tu oficina o domicilio.</p>
                </div>

                <div className="bg-[#0a152e] p-5 rounded-2xl space-y-2 border border-blue-500/20 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30 font-bold">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-white">Repuestos de Grado Original</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Pantallas OLED y baterías certificadas con calibración True Tone y 6 meses de garantía escrita.</p>
                </div>

                <div className="bg-[#0a152e] p-5 rounded-2xl space-y-2 border border-blue-500/20 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30 font-bold">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-white">Acuerdos de Nivel de Servicio</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Compromiso contractual con tiempos de respuesta garantizados desde 20 minutos para empresas.</p>
                </div>

                <div className="bg-[#0a152e] p-5 rounded-2xl space-y-2 border border-blue-500/20 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30 font-bold">
                    4
                  </div>
                  <h4 className="text-sm font-bold text-white">Licenciamiento 100 % Oficial</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Suscripciones de Microsoft 365, Kaspersky y Windows Pro con facturación electrónica DIAN.</p>
                </div>

                <div className="bg-[#0a152e] p-5 rounded-2xl space-y-2 border border-blue-500/20 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30 font-bold">
                    5
                  </div>
                  <h4 className="text-sm font-bold text-white">Seguridad y Reserva 24/7</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Conexiones cifradas AES-256 y acuerdos de confidencialidad (NDA) para proteger tu información.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* PESTAÑA 2: MATRIZ DE CONTRATOS Y CALCULADORA DE FLOTAS */}
        {activeTab === 'subscriptions' && (
          <div key="tab-subscriptions" className="tab-transition">
            <SubscriptionPlans
              currency={currency}
              onSelectPlan={(plan, cycle) => {
                setPreselectedPlan({ plan, cycle });
                setBookingServiceCategory('mantenimiento_b2b');
                setIsBookingModalOpen(true);
              }}
              onOpenAiQuote={() => setActiveTab('aibot')}
            />
          </div>
        )}

        {/* PESTAÑA 3: ASISTENTE COTIZADOR INTELIGENTE IA */}
        {activeTab === 'aibot' && (
          <div key="tab-aibot" className="tab-transition">
            <BlueprintAiAssistant
              onScheduleService={(serviceId) => {
                if (serviceId === 'subscriptions') {
                  setActiveTab('subscriptions');
                } else {
                  handleOpenBookingWithCategory(serviceId);
                }
              }}
            />
          </div>
        )}

        {/* PESTAÑA 4: MAPA DE RASTREO GPS EN TIEMPO REAL */}
        {activeTab === 'tracking' && (
          <div key="tab-tracking" className="tab-transition">
            <LiveTrackingMap
              activeOrder={activeOrderTrack}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenChat={(order) => setActiveChatOrder(order)}
              onOpenBookingModal={() => {
                setBookingServiceCategory(null);
                setIsBookingModalOpen(true);
              }}
            />
          </div>
        )}

        {/* PESTAÑA 5: SALA DE SOPORTE REMOTO EN VIVO */}
        {activeTab === 'remote' && (
          <div key="tab-remote" className="tab-transition">
            <RemoteSupportRoom />
          </div>
        )}

        {/* PESTAÑA 6: HISTORIAL DE SOLICITUDES Y COMPROBANTES */}
        {activeTab === 'orders' && (
          <div key="tab-orders" className="tab-transition">
            <CustomerOrders
              orders={orders}
              currency={currency}
              onTrackOrder={(ord) => {
                setActiveOrderTrack(ord);
                setActiveTab('tracking');
              }}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onRateOrder={handleRateOrder}
            />
          </div>
        )}

        {/* PESTAÑA 404: RUTA NO ENCONTRADA */}
        {activeTab === '404' && (
          <div key="tab-404" className="tab-transition">
            <NotFoundView
              onBackHome={() => setActiveTab('request')}
              requestedPath="/recurso-no-disponible"
            />
          </div>
        )}

      </main>

      {/* Botón Flotante del Asistente Cotizador IA */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsFloatingAiOpen(!isFloatingAiOpen)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-[#00f0ff] text-[#060b18] flex items-center justify-center shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-transform group"
          title="Abrir asistente cotizador inteligente de Blueprint"
        >
          {isFloatingAiOpen ? (
            <X className="w-6 h-6 text-[#060b18] stroke-[3]" />
          ) : (
            <Bot className="w-7 h-7 text-[#060b18] animate-bounce stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Modal del Asistente IA Flotante */}
      {isFloatingAiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <BlueprintAiAssistant
            isOpenAsModal={true}
            onCloseModal={() => setIsFloatingAiOpen(false)}
            onScheduleService={(serviceId) => {
              setIsFloatingAiOpen(false);
              if (serviceId === 'subscriptions') {
                setActiveTab('subscriptions');
              } else {
                handleOpenBookingWithCategory(serviceId);
              }
            }}
          />
        </div>
      )}

      {/* Modal de Solicitud y Contratación de Servicio */}
      <ServiceBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setPreselectedPlan(null);
        }}
        onCreateOrder={handleCreateOrder}
        preselectedServiceCategory={bookingServiceCategory}
        preselectedPlan={preselectedPlan}
      />

      {/* Modal de Chat con el Especialista Asignado */}
      <TechChatModal
        isOpen={!!activeChatOrder}
        onClose={() => setActiveChatOrder(null)}
        order={activeChatOrder}
      />

      {/* Modal de Perfiles y Referencias Técnicas */}
      <TechnicianProfileModal
        isOpen={isTechProfilesOpen}
        onClose={() => setIsTechProfilesOpen(false)}
        onSelectTechForService={(tech) => {
          const defaultCat = tech?.serviceTypes?.[0] || 'mantenimiento_b2b';
          handleOpenBookingWithCategory(defaultCat);
        }}
      />

      {/* Banner y Configuración de Cookies */}
      <CookieBanner
        forceOpen={isCookieConfigOpen}
        onCloseForce={() => setIsCookieConfigOpen(false)}
      />

      {/* Modal de Políticas de Seguridad, Privacidad y SLA */}
      <SecurityPolicyModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Pie de Página Corporativo */}
      <footer className="bg-[#050a16] border-t border-blue-500/20 py-10 mt-20 text-center text-xs text-slate-400 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <img src="/blueprint-logo.svg" alt="Blueprint by QuintoNodo" className="h-8 object-contain" />
            <span className="font-semibold text-slate-300">
              © 2026 Blueprint by QuintoNodo Tech. Soporte IT Corporativo, Reparación Móvil y Licenciamiento Oficial en Bogotá, D.C.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 font-semibold">
            <button 
              type="button"
              onClick={() => setIsSecurityModalOpen(true)}
              className="hover:text-[#00f0ff] transition-colors cursor-pointer"
            >
              Políticas de Seguridad y NDA
            </button>
            <span>•</span>
            <button 
              type="button"
              onClick={() => setIsCookieConfigOpen(true)}
              className="hover:text-[#00f0ff] transition-colors cursor-pointer"
            >
              Política de Cookies
            </button>
            <span>•</span>
            <button 
              type="button"
              onClick={() => setActiveTab('subscriptions')}
              className="hover:text-[#00f0ff] transition-colors cursor-pointer"
            >
              Acuerdos de Nivel de Servicio (SLA 99.9 %)
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
