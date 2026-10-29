import React from 'react';
import { ShieldCheck, Lock, X, Key, Server, Smartphone, Award } from 'lucide-react';

export const SecurityPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0a152e] border border-cyan-500/30 rounded-3xl w-full max-w-3xl shadow-2xl shadow-blue-950/90 text-white overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado */}
        <div className="bg-[#060b18] px-6 py-5 border-b border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-cyan-500/30 flex items-center justify-center text-[#00f0ff]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Políticas de Seguridad, SLA y Privacidad</h3>
              <p className="text-xs text-cyan-300 font-medium">Marco Operativo y Legal de Blueprint by QuintoNodo Tech</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-300 leading-relaxed">
          
          <div className="bg-[#060b18]/60 p-4 rounded-2xl border border-blue-500/15 space-y-2">
            <h4 className="font-extrabold text-sm text-[#00f0ff] flex items-center gap-2">
              <Lock className="w-4 h-4" />
              1. Protección de Datos y Confidencialidad Corporativa (Habeas Data y NDA)
            </h4>
            <p>
              Blueprint by QuintoNodo Tech garantiza que toda información confidencial, bases de datos y activos digitales alojados en las estaciones de trabajo y servidores de nuestros clientes corporativos (B2B) están amparados bajo estrictos Acuerdos de Confidencialidad (NDA) y por la Ley Estatutaria 1581 de 2012 de Protección de Datos Personales en Colombia. Nuestros especialistas certificados no copian, extraen ni inspeccionan archivos privados bajo ninguna circunstancia.
            </p>
          </div>

          <div className="bg-[#060b18]/60 p-4 rounded-2xl border border-blue-500/15 space-y-2">
            <h4 className="font-extrabold text-sm text-[#00f0ff] flex items-center gap-2">
              <Server className="w-4 h-4" />
              2. Cifrado de Sesiones de Soporte Remoto (TLS / AES-256)
            </h4>
            <p>
              Las sesiones de asistencia remota se establecen únicamente con autorización expresa del usuario mediante canales cifrados AES-256 de extremo a extremo. Cada intervención utiliza un identificador temporal de sesión única. Al finalizar el soporte, la conexión se revoca de inmediato sin conservar accesos desatendidos ni puertas traseras en el equipo del cliente.
            </p>
          </div>

          <div className="bg-[#060b18]/60 p-4 rounded-2xl border border-blue-500/15 space-y-2">
            <h4 className="font-extrabold text-sm text-[#00f0ff] flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              3. Cadena de Custodia en Reparación de Dispositivos Móviles (B2C y B2B)
            </h4>
            <p>
              Todo teléfono inteligente, tablet o portátil recibido para intervención técnica (reemplazo de pantalla OLED, batería, puerto de carga o microsoldadura) se registra con una orden digital única y acta de diagnóstico físico. Las pruebas de funcionalidad se ejecutan en presencia del titular o mediante validación técnica controlada, preservando la privacidad de cuentas personales y aplicaciones financieras.
            </p>
          </div>

          <div className="bg-[#060b18]/60 p-4 rounded-2xl border border-blue-500/15 space-y-2">
            <h4 className="font-extrabold text-sm text-[#00f0ff] flex items-center gap-2">
              <Key className="w-4 h-4" />
              4. Garantía de Licenciamiento 100 % Original
            </h4>
            <p>
              La totalidad del software suministrado (Kaspersky, Bitdefender, Microsoft 365 y Windows 11 Pro) proviene de distribuidores mayoristas autorizados en Colombia. Cada adquisición cuenta con su respectiva factura electrónica legal ante la DIAN, certificado de titularidad y soporte para su activación oficial.
            </p>
          </div>

          <div className="bg-[#060b18]/60 p-4 rounded-2xl border border-blue-500/15 space-y-2">
            <h4 className="font-extrabold text-sm text-[#00f0ff] flex items-center gap-2">
              <Award className="w-4 h-4" />
              5. Cumplimiento de Acuerdos de Nivel de Servicio (SLA del 99.9 %)
            </h4>
            <p>
              Nuestros contratos mensuales garantizan tiempos de respuesta prioritarios (&lt; 20 minutos en el plan Enterprise Titan y &lt; 45 minutos en el plan Business Pro). Los clientes corporativos disponen de un canal de escalamiento directo con la dirección técnica de los 5 socios fundadores de QuintoNodo.
            </p>
          </div>

        </div>

        {/* Pie del Modal */}
        <div className="bg-[#060b18] px-6 py-4 border-t border-blue-500/20 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Vigente en Bogotá, D.C. • Blueprint by QuintoNodo Tech
          </span>
          <button
            type="button"
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
