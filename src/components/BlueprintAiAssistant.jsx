import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, Smartphone, Building2, 
  X, RefreshCw, ArrowRight
} from 'lucide-react';
import { SUBSCRIPTION_TIERS, MOBILE_DEVICES_LIST } from '../data/mockData';
import { loadAiConfig, sendQueryToAI } from '../services/aiProviderService';
import { formatCOP, convertUSDToCOP } from '../utils/currencyUtils';
import { sanitizeText } from '../utils/securityUtils';
import { playSoundEffect } from '../utils/soundEffects';

export const BlueprintAiAssistant = ({ onScheduleService, isOpenAsModal, onCloseModal }) => {
  const [aiConfig] = useState(loadAiConfig);

  // Modo activo del asistente: 'chat' | 'b2b_quote' | 'b2c_quote'
  const [activeMode, setActiveMode] = useState('chat');

  // Estado del cotizador B2B
  const [b2bWorkstations, setB2bWorkstations] = useState(15);
  const [b2bHasServers, setB2bHasServers] = useState(true);
  const [b2bNeedLicenses, setB2bNeedLicenses] = useState(true);

  // Estado del cotizador B2C
  const [b2cBrand, setB2cBrand] = useState('Apple');
  const [b2cModel, setB2cModel] = useState('iPhone 15 / 15 Pro');
  const [b2cIssue, setB2cIssue] = useState('Pantalla OLED rota o sin imagen');

  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'bot',
      text: '¡Hola! Soy **Blueprint IA Assistant**, tu consultor técnico y cotizador inteligente de **Blueprint by QuintoNodo Tech**. 🤖⚡\n\n¿En qué requerimiento tecnológico puedo asesorarte hoy?\n• **🏢 Empresas (B2B)**: Contratos de soporte continuo con SLA garantizado, mantenimiento preventivo de flotas de cómputo y servidores.\n• **📱 Personas (B2C)**: Reparación exprés de celulares (pantallas OLED originales, baterías certificadas, puertos de carga) y optimización de portátiles.\n• **🛡️ Licenciamiento Oficial**: Kaspersky Endpoint Cloud, Bitdefender, Microsoft 365 y Windows 11 Pro con facturación electrónica DIAN.',
      time: 'Ahora',
      recommendationData: null
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, activeMode]);

  const generateAIResponse = async (userText) => {
    setIsThinking(true);
    playSoundEffect('notification');

    const textLower = userText.toLowerCase();

    // 1. Intentar consulta con proveedor IA si está activo
    try {
      const liveReply = await sendQueryToAI(userText, messages, aiConfig);
      if (liveReply) {
        setIsThinking(false);
        const botReply = {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: liveReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendationData: null
        };
        setMessages(prev => [...prev, botReply]);
        playSoundEffect('status_update');
        return;
      }
    } catch (err) {
      console.warn('Proveedor IA no disponible, ejecutando motor de cotización local:', err);
    }

    // 2. Motor de cotización local de alta precisión
    setTimeout(() => {
      setIsThinking(false);

      if (textLower.includes('celular') || textLower.includes('pantalla') || textLower.includes('iphone') || textLower.includes('samsung') || textLower.includes('xiaomi') || textLower.includes('bateria') || textLower.includes('batería')) {
        const reply = {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: `📱 **Cotización de Referencia para Reparación Móvil Exprés (B2C):**\n\n• **Pantalla OLED de Grado Original:** $65 - $125 USD (~${formatCOP(convertUSDToCOP(65))} a ${formatCOP(convertUSDToCOP(125))} COP). Incluye transferencia de calibración True Tone y sellado contra polvo.\n• **Batería Certificada (Capacidad al 100 %):** $35 - $50 USD (instalación en 30 minutos).\n• **Puerto de Carga USB-C / Lightning:** $28 - $38 USD.\n• **Garantía Escrita:** 6 meses sobre todos los repuestos instalados.\n\n🚀 *¿Deseas que un especialista de nuestro laboratorio móvil acuda a tu dirección en Bogotá o prefieres visitarnos en nuestra sede de Chapinero?*`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendationData: {
            type: 'mobile_quote',
            actionText: 'Agendar Reparación Móvil',
            serviceId: 'reparacion_movil'
          }
        };
        setMessages(prev => [...prev, reply]);
        playSoundEffect('status_update');
        return;
      }

      if (textLower.includes('empresa') || textLower.includes('contrato') || textLower.includes('suscripcion') || textLower.includes('suscripción') || textLower.includes('pyme') || textLower.includes('equipos') || textLower.includes('computador') || textLower.includes('b2b') || textLower.includes('servidor')) {
        const reply = {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: `🏢 **Planes y Contratos de Soporte IT para Empresas (B2B):**\n\n1. **Starter Pyme (de 1 a 10 equipos):** **$99 USD/mes** ($84 USD/mes con plan anual). Soporte remoto ilimitado 8x5 + 1 mantenimiento preventivo trimestral + antivirus corporativo en la nube (SLA < 2 h).\n2. **Business Pro (de 11 a 35 equipos + servidores):** **$249 USD/mes** ($210 USD/mes con plan anual). Soporte 12x6 + mantenimiento bimestral + 4 visitas de emergencia al mes + mantenimiento de servidores y 20 % de descuento en Microsoft 365 (SLA < 45 min).\n3. **Enterprise Titan (de 36 a 80+ equipos):** **$590 USD/mes** ($499 USD/mes con plan anual). Soporte 24/7/365 dedicado + visitas presenciales ilimitadas + protección EDR avanzada (SLA < 20 min).\n\n💡 *Puedes utilizar la calculadora B2B en la barra superior de este chat para obtener una propuesta ajustada al número exacto de estaciones de tu empresa.*`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendationData: {
            type: 'b2b_plans',
            actionText: 'Explorar Planes Corporativos',
            serviceId: 'subscriptions'
          }
        };
        setMessages(prev => [...prev, reply]);
        playSoundEffect('status_update');
        return;
      }

      if (textLower.includes('licencia') || textLower.includes('kaspersky') || textLower.includes('office') || textLower.includes('microsoft') || textLower.includes('windows') || textLower.includes('antivirus')) {
        const reply = {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: `🛡️ **Catálogo de Licenciamiento Oficial Blueprint by QuintoNodo:**\n\n• **Kaspersky Total Security (1 Año / 3 Dispositivos):** **$32 USD** (~${formatCOP(convertUSDToCOP(32))} COP).\n• **Kaspersky Endpoint Security Cloud (B2B por estación):** **$42 USD/año**.\n• **Microsoft 365 Business Standard:** **$145 USD/año** (Word, Excel, PowerPoint, Outlook, Teams y 1 TB en OneDrive).\n• **Microsoft 365 Familia (Hasta 6 usuarios):** **$85 USD/año**.\n• **Licencia Oficial Windows 11 Pro Permanente:** **$35 USD**.\n\n*Todas nuestras licencias incluyen factura electrónica legal de la DIAN y acompañamiento remoto para su activación.*`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendationData: {
            type: 'license_quote',
            actionText: 'Solicitar Licencias Oficiales',
            serviceId: 'licencias_software'
          }
        };
        setMessages(prev => [...prev, reply]);
        playSoundEffect('status_update');
        return;
      }

      const genericReply = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: `Con gusto te asesoro. En **Blueprint by QuintoNodo Tech** brindamos soluciones integrales de tecnología en Bogotá, D.C.:\n\n• **Mantenimiento Preventivo y Correctivo en Sitio:** Desde $45 USD por estación o mediante contratos mensuales con SLA garantizado.\n• **Reparación Exprés de Celulares y Portátiles:** Atención de 30 a 45 minutos con repuestos de grado original y 6 meses de garantía.\n• **Mesa de Ayuda Remota:** Asistencia cifrada en menos de 5 minutos.\n\n¿Deseas cotizar un plan corporativo para tu empresa o una intervención puntual para tu dispositivo?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendationData: null
      };
      setMessages(prev => [...prev, genericReply]);
      playSoundEffect('status_update');
    }, 700);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    const cleaned = sanitizeText(inputQuery, 400);
    if (!cleaned) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: cleaned,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    generateAIResponse(cleaned);
  };

  const handleQuickPrompt = (promptText) => {
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: promptText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    generateAIResponse(promptText);
  };

  const calculateB2BQuote = () => {
    let suggestedTier = SUBSCRIPTION_TIERS[0];
    if (b2bWorkstations > 35) {
      suggestedTier = SUBSCRIPTION_TIERS[2];
    } else if (b2bWorkstations > 10 || b2bHasServers) {
      suggestedTier = SUBSCRIPTION_TIERS[1];
    }

    const licenseCost = b2bNeedLicenses ? b2bWorkstations * 8 : 0;
    const monthlyTotal = suggestedTier.priceMonthly + licenseCost;
    const annualMonthly = suggestedTier.priceAnnual + Math.round(licenseCost * 0.85);

    const quoteMsg = {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: `📊 **Propuesta Ejecutiva de Soporte IT (B2B):**\n\n• **Estaciones de Cómputo:** ${b2bWorkstations} equipos\n• **Infraestructura de Servidores:** ${b2bHasServers ? 'Sí, incluye mantenimiento térmico de servidores y gabinetes' : 'Solo estaciones de trabajo'}\n• **Licenciamiento en la Nube:** ${b2bNeedLicenses ? 'Incluido (Kaspersky Endpoint Cloud + gestión Microsoft 365)' : 'No requerido'}\n\n🏆 **Plan Recomendado:** **${suggestedTier.name}**\n• **Modalidad Mensual:** **$${monthlyTotal} USD/mes** (~${formatCOP(convertUSDToCOP(monthlyTotal))} COP/mes)\n• **Modalidad Anual (-15 % de ahorro):** **$${annualMonthly} USD/mes** (~${formatCOP(convertUSDToCOP(annualMonthly))} COP/mes)\n• **SLA Soporte Remoto:** ${suggestedTier.slaRemote} | **SLA en Sitio:** ${suggestedTier.slaOnsite}\n\n*Incluye ${suggestedTier.features[1].toLowerCase()} y ${suggestedTier.features[2].toLowerCase()}.*`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendationData: {
        type: 'b2b_plans',
        actionText: `Solicitar ${suggestedTier.name}`,
        serviceId: 'subscriptions'
      }
    };

    setMessages(prev => [...prev, quoteMsg]);
    setActiveMode('chat');
    playSoundEffect('success');
  };

  const calculateB2CQuote = () => {
    let estPrice = '$45 - $85 USD';
    let estTime = '35 a 45 minutos';

    if (b2cIssue.toLowerCase().includes('oled') || b2cIssue.toLowerCase().includes('pantalla')) {
      estPrice = b2cBrand === 'Apple' ? '$85 - $130 USD' : '$65 - $110 USD';
      estTime = '40 minutos';
    } else if (b2cIssue.toLowerCase().includes('batería') || b2cIssue.toLowerCase().includes('bateria')) {
      estPrice = '$35 - $50 USD';
      estTime = '30 minutos';
    } else if (b2cIssue.toLowerCase().includes('puerto')) {
      estPrice = '$28 - $38 USD';
      estTime = '35 minutos';
    }

    const quoteMsg = {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: `📱 **Presupuesto Estimado de Reparación Exprés (B2C):**\n\n• **Dispositivo:** ${b2cBrand} — ${b2cModel}\n• **Diagnóstico Preliminar:** ${b2cIssue}\n• **Inversión Estimada:** **${estPrice}** (incluye mano de obra especializada y repuesto de grado original)\n• **Tiempo Estimado de Intervención:** **${estTime}**\n• **Garantía Oficial Blueprint:** 6 meses por escrito.\n\n¿Deseas programar un especialista a domicilio o agendar tu visita en nuestro laboratorio central?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendationData: {
        type: 'mobile_quote',
        actionText: 'Agendar Reparación Ahora',
        serviceId: 'reparacion_movil'
      }
    };

    setMessages(prev => [...prev, quoteMsg]);
    setActiveMode('chat');
    playSoundEffect('success');
  };

  return (
    <div className={`flex flex-col bg-[#0a152e] border border-blue-500/25 rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/60 ${isOpenAsModal ? 'max-w-4xl w-full h-[88vh]' : 'h-[750px] w-full'}`}>
      
      {/* Encabezado Superior */}
      <div className="bg-[#060b18]/90 border-b border-blue-500/20 px-6 py-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0070f3] to-[#00f0ff] p-[2px] shadow-lg shadow-cyan-500/30">
              <div className="w-full h-full bg-[#060b18] rounded-[14px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-[#00f0ff] animate-pulse" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060b18] shadow-sm"></span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                Blueprint IA Assistant
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 text-[#00f0ff] border border-cyan-500/30">
                QuintoNodo 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span>Cotizador Inteligente B2B y B2C</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">En Línea</span>
            </p>
          </div>
        </div>

        {/* Selectores Rápidos de Calculadora */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveMode(activeMode === 'b2b_quote' ? 'chat' : 'b2b_quote')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'b2b_quote' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400' 
                : 'bg-blue-950/60 text-blue-200 hover:bg-blue-900/60 border border-blue-500/20'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Cotizar Plan B2B</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode(activeMode === 'b2c_quote' ? 'chat' : 'b2c_quote')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'b2c_quote' 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400' 
                : 'bg-cyan-950/60 text-cyan-200 hover:bg-cyan-900/60 border border-cyan-500/20'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Cotizar Reparación (B2C)</span>
          </button>

          {isOpenAsModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Panel de Calculadora B2B */}
      {activeMode === 'b2b_quote' && (
        <div className="bg-[#081533] border-b border-blue-500/30 p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00f0ff]" />
              <h4 className="font-extrabold text-white text-sm">Calculadora Ejecutiva de Contratos B2B</h4>
            </div>
            <button
              type="button"
              onClick={() => setActiveMode('chat')}
              className="text-slate-400 hover:text-white text-xs"
            >
              Cerrar Calculadora
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0a1b3d] p-3 rounded-2xl border border-blue-500/20">
              <label className="text-xs text-slate-300 font-bold block mb-1">
                Estaciones de Cómputo: <span className="text-[#00f0ff] font-extrabold">{b2bWorkstations}</span>
              </label>
              <input
                type="range"
                min="3"
                max="80"
                value={b2bWorkstations}
                onChange={(e) => setB2bWorkstations(parseInt(e.target.value, 10))}
                className="w-full accent-[#00f0ff] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>3 (Pyme)</span>
                <span>35 (Mediana)</span>
                <span>80+ (Corporativo)</span>
              </div>
            </div>

            <div className="bg-[#0a1b3d] p-3 rounded-2xl border border-blue-500/20 flex flex-col justify-center">
              <label className="text-xs text-slate-300 font-bold block mb-2">Infraestructura Crítica</label>
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={b2bHasServers}
                  onChange={(e) => setB2bHasServers(e.target.checked)}
                  className="rounded border-blue-400 text-[#0070f3] focus:ring-0 w-4 h-4"
                />
                <span>Incluye Servidores y Gabinetes</span>
              </label>
            </div>

            <div className="bg-[#0a1b3d] p-3 rounded-2xl border border-blue-500/20 flex flex-col justify-center">
              <label className="text-xs text-slate-300 font-bold block mb-2">Licenciamiento Corporativo</label>
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={b2bNeedLicenses}
                  onChange={(e) => setB2bNeedLicenses(e.target.checked)}
                  className="rounded border-blue-400 text-[#0070f3] focus:ring-0 w-4 h-4"
                />
                <span>Antivirus en la Nube + Microsoft 365</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={calculateB2BQuote}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generar Propuesta y Plan Recomendado</span>
            </button>
          </div>
        </div>
      )}

      {/* Panel de Calculadora B2C */}
      {activeMode === 'b2c_quote' && (
        <div className="bg-[#081533] border-b border-cyan-500/30 p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#00f0ff]" />
              <h4 className="font-extrabold text-white text-sm">Cotizador Exprés de Reparación Móvil y Portátiles</h4>
            </div>
            <button
              type="button"
              onClick={() => setActiveMode('chat')}
              className="text-slate-400 hover:text-white text-xs"
            >
              Cerrar Calculadora
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">Marca del Dispositivo</label>
              <select
                value={b2cBrand}
                onChange={(e) => {
                  setB2cBrand(e.target.value);
                  const found = MOBILE_DEVICES_LIST.find(d => d.brand === e.target.value);
                  if (found && found.models.length > 0) setB2cModel(found.models[0]);
                }}
                className="w-full bg-[#0a1b3d] border border-blue-500/30 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none"
              >
                {MOBILE_DEVICES_LIST.map(d => (
                  <option key={d.brand} value={d.brand}>{d.brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">Modelo de Referencia</label>
              <select
                value={b2cModel}
                onChange={(e) => setB2cModel(e.target.value)}
                className="w-full bg-[#0a1b3d] border border-blue-500/30 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none"
              >
                {(MOBILE_DEVICES_LIST.find(d => d.brand === b2cBrand)?.models || []).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-bold block mb-1">Síntoma o Falla Principal</label>
              <select
                value={b2cIssue}
                onChange={(e) => setB2cIssue(e.target.value)}
                className="w-full bg-[#0a1b3d] border border-blue-500/30 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none"
              >
                <option value="Pantalla OLED rota o sin imagen">Pantalla rota o sin imagen</option>
                <option value="Batería degradada (capacidad < 80 %)">Batería se descarga rápidamente</option>
                <option value="Puerto de carga o micrófono">Falla en el puerto de carga</option>
                <option value="Recuperación por contacto con líquidos">Contacto accidental con líquidos</option>
                <option value="Módulo de cámara o lente roto">Cámara desenfocada o lente roto</option>
                <option value="Optimización de sistema y limpieza">Lentitud general o mantenimiento</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={calculateB2CQuote}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Calcular Presupuesto Exprés</span>
            </button>
          </div>
        </div>
      )}

      {/* Área Principal de Conversación */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-blueprint-grid">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            <div
              className={`max-w-[85%] rounded-3xl p-4 sm:p-5 text-sm leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-[#0070f3] text-white rounded-br-none shadow-blue-900/30 font-medium'
                  : 'bg-[#0f2042]/90 border border-blue-500/20 text-slate-200 rounded-bl-none shadow-black/40'
              }`}
            >
              <div className="whitespace-pre-line">
                {msg.text}
              </div>

              {msg.recommendationData && (
                <div className="mt-4 pt-3 border-t border-blue-500/20 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onScheduleService) onScheduleService(msg.recommendationData.serviceId);
                      if (isOpenAsModal && onCloseModal) onCloseModal();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#00f0ff] hover:bg-cyan-300 text-[#060b18] font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-transform active:scale-95"
                  >
                    <span>{msg.recommendationData.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <span className="text-[10px] text-slate-500 px-2 font-mono">
              {msg.time}
            </span>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center space-x-2 text-xs text-cyan-400 bg-[#0f2042]/80 border border-blue-500/20 px-4 py-3 rounded-2xl w-fit animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00f0ff]" />
            <span>Blueprint IA está elaborando tu cotización técnica...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Consultas Frecuentes Sugeridas */}
      <div className="bg-[#071329] px-6 py-2.5 border-t border-blue-500/15 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-400 font-semibold shrink-0">Consultas rápidas:</span>
        <button
          type="button"
          onClick={() => handleQuickPrompt('¿Cuánto cuesta reemplazar la pantalla OLED de un iPhone 15 Pro?')}
          className="px-3 py-1 rounded-full bg-blue-950/70 hover:bg-blue-900 text-blue-200 border border-blue-500/20 shrink-0 transition-colors"
        >
          📱 Pantalla OLED iPhone
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt('¿Cuáles son los planes de soporte mensual para una empresa de 20 computadores?')}
          className="px-3 py-1 rounded-full bg-blue-950/70 hover:bg-blue-900 text-blue-200 border border-blue-500/20 shrink-0 transition-colors"
        >
          🏢 Contrato Pyme (20 Equipos)
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt('Deseo cotizar 10 licencias corporativas de Kaspersky y Microsoft 365')}
          className="px-3 py-1 rounded-full bg-blue-950/70 hover:bg-blue-900 text-blue-200 border border-blue-500/20 shrink-0 transition-colors"
        >
          🛡️ Licencias Kaspersky y Microsoft 365
        </button>
      </div>

      {/* Campo de Entrada de Mensajes */}
      <form onSubmit={handleSendMessage} className="p-4 bg-[#060b18] border-t border-blue-500/20 flex items-center space-x-3">
        <input
          type="text"
          maxLength={400}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Escribe tu requerimiento o solicita una cotización (B2B, reparación móvil o licencias)..."
          className="flex-1 bg-[#0a152e] border border-blue-500/25 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isThinking}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-[#00f0ff] text-white hover:opacity-90 disabled:opacity-40 font-bold text-sm flex items-center space-x-2 shadow-lg shadow-blue-500/30 transition-all shrink-0 active:scale-95"
        >
          <span>Enviar</span>
          <Send className="w-4 h-4 text-[#060b18]" />
        </button>
      </form>

    </div>
  );
};
