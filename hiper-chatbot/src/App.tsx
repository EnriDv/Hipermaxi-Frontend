import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardContext } from './context/DashboardContext';
import { ChatInterface } from './components/ChatInterface';
import { SimPanel } from './components/SimPanel';
import { PortalLayout } from './layouts/PortalLayout';
import { Login } from './pages/Login';
import { Catalog } from './pages/Catalog';
import { Orders } from './pages/Orders';
import type { MockDashboardState } from './types';
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
  activeError: undefined,
};

function App() {
  const [dashboardState, setDashboardState] = useState<MockDashboardState>(INITIAL_DASHBOARD_STATE);
  const [helpTrigger, setHelpTrigger] = useState<{ query: string; timestamp: number } | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);

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
        setIsAppLoading(false);
      });
  }, []);

  const handleDashboardError = (error: any) => {
    setDashboardState(prev => ({
      ...prev,
      activeError: error
    }));
  };

  const handleHelpTrigger = (query: string) => {
    setHelpTrigger({
      query,
      timestamp: Date.now()
    });
  };

  if (isAppLoading) {
    return <div className="app-workspace"><div className="sim-panel">Cargando datos del portal...</div></div>;
  }

  return (
    <DashboardContext.Provider value={{ state: dashboardState, onChange: setDashboardState, onHelpTrigger: handleHelpTrigger }}>
      <BrowserRouter>
        <div className="app-workspace">
          {/* Underlying Dashboard Screen */}
          <main className="app-main-content">
            <div className="portal-container">
              <SimPanel />
              <Routes>
                {/* Auth Route */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected Portal Routes */}
                <Route path="/portal" element={
                  dashboardState.isAuthenticated ? <PortalLayout /> : <Navigate to="/login" replace />
                }>
                  <Route path="catalog" element={<Catalog />} />
                  <Route path="orders" element={<Orders />} />
                  {/* Default redirect inside portal */}
                  <Route index element={<Navigate to="catalog" replace />} />
                </Route>
                
                {/* Default redirect from root */}
                <Route path="*" element={<Navigate to={dashboardState.isAuthenticated ? "/portal/catalog" : "/login"} replace />} />
              </Routes>
            </div>
          </main>

          {/* Floating Interactive Chatbot (orange & white theme) */}
          <ChatInterface 
            dashboardState={dashboardState}
            onDashboardError={handleDashboardError}
            helpTrigger={helpTrigger}
          />
        </div>
      </BrowserRouter>
    </DashboardContext.Provider>
  );
}

export default App;
