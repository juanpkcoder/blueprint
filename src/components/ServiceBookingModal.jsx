import React, { useState, useEffect } from 'react';
import { 
  X, Building2, Smartphone, ShieldCheck, CreditCard, 
  CheckCircle2, ArrowRight, Zap, Sparkles, Check, 
  Download, Mail, QrCode, Send, Copy, Lock
} from 'lucide-react';
import { SERVICE_CATEGORIES, INITIAL_TECHNICIANS, MOBILE_DEVICES_LIST } from '../data/mockData';
import { runOrderAutomationPipeline } from '../services/automationService';
import { formatCOP, formatUSD, convertUSDToCOP } from '../utils/currencyUtils';
import { escapeHtml, sanitizeText, isValidEmail } from '../utils/securityUtils';
import confetti from 'canvas-confetti';
import { playSoundEffect } from '../utils/soundEffects';

export const ServiceBookingModal = ({ isOpen, onClose, onCreateOrder, preselectedServiceCategory, preselectedPlan }) => {
  const [step, setStep] = useState(1); // 1: Servicio, 2: Cliente, 3: Pago, 4: Comprobante Digital
  const [selectedCategory, setSelectedCategory] = useState(SERVICE_CATEGORIES[0]);
  const [selectedOption, setSelectedOption] = useState(SERVICE_CATEGORIES[0].options[0]);
  
  // Campos del formulario de solicitud
  const [customerType, setCustomerType] = useState('b2b'); // 'b2b' | 'b2c'
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState('express'); // 'express', 'normal', 'emergencia'
  
  // Detalles para reparación móvil
  const [mobileBrand, setMobileBrand] = useState(MOBILE_DEVICES_LIST[0].brand);
  const [mobileModel, setMobileModel] = useState(MOBILE_DEVICES_LIST[0].models[0]);
  
  // Cantidad de licencias o estaciones de trabajo
  const [itemQuantity, setItemQuantity] = useState(1);
  
  const [paymentMethod, setPaymentMethod] = useState('Transferencia Bancolombia / Factura Electrónica B2B');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState(1);
  
  // Orden confirmada y envío de comprobante
  const [generatedOrder, setGeneratedOrder] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState(false);

  useEffect(() => {
    if (preselectedPlan?.plan) {
      const b2bCat = SERVICE_CATEGORIES.find(c => c.id === 'mantenimiento_b2b') || SERVICE_CATEGORIES[0];
      const planPrice = preselectedPlan.cycle === 'annual' ? preselectedPlan.plan.priceAnnual : preselectedPlan.plan.priceMonthly;
      setSelectedCategory(b2bCat);
      setSelectedOption({
        id: `plan_${preselectedPlan.plan.id}`,
        name: `${preselectedPlan.plan.name} (${preselectedPlan.cycle === 'annual' ? 'Facturación Anual -18%' : 'Facturación Mensual'})`,
        price: planPrice || 199,
        time: `SLA ${preselectedPlan.plan.slaOnsite || '< 2 horas'}`
      });
      setCustomerType('b2b');
      setItemQuantity(1);
      setUrgency('normal');
      setNotes(`Contratación de ${preselectedPlan.plan.name} (${preselectedPlan.plan.range}). SLA Remoto: ${preselectedPlan.plan.slaRemote} | SLA en Sitio: ${preselectedPlan.plan.slaOnsite}.`);
      return;
    }

    if (preselectedServiceCategory) {
      const found = SERVICE_CATEGORIES.find(c => c.id === preselectedServiceCategory);
      if (found) {
        setSelectedCategory(found);
        setSelectedOption(found.options[0]);
        if (found.id === 'reparacion_movil') {
          setCustomerType('b2c');
        } else if (found.id === 'mantenimiento_b2b') {
          setCustomerType('b2b');
        }
      }
    }
  }, [preselectedServiceCategory, preselectedPlan]);

  if (!isOpen) return null;

  // Cálculo de tarifas en USD y COP (IVA Colombia 19 % según Estatuto Tributario DIAN)
  const unitPriceUSD = selectedOption?.price || 45;
  const isMultiple = selectedCategory.id === 'licencias_software' || selectedCategory.id === 'mantenimiento_b2b';
  const quantityMultiplier = isMultiple ? itemQuantity : 1;
  const urgencyFeeUSD = urgency === 'emergencia' ? 30 : urgency === 'express' ? 12 : 0;
  const subtotalUSD = (unitPriceUSD * quantityMultiplier) + urgencyFeeUSD;
  const taxUSD = Number((subtotalUSD * 0.19).toFixed(2));
  const totalUSD = Number((subtotalUSD + taxUSD).toFixed(2));

  const totalCOP = convertUSDToCOP(totalUSD);
  const subtotalCOP = convertUSDToCOP(subtotalUSD);
  const taxCOP = convertUSDToCOP(taxUSD);
  const urgencyFeeCOP = convertUSDToCOP(urgencyFeeUSD);

  const handleStartPayment = () => {
    setIsSubmitting(true);
    setPaymentPhase(1);
    playSoundEffect('tech_assigned');

    const safeBrand = sanitizeText(mobileBrand, 60);
    const safeModel = sanitizeText(mobileModel, 80);
    const deviceLabel = selectedCategory.id === 'reparacion_movil' ? ` [${safeBrand} ${safeModel}]`.trim() : '';
    const qtyLabel = quantityMultiplier > 1 ? ` (x${quantityMultiplier})` : '';

    const cleanName = sanitizeText(customerName, 120) || (customerType === 'b2b' ? 'Cliente Corporativo B2B' : 'Cliente Particular B2C');
    const cleanEmail = sanitizeText(customerEmail, 120) || 'contacto@blueprint.tech';
    const cleanAddress = sanitizeText(address, 180) || 'Bogotá, D.C. (Dirección por confirmar)';
    const cleanPhone = sanitizeText(phone, 40) || '+57 (Pendiente)';
    const cleanNotes = sanitizeText(notes, 400) || 'Sin observaciones adicionales.';

    const tempOrder = {
      id: `BPT-${Math.floor(1000 + Math.random() * 9000)}`,
      ticketCode: `TKT-BPT-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      serviceType: selectedCategory.id,
      serviceName: `${selectedOption.name}${deviceLabel}${qtyLabel}`,
      customerName: cleanName,
      customerEmail: cleanEmail,
      address: cleanAddress,
      phone: cleanPhone,
      urgency: urgency === 'emergencia' ? 'Emergencia 24/7 (< 25 min)' : urgency === 'express' ? 'Exprés (< 60 min)' : 'Servicio Programado',
      priceTotal: totalUSD,
      priceTotalCOP: totalCOP,
      status: 'tecnico_asignado',
      etaMinutes: urgency === 'emergencia' ? 20 : urgency === 'express' ? 40 : 90,
      paymentMethod: sanitizeText(paymentMethod, 100),
      notes: cleanNotes
    };

    setTimeout(() => {
      setPaymentPhase(2);
      playSoundEffect('notification');
    }, 700);

    setTimeout(() => {
      setPaymentPhase(3);
    }, 1400);

    setTimeout(() => {
      setPaymentPhase(4);
      
      const { assignedTech } = runOrderAutomationPipeline(tempOrder, INITIAL_TECHNICIANS);
      const finalizedOrder = {
        ...tempOrder,
        technician: assignedTech
      };

      setGeneratedOrder(finalizedOrder);
      setEmailInput(finalizedOrder.customerEmail);

      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.5 }
      });

      playSoundEffect('success');
      setIsSubmitting(false);
      setStep(4);
      onCreateOrder(finalizedOrder);
    }, 2200);
  };

  const handleDownloadTicket = () => {
    if (!generatedOrder) return;
    playSoundEffect('notification');

    const ticketCode = escapeHtml(generatedOrder.ticketCode || `TKT-${generatedOrder.id}`);
    const tech = generatedOrder.technician || INITIAL_TECHNICIANS[0];
    const safeCustomerName = escapeHtml(generatedOrder.customerName);
    const safeCustomerEmail = escapeHtml(generatedOrder.customerEmail);
    const safeDate = escapeHtml(generatedOrder.date);
    const safeUrgency = escapeHtml(generatedOrder.urgency);
    const safeServiceName = escapeHtml(generatedOrder.serviceName);
    const safeTechName = escapeHtml(tech.name);
    const safeVehicle = escapeHtml(`${tech.vehicle} (${tech.plate || 'BPT-101'})`);
    const safePaymentMethod = escapeHtml(generatedOrder.paymentMethod);
    const safePriceUSD = escapeHtml(generatedOrder.priceTotal);
    const safePriceCOP = escapeHtml(formatCOP(generatedOrder.priceTotalCOP || convertUSDToCOP(generatedOrder.priceTotal)));

    const printableHtml = `
      <!DOCTYPE html>
      <html lang="es-CO">
      <head>
        <meta charset="utf-8">
        <title>Comprobante de Servicio - ${ticketCode}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #060b18; color: #f8fafc; padding: 40px; margin: 0; }
          .ticket-card { max-width: 640px; margin: 0 auto; background: #0a152e; border: 2px solid #00f0ff; border-radius: 24px; padding: 36px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
          .header { text-align: center; border-bottom: 2px dashed rgba(0, 240, 255, 0.3); padding-bottom: 24px; margin-bottom: 24px; }
          .title { font-size: 26px; font-weight: 900; color: #00f0ff; margin: 0 0 6px 0; }
          .subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
          .badge { display: inline-block; background: rgba(0, 240, 255, 0.15); border: 1px solid #00f0ff; color: #00f0ff; padding: 6px 16px; border-radius: 9999px; font-weight: 800; font-size: 13px; margin-top: 12px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
          .item { background: #060b18; padding: 14px 18px; border-radius: 14px; border: 1px solid rgba(56, 189, 248, 0.15); }
          .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
          .value { font-size: 15px; font-weight: 700; color: #ffffff; word-break: break-word; }
          .price-box { background: linear-gradient(135deg, #0070f3, #00f0ff); color: #060b18; padding: 20px; border-radius: 18px; text-align: center; margin: 24px 0; }
          .price-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
          .price-val { font-size: 30px; font-weight: 900; margin-top: 4px; }
          .price-sub { font-size: 13px; font-weight: 700; margin-top: 2px; }
          .footer { text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="ticket-card">
          <div class="header">
            <h1 class="title">BLUEPRINT BY QUINTONODO TECH</h1>
            <p class="subtitle">Comprobante Oficial de Contratación y Servicio Técnico Especializado</p>
            <div class="badge">TICKET: ${ticketCode}</div>
          </div>
          <div class="grid">
            <div class="item"><div class="label">Cliente / Razón Social</div><div class="value">${safeCustomerName}</div></div>
            <div class="item"><div class="label">Correo Electrónico</div><div class="value">${safeCustomerEmail}</div></div>
            <div class="item"><div class="label">Fecha de Emisión</div><div class="value">${safeDate}</div></div>
            <div class="item"><div class="label">Modalidad y SLA</div><div class="value">${safeUrgency}</div></div>
            <div class="item"><div class="label">Servicio Contratado</div><div class="value">${safeServiceName}</div></div>
            <div class="item"><div class="label">Especialista Asignado</div><div class="value">${safeTechName}</div></div>
            <div class="item"><div class="label">Unidad Móvil / Placa</div><div class="value">${safeVehicle}</div></div>
            <div class="item"><div class="label">Medio de Pago</div><div class="value">${safePaymentMethod}</div></div>
          </div>
          <div class="price-box">
            <div class="price-title">Total Facturado (IVA Incluido)</div>
            <div class="price-val">${safePriceCOP} COP</div>
            <div class="price-sub">Equivalente a $${safePriceUSD} USD</div>
          </div>
          <div class="footer">
            <p>© 2026 Blueprint by QuintoNodo Tech. Soporte IT Corporativo, Reparación Móvil y Contratos con SLA.</p>
            <p>Garantía técnica respaldada por los 5 Nodos Especializados de QuintoNodo en Bogotá, D.C.</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    const blob = new Blob([printableHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (win) {
      win.focus();
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = `Ticket_${generatedOrder.ticketCode || generatedOrder.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!isValidEmail(emailInput)) return;

    setIsSendingEmail(true);
    playSoundEffect('notification');

    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailSentSuccess(true);
      playSoundEffect('success');

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        setEmailSentSuccess(false);
      }, 5000);
    }, 1300);
  };

  const handleCopyTicket = () => {
    if (!generatedOrder) return;
    const ticketCode = generatedOrder.ticketCode || `TKT-${generatedOrder.id}`;
    navigator.clipboard.writeText(`Ticket Blueprint: ${ticketCode} | Servicio: ${generatedOrder.serviceName} | Total: $${generatedOrder.priceTotal} USD | Especialista: ${generatedOrder.technician?.name}`);
    setCopiedTicket(true);
    playSoundEffect('notification');
    setTimeout(() => setCopiedTicket(false), 2500);
  };

  const handleCloseAndReset = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setGeneratedOrder(null);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-[#0a152e] rounded-3xl w-full max-w-2xl border border-cyan-500/30 shadow-2xl shadow-blue-950/90 text-white overflow-hidden my-8">
        
        {/* Pantalla de Procesamiento de Pago y Despacho */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-[#060b18]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-blue-950 border border-cyan-400/50 flex items-center justify-center text-[#00f0ff] shadow-xl shadow-cyan-500/30 animate-pulse">
                <CreditCard className="w-10 h-10 animate-bounce" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-emerald-500 text-[#060b18] flex items-center justify-center font-black">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest block mb-1">
              Transacción Protegida con Cifrado TLS / AES-256
            </span>
            <h3 className="text-xl font-black text-white mb-2">
              Procesando Solicitud y Asignación Técnica
            </h3>

            <div className="w-full max-w-md space-y-3 mt-4">
              <div className="h-2 w-full bg-blue-950 rounded-full payment-progress-bar overflow-hidden border border-cyan-500/30">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-[#00f0ff] transition-all duration-500"
                  style={{ width: `${paymentPhase * 25}%` }}
                ></div>
              </div>

              <div className="text-xs text-slate-300 font-semibold space-y-1.5 pt-2">
                {paymentPhase === 1 && (
                  <p className="text-cyan-300 flex items-center justify-center gap-2">
                    <span className="animate-spin w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full"></span>
                    1/4 Validando datos de facturación y medio de pago...
                  </p>
                )}
                {paymentPhase === 2 && (
                  <p className="text-cyan-300 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    2/4 Solicitud verificada y orden de servicio autorizada.
                  </p>
                )}
                {paymentPhase === 3 && (
                  <p className="text-cyan-300 flex items-center justify-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    3/4 Asignando al especialista más cercano de QuintoNodo...
                  </p>
                )}
                {paymentPhase === 4 && (
                  <p className="text-emerald-400 flex items-center justify-center gap-2 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    4/4 ¡Ticket digital y comprobante electrónico generados con éxito!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Encabezado del Modal */}
        <div className="bg-[#060b18] px-6 py-4 border-b border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-cyan-500/30 flex items-center justify-center text-[#00f0ff] shadow-md shadow-cyan-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {step === 4 ? '¡Contratación Confirmada y Ticket Digital!' : 'Solicitud de Servicio Técnico Blueprint'}
              </h3>
              <p className="text-xs text-cyan-300 font-medium">
                {step === 4 ? 'Orden oficial emitida • Respaldo QuintoNodo' : `Paso ${step} de 3 • Atención Prioritaria en Bogotá, D.C.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseAndReset}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* PASO 1: SELECCIÓN DE CATEGORÍA Y SERVICIO */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {preselectedPlan?.plan && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/90 to-[#0a152e] border border-[#00f0ff] shadow-lg shadow-cyan-500/15 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#00f0ff] block">
                      Contrato Corporativo Seleccionado
                    </span>
                    <h4 className="text-sm font-black text-white mt-0.5">{selectedOption.name}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Cobertura: {preselectedPlan.plan.range} • {selectedOption.time}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-[#00f0ff] block">${selectedOption.price} USD</span>
                    <span className="text-[10px] text-slate-400">Base mensual</span>
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  1. Selecciona la Especialidad Tecnológica:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SERVICE_CATEGORIES.map(cat => {
                    const isSelected = selectedCategory.id === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedOption(cat.options[0]);
                          if (cat.id === 'reparacion_movil') {
                            setCustomerType('b2c');
                          } else if (cat.id === 'mantenimiento_b2b') {
                            setCustomerType('b2b');
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-24 ${
                          isSelected
                            ? 'bg-[#0f2042] border-[#00f0ff] shadow-lg shadow-cyan-500/20'
                            : 'bg-[#060b18]/60 border-blue-500/20 hover:border-blue-400/40'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 block truncate">{cat.name.split('(')[0]}</span>
                        <span className="text-xs font-black text-white leading-tight line-clamp-2">{cat.tagline}</span>
                        <span className="text-[10px] text-cyan-300 font-extrabold">Desde ${cat.basePrice} USD</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  2. Tipo de Intervención o Licencia Requerida:
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {selectedCategory.options.map(opt => {
                    const isOptSelected = selectedOption.id === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedOption(opt)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isOptSelected
                            ? 'bg-[#0f2042] border-[#00f0ff] shadow-md shadow-cyan-500/15'
                            : 'bg-[#060b18]/60 border-blue-500/15 hover:border-blue-400/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isOptSelected ? 'border-[#00f0ff] bg-[#00f0ff]' : 'border-slate-500'
                          }`}>
                            {isOptSelected && <Check className="w-3.5 h-3.5 text-[#060b18]" />}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-white block">{opt.name}</span>
                            <span className="text-[11px] text-cyan-300 font-medium">Tiempo estimado de atención: {opt.time}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm sm:text-base font-black text-white">${opt.price} USD</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detalles del dispositivo móvil */}
              {selectedCategory.id === 'reparacion_movil' && (
                <div className="p-4 rounded-2xl bg-[#060b18]/80 border border-blue-500/20 space-y-3">
                  <span className="text-xs font-bold text-[#00f0ff] flex items-center gap-1.5 uppercase">
                    <Smartphone className="w-4 h-4" />
                    Especificaciones del Dispositivo Móvil
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Marca del Equipo</label>
                      <select
                        value={mobileBrand}
                        onChange={(e) => {
                          setMobileBrand(e.target.value);
                          const f = MOBILE_DEVICES_LIST.find(d => d.brand === e.target.value);
                          if (f) setMobileModel(f.models[0]);
                        }}
                        className="w-full bg-[#0a152e] border border-blue-500/30 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        {MOBILE_DEVICES_LIST.map(d => (
                          <option key={d.brand} value={d.brand}>{d.brand}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Modelo de Referencia</label>
                      <select
                        value={mobileModel}
                        onChange={(e) => setMobileModel(e.target.value)}
                        className="w-full bg-[#0a152e] border border-blue-500/30 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        {(MOBILE_DEVICES_LIST.find(d => d.brand === mobileBrand)?.models || []).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Selector de cantidad para licencias o estaciones de trabajo */}
              {isMultiple && (
                <div className="p-4 rounded-2xl bg-[#060b18]/80 border border-blue-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {selectedCategory.id === 'licencias_software' ? 'Cantidad de Licencias Oficiales' : 'Número de Estaciones o Servidores'}
                    </span>
                    <span className="text-[11px] text-slate-400">Tarifa corporativa preferencial por volumen</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-500/30 text-white font-bold hover:bg-blue-900"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-[#00f0ff]">{itemQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setItemQuantity(Math.min(500, itemQuantity + 1))}
                      className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-500/30 text-white font-bold hover:bg-blue-900"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* PASO 2: DATOS DEL CLIENTE Y UBICACIÓN */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              
              <div className="flex gap-2 p-1 bg-[#060b18] rounded-xl border border-blue-500/20">
                <button
                  type="button"
                  onClick={() => setCustomerType('b2b')}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    customerType === 'b2b' ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Empresa / Corporativo (B2B)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerType('b2c')}
                  className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    customerType === 'b2c' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Persona Natural / Hogar (B2C)</span>
                </button>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {customerType === 'b2b' ? 'Razón Social o Nombre de la Empresa' : 'Nombre Completo del Titular'}
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej.: Fintech Andina S.A.S. / Carlos Mendoza"
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Correo Electrónico (para envío de Ticket Digital y Factura Electrónica DIAN)
                </label>
                <input
                  type="email"
                  maxLength={120}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="facturacion@empresa.co"
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Dirección de Atención en Bogotá, D.C. o Sabana</label>
                <input
                  type="text"
                  maxLength={180}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Cra. 7 # 71-21, Of. 802, Chapinero, Bogotá, D.C."
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Teléfono Móvil o WhatsApp de Contacto</label>
                  <input
                    type="tel"
                    maxLength={40}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 310 987 6543"
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Prioridad y Nivel de Respuesta (SLA)</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="express">Despacho Exprés en Sitio (&lt; 60 min) +$12 USD</option>
                    <option value="emergencia">Emergencia Crítica 24/7 (&lt; 25 min) +$30 USD</option>
                    <option value="normal">Visita Programada (Mismo día hábil)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Observaciones o Síntomas Técnicos Reportados</label>
                <textarea
                  rows="2"
                  maxLength={400}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej.: Servidor con alerta térmica en gabinete principal o pantalla con falla táctil."
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                ></textarea>
              </div>

            </div>
          )}

          {/* PASO 3: RESUMEN DE LIQUIDACIÓN Y MEDIO DE PAGO */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              
              <div className="p-4 rounded-2xl bg-[#060b18] border border-blue-500/25 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-blue-500/20">
                  <span className="font-bold text-white text-sm">Resumen de Liquidación</span>
                  <span className="text-cyan-300 font-mono text-xs">{selectedOption.time}</span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span>Concepto del servicio:</span>
                    <span className="font-bold text-white text-right">{selectedOption.name}</span>
                  </div>
                  {quantityMultiplier > 1 && (
                    <div className="flex justify-between">
                      <span>Cantidad contratada:</span>
                      <span className="font-semibold text-white">{quantityMultiplier} unidades</span>
                    </div>
                  )}
                  {urgencyFeeUSD > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Cargo por prioridad SLA ({urgency}):</span>
                      <span>+{formatCOP(urgencyFeeCOP)} (~{formatUSD(urgencyFeeUSD)})</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Subtotal antes de impuestos:</span>
                    <span className="font-mono">{formatCOP(subtotalCOP)} (~{formatUSD(subtotalUSD)})</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IVA (19 % Facturación Electrónica DIAN):</span>
                    <span className="font-mono">{formatCOP(taxCOP)} (~{formatUSD(taxUSD)})</span>
                  </div>
                  <div className="flex justify-between items-center text-base font-black text-white pt-2.5 border-t border-blue-500/20">
                    <span>Total a Pagar:</span>
                    <div className="text-right">
                      <div className="text-[#00f0ff] text-xl font-mono">{formatCOP(totalCOP)} COP</div>
                      <div className="text-[11px] text-cyan-300 font-mono">~{formatUSD(totalUSD)} USD</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-slate-300 font-bold block">Medio de Pago Preferido</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none"
                >
                  <option value="Transferencia Bancolombia / Factura Electrónica B2B">Transferencia Bancolombia / Factura Electrónica B2B</option>
                  <option value="Wompi PSE / Nequi / Botón Bancolombia">Wompi PSE / Tarjeta Débito / Nequi</option>
                  <option value="Tarjeta de Crédito Corporativa o Personal (Visa / Mastercard / Amex)">Tarjeta de Crédito (Visa, Mastercard o American Express)</option>
                  <option value="Pago en Sitio con Datáfono Bold o Transferencia">Pago en Sitio al Especialista (Datáfono Bold o Transferencia)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-500/20 rounded-xl text-slate-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00f0ff] shrink-0" />
                <span>Al confirmar, se generará de inmediato tu <b>Ticket Digital Oficial</b> descargable con el especialista asignado.</span>
              </div>

            </div>
          )}

          {/* PASO 4: COMPROBANTE Y TICKET DIGITAL GENERADO */}
          {step === 4 && generatedOrder && (
            <div className="space-y-5 animate-in zoom-in-95 duration-300 text-xs">
              
              <div className="bg-[#060b18] p-5 rounded-2xl border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/10 space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-dashed border-cyan-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-950 border border-cyan-400/40 flex items-center justify-center text-[#00f0ff] shadow-sm">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ticket Digital Oficial</span>
                      <span className="text-xl font-black text-[#00f0ff] font-mono tracking-wider">
                        {generatedOrder.ticketCode}
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ORDEN CONFIRMADA
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Servicio Contratado</span>
                    <span className="font-bold text-white text-xs">{generatedOrder.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Facturado</span>
                    <span className="font-black text-cyan-300 text-sm">${generatedOrder.priceTotal} USD</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Cliente / Razón Social</span>
                    <span className="font-semibold text-white">{generatedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Modalidad SLA</span>
                    <span className="font-semibold text-amber-400">{generatedOrder.urgency}</span>
                  </div>
                </div>

                <div className="bg-[#0a152e] p-3 rounded-xl border border-cyan-500/25 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img 
                      src={generatedOrder.technician?.avatar || INITIAL_TECHNICIANS[0].avatar} 
                      alt={generatedOrder.technician?.name} 
                      className="w-10 h-10 rounded-xl object-cover border border-cyan-400/40"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#00f0ff] font-extrabold uppercase tracking-wider block">
                        Especialista QuintoNodo Asignado
                      </span>
                      <h5 className="font-bold text-white text-xs truncate">{generatedOrder.technician?.name}</h5>
                      <p className="text-[10px] text-slate-400 truncate">{generatedOrder.technician?.vehicle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    En camino
                  </span>
                </div>

              </div>

              <div className="bg-[#060b18] p-4 rounded-2xl border border-blue-500/20 space-y-2.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-white">
                  <Mail className="w-4 h-4 text-[#00f0ff]" />
                  <span>Enviar copia del comprobante digital por correo electrónico:</span>
                </div>

                <form onSubmit={handleSendEmail} className="flex gap-2">
                  <input
                    type="email"
                    maxLength={120}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="correo@empresa.co"
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
                    <span>¡Comprobante <b>{generatedOrder.ticketCode}</b> enviado con éxito a <b>{emailInput}</b>!</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadTicket}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:opacity-95 text-[#060b18] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-transform"
                >
                  <Download className="w-4 h-4 text-[#060b18] stroke-[2.5]" />
                  <span>Descargar Comprobante</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyTicket}
                  className="py-3 px-4 rounded-xl bg-[#0a152e] hover:bg-[#0f2042] text-slate-200 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  {copiedTicket ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">¡Datos Copiados!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-cyan-400" />
                      <span>Copiar Resumen</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Controles del Pie del Modal */}
        <div className="bg-[#060b18] px-6 py-4 border-t border-blue-500/20 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl bg-blue-950 text-slate-300 hover:text-white text-xs font-bold transition-colors"
            >
              Anterior
            </button>
          ) : step === 4 ? (
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Garantía QuintoNodo Activa
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">Respaldo Oficial Blueprint by QuintoNodo</span>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:opacity-90 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center space-x-2 transition-transform active:scale-95"
            >
              <span>Continuar</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#060b18]" />
            </button>
          ) : step === 3 ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleStartPayment}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 text-[#060b18] font-black text-xs shadow-lg shadow-cyan-500/30 flex items-center space-x-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirmar y Emitir Ticket (${totalUSD} USD)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCloseAndReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] text-[#060b18] font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center space-x-2 transition-transform active:scale-95"
            >
              <span>Finalizar y Ver Rastreo GPS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
