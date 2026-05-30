import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useNavigate, Navigate } from 'react-router-dom';

export const Login = () => {
  const { state, onChange, onHelpTrigger } = useDashboard();
  const navigate = useNavigate();
  const [userVal, setUserVal] = useState('proveedor_hipermaxi');
  const [passVal, setPassVal] = useState('password123');

  // If already authenticated, redirect to catalog
  if (state.isAuthenticated) {
    return <Navigate to="/portal/catalog" replace />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userVal.trim() && passVal.trim()) {
      onChange({
        ...state,
        isAuthenticated: true,
        username: userVal,
      });
      navigate('/portal/catalog');
    }
  };

  const handleAuthHelpClick = (flowNum: number) => {
    let query = '';
    if (flowNum === 1) query = '¿Cómo solicito credenciales por primera vez?';
    if (flowNum === 2) query = '¿Cómo activo mi código de proveedor?';
    if (flowNum === 3) query = 'Olvidé mi contraseña o necesito reenvío';
    onHelpTrigger(query);
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-card">
        <div className="login-header-logo">
          <div className="hiper-orange-brand">Hipermaxi</div>
          <p>Portal de Proveedores Oficial</p>
        </div>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-form-group">
            <label htmlFor="user">Código o Nombre de Usuario</label>
            <input 
              type="text" 
              id="user" 
              value={userVal} 
              onChange={(e) => setUserVal(e.target.value)} 
              required 
            />
          </div>
          <div className="login-form-group">
            <label htmlFor="pass">Contraseña de Seguridad</label>
            <input 
              type="password" 
              id="pass" 
              value={passVal} 
              onChange={(e) => setPassVal(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="login-submit-btn">
            Iniciar Sesión
          </button>
        </form>

        <div className="login-help-links">
          <div className="help-section-title">¿Tienes problemas de acceso?</div>
          <button type="button" onClick={() => handleAuthHelpClick(1)}>
            🔑 Solicitar usuario nuevo (Flujo 1)
          </button>
          <button type="button" onClick={() => handleAuthHelpClick(3)}>
            ✉️ Reenvío de clave por extravío (Flujo 3)
          </button>
          <button type="button" onClick={() => handleAuthHelpClick(2)}>
            ⚙️ Activar Código de Catálogo (Flujo 2)
          </button>
        </div>
      </div>
    </div>
  );
};
