import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import type { OrderItem } from '../../types';

export const InvoiceModal = () => {
  const { state, onChange } = useDashboard();

  if (!state.selectedOrderForInvoice) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      onChange({
        ...state,
        uploadedInvoiceFile: {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          status: 'Rechazado',
          error: 'Error: El portal de proveedores solo admite archivos de factura en formato PDF (SOP-05).',
        },
      });
      return;
    }

    // PDF uploads correctly
    if (state.invoiceScenario === 'C') {
      onChange({
        ...state,
        uploadedInvoiceFile: {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          status: 'Observada',
          error: 'Inconsistencia: Los precios unitarios del PDF difieren de los autorizados en la Orden de Compra.',
        },
      });
    } else {
      onChange({
        ...state,
        uploadedInvoiceFile: {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          status: 'Cargada',
        },
      });
    }
  };

  const handleConfirmInvoice = () => {
    if (!state.selectedOrderForInvoice || !state.uploadedInvoiceFile || state.uploadedInvoiceFile.status !== 'Cargada') return;
    const order = state.selectedOrderForInvoice;
    const updatedOrder: OrderItem = {
      ...order,
      invoiceStatus: 'Cargada',
    };
    const updatedList = state.ordersList.map((o: OrderItem) => o.id === order.id ? updatedOrder : o);

    onChange({
      ...state,
      ordersList: updatedList,
      selectedOrderForInvoice: null,
      uploadedInvoiceFile: null,
    });
    alert('¡Factura comercial procesada correctamente!');
  };

  return (
    <div className="portal-modal-backdrop">
      <div className="portal-modal-card">
        <div className="modal-header">
          <h3>Cargar Factura Comercial para la Orden {state.selectedOrderForInvoice.id}</h3>
          <button type="button" className="modal-close-btn" onClick={() => onChange({ ...state, selectedOrderForInvoice: null, uploadedInvoiceFile: null })}>✕</button>
        </div>
        <div className="modal-body">
          <p className="modal-description-text">Simulación interactiva de los tres escenarios del Flujo SOP-05. Selecciona uno para comprobar las respuestas del bot:</p>
          
          {/* Interactive Scenario Selector */}
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>Escenario de simulación comercial:</span>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label className="sim-radio-label">
                <input 
                  type="radio" 
                  name="scenario" 
                  checked={state.invoiceScenario === 'A'} 
                  onChange={() => onChange({ ...state, invoiceScenario: 'A', uploadedInvoiceFile: null })}
                />
                A (Botón Oculto)
              </label>
              <label className="sim-radio-label">
                <input 
                  type="radio" 
                  name="scenario" 
                  checked={state.invoiceScenario === 'B'} 
                  onChange={() => onChange({ ...state, invoiceScenario: 'B', uploadedInvoiceFile: null })}
                />
                B (Filtro Formato)
              </label>
              <label className="sim-radio-label">
                <input 
                  type="radio" 
                  name="scenario" 
                  checked={state.invoiceScenario === 'C'} 
                  onChange={() => onChange({ ...state, invoiceScenario: 'C', uploadedInvoiceFile: null })}
                />
                C (Factura Observada)
              </label>
            </div>
          </div>

          {/* Scenario A: Button hidden */}
          {state.invoiceScenario === 'A' ? (
            <div 
              className="hidden-uploader-box"
              title="ERROR: No se puede cargar factura. La Orden de Compra aún no se encuentra liberada por el departamento de Facturación de Hipermaxi."
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔒</div>
              <div style={{ fontWeight: 700, color: '#b91c1c', fontSize: '0.88rem' }}>Carga Inhabilitada</div>
              <div style={{ fontSize: '0.78rem', color: '#7f1d1d', marginTop: '4px' }}>
                (Haz hover para ver la causa de soporte o consulta al chatbot)
              </div>
            </div>
          ) : (
            /* Scenario B or C active area */
            <div className="uploader-active-area">
              <div className="upload-buttons-row">
                <div style={{ fontSize: '2rem', marginBottom: '4px' }}>📤</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Arrastra tu factura comercial o haz clic para subir
                </div>
                <input 
                  type="file" 
                  id="pdf-uploader" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
                <label htmlFor="pdf-uploader" className="upload-mock-btn pdf" style={{ cursor: 'pointer' }}>
                  Seleccionar Factura Comercial
                </label>
              </div>
            </div>
          )}

          {/* Uploaded File display */}
          {state.uploadedInvoiceFile && (
            <div className={`uploaded-file-card ${state.uploadedInvoiceFile.status}`}>
              <div className="file-info">
                <span className="file-icon">
                  {state.uploadedInvoiceFile.status === 'Rechazado' ? '❌' : '📄'}
                </span>
                <div>
                  <div className="file-name">{state.uploadedInvoiceFile.name}</div>
                  <div className="file-status">
                    {state.uploadedInvoiceFile.size} • Estado: <strong>{state.uploadedInvoiceFile.status}</strong>
                  </div>
                </div>
              </div>
              {state.uploadedInvoiceFile.error && (
                <div className="file-error-alert">
                  {state.uploadedInvoiceFile.error}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="import-excel-btn" onClick={() => onChange({ ...state, selectedOrderForInvoice: null, uploadedInvoiceFile: null })}>Cancelar</button>
          <button 
            type="button" 
            className="register-prod-btn" 
            disabled={!state.uploadedInvoiceFile || state.uploadedInvoiceFile.status !== 'Cargada'}
            onClick={handleConfirmInvoice}
          >
            Confirmar Factura
          </button>
        </div>
      </div>
    </div>
  );
};
