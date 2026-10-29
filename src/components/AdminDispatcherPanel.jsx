import React, { useState } from 'react';
import { 
  Shield, Users, Activity, Zap, Award
} from 'lucide-react';
import { INITIAL_TECHNICIANS, SUBSCRIPTION_TIERS } from '../data/mockData';
import { AUTOMATION_RULES, INITIAL_AUTOMATION_LOGS } from '../services/automationService';
import { playSoundEffect } from '../utils/soundEffects';

export const AdminDispatcherPanel = ({ orders, onUpdateOrderStatus }) => {
  const [techs] = useState(INITIAL_TECHNICIANS);
  const [automationRules] = useState(AUTOMATION_RULES);
  const [automationLogs] = useState(INITIAL_AUTOMATION_LOGS);
  const [activeAdminTab, setActiveAdminTab] = useState('dispatch'); // 'dispatch' | 'automation' | 'subscriptions'

  const totalRevenue = orders.reduce((sum, o) => sum + o.priceTotal, 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'completado').length;

  const handleStatusChange = (orderId, newStatus) => {
    onUpdateOrderStatus(orderId, newStatus);
    playSoundEffect('status_update');
  };

  return (
    <div className="space-y-8 text-white">
      
      {/* Top Banner Control Room */}
      <div className="bg-[#0a152e] p-6 rounded-3xl border border-blue-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-[#00f0ff] p-[2px] shadow-lg shadow-cyan-500/30">
            <div className="w-full h-full bg-[#060b18] rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-[#00f0ff] animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              Centro de Control &amp; Despacho QuintoNodo
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Gestión de Técnicos en Campo, Despacho Express B2B/B2C y Contratos Activos
            </p>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center">
          <div className="bg-[#060b18] px-4 py-3 rounded-2xl border border-blue-500/20">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Órdenes Activas</span>
            <span className="text-xl font-black text-[#00f0ff]">{activeOrdersCount}</span>
          </div>

          <div className="bg-[#060b18] px-4 py-3 rounded-2xl border border-blue-500/20">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Especialistas</span>
            <span className="text-xl font-black text-emerald-400">
              {techs.filter(t => t.status !== 'inactivo').length} / {techs.length}
            </span>
          </div>

          <div className="bg-[#060b18] px-4 py-3 rounded-2xl border border-blue-500/20">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Facturación</span>
            <span className="text-xl font-black text-white">${totalRevenue}</span>
          </div>
        </div>
      </div>

      {/* Admin Subtabs Bar */}
      <div className="flex items-center space-x-2 border-b border-blue-500/20 pb-4 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveAdminTab('dispatch')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeAdminTab === 'dispatch'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-white bg-[#0a152e]'
          }`}
        >
          <Activity className="w-4 h-4 text-[#00f0ff]" />
          <span>Matriz de Despacho en Vivo ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('subscriptions')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeAdminTab === 'subscriptions'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-white bg-[#0a152e]'
          }`}
        >
          <Award className="w-4 h-4 text-[#00f0ff]" />
          <span>Contratos de Suscripción IT</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('automation')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeAdminTab === 'automation'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-white bg-[#0a152e]'
          }`}
        >
          <Zap className="w-4 h-4 text-[#00f0ff]" />
          <span>Automatizaciones &amp; Webhooks ({automationRules.length})</span>
        </button>
      </div>

      {/* TAB 1: DISPATCH QUEUE */}
      {activeAdminTab === 'dispatch' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-[#0a152e] rounded-3xl border border-blue-500/20 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-blue-500/20 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00f0ff]" />
                Cola de Solicitudes en Tiempo Real (B2B &amp; B2C)
              </h3>
              <span className="text-xs text-slate-400">Actualizado hace un momento</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#060b18] text-slate-400 font-bold uppercase tracking-wider border-b border-blue-500/20">
                  <tr>
                    <th className="p-4">ID Orden</th>
                    <th className="p-4">Cliente / Tipo</th>
                    <th className="p-4">Servicio Técnico</th>
                    <th className="p-4">Especialista Asignado</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Monto</th>
                    <th className="p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/10">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-[#0f2042]/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#00f0ff]">{order.id}</td>
                      <td className="p-4">
                        <span className="font-bold text-white block">{order.customerName}</span>
                        <span className="text-[10px] text-slate-400">{order.address}</span>
                      </td>
                      <td className="p-4 font-medium text-slate-200">{order.serviceName}</td>
                      <td className="p-4">
                        <span className="font-semibold text-white block">{order.technician?.name || 'Sin asignar'}</span>
                        <span className="text-[10px] text-slate-400">{order.technician?.vehicle}</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="bg-[#060b18] border border-blue-500/30 rounded-xl px-2.5 py-1 text-xs text-white font-semibold focus:outline-none focus:border-[#00f0ff]"
                        >
                          <option value="solicitado">Solicitado</option>
                          <option value="tecnico_asignado">Técnico Asignado</option>
                          <option value="en_camino">En Camino</option>
                          <option value="en_sitio">En Sitio</option>
                          <option value="completado">Completado</option>
                        </select>
                      </td>
                      <td className="p-4 font-mono font-bold text-[#00f0ff]">${order.priceTotal} USD</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleStatusChange(order.id, 'completado')}
                          className="px-3 py-1 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold border border-emerald-500/40"
                        >
                          Completar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Technicians Fleet Cards - Los 5 Nodos de QuintoNodo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <span>Equipo de Despacho QuintoNodo (5 Especialistas Activos)</span>
                <span className="bg-cyan-950 text-[#00f0ff] border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">5 NODOS</span>
              </h3>
              <span className="text-xs text-slate-400">GPS y Despacho en Tiempo Real</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {techs.map(tech => (
                <div key={tech.id} className="bg-[#0a152e] p-4 rounded-3xl border border-blue-500/25 shadow-lg space-y-3 flex flex-col justify-between hover:border-cyan-400/50 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <img src={tech.avatar} alt={tech.name} className="w-12 h-12 rounded-2xl object-cover border border-cyan-500/40 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-xs truncate">{tech.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mt-0.5">{tech.title}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-semibold">{tech.plate || 'BPT-Bogotá'}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                          tech.status === 'en_camino' 
                            ? 'bg-cyan-950 text-[#00f0ff] border border-cyan-500/40 animate-pulse'
                            : tech.status === 'en_sitio'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {tech.status === 'en_camino' ? 'En Camino' : tech.status === 'en_sitio' ? 'En Sitio' : 'Disponible'}
                        </span>
                      </div>
                      <span className="text-cyan-300 font-medium block truncate">{tech.vehicle}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 border-t border-blue-500/15 pt-2 flex justify-between items-center">
                    <span>Servicios: <b className="text-white">{tech.jobsCompleted}</b></span>
                    <span>Rating: <b className="text-amber-400">{tech.rating} ★</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ACTIVE SUBSCRIPTION CONTRACTS */}
      {activeAdminTab === 'subscriptions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUBSCRIPTION_TIERS.slice(0, 3).map(tier => (
              <div key={tier.id} className="bg-[#0a152e] p-6 rounded-3xl border border-blue-500/20 shadow-xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-base text-white">{tier.name}</h4>
                    <p className="text-xs text-cyan-300 font-bold">{tier.range}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-950 text-[#00f0ff] font-mono font-bold text-xs border border-cyan-500/30">
                    ${tier.priceMonthly}/m
                  </span>
                </div>
                <p className="text-xs text-slate-400">{tier.target}</p>
                <div className="p-3 bg-[#060b18] rounded-xl border border-blue-500/15 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">SLA Remoto:</span>
                    <span className="text-white font-bold">{tier.slaRemote}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SLA en Sitio:</span>
                    <span className="text-white font-bold">{tier.slaOnsite}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATION RULES & LOGS */}
      {activeAdminTab === 'automation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automationRules.map(rule => (
              <div key={rule.id} className="bg-[#0a152e] p-5 rounded-3xl border border-blue-500/20 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">{rule.name}</h4>
                  <span className="text-[10px] text-cyan-400 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-500/30">
                    {rule.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{rule.description}</p>
                <div className="text-[10px] text-slate-500 flex justify-between pt-2 border-t border-blue-500/10">
                  <span>Ejecuciones: {rule.triggersCount}</span>
                  <span>Última vez: {rule.lastTriggered}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#060b18] p-5 rounded-3xl border border-blue-500/20 font-mono text-xs space-y-2">
            <span className="text-[#00f0ff] font-bold block mb-2">Registro de Webhooks en Vivo:</span>
            {automationLogs.map(log => (
              <div key={log.id} className="text-slate-300">
                <span className="text-slate-500 mr-2">[{log.timestamp}]</span>
                <span className="text-emerald-400 font-bold mr-2">&lt;{log.ruleName}&gt;</span>
                <span>{log.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
