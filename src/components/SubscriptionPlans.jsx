import React, { useState } from 'react';
import { 
  Shield, Check, Zap, Sparkles, Building2, Smartphone, 
  HelpCircle, ChevronRight, Clock, Award, Users, ArrowRight,
  Headphones, FileText, Lock, AlertCircle
} from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '../data/mockData';
import { playSoundEffect } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

export const SubscriptionPlans = ({ onSelectPlan, onOpenAiQuote }) => {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [calculatorWorkstations, setCalculatorWorkstations] = useState(15);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState(null);

  const handleContractPlan = (plan) => {
    playSoundEffect('success');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onSelectPlan) {
      onSelectPlan(plan, billingCycle);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span>Suscripciones IT Continuas por Rangos &amp; SLAs</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Protección &amp; Mantenimiento IT <span className="text-gradient-cyan">Bajo Contrato Mensual</span>
        </h2>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Planes flexibles por rangos para empresas (B2B) y familias (B2C). Garantizamos tiempos de respuesta SLA por contrato, mantenimiento preventivo programado y licencias oficiales.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-4 flex items-center justify-center">
          <div className="bg-[#0a152e] p-1.5 rounded-2xl border border-blue-500/25 flex items-center shadow-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Facturación Mensual
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Facturación Anual</span>
              <span className="bg-cyan-400 text-[#060b18] text-[10px] px-2 py-0.5 rounded-full font-black">
                -15% DTO
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const price = billingCycle === 'annual' ? tier.priceAnnual : tier.priceMonthly;
          const isPro = tier.id === 'business_pro';

          return (
            <div
              key={tier.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                isPro
                  ? 'bg-[#0f2042] border-2 border-[#00f0ff] shadow-2xl shadow-cyan-500/20 lg:-translate-y-2'
                  : 'bg-[#0a152e]/80 border border-blue-500/20 hover:border-blue-400/50 shadow-xl'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${
                    isPro 
                      ? 'bg-gradient-to-r from-[#00f0ff] to-blue-500 text-[#060b18]' 
                      : 'bg-blue-900/90 text-cyan-300 border border-blue-500/30'
                  }`}>
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-extrabold text-white">{tier.name}</h3>
                  <p className="text-xs text-cyan-300 font-bold mt-0.5">{tier.range}</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{tier.target}</p>
                </div>

                <div className="pt-2 border-t border-blue-500/20">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">${price}</span>
                    <span className="text-xs font-semibold text-slate-400">USD/mes</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {billingCycle === 'annual' ? 'Facturado anualmente (Ahorro garantizado)' : 'Facturación mes a mes sin cláusula'}
                  </p>
                </div>

                {/* SLA Specs */}
                <div className="bg-[#060b18]/70 p-3 rounded-2xl border border-blue-500/15 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">SLA Soporte Remoto:</span>
                    <span className="font-extrabold text-[#00f0ff]">{tier.slaRemote}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">SLA Técnico en Sitio:</span>
                    <span className="font-extrabold text-slate-200">{tier.slaOnsite}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Beneficios del Rango:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#00f0ff] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action CTA */}
              <div className="pt-6 mt-6 border-t border-blue-500/20">
                <button
                  onClick={() => handleContractPlan(tier)}
                  className={`w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg ${
                    isPro
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#060b18] shadow-cyan-500/30'
                      : 'bg-[#0f2042] hover:bg-blue-600 text-white border border-blue-400/30'
                  }`}
                >
                  <span>{tier.ctaText}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Interactive Fleet Estimator Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-[#0a152e] via-[#0f2042] to-[#0a152e] border border-blue-500/30 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
          
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase">
              <Building2 className="w-4 h-4 text-[#00f0ff]" />
              <span>Calculadora de Contratos a Medida</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              ¿Tienes una flota específica o sucursales múltiples?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Desliza el número de equipos de tu empresa para que el motor Blueprint QuintoNodo te asigne automáticamente la tarifa óptima con cobertura técnica integral.
            </p>

            {/* Slider */}
            <div className="pt-3 max-w-md space-y-2">
              <div className="flex justify-between items-center text-sm font-bold text-white">
                <span>Puestos IT:</span>
                <span className="text-2xl font-black text-[#00f0ff]">{calculatorWorkstations} equipos</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={calculatorWorkstations}
                onChange={(e) => setCalculatorWorkstations(parseInt(e.target.value))}
                className="w-full accent-[#00f0ff] cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>5 (Pyme Inicial)</span>
                <span>35 (Pyme Consolidada)</span>
                <span>100+ (Corporación)</span>
              </div>
            </div>
          </div>

          {/* Result Box */}
          <div className="bg-[#060b18]/90 p-6 rounded-2xl border border-cyan-500/30 text-center space-y-4 shadow-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Plan Óptimo Recomendado
            </span>
            <div className="text-2xl font-black text-white">
              {calculatorWorkstations <= 10 ? 'Starter Pyme' : calculatorWorkstations <= 35 ? 'Business Pro' : 'Enterprise Titan'}
            </div>
            <div className="text-3xl font-black text-[#00f0ff]">
              ${calculatorWorkstations <= 10 ? 99 : calculatorWorkstations <= 35 ? 249 : 590} <span className="text-xs text-slate-400 font-normal">USD/mes</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Incluye mantenimiento preventivo, soporte remoto garantizado y licencias antivirus cloud.
            </p>
            <button
              onClick={() => onOpenAiQuote && onOpenAiQuote()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#00f0ff]" />
              <span>Cotizar con Asistente IA</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
