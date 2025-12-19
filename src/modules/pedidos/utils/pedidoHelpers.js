
export const parseSupabaseTimestamp = (timestamp) => {
  if (!timestamp) return null;
  return new Date(timestamp.replace(' ', 'T') + 'Z');
};

export const getEstadoColor = (estado) => {
  const colores = {
    pendiente: '#F59E0B',
    preparando: '#FF6B35',
    listo: '#10B981',
    entregado: '#6B7280',
    cancelado: '#EF4444',
    anulado: '#EF4444'
  };
  return colores[estado] || '#6B7280';
};

export const getTipoIcon = (tipo) => {
  const iconMap = {
    mesa: 'Utensils',
    llevar: 'Package',
    delivery: 'Truck'
  };
  return iconMap[tipo] || 'ShoppingBag';
};

export const generarNumeroPedido = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `ORD-${timestamp}${random}`;
};

export const calcularTotales = (carrito, tapersAgregados = []) => {
  const subtotal = carrito.reduce((sum, item) => {
    const precioItem = item.precio * item.cantidad;
    const precioAgregados = item.agregados.reduce((s, a) => s + parseFloat(a.precio), 0) * item.cantidad;
    return sum + precioItem + precioAgregados;
  }, 0);

  const costoTaper = tapersAgregados.reduce((sum, t) => sum + parseFloat(t.precio), 0);
  const subtotalConTaper = subtotal + costoTaper;
  const iva = subtotalConTaper * 0.10;
  const total = subtotalConTaper + iva;

  return { subtotal, costoTaper, iva, total };
};

export const formatearTiempo = (minutos, segundos) => {
  return minutos >= 60
    ? '60:00+'
    : `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
};

export const getColorTiempo = (minutos) => {
  if (minutos < 20) return '#10B981';
  if (minutos < 30) return '#F59E0B';
  return '#EF4444';
};