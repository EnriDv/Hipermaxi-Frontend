import { useDashboard } from '../context/DashboardContext';
import { NavLink } from 'react-router-dom';

export const SimPanel = () => {
  const { state, onChange } = useDashboard();

  const triggerError = (code: number, message: string) => {
    onChange({
      ...state,
      activeError: {
        code,
        message,
        timestamp: Date.now(),
      },
    });
  };

  const triggerGlobalException = () => {
    const errorEvent = new ErrorEvent('error', {
      message: 'TypeError: Cannot read properties of undefined (reading \'split\') at ProductValidator.ts:145',
      filename: 'ProductValidator.ts',
      lineno: 145,
    });
    window.dispatchEvent(errorEvent);
  };

  const clearErrors = () => {
    onChange({
      ...state,
      activeError: undefined,
    });
  };

  return (
    <div className="sim-panel">
      <div className="sim-title">
        <span>🛠️ Panel de Simulación y Pruebas SOP (Proveedores)</span>
      </div>
      <div className="sim-row">
        {state.isAuthenticated && (
          <div className="sim-group">
            <span className="sim-label">Vistas:</span>
            <NavLink 
              to="/portal/catalog" 
              className={({ isActive }) => `sim-btn ${isActive ? 'active' : ''}`}
            >
              Catálogo Electrónico
            </NavLink>
            <NavLink 
              to="/portal/orders" 
              className={({ isActive }) => `sim-btn ${isActive ? 'active' : ''}`}
            >
              Órdenes de Compra
            </NavLink>
          </div>
        )}
        <div className="sim-group">
          <span className="sim-label">Alertas/Errores:</span>
          <button type="button" className="sim-btn err-btn" onClick={() => triggerError(500, 'Error 500: Fallo de conexión con el webservice de AGEMED (Servicio Caído).')}>
            Gatillar Error 500 (AGEMED)
          </button>
          <button type="button" className="sim-btn err-btn" onClick={() => triggerError(403, 'Error 403: No cuenta con permisos para modificar Avisos de Despacho Confirmados.')}>
            Gatillar Error 403 (Permisos)
          </button>
          <button type="button" className="sim-btn exception-btn" onClick={triggerGlobalException}>
            Inyectar Excepción JS
          </button>
          <button type="button" className="sim-btn clear-btn" onClick={clearErrors}>
            Limpiar Alertas
          </button>
        </div>
      </div>
      {state.activeError && (
        <div style={{ marginTop: '10px', background: '#fef2f2', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: '4px', fontSize: '0.8rem', color: '#b91c1c', textAlign: 'left', fontWeight: 600 }}>
          🚨 Alerta Activa: [{state.activeError.code}] {state.activeError.message}
        </div>
      )}
    </div>
  );
};
