-- ============================================================================
-- BLUEPRINT BY QUINTONODO TECH - ESQUEMA INTEGRAL SUPABASE / POSTGRESQL 15+
-- Sede Oficial: Bogotá, D.C. | WhatsApp Oficial: +57 321 228 8097
-- Instrucciones: Copia y ejecuta este script completo en Supabase -> SQL Editor
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE ESPECIALISTAS TÉCNICOS (LOS 5 NODOS QUINTONODO)
CREATE TABLE IF NOT EXISTS public.technicians (
  id TEXT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  title VARCHAR(180) NOT NULL,
  node_badge VARCHAR(60) NOT NULL,
  phone VARCHAR(30) NOT NULL DEFAULT '+57 321 228 8097',
  avatar TEXT,
  vehicle VARCHAR(120),
  plate VARCHAR(20),
  lat DOUBLE PRECISION DEFAULT 4.6780,
  lng DOUBLE PRECISION DEFAULT -74.0560,
  portfolio JSONB DEFAULT '[]'::jsonb,
  role VARCHAR(50) DEFAULT 'tecnico',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA DE SOLICITUDES PÚBLICAS WEB (PORTAL CLIENTES EN VERCEL)
CREATE TABLE IF NOT EXISTS public.public_orders (
  id VARCHAR(30) PRIMARY KEY,
  ticket_code VARCHAR(40) UNIQUE NOT NULL,
  service_type VARCHAR(60) NOT NULL,
  service_name VARCHAR(220) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(120),
  address VARCHAR(220),
  phone VARCHAR(40),
  urgency VARCHAR(80),
  price_total_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_total_cop NUMERIC(14,2) NOT NULL DEFAULT 0,
  status VARCHAR(40) DEFAULT 'tecnico_asignado',
  eta_minutes INTEGER DEFAULT 40,
  payment_method VARCHAR(120),
  notes TEXT,
  rating INTEGER,
  technician_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE MESA DE AYUDA Y SOPORTE REMOTO EN VIVO (SINCRONIZACIÓN CLIENTE <-> TÉCNICO)
CREATE TABLE IF NOT EXISTS public.remote_sessions (
  id VARCHAR(30) PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  company VARCHAR(150),
  issue TEXT NOT NULL,
  remote_tool VARCHAR(60) DEFAULT 'AnyDesk',
  connection_id VARCHAR(80),
  status VARCHAR(40) DEFAULT 'esperando_tecnico',
  assigned_tech JSONB,
  messages JSONB DEFAULT '[]'::jsonb,
  logs JSONB DEFAULT '[]'::jsonb,
  created_label VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA CONFIDENCIAL DE INVENTARIO DE REPUESTOS Y LICENCIAS (SOLO PORTAL PRIVADO)
CREATE TABLE IF NOT EXISTS public.inventory (
  id VARCHAR(60) PRIMARY KEY,
  sku VARCHAR(40) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(80) NOT NULL,
  brand VARCHAR(60) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock INTEGER NOT NULL DEFAULT 2,
  unit_cost_cop NUMERIC(14,2) NOT NULL DEFAULT 0,
  sale_price_cop NUMERIC(14,2) NOT NULL DEFAULT 0,
  unit_cost_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  location VARCHAR(120),
  supplier VARCHAR(150),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA INTERNA DE TICKETS DE TALLER Y LABORATORIO (SOLO PORTAL PRIVADO)
CREATE TABLE IF NOT EXISTS public.tickets (
  id VARCHAR(30) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(40) NOT NULL,
  customer_email VARCHAR(120),
  customer_type VARCHAR(10) DEFAULT 'B2C' CHECK (customer_type IN ('B2C', 'B2B')),
  company_nit VARCHAR(40),
  device_brand VARCHAR(60) NOT NULL,
  device_model VARCHAR(120) NOT NULL,
  serial_imei VARCHAR(60),
  reported_fault TEXT NOT NULL,
  technical_diagnostic TEXT,
  status VARCHAR(40) DEFAULT 'recibido' CHECK (status IN ('recibido', 'diagnostico', 'espera_repuesto', 'en_reparacion', 'control_calidad', 'listo_entrega', 'facturado_cobrado')),
  technician_id TEXT REFERENCES public.technicians(id) ON DELETE SET NULL,
  technician_name VARCHAR(120),
  urgency VARCHAR(60) DEFAULT 'Normal',
  parts_used JSONB DEFAULT '[]'::jsonb,
  parts_cost_cop NUMERIC(14,2) DEFAULT 0,
  labor_cost_cop NUMERIC(14,2) DEFAULT 0,
  total_price_cop NUMERIC(14,2) NOT NULL DEFAULT 0,
  payment_status VARCHAR(30) DEFAULT 'pendiente' CHECK (payment_status IN ('pendiente', 'pagado_wompi', 'pagado_bold', 'transferencia', 'efectivo')),
  payment_gateway VARCHAR(80),
  warranty_days INTEGER DEFAULT 90,
  notes TEXT,
  is_simulation BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA DE REPUESTOS CONSUMIDOS POR TICKET
CREATE TABLE IF NOT EXISTS public.ticket_parts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id VARCHAR(30) REFERENCES public.tickets(id) ON DELETE CASCADE,
  inventory_id VARCHAR(60) REFERENCES public.inventory(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost_cop NUMERIC(14,2) NOT NULL,
  unit_sale_cop NUMERIC(14,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. LIBRO MAYOR FINANCIERO (AUDITORÍA INTERNA)
CREATE TABLE IF NOT EXISTS public.financial_ledger (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id VARCHAR(30) REFERENCES public.tickets(id) ON DELETE SET NULL,
  concept VARCHAR(200) NOT NULL,
  amount_cop NUMERIC(14,2) NOT NULL,
  amount_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  type VARCHAR(30) NOT NULL CHECK (type IN ('ingreso', 'costo_repuesto', 'gasto_operativo')),
  payment_gateway VARCHAR(60),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_public_orders_created ON public.public_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_remote_sessions_status ON public.remote_sessions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_technician ON public.tickets(technician_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory(sku);

-- ============================================================================
-- SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remote_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica de especialistas" ON public.technicians;
CREATE POLICY "Lectura publica de especialistas"
  ON public.technicians FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Actualizacion de portafolio de especialistas" ON public.technicians;
CREATE POLICY "Actualizacion de portafolio de especialistas"
  ON public.technicians FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Creacion y seguimiento de ordenes web" ON public.public_orders;
CREATE POLICY "Creacion y seguimiento de ordenes web"
  ON public.public_orders FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sincronizacion de soporte remoto en vivo" ON public.remote_sessions;
CREATE POLICY "Sincronizacion de soporte remoto en vivo"
  ON public.remote_sessions FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso interno autenticado a inventario" ON public.inventory;
CREATE POLICY "Acceso interno autenticado a inventario"
  ON public.inventory FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso interno autenticado a tickets" ON public.tickets;
CREATE POLICY "Acceso interno autenticado a tickets"
  ON public.tickets FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso interno autenticado a repuestos de ticket" ON public.ticket_parts;
CREATE POLICY "Acceso interno autenticado a repuestos de ticket"
  ON public.ticket_parts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso interno autenticado a finanzas" ON public.financial_ledger;
CREATE POLICY "Acceso interno autenticado a finanzas"
  ON public.financial_ledger FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SEMILLA OFICIAL: LOS 5 NODOS DE QUINTONODO TECH (WHATSAPP +57 321 228 8097)
-- ============================================================================
INSERT INTO public.technicians (id, name, title, node_badge, phone, avatar, vehicle, plate, lat, lng, role)
VALUES
  ('tech-1', 'Juan Aguirre', 'Director Técnico • Infraestructura y Servidores B2B', 'Nodo Móvil #01', '+57 321 228 8097', '', 'Nodo Móvil Blueprint #01', 'BPT-101 Bogotá', 4.6780, -74.0560, 'director_tecnico'),
  ('tech-2', 'Daniel Rozo', 'Especialista en Reparación Móvil y Microsoldadura', 'Nodo Lab Móvil #02', '+57 321 228 8097', '', 'Nodo Lab Móvil Blueprint #02', 'BPT-202 Bogotá', 4.6980, -74.0840, 'especialista_movil'),
  ('tech-3', 'Nicolás Zequeda', 'Ingeniero de Ciberseguridad y Licenciamiento', 'Nodo Móvil #03', '+57 321 228 8097', '', 'Nodo Móvil Blueprint #03', 'BPT-303 Bogotá', 4.6550, -74.0620, 'ciberseguridad'),
  ('tech-4', 'Juan Diego Barreto', 'Ingeniero de Soporte Remoto y Nube', 'Centro Remoto #04', '+57 321 228 8097', '', 'Centro Remoto Blueprint #04', 'BPT-404 Bogotá', 4.6670, -74.0480, 'soporte_remoto'),
  ('tech-5', 'Miguel', 'Especialista de Campo • Hardware, Redes y Cableado', 'Nodo Móvil #05', '+57 321 228 8097', '', 'Nodo Móvil Blueprint #05', 'BPT-505 Bogotá', 4.6880, -74.0710, 'tecnico_campo')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  phone = EXCLUDED.phone,
  vehicle = EXCLUDED.vehicle,
  plate = EXCLUDED.plate,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  updated_at = timezone('utc'::text, now());
