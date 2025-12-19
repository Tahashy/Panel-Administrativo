import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection, onLogout, user, isAdmin, sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { id: 'panel', label: 'Panel', icon: LayoutDashboard },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'pagos', label: 'Pagos', icon: CreditCard, adminOnly: true },
    { id: 'informes', label: 'Informes', icon: BarChart3, adminOnly: true },
    { id: 'configuracion', label: 'Configuración', icon: Settings, adminOnly: true },
  ];

  const filteredItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  const handleItemClick = (itemId) => {
    setActiveSection(itemId);
    // Cerrar sidebar en móvil después de seleccionar
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
            display: window.innerWidth >= 1024 ? 'none' : 'block'
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: '260px',
        height: '100vh',
        background: 'linear-gradient(180deg, #1a202c 0%, #2d3748 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: sidebarOpen || window.innerWidth >= 1024 ? 0 : '-260px',
        top: 0,
        zIndex: 100,
        transition: 'left 0.3s ease',
        boxShadow: '2px 0 12px rgba(0,0,0,0.1)'
      }}>
        {/* Logo + Close Button */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'relative'
        }}>
          {/* Botón cerrar (solo móvil) */}
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              display: window.innerWidth >= 1024 ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
          >
            <X size={18} />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              🍔
            </div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                color: 'white'
              }}>
                TAKEMI FAST&FOOD
              </h2>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: '#a0aec0'
              }}>
                Sistema de Gestión
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav style={{
          flex: 1,
          padding: '20px 12px',
          overflowY: 'auto'
        }}>
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '6px',
                  background: isActive ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  color: isActive ? '#FF6B35' : '#cbd5e0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '15px',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#cbd5e0';
                  }
                }}
              >
                <Icon size={20} />
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                {isActive && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.nombre}
              </p>
              <p style={{
                margin: 0,
                fontSize: '11px',
                color: '#a0aec0',
                textTransform: 'capitalize'
              }}>
                {user?.rol}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#fc8181',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;