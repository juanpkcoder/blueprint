import React, { useState, useEffect } from 'react';
import { 
  Zap, Wrench, Smartphone, Headphones, MapPin, ShieldCheck, 
  Clock, Award, ChevronRight, Star, Sparkles, CheckCircle2, 
  ArrowRight, Users, Play, Radio, Bot, MessageSquare, X,
  Building2, Key, Lock, Cookie, AlertTriangle, FileText
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LiveTrackingMap } from './components/LiveDispatchMap';
import { ServiceBookingModal } from './components/ServiceBookingModal';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { RemoteSupportRoom } from './components/RemoteSupportRoom';
import { CustomerOrders } from './components/CustomerOrders';
import { AdminDispatcherPanel } from './components/AdminDispatcherPanel';
import { TechChatModal } from './components/TechChatModal';
import { BlueprintAiAssistant } from './components/BlueprintAiAssistant';
import { CookieBanner } from './components/PreferencesPanel';
import { SecurityPolicyModal } from './components/SecurityPolicyModal';
import { NotFoundView } from './components/NotFoundView';
import { TicketVoucherModal } from './components/TicketVoucherModal';
import { INITIAL_ORDERS, CITY_LOCATIONS, SERVICE_CATEGORIES } from './data/mockData';
import { playSoundEffect } from './utils/soundEffects';

export function App() {
  const [activeTab, setActiveTab] = useState('request'); // 'request' | 'subscriptions' | 'aibot' | 'tracking' | 'remote' | 'orders' | 'admin' | '404'
  const [selectedCity, setSelectedCity] = useState(CITY_LOCATIONS[0]);
  const [userRole, setUserRole] = useState('client'); // 'client' | 'admin'

  // Persist orders in localStorage with new Blueprint key
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('blueprint_orders_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Fallback to INITIAL_ORDERS:', e);
    }
    return INITIAL_ORDERS;
  });

  const [activeOrderTrack, setActiveOrderTrack] = useState(() => {
    return (orders && orders.length > 0) ? orders[0] : INITIAL_ORDERS[0];
  });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingServiceCategory, setBookingServiceCategory] = useState(null);
  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const [isFloatingAiOpen, setIsFloatingAiOpen] = useState(false);

  // Legal & Compliance Modals
  const [isCookieConfigOpen, setIsCookieConfigOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('blueprint_orders_v2', JSON.stringify(orders));
  }, [orders]);

  // Keep track order updated
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
        return { ...o, rating: ratingStars, notes: `${o.notes} [Feedback: ${feedback}]` };
      }
      return o;
    }));
  };

  const handleOpenBookingWithCategory = (catId) => {
    setBookingServiceCategory(catId);
    setIsBookingModalOpen(true);
    if (isFloatingAiOpen) setIsFloatingAiOpen(false);
  };

  const activeOrdersCount = orders.filter(o => o.status !== 'completado').length;

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 flex flex-col font-sans selection:bg-[#00f0ff] selection:text-[#060b18] relative">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBookingModal={() => {
          setBookingServiceCategory(null);
          setIsBookingModalOpen(true);
        }}
        activeOrdersCount={activeOrdersCount}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenCookies={() => setIsCookieConfigOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* TAB 1: EXPRESS SERVICES LANDING & OVERVIEW */}
        {activeTab === 'request' && (
          <div key="tab-request" className="space-y-12 tab-transition">
            
            {/* Hero Header with Deep Dark Blue Glassmorphism */}
            <div className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-[#0a152e] via-[#081329] to-[#060b18] border border-cyan-500/30 shadow-2xl shadow-blue-950/80 overflow-hidden">
              {/* Subtle glowing ambient lights */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-[#0070f3]/20 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-1/3 -mb-20 w-80 h-80 rounded-full bg-[#00f0ff]/15 blur-3xl pointer-events-none"></div>
              <div className="absolute inset-0 bg-blueprint-grid opacity-35 pointer-events-none"></div>
              
              <div className="relative z-10 max-w-3xl space-y-6">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider shadow-sm">
                  <Radio className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
                  <span>Plataforma IT Express B2B &amp; B2C • 5 Nodos de Soporte</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  Mantenimiento IT Express, <span className="text-gradient-cyan">Reparación Móvil &amp; Licencias</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                  Soporte corporativo bajo <b>contratos de suscripción por rangos</b> para empresas, reparación express de <b>celulares y computadores</b> con repuestos originales y licenciamiento oficial Microsoft &amp; Kaspersky.
                </p>

                {/* Main Hero CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                  <button
                    onClick={() => {
                      setBookingServiceCategory(null);
                      setIsBookingModalOpen(true);
                    }}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-[#0070f3] to-[#00f0ff] hover:opacity-95 text-white font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-3 transform active:scale-95 transition-all duration-200"
                  >
                    <Zap className="w-5 h-5 fill-white" />
                    <span>Pedir Técnico Express</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('aibot')}
                    className="px-6 py-4 rounded-2xl bg-[#0a152e] hover:bg-[#0f2042] text-[#00f0ff] border border-cyan-500/40 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg"
                  >
                    <Bot className="w-5 h-5 text-[#00f0ff] animate-pulse" />
                    <span>Cotizador Inteligente IA</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('subscriptions')}
                    className="px-6 py-4 rounded-2xl bg-blue-950/50 hover:bg-blue-900/50 text-slate-200 border border-blue-500/25 font-bold text-sm flex items-center justify-center space-x-2 transition-all"
                  >
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span>Contratos &amp; Suscripciones</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Service Category Cards (B2B + B2C + Licencias + Remoto) */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Servicios Tecnológicos Especializados en {selectedCity.name}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Selecciona un servicio para solicitar atención en sitio, cita express o asesoría remota
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className="text-xs font-bold text-[#00f0ff] flex items-center gap-1 hover:underline"
                >
                  <span>Ver Planes de Suscripción IT</span>
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
                        Desde <b className="text-white text-sm font-black">${cat.basePrice} USD</b>
                      </span>
                      <span className="text-xs font-bold text-[#00f0ff] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Solicitar <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The 5 Pillars of QuintoNodo (Why Blueprint) */}
            <div className="space-y-4 pt-2">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider">
                  Los 5 Nodos de Garantía
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  ¿Por qué confiar en Blueprint by QuintoNodo?
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#0a152e] p-5 rounded-2xl space-y-2 border border-blue-500/20 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30 font-bold">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-white">Despacho Express &lt; 60m</h4>
                  <p className="text-xs text-slate-400">Algoritmo GPS que asigna al especialista más cercano a tu ubicación.</p>
                </div>

                <div className="bg-[#0a152e] p-5 rounded-2xl space-y-2 border border-blue-500/20 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30 font-bold">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-white">Reparación Grado Original</h4>
                  <p className="text-xs text-slate-400">Pantallas OLED y baterías con TrueTone y garantía de 6 meses.</p>
                </div>

                <div className="bg-[#0a152e] p-5 rounded-2xl space-y-2 border border-blue-500/20 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30 font-bold">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-white">Contratos con SLA Firmado</h4>
                  <p className="text-xs text-slate-400">Compromiso por contrato con tiempos de respuesta de hasta 20 min.</p>
                </div>

                <div className="bg-[#0a152e] p-5 rounded-2xl space-y-2 border border-blue-500/20 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30 font-bold">
                    4
                  </div>
                  <h4 className="text-sm font-bold text-white">Licencias 100% Oficiales</h4>
                  <p className="text-xs text-slate-400">Microsoft 365, Kaspersky y Windows con factura legal y entrega inmediata.</p>
                </div>

                <div className="bg-[#0a152e] p-5 rounded-2xl space-y-2 border border-blue-500/20 shadow-xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30 font-bold">
                    5
                  </div>
                  <h4 className="text-sm font-bold text-white">Soporte Seguro 24/7</h4>
                  <p className="text-xs text-slate-400">Túnel SSL 256-bit y protocolo de confidencialidad NDA corporativo.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SUBSCRIPTION CONTRACTS MATRIX & FLEET CALCULATOR */}
        {activeTab === 'subscriptions' && (
          <div key="tab-subscriptions" className="tab-transition">
            <SubscriptionPlans
              onSelectPlan={(plan, cycle) => {
                setBookingServiceCategory('mantenimiento_b2b');
                setIsBookingModalOpen(true);
              }}
              onOpenAiQuote={() => setActiveTab('aibot')}
            />
          </div>
        )}

        {/* TAB 3: BLUEPRINT IA ASSISTANT (SMART QUOTER B2B & B2C) */}
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

        {/* TAB 4: LIVE TRACKING MAP */}
        {activeTab === 'tracking' && (
          <div key="tab-tracking" className="tab-transition">
            <LiveTrackingMap
              activeOrder={activeOrderTrack}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onOpenChat={(order) => setActiveChatOrder(order)}
            />
          </div>
        )}

        {/* TAB 5: REMOTE SUPPORT ROOM */}
        {activeTab === 'remote' && (
          <div key="tab-remote" className="tab-transition">
            <RemoteSupportRoom />
          </div>
        )}

        {/* TAB 6: CUSTOMER ORDERS & INVOICES */}
        {activeTab === 'orders' && (
          <div key="tab-orders" className="tab-transition">
            <CustomerOrders
              orders={orders}
              onTrackOrder={(ord) => {
                setActiveOrderTrack(ord);
                setActiveTab('tracking');
              }}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onRateOrder={handleRateOrder}
            />
          </div>
        )}

        {/* TAB 7: ADMIN / DISPATCHER PANEL */}
        {activeTab === 'admin' && (
          <div key="tab-admin" className="tab-transition">
            <AdminDispatcherPanel
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onAssignTechnician={(orderId, techId) => {
                playSoundEffect('tech_assigned');
              }}
            />
          </div>
        )}

        {/* TAB 8: 404 NOT FOUND DEMO / HANDLER */}
        {activeTab === '404' && (
          <div key="tab-404" className="tab-transition">
            <NotFoundView
              onBackHome={() => setActiveTab('request')}
              requestedPath="/api/v1/nodo-express-invalid"
            />
          </div>
        )}

      </main>

      {/* Floating AI Chatbot Quick Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsFloatingAiOpen(!isFloatingAiOpen)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-[#00f0ff] text-[#060b18] flex items-center justify-center shadow-2xl shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-transform group"
          title="Abrir Asistente Cotizador Blueprint IA"
        >
          {isFloatingAiOpen ? (
            <X className="w-6 h-6 text-[#060b18] stroke-[3]" />
          ) : (
            <Bot className="w-7 h-7 text-[#060b18] animate-bounce stroke-[2.5]" />
          )}
        </button>
      </div>

      {/* Floating AI Assistant Drawer / Modal */}
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

      {/* Booking Wizard Modal */}
      <ServiceBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onCreateOrder={handleCreateOrder}
        preselectedServiceCategory={bookingServiceCategory}
      />

      {/* Technician Chat Drawer Modal */}
      <TechChatModal
        isOpen={!!activeChatOrder}
        onClose={() => setActiveChatOrder(null)}
        order={activeChatOrder}
      />

      {/* Cookie Preferences Banner & Modal */}
      <CookieBanner
        forceOpen={isCookieConfigOpen}
        onCloseForce={() => setIsCookieConfigOpen(false)}
      />

      {/* Security & Privacy Policy Modal */}
      <SecurityPolicyModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-[#050a16] border-t border-blue-500/20 py-10 mt-20 text-center text-xs text-slate-400 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <img src="/blueprint-logo.svg" alt="Blueprint by QuintoNodo" className="h-8 object-contain" />
            <span className="font-semibold text-slate-300">
              © 2026 Blueprint by QuintoNodo Tech. Plataforma de Servicios IT Express, Reparación Móvil &amp; Contratos Corporativos.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 font-semibold">
            <button 
              onClick={() => setIsSecurityModalOpen(true)}
              className="hover:text-[#00f0ff] transition-colors cursor-pointer"
            >
              Políticas de Seguridad &amp; NDA
            </button>
            <span>•</span>
            <button 
              onClick={() => setIsCookieConfigOpen(true)}
              className="hover:text-[#00f0ff] transition-colors cursor-pointer"
            >
              Política de Cookies
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('subscriptions')}
              className="hover:text-[#00f0ff] transition-colors cursor-pointer"
            >
              SLA Corporativo 99.9%
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('404')}
              className="hover:text-red-400 transition-colors cursor-pointer text-slate-500"
              title="Prueba el redireccionamiento 404 automático"
            >
              Simular Error 404
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
