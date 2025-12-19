import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './modules/auth/AuthContext';
import Login from './modules/auth/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './modules/dashboard/Dashboard';
import Productos from './modules/productos/Productos';
import Pedidos from './modules/pedidos/Pedidos';
import Toast from './components/Toast';


function AppContent() {
  const { isAuthenticated, user, restaurante, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('panel');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Detectar cambios en el tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // En desktop, asegurar que sidebar esté cerrado (se muestra fijo)
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleNuevoPedido = () => {
    alert('Funcionalidad de nuevo pedido aún no implementada.');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'panel':
        return <Dashboard restauranteId={restaurante.id} />;
      case 'pedidos':
        return <Pedidos restauranteId={restaurante.id} userId={user.id} isAdmin={user.rol === 'admin'} />;
      case 'productos':
        return <Productos restauranteId={restaurante.id} isAdmin={user.rol === 'admin'} />;
      case 'pagos':
        return <div style={{ padding: '32px' }}><h1>Pagos (Próximamente)</h1></div>;
      case 'informes':
        return <div style={{ padding: '32px' }}><h1>Informes (Próximamente)</h1></div>;
      case 'configuracion':
        return <div style={{ padding: '32px' }}><h1>Configuración (Próximamente)</h1></div>;
      default:
        return <Dashboard restauranteId={restaurante.id} />;
    }
  };

  return (
    <>
      <Toast />
      <div style={{ 
        display: 'flex', 
        minHeight: '100vh', 
        background: '#f7fafc',
        position: 'relative'
      }}>
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onLogout={logout}
          user={user}
          isAdmin={user.rol === 'admin'}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div style={{ 
          marginLeft: isMobile ? 0 : '260px',
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          width: isMobile ? '100%' : 'auto'
        }}>
          <Navbar
            restaurante={restaurante}
            onNuevoPedido={handleNuevoPedido}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            setSidebarOpen={setSidebarOpen}
          />

          <main style={{ 
            marginTop: '70px', 
            flex: 1, 
            minHeight: 'calc(100vh - 70px)',
            width: '100%',
            overflowX: 'hidden'
          }}>
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;