// Motor de Automatización y Asignación Georreferenciada de Blueprint by QuintoNodo Tech

export const AUTOMATION_RULES = [
  {
    id: 'rule-auto-dispatch',
    name: 'Asignación Inteligente GPS QuintoNodo',
    description: 'Calcula la proximidad de los especialistas técnicos en campo y asigna al más cercano con el menor tiempo estimado de arribo (ETA).',
    category: 'Despacho',
    enabled: true,
    triggersCount: 168,
    lastTriggered: 'Hace 3 min'
  },
  {
    id: 'rule-whatsapp-notify',
    name: 'Notificación de Confirmación por WhatsApp y Correo',
    description: 'Envía automáticamente al cliente el enlace de seguimiento GPS en tiempo real y el perfil del especialista asignado.',
    category: 'Notificaciones',
    enabled: true,
    triggersCount: 312,
    lastTriggered: 'Hace 1 min'
  },
  {
    id: 'rule-parts-stock',
    name: 'Reserva Inmediata de Repuesto Original o Licencia',
    description: 'Reserva en inventario el módulo OLED, la batería certificada o la clave de licencia oficial inmediatamente al confirmar la orden.',
    category: 'Inventario y Licencias',
    enabled: true,
    triggersCount: 94,
    lastTriggered: 'Hace 10 min'
  },
  {
    id: 'rule-sla-escalation',
    name: 'Escalamiento Automático por SLA (< 15 min)',
    description: 'Genera una alerta prioritaria a la dirección técnica de Blueprint si una solicitud de emergencia requiere apoyo adicional.',
    category: 'SLA y Garantía',
    enabled: true,
    triggersCount: 8,
    lastTriggered: 'Hace 2 horas'
  },
  {
    id: 'rule-digital-invoice',
    name: 'Emisión Automática de Comprobante y Factura Electrónica DIAN',
    description: 'Genera y remite el comprobante fiscal electrónico al concluir un servicio técnico o renovar un contrato mensual.',
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
    detail: 'Especialista Juan Aguirre (QuintoNodo) asignado en 0.8 s (tiempo estimado de arribo: 14 min).'
  },
  {
    id: 'log-102',
    timestamp: '12:22:16',
    ruleId: 'rule-whatsapp-notify',
    ruleName: 'Notificación WhatsApp',
    orderId: 'BPT-9042',
    status: 'success',
    detail: 'Notificación de seguimiento enviada exitosamente a Fintech Andina S.A.S.'
  },
  {
    id: 'log-103',
    timestamp: '12:15:00',
    ruleId: 'rule-parts-stock',
    ruleName: 'Reserva de Repuesto',
    orderId: 'BPT-9041',
    status: 'success',
    detail: 'Pantalla OLED de grado original reservada en laboratorio técnico para la orden BPT-9041.'
  },
  {
    id: 'log-104',
    timestamp: '11:45:20',
    ruleId: 'rule-digital-invoice',
    ruleName: 'Comprobante Digital',
    orderId: 'BPT-9038',
    status: 'success',
    detail: 'Comprobante electrónico generado y asociado a la cuenta del cliente para la orden BPT-9038.'
  }
];

/**
 * Ejecuta el flujo automatizado de asignación al registrar una nueva orden de servicio
 */
export const runOrderAutomationPipeline = (order, availableTechnicians = []) => {
  const logs = [];
  
  const bestTech = availableTechnicians.find(t => t.status === 'disponible') || availableTechnicians[0];
  const assignedTech = bestTech || {
    name: 'Juan Aguirre',
    title: 'Director Técnico • Infraestructura y Servidores B2B',
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
    detail: `El motor de despacho asignó a ${assignedTech.name} por proximidad geográfica (ETA: ${order.etaMinutes || 25} min).`
  });

  logs.push({
    id: `log-${Date.now()}-2`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    ruleId: 'rule-whatsapp-notify',
    ruleName: 'Notificación al Cliente',
    orderId: order.id,
    status: 'success',
    detail: `Notificación enviada: se compartió enlace de rastreo GPS en vivo con el cliente ${order.customerName}.`
  });

  if (order.serviceType === 'reparacion_movil') {
    logs.push({
      id: `log-${Date.now()}-3`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ruleId: 'rule-parts-stock',
      ruleName: 'Reserva de Repuesto',
      orderId: order.id,
      status: 'success',
      detail: `Repuesto certificado de grado original reservado en laboratorio para "${order.serviceName}".`
    });
  } else if (order.serviceType === 'licencias_software') {
    logs.push({
      id: `log-${Date.now()}-3`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ruleId: 'rule-parts-stock',
      ruleName: 'Aprovisionamiento de Licencia',
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
