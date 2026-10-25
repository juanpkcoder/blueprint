import React, { useState } from 'react';
import { 
  X, Download, Mail, CheckCircle2, ShieldCheck, Printer, 
  MapPin, Phone, User, Clock, QrCode, Sparkles, Send, FileText,
  Building2, Smartphone, ArrowRight, Share2, Copy, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSoundEffect } from '../utils/soundEffects';

export const TicketVoucherModal = ({ isOpen, onClose, order, onNavigateTracking }) => {
  if (!isOpen || !order) return null;

  const [emailInput, setEmailInput] = useState(order.customerEmail || 'contacto@cliente.com');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const ticketCode = order.ticketCode || `TKT-${order.id || 'BPT-9042'}`;
  const tech = order.technician || {
    name: 'Juan Aguirre',
    title: 'Director Técnico • QuintoNodo Tech',
    phone: '+57 310 000 0101',
    vehicle: 'Nodo Móvil Blueprint #01'
  };

  const handleDownloadTicket = () => {
    playSoundEffect('notification');
    
    // Create formatted HTML ticket content for clean printable download
    const printableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ticket de Servicio - ${ticketCode}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #060b18; color: #f8fafc; padding: 40px; margin: 0; }
          .ticket-card { max-width: 620px; margin: 0 auto; background: #0a152e; border: 2px solid #00f0ff; border-radius: 24px; padding: 36px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
          .header { text-align: center; border-bottom: 2px dashed rgba(0, 240, 255, 0.3); padding-bottom: 24px; margin-bottom: 24px; }
          .title { font-size: 26px; font-weight: 900; color: #00f0ff; margin: 0 0 6px 0; }
          .subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
          .badge { display: inline-block; background: rgba(0, 240, 255, 0.15); border: 1px solid #00f0ff; color: #00f0ff; padding: 6px 16px; border-radius: 9999px; font-weight: 800; font-size: 13px; margin-top: 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
          .item { background: #060b18; padding: 14px 18px; border-radius: 14px; border: 1px solid rgba(56, 189, 248, 0.15); }
          .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
          .value { font-size: 15px; font-weight: 700; color: #ffffff; }
          .price-box { background: linear-gradient(135deg, #0070f3, #00f0ff); color: #060b18; padding: 20px; border-radius: 18px; text-align: center; margin: 24px 0; }
          .price-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
          .price-val { font-size: 34px; font-weight: 900; margin-top: 4px; }
          .footer { text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="ticket-card">
          <div class="header">
            <h1 class="title">BLUEPRINT BY QUINTONODO TECH</h1>
            <p class="subtitle">Comprobante Oficial de Contratación & Servicio IT Express</p>
            <div class="badge">TICKET OFICIAL: ${ticketCode}</div>
          </div>
          <div class="grid">
            <div class="item"><div class="label">Cliente</div><div class="value">${order.customerName || 'Cliente Blueprint'}</div></div>
            <div class="item"><div class="label">Fecha / Hora</div><div class="value">${order.date || new Date().toLocaleString()}</div></div>
            <div class="item"><div class="label">Servicio</div><div class="value">${order.serviceName}</div></div>
            <div class="item"><div class="label">Modalidad / SLA</div><div class="value">${order.urgency || 'Express (< 60m)'}</div></div>
            <div class="item"><div class="label">Especialista QuintoNodo</div><div class="value">${tech.name}</div></div>
            <div class="item"><div class="label">Móvil Asignado</div><div class="value">${tech.vehicle}</div></div>
            <div class="item"><div class="label">Dirección / Sede</div><div class="value">${order.address || 'En Sitio'}</div></div>
            <div class="item"><div class="label">Forma de Pago</div><div class="value">${order.paymentMethod || 'Aprobado'}</div></div>
          </div>
          <div class="price-box">
            <div class="price-title">Total Cancelado / Facturado</div>
            <div class="price-val">$${order.priceTotal} USD</div>
          </div>
          <div class="footer">
            <p>© 2026 Blueprint by QuintoNodo Tech. Plataforma de Servicios IT Express, Reparación Móvil & Contratos SLA.</p>
            <p>Garantía de servicio avalada por los 5 Nodos de Soporte QuintoNodo.</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    const blob = new Blob([printableHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.focus();
    } else {
      // Fallback download if popup blocked
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ticket_${ticketCode}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;

    setIsSendingEmail(true);
    playSoundEffect('tech_assigned');

    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailSentSuccess(true);
      playSoundEffect('success');

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        setEmailSentSuccess(false);
      }, 5000);
    }, 1500);
  };

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(`Ticket Blueprint: ${ticketCode} - Servicio: ${order.serviceName} - Total: $${order.priceTotal} USD`);
    setCopiedLink(true);
    playSoundEffect('notification');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-[#0a152e] border-2 border-cyan-400/40 rounded-3xl w-full max-w-xl text-white shadow-2xl shadow-cyan-500/20 overflow-hidden my-6">
        
        {/* Top Glow & Decorative Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-[#0070f3] to-[#00f0ff] p-5 text-[#060b18] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#060b18] text-[#00f0ff] flex items-center justify-center font-black shadow-lg">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 bg-white/70 px-2 py-0.5 rounded-full">
                Blueprint QuintoNodo
              </span>
              <h3 className="text-lg font-black text-[#060b18] leading-tight">
                Ticket Oficial de Servicio
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#060b18]/20 hover:bg-[#060b18]/40 text-[#060b18] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Perforated Header Badge */}
        <div className="bg-[#060b18] px-6 py-4 border-b border-dashed border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-950 border border-cyan-500/40 flex items-center justify-center text-[#00f0ff]">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Identificador Digital</span>
              <span className="text-xl font-black text-[#00f0ff] font-mono tracking-wider">{ticketCode}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PAGO CONFIRMADO
            </span>
          </div>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Main Service Card */}
          <div className="bg-[#060b18] p-4 rounded-2xl border border-blue-500/20 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">Detalle de Contratación</span>
                <h4 className="text-base font-extrabold text-white mt-0.5">{order.serviceName}</h4>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-500/20 shrink-0">
                {order.urgency}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-blue-500/15">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cliente</span>
                <span className="font-semibold text-white">{order.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha / Hora</span>
                <span className="font-semibold text-white">{order.date || 'Hoy'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Sede / Ubicación</span>
                <span className="font-semibold text-slate-200 truncate block">{order.address}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Método Pago</span>
                <span className="font-semibold text-cyan-300 truncate block">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Assigned Technician Card (QuintoNodo Member) */}
          <div className="bg-[#0d1c3d] p-4 rounded-2xl border border-cyan-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 min-w-0">
              <img 
                src={tech.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} 
                alt={tech.name} 
                className="w-12 h-12 rounded-2xl object-cover border border-cyan-400/50 shrink-0 shadow-md"
              />
              <div className="min-w-0">
                <span className="text-[10px] text-[#00f0ff] font-extrabold uppercase tracking-wider block">
                  Especialista QuintoNodo Asignado
                </span>
                <h5 className="font-extrabold text-sm text-white truncate">{tech.name}</h5>
                <p className="text-[11px] text-slate-300 truncate">{tech.vehicle} • {tech.phone}</p>
              </div>
            </div>

            <a
              href={`tel:${tech.phone}`}
              className="p-2.5 rounded-xl bg-cyan-950 text-[#00f0ff] hover:bg-cyan-900 border border-cyan-500/40 shrink-0"
              title="Llamar al técnico"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Total Amount Box */}
          <div className="bg-gradient-to-r from-blue-900/60 via-blue-950 to-[#060b18] p-4 rounded-2xl border border-blue-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Liquidado</span>
              <span className="text-2xl font-black text-white">${order.priceTotal} <span className="text-xs font-bold text-cyan-400">USD</span></span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5" /> Garantía QuintoNodo
              </span>
              <span className="text-[11px] text-slate-400">SLA 99.9% Respaldo 5 Nodos</span>
            </div>
          </div>

          {/* Email Sender Form */}
          <div className="bg-[#060b18] p-4 rounded-2xl border border-blue-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <Mail className="w-4 h-4 text-[#00f0ff]" />
              <span>Enviar copia digital al correo electrónico:</span>
            </div>

            <form onSubmit={handleSendEmail} className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="tu-correo@empresa.com"
                required
                className="flex-1 bg-[#0a152e] border border-blue-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={isSendingEmail}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shrink-0 disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </>
                )}
              </button>
            </form>

            {emailSentSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡Ticket oficial enviado exitosamente a <b>{emailInput}</b>!</span>
              </div>
            )}
          </div>

          {/* Action Buttons: Download PDF & Copy */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleDownloadTicket}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:opacity-95 text-[#060b18] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform"
            >
              <Download className="w-4 h-4 text-[#060b18] stroke-[2.5]" />
              <span>Descargar Ticket Digital</span>
            </button>

            <button
              onClick={handleCopyTicket}
              className="py-3 px-4 rounded-xl bg-[#0a152e] hover:bg-[#0f2042] text-slate-200 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>Copiar Datos</span>
                </>
              )}
            </button>
          </div>

          {/* Direct CTA: Track Service Live */}
          {onNavigateTracking && (
            <button
              onClick={() => {
                onClose();
                onNavigateTracking(order);
              }}
              className="w-full py-3 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/30 text-[#00f0ff] font-extrabold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Ver Rastreo GPS del Especialista en Vivo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
