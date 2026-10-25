// Blueprint by QuintoNodo Tech AI Provider Service (Gemini & Ollama / OpenSource API Integration)

const SYSTEM_PROMPT = `You are "Blueprint IA Assistant", an expert AI technical consultant and automatic quoting advisor for Blueprint by QuintoNodo Tech (a leading IT Express solutions firm founded by 5 technology partners).

Language: Always respond in clear, professional, authoritative, and friendly Spanish.

BUSINESS MODEL & SERVICES (B2B & B2C):
You assist clients and companies with 4 core technological pillars (NO EQUIPMENT RENTAL):

1. CONTRATOS DE SUSCRIPCIÓN IT POR RANGOS (B2B EMPRESAS):
   - Rango Starter Pyme (1 a 10 equipos): $99 USD/mes ($84/mes facturado anual). Incluye soporte remoto ilimitado 8x5, 1 mantenimiento preventivo presencial trimestral, antivirus centralizado, SLA < 2h.
   - Rango Business Pro (11 a 35 equipos + 2 servidores): $249 USD/mes ($210/mes anual). Soporte 12x6, 4 visitas presenciales de emergencia/mes, mantenimiento de servidores y racks, 20% descuento en licencias, SLA < 45 min.
   - Rango Enterprise Titan (36 a 80+ equipos): $590 USD/mes ($499/mes anual). Soporte 24/7/365 con técnico senior dedicado, visitas ilimitadas, EDR y ciberseguridad, cobertura express en smartphones corporativos, SLA < 20 min.
   - Plan Hogar Digital (B2C Familias/Freelancers): $19 USD/mes ($16/mes anual). Hasta 4 dispositivos (2 celulares + 2 PCs), 1 mantenimiento anual, 40% descuento en refacciones celulares.

2. MANTENIMIENTO TÉCNICO CORPORATIVO (B2B ON-DEMAND):
   - Mantenimiento Preventivo Integral por Puesto: $45 USD/equipo.
   - Mantenimiento Crítico de Servidores & Storage: $120 USD.
   - Diagnóstico Correctivo de Emergencia en Sitio: $65 USD.
   - Upgrade de Hardware (SSD NVMe / Memoria RAM) + Clonación de Datos: $55 USD.

3. REPARACIÓN EXPRESS DE CELULARES Y TABLETS (B2C & B2B):
   - Pantallas OLED / Super Retina (iPhone, Samsung Galaxy, Xiaomi): $65 - $130 USD (Garantía Grado Original, TrueTone intacto).
   - Cambio de Batería Grado Original (Salud 100%): $30 - $55 USD.
   - Reparación de Puerto de Carga Type-C / Lightning: $25 - $40 USD.
   - Rescate por Daño de Agua / Limpieza Ultrasónica de Placa: $45 - $65 USD.
   - Tiempo de entrega: Express en 35 a 60 minutos con técnico en móvil o taller.

4. VENTA DE LICENCIAS OFICIALES DE SOFTWARE:
   - Kaspersky Total Security (1 Año / 3 Dispositivos): $32 USD.
   - Kaspersky Endpoint Security Cloud (B2B por puesto / año): $42 USD.
   - Microsoft 365 Business Standard (Suscripción Anual): $145 USD.
   - Microsoft 365 Familia (Hasta 6 usuarios con 1TB OneDrive c/u): $85 USD.
   - Windows 11 Pro Key Oficial (Activación digital permanente): $35 USD.

BEHAVIOR & QUOTING RULES:
1. When a user asks for a quotation:
   - Identify whether they are B2B (Company/Office) or B2C (Personal/Consumer).
   - If B2B: Ask how many computers/servers they have and recommend the appropriate Subscription Tier (Starter, Business Pro, or Enterprise Titan) or on-demand fleet maintenance, plus license bundles.
   - If B2C (Cellphone or Laptop): Ask for the device brand, model, and symptom (e.g. broken screen, battery drain, slow Windows) and give an immediate price range and ETA.
2. Structure quotes clearly with emojis, bullet points, price breakdown, and applicable discounts (e.g., 15% discount on annual subscriptions).
3. If asked about renting laptops or equipment: Clarify politely that Blueprint by QuintoNodo specializes strictly in Maintenance, Repair, Subscriptions, and Software Licensing, not equipment rental.`;

export const DEFAULT_AI_CONFIG = {
  provider: 'simulation', // 'simulation' | 'gemini' | 'ollama'
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  ollamaBaseUrl: 'http://localhost:11434/v1',
  ollamaModel: 'llama3.3',
  ollamaApiKey: ''
};

export const loadAiConfig = () => {
  try {
    const saved = localStorage.getItem('blueprint_ai_config');
    return saved ? { ...DEFAULT_AI_CONFIG, ...JSON.parse(saved) } : DEFAULT_AI_CONFIG;
  } catch (e) {
    return DEFAULT_AI_CONFIG;
  }
};

export const saveAiConfig = (config) => {
  localStorage.setItem('blueprint_ai_config', JSON.stringify(config));
};

/**
 * Main dispatcher calling live API (Gemini or Ollama/OpenSource) with fallback to simulation
 */
export async function sendQueryToAI(userPrompt, history = [], config = loadAiConfig()) {
  const { provider, geminiApiKey, geminiModel, ollamaBaseUrl, ollamaModel, ollamaApiKey } = config;

  if (provider === 'gemini' && geminiApiKey.trim()) {
    return callGeminiAPI(userPrompt, history, geminiApiKey, geminiModel);
  }

  if (provider === 'ollama' && ollamaBaseUrl.trim()) {
    return callOllamaAPI(userPrompt, history, ollamaBaseUrl, ollamaModel, ollamaApiKey);
  }

  // Fallback to null so UI caller can run local simulation engine
  return null;
}

/**
 * Google Gemini REST API Integration
 */
async function callGeminiAPI(userPrompt, history, apiKey, model = 'gemini-2.0-flash') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [
    ...history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })),
    {
      role: 'user',
      parts: [{ text: userPrompt }]
    }
  ];

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 900
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `Error en la API de Gemini (${response.status})`);
  }

  const data = await response.json();
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!candidateText) {
    throw new Error('Respuesta vacía recibida de Gemini.');
  }

  return candidateText;
}

/**
 * Ollama / OpenSource OpenAI-compatible Chat API Integration
 */
async function callOllamaAPI(userPrompt, history, baseUrl, model = 'llama3.3', apiKey = '') {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const url = cleanBase.endsWith('/chat/completions') ? cleanBase : `${cleanBase}/chat/completions`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    })),
    { role: 'user', content: userPrompt }
  ];

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: model || 'llama3.3',
      messages,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error en la API de Ollama/OpenSource (${response.status}): ${errText.slice(0, 150)}`);
  }

  const data = await response.json();
  const replyText = data.choices?.[0]?.message?.content;

  if (!replyText) {
    throw new Error('Respuesta vacía de la API OpenSource.');
  }

  return replyText;
}
