// src/modules/pedidos/Pedidos.jsx

import React, { useState, useEffect } from 'react';
import { Plus, Search, ShoppingBag } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { showToast } from '../../components/Toast';

// Componentes
import StatCard from './components/StatCard';
import PedidoCard from './components/PedidoCard';
import PedidoRow from './components/PedidoRow';
import ModalNuevoPedido from './components/ModalNuevoPedido';
import PanelLateralPedido from './components/PanelLateralPedido';
import ModalEditarPedido from './components/ModalEditarPedido';

// Hook personalizado
import { usePedidos } from './hooks/usePedidos';

const thStyle = {
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4a5568',
    borderBottom: '2px solid #e2e8f0'
};

const Pedidos = ({ restauranteId, isAdmin, userId }) => {
    const { pedidos, loading, cargarPedidos, cambiarEstadoPedido, eliminarPedido } = usePedidos(restauranteId);

    const [productos, setProductos] = useState([]);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [now, setNow] = useState(Date.now());
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [pedidoAEditar, setPedidoAEditar] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        cargarProductos();
    }, [restauranteId]);

    const cargarProductos = async () => {
        try {
            const { data, error } = await supabase
                .from('productos')
                .select('*, categorias(nombre)')
                .eq('restaurante_id', restauranteId)
                .eq('disponible', true)
                .order('nombre');

            if (error) throw error;
            setProductos(data || []);
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    };

    const editarPedido = (pedido) => {
        // Verificar que el pedido sea editable
        if (['entregado', 'cancelado', 'anulado'].includes(pedido.estado)) {
            showToast('No se puede editar un pedido finalizado', 'error');
            return;
        }

        setPedidoAEditar(pedido);
        setMostrarModalEditar(true);
    };

    const pedidosFiltrados = pedidos.filter(p => {
        const matchSearch =
            p.numero_pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.numero_mesa?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado;
        return matchSearch && matchEstado;
    });

    const estadisticas = {
        total: pedidos.length,
        pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
        preparando: pedidos.filter(p => p.estado === 'preparando').length,
        listos: pedidos.filter(p => p.estado === 'listo').length,
    };

    const isMobile = window.innerWidth < 768;

    return (
        <>
            <style>{`
        @media print {
          * {
            visibility: hidden;
          }
          .modal-detalle {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            background: white !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .modal-detalle,
          .modal-detalle * {
            visibility: visible;
          }
          .no-print,
          .modal-detalle button {
            display: none !important;
          }
          @page {
            size: letter;
            margin: 15mm;
          }
        }
        @media (max-width: 768px) {
          .modal-detalle {
            max-width: 100% !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

            <div style={{ padding: isMobile ? '16px' : '32px' }}>
                {/* Header */}
                <div className="pedidos-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    gap: '16px'
                }}>
                    <div>
                        <h1 style={{
                            margin: '0 0 8px 0',
                            fontSize: isMobile ? '24px' : '32px',
                            fontWeight: '700',
                            color: '#1a202c'
                        }}>
                            Gestión de Pedidos
                        </h1>
                        <p style={{
                            margin: 0,
                            fontSize: isMobile ? '14px' : '16px',
                            color: '#718096'
                        }}>
                            Administra las órdenes del restaurante
                        </p>
                    </div>
                    <button
                        onClick={() => setMostrarModalNuevo(true)}
                        style={{
                            padding: isMobile ? '10px 16px' : '12px 24px',
                            background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(255,107,53,0.3)',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Plus size={18} />
                        {isMobile ? 'Nuevo' : 'Nuevo Pedido'}
                    </button>
                </div>

                {/* Estadísticas */}
                <div className="stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: isMobile ? '12px' : '20px',
                    marginBottom: '24px'
                }}>
                    <StatCard title="Total" value={estadisticas.total} color="#3B82F6" />
                    <StatCard title="Pendientes" value={estadisticas.pendientes} color="#F59E0B" />
                    <StatCard title="Preparando" value={estadisticas.preparando} color="#FF6B35" />
                    <StatCard title="Listos" value={estadisticas.listos} color="#10B981" />
                </div>

                {/* Filtros */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search
                            size={20}
                            style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#a0aec0'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 48px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div className="filtros-estado" style={{
                        display: 'flex',
                        gap: '8px',
                        background: '#f7fafc',
                        padding: '6px',
                        borderRadius: '10px'
                    }}>
                        {['todos', 'pendiente', 'preparando', 'listo', 'entregado'].map(estado => (
                            <button
                                key={estado}
                                onClick={() => setFiltroEstado(estado)}
                                style={{
                                    padding: '8px 12px',
                                    background: filtroEstado === estado ? '#FF6B35' : 'transparent',
                                    color: filtroEstado === estado ? 'white' : '#718096',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textTransform: 'capitalize',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {estado === 'todos' ? 'Todos' : estado}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de Pedidos */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#718096' }}>
                        Cargando pedidos...
                    </div>
                ) : pedidosFiltrados.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'white',
                        borderRadius: '16px',
                        border: '2px dashed #e2e8f0'
                    }}>
                        <ShoppingBag size={48} color="#cbd5e0" style={{ marginBottom: '16px' }} />
                        <p style={{ color: '#718096', fontSize: '16px', margin: 0 }}>
                            No hay pedidos
                        </p>
                    </div>
                ) : isMobile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {pedidosFiltrados.map(pedido => (
                            <PedidoCard
                                key={pedido.id}
                                pedido={pedido}
                                now={now}
                                onCambiarEstado={cambiarEstadoPedido}
                                onVerDetalle={(p) => {
                                    setPedidoSeleccionado(p);
                                    setMostrarDetalle(true);
                                }}
                                onEliminar={eliminarPedido}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead style={{ background: '#f7fafc' }}>
                                    <tr>
                                        <th style={thStyle}>Pedido</th>
                                        <th style={thStyle}>Tipo</th>
                                        <th style={thStyle}>Cliente/Mesa</th>
                                        <th style={thStyle}>Pago</th>
                                        <th style={thStyle}>Total</th>
                                        <th style={thStyle}>Estado</th>
                                        <th style={thStyle}>Hora</th>
                                        <th style={thStyle}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidosFiltrados.map(pedido => (
                                        <PedidoRow
                                            key={pedido.id}
                                            pedido={pedido}
                                            now={now}
                                            onCambiarEstado={cambiarEstadoPedido}
                                            onVerDetalle={(p) => {
                                                setPedidoSeleccionado(p);
                                                setMostrarDetalle(true);
                                            }}
                                            onEliminar={eliminarPedido}
                                            onEditar={editarPedido}
                                            isAdmin={isAdmin}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modales */}
                {mostrarModalNuevo && (
                    <ModalNuevoPedido
                        restauranteId={restauranteId}
                        userId={userId}
                        productos={productos}
                        onClose={() => setMostrarModalNuevo(false)}
                        onSuccess={() => {
                            cargarPedidos();
                            setMostrarModalNuevo(false);
                        }}
                    />
                )}

                {mostrarDetalle && pedidoSeleccionado && (
                    <PanelLateralPedido
                        pedido={pedidoSeleccionado}
                        onClose={() => {
                            setMostrarDetalle(false);
                            setPedidoSeleccionado(null);
                        }}
                        onCambiarEstado={cambiarEstadoPedido}
                        onEditar={(pedido) => {
                            setMostrarDetalle(false);
                            editarPedido(pedido);
                        }}
                    />
                )}
                {mostrarModalEditar && pedidoAEditar && (
                    <ModalEditarPedido
                        pedido={pedidoAEditar}
                        productos={productos}
                        onClose={() => {
                            setMostrarModalEditar(false);
                            setPedidoAEditar(null);
                        }}
                        onSuccess={() => {
                            cargarPedidos();
                            setMostrarModalEditar(false);
                            setPedidoAEditar(null);
                        }}
                    />
                )}
            </div>
        </>
    );
};

export default Pedidos;