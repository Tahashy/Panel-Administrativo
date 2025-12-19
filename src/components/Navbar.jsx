import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, Plus, Menu } from 'lucide-react';

const Navbar = ({ restaurante, onNuevoPedido, darkMode, setDarkMode, setSidebarOpen }) => {
  const [notifications] = useState(2);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div style={{
      height: '70px',
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50
    }}>
      {/* Left Side: Hamburger + Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1,
        minWidth: 0 // Permite que el flex funcione correctamente
      }}>
        {/* Botón Hamburguesa (solo móvil) */}
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            background: 'white',
            cursor: 'pointer',
            display: window.innerWidth >= 1024 ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#FF6B35';
            e.currentTarget.style.background = '#fff5f0';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = 'white';
          }}
        >
          <Menu size={20} color="#4a5568" />
        </button>

        {/* Search */}
        <div style={{
          flex: 1,
          maxWidth: searchFocused ? '100%' : '500px',
          position: 'relative',
          transition: 'all 0.3s'
        }}>
          <Search 
            size={20} 
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#a0aec0',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Buscar..."
            style={{
              width: '100%',
              padding: '10px 16px 10px 48px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#FF6B35';
              e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.1)';
              setSearchFocused(true);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
              setSearchFocused(false);
            }}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0
      }}>
        {/* Nuevo Pedido Button */}
        <button
          onClick={onNuevoPedido}
          style={{
            padding: window.innerWidth >= 640 ? '10px 20px' : '10px 12px',
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
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,107,53,0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,107,53,0.3)';
          }}
        >
          <Plus size={18} />
          {window.innerWidth >= 640 && <span>Nuevo pedido</span>}
        </button>

        {/* Notifications */}
        <button
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            background: 'white',
            cursor: 'pointer',
            display: window.innerWidth >= 640 ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#FF6B35';
            e.currentTarget.style.background = '#fff5f0';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = 'white';
          }}
        >
          <Bell size={20} color="#4a5568" />
          {notifications > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '18px',
              height: '18px',
              background: '#EF4444',
              borderRadius: '50%',
              color: 'white',
              fontSize: '11px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {notifications}
            </span>
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#FF6B35';
            e.currentTarget.style.background = '#fff5f0';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = 'white';
          }}
        >
          {darkMode ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#4a5568" />}
        </button>

        {/* Restaurant Info (solo tablet+) */}
        {window.innerWidth >= 768 && (
          <div style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '10px',
            color: 'white',
            fontSize: '13px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '200px'
          }}>
            {restaurante?.nombre}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;