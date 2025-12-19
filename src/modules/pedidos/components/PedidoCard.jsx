// src/modules/pedidos/components/PedidoCard.jsx

import React, { useState } from 'react';
import { Utensils, Package, Truck, ShoppingBag, MoreVertical } from 'lucide-react';
import ContadorTiempo from './ContadorTiempo';
import { getEstadoColor } from '../utils/pedidoHelpers';

const PedidoCard = ({ pedido, onCambiarEstado, onVerDetalle, isAdmin, now }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'mesa': return <Utensils size={16} />;
      case 'llevar': return <Package size={16} />;
      case 'delivery': return <Truck size={16} />;
      default: return <ShoppingBag size={16} />;
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              padding: '4px 8px',
              background: getEstadoColor(pedido.estado) + '20',
              color: getEstadoColor(pedido.estado),
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {pedido.estado}
            </span>
            <span style={{
              padding: '4px 8px',
              background: '#f7fafc',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#4a5568',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {getTipoIcon(pedido.tipo)}
              {pedido.tipo}
            </span>
          </div>
          <p style={{
            margin: '0 0 4px 0',
            fontSize: '16px',
            fontWeight: '700',
            color: '#1a202c'
          }}>
            #{pedido.numero_pedido}
          </p>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#718096'
          }}>
            {pedido.tipo === 'mesa' ? `Mesa ${pedido.numero_mesa}` : pedido.cliente_nombre || 'Sin nombre'}
          </p>
          <div style={{ marginTop: '8px' }}>
            <ContadorTiempo 
              fechaCreacion={pedido.created_at}
              tiempoFinal={pedido.tiempo_preparacion}
              estado={pedido.estado}
              now={now}
            />
          </div>
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            padding: '8px',
            background: '#f7fafc',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <MoreVertical size={18} />
        </button>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div>
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#718096' }}>
            Total
          </p>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#FF6B35' }}>
            ${parseFloat(pedido.total).toFixed(2)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#718096' }}>
            Pago
          </p>
          <p style={{
            margin: 0,
            fontSize: '13px',
            fontWeight: '600',
            color: '#4a5568',
            textTransform: 'capitalize'
          }}>
            {pedido.metodo_pago}
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '12px'
      }}>
        <button
          onClick={() => onVerDetalle(pedido)}
          style={{
            flex: 1,
            padding: '10px',
            background: '#3B82F6',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Ver Detalle
        </button>
        {pedido.estado !== 'entregado' && (
          <button
            onClick={() => {
              const siguienteEstado =
                pedido.estado === 'pendiente' ? 'preparando' :
                pedido.estado === 'preparando' ? 'listo' : 'entregado';
              onCambiarEstado(pedido.id, siguienteEstado);
            }}
            style={{
              flex: 1,
              padding: '10px',
              background: '#10B981',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
};

export default PedidoCard;