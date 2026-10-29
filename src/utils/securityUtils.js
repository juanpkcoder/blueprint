// Utilidades de seguridad defensiva para sanitización de entradas y prevención de XSS (Cross-Site Scripting)

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Escapa caracteres especiales HTML para prevenir ataques de inyección DOM XSS
 * al generar documentos imprimibles, popups de mapas o plantillas dinámicas.
 */
export const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"'`=/]/g, (char) => HTML_ESCAPE_MAP[char]);
};

/**
 * Limpia y limita la longitud de cadenas de texto ingresadas por el usuario
 * en formularios públicos antes de procesarlas.
 */
export const sanitizeText = (value, maxLength = 250) => {
  if (typeof value !== 'string') return '';
  return value.replace(/\p{Cc}/gu, '').trim().slice(0, maxLength);
};

/**
 * Valida formato de correo electrónico de forma segura sin expresiones regulares vulnerables a ReDoS.
 */
export const isValidEmail = (email) => {
  if (typeof email !== 'string' || email.length > 254) return false;
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf('@')) return false;
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  return local.length > 0 && domain.length >= 3 && domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
};
