// Catálogo oficial de inventario de repuestos, insumos y licencias de Blueprint by QuintoNodo
// Permite calcular costos, márgenes brutos y descontar stock automáticamente en tickets técnicos

export const INITIAL_INVENTORY = [
  // Repuestos Móviles (B2C & B2B)
  {
    id: 'INV-SCR-IP15P',
    sku: 'BPT-SCR-01',
    name: 'Pantalla OLED Super Retina iPhone 15 Pro (TrueTone IC)',
    category: 'Pantallas Móviles',
    brand: 'Apple',
    stock: 8,
    minStock: 3,
    unitCostCOP: 280000,
    salePriceCOP: 480000,
    unitCostUSD: 70,
    salePriceUSD: 120,
    location: 'Cajón Lab 01 - Daniel Rozo',
    supplier: 'Importador Directo San Andresito / iFix Global'
  },
  {
    id: 'INV-SCR-IP13',
    sku: 'BPT-SCR-02',
    name: 'Pantalla OLED iPhone 13 / 14 con Transferidor de Eprom',
    category: 'Pantallas Móviles',
    brand: 'Apple',
    stock: 12,
    minStock: 4,
    unitCostCOP: 180000,
    salePriceCOP: 330000,
    unitCostUSD: 45,
    salePriceUSD: 82,
    location: 'Cajón Lab 01 - Daniel Rozo',
    supplier: 'Importador Directo San Andresito / iFix Global'
  },
  {
    id: 'INV-SCR-SAM-S23',
    sku: 'BPT-SCR-03',
    name: 'Pantalla Dynamic AMOLED 2X Samsung Galaxy S23 con Marco',
    category: 'Pantallas Móviles',
    brand: 'Samsung',
    stock: 6,
    minStock: 2,
    unitCostCOP: 260000,
    salePriceCOP: 440000,
    unitCostUSD: 65,
    salePriceUSD: 110,
    location: 'Cajón Lab 02',
    supplier: 'Samsung Parts Andina'
  },
  {
    id: 'INV-BAT-IP14',
    sku: 'BPT-BAT-01',
    name: 'Batería Original 3279 mAh iPhone 14 (Salud 100% Sin Mensaje)',
    category: 'Baterías',
    brand: 'Apple',
    stock: 15,
    minStock: 5,
    unitCostCOP: 65000,
    salePriceCOP: 150000,
    unitCostUSD: 16,
    salePriceUSD: 38,
    location: 'Cajón Lab 03',
    supplier: 'Distribuidora Baterías CellCol'
  },
  {
    id: 'INV-BAT-S22',
    sku: 'BPT-BAT-02',
    name: 'Batería Original Samsung Galaxy S22 3700 mAh',
    category: 'Baterías',
    brand: 'Samsung',
    stock: 10,
    minStock: 3,
    unitCostCOP: 55000,
    salePriceCOP: 130000,
    unitCostUSD: 14,
    salePriceUSD: 32,
    location: 'Cajón Lab 03',
    supplier: 'Samsung Parts Andina'
  },
  {
    id: 'INV-FLEX-CHG',
    sku: 'BPT-CHG-01',
    name: 'Módulo Flex Puerto de Carga Type-C / Lightning universal',
    category: 'Puertos & Conectores',
    brand: 'Multimarca',
    stock: 24,
    minStock: 8,
    unitCostCOP: 25000,
    salePriceCOP: 75000,
    unitCostUSD: 6,
    salePriceUSD: 19,
    location: 'Cajón Lab 04',
    supplier: 'Repuestos Bogotá Express'
  },

  // Insumos & Componentes de Cómputo (B2B & Gamers)
  {
    id: 'INV-SSD-1TB-NVME',
    sku: 'BPT-SSD-01',
    name: 'SSD Kingston NV2 1TB PCIe 4.0 NVMe M.2 3500MB/s',
    category: 'Almacenamiento',
    brand: 'Kingston',
    stock: 14,
    minStock: 4,
    unitCostCOP: 195000,
    salePriceCOP: 310000,
    unitCostUSD: 49,
    salePriceUSD: 78,
    location: 'Bodega Cómputo - Juan Aguirre',
    supplier: 'Mayorista MPS / Unilago Tech'
  },
  {
    id: 'INV-RAM-16GB-DDR4',
    sku: 'BPT-RAM-01',
    name: 'Memoria RAM Crucial / Kingston 16GB DDR4 3200MHz Laptop/Desktop',
    category: 'Memorias',
    brand: 'Crucial',
    stock: 18,
    minStock: 5,
    unitCostCOP: 110000,
    salePriceCOP: 190000,
    unitCostUSD: 28,
    salePriceUSD: 48,
    location: 'Bodega Cómputo - Juan Aguirre',
    supplier: 'Mayorista Nexsys'
  },
  {
    id: 'INV-PASTE-KRYONAUT',
    sku: 'BPT-THM-01',
    name: 'Pasta Térmica Industrial Thermal Grizzly Kryonaut 5.5g',
    category: 'Insumos Térmicos',
    brand: 'Thermal Grizzly',
    stock: 9,
    minStock: 3,
    unitCostCOP: 65000,
    salePriceCOP: 120000,
    unitCostUSD: 16,
    salePriceUSD: 30,
    location: 'Maletín Nodo Móvil 01 & 05',
    supplier: 'Overclockers Colombia'
  },
  {
    id: 'INV-NET-CAT6-BOX',
    sku: 'BPT-NET-01',
    name: 'Caja Bobina Cable UTP Cat6 100% Cobre 305m Furukawa/Panduit',
    category: 'Redes & Cableado',
    brand: 'Furukawa',
    stock: 4,
    minStock: 2,
    unitCostCOP: 380000,
    salePriceCOP: 560000,
    unitCostUSD: 95,
    salePriceUSD: 140,
    location: 'Taller Central - Miguel',
    supplier: 'Distribuidora Redes & Voz'
  },

  // Licenciamiento Oficial de Software (Entrega Digital)
  {
    id: 'INV-LIC-M365-BUS',
    sku: 'BPT-LIC-01',
    name: 'Licencia Microsoft 365 Business Standard (Anual ESD)',
    category: 'Software Corporativo',
    brand: 'Microsoft',
    stock: 25,
    minStock: 5,
    unitCostCOP: 440000,
    salePriceCOP: 580000,
    unitCostUSD: 110,
    salePriceUSD: 145,
    location: 'Bóveda Digital - Nicolás Zequeda',
    supplier: 'Ingram Micro Colombia CSP'
  },
  {
    id: 'INV-LIC-KAS-CLOUD',
    sku: 'BPT-LIC-02',
    name: 'Kaspersky Endpoint Security Cloud (Por Puesto / Anual)',
    category: 'Ciberseguridad',
    brand: 'Kaspersky',
    stock: 40,
    minStock: 10,
    unitCostCOP: 95000,
    salePriceCOP: 168000,
    unitCostUSD: 24,
    salePriceUSD: 42,
    location: 'Bóveda Digital - Nicolás Zequeda',
    supplier: 'Mayorista Nexsys Seguridad'
  },
  {
    id: 'INV-LIC-WIN11-PRO',
    sku: 'BPT-LIC-03',
    name: 'Licencia Original Windows 11 Pro Retail / OEM Permanente',
    category: 'Software Corporativo',
    brand: 'Microsoft',
    stock: 30,
    minStock: 8,
    unitCostCOP: 70000,
    salePriceCOP: 140000,
    unitCostUSD: 18,
    salePriceUSD: 35,
    location: 'Bóveda Digital - Nicolás Zequeda',
    supplier: 'Mayorista MPS Licenciamiento'
  }
];

// Datos de sondeo de mercado profundo en Colombia para benchmarks de precios y rentabilidad
export const MARKET_BENCHMARK_DATA = {
  currency: 'COP',
  lastSurveyDate: 'Octubre 2026',
  sectors: [
    {
      sector: 'Reparación Express de Celulares (B2C / Pymes)',
      description: 'Basado en precios de Unilago, Carrera 15, Sanandresito y centros de servicio oficiales en Bogotá D.C.',
      services: [
        {
          name: 'Cambio Pantalla iPhone 13/14 OLED',
          competitorMin: 280000,
          competitorMax: 420000,
          competitorAvg: 350000,
          blueprintPrice: 330000,
          blueprintCost: 180000,
          grossMarginPercent: 45.5,
          positioning: 'Altamente competitivo con garantía escrita 6 meses y TrueTone calibrado'
        },
        {
          name: 'Batería Original iPhone / Samsung',
          competitorMin: 120000,
          competitorMax: 190000,
          competitorAvg: 160000,
          blueprintPrice: 150000,
          blueprintCost: 65000,
          grossMarginPercent: 56.7,
          positioning: 'Excelente margen con celda grado A y sin mensaje de batería desconocida'
        },
        {
          name: 'Mantenimiento Preventivo Cómputo (Térmico + Limpieza)',
          competitorMin: 70000,
          competitorMax: 130000,
          competitorAvg: 95000,
          blueprintPrice: 85000,
          blueprintCost: 15000,
          grossMarginPercent: 82.3,
          positioning: 'Servicio anzuelo para captar usuarios domésticos y convertir a Pymes'
        }
      ]
    },
    {
      sector: 'Mantenimiento y Soporte Corporativo IT B2B',
      description: 'Comparativo frente a outsourcing tradicional de soporte tecnológico en Colombia.',
      services: [
        {
          name: 'Mantenimiento Preventivo por Puesto Corporativo',
          competitorMin: 120000,
          competitorMax: 220000,
          competitorAvg: 170000,
          blueprintPrice: 140000,
          blueprintCost: 25000,
          grossMarginPercent: 82.1,
          positioning: 'Precio por volumen muy competitivo con informe PDF de auditoría incluido'
        },
        {
          name: 'Plan Mensual Pyme Starter (Hasta 10 Equipos)',
          competitorMin: 600000,
          competitorMax: 1100000,
          competitorAvg: 850000,
          blueprintPrice: 750000,
          blueprintCost: 150000,
          grossMarginPercent: 80.0,
          positioning: 'Suscripción recurrente (MRR) con SLA < 2 horas garantizado por contrato'
        },
        {
          name: 'Mantenimiento Preventivo Servidor / Storage Rack',
          competitorMin: 350000,
          competitorMax: 650000,
          competitorAvg: 480000,
          blueprintPrice: 420000,
          blueprintCost: 50000,
          grossMarginPercent: 88.1,
          positioning: 'Especialista Juan Aguirre certificado en infraestructura física y virtual'
        }
      ]
    }
  ],
  operationalExpensesEstimate: {
    monthlyFuelAndTransitCOP: 450000, // Desplazamiento motos/carros técnicos
    toolsDepreciationCOP: 180000,     // Estaciones de soldadura, multímetros, programadores
    softwareStackCOP: 120000,         // Hosting, dominios, licencias soporte
    monthlyTargetRevenueCOP: 8500000, // Meta mensual equipo inicial
    projectedNetOperatingMarginPercent: 58.4 // Margen neto estimado tras costos fijos
  }
};
