import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import './Home.css';

export const Home = () => {
  const { state, onHelpTrigger } = useDashboard();
  const navigate = useNavigate();

  const handleIniciar = () => {
    if (state.isAuthenticated) {
      navigate('/portal/catalog');
    } else {
      navigate('/login');
    }
  };

  const handleSupportClick = () => {
    onHelpTrigger('Necesito soporte y ayuda con el portal de proveedores');
  };

  return (
    <div className="landing-page-container">
      <header className="landing-header">
        <div className="landing-header-left">
          <div className="landing-logo-emblem">
            <svg viewBox="0 0 100 100" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" rx="20" fill="#e05206" />
              <rect x="25" y="15" width="14" height="70" rx="7" fill="#ffffff" />
              <rect x="61" y="15" width="14" height="70" rx="7" fill="#ffffff" />
              <path d="M 39 38 Q 50 31 61 38" stroke="#ffffff" strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d="M 39 58 Q 50 65 61 58" stroke="#ffffff" strokeWidth="8" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <span className="landing-header-title">Portal Hipermaxi</span>
        </div>
        <div className="landing-header-right">
          <button 
            type="button" 
            className="landing-btn-support" 
            onClick={handleSupportClick}
          >
            <span className="btn-icon">📞</span> Soporte y Ayudas
          </button>
          <button 
            type="button" 
            className="landing-btn-start" 
            onClick={handleIniciar}
          >
            {state.isAuthenticated ? (
              <>
                <span className="btn-icon">➜</span> Ir al Portal
              </>
            ) : (
              <>
                <span className="btn-icon">➜]</span> Iniciar
              </>
            )}
          </button>
        </div>
      </header>

      <main className="landing-body">
        <div className="large-logo-container">
          <svg viewBox="0 0 300 180" width="300" height="180" xmlns="http://www.w3.org/2000/svg">
            <path d="M 75 110 A 75 75 0 0 1 225 110 Z" fill="#e05206" stroke="#003b6f" strokeWidth="8" />
            
            <g transform="translate(0, 8)">
              <rect x="134" y="56" width="9" height="42" rx="4.5" fill="#ffffff" />
              <rect x="157" y="56" width="9" height="42" rx="4.5" fill="#ffffff" />
              <path d="M 143 70 Q 150 64 157 70" stroke="#ffffff" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              <path d="M 143 82 Q 150 88 157 82" stroke="#ffffff" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            </g>
            
            <rect x="20" y="102" width="260" height="56" rx="6" fill="#e05206" stroke="#003b6f" strokeWidth="8" />
            
            <text 
              x="150" 
              y="144" 
              fontFamily="'Outfit', 'Outfit-Bold', sans-serif" 
              font-weight="900" 
              font-size="32" 
              fill="#ffffff" 
              textAnchor="middle" 
              letterSpacing="0.5"
            >
              HIPERMAXI
            </text>
          </svg>
        </div>

        <section className="portal-orange-box">
          <h1 className="portal-box-title">Portal Hipermaxi</h1>

          <div className="portal-grid">
            <div className="portal-grid-col">
              <div className="col-illustration-container">
                <svg viewBox="0 0 160 120" width="160" height="120" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="10" width="140" height="100" rx="12" fill="#2c3e50" />
                  
                  <g transform="translate(15, 10)">
                    <rect x="22" y="24" width="20" height="20" rx="4" fill="#fed7aa" />
                    <path d="M 22 28 Q 32 16 42 28 Z" fill="#475569" />
                    <circle cx="28" cy="32" r="1.5" fill="#1e293b" />
                    <circle cx="36" cy="32" r="1.5" fill="#1e293b" />
                    <path d="M 29 39 Q 32 41 35 39" stroke="#1e293b" strokeWidth="1.5" fill="none" />
                    
                    <path d="M 14 52 L 40 52 L 40 82 L 14 82 Z" fill="#ffffff" />
                    <path d="M 25 52 L 29 52 L 31 72 L 27 75 L 23 72 Z" fill="#ef4444" />
                    <path d="M 14 52 L 23 66 L 23 52 Z" fill="#334155" />
                    <path d="M 40 52 L 31 66 L 31 52 Z" fill="#334155" />
                    
                    <path d="M 14 52 L 2 66 L 10 71 L 18 57 Z" fill="#ffffff" />
                    <circle cx="4" cy="69" r="4.5" fill="#fed7aa" />
                  </g>

                  <g transform="translate(80, 10)">
                    <rect x="22" y="24" width="20" height="20" rx="4" fill="#fed7aa" />
                    <path d="M 22 28 Q 32 16 42 28 Z" fill="#78350f" />
                    <rect x="24" y="30" width="7" height="5" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
                    <rect x="33" y="30" width="7" height="5" rx="1" fill="none" stroke="#1e293b" strokeWidth="1.5" />
                    <line x1="31" y1="33" x2="33" y2="33" stroke="#1e293b" strokeWidth="1.5" />
                    <path d="M 29 39 Q 32 41 35 39" stroke="#1e293b" strokeWidth="1.5" fill="none" />
                    
                    <path d="M 14 52 L 40 52 L 40 82 L 14 82 Z" fill="#ffffff" />
                    <path d="M 25 52 L 29 52 L 31 72 L 27 75 L 23 72 Z" fill="#3b82f6" />
                    <path d="M 14 52 L 23 66 L 23 52 Z" fill="#334155" />
                    <path d="M 40 52 L 31 66 L 31 52 Z" fill="#334155" />
                    
                    <path d="M 40 52 L 52 66 L 44 71 L 36 57 Z" fill="#ffffff" />
                    <circle cx="50" cy="69" r="4.5" fill="#fed7aa" />
                  </g>

                  {/* Handshake fingers overlay in center */}
                  <g transform="translate(68, 66)">
                    <path d="M -15 -1 L 5 -1 M -15 2 L 5 2" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 30 -1 L 10 -1 M 30 2 L 10 2" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
                    <circle cx="7" cy="0" r="5.5" fill="#fed7aa" />
                    <circle cx="12" cy="0" r="5.5" fill="#fed7aa" />
                    <path d="M 4 -4 Q 9 1 14 -4" stroke="#2c3e50" strokeWidth="1.5" fill="none" />
                  </g>
                </svg>
              </div>
              <h2 className="portal-grid-title">Proveedores</h2>
              <p className="portal-grid-subtitle">Administración de Proveedores</p>
            </div>

            {/* Right Column: Productos & Catálogos */}
            <div className="portal-grid-col">
              <div className="col-illustration-container">
                <svg viewBox="0 0 160 120" width="160" height="120" xmlns="http://www.w3.org/2000/svg">
                  {/* Blue folder bag behind */}
                  <rect x="52" y="36" width="66" height="46" rx="6" fill="#006699" transform="rotate(-6, 85, 59)" />
                  <rect x="62" y="30" width="46" height="14" rx="3" fill="#004d73" transform="rotate(-6, 85, 59)" />
                  
                  {/* Document page leaning right */}
                  <rect x="92" y="24" width="38" height="48" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" transform="rotate(8, 111, 48)" />
                  <rect x="92" y="24" width="38" height="10" fill="#ef4444" transform="rotate(8, 111, 48)" />
                  <line x1="97" y1="42" x2="117" y2="45" stroke="#94a3b8" strokeWidth="2" transform="rotate(8, 111, 48)" />
                  <line x1="97" y1="49" x2="124" y2="53" stroke="#94a3b8" strokeWidth="2" transform="rotate(8, 111, 48)" />
                  <line x1="97" y1="56" x2="120" y2="59" stroke="#94a3b8" strokeWidth="2" transform="rotate(8, 111, 48)" />

                  {/* Hourglass left */}
                  <g transform="translate(18, 22) rotate(-12)">
                    <rect x="15" y="10" width="22" height="4" rx="1" fill="#ea580c" />
                    <rect x="15" y="48" width="22" height="4" rx="1" fill="#ea580c" />
                    <line x1="17" y1="14" x2="17" y2="48" stroke="#ea580c" strokeWidth="1.5" />
                    <line x1="35" y1="14" x2="35" y2="48" stroke="#ea580c" strokeWidth="1.5" />
                    <path d="M 19 14 C 19 26, 25 30, 25 30 C 25 30, 31 26, 31 14 Z" fill="#f1f5f9" stroke="#475569" strokeWidth="1.2" />
                    <path d="M 19 48 C 19 36, 25 30, 25 30 C 25 30, 31 36, 31 48 Z" fill="#f1f5f9" stroke="#475569" strokeWidth="1.2" />
                    <path d="M 21 43 C 21 46, 29 46, 29 43 L 27 38 L 23 38 Z" fill="#f59e0b" />
                    <path d="M 23 18 L 27 18 L 26 26 C 25 28, 25 28, 25 28 Z" fill="#f59e0b" />
                    <line x1="26" y1="28" x2="26" y2="38" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="1.5,1.5" />
                  </g>

                  {/* Clock / Pie Chart bottom left */}
                  <circle cx="34" cy="84" r="16" fill="#ffffff" stroke="#475569" strokeWidth="1.8" />
                  <path d="M 34 84 L 34 68 A 16 16 0 0 1 50 84 Z" fill="#3b82f6" />
                  <line x1="34" y1="84" x2="43" y2="84" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="34" y1="84" x2="34" y2="73" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" />

                  {/* Small elements */}
                  <circle cx="82" cy="18" r="3.5" fill="#38bdf8" />
                  <polygon points="132,18 136,25 128,25" fill="#f59e0b" />
                </svg>
              </div>
              <h2 className="portal-grid-title">Productos & Catálogos de Precios</h2>
              <p className="portal-grid-subtitle">Esta plataforma permite a nuestros proveedores mantenernos actualizados.</p>
            </div>
          </div>

          <p className="portal-box-footer-desc">
            Portal Hipermaxi es una plataforma web dirigida a los proveedores de Hipermaxi S.A. y sus filiales. Permite acceder a información y servicios especializados de una manera ágil, oportuna y segura que garantiza la comunicación constante con nosotros a través del grupo de negocios (Comercial / Compras)
          </p>
        </section>
      </main>

      {/* Footer copyright */}
      <footer className="landing-footer">
        <span>© 2026 - HIPERMAXI - BI - Versión <span className="version-badge">V3.15.106</span></span>
      </footer>
    </div>
  );
};
export default Home;
