// Datos de Catálogo para Blueprint by QuintoNodo Tech (Soporte IT Corporativo, Reparación Móvil y Suscripciones Empresariales)

// Genera un avatar local con iniciales en SVG (sin dependencias de imágenes externas)
const makeAvatar = (initials, from, to) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="128" height="128" rx="28" fill="url(#g)"/><text x="64" y="78" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="800" fill="#060b18" text-anchor="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Equipo QuintoNodo: los 5 nodos de soporte especializado de Blueprint
export const INITIAL_TECHNICIANS = [
  {
    id: 'tech-1',
    name: 'Juan Aguirre',
    title: 'Director Técnico • Infraestructura y Servidores B2B',
    rating: 4.97,
    jobsCompleted: 412,
    avatar: makeAvatar('JA', '#00f0ff', '#0070f3'),
    vehicle: 'Nodo Móvil Blueprint #01',
    plate: 'BPT-101 Bogotá',
    phone: '+57 310 000 0101',
    lat: 4.6780,
    lng: -74.0560,
    status: 'en_camino',
    serviceTypes: ['mantenimiento_b2b'],
    skills: ['Mantenimiento de Flotas B2B', 'Servidores Windows/Linux', 'Contratos con SLA', 'Arquitectura IT'],
    portfolio: [
      {
        id: 'port-101',
        title: 'Mantenimiento Preventivo de Clúster de Servidores Dell PowerEdge R740',
        category: 'Infraestructura y Servidores',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
        description: 'Limpieza ultrasónica de ventiladores, aplicación de compuesto térmico industrial Arctic MX-6 y verificación de arreglo RAID 10.',
        date: '2026-10-20'
      },
      {
        id: 'port-102',
        title: 'Organización y Certificación de Rack Categoría 6A para Sector Financiero',
        category: 'Redes y Cableado',
        imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
        description: 'Estructuración de cableado en gabinete de 42U con conmutadores Cisco Catalyst 9200.',
        date: '2026-10-14'
      }
    ]
  },
  {
    id: 'tech-2',
    name: 'Daniel Rozo',
    title: 'Especialista en Reparación Móvil y Microsoldadura',
    rating: 4.98,
    jobsCompleted: 356,
    avatar: makeAvatar('DR', '#38bdf8', '#1d4ed8'),
    vehicle: 'Nodo Lab Móvil Blueprint #02',
    plate: 'BPT-202 Bogotá',
    phone: '+57 310 000 0202',
    lat: 4.6980,
    lng: -74.0840,
    status: 'en_sitio',
    serviceTypes: ['reparacion_movil'],
    skills: ['Pantallas OLED iPhone y Samsung', 'Microsoldadura SMD/BGA', 'Baterías Certificadas', 'Recuperación por Humedad'],
    portfolio: [
      {
        id: 'port-201',
        title: 'Reemplazo de Pantalla OLED Super Retina en iPhone 15 Pro Max',
        category: 'Reparación Móvil',
        imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=800',
        description: 'Instalación de panel OLED de grado original, transferencia de calibración True Tone y sellado hermético IP68.',
        date: '2026-10-22'
      },
      {
        id: 'port-202',
        title: 'Microsoldadura de Circuito Integrado de Carga bajo Microscopio',
        category: 'Microsoldadura',
        imageUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800',
        description: 'Reconstrucción de pistas afectadas por humedad y reemplazo de circuito integrado de gestión de carga.',
        date: '2026-10-18'
      }
    ]
  },
  {
    id: 'tech-3',
    name: 'Nicolás Zequeda',
    title: 'Ingeniero de Ciberseguridad y Licenciamiento',
    rating: 4.95,
    jobsCompleted: 298,
    avatar: makeAvatar('NZ', '#34d399', '#0e7490'),
    vehicle: 'Nodo Móvil Blueprint #03',
    plate: 'BPT-303 Bogotá',
    phone: '+57 310 000 0303',
    lat: 4.6550,
    lng: -74.0620,
    status: 'disponible',
    serviceTypes: ['licencias_software'],
    skills: ['Kaspersky y Bitdefender', 'Microsoft 365', 'Auditoría de Seguridad', 'Activación de Flotas'],
    portfolio: [
      {
        id: 'port-301',
        title: 'Despliegue EDR de Kaspersky Cloud para Flota de 45 Estaciones',
        category: 'Ciberseguridad',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
        description: 'Implementación de consola centralizada en la nube con políticas activas de prevención contra ransomware.',
        date: '2026-10-19'
      }
    ]
  },
  {
    id: 'tech-4',
    name: 'Juan Diego Barreto',
    title: 'Ingeniero de Soporte Remoto y Nube',
    rating: 4.94,
    jobsCompleted: 331,
    avatar: makeAvatar('JB', '#a78bfa', '#4f46e5'),
    vehicle: 'Centro Remoto Blueprint #04',
    plate: 'BPT-404 Bogotá',
    phone: '+57 310 000 0404',
    lat: 4.6670,
    lng: -74.0480,
    status: 'disponible',
    serviceTypes: ['soporte_remoto'],
    skills: ['Soporte Remoto 24/7', 'Correo Corporativo y Teams', 'VPN y Redes', 'Optimización de Sistemas'],
    portfolio: [
      {
        id: 'port-401',
        title: 'Resolución Remota de Incidencia Crítica en Directorio Activo y VPN',
        category: 'Soporte Remoto',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
        description: 'Asistencia mediante túnel cifrado corporativo con restablecimiento seguro de políticas de acceso y DNS.',
        date: '2026-10-21'
      }
    ]
  },
  {
    id: 'tech-5',
    name: 'Miguel',
    title: 'Especialista de Campo • Hardware, Redes y Cableado',
    rating: 4.93,
    jobsCompleted: 274,
    avatar: makeAvatar('M', '#fbbf24', '#ea580c'),
    vehicle: 'Nodo Móvil Blueprint #05',
    plate: 'BPT-505 Bogotá',
    phone: '+57 310 000 0505',
    lat: 4.6880,
    lng: -74.0710,
    status: 'disponible',
    serviceTypes: ['mantenimiento_b2b', 'reparacion_movil'],
    skills: ['Diagnóstico en Sitio', 'Actualización SSD/RAM', 'Cableado Estructurado', 'Impresoras y Periféricos'],
    portfolio: [
      {
        id: 'port-501',
        title: 'Actualización Masiva de 18 Portátiles a SSD NVMe de 1 TB y 32 GB de RAM',
        category: 'Hardware y Mantenimiento',
        imageUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=800',
        description: 'Migración íntegra del sistema y aplicaciones contables sin interrupción operativa en estudio de arquitectura.',
        date: '2026-10-15'
      }
    ]
  }
];

export const SERVICE_CATEGORIES = [
  {
    id: 'mantenimiento_b2b',
    name: 'Mantenimiento IT Corporativo (B2B)',
    tagline: 'Servidores, Flotas de Cómputo y Redes Empresariales',
    description: 'Diagnóstico en tus instalaciones, limpieza interna profunda, aplicación de compuesto térmico de alto rendimiento, optimización de sistemas y pólizas de soporte.',
    icon: 'Building2',
    color: 'from-blue-600 to-indigo-700',
    basePrice: 45,
    options: [
      { id: 'maint_preventivo_flota', name: 'Mantenimiento Preventivo Integral por Estación de Trabajo', price: 45, time: '60 min/equipo', category: 'Hardware' },
      { id: 'maint_servidor', name: 'Mantenimiento Especializado de Servidores y Almacenamiento', price: 120, time: '2 horas', category: 'Infraestructura' },
      { id: 'maint_correctivo_urgente', name: 'Diagnóstico y Soporte Correctivo de Emergencia en Sitio', price: 65, time: '< 45 min', category: 'Emergencia' },
      { id: 'maint_upgrades_ssd', name: 'Actualización a Unidad SSD NVMe + Migración de Datos', price: 55, time: '90 min', category: 'Hardware' }
    ]
  },
  {
    id: 'reparacion_movil',
    name: 'Reparación Exprés de Celulares (B2C y B2B)',
    tagline: 'Pantallas OLED, Baterías, Cámaras y Microsoldadura',
    description: 'Servicio técnico especializado para iPhone, Samsung y Xiaomi a domicilio o en laboratorio central. Repuestos de grado original con 6 meses de garantía escrita.',
    icon: 'Smartphone',
    color: 'from-cyan-500 to-blue-600',
    basePrice: 35,
    options: [
      { id: 'rep_pantalla_oled', name: 'Cambio de Pantalla OLED / Super Retina con Calibración True Tone', price: 65, time: '40 min', category: 'Pantalla' },
      { id: 'rep_bateria_original', name: 'Reemplazo de Batería Certificada (Capacidad al 100 %)', price: 35, time: '30 min', category: 'Energía' },
      { id: 'rep_puerto_carga', name: 'Reparación de Puerto de Carga USB-C / Lightning', price: 28, time: '35 min', category: 'Carga' },
      { id: 'rep_rescate_agua', name: 'Limpieza Ultrasónica y Recuperación de Placa por Humedad', price: 50, time: '2 a 4 horas', category: 'Laboratorio' },
      { id: 'rep_camara_vidrio', name: 'Reemplazo de Módulo de Cámara y Sensores Ópticos', price: 30, time: '30 min', category: 'Óptica' }
    ]
  },
  {
    id: 'licencias_software',
    name: 'Licenciamiento de Software Oficial',
    tagline: 'Kaspersky, Bitdefender, Microsoft 365 y Windows Pro',
    description: 'Suscripciones 100 % originales con entrega digital inmediata, factura electrónica legal de la DIAN y asistencia remota para su activación.',
    icon: 'ShieldCheck',
    color: 'from-emerald-500 to-teal-600',
    basePrice: 25,
    options: [
      { id: 'kaspersky_cloud_b2b', name: 'Kaspersky Endpoint Security Cloud (Anual por Estación)', price: 42, time: 'Entrega digital inmediata', category: 'Ciberseguridad' },
      { id: 'kaspersky_total_sec', name: 'Kaspersky Total Security (1 Año / 3 Dispositivos)', price: 32, time: 'Entrega inmediata', category: 'Ciberseguridad' },
      { id: 'office_365_business', name: 'Microsoft 365 Business Standard (1 Año / 1 Usuario / 5 Dispositivos)', price: 145, time: 'Entrega inmediata', category: 'Productividad' },
      { id: 'office_365_familia', name: 'Microsoft 365 Familia (1 Año / Hasta 6 Usuarios / 1 TB en la nube)', price: 85, time: 'Entrega inmediata', category: 'Productividad' },
      { id: 'windows_11_pro', name: 'Licencia Oficial Windows 11 Pro Permanente (Retail / OEM)', price: 35, time: 'Entrega inmediata', category: 'Sistema Operativo' }
    ]
  },
  {
    id: 'soporte_remoto',
    name: 'Soporte Remoto Seguro e Inmediato',
    tagline: 'Asistencia Técnica Cifrada en Menos de 5 Minutos',
    description: 'Resolución ágil de lentitud, malware, configuración de correo corporativo, controladores, impresoras y VPN mediante conexión cifrada.',
    icon: 'Headphones',
    color: 'from-sky-500 to-indigo-600',
    basePrice: 20,
    options: [
      { id: 'remoto_optimizacion', name: 'Sesión Remota de Optimización y Desinfección de Malware', price: 25, time: '40 min', category: 'Remoto' },
      { id: 'remoto_config_office', name: 'Configuración de Correo Corporativo, Microsoft Teams y VPN', price: 20, time: '30 min', category: 'Remoto' },
      { id: 'remoto_diagnostico_red', name: 'Diagnóstico de Red, Impresoras Compartidas y Conectividad', price: 25, time: '30 min', category: 'Remoto' }
    ]
  }
];

export const SUBSCRIPTION_TIERS = [
  {
    id: 'starter',
    name: 'Starter Pyme',
    target: 'Pequeñas empresas, consultorios y firmas emergentes',
    range: 'De 1 a 10 Equipos',
    priceMonthly: 99,
    priceAnnual: 84, // $84 USD/mes con facturación anual
    popular: false,
    slaRemote: '< 2 horas',
    slaOnsite: '< 4 horas',
    features: [
      'Soporte remoto ilimitado en horario hábil (lunes a viernes, 8:00 a. m. a 6:00 p. m.)',
      '1 jornada trimestral de mantenimiento preventivo integral por equipo',
      'Antivirus corporativo gestionado en la nube incluido para toda la flota',
      'Línea telefónica y canal de WhatsApp empresarial prioritario',
      '10 % de descuento en repuestos originales y reparaciones móviles del personal',
      'Informe ejecutivo mensual sobre el estado de la infraestructura'
    ],
    ctaText: 'Contratar Plan Starter Pyme',
    badge: 'Ideal para Pymes'
  },
  {
    id: 'business_pro',
    name: 'Business Pro',
    target: 'Empresas en expansión y oficinas de operación continua',
    range: 'De 11 a 35 Equipos + Servidores',
    priceMonthly: 249,
    priceAnnual: 210,
    popular: true,
    slaRemote: '< 45 minutos',
    slaOnsite: '< 2 horas',
    features: [
      'Soporte remoto ilimitado en horario extendido (lunes a sábado, 7:00 a. m. a 8:00 p. m.)',
      'Mantenimiento preventivo bimestral programado en tus instalaciones',
      '4 visitas técnicas presenciales de emergencia al mes incluidas sin costo adicional',
      'Mantenimiento térmico y preventivo especializado para servidores y gabinetes',
      '20 % de descuento en licenciamiento oficial de Microsoft 365 y Windows Pro',
      'Cobertura técnica preferencial para teléfonos corporativos de directivos y ventas',
      'Auditoría mensual de copias de seguridad (backups) y postura de ciberseguridad',
      'Ingeniero líder de cuenta asignado'
    ],
    ctaText: 'Contratar Plan Business Pro',
    badge: 'Más Elegido B2B'
  },
  {
    id: 'enterprise_titan',
    name: 'Enterprise Titan',
    target: 'Operaciones críticas, centros de contacto y empresas multisede',
    range: 'De 36 a 80+ Equipos',
    priceMonthly: 590,
    priceAnnual: 499,
    popular: false,
    slaRemote: '< 20 minutos (24/7)',
    slaOnsite: '< 60 minutos (Exprés)',
    features: [
      'Mesa de ayuda ininterrumpida 24/7/365 con especialista de guardia dedicado',
      'Visitas técnicas presenciales ilimitadas según requerimiento operativo',
      'Mantenimiento preventivo mensual en todas las estaciones y servidores',
      'Protección EDR avanzada con monitoreo y respuesta ante amenazas en tiempo real',
      'Administración integral de red, conmutadores, firewall, VPN y telefonía IP',
      'Atención exprés en sitio para toda la flota de dispositivos móviles corporativos',
      'Equipo de respaldo en préstamo durante reparaciones mayores de laboratorio',
      'Acuerdo de Nivel de Servicio (SLA) firmado con cláusulas de garantía'
    ],
    ctaText: 'Solicitar Plan Enterprise',
    badge: 'Máximo SLA'
  },
  {
    id: 'hogar_digital',
    name: 'Plan Hogar Digital (B2C)',
    target: 'Familias, profesionales independientes y trabajo remoto',
    range: 'Hasta 4 Dispositivos (2 Celulares + 2 Computadores)',
    priceMonthly: 19,
    priceAnnual: 16,
    popular: false,
    slaRemote: '< 1 hora',
    slaOnsite: 'Atención el mismo día',
    features: [
      'Asistencia técnica remota ilimitada para computadores de escritorio y portátiles',
      '1 mantenimiento preventivo anual con cambio de pasta térmica sin costo',
      '40 % de descuento en mano de obra para reemplazo de pantallas o baterías móviles',
      'Desinfección periódica de malware y optimización de rendimiento en Windows o macOS',
      'Asesoría personalizada para adquisición de equipamiento y licencias del hogar'
    ],
    ctaText: 'Activar Plan Familiar',
    badge: 'Hogar y Teletrabajo'
  }
];

export const MOBILE_DEVICES_LIST = [
  {
    brand: 'Apple',
    models: ['iPhone 16 Pro / Pro Max', 'iPhone 15 / 15 Pro', 'iPhone 14 / 14 Pro', 'iPhone 13 / 13 Pro', 'iPhone 12 / 11', 'iPad Pro / Air'],
    commonRepairs: [
      { issue: 'Pantalla OLED rota o sin imagen', priceEstimate: '75 - 130 USD', time: '35 min' },
      { issue: 'Batería degradada (capacidad < 80 %)', priceEstimate: '35 - 55 USD', time: '30 min' },
      { issue: 'Cristal trasero fracturado (remoción láser)', priceEstimate: '45 - 70 USD', time: '90 min' },
      { issue: 'Puerto de carga o micrófono principal', priceEstimate: '30 - 45 USD', time: '40 min' },
      { issue: 'Módulo de cámara principal o lente de cristal', priceEstimate: '35 - 65 USD', time: '30 min' }
    ]
  },
  {
    brand: 'Samsung',
    models: ['Galaxy S24 / S24 Ultra', 'Galaxy S23 / S22', 'Galaxy Z Flip / Fold', 'Galaxy A54 / A55', 'Galaxy A34 / A14'],
    commonRepairs: [
      { issue: 'Pantalla Dynamic AMOLED original', priceEstimate: '65 - 120 USD', time: '40 min' },
      { issue: 'Batería certificada de fábrica', priceEstimate: '30 - 45 USD', time: '30 min' },
      { issue: 'Conector USB-C de carga rápida', priceEstimate: '25 - 38 USD', time: '35 min' },
      { issue: 'Recuperación de placa por contacto con líquidos', priceEstimate: '40 - 65 USD', time: '2 horas' }
    ]
  },
  {
    brand: 'Xiaomi / Redmi / POCO',
    models: ['Xiaomi 14 / 13 Series', 'Redmi Note 13 / 12 Pro', 'POCO X6 / F5 Pro', 'Redmi 12 / 13C'],
    commonRepairs: [
      { issue: 'Pantalla AMOLED / IPS de grado original', priceEstimate: '45 - 85 USD', time: '45 min' },
      { issue: 'Batería de alta capacidad', priceEstimate: '25 - 38 USD', time: '30 min' },
      { issue: 'Módulo flex de carga rápida', priceEstimate: '22 - 32 USD', time: '30 min' }
    ]
  },
  {
    brand: 'Motorola y Otras Marcas',
    models: ['Edge 40 / 50 Pro', 'Moto G84 / G54', 'Moto G14 / G24', 'Huawei / Honor'],
    commonRepairs: [
      { issue: 'Reemplazo de módulo de pantalla', priceEstimate: '40 - 75 USD', time: '45 min' },
      { issue: 'Reemplazo de batería certificada', priceEstimate: '25 - 35 USD', time: '30 min' },
      { issue: 'Mantenimiento físico y limpieza interna', priceEstimate: '20 - 30 USD', time: '30 min' }
    ]
  }
];

// Inicialización limpia: sin órdenes ficticias precargadas
export const INITIAL_ORDERS = [];

// Sede Única Oficial: Bogotá, D.C.
export const CITY_LOCATIONS = [
  { 
    id: 'bog', 
    name: 'Bogotá, D.C.', 
    label: 'Sede Central y Laboratorio Especializado',
    lat: 4.7110, 
    lng: -74.0721,
    address: 'Sede Central y Laboratorio: Cra. 7 # 71-21, Torre Empresarial, Chapinero, Bogotá, D.C.',
    coverage: 'Cobertura en tiempo real en las 20 localidades de Bogotá y municipios de la Sabana'
  }
];
