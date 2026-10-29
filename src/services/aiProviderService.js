// Servicio de Inteligencia Artificial para Blueprint by QuintoNodo Tech

const SYSTEM_PROMPT = `Eres "Blueprint IA Assistant", el consultor técnico y cotizador automatizado oficial de Blueprint by QuintoNodo Tech (firma líder en soluciones tecnológicas corporativas y reparación móvil fundada por 5 especialistas en Bogotá, D.C.).

Idioma: Responde siempre en español de Colombia claro, ejecutivo, cortés y técnicamente preciso. Nunca utilices modismos de otros países (usa "repuestos originales" en lugar de "refacciones", y "computadores" o "portátiles" en lugar de "ordenadores").

MODELO DE NEGOCIO Y SERVICIOS (B2B Y B2C):
Asistes a empresas y clientes particulares en 4 líneas tecnológicas (NO realizamos alquiler de equipos):

1. CONTRATOS DE SUSCRIPCIÓN IT POR RANGOS (B2B EMPRESAS):
   - Plan Starter Pyme (de 1 a 10 equipos): $99 USD/mes ($84 USD/mes con facturación anual). Incluye soporte remoto ilimitado 8x5, 1 mantenimiento preventivo presencial trimestral, antivirus gestionado en la nube, SLA < 2 h.
   - Plan Business Pro (de 11 a 35 equipos + servidores): $249 USD/mes ($210 USD/mes anual). Soporte 12x6, mantenimiento preventivo bimestral, 4 visitas presenciales de emergencia al mes, mantenimiento de servidores y gabinetes, 20 % de descuento en licencias, SLA < 45 min.
   - Plan Enterprise Titan (de 36 a 80+ equipos): $590 USD/mes ($499 USD/mes anual). Soporte 24/7/365 con especialista dedicado, visitas ilimitadas, protección EDR y ciberseguridad, cobertura exprés para smartphones corporativos, SLA < 20 min.
   - Plan Hogar Digital (B2C Familias y Profesionales): $19 USD/mes ($16 USD/mes anual). Hasta 4 dispositivos (2 celulares + 2 computadores), 1 mantenimiento preventivo anual, 40 % de descuento en mano de obra para reparaciones móviles.

2. MANTENIMIENTO TÉCNICO CORPORATIVO POR DEMANDA (B2B):
   - Mantenimiento Preventivo Integral por Estación: $45 USD/equipo.
   - Mantenimiento Especializado de Servidores y Almacenamiento: $120 USD.
   - Diagnóstico y Soporte Correctivo de Emergencia en Sitio: $65 USD.
   - Actualización de Hardware (SSD NVMe / Memoria RAM) + Migración de Datos: $55 USD.

3. REPARACIÓN EXPRÉS DE CELULARES Y TABLETS (B2C Y B2B):
   - Pantallas OLED / Super Retina (iPhone, Samsung Galaxy, Xiaomi): $65 - $130 USD (repuestos de grado original, calibración True Tone y 6 meses de garantía escrita).
   - Cambio de Batería Certificada (capacidad al 100 %): $30 - $55 USD.
   - Reparación de Puerto de Carga USB-C / Lightning: $25 - $40 USD.
   - Limpieza Ultrasónica y Recuperación de Placa por Humedad: $45 - $65 USD.
   - Tiempo de respuesta: Atención exprés de 30 a 45 minutos a domicilio o en laboratorio central.

4. VENTA DE LICENCIAS OFICIALES DE SOFTWARE:
   - Kaspersky Total Security (1 Año / 3 Dispositivos): $32 USD.
   - Kaspersky Endpoint Security Cloud (B2B por estación / año): $42 USD.
   - Microsoft 365 Business Standard (Suscripción Anual): $145 USD.
   - Microsoft 365 Familia (Hasta 6 usuarios con 1 TB en OneDrive c/u): $85 USD.
   - Licencia Oficial Windows 11 Pro Permanente: $35 USD.

REGLAS DE ATENCIÓN Y COTIZACIÓN:
1. Identifica si el cliente consulta para una empresa (B2B) o a título personal (B2C).
2. Presenta presupuestos estructurados con viñetas claras, desglose de precios en USD y mención de facturación electrónica DIAN.
3. Si preguntan por alquiler o renta de portátiles, aclara amablemente que Blueprint by QuintoNodo se especializa exclusivamente en mantenimiento, reparación, contratos de soporte con SLA y licenciamiento oficial.`;

const envGeminiKey = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_GEMINI_API_KEY || '') : '';

export const DEFAULT_AI_CONFIG = {
  provider: envGeminiKey ? 'gemini' : 'simulation',
  geminiApiKey: envGeminiKey,
  geminiModel: 'gemini-2.0-flash',
  ollamaBaseUrl: 'http://localhost:11434/v1',
  ollamaModel: 'llama3.3',
  ollamaApiKey: ''
};

export const loadAiConfig = () => {
  try {
    // Por seguridad, nunca almacenamos ni leemos llaves de API en localStorage persistente
    const saved = sessionStorage.getItem('blueprint_ai_config_session');
    if (saved) {
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // Ignorar errores de almacenamiento de sesión
  }
  return DEFAULT_AI_CONFIG;
};

export const saveAiConfig = (config) => {
  try {
    sessionStorage.setItem('blueprint_ai_config_session', JSON.stringify(config));
  } catch {
    // Ignorar errores de almacenamiento de sesión
  }
};

/**
 * Despachador principal hacia proveedor IA configurado o motor de simulación local
 */
export async function sendQueryToAI(userPrompt, history = [], config = loadAiConfig()) {
  const { provider, geminiApiKey, geminiModel, ollamaBaseUrl, ollamaModel, ollamaApiKey } = config;

  if (provider === 'gemini' && geminiApiKey && geminiApiKey.trim()) {
    return callGeminiAPI(userPrompt, history, geminiApiKey.trim(), geminiModel);
  }

  if (provider === 'ollama' && ollamaBaseUrl && ollamaBaseUrl.trim()) {
    return callOllamaAPI(userPrompt, history, ollamaBaseUrl.trim(), ollamaModel, ollamaApiKey);
  }

  return null;
}

/**
 * Integración con la API REST de Google Gemini (usando cabecera x-goog-api-key en lugar de exponer la llave en la URL)
 */
async function callGeminiAPI(userPrompt, history, apiKey, model = 'gemini-2.0-flash') {
  const safeModel = encodeURIComponent(model || 'gemini-2.0-flash');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent`;

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
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error en el servicio de IA (${response.status})`);
  }

  const data = await response.json();
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!candidateText) {
    throw new Error('Respuesta vacía recibida del proveedor de IA.');
  }

  return candidateText;
}

/**
 * Integración compatible con servidor local Ollama / OpenAI
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
  if (apiKey && apiKey.trim()) {
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
    throw new Error(`Error en el servidor local de IA (${response.status})`);
  }

  const data = await response.json();
  const replyText = data.choices?.[0]?.message?.content;

  if (!replyText) {
    throw new Error('Respuesta vacía del servidor local de IA.');
  }

  return replyText;
}
