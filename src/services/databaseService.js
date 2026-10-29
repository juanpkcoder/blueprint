// Servicio Integral de Base de Datos y Persistencia para Blueprint by QuintoNodo Tech
// Soporta Modo Local Offline + Conexión directa con Supabase (PostgreSQL en la nube)
// Gestiona Tickets Blueprint OS, Inventario de Repuestos, Sincronización WhatsApp y Balances Financieros

import { INITIAL_INVENTORY, MARKET_BENCHMARK_DATA } from '../data/inventoryData';
import { INITIAL_TECHNICIANS } from '../data/mockData';

const STORAGE_KEYS = {
  TICKETS: 'blueprint_tickets_v1',
  INVENTORY: 'blueprint_inventory_v1',
  CONFIG: 'blueprint_db_config_v1',
  FINANCES: 'blueprint_financial_ledger_v1'
};

// Generador de Tickets Blueprint OS
export const BLUEPRINT_STATUSES = [
  { id: 'recibido', label: '1. Recibido / Ingreso', color: 'bg-blue-900/60 text-cyan-300 border-cyan-500/40' },
  { id: 'diagnostico', label: '2. En Diagnóstico', color: 'bg-purple-900/60 text-purple-300 border-purple-500/40' },
  { id: 'espera_repuesto', label: '3. Espera de Repuesto', color: 'bg-amber-900/60 text-amber-300 border-amber-500/40' },
  { id: 'en_reparacion', label: '4. En Reparación / Lab', color: 'bg-indigo-900/60 text-indigo-300 border-indigo-500/40' },
  { id: 'control_calidad', label: '5. Pruebas / QA', color: 'bg-teal-900/60 text-teal-300 border-teal-500/40' },
  { id: 'listo_entrega', label: '6. Listo para Entrega', color: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40' },
  { id: 'facturado_cobrado', label: '7. Facturado / Cobrado', color: 'bg-slate-800 text-slate-300 border-slate-600' }
];

// Scripts SQL listos para crear la arquitectura de tablas en PostgreSQL (Supabase) con 1 clic
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- BLUEPRINT BY QUINTONODO TECH - ESQUEMA DE BASE DE DATOS
-- Compatible con Supabase / PostgreSQL estándar
-- ========================================================

-- 1. Tabla de Inventario y Repuestos
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 2,
  unit_cost_cop NUMERIC(12,2) NOT NULL,
  sale_price_cop NUMERIC(12,2) NOT NULL,
  location TEXT,
  supplier TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Técnicos Nodos QuintoNodo
CREATE TABLE IF NOT EXISTS technicians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle TEXT,
  plate TEXT,
  rating NUMERIC(3,2) DEFAULT 5.0,
  jobs_completed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'disponible'
);

-- 3. Tabla Principal de Tickets Blueprint OS
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_type TEXT DEFAULT 'B2C', -- 'B2C' o 'B2B'
  company_nit TEXT,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  serial_imei TEXT,
  reported_fault TEXT NOT NULL,
  technical_diagnostic TEXT,
  status TEXT DEFAULT 'recibido',
  technician_id TEXT REFERENCES technicians(id),
  urgency TEXT DEFAULT 'Normal',
  parts_cost_cop NUMERIC(12,2) DEFAULT 0,
  labor_cost_cop NUMERIC(12,2) DEFAULT 0,
  total_price_cop NUMERIC(12,2) NOT NULL,
  payment_status TEXT DEFAULT 'pendiente', -- 'pendiente', 'pagado_wompi', 'pagado_bold', 'transferencia', 'efectivo'
  warranty_days INTEGER DEFAULT 90,
  notes TEXT
);

-- 4. Tabla de Repuestos Consumidos por Ticket
CREATE TABLE IF NOT EXISTS ticket_parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT REFERENCES tickets(id) ON DELETE CASCADE,
  inventory_id TEXT REFERENCES inventory(id),
  quantity INTEGER NOT NULL,
  unit_cost_cop NUMERIC(12,2) NOT NULL,
  unit_sale_cop NUMERIC(12,2) NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Finanzas e Ingresos Diarios
CREATE TABLE IF NOT EXISTS financial_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id TEXT REFERENCES tickets(id),
  concept TEXT NOT NULL,
  amount_cop NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL, -- 'ingreso', 'costo_repuesto', 'gasto_operativo'
  payment_gateway TEXT, -- 'wompi', 'bold', 'bancolombia_pse', 'efectivo'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
`;

// Tickets iniciales simulados Blueprint OS con repuestos y técnicos asignados
const INITIAL_BLUEPRINT_TICKETS = [
  {
    id: 'TKT-BPT-10492',
    createdAt: '2026-10-26 14:30',
    customerName: 'Carolina Méndez',
    customerPhone: '+573124567890',
    customerEmail: 'carolina.mendez@gmail.com',
    customerType: 'B2C',
    companyNit: '',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 15 Pro Max',
    serialImei: '358921094821948',
    reportedFault: 'Pantalla partida sin touch tras caída, vidrio trasero estrellado.',
    technicalDiagnostic: 'Módulo OLED con líneas verdes y flex táctil desgarrado. Batería al 89%. Requiere cambio de panel OLED grado original y calibración TrueTone.',
    status: 'en_reparacion',
    technicianId: 'tech-2', // Daniel Rozo
    technicianName: 'Daniel Rozo (Especialista Móvil)',
    urgency: 'Express (< 60m)',
    partsUsed: [
      {
        inventoryId: 'INV-SCR-IP15P',
        name: 'Pantalla OLED Super Retina iPhone 15 Pro',
        quantity: 1,
        unitCostCOP: 280000,
        unitSaleCOP: 480000
      }
    ],
    laborCostCOP: 120000,
    partsCostCOP: 280000,
    totalPriceCOP: 600000,
    grossMarginCOP: 320000,
    grossMarginPercent: 53.3,
    paymentStatus: 'pendiente',
    paymentGateway: 'Wompi / Nequi',
    warrantyDays: 180,
    notes: 'Cliente autorizó reparación inmediata en sitio con Nodo Móvil #02.'
  },
  {
    id: 'TKT-BPT-10493',
    createdAt: '2026-10-26 11:15',
    customerName: 'Fintech Andina S.A.S.',
    customerPhone: '+573185559021',
    customerEmail: 'it@fintechandina.co',
    customerType: 'B2B',
    companyNit: '901.458.291-3',
    deviceBrand: 'Dell & Lenovo',
    deviceModel: 'Servidor PowerEdge R740 + 8 ThinkPad T14',
    serialImei: 'SVR-DELL-89412',
    reportedFault: 'Mantenimiento preventivo bimensual programado y cambio de pasta térmica por alerta de temperatura en rack principal.',
    technicalDiagnostic: 'Acumulación de polvo en disipadores de cobre del servidor. Temperaturas superando 82°C. Se realizó mantenimiento con soplado antiestático y pasta térmica Kryonaut.',
    status: 'listo_entrega',
    technicianId: 'tech-1', // Juan Aguirre
    technicianName: 'Juan Aguirre (Infraestructura B2B)',
    urgency: 'Programada SLA',
    partsUsed: [
      {
        inventoryId: 'INV-PASTE-KRYONAUT',
        name: 'Pasta Térmica Industrial Kryonaut 5.5g',
        quantity: 2,
        unitCostCOP: 130000,
        unitSaleCOP: 240000
      }
    ],
    laborCostCOP: 460000,
    partsCostCOP: 130000,
    totalPriceCOP: 700000,
    grossMarginCOP: 570000,
    grossMarginPercent: 81.4,
    paymentStatus: 'pagado_wompi',
    paymentGateway: 'Wompi PSE Bancolombia',
    warrantyDays: 90,
    notes: 'Generada certificación técnica para auditoría de calidad ISO.'
  },
  {
    id: 'TKT-BPT-10494',
    createdAt: '2026-10-26 09:00',
    customerName: 'Agencia Digital Nexus',
    customerPhone: '+573108884433',
    customerEmail: 'operaciones@nexusdigital.co',
    customerType: 'B2B',
    companyNit: '900.874.120-1',
    deviceBrand: 'Microsoft & Cloud',
    deviceModel: 'Flota 15 Laptops Corporativos',
    serialImei: 'LIC-VOL-2026-NEX',
    reportedFault: 'Solicitud de activación masiva de 15 licencias Microsoft 365 Business Standard y configuración de políticas de correo.',
    technicalDiagnostic: 'Migración exitosa desde Google Workspace hacia tenant Microsoft 365. Cuentas aprovisionadas y licencias vinculadas con doble factor de autenticación.',
    status: 'facturado_cobrado',
    technicianId: 'tech-3', // Nicolás Zequeda
    technicianName: 'Nicolás Zequeda (Ciberseguridad)',
    urgency: 'Prioritaria',
    partsUsed: [
      {
        inventoryId: 'INV-LIC-M365-BUS',
        name: 'Licencia Microsoft 365 Business Standard (x15)',
        quantity: 15,
        unitCostCOP: 6600000,
        unitSaleCOP: 8700000
      }
    ],
    laborCostCOP: 650000,
    partsCostCOP: 6600000,
    totalPriceCOP: 9350000,
    grossMarginCOP: 2750000,
    grossMarginPercent: 29.4,
    paymentStatus: 'pagado_wompi',
    paymentGateway: 'Wompi Facturación B2B',
    warrantyDays: 365,
    notes: 'Factura electrónica emitida y radicada ante la DIAN.'
  },
  {
    id: 'TKT-BPT-10495',
    createdAt: '2026-10-26 16:45',
    customerName: 'Andrés Felipe Morales',
    customerPhone: '+573007654321',
    customerEmail: 'andres.felipe.m@outlook.com',
    customerType: 'B2C',
    companyNit: '',
    deviceBrand: 'Samsung',
    deviceModel: 'Galaxy S23 Ultra',
    serialImei: '354890123776654',
    reportedFault: 'Batería dura menos de 4 horas, se apaga al 20%. Puerto de carga no sostiene cable rápido.',
    technicalDiagnostic: 'Ciclos de batería superan los 870 ciclos con salud real en 68%. Puerto USB-C con sulfato y pines doblados. Requiere batería nueva y flex de carga.',
    status: 'diagnostico',
    technicianId: 'tech-5', // Miguel
    technicianName: 'Miguel (Técnico de Campo)',
    urgency: 'Express (< 60m)',
    partsUsed: [
      {
        inventoryId: 'INV-BAT-S22',
        name: 'Batería Original Samsung Galaxy S22/S23',
        quantity: 1,
        unitCostCOP: 55000,
        unitSaleCOP: 130000
      },
      {
        inventoryId: 'INV-FLEX-CHG',
        name: 'Módulo Flex Puerto Type-C Rápido',
        quantity: 1,
        unitCostCOP: 25000,
        unitSaleCOP: 75000
      }
    ],
    laborCostCOP: 75000,
    partsCostCOP: 80000,
    totalPriceCOP: 280000,
    grossMarginCOP: 200000,
    grossMarginPercent: 71.4,
    paymentStatus: 'pendiente',
    paymentGateway: 'Bold Datáfono / Transferencia',
    warrantyDays: 90,
    notes: 'Presupuesto enviado por WhatsApp al cliente a la espera de confirmación.'
  }
];

class DatabaseService {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading db config:', e);
    }
    return {
      provider: 'local', // 'local' | 'supabase'
      supabaseUrl: '',
      supabaseAnonKey: '',
      isConnected: false,
      lastSync: new Date().toISOString()
    };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig, lastSync: new Date().toISOString() };
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save db config:', e);
    }
    return this.config;
  }

  // ====== TICKETS BLUEPRINT OS ======
  getTickets() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error fetching tickets:', e);
    }
    // Si no hay datos, inicializamos con los tickets base
    this.saveTickets(INITIAL_BLUEPRINT_TICKETS);
    return INITIAL_BLUEPRINT_TICKETS;
  }

  saveTickets(tickets) {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch (e) {
      console.error('Error saving tickets:', e);
    }
  }

  createTicket(ticketData) {
    const tickets = this.getTickets();
    const nextNum = Math.floor(10500 + Math.random() * 4900);
    const newTicket = {
      id: `TKT-BPT-${nextNum}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'recibido',
      partsUsed: [],
      partsCostCOP: 0,
      laborCostCOP: Number(ticketData.laborCostCOP || 60000),
      totalPriceCOP: Number(ticketData.totalPriceCOP || 120000),
      grossMarginCOP: Number(ticketData.totalPriceCOP || 120000) - Number(ticketData.laborCostCOP || 60000),
      grossMarginPercent: 50,
      paymentStatus: 'pendiente',
      warrantyDays: 90,
      ...ticketData
    };
    const updated = [newTicket, ...tickets];
    this.saveTickets(updated);
    return newTicket;
  }

  updateTicketStatus(ticketId, newStatus, technicianNotes = '') {
    const tickets = this.getTickets();
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          notes: technicianNotes ? `${t.notes ? t.notes + '\n' : ''}[${new Date().toLocaleTimeString()}]: ${technicianNotes}` : t.notes,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });
    this.saveTickets(updated);
    return updated.find(t => t.id === ticketId);
  }

  assignTechnician(ticketId, techId, techName) {
    const tickets = this.getTickets();
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          technicianId: techId,
          technicianName: techName,
          status: t.status === 'recibido' ? 'diagnostico' : t.status
        };
      }
      return t;
    });
    this.saveTickets(updated);
    return updated.find(t => t.id === ticketId);
  }

  // Consume repuesto del inventario y lo añade a la hoja de costos del ticket
  addPartToTicket(ticketId, inventoryId, quantity = 1) {
    const inventory = this.getInventory();
    const part = inventory.find(i => i.id === inventoryId);
    if (!part) throw new Error('Repuesto no encontrado en inventario');
    if (part.stock < quantity) throw new Error(`Stock insuficiente. Disponible: ${part.stock}`);

    // Descontar inventario
    this.updateStock(inventoryId, -quantity);

    // Actualizar ticket
    const tickets = this.getTickets();
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        const existingPartIndex = (t.partsUsed || []).findIndex(p => p.inventoryId === inventoryId);
        let newPartsUsed = [...(t.partsUsed || [])];

        if (existingPartIndex >= 0) {
          newPartsUsed[existingPartIndex].quantity += quantity;
        } else {
          newPartsUsed.push({
            inventoryId: part.id,
            name: part.name,
            quantity: quantity,
            unitCostCOP: part.unitCostCOP,
            unitSaleCOP: part.salePriceCOP
          });
        }

        const partsCostCOP = newPartsUsed.reduce((acc, p) => acc + (p.unitCostCOP * p.quantity), 0);
        const partsSaleCOP = newPartsUsed.reduce((acc, p) => acc + (p.unitSaleCOP * p.quantity), 0);
        const totalPriceCOP = (t.laborCostCOP || 0) + partsSaleCOP;
        const grossMarginCOP = totalPriceCOP - partsCostCOP;
        const grossMarginPercent = totalPriceCOP > 0 ? Number(((grossMarginCOP / totalPriceCOP) * 100).toFixed(1)) : 0;

        return {
          ...t,
          partsUsed: newPartsUsed,
          partsCostCOP,
          totalPriceCOP,
          grossMarginCOP,
          grossMarginPercent
        };
      }
      return t;
    });

    this.saveTickets(updatedTickets);
    return updatedTickets.find(t => t.id === ticketId);
  }

  // ====== INVENTARIO ======
  getInventory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading inventory:', e);
    }
    this.saveInventory(INITIAL_INVENTORY);
    return INITIAL_INVENTORY;
  }

  saveInventory(inventory) {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) {
      console.error('Error saving inventory:', e);
    }
  }

  updateStock(itemId, deltaQuantity) {
    const inventory = this.getInventory();
    const updated = inventory.map(item => {
      if (item.id === itemId) {
        const newStock = Math.max(0, item.stock + deltaQuantity);
        return { ...item, stock: newStock };
      }
      return item;
    });
    this.saveInventory(updated);
    return updated;
  }

  // ====== MÉTRICAS FINANCIERAS Y RENTABILIDAD ======
  getFinancialMetrics() {
    const tickets = this.getTickets();
    const inventory = this.getInventory();

    const totalRevenueCOP = tickets.reduce((sum, t) => sum + (t.totalPriceCOP || 0), 0);
    const totalPartsCostCOP = tickets.reduce((sum, t) => sum + (t.partsCostCOP || 0), 0);
    const totalLaborRevenueCOP = tickets.reduce((sum, t) => sum + (t.laborCostCOP || 0), 0);
    const totalGrossProfitCOP = totalRevenueCOP - totalPartsCostCOP;
    const overallGrossMarginPercent = totalRevenueCOP > 0 ? Number(((totalGrossProfitCOP / totalRevenueCOP) * 100).toFixed(1)) : 0;

    const inventoryAssetValueCOP = inventory.reduce((sum, item) => sum + (item.stock * item.unitCostCOP), 0);
    const inventoryPotentialSaleCOP = inventory.reduce((sum, item) => sum + (item.stock * item.salePriceCOP), 0);

    // Ingresos y servicios por técnico
    const technicianPerformance = INITIAL_TECHNICIANS.map(tech => {
      const techTickets = tickets.filter(t => t.technicianId === tech.id);
      const techRevenue = techTickets.reduce((sum, t) => sum + (t.totalPriceCOP || 0), 0);
      const techLabor = techTickets.reduce((sum, t) => sum + (t.laborCostCOP || 0), 0);
      return {
        techId: tech.id,
        name: tech.name,
        role: tech.title,
        avatar: tech.avatar,
        ticketsCount: techTickets.length,
        totalRevenueCOP: techRevenue,
        laborRevenueCOP: techLabor
      };
    });

    return {
      totalRevenueCOP,
      totalPartsCostCOP,
      totalLaborRevenueCOP,
      totalGrossProfitCOP,
      overallGrossMarginPercent,
      inventoryAssetValueCOP,
      inventoryPotentialSaleCOP,
      technicianPerformance,
      benchmarks: MARKET_BENCHMARK_DATA
    };
  }

  // ====== INTEGRACIÓN WHATSAPP (WPP) ======
  // Genera un enlace de WhatsApp Web / Móvil con mensaje pre-redactado profesional según el estado del ticket
  buildWhatsAppUrl(ticket, type = 'cliente') {
    const phone = ticket.customerPhone ? ticket.customerPhone.replace(/[^0-9]/g, '') : '573100000000';
    let text = '';

    const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

    if (type === 'cliente') {
      switch (ticket.status) {
        case 'recibido':
          text = `👋 Hola *${ticket.customerName}*, te saluda *Blueprint by QuintoNodo Tech*.\n\nHemos recibido formalmente tu equipo *${ticket.deviceBrand} ${ticket.deviceModel}* para servicio técnico con el ticket oficial: *#${ticket.id}*.\n\n📋 *Falla reportada:* ${ticket.reportedFault}\n👨‍💻 *Especialista:* ${ticket.technicianName || 'Por asignar'}\n\nTe notificaremos en cuanto finalice el diagnóstico de laboratorio. ¡Gracias por confiar en Blueprint!`;
          break;

        case 'diagnostico':
          text = `🔬 *Informe de Diagnóstico - Blueprint Tech*\nTicket: *#${ticket.id}*\nEquipo: *${ticket.deviceBrand} ${ticket.deviceModel}*\n\n👨‍🔬 *Diagnóstico Técnico:* ${ticket.technicalDiagnostic || 'Revisión técnica en proceso.'}\n💰 *Presupuesto Estimado:* ${formatCurrency(ticket.totalPriceCOP)}\n\n¿Autorizas el inicio de la intervención express?`;
          break;

        case 'espera_repuesto':
          text = `📦 *Actualización de Estado - Blueprint Tech*\nTicket: *#${ticket.id}*\nEquipo: *${ticket.deviceBrand} ${ticket.deviceModel}*\n\nTu equipo se encuentra en fase de aprovisionamiento de repuesto original con proveedor certificado. Te avisaremos apenas comience el ensamble.`;
          break;

        case 'en_reparacion':
          text = `⚡ *Intervención Técnica en Proceso - Blueprint Tech*\nTicket: *#${ticket.id}*\nEquipo: *${ticket.deviceBrand} ${ticket.deviceModel}*\n\nNuestro especialista *${ticket.technicianName}* está trabajando en tu equipo en este momento. Tiempo estimado para pruebas: < 45 minutos.`;
          break;

        case 'control_calidad':
          text = `🧪 *Pruebas de Calidad - Blueprint Tech*\nTicket: *#${ticket.id}*\nEquipo: *${ticket.deviceBrand} ${ticket.deviceModel}*\n\nIntervención completada. Estamos ejecutando el protocolo de pruebas de hardware y TrueTone/sensores para garantizar el 100% de operatividad.`;
          break;

        case 'listo_entrega':
          text = `✅ *¡Tu equipo está LISTO para entrega! - Blueprint Tech*\nTicket: *#${ticket.id}*\nEquipo: *${ticket.deviceBrand} ${ticket.deviceModel}*\n\n💵 *Total a liquidar:* ${formatCurrency(ticket.totalPriceCOP)}\n🛡️ *Garantía oficial:* ${ticket.warrantyDays} días por escrito.\n\nPuedes pagar mediante Wompi (Nequi, PSE, Tarjeta) o Datáfono Bold.`;
          break;

        default:
          text = `👋 Hola *${ticket.customerName}*, te contactamos desde *Blueprint by QuintoNodo Tech* respecto a tu solicitud de servicio técnico *#${ticket.id}*. ¿Cómo podemos colaborarte hoy?`;
      }
    } else {
      // Mensaje de despacho directo para el técnico
      text = `🚨 *ASIGNACIÓN DE SERVICIO - NODO TÉCNICO*\nTicket: *#${ticket.id}*\nCliente: *${ticket.customerName}* (${ticket.customerPhone})\nTipo: *${ticket.customerType}* | Urgencia: *${ticket.urgency}*\nEquipo: *${ticket.deviceBrand} ${ticket.deviceModel}*\nFalla: *${ticket.reportedFault}*`;
    }

    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  }

  // ====== RUT & FACTURACIÓN ELECTRÓNICA DIAN (COLOMBIA) ======
  getRUTDetails() {
    return {
      entity: 'Blueprint by QuintoNodo Tech S.A.S. (En Formación / Régimen Simple)',
      ciiuCodes: [
        {
          code: '9511',
          activity: 'Mantenimiento y reparación de computadores y de equipo periférico',
          description: 'Cubre mantenimiento de PCs de escritorio, servidores en rack, portátiles y redes corporativas.'
        },
        {
          code: '9512',
          activity: 'Mantenimiento y reparación de equipos de comunicación',
          description: 'Cubre reparación de teléfonos inteligentes, celulares, tablets y radios de comunicación.'
        },
        {
          code: '6202',
          activity: 'Actividades de consultoría informática y administración de instalaciones informáticas',
          description: 'Cubre contratos de suscripción IT, auditorías de ciberseguridad y soporte remoto empresarial.'
        },
        {
          code: '4741',
          activity: 'Comercio al por menor de computadores, periféricos, programas de informática y equipos de telecomunicaciones',
          description: 'Cubre la venta oficial de licencias de software (Microsoft, Kaspersky) y repuestos originales.'
        }
      ],
      paymentGateways: [
        {
          name: 'Wompi (Bancolombia)',
          badge: 'Recomendado Colombia',
          methods: 'Nequi, Botón Bancolombia, PSE, Tarjetas Visa/Mastercard',
          rate: '2.65% + $700 COP + IVA',
          setupTime: '24 a 48 horas con RUT',
          status: 'Activo / Integrable'
        },
        {
          name: 'Bold Datáfono & Link',
          badge: 'Ideal en Sitio / Campo',
          methods: 'Datáfono móvil para técnicos en moto/carro + Link de pago',
          rate: '2.99% + $900 COP',
          setupTime: 'Inmediata',
          status: 'Activo / Nodos Móviles'
        },
        {
          name: 'Transferencia Directa Nequi / Bancolombia',
          badge: 'Cero Comisión',
          methods: 'QR Interoperable Redeban / Bre-B / Llave Bancolombia',
          rate: '0% Comisión',
          setupTime: 'Inmediata',
          status: 'Activo'
        }
      ]
    };
  }
}

export const dbService = new DatabaseService();
