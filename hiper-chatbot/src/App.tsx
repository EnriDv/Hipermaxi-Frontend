import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardContext } from './context/DashboardContext';
import { ChatInterface } from './components/ChatInterface';
import { PortalLayout } from './layouts/PortalLayout';
import { Login } from './pages/Login';
import { Catalog } from './pages/Catalog';
import { Orders } from './pages/Orders';
import { Home } from './pages/Home';
import type { MockDashboardState } from './types';
import { getUserMessageFromError } from './services/apiClient';
import { getAccessToken, getProviderProfile } from './services/authStorage';
import './App.css';

const INITIAL_DASHBOARD_STATE: MockDashboardState = {
  isAuthenticated: false,
  username: '',
  activeTab: 'catalogo',
  
  // Empty initially, will be populated by fetch
  productsList: [],
  ordersList: [],

  selectedOrderForInvoice: null,
  selectedOrderForAVD: null,
  invoiceScenario: 'A',
  uploadedInvoiceFile: null,
  newProductForm: undefined,
};

const getInitialDashboardState = (): MockDashboardState => {
  const accessToken = getAccessToken();
  const providerProfile = getProviderProfile();
  const providerName = providerProfile && typeof providerProfile.name === 'string'
    ? providerProfile.name
    : '';

  return {
    ...INITIAL_DASHBOARD_STATE,
    isAuthenticated: Boolean(accessToken),
    username: providerName,
  };
};

function App() {
  const [dashboardState, setDashboardState] = useState<MockDashboardState>(() => getInitialDashboardState());
  const [helpTrigger, setHelpTrigger] = useState<{ query: string; timestamp: number } | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);

  const syncAuthFromStorage = useCallback(() => {
    const accessToken = getAccessToken();
    const providerProfile = getProviderProfile();
    const providerName = providerProfile && typeof providerProfile.name === 'string'
      ? providerProfile.name
      : '';

    setDashboardState((prev) => {
      const nextAuth = Boolean(accessToken);
      if (
        prev.isAuthenticated === nextAuth &&
        (nextAuth ? prev.username === providerName || !providerName : prev.username === '')
      ) {
        return prev;
      }
      return {
        ...prev,
        isAuthenticated: nextAuth,
        username: nextAuth ? (providerName || prev.username) : '',
      };
    });
  }, []);

  // Fetch initial fake data
  useEffect(() => {
    fetch('/fakeData.json')
      .then(res => res.json())
      .then(data => {
        setDashboardState(prev => ({
          ...prev,
          productsList: data.productsList || [],
          ordersList: data.ordersList || [],
        }));
        setIsAppLoading(false);
      })
      .catch(err => {
        console.error('Error loading fakeData.json', err);
        const userMessage = getUserMessageFromError(err);
        setAppError(userMessage || 'Ups, algo salio mal al cargar el portal. Intenta nuevamente o contacta a soporte.');
        setIsAppLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleStorage = () => syncAuthFromStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [syncAuthFromStorage]);



  const handleHelpTrigger = (query: string) => {
    setHelpTrigger({
      query,
      timestamp: Date.now()
    });
  };

  if (isAppLoading) {
    return <div className="app-workspace"><div className="sim-panel">Cargando datos del portal...</div></div>;
  }

  if (appError) {
    return <div className="app-workspace"><div className="sim-panel">{appError}</div></div>;
  }

  return (
    <DashboardContext.Provider value={{ state: dashboardState, onChange: setDashboardState, onHelpTrigger: handleHelpTrigger }}>
      <BrowserRouter>
        <div className="app-workspace">
          {/* Underlying Dashboard Screen */}
          <main className="app-main-content">
            <div className="portal-container">
              <Routes>
                {/* Landing Page Route */}
                <Route path="/" element={<Home />} />

                {/* Auth Route */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected Portal Routes */}
                <Route path="/portal" element={
                  dashboardState.isAuthenticated ? <PortalLayout /> : <Navigate to="/" replace />
                }>
                  <Route path="catalog" element={<Catalog />} />
                  <Route path="orders" element={<Orders />} />
                  {/* Default redirect inside portal */}
                  <Route index element={<Navigate to="catalog" replace />} />
                </Route>
                
                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>

          {/* Floating Interactive Chatbot (orange & white theme) */}
          <ChatInterface 
            dashboardState={dashboardState}
            helpTrigger={helpTrigger}
          />
        </div>
      </BrowserRouter>
    </DashboardContext.Provider>
  );
}

export default App;
