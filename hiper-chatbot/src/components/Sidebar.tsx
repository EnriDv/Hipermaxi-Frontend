import { useDashboard } from '../context/DashboardContext';
import { NavLink, useNavigate } from 'react-router-dom';

export const Sidebar = () => {
  const { state, onChange } = useDashboard();
  const navigate = useNavigate();

  const handleLogout = () => {
    onChange({
      ...state,
      isAuthenticated: false,
      username: '',
    });
    navigate('/login');
  };

  return (
    <div className="portal-sidebar">
      <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>Hipermaxi</div>
        <span className="user-badge">{state.username}</span>
      </div>
      <NavLink 
        to="/portal/catalog" 
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        onClick={() => onChange({ ...state, activeTab: 'catalogo' })}
      >
        📦 Catálogo de Productos
      </NavLink>
      <NavLink 
        to="/portal/orders" 
        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        onClick={() => onChange({ ...state, activeTab: 'compras' })}
      >
        🧾 Órdenes de Compra
      </NavLink>
      <button type="button" className="logout-btn" onClick={handleLogout} style={{ marginTop: 'auto', textAlign: 'left', padding: '12px 16px' }}>
        🚪 Cerrar Sesión
      </button>
    </div>
  );
};
