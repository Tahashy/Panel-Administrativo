// src/modules/pedidos/components/PanelLateralPedido.jsx

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Printer, Edit, Clock, CheckCircle, AlertCircle, Package as PackageIcon } from 'lucide-react';
import { getEstadoColor } from '../utils/pedidoHelpers';
import DropdownButton from './DropdownButton';
import ImpresionCocina from './ImpresionCocina';
import ImpresionRecibo from './ImpresionRecibo';

const PanelLateralPedido = ({ pedido, onClose, onCambiarEstado, onEditar }) => {
    const [vistaImpresion, setVistaImpresion] = useState(null);
    const isMobile = window.innerWidth < 768;

    const getTipoIcon = (tipo) => {
        const icons = {
            mesa: '🪑',
            llevar: '📦',
            delivery: '🚚'
        };
        return icons[tipo] || '🛒';
    };

    const handleImprimir = (tipo) => {
        setVistaImpresion(tipo);
        setTimeout(() => {
            window.print();
            setVistaImpresion(null);
        }, 100);
    };

    const opcionesImpresion = [
        {
            label: 'Ticket Cocina',
            value: 'cocina',
            icon: PackageIcon,
            color: '#FF6B35'
        },
        {
            label: 'Recibo Completo',
            value: 'recibo',
            icon: Printer,
            color: '#3B82F6'
        }
    ];

    const opcionesEstado = [
        {
            label: 'Pendiente',
            value: 'pendiente',
            icon: Clock,
            color: '#F59E0B'
        },
        {
            label: 'Preparando',
            value: 'preparando',
            icon: AlertCircle,
            color: '#FF6B35'
        },
        {
            label: 'Listo',
            value: 'listo',
            icon: CheckCircle,
            color: '#10B981'
        },
        {
            label: 'Entregado',
            value: 'entregado',
            icon: CheckCircle,
            color: '#6B7280'
        }
    ];

    const subtotal = pedido.pedido_items?.reduce((sum, item) =>
        sum + parseFloat(item.subtotal || 0), 0
    ) || 0;

    return ReactDOM.createPortal(
        <>
            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .panel-lateral {
                    animation: slideInRight 0.3s ease-out;
                }

                .panel-overlay {
                    animation: fadeIn 0.3s ease-out;
                }

                @media print {
                    .panel-lateral,
                    .panel-overlay {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Overlay */}
            <div
                className="panel-overlay"
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 999
                }}
            />

            {/* Panel Lateral */}
            <div
                className="panel-lateral"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: isMobile ? '100%' : '450px',
                    background: 'white',
                    boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #e2e8f0',
                    background: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px'
                    }}>
                        <div style={{ flex: 1 }}>
                            <h2 style={{
                                margin: '0 0 8px 0',
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#1a202c'
                            }}>
                                Pedido #{pedido.numero_pedido}
                            </h2>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flexWrap: 'wrap'
                            }}>
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
                                <span style={{
                                    padding: '6px 12px',
                                    background: '#f7fafc',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#4a5568',
                                    textTransform: 'capitalize'
                                }}>
                                    {getTipoIcon(pedido.tipo)} {pedido.tipo}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#f7fafc',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginLeft: '12px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#f7fafc'}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Botones de Acción */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                    }}>
                        <DropdownButton
                            label="Imprimir"
                            icon={Printer}
                            variant="secondary"
                            options={opcionesImpresion}
                            onSelect={handleImprimir}
                        />

                        {pedido.estado !== 'entregado' && pedido.estado !== 'anulado' && (
                            <>
                                <DropdownButton
                                    label="Estado"
                                    icon={AlertCircle}
                                    variant="success"
                                    options={opcionesEstado}
                                    onSelect={(nuevoEstado) => onCambiarEstado(pedido.id, nuevoEstado)}
                                />

                                <button
                                    onClick={() => onEditar(pedido)}
                                    style={{
                                        padding: '10px 16px',
                                        background: '#F59E0B',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                    <Edit size={18} />
                                    <span>Editar</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px'
                }}>
                    {/* Información del Pedido */}
                    <div style={{
                        padding: '16px',
                        background: '#f7fafc',
                        borderRadius: '12px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{
                            margin: '0 0 12px 0',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#1a202c'
                        }}>
                            Información del Pedido
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {pedido.tipo === 'mesa' && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', color: '#718096' }}>Mesa:</span>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>
                                        {pedido.numero_mesa}
                                    </span>
                                </div>
                            )}
                            {pedido.cliente_nombre && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', color: '#718096' }}>Cliente:</span>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>
                                        {pedido.cliente_nombre}
                                    </span>
                                </div>
                            )}
                            {pedido.direccion_delivery && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', color: '#718096' }}>Dirección:</span>
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1a202c',
                                        maxWidth: '60%',
                                        textAlign: 'right'
                                    }}>
                                        {pedido.direccion_delivery}
                                    </span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '14px', color: '#718096' }}>Método de Pago:</span>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#1a202c',
                                    textTransform: 'capitalize'
                                }}>
                                    {pedido.metodo_pago}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '14px', color: '#718096' }}>Hora:</span>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>
                                    {new Date(pedido.created_at).toLocaleTimeString('es-ES', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Productos */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{
                            margin: '0 0 16px 0',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#1a202c'
                        }}>
                            Productos ({pedido.pedido_items?.length || 0})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {pedido.pedido_items?.map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '14px',
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '4px'
                                    }}>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: '#1a202c',
                                            flex: 1
                                        }}>
                                            {item.cantidad}x {item.producto_nombre}
                                        </p>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            color: '#FF6B35'
                                        }}>
                                            ${parseFloat(item.subtotal).toFixed(2)}
                                        </p>
                                    </div>
                                    <p style={{
                                        margin: '0 0 4px 0',
                                        fontSize: '13px',
                                        color: '#718096'
                                    }}>
                                        ${parseFloat(item.precio_unitario).toFixed(2)} c/u
                                    </p>
                                    {item.agregados && item.agregados.length > 0 && (
                                        <div style={{ marginTop: '8px' }}>
                                            {item.agregados.map((ag, idx) => (
                                                <p key={idx} style={{
                                                    margin: '2px 0',
                                                    fontSize: '12px',
                                                    color: '#10B981',
                                                    fontWeight: '500'
                                                }}>
                                                    + {ag.nombre} (${parseFloat(ag.precio).toFixed(2)})
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notas */}
                    {pedido.notas && (
                        <div style={{
                            padding: '14px',
                            background: '#FFF7ED',
                            border: '1px solid #FDBA74',
                            borderRadius: '12px',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{
                                margin: '0 0 8px 0',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#C2410C'
                            }}>
                                📝 Notas del Pedido
                            </h4>
                            <p style={{
                                margin: 0,
                                fontSize: '14px',
                                color: '#9A3412',
                                lineHeight: '1.5'
                            }}>
                                {pedido.notas}
                            </p>
                        </div>
                    )}

                    {/* Totales */}
                    <div style={{
                        padding: '16px',
                        background: '#f7fafc',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            fontSize: '14px'
                        }}>
                            <span style={{ color: '#718096' }}>Subtotal:</span>
                            <span style={{ fontWeight: '600', color: '#4a5568' }}>
                                ${subtotal.toFixed(2)}
                            </span>
                        </div>
                        {pedido.taper_adicional && pedido.costo_taper > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                                fontSize: '14px'
                            }}>
                                <span style={{ color: '#718096' }}>Taper(s):</span>
                                <span style={{ fontWeight: '600', color: '#10B981' }}>
                                    ${parseFloat(pedido.costo_taper).toFixed(2)}
                                </span>
                            </div>
                        )}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '12px',
                            fontSize: '14px'
                        }}>
                            <span style={{ color: '#718096' }}>IVA (10%):</span>
                            <span style={{ fontWeight: '600', color: '#4a5568' }}>
                                ${parseFloat(pedido.iva || 0).toFixed(2)}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: '12px',
                            borderTop: '2px solid #e2e8f0',
                            fontSize: '18px'
                        }}>
                            <span style={{ fontWeight: '700', color: '#1a202c' }}>Total:</span>
                            <span style={{ fontWeight: '700', color: '#FF6B35' }}>
                                ${parseFloat(pedido.total).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vista de Impresión */}
            {vistaImpresion && (
                <div style={{ display: 'none' }}>
                    {vistaImpresion === 'cocina' ? (
                        <ImpresionCocina pedido={pedido} />
                    ) : (
                        <ImpresionRecibo pedido={pedido} />
                    )}
                </div>
            )}
        </>,
        document.body
    );
};

export default PanelLateralPedido;
