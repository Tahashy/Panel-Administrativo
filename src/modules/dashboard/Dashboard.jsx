import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Users,
  MoreVertical
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ restauranteId }) => {
  const [stats, setStats] = useState({
    pedidosHoy: 0,
    ventasHoy: 0,
    mesasOcupadas: 0,
    productoEstrella: '-'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, [restauranteId]);

  const cargarEstadisticas = async () => {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Pedidos de hoy
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('restaurante_id', restauranteId)
        .gte('created_at', hoy.toISOString());

      if (!pedidosError && pedidos) {
        const totalVentas = pedidos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
        const mesasOcupadas = pedidos.filter(p => 
          p.tipo === 'mesa' && p.estado !== 'entregado' && p.estado !== 'cancelado'
        ).length;

        setStats({
          pedidosHoy: pedidos.length,
          ventasHoy: totalVentas,
          mesasOcupadas: mesasOcupadas,
          productoEstrella: 'Pizza Margarita'
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            color: '#718096',
            fontWeight: '500'
          }}>
            {title}
          </p>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a202c'
          }}>
            {loading ? '...' : value}
          </h3>
          {trend && (
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: '#10b981',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <TrendingUp size={14} />
              {trend}
            </p>
          )}
        </div>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={28} color={color} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: window.innerWidth >= 640 ? '32px' : '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: window.innerWidth >= 640 ? '32px' : '24px',
          fontWeight: '700',
          color: '#1a202c'
        }}>
          Panel de control
        </h1>
        <p style={{
          margin: 0,
          fontSize: '16px',
          color: '#718096'
        }}>
          Resumen general del restaurante
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth >= 768 ? 'repeat(auto-fit, minmax(250px, 1fr))' : '1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Pedidos Hoy"
          value={stats.pedidosHoy}
          icon={ShoppingBag}
          color="#FF6B35"
          trend="+12% contra ayer"
        />
        <StatCard
          title="Ventas del Día"
          value={`$${stats.ventasHoy.toFixed(2)}`}
          icon={DollarSign}
          color="#10B981"
          trend="+8% contra ayer"
        />
        <StatCard
          title="Mesas ocupadas"
          value={`${stats.mesasOcupadas}/20`}
          icon={Users}
          color="#3B82F6"
          trend="60% ocupación"
        />
        <StatCard
          title="Producto Estrella"
          value={stats.productoEstrella}
          icon={TrendingUp}
          color="#8B5CF6"
          trend="24 vendidas hoy"
        />
      </div>

      {/* Ventas de la Semana + Top Productos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth >= 1024 ? '2fr 1fr' : '1fr',
        gap: '24px'
      }}>
        <VentasSemana />
        <TopProductos />
      </div>
    </div>
  );
};

// Componente de Ventas de la Semana
const VentasSemana = () => {
  const [activeTab, setActiveTab] = useState('semana');
  
  // Datos de ejemplo
  const dataSemana = [
    { dia: 'Lun', ventas: 420 },
    { dia: 'Mar', ventas: 380 },
    { dia: 'Mié', ventas: 510 },
    { dia: 'Jue', ventas: 450 },
    { dia: 'Vie', ventas: 680 },
    { dia: 'Sáb', ventas: 890 },
    { dia: 'Dom', ventas: 740 }
  ];

  const totalSemana = dataSemana.reduce((sum, d) => sum + d.ventas, 0);
  const promedioDiario = totalSemana / dataSemana.length;
  const mejorDia = dataSemana.reduce((max, d) => d.ventas > max.ventas ? d : max, dataSemana[0]);

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{
            margin: '0 0 4px 0',
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a202c'
          }}>
            Ventas de la Semana
          </h2>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#718096'
          }}>
            Comparativa diaria
          </p>
        </div>
        
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: '#f7fafc',
          padding: '4px',
          borderRadius: '10px'
        }}>
          <button
            onClick={() => setActiveTab('semana')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'semana' ? '#FF6B35' : 'transparent',
              color: activeTab === 'semana' ? 'white' : '#718096',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Semana
          </button>
          <button
            onClick={() => setActiveTab('mes')}
            style={{
              padding: '8px 16px',
              background: activeTab === 'mes' ? '#FF6B35' : 'transparent',
              color: activeTab === 'mes' ? 'white' : '#718096',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Mes
          </button>
        </div>
      </div>

      {/* Gráfico */}
      <div style={{ height: window.innerWidth >= 640 ? '280px' : '200px', marginBottom: '24px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataSemana}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="dia" 
              stroke="#718096"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#718096"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="ventas" 
              stroke="#FF6B35" 
              strokeWidth={3}
              dot={{ fill: '#FF6B35', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth >= 640 ? 'repeat(3, 1fr)' : '1fr',
        gap: '16px'
      }}>
        <div style={{
          padding: '16px',
          background: '#f7fafc',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 4px 0',
            fontSize: '12px',
            color: '#718096',
            fontWeight: '500'
          }}>
            Total Semana
          </p>
          <p style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a202c'
          }}>
            ${totalSemana.toLocaleString()}
          </p>
        </div>
        
        <div style={{
          padding: '16px',
          background: '#f7fafc',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 4px 0',
            fontSize: '12px',
            color: '#718096',
            fontWeight: '500'
          }}>
            Promedio Diario
          </p>
          <p style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a202c'
          }}>
            ${promedioDiario.toFixed(0)}
          </p>
        </div>
        
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 4px 0',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '500'
          }}>
            Mejor Día
          </p>
          <p style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: 'white'
          }}>
            {mejorDia.dia}
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente Top Productos
const TopProductos = () => {
  const productos = [
    { 
      id: 1, 
      nombre: 'Pizza Margarita', 
      categoria: 'Platos principales',
      precio: 675, 
      ventas: 45,
      tendencia: '+15%',
      color: '#FF6B35'
    },
    { 
      id: 2, 
      nombre: 'Hamburguesa Clásica', 
      categoria: 'Platos principales',
      precio: 570, 
      ventas: 38,
      tendencia: '+12%',
      color: '#F59E0B'
    },
    { 
      id: 3, 
      nombre: 'Ensalada César', 
      categoria: 'Entradas',
      precio: 384, 
      ventas: 32,
      tendencia: '+8%',
      color: '#10B981'
    },
    { 
      id: 4, 
      nombre: 'Coca Cola', 
      categoria: 'Bebidas',
      precio: 168, 
      ventas: 56,
      tendencia: '+20%',
      color: '#3B82F6'
    },
    { 
      id: 5, 
      nombre: 'Tiramisú', 
      categoria: 'Postres',
      precio: 252, 
      ventas: 28,
      tendencia: '+5%',
      color: '#8B5CF6'
    }
  ];

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{
            margin: '0 0 4px 0',
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a202c'
          }}>
            Top Productos
          </h2>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#718096'
          }}>
            Más vendidos hoy
          </p>
        </div>
        <button style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          border: 'none',
          background: '#f7fafc',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
        onMouseOut={(e) => e.currentTarget.style.background = '#f7fafc'}
        >
          <MoreVertical size={18} color="#718096" />
        </button>
      </div>

      {/* Lista de Productos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {productos.map((producto, index) => (
          <div
            key={producto.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#f7fafc',
              borderRadius: '12px',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#edf2f7';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#f7fafc';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            {/* Número */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: producto.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: '700',
              flexShrink: 0
            }}>
              {index + 1}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: '0 0 2px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1a202c',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {producto.nombre}
              </p>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: '#718096'
              }}>
                {producto.categoria}
              </p>
            </div>

            {/* Precio y Stats */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{
                margin: '0 0 2px 0',
                fontSize: '16px',
                fontWeight: '700',
                color: '#1a202c'
              }}>
                ${producto.precio}
              </p>
              <p style={{
                margin: 0,
                fontSize: '11px',
                color: '#10b981',
                fontWeight: '600'
              }}>
                {producto.tendencia} ({producto.ventas})
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Ver todos */}
      <button style={{
        width: '100%',
        marginTop: '16px',
        padding: '12px',
        background: 'transparent',
        border: '2px dashed #e2e8f0',
        borderRadius: '12px',
        color: '#718096',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = '#FF6B35';
        e.currentTarget.style.color = '#FF6B35';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.color = '#718096';
      }}
      >
        Ver todos los productos →
      </button>
    </div>
  );
};

export default Dashboard;