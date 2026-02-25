export function shippingUpdateEmail(data: { orderId: number; status: string; trackingNumber?: string | null; trackingUrl?: string | null; carrier?: string | null }) {
  const statusLabels: Record<string, { title: string; color: string; message: string }> = {
    PICKED_UP: { title: 'Pedido Recogido', color: '#3B82F6', message: 'Tu pedido ha sido recogido por el transportista y está en camino al centro de distribución.' },
    IN_TRANSIT: { title: 'En Tránsito', color: '#F59E0B', message: 'Tu pedido está viajando hacia ti.' },
    OUT_FOR_DELIVERY: { title: 'En Reparto', color: '#10B981', message: 'Tu pedido salió para entrega hoy. ¡Prepárate!' },
    DELIVERED: { title: 'Entregado', color: '#059669', message: '¡Tu pedido ha sido entregado exitosamente!' },
    RETURNED: { title: 'Devuelto', color: '#EF4444', message: 'Tu pedido fue devuelto. Contacta soporte para más información.' },
  };

  const info = statusLabels[data.status] || { title: 'Actualización', color: '#6B7280', message: 'Hay una actualización en tu pedido.' };

  const trackingBlock = data.trackingNumber
    ? `<div style="background:#F3F4F6;padding:16px;border-radius:8px;margin:16px 0;">
        <p style="margin:0;font-size:14px;color:#6B7280;">Transportista: <strong>${data.carrier || 'N/A'}</strong></p>
        <p style="margin:8px 0 0;font-size:14px;color:#6B7280;">Número de seguimiento: <strong>${data.trackingNumber}</strong></p>
        ${data.trackingUrl ? `<a href="${data.trackingUrl}" style="display:inline-block;margin-top:12px;background:#111827;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Rastrear Pedido</a>` : ''}
      </div>`
    : '';

  return {
    subject: `Pedido #${data.orderId} - ${info.title}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="margin:0;font-size:24px;color:#111827;">LhamsDJ</h1>
        </div>
        <div style="background:${info.color};color:white;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
          <h2 style="margin:0;font-size:22px;">${info.title}</h2>
          <p style="margin:8px 0 0;opacity:0.9;">Pedido #${data.orderId}</p>
        </div>
        <div style="border:1px solid #E5E7EB;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
          <p style="font-size:16px;color:#374151;line-height:1.6;">${info.message}</p>
          ${trackingBlock}
          <p style="font-size:12px;color:#9CA3AF;margin-top:24px;">Si tienes alguna pregunta, contacta nuestro equipo de soporte.</p>
        </div>
      </div>
    `,
  };
}

export function orderConfirmationEmail(data: { orderId: number; total: string; itemCount: number }) {
  return {
    subject: `Pedido #${data.orderId} confirmado`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="margin:0;font-size:24px;color:#111827;">LhamsDJ</h1>
        </div>
        <div style="background:#059669;color:white;padding:20px;border-radius:12px;text-align:center;">
          <h2 style="margin:0;">Pedido Confirmado</h2>
          <p style="margin:8px 0 0;font-size:32px;font-weight:bold;">#${data.orderId}</p>
        </div>
        <div style="padding:24px;text-align:center;">
          <p style="font-size:16px;color:#374151;">${data.itemCount} producto(s) - Total: <strong>$${data.total}</strong></p>
          <p style="font-size:14px;color:#6B7280;">Te notificaremos cuando tu pedido sea enviado.</p>
        </div>
      </div>
    `,
  };
}
