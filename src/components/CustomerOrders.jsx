import React, { useState } from 'react';
import { 
  ClipboardList, MapPin, Star, FileText, 
  Download, X, Ticket
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TicketVoucherModal } from './TicketVoucherModal';
import { formatCOP, convertUSDToCOP } from '../utils/currencyUtils';
import { sanitizeText } from '../utils/securityUtils';

export const CustomerOrders = ({ orders, currency = 'dual', onTrackOrder, onRateOrder }) => {
  const [filter, setFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedTicketOrder, setSelectedTicketOrder] = useState(null);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return o.status !== 'completado';
    if (filter === 'completed') return o.status === 'completado';
    return true;
  });

  const handleSaveRating = () => {
    if (ratingOrder) {
      const cleanFeedback = sanitizeText(feedbackText, 300);
      if (onRateOrder) {
        onRateOrder(ratingOrder.id, ratingStars, cleanFeedback);
      }
      confetti({ particleCount: 80, spread: 60 });
      setRatingOrder(null);
      setFeedbackText('');
    }
  };

  const formatOrderAmount = (order) => {
    const usd = order.priceTotal || 0;
    const cop = order.priceTotalCOP || convertUSDToCOP(usd);
    if (currency === 'cop') return `${formatCOP(cop)} COP`;
    if (currency === 'usd') return `$${usd} USD`;
    return `${formatCOP(cop)} (~$${usd} USD)`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'solicitado':
        return { text: 'Solicitado', bg: 'bg-blue-950 text-[#00f0ff] border-blue-500/30' };
      case 'tecnico_asignado':
        return { text: 'Especialista Asignado', bg: 'bg-blue-950 text-[#00f0ff] border-blue-500/30' };
      case 'en_camino':
        return { text: 'En Camino (GPS)', bg: 'bg-cyan-950 text-cyan-300 border-cyan-500/50 animate-pulse' };
      case 'en_sitio':
        return { text: 'Especialista en Sitio', bg: 'bg-indigo-950 text-indigo-300 border-indigo-500/40' };
      case 'completado':
        return { text: 'Completado', bg: 'bg-emerald-950 text-emerald-300 border-emerald-500/40' };
      default:
        return { text: status, bg: 'bg-slate-900 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 text-white">
      
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#00f0ff]" />
            Mis Solicitudes de Servicio y Comprobantes
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Consulta el estado de tus órdenes técnicas, contratos de soporte y tickets digitales
          </p>
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center space-x-1.5 bg-[#0a152e] p-1.5 rounded-2xl border border-blue-500/20 text-xs shadow-xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filter === 'all' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filter === 'active' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            En Curso ({orders.filter(o => o.status !== 'completado').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filter === 'completed' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Finalizadas ({orders.filter(o => o.status === 'completado').length})
          </button>
        </div>
      </div>

      {/* Listado de Órdenes */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-[#0a152e] p-12 rounded-3xl text-center space-y-4 border border-blue-500/20 shadow-xl">
            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-300">No registras solicitudes en esta categoría</h3>
            <p className="text-xs text-slate-500 font-medium">Puedes solicitar un especialista exprés o cotizar un plan corporativo desde la pestaña principal.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const badge = getStatusBadge(order.status);
            return (
              <div 
                key={order.id}
                className="bg-[#0a152e] p-5 rounded-3xl border border-blue-500/20 hover:border-cyan-400/40 shadow-xl transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-500/15 pb-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-[#00f0ff] font-black text-sm bg-blue-950 px-3 py-1 rounded-xl border border-cyan-500/30">
                      {order.id}
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-white">{order.serviceName}</h3>
                      <p className="text-xs text-slate-400 font-medium">{order.customerName} • {order.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-xs px-3 py-1 rounded-full border font-bold ${badge.bg}`}>
                      {badge.text}
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#00f0ff] font-mono">
                      {formatOrderAmount(order)}
                    </span>
                  </div>
                </div>

                {/* Fila de Detalles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Ubicación de Atención:</span>
                    <p className="text-slate-200 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00f0ff] shrink-0" />
                      <span className="truncate">{order.address}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Especialista Asignado:</span>
                    <p className="text-slate-200 font-semibold">
                      {order.technician?.name || 'Por asignar'} ({order.technician?.vehicle || 'Unidad Móvil'})
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium">Prioridad y Facturación:</span>
                    <p className="text-slate-200 font-semibold">
                      {order.urgency} • {order.paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-blue-500/15">
                  <div className="text-xs text-slate-400 font-medium">
                    {order.rating ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        Calificación otorgada: {order.rating}/5 estrellas
                      </span>
                    ) : order.status === 'completado' ? (
                      <button
                        type="button"
                        onClick={() => setRatingOrder(order)}
                        className="text-[#00f0ff] hover:underline font-bold flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        Calificar Atención del Especialista
                      </button>
                    ) : (
                      <span className="text-[#00f0ff] font-semibold">Rastreo GPS activo • Tiempo estimado: {order.etaMinutes} min</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {order.status !== 'completado' && (
                      <button
                        type="button"
                        onClick={() => onTrackOrder(order)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-[#00f0ff] font-bold text-xs border border-cyan-500/30 flex items-center space-x-1.5 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#00f0ff]" />
                        <span>Ver Mapa GPS</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedTicketOrder(order)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-700/60 to-cyan-600/60 hover:from-blue-600 hover:to-cyan-500 text-white font-bold text-xs border border-cyan-400/40 flex items-center space-x-1.5 transition-all shadow-sm"
                      title="Ver y descargar el ticket oficial del servicio"
                    >
                      <Ticket className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Ticket Digital</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(order)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0f2042] hover:bg-blue-900 text-white font-semibold text-xs border border-blue-500/25 flex items-center space-x-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#00f0ff]" />
                      <span>Ver Resumen Fiscal</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal de Resumen Fiscal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md">
          <div className="bg-[#0a152e] rounded-3xl w-full max-w-lg border border-cyan-500/30 p-6 space-y-6 shadow-2xl text-white animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-blue-500/20 pb-4">
              <div>
                <span className="font-black text-xl tracking-wider text-white">
                  BLUEPRINT <span className="text-[#00f0ff] text-xs font-bold font-mono">by QuintoNodo</span>
                </span>
                <p className="text-xs text-slate-400 font-medium">Comprobante de Orden de Servicio #{selectedInvoice.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#060b18] p-5 rounded-2xl space-y-3 text-xs font-mono text-slate-300 border border-blue-500/20">
              <div className="flex justify-between">
                <span>Cliente / Razón Social:</span>
                <span className="text-white font-bold">{selectedInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha de Emisión:</span>
                <span>{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Concepto del Servicio:</span>
                <span className="text-[#00f0ff] font-bold text-right max-w-[60%]">{selectedInvoice.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span>Medio de Pago:</span>
                <span className="text-right max-w-[60%]">{selectedInvoice.paymentMethod}</span>
              </div>
              <div className="border-t border-blue-500/20 pt-2 flex justify-between text-base font-black text-white font-sans">
                <span>Total Liquidado:</span>
                <span className="text-[#00f0ff] font-mono font-black">{formatOrderAmount(selectedInvoice)}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  const orderToOpen = selectedInvoice;
                  setSelectedInvoice(null);
                  setSelectedTicketOrder(orderToOpen);
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-[#00f0ff] hover:opacity-90 text-[#060b18] font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 transition-transform active:scale-95"
              >
                <Download className="w-4 h-4 text-[#060b18]" />
                <span>Abrir Comprobante Imprimible</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Calificación de Servicio */}
      {ratingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md">
          <div className="bg-[#0a152e] rounded-3xl w-full max-w-md border border-cyan-500/30 p-6 space-y-5 text-center shadow-2xl text-white animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-white">Calificar Atención de Blueprint</h3>
            <p className="text-xs text-slate-400 font-medium">
              ¿Cómo calificarías la puntualidad, el diagnóstico y la calidad técnica de {ratingOrder.technician?.name}?
            </p>

            <div className="flex justify-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingStars(star)}
                  className="p-1 focus:outline-none hover:scale-110 transition-transform"
                >
                  <Star className={`w-8 h-8 ${star <= ratingStars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                </button>
              ))}
            </div>

            <textarea
              rows="3"
              maxLength={300}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Comparte tus comentarios sobre la atención recibida..."
              className="w-full px-4 py-2.5 rounded-2xl bg-[#060b18] border border-blue-500/30 text-white text-xs focus:outline-none focus:border-[#00f0ff] resize-none"
            ></textarea>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setRatingOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-blue-950 text-slate-300 font-bold text-xs hover:bg-blue-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRating}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-[#00f0ff] text-[#060b18] font-black text-xs shadow-md shadow-cyan-500/20"
              >
                Enviar Calificación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ticket Digital */}
      <TicketVoucherModal
        isOpen={!!selectedTicketOrder}
        onClose={() => setSelectedTicketOrder(null)}
        order={selectedTicketOrder}
        onNavigateTracking={onTrackOrder}
      />

    </div>
  );
};
