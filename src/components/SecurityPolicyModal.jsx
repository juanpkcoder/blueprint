import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2, X, Key, Server, Smartphone, Award } from 'lucide-react';

export const SecurityPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0a152e] border border-cyan-500/30 rounded-3xl w-full max-w-3xl shadow-2xl shadow-blue-950/90 text-white overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#060b18] px-6 py-5 border-b border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-cyan-500/30 flex items-center justify-center text-[#00f0ff]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Políticas de Seguridad, SLA &amp; Privacidad</h3>
              <p className="text-xs text-cyan-300 font-medium">Marco Operativo Blueprint by QuintoNodo Tech</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-300 leading-relaxed">
          
          {/* Section 1 */}
          <div className="bg-[#060b18]/60 p-4 rounded-2xl border border-blue-500/15 space-y-2">
            <h4 className="font-extrabold text-sm text-[#00f0ff] flex items-center gap-2">
              <Lock className="w-4 h-4" />
              1. Protección de Datos y Confidencialidad B2B (Habeas Data &amp; NDA)
            </h4>
            <p>
              Blueprint by QuintoNodo Tech garantiza que toda información sensible, bases de datos o archivos contenidos en los equipos de computación y servidores de clientes corporativos (B2B) están protegidos bajo Acuerdos de No Divulgación (NDA) estrictos y la legislación de protección de datos personales. Nuestros técnicos certificados no acceden ni copian contenido privado en ninguna circunstancia.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-[#060b18]/60 p-4 rounded-2xl border border-blue-500/15 space-y-2">
            <h4 className="font-extrabold text-sm text-[#00f0ff] flex items-center gap-2">
              <Server className="w-4 h-4" />
              2. Cifrado de Sesiones de Soporte Remoto (SSL 256-Bit)
            </h4>
            <p>
              Las conexiones de asistencia remota se efectúan a través de túneles encriptados AES 256-bit extremo a extremo. Cada sesión requiere un token de un solo uso generado en tiempo real. Al culminar la sesión, el túnel se revoca automáticamente sin dejar backdoors ni accesos residuales en la máquina del cliente.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-[#060b18]/60 p-4 rounded-2xl border border-blue-500/15 space-y-2">
            <h4 className="font-extrabold text-sm text-[#00f0ff] flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              3. Cadena de Custodia en Reparación de Celulares y Tablets (B2C)
            </h4>
            <p>
              Todo dispositivo móvil recibido para reparación express (pantalla OLED, batería, puerto de carga o tarjeta lógica) es inventariado mediante un código digital BPT único con registro fotográfico de ingreso. Las pruebas de hardware se realizan frente al cliente o con reporte digital detallado, protegiendo cuentas de iCloud, Google y aplicaciones bancarias.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-[#060b18]/60 p-4 rounded-2xl border border-blue-500/15 space-y-2">
            <h4 className="font-extrabold text-sm text-[#00f0ff] flex items-center gap-2">
              <Key className="w-4 h-4" />
              4. Garantía de Licenciamiento Oficial
            </h4>
            <p>
              El 100% de las licencias comercializadas (Kaspersky, Bitdefender, Microsoft 365, Windows 11 Pro) son originales, certificadas y de procedencia legal directa de mayoristas autorizados. Se emite factura legal electrónica y soporte directo para su activación digital.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-[#060b18]/60 p-4 rounded-2xl border border-blue-500/15 space-y-2">
            <h4 className="font-extrabold text-sm text-[#00f0ff] flex items-center gap-2">
              <Award className="w-4 h-4" />
              5. Cumplimiento de Niveles de Servicio (SLA 99.9%)
            </h4>
            <p>
              Los contratos por rangos contemplan penalizaciones y bonificaciones en caso de no cumplir con los tiempos de respuesta pactados (&lt; 20 min en Enterprise Titan, &lt; 45 min en Business Pro). El cliente dispone de un canal de escalación directo con la junta de los 5 socios fundadores de QuintoNodo.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#060b18] px-6 py-4 border-t border-blue-500/20 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Última actualización: Octubre 2026 • Blueprint QuintoNodo Legal
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            Entendido y Aceptado
          </button>
        </div>

      </div>
    </div>
  );
};
