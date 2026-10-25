// Mock Data for Blueprint by QuintoNodo Tech (IT Express, Mobile Repair & Enterprise Subscriptions)

// Generates a local initials avatar (no external image dependency)
const makeAvatar = (initials, from, to) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="128" height="128" rx="28" fill="url(#g)"/><text x="64" y="78" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="800" fill="#060b18" text-anchor="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Equipo QuintoNodo: los 5 nodos de Blueprint
export const INITIAL_TECHNICIANS = [
  {
    id: 'tech-1',
    name: 'Juan Aguirre',
    title: 'Director Técnico • Infraestructura & Servidores B2B',
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
    skills: ['Mantenimiento Flotas B2B', 'Servidores Windows/Linux', 'Contratos SLA', 'Arquitectura IT']
  },
  {
    id: 'tech-2',
    name: 'Daniel Rozo',
    title: 'Especialista en Reparación Móvil & Microsoldadura',
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
    skills: ['Pantallas OLED iPhone & Samsung', 'Microsoldadura SMD/BGA', 'Baterías Certificadas', 'Rescate por Líquidos']
  },
  {
    id: 'tech-3',
    name: 'Nicolás Zequeda',
    title: 'Ingeniero de Ciberseguridad & Licenciamiento',
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
    skills: ['Kaspersky & Bitdefender', 'Microsoft 365', 'Auditoría de Seguridad', 'Activación de Flotas']
  },
  {
    id: 'tech-4',
    name: 'Juan Diego Barreto',
    title: 'Ingeniero de Soporte Remoto & Cloud',
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
    skills: ['Soporte Remoto 24/7', 'Correo Corporativo & Teams', 'VPN & Redes', 'Optimización de Sistemas']
  },
  {
    id: 'tech-5',
    name: 'Miguel',
    title: 'Técnico de Campo • Hardware, Redes & Cableado',
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
    skills: ['Diagnóstico en Sitio', 'Upgrades SSD/RAM', 'Cableado Estructurado', 'Impresoras & Periféricos']
  }
];

export const SERVICE_CATEGORIES = [
  {
    id: 'mantenimiento_b2b',
    name: 'Mantenimiento IT Corporativo (B2B)',
    tagline: 'Mantenimiento de Servidores, Flotas de PCs y Redes',
    description: 'Diagnóstico en sitio, limpieza profunda, cambio de pasta térmica industrial, optimización de sistemas y contratos para empresas.',
    icon: 'Building2',
    color: 'from-blue-600 to-indigo-700',
    basePrice: 45,
    options: [
      { id: 'maint_preventivo_flota', name: 'Mantenimiento Preventivo Integral por Puesto IT', price: 45, time: '60 min/equipo', category: 'Hardware' },
      { id: 'maint_servidor', name: 'Mantenimiento Crítico de Servidores & Storage', price: 120, time: '2 horas', category: 'Infraestructura' },
      { id: 'maint_correctivo_urgente', name: 'Diagnóstico Correctivo de Emergencia en Sitio', price: 65, time: '< 45 min', category: 'Emergencia' },
      { id: 'maint_upgrades_ssd', name: 'Upgrade Masivo SSD NVMe + Migración de Datos', price: 55, time: '90 min', category: 'Hardware' }
    ]
  },
  {
    id: 'reparacion_movil',
    name: 'Reparación Express de Celulares (B2C & B2B)',
    tagline: 'Pantallas OLED, Baterías, Cámaras & Microsoldadura',
    description: 'Servicio express de reparación para iPhone, Samsung, Xiaomi y más. Refacciones grado original con garantía directa.',
    icon: 'Smartphone',
    color: 'from-cyan-500 to-blue-600',
    basePrice: 35,
    options: [
      { id: 'rep_pantalla_oled', name: 'Cambio de Pantalla OLED / Super Retina con TrueTone', price: 65, time: '40 min', category: 'Pantalla' },
      { id: 'rep_bateria_original', name: 'Reemplazo de Batería Grado Original (Salud 100%)', price: 35, time: '30 min', category: 'Energía' },
      { id: 'rep_puerto_carga', name: 'Reparación de Puerto de Carga Type-C / Lightning', price: 28, time: '35 min', category: 'Carga' },
      { id: 'rep_rescate_agua', name: 'Limpieza Ultrasónica & Rescate de Placa por Agua', price: 50, time: '2-4 horas', category: 'Laboratorio' },
      { id: 'rep_camara_vidrio', name: 'Reemplazo de Lente de Cámara y Sensores', price: 30, time: '30 min', category: 'Óptica' }
    ]
  },
  {
    id: 'licencias_software',
    name: 'Licenciamiento de Software Oficial',
    tagline: 'Antivirus Kaspersky, Bitdefender, Office 365 & Windows',
    description: 'Licencias originales con entrega digital inmediata, factura legal y asistencia remota para activación en flotas o equipos individuales.',
    icon: 'ShieldCheck',
    color: 'from-emerald-500 to-teal-600',
    basePrice: 25,
    options: [
      { id: 'kaspersky_cloud_b2b', name: 'Kaspersky Endpoint Security Cloud (Por Puesto / Año)', price: 42, time: 'Entrega Digital Inmediata', category: 'Ciberseguridad' },
      { id: 'kaspersky_total_sec', name: 'Kaspersky Total Security (1 Año / 3 Dispositivos)', price: 32, time: 'Entrega Inmediata', category: 'Ciberseguridad' },
      { id: 'office_365_business', name: 'Microsoft 365 Business Standard (1 Año / 1 Usuario 5 Disp)', price: 145, time: 'Entrega Inmediata', category: 'Productividad' },
      { id: 'office_365_familia', name: 'Microsoft 365 Familia (1 Año / Hasta 6 Usuarios 1TB)', price: 85, time: 'Entrega Inmediata', category: 'Productividad' },
      { id: 'windows_11_pro', name: 'Licencia Oficial Windows 11 Pro Retail / OEM Permanente', price: 35, time: 'Entrega Inmediata', category: 'Sistema Operativo' }
    ]
  },
  {
    id: 'soporte_remoto',
    name: 'Soporte Remoto Seguro Inmediato',
    tagline: 'Asistencia Remota Encriptada en < 5 Minutos',
    description: 'Solución inmediata a lentitud, virus, configuración de correo empresarial, drivers e impresoras mediante túnel SSL de alta seguridad.',
    icon: 'Headphones',
    color: 'from-sky-500 to-indigo-600',
    basePrice: 20,
    options: [
      { id: 'remoto_optimizacion', name: 'Sesión Remota de Optimización y Limpieza de Virus', price: 25, time: '40 min', category: 'Remoto' },
      { id: 'remoto_config_office', name: 'Configuración Correo Corporativo, Teams y VPN', price: 20, time: '30 min', category: 'Remoto' },
      { id: 'remoto_diagnostico_red', name: 'Diagnóstico de Red, Impresoras y Conectividad', price: 25, time: '30 min', category: 'Remoto' }
    ]
  }
];

export const SUBSCRIPTION_TIERS = [
  {
    id: 'starter',
    name: 'Starter Pyme',
    target: 'Pequeñas empresas y Startups',
    range: '1 a 10 Equipos',
    priceMonthly: 99,
    priceAnnual: 84, // $84/mes facturado anual
    popular: false,
    slaRemote: '< 2 horas',
    slaOnsite: '< 4 horas',
    features: [
      'Soporte remoto ilimitado en horario laboral (Lunes a Viernes 8am - 6pm)',
      '1 Mantenimiento preventivo integral trimestral por equipo',
      'Antivirus gestionado en la nube incluido para toda la flota',
      'Atención telefónica y WhatsApp corporativo prioritario',
      '10% de Descuento en refacciones y reparaciones móviles de empleados',
      'Informe mensual de salud de infraestructura'
    ],
    ctaText: 'Contratar Starter Pyme',
    badge: 'Ideal Pymes'
  },
  {
    id: 'business_pro',
    name: 'Business Pro',
    target: 'Empresas en crecimiento y oficinas medianas',
    range: '11 a 35 Equipos + Servidores',
    priceMonthly: 249,
    priceAnnual: 210,
    popular: true,
    slaRemote: '< 45 minutos',
    slaOnsite: '< 2 horas',
    features: [
      'Soporte remoto ilimitado extendido (Lunes a Sábado 7am - 8pm)',
      'Mantenimiento preventivo bimensual programado en sitio',
      '4 Visitas técnicas presenciales de emergencia al mes incluidas',
      'Mantenimiento térmico especializado de Servidores y Racks',
      '20% de Descuento en licencias de Microsoft 365 y Windows Pro',
      'Cobertura técnica para smartphones de directivos y ventas',
      'Auditoría mensual de copias de seguridad (Backups) y ciberseguridad',
      'Gerente de cuenta técnico asignado'
    ],
    ctaText: 'Contratar Business Pro',
    badge: 'Más Elegido B2B'
  },
  {
    id: 'enterprise_titan',
    name: 'Enterprise Titan',
    target: 'Corporativos, Call Centers y Sedes Múltiples',
    range: '36 a 80+ Equipos',
    priceMonthly: 590,
    priceAnnual: 499,
    popular: false,
    slaRemote: '< 20 minutos (24/7)',
    slaOnsite: '< 60 minutos (Express)',
    features: [
      'Soporte 24/7/365 con ingeniero de guardia dedicado',
      'Visitas técnicas presenciales ilimitadas en sitio',
      'Mantenimiento preventivo mensual en todos los puestos y servidores',
      'Protección EDR avanzada con detección de amenazas en tiempo real',
      'Gestión integral de red, switches, firewall, VPN y telefonía IP',
      'Cobertura express para toda la flota celular corporativa',
      'Reposición de equipo de respaldo temporal durante reparaciones mayores',
      'Contrato formal con penalizaciones de SLA por escrito'
    ],
    ctaText: 'Contactar Enterprise',
    badge: 'Máximo SLA'
  },
  {
    id: 'hogar_digital',
    name: 'Plan Hogar Digital (B2C)',
    target: 'Familias, Profesionales Independientes y Gamers',
    range: 'Hasta 4 Dispositivos (2 Celulares + 2 PCs)',
    priceMonthly: 19,
    priceAnnual: 16,
    popular: false,
    slaRemote: '< 1 hora',
    slaOnsite: 'Cita en el día',
    features: [
      'Asistencia técnica remota ilimitada para tus PCs o Laptops familiares',
      '1 Mantenimiento preventivo y cambio de pasta térmica anual gratis',
      '40% de Descuento en mano de obra para cambio de pantallas o baterías de celulares',
      'Limpieza periódica de virus y optimización de velocidad de Windows/Mac',
      'Asesoría en compra de tecnología y software para el hogar'
    ],
    ctaText: 'Activar Plan Familiar',
    badge: 'B2C Familiar'
  }
];

export const MOBILE_DEVICES_LIST = [
  {
    brand: 'Apple',
    models: ['iPhone 16 Pro / Pro Max', 'iPhone 15 / 15 Pro', 'iPhone 14 / 14 Pro', 'iPhone 13 / 13 Pro', 'iPhone 12 / 11', 'iPad Pro / Air'],
    commonRepairs: [
      { issue: 'Pantalla OLED Rota / Sin Imagen', priceEstimate: '75 - 130 USD', time: '35 min' },
      { issue: 'Batería Degradada (< 80%)', priceEstimate: '35 - 55 USD', time: '30 min' },
      { issue: 'Tapa Trasera de Vidrio Rota (Láser)', priceEstimate: '45 - 70 USD', time: '90 min' },
      { issue: 'Puerto de Carga / Micrófono', priceEstimate: '30 - 45 USD', time: '40 min' },
      { issue: 'Cámara Principal / Cristal Roto', priceEstimate: '35 - 65 USD', time: '30 min' }
    ]
  },
  {
    brand: 'Samsung',
    models: ['Galaxy S24 / S24 Ultra', 'Galaxy S23 / S22', 'Galaxy Z Flip / Fold', 'Galaxy A54 / A55', 'Galaxy A34 / A14'],
    commonRepairs: [
      { issue: 'Pantalla Dynamic AMOLED', priceEstimate: '65 - 120 USD', time: '40 min' },
      { issue: 'Batería Original', priceEstimate: '30 - 45 USD', time: '30 min' },
      { issue: 'Conector Tipo C / Carga Rápida', priceEstimate: '25 - 38 USD', time: '35 min' },
      { issue: 'Daño por Humedad / Rescate Placa', priceEstimate: '40 - 65 USD', time: '2 horas' }
    ]
  },
  {
    brand: 'Xiaomi / Redmi / POCO',
    models: ['Xiaomi 14 / 13 Series', 'Redmi Note 13 / 12 Pro', 'POCO X6 / F5 Pro', 'Redmi 12 / 13C'],
    commonRepairs: [
      { issue: 'Pantalla AMOLED / IPS Original', priceEstimate: '45 - 85 USD', time: '45 min' },
      { issue: 'Batería de Alta Capacidad', priceEstimate: '25 - 38 USD', time: '30 min' },
      { issue: 'Puerto de Carga Flex', priceEstimate: '22 - 32 USD', time: '30 min' }
    ]
  },
  {
    brand: 'Motorola / Otras Marcas',
    models: ['Edge 40 / 50 Pro', 'Moto G84 / G54', 'Moto G14 / G24', 'Huawei / Honor'],
    commonRepairs: [
      { issue: 'Cambio de Pantalla', priceEstimate: '40 - 75 USD', time: '45 min' },
      { issue: 'Batería Nueva', priceEstimate: '25 - 35 USD', time: '30 min' },
      { issue: 'Mantenimiento General / Limpieza', priceEstimate: '20 - 30 USD', time: '30 min' }
    ]
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'BPT-9042',
    date: '2026-10-25 09:30',
    serviceType: 'mantenimiento_b2b',
    serviceName: 'Mantenimiento Preventivo Integral de 12 Puestos IT',
    customerName: 'Fintech Andina SAS',
    address: 'Cra. 7 # 71-21, Torre Empresarial, Chapinero, Bogotá D.C.',
    urgency: 'Express (< 60m)',
    priceTotal: 480,
    status: 'en_camino', // 'solicitado', 'tecnico_asignado', 'en_camino', 'en_sitio', 'completado'
    technician: INITIAL_TECHNICIANS[0],
    etaMinutes: 14,
    lat: 4.6560,
    lng: -74.0580,
    paymentMethod: 'Transferencia Bancolombia / Factura Electrónica B2B',
    notes: 'Mantenimiento preventivo en 12 estaciones de trabajo, cambio de pasta térmica y revisión de switch.',
    rating: null
  },
  {
    id: 'BPT-9041',
    date: '2026-10-25 08:15',
    serviceType: 'reparacion_movil',
    serviceName: 'Cambio de Pantalla OLED iPhone 15 Pro + Batería',
    customerName: 'Dra. Marcela Restrepo (B2C)',
    address: 'Calle 100 # 19-61, Edificio Prime, Chicó Norte, Bogotá D.C.',
    urgency: 'Express (< 60m)',
    priceTotal: 145,
    status: 'en_sitio',
    technician: INITIAL_TECHNICIANS[1],
    etaMinutes: 0,
    lat: 4.6860,
    lng: -74.0540,
    paymentMethod: 'Tarjeta de Crédito / Débito',
    notes: 'Pantalla con líneas verticales por caída. Conservar función TrueTone.',
    rating: 5
  },
  {
    id: 'BPT-9038',
    date: '2026-10-24 14:00',
    serviceType: 'licencias_software',
    serviceName: '10x Licencias Microsoft 365 Business Standard + 10x Kaspersky',
    customerName: 'Agencia Digital Nexus',
    address: 'Entrega Digital Inmediata & Despliegue Remoto',
    urgency: 'Inmediata',
    priceTotal: 890,
    status: 'completado',
    technician: INITIAL_TECHNICIANS[2],
    etaMinutes: 0,
    paymentMethod: 'PSE / Facturación B2B 30 Días',
    notes: 'Aprovisionamiento de licencias completado y migración de buzones de correo asistida.',
    rating: 5
  }
];

export const CITY_LOCATIONS = [
  { id: 'bog', name: 'Bogotá, D.C.', lat: 4.7110, lng: -74.0721 },
  { id: 'mde', name: 'Medellín, Antioquia', lat: 6.2442, lng: -75.5812 },
  { id: 'cali', name: 'Cali, Valle del Cauca', lat: 3.4516, lng: -76.5320 },
  { id: 'baq', name: 'Barranquilla, Atlántico', lat: 10.9685, lng: -74.7813 },
  { id: 'buc', name: 'Bucaramanga, Santander', lat: 7.1254, lng: -73.1198 },
  { id: 'ctg', name: 'Cartagena, Bolívar', lat: 10.3910, lng: -75.4794 }
];
