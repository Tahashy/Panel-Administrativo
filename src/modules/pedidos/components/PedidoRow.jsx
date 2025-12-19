// src/modules/pedidos/components/PedidoRow.jsx

import React from 'react';
import { Eye, Edit, CheckCircle, XCircle, Trash2, Utensils, Package, Truck, ShoppingBag } from 'lucide-react';
import ContadorTiempo from './ContadorTiempo';
import { getEstadoColor } from '../utils/pedidoHelpers';

const tdStyle = {
  padding: '16px',
  fontSize: '14px',
  color: '#4a5568'
};

const PedidoRow = ({ pedido, onCambiarEstado, onVerDetalle, onEliminar, onEditar, isAdmin, now }) => {
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'mesa': return <Utensils size={16} />;
      case 'llevar': return <Package size={16} />;
      case 'delivery': return <Truck size={16} />;
      default: return <ShoppingBag size={16} />;
    }
  };

  return (
    <tr style={{ borderBottom: '1px solid #f7fafc' }}>
      <td style={tdStyle}>
        <span style={{ fontWeight: '700', color: '#1a202c' }}>
          #{pedido.numero_pedido}
        </span>
      </td>
      <td style={tdStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: '#f7fafc',
          borderRadius: '6px',
          width: 'fit-content'
        }}>
          {getTipoIcon(pedido.tipo)}
          <span style={{ fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>
            {pedido.tipo}
          </span>
        </div>
      </td>
      <td style={tdStyle}>
        {pedido.tipo === 'mesa' ? `Mesa ${pedido.numero_mesa}` : pedido.cliente_nombre || '-'}
      </td>
      <td style={tdStyle}>
        <span style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600',
          background: '#Edf2f7',
          color: '#4a5568',
          display: 'inline-block'
        }}>
          {pedido.metodo_pago}
        </span>
      </td>
      <td style={tdStyle}>
        <span style={{ fontWeight: '700', color: '#FF6B35', fontSize: '16px' }}>
          ${parseFloat(pedido.total).toFixed(2)}
        </span>
      </td>
      <td style={tdStyle}>
        <span style={{
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '600',
          background: getEstadoColor(pedido.estado) + '20',
          color: getEstadoColor(pedido.estado),
          textTransform: 'capitalize'
        }}>
          {pedido.estado}
        </span>
      </td>
      <td style={tdStyle}>
        <ContadorTiempo 
          fechaCreacion={pedido.created_at}
          tiempoFinal={pedido.tiempo_preparacion}
          estado={pedido.estado}
          now={now}
        />
      </td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onVerDetalle(pedido)}
            style={{
              padding: '8px',
              background: '#3B82F6',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Ver detalle"
          >
            <Eye size={16} />
          </button>

          {pedido.estado !== 'entregado' && pedido.estado !== 'anulado' && (
            <>
              {/* Botón Editar */}
              <button
                onClick={() => onEditar(pedido)}
                style={{
                  padding: '8px',
                  background: '#F59E0B',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Editar pedido"
              >
                <Edit size={16} />
              </button>

              {/* Botón Siguiente Estado */}
              {pedido.estado !== 'listo' && (
                <button
                  onClick={() => {
                    const siguienteEstado =
                      pedido.estado === 'pendiente' ? 'preparando' :
                      pedido.estado === 'preparando' ? 'listo' : 'entregado';
                    onCambiarEstado(pedido.id, siguienteEstado);
                  }}
                  style={{
                    padding: '8px',
                    background: '#10B981',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Siguiente estado"
                >
                  <CheckCircle size={16} />
                </button>
              )}

              {/* Botón Finalizar/Entregar Pedido */}
              {pedido.estado === 'listo' && (
                <button
                  onClick={() => {
                    if (window.confirm('¿Finalizar este pedido?')) {
                      onCambiarEstado(pedido.id, 'entregado');
                    }
                  }}
                  style={{
                    padding: '8px',
                    background: '#10B981',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Finalizar-Entregado"
                >
                  <CheckCircle size={16} />
                </button>
              )}

              {/* Botón Anular Pedido */}
              <button
                onClick={() => {
                  if (window.confirm('¿Anular este pedido?')) {
                    onCambiarEstado(pedido.id, 'anulado');
                  }
                }}
                style={{
                  padding: '8px',
                  background: '#EF4444',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Anular Pedido"
              >
                <XCircle size={16} />
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                if (window.confirm('¿Eliminar este pedido?')) {
                  onEliminar(pedido.id);
                }
              }}
              style={{
                padding: '8px',
                background: '#EF4444',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PedidoRow;