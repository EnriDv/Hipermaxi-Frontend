import { useState } from 'react';
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
  
  // Product List
  productsList: [
    {
      id: 'prod_1',
      sku: 'SKU-GAL-1024',
      name: 'Galletas de Chocolate Rellenas Hipermaxi 150g',
      sanitaryRegister: 'AGEMED-2026-10243',
      imageAttached: true,
      prices: [
        {
          id: 'p1',
          cost: '19.80',
          quantity: '16',
          currency: 'Bs',
          catalog: 'General',
          status: 'Activo',
        }
      ]
    }
  ],

  // Orders List
  ordersList: [
    {
      id: 'OC-2026-0981',
      date: '30/05/2026',
      businessUnit: 'Sucursal Equipetrol (SCZ)',
      providerCode: 'PROV-00812',
      totalOC: '316.80',
      totalAVD: '0.00',
      currencyOC: 'Bs',
      despatchAlert: 'Sin Aviso de Despacho',
      invoiceStatus: 'Sin Factura',
      items: [
        {
          itemNum: 1,
          barcodeProv: '7441002340012',
          barcodeHiper: '0001-98762',
          productName: 'Galletas de Chocolate Rellenas Hipermaxi 150g',
          currency: 'Bs',
          qtyOC: 16,
          unitPrice: 19.80,
          subtotal: 316.80,
          qtyDespatch: 0,
        }
      ]
    },
    {
      id: 'OC-2026-1122',
      date: '28/05/2026',
      businessUnit: 'Sucursal Plan 3000 (SCZ)',
      providerCode: 'PROV-00812',
      totalOC: '750.00',
      totalAVD: '750.00',
      currencyOC: 'Bs',
      despatchAlert: 'Confirmado',
      invoiceStatus: 'Sin Factura',
      items: [
        {
          itemNum: 1,
          barcodeProv: '7441002340050',
          barcodeHiper: '0002-34567',
          productName: 'Leche Condensada Hipermaxi 395g',
          currency: 'Bs',
          qtyOC: 50,
          unitPrice: 15.00,
          subtotal: 750.00,
          qtyDespatch: 50,
        }
      ]
    }
  ],

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
