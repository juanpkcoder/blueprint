import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, Sliders, DollarSign, Smartphone, 
  Building2, Plus, Check, Zap, X, ChevronRight, RefreshCw, 
  CheckCircle2, AlertCircle, HelpCircle, Layers, ArrowRight,
  Settings, Key, Cpu, Eye, EyeOff, ShieldCheck, Laptop, PhoneCall
} from 'lucide-react';
import { SUBSCRIPTION_TIERS, SERVICE_CATEGORIES, MOBILE_DEVICES_LIST } from '../data/mockData';
import { loadAiConfig, saveAiConfig, sendQueryToAI } from '../services/aiProviderService';
import { playSoundEffect } from '../utils/soundEffects';

export const BlueprintAiAssistant = ({ onScheduleService, isOpenAsModal, onCloseModal }) => {
  const [aiConfig, setAiConfig] = useState(loadAiConfig);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testConnectionStatus, setTestConnectionStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [testErrorMessage, setTestErrorMessage] = useState('');

  // Mode for the Quick Quote Wizard inside AI: 'chat' | 'b2b_quote' | 'b2c_quote'
  const [activeMode, setActiveMode] = useState('chat');

  // B2B Quote State
  const [b2bWorkstations, setB2bWorkstations] = useState(15);
  const [b2bHasServers, setB2bHasServers] = useState(true);
  const [b2bNeedLicenses, setB2bNeedLicenses] = useState(true);
  const [b2bUrgency, setB2bUrgency] = useState('standard');

  // B2C Quote State
  const [b2cDeviceType, setB2cDeviceType] = useState('smartphone'); // 'smartphone' | 'laptop'
  const [b2cBrand, setB2cBrand] = useState('Apple');
  const [b2cModel, setB2cModel] = useState('iPhone 15 / 15 Pro');
  const [b2cIssue, setB2cIssue] = useState('Pantalla OLED Rota / Sin Imagen');

  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'bot',
      text: '¡Hola! Soy **Blueprint IA Assistant**, tu asesor técnico y cotizador automatizado de **Blueprint by QuintoNodo Tech**. 🤖⚡\n\n¿Qué deseas cotizar hoy?\n• **🏢 Empresas (B2B)**: Contratos de soporte continuo por rangos, mantenimiento de flotas de cómputo y licenciamiento por volumen.\n• **📱 Personas (B2C)**: Reparación express de celulares (pantallas OLED, baterías, puertos de carga) y mantenimiento de laptops/PCs.\n• **🛡️ Licencias Oficiales**: Kaspersky Total Security, Bitdefender, Microsoft 365 y Windows 11 Pro.',
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

  // Recommendation engine: Live AI API (Gemini / Ollama) or Smart Simulation Fallback
  const generateAIResponse = async (userText) => {
    setIsThinking(true);
    playSoundEffect('notification');

    const textLower = userText.toLowerCase();

    // 1. Attempt live API call if configured
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
      console.warn('API Call Error, falling back to smart simulation:', err);
    }

    // 2. Local Simulation Quoting Logic
    setTimeout(() => {
      setIsThinking(false);

      // A. Cellphone / Mobile repair query
      if (textLower.includes('celular') || textLower.includes('pantalla') || textLower.includes('iphone') || textLower.includes('samsung') || textLower.includes('xiaomi') || textLower.includes('bateria') || textLower.includes('batería')) {
        const reply = {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: `📱 **Cotización Estimada de Reparación Móvil Express (B2C):**\n\n• **Pantalla OLED Grado Original:** $65 - $125 USD (incluye programación TrueTone y sellado contra polvo).\n• **Batería Certificada (Salud 100%):** $35 - $50 USD (reemplazo en 30 minutos).\n• **Puerto de Carga Type-C / Lightning:** $28 - $38 USD.\n• **Garantía Escrita:** 6 Meses en todas las refacciones.\n\n🚀 *¿Deseas que un técnico de nuestro móvil acuda a tu ubicación o prefieres traerlo al laboratorio central?*`,
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

      // B. B2B / Empresa / Contrato query
      if (textLower.includes('empresa') || textLower.includes('contrato') || textLower.includes('suscripcion') || textLower.includes('suscripción') || textLower.includes('pyme') || textLower.includes('equipos') || textLower.includes('b2b') || textLower.includes('servidor')) {
        const reply = {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: `🏢 **Planes y Contratos IT por Rangos para Empresas (B2B):**\n\n1. **Starter Pyme (1 a 10 equipos)**: **$99 USD/mes** ($84/mes anual). Soporte remoto 8x5 + 1 preventivo trimestral + Antivirus gestionado (SLA < 2h).\n2. **Business Pro (11 a 35 equipos + servidores)**: **$249 USD/mes** ($210/mes anual). Soporte 12x6 + 4 visitas en sitio/mes + mantenimiento de servidores + 20% dto. en Office 365 (SLA < 45m).\n3. **Enterprise Titan (36 a 80+ equipos)**: **$590 USD/mes** ($499/mes anual). Soporte 24/7/365 dedicado + Visitas ilimitadas + Ciberseguridad EDR (SLA < 20m).\n\n💡 *Puedes usar el botón rápido abajo para calcular la tarifa exacta según tus puestos de trabajo.*`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendationData: {
            type: 'b2b_plans',
            actionText: 'Ver Matriz de Contratos',
            serviceId: 'subscriptions'
          }
        };
        setMessages(prev => [...prev, reply]);
        playSoundEffect('status_update');
        return;
      }

      // C. Licencias query
      if (textLower.includes('licencia') || textLower.includes('kaspersky') || textLower.includes('office') || textLower.includes('microsoft') || textLower.includes('windows') || textLower.includes('antivirus')) {
        const reply = {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: `🛡️ **Lista Oficial de Licenciamiento Blueprint by QuintoNodo:**\n\n• **Kaspersky Total Security (1 Año / 3 Dispositivos)**: **$32 USD** (Antivirus + Firewall + Protección Bancaria).\n• **Kaspersky Endpoint Security Cloud (B2B por puesto)**: **$42 USD/año**.\n• **Microsoft 365 Business Standard**: **$145 USD/año** (Word, Excel, PowerPoint, Teams y 1TB OneDrive).\n• **Microsoft 365 Familia (Hasta 6 usuarios)**: **$85 USD/año**.\n• **Windows 11 Pro Key Oficial**: **$35 USD** (Activación digital permanente).\n\n*Todas las licencias cuentan con factura legal y soporte de activación remota asistida.*`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendationData: {
            type: 'license_quote',
            actionText: 'Comprar Licencias',
            serviceId: 'licencias_software'
          }
        };
        setMessages(prev => [...prev, reply]);
        playSoundEffect('status_update');
        return;
      }

      // D. Fallback generic technical response
      const genericReply = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: `Entendido. En **Blueprint by QuintoNodo Tech** resolvemos requerimientos de infraestructura IT y soporte express:\n\n• **Mantenimiento Preventivo y Correctivo en Sitio**: $45 USD por puesto o paquetes con SLA.\n• **Reparación de Celulares y Tablets**: En 35 minutos con repuestos originales.\n• **Soporte Remoto Inmediato**: Conexión segura SSL en menos de 5 minutos.\n\n¿Prefieres que te cotice un paquete para tu empresa o una reparación individual para tu equipo?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendationData: null
      };
      setMessages(prev => [...prev, genericReply]);
      playSoundEffect('status_update');
    }, 700);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputQuery.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: inputQuery.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const query = inputQuery;
    setInputQuery('');
    generateAIResponse(query);
  };

  // Quick Action Buttons
  const handleQuickPrompt = (promptText) => {
    setInputQuery(promptText);
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: promptText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    generateAIResponse(promptText);
  };

  // Calculate Instant B2B Quote
  const calculateB2BQuote = () => {
    let suggestedTier = SUBSCRIPTION_TIERS[0];
    if (b2bWorkstations > 35) {
      suggestedTier = SUBSCRIPTION_TIERS[2]; // Enterprise
    } else if (b2bWorkstations > 10 || b2bHasServers) {
      suggestedTier = SUBSCRIPTION_TIERS[1]; // Business Pro
    }

    const licenseCost = b2bNeedLicenses ? b2bWorkstations * 8 : 0;
    const monthlyTotal = suggestedTier.priceMonthly + licenseCost;
    const annualMonthly = suggestedTier.priceAnnual + Math.round(licenseCost * 0.85);

    const quoteMsg = {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: `📊 **Propuesta de Cotización B2B Personalizada:**\n\n• **Puestos de Trabajo:** ${b2bWorkstations} equipos\n• **Servidores/Infraestructura:** ${b2bHasServers ? 'Sí, incluye mantenimiento térmico' : 'Solo puestos'}\n• **Licenciamiento Cloud:** ${b2bNeedLicenses ? 'Incluido (Kaspersky Cloud + Office 365)' : 'No requerido'}\n\n🏆 **Plan Sugerido:** **${suggestedTier.name}**\n• **Inversión Mensual (Mes a Mes):** **$${monthlyTotal} USD/mes**\n• **Inversión Anual (Ahorro del 15%):** **$${annualMonthly} USD/mes** ($${annualMonthly * 12} USD/año)\n• **SLA Remoto:** ${suggestedTier.slaRemote} | **SLA en Sitio:** ${suggestedTier.slaOnsite}\n\n*Incluye ${suggestedTier.features[1]} y ${suggestedTier.features[2]}.*`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendationData: {
        type: 'b2b_plans',
        actionText: `Contratar ${suggestedTier.name}`,
        serviceId: 'subscriptions'
      }
    };

    setMessages(prev => [...prev, quoteMsg]);
    setActiveMode('chat');
    playSoundEffect('success');
  };

  // Calculate Instant B2C Quote
  const calculateB2CQuote = () => {
    let estPrice = '$45 - $85 USD';
    let estTime = '35 - 45 min';

    if (b2cIssue.toLowerCase().includes('oled') || b2cIssue.toLowerCase().includes('pantalla')) {
      estPrice = b2cBrand === 'Apple' ? '$85 - $130 USD' : '$65 - $110 USD';
      estTime = '40 min';
    } else if (b2cIssue.toLowerCase().includes('batería') || b2cIssue.toLowerCase().includes('bateria')) {
      estPrice = '$35 - $50 USD';
      estTime = '30 min';
    } else if (b2cIssue.toLowerCase().includes('puerto')) {
      estPrice = '$28 - $38 USD';
      estTime = '35 min';
    }

    const quoteMsg = {
      id: `msg-${Date.now()}`,
      sender: 'bot',
      text: `📱 **Presupuesto Estimado de Reparación Express (B2C):**\n\n• **Dispositivo:** ${b2cBrand} - ${b2cModel}\n• **Diagnóstico:** ${b2cIssue}\n• **Costo Estimado:** **${estPrice}** (Mano de obra + Refacción Grado Original)\n• **Tiempo Récord de Reparación:** **${estTime}**\n• **Garantía Blueprint:** 6 Meses por escrito.\n\n¿Deseas que un técnico acuda a tu domicilio en el Móvil Express o prefieres llevarlo a la estación de servicio?`,
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
      
      {/* Top Header */}
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
              <span>Cotizador Inteligente B2B & B2C</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">En Línea</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Quick Cotizador Selectors */}
          <button
            onClick={() => setActiveMode(activeMode === 'b2b_quote' ? 'chat' : 'b2b_quote')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'b2b_quote' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400' 
                : 'bg-blue-950/60 text-blue-200 hover:bg-blue-900/60 border border-blue-500/20'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Cotizar B2B</span>
          </button>

          <button
            onClick={() => setActiveMode(activeMode === 'b2c_quote' ? 'chat' : 'b2c_quote')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'b2c_quote' 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400' 
                : 'bg-cyan-950/60 text-cyan-200 hover:bg-cyan-900/60 border border-cyan-500/20'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Cotizar Celular (B2C)</span>
          </button>

          {/* AI Settings Config */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60 transition-colors"
            title="Configurar Motor IA (Gemini / Ollama)"
          >
            <Settings className="w-4 h-4" />
          </button>

          {isOpenAsModal && (
            <button
              onClick={onCloseModal}
              className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Drawer (if open) */}
      {isSettingsOpen && (
        <div className="bg-[#071329] border-b border-blue-500/20 p-4 space-y-3 animate-in fade-in duration-200 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00f0ff]" />
              Configuración de Motor de Inteligencia Artificial
            </h4>
            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Proveedor IA</label>
              <select
                value={aiConfig.provider}
                onChange={(e) => {
                  const updated = { ...aiConfig, provider: e.target.value };
                  setAiConfig(updated);
                  saveAiConfig(updated);
                }}
                className="w-full bg-[#0a152e] border border-blue-500/30 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-[#00f0ff]"
              >
                <option value="simulation">Simulador Inteligente QuintoNodo (Sin API Key)</option>
                <option value="gemini">Google Gemini AI (API Key Directa)</option>
                <option value="ollama">Ollama / Servidor Local OpenSource</option>
              </select>
            </div>

            {aiConfig.provider === 'gemini' && (
              <div className="md:col-span-2">
                <label className="text-slate-400 font-medium block mb-1">Google Gemini API Key</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={aiConfig.geminiApiKey}
                      onChange={(e) => {
                        const updated = { ...aiConfig, geminiApiKey: e.target.value };
                        setAiConfig(updated);
                        saveAiConfig(updated);
                      }}
                      placeholder="AIzaSy..."
                      className="w-full bg-[#0a152e] border border-blue-500/30 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00f0ff]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK B2B QUOTER WIZARD DRAWER */}
      {activeMode === 'b2b_quote' && (
        <div className="bg-[#081533] border-b border-blue-500/30 p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00f0ff]" />
              <h4 className="font-extrabold text-white text-sm">Calculadora Express de Contratos B2B</h4>
            </div>
            <button onClick={() => setActiveMode('chat')} className="text-slate-400 hover:text-white text-xs">
              Cerrar Asistente
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0a1b3d] p-3 rounded-2xl border border-blue-500/20">
              <label className="text-xs text-slate-300 font-bold block mb-1">
                Puestos de Cómputo: <span className="text-[#00f0ff] font-extrabold">{b2bWorkstations}</span>
              </label>
              <input
                type="range"
                min="3"
                max="80"
                value={b2bWorkstations}
                onChange={(e) => setB2bWorkstations(parseInt(e.target.value))}
                className="w-full accent-[#00f0ff] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>3 Pymes</span>
                <span>35 Mediana</span>
                <span>80+ Corp</span>
              </div>
            </div>

            <div className="bg-[#0a1b3d] p-3 rounded-2xl border border-blue-500/20 flex flex-col justify-center">
              <label className="text-xs text-slate-300 font-bold block mb-2">Infraestructura</label>
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={b2bHasServers}
                  onChange={(e) => setB2bHasServers(e.target.checked)}
                  className="rounded border-blue-400 text-[#0070f3] focus:ring-0 w-4 h-4"
                />
                <span>Incluye Servidores & Racks</span>
              </label>
            </div>

            <div className="bg-[#0a1b3d] p-3 rounded-2xl border border-blue-500/20 flex flex-col justify-center">
              <label className="text-xs text-slate-300 font-bold block mb-2">Software Oficial</label>
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={b2bNeedLicenses}
                  onChange={(e) => setB2bNeedLicenses(e.target.checked)}
                  className="rounded border-blue-400 text-[#0070f3] focus:ring-0 w-4 h-4"
                />
                <span>Antivirus Cloud + Office 365</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={calculateB2BQuote}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generar Cotización y Plan Recomendado</span>
            </button>
          </div>
        </div>
      )}

      {/* QUICK B2C QUOTER WIZARD DRAWER */}
      {activeMode === 'b2c_quote' && (
        <div className="bg-[#081533] border-b border-cyan-500/30 p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#00f0ff]" />
              <h4 className="font-extrabold text-white text-sm">Cotizador Express de Reparación de Celulares & Laptops</h4>
            </div>
            <button onClick={() => setActiveMode('chat')} className="text-slate-400 hover:text-white text-xs">
              Cerrar Asistente
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
              <label className="text-xs text-slate-300 font-bold block mb-1">Modelo Específico</label>
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
              <label className="text-xs text-slate-300 font-bold block mb-1">Tipo de Falla / Diagnóstico</label>
              <select
                value={b2cIssue}
                onChange={(e) => setB2cIssue(e.target.value)}
                className="w-full bg-[#0a1b3d] border border-blue-500/30 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none"
              >
                <option value="Pantalla OLED Rota / Sin Imagen">Pantalla Rota / Vidrio Quebrado</option>
                <option value="Batería Degradada (< 80%)">Batería se descarga rápido</option>
                <option value="Puerto de Carga / Micrófono">No carga / Conector flojo</option>
                <option value="Daño por Agua / Líquidos">Se cayó al agua / No enciende</option>
                <option value="Cámara o Sensor Dañado">Cámara borrosa / Cristal roto</option>
                <option value="Lentitud / Virus / Formateo">Lentitud / Formateo o Software</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={calculateB2CQuote}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Calcular Presupuesto Express</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Messages Scroll Area */}
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

              {/* Recommendation Action Button if attached */}
              {msg.recommendationData && (
                <div className="mt-4 pt-3 border-t border-blue-500/20 flex flex-wrap gap-2">
                  <button
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
            <span>Blueprint IA está calculando cotización y rangos de soporte...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Question Badges */}
      <div className="bg-[#071329] px-6 py-2.5 border-t border-blue-500/15 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-400 font-semibold shrink-0">Sugerencias:</span>
        <button
          onClick={() => handleQuickPrompt('¿Cuánto cuesta cambiar la pantalla OLED de un iPhone 15 Pro?')}
          className="px-3 py-1 rounded-full bg-blue-950/70 hover:bg-blue-900 text-blue-200 border border-blue-500/20 shrink-0 transition-colors"
        >
          📱 Reparación Pantalla iPhone
        </button>
        <button
          onClick={() => handleQuickPrompt('¿Cuáles son los planes de suscripción para una empresa de 20 computadores?')}
          className="px-3 py-1 rounded-full bg-blue-950/70 hover:bg-blue-900 text-blue-200 border border-blue-500/20 shrink-0 transition-colors"
        >
          🏢 Contrato Pyme 20 Puestos
        </button>
        <button
          onClick={() => handleQuickPrompt('Cotízame 10 licencias de Kaspersky Antivirus y Microsoft 365')}
          className="px-3 py-1 rounded-full bg-blue-950/70 hover:bg-blue-900 text-blue-200 border border-blue-500/20 shrink-0 transition-colors"
        >
          🛡️ Licencias Kaspersky & Office
        </button>
      </div>

      {/* Bottom Input Field */}
      <form onSubmit={handleSendMessage} className="p-4 bg-[#060b18] border-t border-blue-500/20 flex items-center space-x-3">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Escribe tu consulta o pide una cotización (B2B, Celulares, Licencias)..."
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
