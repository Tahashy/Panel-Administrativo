// src/modules/pedidos/hooks/usePedidos.js

import { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import { showToast } from '../../../components/Toast';
import { parseSupabaseTimestamp } from '../utils/pedidoHelpers';

export const usePedidos = (restauranteId) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedido_items (
            id,
            cantidad,
            precio_unitario,
            subtotal,
            producto_nombre,
            agregados
          ),
          usuarios (
            nombre
          )
        `)
        .eq('restaurante_id', restauranteId)
        .in('estado', ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'])
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      showToast('Error al cargar pedidos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const pedido = pedidos.find(p => p.id === pedidoId);
      if (!pedido) return;

      const estadosFinalizados = ['listo', 'entregado', 'cancelado', 'anulado'];
      const esFinalizacion = estadosFinalizados.includes(nuevoEstado);

      let updateData = { estado: nuevoEstado };

      if (esFinalizacion && !pedido.tiempo_preparacion) {
        const inicio = parseSupabaseTimestamp(pedido.created_at);
        const ahora = new Date();
        const tiempoSegundos = Math.floor((ahora - inicio) / 1000);
        
        updateData.tiempo_preparacion = tiempoSegundos;
        updateData.fecha_finalizacion = ahora.toISOString();
      }

      const { error } = await supabase
        .from('pedidos')
        .update(updateData)
        .eq('id', pedidoId);

      if (error) throw error;

      setPedidos(prevPedidos =>
        prevPedidos.map(p =>
          p.id === pedidoId ? { ...p, ...updateData } : p
        )
      );

      showToast(`Pedido actualizado a: ${nuevoEstado}`, 'success');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      showToast('Error al actualizar estado', 'error');
    }
  };

  const eliminarPedido = async (pedidoId) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', pedidoId);

      if (error) throw error;
      await cargarPedidos();
      showToast('Pedido eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error eliminando pedido:', error);
      showToast('Error al eliminar pedido', 'error');
    }
  };

  useEffect(() => {
    if (restauranteId) {
      cargarPedidos();
    }
  }, [restauranteId]);

  return {
    pedidos,
    loading,
    cargarPedidos,
    cambiarEstadoPedido,
    eliminarPedido
  };
};