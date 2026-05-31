import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { loginAPI } from '../services/difyService';
import { clearAccessToken, setAccessToken, setProviderProfile } from '../services/authStorage';
import { getUserMessageFromError } from '../services/apiClient';

export const Login = () => {
  const { state, onChange, onHelpTrigger } = useDashboard();
  const navigate = useNavigate();
  const [userVal, setUserVal] = useState('proveedor_hipermaxi');
  const [passVal, setPassVal] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getLoginErrorMessage = (error: unknown): string => {
    const userMessage = getUserMessageFromError(error);
    if (userMessage) return userMessage;
    return 'Ups, algo salio mal al iniciar sesion. Intenta nuevamente o contacta a soporte.';
  };

  // If already authenticated, redirect to catalog
  if (state.isAuthenticated) {
    return <Navigate to="/portal/catalog" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = userVal.trim();
    const password = passVal;
    if (!email || !password) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await loginAPI({ email, password });
      setAccessToken(response.access_token);
      setProviderProfile(response.provider || {});
      onChange({
        ...state,
        isAuthenticated: true,
        username: response.provider?.name ?? email,
      });
      navigate('/portal/catalog');
    } catch (error) {
      console.error('Login failed', error);
      clearAccessToken();
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
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
          <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
            Iniciar Sesión
          </button>
        </form>
        {errorMessage ? <div className="login-error-message">{errorMessage}</div> : null}
      </div>
    </div>
  );
};
