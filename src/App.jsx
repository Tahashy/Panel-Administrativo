import React, { useState } from 'react';
import { AuthProvider, useAuth } from './modules/auth/AuthContext';
import Login from './modules/auth/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './modules/dashboard/Dashboard';
import Productos from './modules/productos/Productos';
import Toast from './components/Toast';  // ⬅️ NUEVO

function AppContent() {
  const { isAuthenticated, user, restaurante, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('panel');
  const [darkMode, setDarkMode] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleNuevoPedido = () => {
    alert('Función de nuevo pedido próximamente');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'panel':
        return <Dashboard restauranteId={restaurante.id} />;
      case 'pedidos':
        return <div style={{ padding: '32px' }}><h1>Pedidos (Próximamente)</h1></div>;
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
      <Toast />  {/* ⬅️ NUEVO */}
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f7fafc' }}>
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onLogout={logout}
          user={user}
          isAdmin={user.rol === 'admin'}
        />

        <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Navbar
            restaurante={restaurante}
            onNuevoPedido={handleNuevoPedido}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />

          <main style={{ marginTop: '70px', flex: 1, minHeight: 'calc(100vh - 70px)' }}>
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