// Blueprint by QuintoNodo Tech Automation Engine & Dispatch Webhook Service

export const AUTOMATION_RULES = [
  {
    id: 'rule-auto-dispatch',
    name: 'Asignación Inteligente GPS QuintoNodo',
    description: 'Calcula la distancia de los especialistas técnicos en campo y asigna al más cercano con el menor tiempo estimado de llegada (ETA).',
    category: 'Despacho',
    enabled: true,
    triggersCount: 168,
    lastTriggered: 'Hace 3 min'
  },
  {
    id: 'rule-whatsapp-notify',
    name: 'Notificación de Confirmación vía WhatsApp / SMS',
    description: 'Envía automáticamente al cliente el enlace cifrado de rastreo en vivo y los datos del técnico asignado.',
    category: 'Notificaciones',
    enabled: true,
    triggersCount: 312,
    lastTriggered: 'Hace 1 min'
  },
  {
    id: 'rule-parts-stock',
    name: 'Reserva Inmediata de Refacción Móvil / Licencia Cloud',
    description: 'Bloquea la pantalla OLED, batería o clave de licencia oficial inmediatamente al confirmar el servicio o suscripción.',
    category: 'Inventario & Licencias',
    enabled: true,
    triggersCount: 94,
    lastTriggered: 'Hace 10 min'
  },
  {
    id: 'rule-sla-escalation',
    name: 'Escalación Automática por Vencimiento SLA (< 15 min)',
    description: 'Dispara una alerta de alta prioridad a la central de Blueprint si una solicitud de emergencia no ha sido atendida en 15 min.',
    category: 'SLA & Garantía',
    enabled: true,
    triggersCount: 8,
    lastTriggered: 'Hace 2 horas'
  },
  {
    id: 'rule-digital-invoice',
    name: 'Generación Automática de Factura Digital con QR / DIAN',
    description: 'Emite y envía el comprobante fiscal en PDF inmediatamente al completar un servicio técnico o contrato mensual.',
    category: 'Facturación',
    enabled: true,
    triggersCount: 224,
    lastTriggered: 'Hace 25 min'
  }
];

export const INITIAL_AUTOMATION_LOGS = [
  {
    id: 'log-101',
    timestamp: '12:22:15',
    ruleId: 'rule-auto-dispatch',
    ruleName: 'Asignación Automática GPS',
    orderId: 'BPT-9042',
    status: 'success',
    detail: 'Especialista Juan Aguirre (QuintoNodo) asignado en 0.8s (ETA estimado: 14 min).'
  },
  {
    id: 'log-102',
    timestamp: '12:22:16',
    ruleId: 'rule-whatsapp-notify',
    ruleName: 'Notificación WhatsApp',
    orderId: 'BPT-9042',
    status: 'success',
    detail: 'Mensaje de WhatsApp cifrado enviado exitosamente a Fintech Andina SAS.'
  },
  {
    id: 'log-103',
    timestamp: '12:15:00',
    ruleId: 'rule-parts-stock',
    ruleName: 'Reserva de Refacción',
    orderId: 'BPT-9041',
    status: 'success',
    detail: 'Pantalla OLED grado original reservada en almacén técnico para BPT-9041.'
  },
  {
    id: 'log-104',
    timestamp: '11:45:20',
    ruleId: 'rule-digital-invoice',
    ruleName: 'Factura Digital QR',
    orderId: 'BPT-9038',
    status: 'success',
    detail: 'Factura electrónica generada y adjuntada en la cuenta del cliente para BPT-9038.'
  }
];

/**
 * Executes automated workflow upon creating a new service order
 */
export const runOrderAutomationPipeline = (order, availableTechnicians = []) => {
  const logs = [];
  
  // 1. Auto dispatch algorithm
  const bestTech = availableTechnicians.find(t => t.status === 'disponible') || availableTechnicians[0];
  const assignedTech = bestTech || {
    name: 'Juan Aguirre',
    title: 'Director Técnico • Infraestructura & Servidores B2B',
    rating: 4.97,
    jobsCompleted: 412,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    vehicle: 'Nodo Móvil Blueprint #01',
    plate: 'BPT-101 Bogotá',
    phone: '+57 310 000 0101'
  };

  logs.push({
    id: `log-${Date.now()}-1`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    ruleId: 'rule-auto-dispatch',
    ruleName: 'Asignación Automática GPS',
    orderId: order.id,
    status: 'success',
    detail: `Motor Blueprint asignó a ${assignedTech.name} por cercanía GPS (ETA: ${order.etaMinutes || 25} min).`
  });

  // 2. Webhook notification trigger simulation
  logs.push({
    id: `log-${Date.now()}-2`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    ruleId: 'rule-whatsapp-notify',
    ruleName: 'Notificación WhatsApp',
    orderId: order.id,
    status: 'success',
    detail: `Webhook WhatsApp activado: Se envió liga de mapa GPS en vivo al cliente ${order.customerName}.`
  });

  // 3. Parts reservation or license provision
  if (order.serviceType === 'reparacion_movil') {
    logs.push({
      id: `log-${Date.now()}-3`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ruleId: 'rule-parts-stock',
      ruleName: 'Reserva de Refacción',
      orderId: order.id,
      status: 'success',
      detail: `Refacción grado original apartada para "${order.serviceName}".`
    });
  } else if (order.serviceType === 'licencias_software') {
    logs.push({
      id: `log-${Date.now()}-3`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ruleId: 'rule-parts-stock',
      ruleName: 'Aprovisionamiento de Clave',
      orderId: order.id,
      status: 'success',
      detail: `Licencia oficial vinculada para entrega digital inmediata.`
    });
  }

  return {
    assignedTech,
    automationLogs: logs
  };
};
