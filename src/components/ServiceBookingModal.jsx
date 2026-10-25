import React, { useState, useEffect } from 'react';
import { 
  X, Building2, Smartphone, ShieldCheck, Headphones, Clock, 
  MapPin, CreditCard, CheckCircle2, ArrowRight, Zap, Shield, 
  Sparkles, FileText, Check, DollarSign, Calendar, Download, 
  Mail, QrCode, Printer, Send, Copy, Lock, Radio
} from 'lucide-react';
import { SERVICE_CATEGORIES, INITIAL_TECHNICIANS, MOBILE_DEVICES_LIST } from '../data/mockData';
import { runOrderAutomationPipeline } from '../services/automationService';
import confetti from 'canvas-confetti';
import { playSoundEffect } from '../utils/soundEffects';

export const ServiceBookingModal = ({ isOpen, onClose, onCreateOrder, preselectedServiceCategory }) => {
  const [step, setStep] = useState(1); // 1: Service, 2: Client, 3: Payment, 4: Ticket & Receipt
  const [selectedCategory, setSelectedCategory] = useState(SERVICE_CATEGORIES[0]);
  const [selectedOption, setSelectedOption] = useState(SERVICE_CATEGORIES[0].options[0]);
  
  // Specific Form fields
  const [customerType, setCustomerType] = useState('b2b'); // 'b2b' | 'b2c'
  const [customerName, setCustomerName] = useState('Fintech Andina SAS');
  const [customerEmail, setCustomerEmail] = useState('contacto@fintechandina.com');
  const [address, setAddress] = useState('Cra. 7 # 71-21, Chapinero, Bogotá D.C.');
  const [phone, setPhone] = useState('+57 310 987 6542');
  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState('express'); // 'express', 'normal', 'emergencia'
  
  // Mobile Repair Specifics (for B2C / Cellphone Repair)
  const [mobileBrand, setMobileBrand] = useState('Apple');
  const [mobileModel, setMobileModel] = useState('iPhone 15 / 15 Pro');
  
  // Quantity for software licenses or maintenance posts
  const [itemQuantity, setItemQuantity] = useState(1);
  
  const [paymentMethod, setPaymentMethod] = useState('Transferencia Bancolombia / Factura Electrónica B2B');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState(1);
  
  // Confirmed generated order & ticket
  const [generatedOrder, setGeneratedOrder] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // If modal was triggered with preselected category
  useEffect(() => {
    if (preselectedServiceCategory) {
      const found = SERVICE_CATEGORIES.find(c => c.id === preselectedServiceCategory);
      if (found) {
        setSelectedCategory(found);
        setSelectedOption(found.options[0]);
        if (found.id === 'reparacion_movil') {
          setCustomerType('b2c');
          setCustomerName('Usuario Particular');
          setCustomerEmail('usuario@cliente.com');
        } else if (found.id === 'mantenimiento_b2b') {
          setCustomerType('b2b');
          setCustomerName('Empresa / Corporativo');
          setCustomerEmail('it@empresa.com');
        }
      }
    }
  }, [preselectedServiceCategory]);

  if (!isOpen) return null;

  // Calculate pricing breakdown
  const unitPrice = selectedOption?.price || 45;
  const isMultiple = selectedCategory.id === 'licencias_software' || selectedCategory.id === 'mantenimiento_b2b';
  const quantityMultiplier = isMultiple ? itemQuantity : 1;
  const urgencyFee = urgency === 'emergencia' ? 30 : urgency === 'express' ? 12 : 0;
  const subtotal = (unitPrice * quantityMultiplier) + urgencyFee;
  const tax = Math.round(subtotal * 0.16);
  const total = subtotal + tax;

  const handleStartPayment = () => {
    setIsSubmitting(true);
    setPaymentPhase(1);
    playSoundEffect('tech_assigned');

    const deviceLabel = selectedCategory.id === 'reparacion_movil' ? ` [${mobileBrand} ${mobileModel}]` : '';
    const qtyLabel = quantityMultiplier > 1 ? ` (x${quantityMultiplier})` : '';

    const tempOrder = {
      id: `BPT-${Math.floor(1000 + Math.random() * 9000)}`,
      ticketCode: `TKT-BPT-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      serviceType: selectedCategory.id,
      serviceName: `${selectedOption.name}${deviceLabel}${qtyLabel}`,
      customerName: customerName || (customerType === 'b2b' ? 'Cliente Corporativo B2B' : 'Cliente Particular B2C'),
      customerEmail: customerEmail || 'cliente@blueprint.tech',
      address: address || 'Dirección de atención',
      phone: phone,
      urgency: urgency === 'emergencia' ? 'Emergencia 24/7' : urgency === 'express' ? 'Express (<60m)' : 'Programado',
      priceTotal: total,
      status: 'tecnico_asignado',
      etaMinutes: urgency === 'emergencia' ? 20 : urgency === 'express' ? 40 : 90,
      paymentMethod: paymentMethod,
      notes: notes || 'Sin notas adicionales.'
    };

    // Phase 1 -> 2 (Validando pasarela financiera)
    setTimeout(() => {
      setPaymentPhase(2);
      playSoundEffect('notification');
    }, 700);

    // Phase 2 -> 3 (Asignando especialista de los 5 nodos QuintoNodo)
    setTimeout(() => {
      setPaymentPhase(3);
    }, 1400);

    // Phase 3 -> 4 (Generando Ticket Digital)
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
      setStep(4); // Move to Ticket & Confirmation Screen
      onCreateOrder(finalizedOrder);
    }, 2200);
  };

  const handleDownloadTicket = () => {
    if (!generatedOrder) return;
    playSoundEffect('notification');

    const ticketCode = generatedOrder.ticketCode || `TKT-${generatedOrder.id}`;
    const tech = generatedOrder.technician || INITIAL_TECHNICIANS[0];

    const printableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ticket de Servicio - ${ticketCode}</title>
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
            <div class="badge">TICKET: ${ticketCode}</div>
          </div>
          <div class="grid">
            <div class="item"><div class="label">Cliente</div><div class="value">${generatedOrder.customerName}</div></div>
            <div class="item"><div class="label">Correo</div><div class="value">${generatedOrder.customerEmail}</div></div>
            <div class="item"><div class="label">Fecha</div><div class="value">${generatedOrder.date}</div></div>
            <div class="item"><div class="label">Modalidad / SLA</div><div class="value">${generatedOrder.urgency}</div></div>
            <div class="item"><div class="label">Servicio Contratado</div><div class="value">${generatedOrder.serviceName}</div></div>
            <div class="item"><div class="label">Especialista QuintoNodo</div><div class="value">${tech.name}</div></div>
            <div class="item"><div class="label">Móvil / Placa</div><div class="value">${tech.vehicle} (${tech.plate || 'BPT-101'})</div></div>
            <div class="item"><div class="label">Forma de Pago</div><div class="value">${generatedOrder.paymentMethod}</div></div>
          </div>
          <div class="price-box">
            <div class="price-title">Total Cancelado / Facturado</div>
            <div class="price-val">$${generatedOrder.priceTotal} USD</div>
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
        
        {/* Payment Processing Overlay */}
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
              Pasarela Cifrada SSL 256-Bit QuintoNodo
            </span>
            <h3 className="text-xl font-black text-white mb-2">
              Procesando Pago &amp; Contratación
            </h3>

            {/* Simulated Phases */}
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
                    1/4 Conectando con entidad financiera...
                  </p>
                )}
                {paymentPhase === 2 && (
                  <p className="text-cyan-300 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    2/4 Transacción autorizada y fondos verificados.
                  </p>
                )}
                {paymentPhase === 3 && (
                  <p className="text-cyan-300 flex items-center justify-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    3/4 Asignando especialista de los 5 Nodos QuintoNodo...
                  </p>
                )}
                {paymentPhase === 4 && (
                  <p className="text-emerald-400 flex items-center justify-center gap-2 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    4/4 ¡Ticket digital y factura DIAN generados exitosamente!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header Bar */}
        <div className="bg-[#060b18] px-6 py-4 border-b border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-cyan-500/30 flex items-center justify-center text-[#00f0ff] shadow-md shadow-cyan-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {step === 4 ? '¡Contratación Exitosa & Ticket Digital!' : 'Solicitud de Servicio Express Blueprint'}
              </h3>
              <p className="text-xs text-cyan-300 font-medium">
                {step === 4 ? 'Ticket oficial generado • Respaldo QuintoNodo' : `Paso ${step} de 3 • Despacho Inmediato`}
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseAndReset}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: CATEGORY & OPTION SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Service Categories Grid */}
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

              {/* Sub-options for the Category */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  2. Tipo de Mantenimiento / Servicio Específico:
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
                            <span className="text-[11px] text-cyan-300 font-medium">Estimado de atención: {opt.time}</span>
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

              {/* Mobile device details if Cellphone repair is selected */}
              {selectedCategory.id === 'reparacion_movil' && (
                <div className="p-4 rounded-2xl bg-[#060b18]/80 border border-blue-500/20 space-y-3">
                  <span className="text-xs font-bold text-[#00f0ff] flex items-center gap-1.5 uppercase">
                    <Smartphone className="w-4 h-4" />
                    Detalles del Teléfono Celular a Reparar
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Marca</label>
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
                      <label className="text-[11px] text-slate-300 block mb-1">Modelo</label>
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

              {/* Quantity Selector for Software or Multiple Posts */}
              {isMultiple && (
                <div className="p-4 rounded-2xl bg-[#060b18]/80 border border-blue-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {selectedCategory.id === 'licencias_software' ? 'Cantidad de Licencias Oficiales' : 'Número de Puestos / Servidores'}
                    </span>
                    <span className="text-[11px] text-slate-400">Descuento corporativo aplicado en volumen</span>
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
                      onClick={() => setItemQuantity(itemQuantity + 1)}
                      className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-500/30 text-white font-bold hover:bg-blue-900"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 2: LOCATION & CLIENT DETAILS */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              
              {/* Type Switcher B2B / B2C */}
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
                  <span>Particular / Consumidor (B2C)</span>
                </button>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {customerType === 'b2b' ? 'Razón Social / Nombre de Empresa' : 'Nombre Completo del Cliente'}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Fintech Andina SAS / Juan Pérez"
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Correo Electrónico (para emisión de Ticket & Factura DIAN)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="contacto@empresa.com"
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Dirección en Bogotá (o Ciudad de Atención)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Cra. 7 # 71-21, Chapinero"
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Teléfono Móvil / WhatsApp de Contacto</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 310 987 6542"
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Prioridad / Nivel de Urgencia SLA</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="express">Express en Sitio (&lt; 60 min) +$12 USD</option>
                    <option value="emergencia">Emergencia Crítica 24/7 (&lt; 25 min) +$30 USD</option>
                    <option value="normal">Servicio Programado (Mismo día)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Notas o Síntomas Técnicos del Equipo</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Servidor con reinicio constante o pantalla rota con líneas verdes."
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#00f0ff]"
                ></textarea>
              </div>

            </div>
          )}

          {/* STEP 3: PAYMENT METHOD & REVIEW */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              
              {/* Order Summary Box */}
              <div className="p-4 rounded-2xl bg-[#060b18] border border-blue-500/25 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-blue-500/20">
                  <span className="font-bold text-white text-sm">Resumen de Contratación</span>
                  <span className="text-cyan-300 font-mono text-xs">{selectedOption.time}</span>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Servicio:</span>
                    <span className="font-bold text-white text-right">{selectedOption.name}</span>
                  </div>
                  {quantityMultiplier > 1 && (
                    <div className="flex justify-between">
                      <span>Cantidad:</span>
                      <span className="font-semibold text-white">{quantityMultiplier} unidades</span>
                    </div>
                  )}
                  {urgencyFee > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Recargo SLA ({urgency}):</span>
                      <span>+${urgencyFee} USD</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IVA (16% Factura Electrónica):</span>
                    <span>${tax} USD</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-blue-500/20">
                    <span>Total a Pagar:</span>
                    <span className="text-[#00f0ff] text-xl">${total} USD</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-300 font-bold block">Método de Pago Preferido</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-4 py-2.5 text-white font-semibold focus:outline-none"
                >
                  <option value="Transferencia Bancolombia / Factura Electrónica B2B">Transferencia Bancolombia / Factura B2B</option>
                  <option value="PSE / Davivienda / Nequi">PSE / Tarjeta Débito / Nequi</option>
                  <option value="Tarjeta de Crédito (Visa / Mastercard / Amex)">Tarjeta de Crédito</option>
                  <option value="Pago contraentrega al Técnico en Sitio">Pago en Sitio con Datáfono o Efectivo</option>
                </select>
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-500/20 rounded-xl text-slate-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00f0ff] shrink-0" />
                <span>Al confirmar, se emitirá tu <b>Ticket Digital</b> descargable y se enviará copia con código QR a tu correo.</span>
              </div>

            </div>
          )}

          {/* STEP 4: TICKET VOUCHER & RECEIPT CONFIRMATION */}
          {step === 4 && generatedOrder && (
            <div className="space-y-5 animate-in zoom-in-95 duration-300 text-xs">
              
              {/* Ticket Top Box */}
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
                    PAGO AUTORIZADO
                  </span>
                </div>

                {/* Service & Client summary */}
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Servicio</span>
                    <span className="font-bold text-white text-xs">{generatedOrder.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Facturado</span>
                    <span className="font-black text-cyan-300 text-sm">${generatedOrder.priceTotal} USD</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Cliente / Sede</span>
                    <span className="font-semibold text-white">{generatedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Modalidad SLA</span>
                    <span className="font-semibold text-amber-400">{generatedOrder.urgency}</span>
                  </div>
                </div>

                {/* Assigned QuintoNodo Partner */}
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

              {/* Email Send Box */}
              <div className="bg-[#060b18] p-4 rounded-2xl border border-blue-500/20 space-y-2.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-white">
                  <Mail className="w-4 h-4 text-[#00f0ff]" />
                  <span>Enviar comprobante digital al correo:</span>
                </div>

                <form onSubmit={handleSendEmail} className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="correo@empresa.com"
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
                    <span>¡Ticket <b>{generatedOrder.ticketCode}</b> enviado con éxito a <b>{emailInput}</b>!</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Download PDF & Copy */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadTicket}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:opacity-95 text-[#060b18] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-transform"
                >
                  <Download className="w-4 h-4 text-[#060b18] stroke-[2.5]" />
                  <span>Descargar Ticket Digital</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyTicket}
                  className="py-3 px-4 rounded-xl bg-[#0a152e] hover:bg-[#0f2042] text-slate-200 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  {copiedTicket ? (
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

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#060b18] px-6 py-4 border-t border-blue-500/20 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl bg-blue-950 text-slate-300 hover:text-white text-xs font-bold transition-colors"
            >
              Atrás
            </button>
          ) : step === 4 ? (
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Respaldo QuintoNodo Activo
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">Blueprint Express Guarantee</span>
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
              <span>Pagar &amp; Emitir Ticket (${total} USD)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCloseAndReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] text-[#060b18] font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center space-x-2 transition-transform active:scale-95"
            >
              <span>Finalizar &amp; Ver Rastreo GPS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
