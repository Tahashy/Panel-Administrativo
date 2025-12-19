// src/modules/pedidos/components/ModalNuevoPedido.jsx

import React, { useState } from 'react';
import {
    Plus, Search, X, Minus, Utensils, Package, Truck
} from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { showToast } from '../../../components/Toast';
import { generarNumeroPedido, calcularTotales } from '../utils/pedidoHelpers';
import ModalAgregados from './ModalAgregados';

const ModalNuevoPedido = ({ restauranteId, userId, productos, onClose, onSuccess }) => {
    const [paso, setPaso] = useState(1);
    const [formData, setFormData] = useState({
        tipo: '',
        numero_mesa: '',
        direccion_delivery: '',
        cliente_nombre: '',
        cliente_celular: '',
        metodo_pago: 'efectivo',
        taper_adicional: false,
        notas: ''
    });

    const [carrito, setCarrito] = useState([]);
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('all');
    const [productoAgregados, setProductoAgregados] = useState(null);
    const [loading, setLoading] = useState(false);
    const [taperCustom, setTaperCustom] = useState({ descripcion: '', precio: '' });
    const [tapersAgregados, setTapersAgregados] = useState([]);

    const isMobile = window.innerWidth < 768;

    const categorias = [...new Set(productos.map(p => p.categorias?.nombre).filter(Boolean))];

    const productosFiltrados = productos.filter(p => {
        const matchBusqueda = p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase());
        const matchCategoria = categoriaFiltro === 'all' || p.categorias?.nombre === categoriaFiltro;
        return matchBusqueda && matchCategoria;
    });

    const agregarAlCarrito = (producto) => {
        if (producto.agregados && producto.agregados.length > 0) {
            setProductoAgregados(producto);
            return;
        }
        agregarProductoAlCarrito(producto, []);
    };

    const agregarProductoAlCarrito = (producto, agregadosSeleccionados) => {
        const itemExistente = carrito.find(item =>
            item.id === producto.id &&
            JSON.stringify(item.agregados) === JSON.stringify(agregadosSeleccionados)
        );

        if (itemExistente) {
            setCarrito(carrito.map(item =>
                item.id === producto.id && JSON.stringify(item.agregados) === JSON.stringify(agregadosSeleccionados)
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            setCarrito([...carrito, {
                id: producto.id,
                nombre: producto.nombre,
                precio: parseFloat(producto.precio),
                cantidad: 1,
                agregados: agregadosSeleccionados
            }]);
        }

        setProductoAgregados(null);
        showToast('Producto agregado', 'success');
    };

    const actualizarCantidad = (index, nuevaCantidad) => {
        if (nuevaCantidad <= 0) {
            setCarrito(carrito.filter((_, i) => i !== index));
        } else {
            setCarrito(carrito.map((item, i) =>
                i === index ? { ...item, cantidad: nuevaCantidad } : item
            ));
        }
    };

    const enviarPorWhatsApp = () => {
        if (!formData.cliente_celular) {
            showToast('Ingresa el número de celular del cliente', 'error');
            return;
        }

        const { subtotal, costoTaper, iva, total } = calcularTotales(carrito, tapersAgregados);

        let mensaje = `🍔 *TAKEMI FAST&FOOD*\n\n`;
        mensaje += `📋 *Detalle del Pedido*\n`;
        mensaje += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        if (formData.tipo === 'mesa') {
            mensaje += `🪑 Mesa: *${formData.numero_mesa}*\n`;
        } else if (formData.tipo === 'delivery') {
            mensaje += `🚚 Delivery: ${formData.direccion_delivery}\n`;
        }

        if (formData.cliente_nombre) {
            mensaje += `👤 Cliente: ${formData.cliente_nombre}\n`;
        }

        mensaje += `\n*Productos:*\n`;

        carrito.forEach(item => {
            mensaje += `\n• ${item.cantidad}x ${item.nombre}\n`;
            mensaje += `  $${item.precio.toFixed(2)} c/u\n`;

            if (item.agregados.length > 0) {
                item.agregados.forEach(ag => {
                    mensaje += `  + ${ag.nombre} ($${parseFloat(ag.precio).toFixed(2)})\n`;
                });
            }

            const totalItem = (item.precio + item.agregados.reduce((s, a) => s + parseFloat(a.precio), 0)) * item.cantidad;
            mensaje += `  Subtotal: $${totalItem.toFixed(2)}\n`;
        });

        mensaje += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        mensaje += `Subtotal: $${subtotal.toFixed(2)}\n`;

        if (formData.taper_adicional) {
            mensaje += `Taper adicional: $${costoTaper.toFixed(2)}\n`;
        }

        mensaje += `IVA (10%): $${iva.toFixed(2)}\n`;
        mensaje += `\n💰 *TOTAL: $${total.toFixed(2)}*\n`;
        mensaje += `\n💳 Método de pago: *${formData.metodo_pago.toUpperCase()}*\n`;

        if (formData.notas) {
            mensaje += `\n📝 Notas: ${formData.notas}\n`;
        }

        mensaje += `\n¡Gracias por tu pedido! 🎉`;

        const celular = formData.cliente_celular.replace(/\D/g, '');
        const url = `https://wa.me/${celular}?text=${encodeURIComponent(mensaje)}`;

        window.open(url, '_blank');
        showToast('Abriendo WhatsApp...', 'success');
    };

    const handleSubmit = async () => {
        if (carrito.length === 0) {
            showToast('Agrega productos al pedido', 'error');
            return;
        }

        setLoading(true);

        try {
            const { subtotal, costoTaper, iva, total } = calcularTotales(carrito, tapersAgregados);
            const numeroPedido = generarNumeroPedido();

            const { data: pedido, error: pedidoError } = await supabase
                .from('pedidos')
                .insert([{
                    restaurante_id: restauranteId,
                    usuario_id: userId,
                    numero_pedido: numeroPedido,
                    tipo: formData.tipo,
                    numero_mesa: formData.numero_mesa || null,
                    direccion_delivery: formData.direccion_delivery || null,
                    cliente_nombre: formData.cliente_nombre || null,
                    cliente_celular: formData.cliente_celular || null,
                    taper_adicional: tapersAgregados.length > 0,
                    costo_taper: tapersAgregados.reduce((sum, t) => sum + t.precio, 0),
                    subtotal: subtotal,
                    iva: iva,
                    total: total,
                    metodo_pago: formData.metodo_pago,
                    notas: formData.notas || null,
                    estado: 'pendiente'
                }])
                .select()
                .single();

            if (pedidoError) throw pedidoError;

            const items = carrito.map(item => ({
                pedido_id: pedido.id,
                producto_id: item.id,
                producto_nombre: item.nombre,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
                agregados: item.agregados,
                subtotal: (item.precio + item.agregados.reduce((s, a) => s + parseFloat(a.precio), 0)) * item.cantidad
            }));

            const { error: itemsError } = await supabase
                .from('pedido_items')
                .insert(items);

            if (itemsError) throw itemsError;

            showToast('Pedido creado exitosamente', 'success');

            if (formData.cliente_celular && (formData.tipo === 'llevar' || formData.tipo === 'delivery')) {
                setTimeout(() => {
                    showToast('¿Enviar pedido por WhatsApp?', 'info');
                }, 500);
            }

            onSuccess();
        } catch (error) {
            console.error('Error creando pedido:', error);
            showToast('Error al crear pedido', 'error');
        } finally {
            setLoading(false);
        }
    };

    const { subtotal, costoTaper, iva, total } = calcularTotales(carrito, tapersAgregados);

    return (
        <>
            <style>{`
        @media (max-width: 768px) {
          .modal-nuevo-pedido { max-width: 100% !important; height: 100vh !important; border-radius: 0 !important; }
          .productos-grid { grid-template-columns: 1fr !important; }
          .tipo-selector { grid-template-columns: 1fr !important; }
        }
      `}</style>

            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'center', zIndex: 1000,
                padding: isMobile ? 0 : '20px', overflow: 'auto'
            }}>
                <div className="modal-nuevo-pedido" style={{
                    background: 'white', borderRadius: isMobile ? 0 : '20px',
                    width: '100%', maxWidth: isMobile ? '100%' : '900px',
                    maxHeight: isMobile ? '100vh' : '90vh',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: isMobile ? '16px' : '24px',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <h2 style={{
                                margin: '0 0 4px 0', fontSize: isMobile ? '20px' : '24px',
                                fontWeight: '700', color: '#1a202c'
                            }}>Nuevo Pedido</h2>
                            <p style={{ margin: 0, fontSize: isMobile ? '13px' : '14px', color: '#718096' }}>
                                Paso {paso} de 3
                            </p>
                        </div>
                        <button onClick={onClose} style={{
                            width: '36px', height: '36px', borderRadius: '8px',
                            border: 'none', background: '#f7fafc', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Indicador de pasos */}
                    <div style={{
                        display: 'flex', padding: isMobile ? '12px 16px' : '16px 24px',
                        gap: '8px', background: '#f7fafc'
                    }}>
                        {[1, 2, 3].map(num => (
                            <div key={num} style={{
                                flex: 1, height: '4px', borderRadius: '4px',
                                background: paso >= num ? '#FF6B35' : '#e2e8f0',
                                transition: 'all 0.3s'
                            }} />
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{
                        flex: 1, overflowY: 'auto',
                        padding: isMobile ? '16px' : '24px'
                    }}>
                        {/* PASO 1: Información */}
                        {paso === 1 && (
                            <Paso1
                                formData={formData}
                                setFormData={setFormData}
                                isMobile={isMobile}
                            />
                        )}

                        {/* PASO 2: Productos */}
                        {paso === 2 && (
                            <Paso2
                                productosFiltrados={productosFiltrados}
                                categorias={categorias}
                                categoriaFiltro={categoriaFiltro}
                                setCategoriaFiltro={setCategoriaFiltro}
                                busquedaProducto={busquedaProducto}
                                setBusquedaProducto={setBusquedaProducto}
                                agregarAlCarrito={agregarAlCarrito}
                                carrito={carrito}
                                actualizarCantidad={actualizarCantidad}
                                isMobile={isMobile}
                            />
                        )}

                        {/* PASO 3: Confirmación */}
                        {paso === 3 && (
                            <Paso3
                                formData={formData}
                                setFormData={setFormData}
                                carrito={carrito}
                                taperCustom={taperCustom}
                                setTaperCustom={setTaperCustom}
                                tapersAgregados={tapersAgregados}
                                setTapersAgregados={setTapersAgregados}
                                enviarPorWhatsApp={enviarPorWhatsApp}
                                subtotal={subtotal}
                                costoTaper={costoTaper}
                                iva={iva}
                                total={total}
                                isMobile={isMobile}
                            />
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: isMobile ? '16px' : '24px',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex', gap: '12px', background: 'white'
                    }}>
                        {paso > 1 && (
                            <button
                                onClick={() => setPaso(paso - 1)}
                                style={{
                                    flex: 1, padding: isMobile ? '12px' : '14px',
                                    background: 'white', border: '2px solid #e2e8f0',
                                    borderRadius: '10px', fontSize: isMobile ? '14px' : '16px',
                                    fontWeight: '600', color: '#4a5568', cursor: 'pointer'
                                }}
                            >
                                Atrás
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (paso < 3) {
                                    if (paso === 1 && !formData.tipo) {
                                        showToast('Selecciona el tipo de pedido', 'error');
                                        return;
                                    }
                                    if (paso === 2 && carrito.length === 0) {
                                        showToast('Agrega productos al pedido', 'error');
                                        return;
                                    }
                                    setPaso(paso + 1);
                                } else {
                                    handleSubmit();
                                }
                            }}
                            disabled={loading}
                            style={{
                                flex: 2, padding: isMobile ? '12px' : '14px',
                                background: loading ? '#cbd5e0' : 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                                border: 'none', borderRadius: '10px',
                                fontSize: isMobile ? '14px' : '16px',
                                fontWeight: '600', color: 'white',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: loading ? 'none' : '0 4px 12px rgba(255,107,53,0.3)'
                            }}
                        >
                            {loading ? 'Creando...' : paso === 3 ? 'Crear Pedido' : 'Siguiente'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Agregados */}
            {productoAgregados && (
                <ModalAgregados
                    producto={productoAgregados}
                    onClose={() => setProductoAgregados(null)}
                    onConfirmar={(agregados) => agregarProductoAlCarrito(productoAgregados, agregados)}
                />
            )}
        </>
    );
};

// Componente Paso 1
const Paso1 = ({ formData, setFormData, isMobile }) => (
    <div>
        <h3 style={{
            margin: '0 0 20px 0', fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700', color: '#1a202c'
        }}>
            Información del Pedido
        </h3>

        {/* Tipo de Pedido */}
        <div className="tipo-selector" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '16px', marginBottom: '24px'
        }}>
            {[
                { tipo: 'mesa', icon: <Utensils size={32} />, label: 'Mesa' },
                { tipo: 'llevar', icon: <Package size={32} />, label: 'Para Llevar' },
                { tipo: 'delivery', icon: <Truck size={32} />, label: 'Delivery' }
            ].map(option => (
                <button
                    key={option.tipo}
                    onClick={() => setFormData({ ...formData, tipo: option.tipo })}
                    style={{
                        padding: isMobile ? '20px' : '24px',
                        border: `2px solid ${formData.tipo === option.tipo ? '#FF6B35' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        background: formData.tipo === option.tipo ? '#fff5f0' : 'white',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: '12px', transition: 'all 0.2s'
                    }}
                >
                    <div style={{ color: formData.tipo === option.tipo ? '#FF6B35' : '#718096' }}>
                        {option.icon}
                    </div>
                    <span style={{
                        fontSize: isMobile ? '15px' : '16px', fontWeight: '600',
                        color: formData.tipo === option.tipo ? '#FF6B35' : '#4a5568'
                    }}>
                        {option.label}
                    </span>
                </button>
            ))}
        </div>

        {/* Campos específicos por tipo */}
        {formData.tipo === 'mesa' && (
            <div style={{ marginBottom: '20px' }}>
                <label style={{
                    display: 'block', marginBottom: '8px',
                    fontSize: '14px', fontWeight: '600', color: '#2d3748'
                }}>
                    Número de Mesa *
                </label>
                <input
                    type="text"
                    placeholder="Ej: 5"
                    value={formData.numero_mesa}
                    onChange={(e) => setFormData({ ...formData, numero_mesa: e.target.value })}
                    style={{
                        width: '100%', padding: '12px 16px',
                        border: '2px solid #e2e8f0', borderRadius: '10px',
                        fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                    }}
                />
            </div>
        )}

        {formData.tipo === 'delivery' && (
            <div style={{ marginBottom: '20px' }}>
                <label style={{
                    display: 'block', marginBottom: '8px',
                    fontSize: '14px', fontWeight: '600', color: '#2d3748'
                }}>
                    Dirección de Entrega *
                </label>
                <input
                    type="text"
                    placeholder="Calle, número, referencia..."
                    value={formData.direccion_delivery}
                    onChange={(e) => setFormData({ ...formData, direccion_delivery: e.target.value })}
                    style={{
                        width: '100%', padding: '12px 16px',
                        border: '2px solid #e2e8f0', borderRadius: '10px',
                        fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                    }}
                />
            </div>
        )}

        {/* Campos adicionales */}
        {formData.tipo && (
            <>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block', marginBottom: '8px',
                        fontSize: '14px', fontWeight: '600', color: '#2d3748'
                    }}>
                        Nombre del Cliente (Opcional)
                    </label>
                    <input
                        type="text"
                        placeholder="Nombre del cliente"
                        value={formData.cliente_nombre}
                        onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                        style={{
                            width: '100%', padding: '12px 16px',
                            border: '2px solid #e2e8f0', borderRadius: '10px',
                            fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block', marginBottom: '8px',
                        fontSize: '14px', fontWeight: '600', color: '#2d3748'
                    }}>
                        Celular (WhatsApp) (Opcional)
                    </label>
                    <input
                        type="tel"
                        placeholder="Ej: +51 987654321"
                        value={formData.cliente_celular}
                        onChange={(e) => setFormData({ ...formData, cliente_celular: e.target.value })}
                        style={{
                            width: '100%', padding: '12px 16px',
                            border: '2px solid #e2e8f0', borderRadius: '10px',
                            fontSize: '15px', outline: 'none', boxSizing: 'border-box'
                        }}
                    />
                    <p style={{
                        margin: '4px 0 0 0', fontSize: '12px', color: '#718096'
                    }}>
                        📱 Se podrá enviar el detalle del pedido por WhatsApp
                    </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block', marginBottom: '8px',
                        fontSize: '14px', fontWeight: '600', color: '#2d3748'
                    }}>
                        Método de Pago *
                    </label>
                    <select
                        value={formData.metodo_pago}
                        onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                        style={{
                            width: '100%', padding: '12px 16px',
                            border: '2px solid #e2e8f0', borderRadius: '10px',
                            fontSize: '15px', outline: 'none', cursor: 'pointer',
                            boxSizing: 'border-box'
                        }}
                    >
                        <option value="efectivo">💵 Efectivo</option>
                        <option value="tarjeta">💳 Tarjeta</option>
                        <option value="yape">📱 Yape</option>
                        <option value="plin">📱 Plin</option>
                    </select>
                </div>
            </>
        )}
    </div>
);

// Continuará en la siguiente respuesta con Paso2 y Paso3...

// Componente Paso 2
const Paso2 = ({
    productosFiltrados,
    categorias,
    categoriaFiltro,
    setCategoriaFiltro,
    busquedaProducto,
    setBusquedaProducto,
    agregarAlCarrito,
    carrito,
    actualizarCantidad,
    isMobile
}) => (
    <div>
        <h3 style={{
            margin: '0 0 16px 0', fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700', color: '#1a202c'
        }}>
            Selecciona productos
        </h3>

        {/* Búsqueda */}
        <div style={{ marginBottom: '16px', position: 'relative' }}>
            <Search size={20} style={{
                position: 'absolute', left: '16px', top: '50%',
                transform: 'translateY(-50%)', color: '#a0aec0'
            }} />
            <input
                type="text"
                placeholder="Buscar productos..."
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                style={{
                    width: '100%', padding: '12px 16px 12px 48px',
                    border: '2px solid #e2e8f0', borderRadius: '10px',
                    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                }}
            />
        </div>

        {/* Filtro categorías */}
        <div style={{
            display: 'flex', gap: '8px', marginBottom: '20px',
            overflowX: 'auto', whiteSpace: 'nowrap'
        }}>
            <button
                onClick={() => setCategoriaFiltro('all')}
                style={{
                    padding: '8px 16px',
                    background: categoriaFiltro === 'all' ? '#FF6B35' : '#f7fafc',
                    color: categoriaFiltro === 'all' ? 'white' : '#718096',
                    border: 'none', borderRadius: '8px', fontSize: '13px',
                    fontWeight: '600', cursor: 'pointer'
                }}
            >
                Todos
            </button>
            {categorias.map(cat => (
                <button
                    key={cat}
                    onClick={() => setCategoriaFiltro(cat)}
                    style={{
                        padding: '8px 16px',
                        background: categoriaFiltro === cat ? '#FF6B35' : '#f7fafc',
                        color: categoriaFiltro === cat ? 'white' : '#718096',
                        border: 'none', borderRadius: '8px', fontSize: '13px',
                        fontWeight: '600', cursor: 'pointer'
                    }}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Grid productos */}
        <div className="productos-grid" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '12px', marginBottom: '20px',
            maxHeight: isMobile ? 'calc(100vh - 450px)' : '400px',
            overflowY: 'auto'
        }}>
            {productosFiltrados.map(producto => (
                <div
                    key={producto.id}
                    style={{
                        padding: '12px', border: '1px solid #e2e8f0',
                        borderRadius: '10px', background: 'white',
                        display: 'flex', gap: '12px', alignItems: 'center',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onClick={() => agregarAlCarrito(producto)}
                >
                    <div style={{
                        width: isMobile ? '50px' : '60px',
                        height: isMobile ? '50px' : '60px',
                        borderRadius: '8px',
                        background: producto.imagen_url ? `url(${producto.imagen_url}) center/cover` : '#f7fafc',
                        flexShrink: 0
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                            margin: '0 0 4px 0', fontSize: isMobile ? '13px' : '14px',
                            fontWeight: '600', color: '#1a202c',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                            {producto.nombre}
                        </p>
                        {producto.agregados && producto.agregados.length > 0 && (
                            <p style={{
                                margin: '0 0 4px 0', fontSize: '11px', color: '#10B981', fontWeight: '600'
                            }}>
                                + Agregados disponibles
                            </p>
                        )}
                        <p style={{
                            margin: 0, fontSize: isMobile ? '15px' : '16px',
                            fontWeight: '700', color: '#FF6B35'
                        }}>
                            ${parseFloat(producto.precio).toFixed(2)}
                        </p>
                    </div>
                    <button style={{
                        padding: '8px', background: '#10B981', border: 'none',
                        borderRadius: '6px', color: 'white', cursor: 'pointer'
                    }}>
                        <Plus size={16} />
                    </button>
                </div>
            ))}
        </div>

        {/* Carrito */}
        {carrito.length > 0 && (
            <div style={{
                padding: isMobile ? '12px' : '16px',
                background: '#f7fafc', borderRadius: '12px', marginTop: '20px'
            }}>
                <h4 style={{
                    margin: '0 0 12px 0', fontSize: isMobile ? '14px' : '16px',
                    fontWeight: '700', color: '#1a202c'
                }}>
                    Carrito ({carrito.length} items)
                </h4>
                {carrito.map((item, index) => (
                    <div key={index} style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', padding: '8px 0',
                        borderBottom: '1px solid #e2e8f0'
                    }}>
                        <div style={{ flex: 1 }}>
                            <span style={{
                                fontSize: isMobile ? '13px' : '14px',
                                color: '#4a5568', display: 'block'
                            }}>
                                {item.nombre}
                            </span>
                            {item.agregados.length > 0 && (
                                <span style={{ fontSize: '11px', color: '#10B981' }}>
                                    + {item.agregados.map(a => a.nombre).join(', ')}
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                                style={{
                                    width: '28px', height: '28px', background: '#e2e8f0',
                                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Minus size={14} />
                            </button>
                            <span style={{
                                fontSize: isMobile ? '13px' : '14px', fontWeight: '600',
                                minWidth: '30px', textAlign: 'center'
                            }}>
                                {item.cantidad}
                            </span>
                            <button
                                onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                                style={{
                                    width: '28px', height: '28px', background: '#FF6B35',
                                    border: 'none', borderRadius: '6px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white'
                                }}
                            >
                                <Plus size={14} />
                            </button>
                            <span style={{
                                fontSize: isMobile ? '13px' : '14px', fontWeight: '700',
                                color: '#FF6B35', minWidth: '60px', textAlign: 'right'
                            }}>
                                ${((item.precio + item.agregados.reduce((s, a) => s + parseFloat(a.precio), 0)) * item.cantidad).toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// Componente Paso 3
const Paso3 = ({
    formData,
    setFormData,
    carrito,
    taperCustom,
    setTaperCustom,
    tapersAgregados,
    setTapersAgregados,
    enviarPorWhatsApp,
    subtotal,
    costoTaper,
    iva,
    total,
    isMobile
}) => (
    <div>
        <h3 style={{
            margin: '0 0 20px 0', fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700', color: '#1a202c'
        }}>
            Confirma el pedido
        </h3>

        {/* Resumen */}
        <div style={{
            padding: isMobile ? '16px' : '20px',
            background: '#f7fafc', borderRadius: '12px', marginBottom: '20px'
        }}>
            <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#718096' }}>
                    Tipo de pedido
                </p>
                <p style={{
                    margin: 0, fontSize: '16px', fontWeight: '600',
                    color: '#1a202c', textTransform: 'capitalize'
                }}>
                    {formData.tipo}
                    {formData.tipo === 'mesa' && ` - Mesa ${formData.numero_mesa}`}
                    {formData.cliente_nombre && ` - ${formData.cliente_nombre}`}
                </p>
                {formData.cliente_celular && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#10B981' }}>
                        📱 {formData.cliente_celular}
                    </p>
                )}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <p style={{
                    margin: '0 0 12px 0', fontSize: '14px',
                    fontWeight: '600', color: '#4a5568'
                }}>
                    Productos ({carrito.length})
                </p>
                {carrito.map((item, index) => (
                    <div key={index}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            marginBottom: '4px', fontSize: isMobile ? '13px' : '14px'
                        }}>
                            <span>{item.cantidad}x {item.nombre}</span>
                            <span style={{ fontWeight: '600' }}>
                                ${(item.precio * item.cantidad).toFixed(2)}
                            </span>
                        </div>
                        {item.agregados.map((ag, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between',
                                marginBottom: '4px', fontSize: '12px', color: '#10B981',
                                paddingLeft: '16px'
                            }}>
                                <span>+ {ag.nombre}</span>
                                <span>${(parseFloat(ag.precio) * item.cantidad).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Tapers Adicionales */}
            <div style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '16px',
                marginTop: '16px'
            }}>
                <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2d3748'
                }}>
                    Tapers Adicionales (opcional)
                </p>

                {/* Input para agregar taper */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr auto',
                    gap: '8px',
                    marginBottom: '12px'
                }}>
                    <input
                        type="text"
                        placeholder="Descripción"
                        value={taperCustom.descripcion}
                        onChange={(e) => setTaperCustom({ ...taperCustom, descripcion: e.target.value })}
                        style={{
                            padding: '10px 12px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Precio"
                        value={taperCustom.precio}
                        onChange={(e) => setTaperCustom({ ...taperCustom, precio: e.target.value })}
                        style={{
                            padding: '10px 12px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            if (taperCustom.descripcion && taperCustom.precio) {
                                setTapersAgregados([...tapersAgregados, {
                                    id: Date.now(),
                                    descripcion: taperCustom.descripcion,
                                    precio: parseFloat(taperCustom.precio)
                                }]);
                                setTaperCustom({ descripcion: '', precio: '' });
                                showToast('Taper agregado', 'success');
                            } else {
                                showToast('Completa la descripción y precio del taper', 'error');
                            }
                        }}
                        style={{
                            padding: '10px 16px',
                            background: '#10B981',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Agregar
                    </button>
                </div>

                {/* Lista de tapers agregados */}
                {tapersAgregados.length > 0 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {tapersAgregados.map((taper, index) => (
                            <div
                                key={taper.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px'
                                }}
                            >
                                <span style={{ fontSize: '14px', color: '#4a5568' }}>
                                    {taper.descripcion}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#10B981' }}>
                                        ${taper.precio.toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setTapersAgregados(tapersAgregados.filter((_, i) => i !== index));
                                            showToast('Taper eliminado', 'success');
                                        }}
                                        style={{
                                            padding: '4px 8px',
                                            background: '#FEE2E2',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: '#EF4444',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Método de pago */}
            <div style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '12px', marginTop: '12px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#718096' }}>Método de pago:</span>
                    <span style={{
                        fontSize: '14px', fontWeight: '600',
                        textTransform: 'capitalize'
                    }}>
                        {formData.metodo_pago}
                    </span>
                </div>
            </div>
        </div>

        {/* Notas */}
        <div style={{ marginBottom: '20px' }}>
            <label style={{
                display: 'block', marginBottom: '8px',
                fontSize: '14px', fontWeight: '600', color: '#2d3748'
            }}>
                Notas (Opcional)
            </label>
            <textarea
                placeholder="Instrucciones especiales..."
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                rows={3}
                style={{
                    width: '100%', padding: '12px 16px',
                    border: '2px solid #e2e8f0', borderRadius: '10px',
                    fontSize: '14px', outline: 'none', resize: 'vertical',
                    fontFamily: 'inherit', boxSizing: 'border-box'
                }}
            />
        </div>

        {/* Botón WhatsApp */}
        {formData.cliente_celular && (
            <button
                type="button"
                onClick={enviarPorWhatsApp}
                style={{
                    width: '100%', padding: '12px', marginBottom: '16px',
                    background: '#25D366', border: 'none', borderRadius: '10px',
                    color: 'white', fontSize: '14px', fontWeight: '600',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s'
                }}
            >
                📱 Vista previa en WhatsApp
            </button>
        )}

        {/* Resumen de totales */}
        <div style={{
            padding: '16px',
            background: '#f7fafc',
            borderRadius: '12px',
            border: '2px solid #e2e8f0'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#718096' }}>Subtotal:</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
            </div>
            {costoTaper > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#718096' }}>Tapers:</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#10B981' }}>${costoTaper.toFixed(2)}</span>
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#718096' }}>IVA (10%):</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>${iva.toFixed(2)}</span>
            </div>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                paddingTop: '12px', borderTop: '2px solid #e2e8f0'
            }}>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#1a202c' }}>TOTAL:</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#FF6B35' }}>${total.toFixed(2)}</span>
            </div>
        </div>
    </div>
);

export default ModalNuevoPedido;