import React, { useState, useEffect } from 'react';
import { 
  Wrench, ClipboardList, Package, MessageCircle, 
  Search, Plus, TrendingUp, Database, ChevronRight, 
  User, Copy, Check, RefreshCw, CreditCard, FileText, Sparkles
} from 'lucide-react';
import { dbService, BLUEPRINT_STATUSES, SUPABASE_SQL_SCHEMA } from '../services/databaseService';
import { INITIAL_TECHNICIANS } from '../data/mockData';
import { playSoundEffect } from '../utils/soundEffects';

export const TechDashboard = () => {
  const [subTab, setSubTab] = useState('tickets'); // 'tickets' | 'inventory' | 'finance' | 'rut_payments' | 'database'
  const [tickets, setTickets] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Drawers
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [ticketToAddPart, setTicketToAddPart] = useState(null);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQuantity, setPartQuantity] = useState(1);
  const [isSqlCopied, setIsSqlCopied] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // DB Config state
  const [dbConfig, setDbConfig] = useState(dbService.config);
  const [tempSupabaseUrl, setTempSupabaseUrl] = useState(dbService.config.supabaseUrl || '');
  const [tempSupabaseKey, setTempSupabaseKey] = useState(dbService.config.supabaseAnonKey || '');

  // Form state for New Ticket
  const [newTicketForm, setNewTicketForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerType: 'B2C',
    companyNit: '',
    deviceBrand: 'Apple',
    deviceModel: '',
    serialImei: '',
    reportedFault: '',
    technicianId: 'tech-2',
    urgency: 'Express (< 60m)',
    laborCostCOP: 80000,
    totalPriceCOP: 150000
  });

  // Load initial data
  const refreshData = () => {
    setTickets(dbService.getTickets());
    setInventory(dbService.getInventory());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showNotification = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 3500);
  };

  const handleStatusChange = (ticketId, newStatus) => {
    dbService.updateTicketStatus(ticketId, newStatus);
    refreshData();
    playSoundEffect('status_update');
    showNotification(`Ticket actualizado a: ${newStatus.replace('_', ' ').toUpperCase()}`);
  };

  const handleAssignTech = (ticketId, techId) => {
    const tech = INITIAL_TECHNICIANS.find(t => t.id === techId);
    if (tech) {
      dbService.assignTechnician(ticketId, tech.id, tech.name);
      refreshData();
      playSoundEffect('tech_assigned');
      showNotification(`Especialista asignado: ${tech.name}`);
    }
  };

  const handleCreateNewTicket = (e) => {
    e.preventDefault();
    if (!newTicketForm.customerName || !newTicketForm.deviceModel || !newTicketForm.reportedFault) {
      alert('Por favor completa los campos requeridos: Cliente, Modelo de Equipo y Falla.');
      return;
    }

    const tech = INITIAL_TECHNICIANS.find(t => t.id === newTicketForm.technicianId);
    dbService.createTicket({
      ...newTicketForm,
      technicianName: tech ? tech.name : 'Juan Aguirre'
    });

    setIsNewTicketOpen(false);
    refreshData();
    playSoundEffect('order_created');
    showNotification('¡Nuevo ticket registrado en la base de datos!');

    // Reset form
    setNewTicketForm({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerType: 'B2C',
      companyNit: '',
      deviceBrand: 'Apple',
      deviceModel: '',
      serialImei: '',
      reportedFault: '',
      technicianId: 'tech-2',
      urgency: 'Express (< 60m)',
      laborCostCOP: 80000,
      totalPriceCOP: 150000
    });
  };

  const handleAddPartSubmit = (e) => {
    e.preventDefault();
    if (!selectedPartId || !ticketToAddPart) return;

    try {
      dbService.addPartToTicket(ticketToAddPart.id, selectedPartId, Number(partQuantity));
      refreshData();
      setIsAddPartModalOpen(false);
      setTicketToAddPart(null);
      setSelectedPartId('');
      setPartQuantity(1);
      playSoundEffect('pop_high');
      showNotification('Repuesto descontado de inventario y cargado al ticket.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStockAdjust = (itemId, delta) => {
    dbService.updateStock(itemId, delta);
    refreshData();
    playSoundEffect('pop_mid');
  };

  const handleSaveDbConfig = () => {
    const updated = dbService.saveConfig({
      provider: tempSupabaseUrl ? 'supabase' : 'local',
      supabaseUrl: tempSupabaseUrl,
      supabaseAnonKey: tempSupabaseKey,
      isConnected: !!tempSupabaseUrl
    });
    setDbConfig(updated);
    showNotification(tempSupabaseUrl ? 'Conexión a Supabase configurada con éxito.' : 'Operando en Modo Base de Datos Local Sincronizada.');
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setIsSqlCopied(true);
    setTimeout(() => setIsSqlCopied(false), 3000);
    showNotification('¡Esquema SQL copiado al portapapeles!');
  };

  const formatCOP = (amount) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(amount || 0);
  };

  const financials = dbService.getFinancialMetrics();
  const rutData = dbService.getRUTDetails();

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.technicianName && t.technicianName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-blue-700 to-[#00f0ff] text-[#060b18] px-5 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top Banner: Dashboard de Técnicos & Base de Datos */}
      <div className="bg-gradient-to-r from-[#0a152e] via-[#0b1b3a] to-[#081226] p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex items-center space-x-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-[#0070f3] to-[#00f0ff] p-[2px] shadow-xl shadow-cyan-500/25 shrink-0">
            <div className="w-full h-full bg-[#060b18] rounded-[14px] flex items-center justify-center">
              <Wrench className="w-8 h-8 text-[#00f0ff] animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Portal de Técnicos &amp; Laboratorio QuintoNodo
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-[#00f0ff] border border-cyan-500/40 text-[10px] font-black uppercase">
                BLUEPRINT CORE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Control de tickets técnicos, inventario de repuestos, enlace WPP directo y base de datos propia
            </p>
          </div>
        </div>

        {/* Global KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto z-10">
          <div className="bg-[#060b18]/80 p-3 rounded-2xl border border-blue-500/20 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Tickets Activos</span>
            <span className="text-xl font-black text-[#00f0ff]">
              {tickets.filter(t => t.status !== 'facturado_cobrado').length}
            </span>
          </div>

          <div className="bg-[#060b18]/80 p-3 rounded-2xl border border-blue-500/20 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Stock Repuestos</span>
            <span className="text-xl font-black text-amber-400">
              {inventory.reduce((acc, i) => acc + i.stock, 0)} uds
            </span>
          </div>

          <div className="bg-[#060b18]/80 p-3 rounded-2xl border border-blue-500/20 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Margen Promedio</span>
            <span className="text-xl font-black text-emerald-400">
              {financials.overallGrossMarginPercent}%
            </span>
          </div>

          <div className="bg-[#060b18]/80 p-3 rounded-2xl border border-blue-500/20 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Base de Datos</span>
            <span className="text-xs font-black text-cyan-300 flex items-center justify-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {dbConfig.provider === 'supabase' ? 'Supabase Cloud' : 'Local / Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-blue-500/20 pb-3 overflow-x-auto [scrollbar-width:none]">
        <button
          onClick={() => setSubTab('tickets')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            subTab === 'tickets'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-white bg-[#0a152e]'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-[#00f0ff]" />
          <span>Tickets Blueprint OS ({tickets.length})</span>
        </button>

        <button
          onClick={() => setSubTab('inventory')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            subTab === 'inventory'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-white bg-[#0a152e]'
          }`}
        >
          <Package className="w-4 h-4 text-amber-400" />
          <span>Inventario de Repuestos &amp; Licencias ({inventory.length})</span>
        </button>

        <button
          onClick={() => setSubTab('finance')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            subTab === 'finance'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-white bg-[#0a152e]'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Finanzas, Rentabilidad &amp; Sondeo de Mercado</span>
        </button>

        <button
          onClick={() => setSubTab('rut_payments')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            subTab === 'rut_payments'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-white bg-[#0a152e]'
          }`}
        >
          <CreditCard className="w-4 h-4 text-purple-400" />
          <span>RUT &amp; Pasarelas (Wompi / Bold / PSE)</span>
        </button>

        <button
          onClick={() => setSubTab('database')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            subTab === 'database'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-white bg-[#0a152e]'
          }`}
        >
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Conexión Base de Datos &amp; SQL</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* PESTAÑA 1: SISTEMA DE TICKETS BLUEPRINT OS                     */}
      {/* ============================================================== */}
      {subTab === 'tickets' && (
        <div className="space-y-6">
          
          {/* Controls Bar: Search, Filters & Action Button */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0a152e] p-4 rounded-2xl border border-blue-500/20">
            <div className="flex flex-1 items-center space-x-3 bg-[#060b18] px-3.5 py-2 rounded-xl border border-blue-500/30">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar ticket por código, cliente, modelo de celular o técnico..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#060b18] border border-blue-500/30 text-xs text-white rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-[#00f0ff]"
              >
                <option value="all">Todos los estados</option>
                {BLUEPRINT_STATUSES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>

              <button
                onClick={() => setIsNewTicketOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:opacity-90 text-[#060b18] font-black text-xs flex items-center space-x-2 whitespace-nowrap shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4 text-[#060b18] stroke-[3]" />
                <span>Crear Ticket de Taller</span>
              </button>
            </div>
          </div>

          {/* Tickets Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredTickets.map(ticket => {
              const currentStatusObj = BLUEPRINT_STATUSES.find(s => s.id === ticket.status) || BLUEPRINT_STATUSES[0];
              const wppUrl = dbService.buildWhatsAppUrl(ticket, 'cliente');

              return (
                <div 
                  key={ticket.id} 
                  className="bg-[#0a152e] rounded-3xl border border-blue-500/20 hover:border-cyan-400/50 transition-all p-5 shadow-xl flex flex-col justify-between space-y-4"
                >
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-black text-[#00f0ff] tracking-wider">
                          #{ticket.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-cyan-300 border border-blue-500/30">
                          {ticket.customerType}
                        </span>
                        {ticket.urgency.includes('Express') && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse">
                            ⚡ Express
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-base mt-1">
                        {ticket.deviceBrand} {ticket.deviceModel}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Cliente: <b className="text-slate-200">{ticket.customerName}</b> • {ticket.customerPhone}
                      </p>
                    </div>

                    {/* WhatsApp Action Button */}
                    <a
                      href={wppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 shrink-0 transition-transform active:scale-95"
                      title="Enviar actualización formal al cliente por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Fault & Technical Diagnostic */}
                  <div className="bg-[#060b18] p-3.5 rounded-2xl border border-blue-500/15 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Falla Reportada por Cliente:
                      </span>
                      <p className="text-slate-200 font-medium">{ticket.reportedFault}</p>
                    </div>

                    {ticket.technicalDiagnostic && (
                      <div className="pt-2 border-t border-blue-500/10">
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                          Diagnóstico de Laboratorio:
                        </span>
                        <p className="text-slate-300">{ticket.technicalDiagnostic}</p>
                      </div>
                    )}
                  </div>

                  {/* Parts used breakdown */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-amber-400" />
                        Repuestos Asignados ({ticket.partsUsed?.length || 0}):
                      </span>
                      <button
                        onClick={() => {
                          setTicketToAddPart(ticket);
                          setIsAddPartModalOpen(true);
                        }}
                        className="text-[11px] font-bold text-[#00f0ff] hover:underline flex items-center gap-1"
                      >
                        + Consumir de Inventario
                      </button>
                    </div>

                    {ticket.partsUsed && ticket.partsUsed.length > 0 ? (
                      <div className="space-y-1">
                        {ticket.partsUsed.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] bg-[#060b18]/60 px-2.5 py-1 rounded-lg border border-blue-500/10">
                            <span className="text-slate-300 truncate max-w-[200px]">
                              {p.quantity}x {p.name}
                            </span>
                            <span className="text-[#00f0ff] font-mono font-bold">
                              {formatCOP(p.unitSaleCOP * p.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">Sin repuestos asignados aún.</p>
                    )}
                  </div>

                  {/* Financial & Technician Footer */}
                  <div className="pt-3 border-t border-blue-500/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Total Liquidado (Mano de obra + Partes)</span>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-lg font-black text-white font-mono">
                          {formatCOP(ticket.totalPriceCOP)}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-bold">
                          Margen: {ticket.grossMarginPercent || 50}% ({formatCOP(ticket.grossMarginCOP)})
                        </span>
                      </div>
                    </div>

                    {/* Status Changer Select */}
                    <div className="flex items-center space-x-2">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border focus:outline-none ${currentStatusObj.color}`}
                      >
                        {BLUEPRINT_STATUSES.map(s => (
                          <option key={s.id} value={s.id} className="bg-[#0a152e] text-white">
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Technician Assignment */}
                  <div className="flex items-center justify-between text-xs bg-[#060b18]/60 p-2.5 rounded-xl border border-blue-500/15">
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-cyan-300" />
                      <span className="text-slate-400">Técnico a cargo:</span>
                      <span className="font-bold text-white">{ticket.technicianName || 'Por asignar'}</span>
                    </div>

                    <select
                      value={ticket.technicianId || ''}
                      onChange={(e) => handleAssignTech(ticket.id, e.target.value)}
                      className="bg-[#0a152e] text-[11px] text-slate-200 border border-blue-500/30 rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#00f0ff]"
                    >
                      <option value="">Reasignar especialista...</option>
                      {INITIAL_TECHNICIANS.map(tech => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name} ({tech.title.split('•')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredTickets.length === 0 && (
            <div className="bg-[#0a152e] p-12 text-center rounded-3xl border border-blue-500/20 space-y-3">
              <ClipboardList className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-lg font-bold text-white">No se encontraron tickets con ese criterio</h4>
              <p className="text-xs text-slate-400">Prueba cambiando los filtros o crea un nuevo ticket de taller.</p>
            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 2: CONTROL DE INVENTARIO DE REPUESTOS & LICENCIAS      */}
      {/* ============================================================== */}
      {subTab === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-[#0a152e] p-6 rounded-3xl border border-blue-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                Catálogo de Inventario &amp; Control de Stock Técnico
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Pantallas OLED originales, baterías certificadas, pastas térmicas, NVMe y licencias de software oficial
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="bg-[#060b18] px-4 py-2.5 rounded-xl border border-blue-500/20">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Valor Inventario (Costo)</span>
                <span className="text-base font-black text-amber-400 font-mono">
                  {formatCOP(financials.inventoryAssetValueCOP)}
                </span>
              </div>
              <div className="bg-[#060b18] px-4 py-2.5 rounded-xl border border-blue-500/20">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Venta Proyectada</span>
                <span className="text-base font-black text-[#00f0ff] font-mono">
                  {formatCOP(financials.inventoryPotentialSaleCOP)}
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-[#0a152e] rounded-3xl border border-blue-500/20 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#060b18] text-slate-400 font-bold uppercase tracking-wider border-b border-blue-500/20">
                  <tr>
                    <th className="p-4">SKU / Repuesto</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Stock Actual</th>
                    <th className="p-4">Costo Compra</th>
                    <th className="p-4">Precio Venta</th>
                    <th className="p-4">Margen Bruto</th>
                    <th className="p-4">Ubicación / Lab</th>
                    <th className="p-4 text-center">Ajustar Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/10">
                  {inventory.map(item => {
                    const grossUnitProfit = item.salePriceCOP - item.unitCostCOP;
                    const marginPercent = ((grossUnitProfit / item.salePriceCOP) * 100).toFixed(1);
                    const isLowStock = item.stock <= item.minStock;

                    return (
                      <tr key={item.id} className="hover:bg-[#0f2042]/50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-[10px] text-cyan-400 block">{item.sku}</span>
                          <span className="font-bold text-white text-sm">{item.name}</span>
                          <span className="text-[10px] text-slate-400 block">{item.brand} • Prov: {item.supplier}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full bg-blue-950 text-slate-300 text-[10px] font-bold border border-blue-500/30">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className={`text-base font-black font-mono ${isLowStock ? 'text-red-400' : 'text-emerald-400'}`}>
                              {item.stock} uds
                            </span>
                            {isLowStock && (
                              <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 text-[9px] font-bold border border-red-500/40">
                                Stock Bajo
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">Mínimo sugerido: {item.minStock}</span>
                        </td>
                        <td className="p-4 font-mono text-slate-300 font-bold">{formatCOP(item.unitCostCOP)}</td>
                        <td className="p-4 font-mono text-[#00f0ff] font-black">{formatCOP(item.salePriceCOP)}</td>
                        <td className="p-4">
                          <span className="text-emerald-400 font-bold font-mono block">+{formatCOP(grossUnitProfit)}</span>
                          <span className="text-[10px] text-slate-400">{marginPercent}% de margen</span>
                        </td>
                        <td className="p-4 text-slate-300 font-medium text-[11px]">{item.location}</td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center space-x-1 bg-[#060b18] p-1 rounded-xl border border-blue-500/30">
                            <button
                              onClick={() => handleStockAdjust(item.id, -1)}
                              className="w-6 h-6 rounded-lg bg-blue-950 hover:bg-red-900 text-slate-300 hover:text-white font-bold flex items-center justify-center transition-colors"
                              title="Restar 1 unidad"
                            >
                              -
                            </button>
                            <span className="px-2 font-mono font-bold text-white">{item.stock}</span>
                            <button
                              onClick={() => handleStockAdjust(item.id, 1)}
                              className="w-6 h-6 rounded-lg bg-blue-950 hover:bg-emerald-900 text-slate-300 hover:text-white font-bold flex items-center justify-center transition-colors"
                              title="Sumar 1 unidad"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 3: FINANZAS, RENTABILIDAD & SONDEO DE MERCADO           */}
      {/* ============================================================== */}
      {subTab === 'finance' && (
        <div className="space-y-8">
          
          {/* Financial Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0a152e] p-5 rounded-3xl border border-blue-500/20 shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Ingresos Brutos Facturados</span>
              <p className="text-2xl font-black text-white font-mono">{formatCOP(financials.totalRevenueCOP)}</p>
              <span className="text-[10px] text-cyan-300">Total servicios B2B &amp; B2C</span>
            </div>

            <div className="bg-[#0a152e] p-5 rounded-3xl border border-blue-500/20 shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Costo Directo de Repuestos</span>
              <p className="text-2xl font-black text-amber-400 font-mono">{formatCOP(financials.totalPartsCostCOP)}</p>
              <span className="text-[10px] text-slate-400">Descontado automáticamente</span>
            </div>

            <div className="bg-[#0a152e] p-5 rounded-3xl border border-blue-500/20 shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Utilidad Bruta Operativa</span>
              <p className="text-2xl font-black text-emerald-400 font-mono">{formatCOP(financials.totalGrossProfitCOP)}</p>
              <span className="text-[10px] text-emerald-300 font-bold">Margen bruto: {financials.overallGrossMarginPercent}%</span>
            </div>

            <div className="bg-[#0a152e] p-5 rounded-3xl border border-blue-500/20 shadow-xl space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Mano de Obra Pura</span>
              <p className="text-2xl font-black text-[#00f0ff] font-mono">{formatCOP(financials.totalLaborRevenueCOP)}</p>
              <span className="text-[10px] text-cyan-300">Honorarios de especialistas</span>
            </div>
          </div>

          {/* Performance por Técnico Especialista */}
          <div className="bg-[#0a152e] p-6 rounded-3xl border border-blue-500/20 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00f0ff]" />
              Rendimiento &amp; Facturación por Especialista (Los 5 Nodos)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {financials.technicianPerformance.map(tech => (
                <div key={tech.techId} className="bg-[#060b18] p-4 rounded-2xl border border-blue-500/15 space-y-3">
                  <div className="flex items-center space-x-3">
                    <img src={tech.avatar} alt={tech.name} className="w-10 h-10 rounded-xl object-cover border border-cyan-500/30 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{tech.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{tech.role.split('•')[0]}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs border-t border-blue-500/10 pt-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tickets:</span>
                      <span className="text-white font-bold">{tech.ticketsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Facturación:</span>
                      <span className="text-[#00f0ff] font-bold">{formatCOP(tech.totalRevenueCOP)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mano de obra:</span>
                      <span className="text-emerald-400 font-bold">{formatCOP(tech.laborRevenueCOP)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SONDEO PROFUNDO DE MERCADO & BENCHMARKS COLOMBIA */}
          <div className="bg-[#0a152e] p-6 rounded-3xl border border-cyan-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-500/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">
                    Sondeo Profundo de Mercado, Rentabilidad y Benchmarks (Colombia)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                    Octubre 2026
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Comparativa de precios frente a Unilago, Carrera 15, outsourcing IT y centros de servicio oficiales
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Margen Neto Operativo Estimado</span>
                <span className="text-xl font-black text-emerald-400">
                  {financials.benchmarks.operationalExpensesEstimate.projectedNetOperatingMarginPercent}%
                </span>
              </div>
            </div>

            {/* Benchmark Sectors */}
            <div className="space-y-6">
              {financials.benchmarks.sectors.map((sec, idx) => (
                <div key={idx} className="space-y-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#00f0ff]">{sec.sector}</h4>
                    <p className="text-[11px] text-slate-400">{sec.description}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs bg-[#060b18] rounded-2xl overflow-hidden border border-blue-500/20">
                      <thead className="bg-[#040813] text-slate-400 font-bold uppercase text-[10px] border-b border-blue-500/20">
                        <tr>
                          <th className="p-3">Servicio Evaluado</th>
                          <th className="p-3">Rango Competencia</th>
                          <th className="p-3">Promedio Mercado</th>
                          <th className="p-3">Precio Blueprint</th>
                          <th className="p-3">Costo Directo</th>
                          <th className="p-3">Margen Bruto</th>
                          <th className="p-3">Estrategia Competitiva</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-500/10">
                        {sec.services.map((serv, sIdx) => (
                          <tr key={sIdx} className="hover:bg-[#0a152e]/40 transition-colors">
                            <td className="p-3 font-bold text-white">{serv.name}</td>
                            <td className="p-3 text-slate-400 font-mono">
                              {formatCOP(serv.competitorMin)} - {formatCOP(serv.competitorMax)}
                            </td>
                            <td className="p-3 text-amber-300 font-mono font-semibold">
                              {formatCOP(serv.competitorAvg)}
                            </td>
                            <td className="p-3 text-[#00f0ff] font-mono font-black text-sm">
                              {formatCOP(serv.blueprintPrice)}
                            </td>
                            <td className="p-3 text-slate-400 font-mono">
                              {formatCOP(serv.blueprintCost)}
                            </td>
                            <td className="p-3">
                              <span className="text-emerald-400 font-black font-mono">
                                {serv.grossMarginPercent}%
                              </span>
                            </td>
                            <td className="p-3 text-[11px] text-slate-300 max-w-xs leading-tight">
                              {serv.positioning}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen de Costos Operativos Fijos */}
            <div className="bg-[#060b18] p-4 rounded-2xl border border-blue-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Desplazamiento &amp; Combustible Nodos:</span>
                <span className="text-white font-mono font-bold">
                  {formatCOP(financials.benchmarks.operationalExpensesEstimate.monthlyFuelAndTransitCOP)} / mes
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Depreciación Equipos &amp; Herramientas:</span>
                <span className="text-white font-mono font-bold">
                  {formatCOP(financials.benchmarks.operationalExpensesEstimate.toolsDepreciationCOP)} / mes
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Meta de Ingreso Mensual QuintoNodo:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {formatCOP(financials.benchmarks.operationalExpensesEstimate.monthlyTargetRevenueCOP)} / mes
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 4: RUT & PASARELAS DE PAGO (WOMPI / BOLD / PSE)        */}
      {/* ============================================================== */}
      {subTab === 'rut_payments' && (
        <div className="space-y-8">
          
          {/* RUT Registration Advisory */}
          <div className="bg-[#0a152e] p-6 rounded-3xl border border-blue-500/20 shadow-xl space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Guía Oficial de Inscripción al RUT &amp; Actividades DIAN (Colombia)
                </h3>
                <p className="text-xs text-slate-300">
                  Requisitos legales y códigos CIIU requeridos para habilitar pasarelas de pago y facturación B2B
                </p>
              </div>
            </div>

            <div className="bg-[#060b18] p-4 rounded-2xl border border-blue-500/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300">
                  Códigos de Actividad Económica (CIIU) Obligatorios para Blueprint:
                </span>
                <span className="text-[10px] text-slate-400">Régimen Simple / Persona Natural con Actividad Comercial</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {rutData.ciiuCodes.map(c => (
                  <div key={c.code} className="bg-[#0a152e] p-3.5 rounded-xl border border-blue-500/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[#00f0ff] bg-blue-950 px-2 py-0.5 rounded border border-cyan-500/30">
                        CIIU {c.code}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(c.code);
                          showNotification(`Código CIIU ${c.code} copiado.`);
                        }}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copiar
                      </button>
                    </div>
                    <h5 className="font-bold text-white text-xs">{c.activity}</h5>
                    <p className="text-[11px] text-slate-400">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist Pasos DIAN */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-white block">Paso a paso para inscribir Blueprint en la DIAN:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#060b18] p-3 rounded-xl border border-blue-500/15 space-y-1">
                  <span className="font-black text-[#00f0ff]">1. Agendamiento Virtual DIAN</span>
                  <p className="text-[11px] text-slate-400">Ingresar a dian.gov.co con tu cédula y solicitar asignación de RUT con los CIIU 9511 y 9512.</p>
                </div>
                <div className="bg-[#060b18] p-3 rounded-xl border border-blue-500/15 space-y-1">
                  <span className="font-black text-[#00f0ff]">2. Descarga del PDF Formal</span>
                  <p className="text-[11px] text-slate-400">Obtener el RUT con marca de agua y firma digital que certifica no responsabilidad de IVA inicial.</p>
                </div>
                <div className="bg-[#060b18] p-3 rounded-xl border border-blue-500/15 space-y-1">
                  <span className="font-black text-[#00f0ff]">3. Vinculación a Pasarelas</span>
                  <p className="text-[11px] text-slate-400">Subir el PDF a Wompi o Bold junto con la certificación bancaria de Bancolombia o Nequi.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Pasarelas de Pago Colombia */}
          <div className="bg-[#0a152e] p-6 rounded-3xl border border-blue-500/20 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Pasarelas de Pago Integrables para Técnicos en Campo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rutData.paymentGateways.map((gw, idx) => (
                <div key={idx} className="bg-[#060b18] p-5 rounded-2xl border border-blue-500/20 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-white text-sm">{gw.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold">
                        {gw.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{gw.methods}</p>
                    <div className="bg-[#0a152e] p-2.5 rounded-xl border border-blue-500/10 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Comisión:</span>
                        <span className="text-[#00f0ff] font-bold">{gw.rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Aprobación:</span>
                        <span className="text-slate-200">{gw.setupTime}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      showNotification(`Enlace de cobro ${gw.name} listo para enviar al cliente.`);
                      playSoundEffect('pop_high');
                    }}
                    className="w-full py-2 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-white font-bold text-xs border border-blue-500/30 flex items-center justify-center space-x-1 transition-colors"
                  >
                    <span>Simular Link de Cobro</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA 5: BASE DE DATOS PROPIA (POSTGRESQL / SUPABASE)         */}
      {/* ============================================================== */}
      {subTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-[#0a152e] p-6 rounded-3xl border border-blue-500/20 shadow-xl space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-[#00f0ff] shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Conexión con Base de Datos Propia (PostgreSQL / Supabase)
                </h3>
                <p className="text-xs text-slate-300">
                  Configura tu base de datos en la nube para sincronizar tickets e inventario en tiempo real entre todos los técnicos
                </p>
              </div>
            </div>

            {/* Mode status */}
            <div className="bg-[#060b18] p-4 rounded-2xl border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                <div>
                  <h4 className="font-bold text-white text-xs">
                    Estado Actual: {dbConfig.provider === 'supabase' ? 'Conectado a Supabase PostgreSQL' : 'Modo Almacenamiento Local Sincronizado (Offline-Ready)'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {dbConfig.provider === 'supabase' 
                      ? 'Los tickets e inventario se almacenan y replican en tu clúster de Supabase en la nube.'
                      : 'Tus tickets e inventario se guardan en este dispositivo. Puedes enlazar Supabase abajo para conectar todos los celulares de los técnicos.'}
                  </p>
                </div>
              </div>

              <button
                onClick={refreshData}
                className="px-3 py-1.5 rounded-xl bg-blue-950 text-cyan-300 hover:text-white border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sincronizar Datos</span>
              </button>
            </div>

            {/* Supabase Connection Form */}
            <div className="space-y-3 bg-[#060b18] p-5 rounded-2xl border border-blue-500/15">
              <span className="text-xs font-extrabold text-white block">
                Conectar con Proyecto Supabase (Opcional):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={tempSupabaseUrl}
                    onChange={(e) => setTempSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full bg-[#0a152e] border border-blue-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    value={tempSupabaseKey}
                    onChange={(e) => setTempSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full bg-[#0a152e] border border-blue-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveDbConfig}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] text-[#060b18] font-black text-xs shadow-lg shadow-cyan-500/20 hover:opacity-95"
                >
                  Guardar Configuración de Conexión
                </button>
              </div>
            </div>

            {/* SQL Script for Supabase */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-white block">
                    Script SQL para Crear las Tablas en Supabase con 1 Clic
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Copia y pega este script en el SQL Editor de tu cuenta de Supabase
                  </span>
                </div>

                <button
                  onClick={copySqlSchema}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-[#00f0ff] border border-cyan-500/40 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  {isSqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isSqlCopied ? '¡Copiado!' : 'Copiar Script SQL'}</span>
                </button>
              </div>

              <pre className="bg-[#040813] p-4 rounded-2xl border border-blue-500/20 text-[11px] text-cyan-200 font-mono overflow-x-auto max-h-64 [scrollbar-width:thin]">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREAR NUEVO TICKET DE TALLER                           */}
      {/* ============================================================== */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0a152e] w-full max-w-2xl rounded-3xl border border-cyan-500/30 p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-[#00f0ff] flex items-center justify-center border border-cyan-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Crear Ticket de Servicio Blueprint OS</h3>
                  <p className="text-xs text-slate-400">Registro formal de equipo en laboratorio o solicitud en sitio</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="w-8 h-8 rounded-xl bg-blue-950 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewTicket} className="space-y-4 text-xs">
              
              {/* Customer data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nombre del Cliente / Empresa *</label>
                  <input
                    type="text"
                    required
                    value={newTicketForm.customerName}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerName: e.target.value })}
                    placeholder="Ej. Carolina Méndez / Empresa SAS"
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">WhatsApp de Contacto *</label>
                  <input
                    type="text"
                    required
                    value={newTicketForm.customerPhone}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerPhone: e.target.value })}
                    placeholder="+57 312 000 0000"
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              {/* Device data */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Marca</label>
                  <select
                    value={newTicketForm.deviceBrand}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, deviceBrand: e.target.value })}
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Apple">Apple iPhone / iPad / Mac</option>
                    <option value="Samsung">Samsung Galaxy</option>
                    <option value="Xiaomi">Xiaomi / Redmi / POCO</option>
                    <option value="Dell / Lenovo">Dell / Lenovo / HP</option>
                    <option value="Servidor / Red">Servidor / Rack / Switch</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Modelo de Dispositivo *</label>
                  <input
                    type="text"
                    required
                    value={newTicketForm.deviceModel}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, deviceModel: e.target.value })}
                    placeholder="Ej. iPhone 15 Pro Max"
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Serial o IMEI</label>
                  <input
                    type="text"
                    value={newTicketForm.serialImei}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, serialImei: e.target.value })}
                    placeholder="3589..."
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              {/* Reported fault */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Falla Reportada por el Cliente *</label>
                <textarea
                  required
                  rows={2}
                  value={newTicketForm.reportedFault}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, reportedFault: e.target.value })}
                  placeholder="Detalla lo que manifiesta el cliente (pantalla rota, reinicios continuos, lentitud, etc.)"
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              {/* Technician & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Especialista Asignado</label>
                  <select
                    value={newTicketForm.technicianId}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, technicianId: e.target.value })}
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {INITIAL_TECHNICIANS.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.title.split('•')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Urgencia / SLA</label>
                  <select
                    value={newTicketForm.urgency}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, urgency: e.target.value })}
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Express (< 60m)">⚡ Express (&lt; 60m)</option>
                    <option value="Mismo Día (< 4h)">Mismo Día (&lt; 4h)</option>
                    <option value="Programada SLA">Programada Contrato SLA</option>
                  </select>
                </div>
              </div>

              {/* Financial estimate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Mano de Obra Estimada (COP)</label>
                  <input
                    type="number"
                    value={newTicketForm.laborCostCOP}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, laborCostCOP: Number(e.target.value) })}
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Presupuesto Total Estimado al Cliente (COP)</label>
                  <input
                    type="number"
                    value={newTicketForm.totalPriceCOP}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, totalPriceCOP: Number(e.target.value) })}
                    className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3 py-2 text-[#00f0ff] font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-blue-500/20">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 rounded-xl bg-blue-950 text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] text-[#060b18] font-black shadow-lg shadow-cyan-500/20 hover:opacity-95"
                >
                  Generar Ticket Oficial
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CONSUMIR REPUESTO DE INVENTARIO Y CARGAR A TICKET       */}
      {/* ============================================================== */}
      {isAddPartModalOpen && ticketToAddPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0a152e] w-full max-w-lg rounded-3xl border border-cyan-500/30 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <div>
                <h4 className="font-extrabold text-white text-sm">
                  Consumir Repuesto para Ticket #{ticketToAddPart.id}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {ticketToAddPart.deviceBrand} {ticketToAddPart.deviceModel} • {ticketToAddPart.customerName}
                </p>
              </div>
              <button
                onClick={() => setIsAddPartModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-blue-950 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPartSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Seleccionar Repuesto del Inventario:</label>
                <select
                  required
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="">Selecciona un repuesto disponible...</option>
                  {inventory.filter(i => i.stock > 0).map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Stock: {i.stock} | Venta: {formatCOP(i.salePriceCOP)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Cantidad a Usar:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={partQuantity}
                  onChange={(e) => setPartQuantity(e.target.value)}
                  className="w-full bg-[#060b18] border border-blue-500/30 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="bg-[#060b18] p-3 rounded-xl border border-blue-500/15 text-[11px] text-slate-300">
                Al confirmar, el repuesto se descontará automáticamente del stock general y se sumará a los costos del ticket, recalculando el margen de ganancia neto en tiempo real.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPartModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-blue-950 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedPartId}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold"
                >
                  Cargar al Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
