import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import type { PriceCatalogItem, ProductItem } from '../../types';

export const NewProductModal = () => {
  const { state, onChange } = useDashboard();
  
  const [openSection, setOpenSection] = useState<{ [key: string]: boolean }>({
    agemed: false,
    images: true,
    prices: true,
  });

  const [costInput, setCostInput] = useState('');
  const [qtyInput, setQtyInput] = useState('');
  const [currencyInput, setCurrencyInput] = useState('Bs');
  const [catalogInput, setCatalogInput] = useState('General');

  if (!state.newProductForm) return null;

  const toggleSection = (section: string) => {
    setOpenSection(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  const handleCloseNewProductModal = () => {
    onChange({
      ...state,
      newProductForm: undefined, // Fixes bug where modal wouldn't close
    });
  };

  const handleAddPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!costInput || !qtyInput || !state.newProductForm) return;

    const newItem: PriceCatalogItem = {
      id: `price_${Date.now()}`,
      cost: costInput,
      quantity: qtyInput,
      currency: currencyInput,
      catalog: catalogInput,
      status: 'Activo',
    };

    onChange({
      ...state,
      newProductForm: {
        ...state.newProductForm,
        priceCatalog: [...state.newProductForm.priceCatalog, newItem],
      },
    });

    setCostInput('');
    setQtyInput('');
  };

  const handleDeletePrice = (id: string) => {
    if (!state.newProductForm) return;
    onChange({
      ...state,
      newProductForm: {
        ...state.newProductForm,
        priceCatalog: state.newProductForm.priceCatalog.filter((p: PriceCatalogItem) => p.id !== id),
      },
    });
  };

  const handleSaveProduct = () => {
    const form = state.newProductForm;
    if (!form || !form.sanitaryRegister || !form.hasProductImage || form.priceCatalog.length === 0) {
      triggerError(500, 'Error 500: Fallo en la validación del Registro Sanitario o imagen obligatoria con AGEMED.');
      return;
    }

    const newProd: ProductItem = {
      id: `prod_${Date.now()}`,
      sku: `SKU-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      name: 'Nuevo Producto Cargado Proveedor',
      sanitaryRegister: form.sanitaryRegister,
      imageAttached: form.hasProductImage,
      prices: [...form.priceCatalog],
    };

    onChange({
      ...state,
      productsList: [...state.productsList, newProd],
      newProductForm: undefined,
    });
    alert('¡Producto guardado exitosamente en el catálogo!');
  };

  return (
    <div className="portal-modal-backdrop">
      <div className="portal-modal-card">
        <div className="modal-header">
          <h3>Registrar Nuevo Producto al Catálogo</h3>
          <button type="button" className="modal-close-btn" onClick={handleCloseNewProductModal}>✕</button>
        </div>
        <div className="modal-body">
          <p className="modal-description-text">Completa los campos obligatorios del formulario según las directrices técnicas del flujo SOP-04.</p>
          
          {/* Section A: AGEMED */}
          <div className="modal-form-section">
            <div className="section-bar" onClick={() => toggleSection('agemed')}>
              <span>📋 Registro Sanitario AGEMED</span>
              <span>{openSection.agemed ? '▼' : '▲'}</span>
            </div>
            {openSection.agemed && (
              <div className="section-expanded-body">
                <input 
                  type="text" 
                  className="modal-text-input" 
                  placeholder="Escribe el código sanitario (e.g. AGEMED-2026-8812)" 
                  value={state.newProductForm.sanitaryRegister}
                  onChange={(e) => onChange({
                    ...state,
                    newProductForm: {
                      ...state.newProductForm!,
                      sanitaryRegister: e.target.value,
                    }
                  })}
                />
              </div>
            )}
          </div>

          {/* Section B: Images */}
          <div className="modal-form-section">
            <div className="section-bar" onClick={() => toggleSection('images')}>
              <span>🖼️ Imagen del Producto (Formato Obligatorio JPG/PNG)</span>
              <span>{openSection.images ? '▼' : '▲'}</span>
            </div>
            {openSection.images && (
              <div className="section-expanded-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => onChange({
                      ...state,
                      newProductForm: {
                        ...state.newProductForm!,
                        hasProductImage: !state.newProductForm!.hasProductImage,
                      }
                    })}
                    style={{ padding: '10px', border: '1.5px solid var(--border-color)', borderRadius: '8px', background: state.newProductForm.hasProductImage ? '#f0fdf4' : '#ffffff' }}
                  >
                    📷 {state.newProductForm.hasProductImage ? 'Imagen Cargada' : 'Cargar Imagen (JPG/PNG)'}
                  </button>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {state.newProductForm.hasProductImage ? '✅ Archivo: chocolate_cookie.png (PNG - 105 KB)' : '⚠️ Ninguna imagen adjunta'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section C: Prices */}
          <div className="modal-form-section">
            <div className="section-bar" onClick={() => toggleSection('prices')}>
              <span>💰 Catálogo de Tarifas y Precios</span>
              <span>{openSection.prices ? '▼' : '▲'}</span>
            </div>
            {openSection.prices && (
              <div className="section-expanded-body">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input 
                    type="number" 
                    placeholder="Costo Unit" 
                    style={{ width: '90px', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="Cant. Mínima" 
                    style={{ width: '95px', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    value={qtyInput}
                    onChange={(e) => setQtyInput(e.target.value)}
                  />
                  <select 
                    style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    value={currencyInput}
                    onChange={(e) => setCurrencyInput(e.target.value)}
                  >
                    <option value="Bs">Bs</option>
                    <option value="USD">USD</option>
                  </select>
                  <select 
                    style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    value={catalogInput}
                    onChange={(e) => setCatalogInput(e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="Oferta">Oferta</option>
                  </select>
                  <button type="button" onClick={handleAddPrice} style={{ background: 'var(--color-primary)', color: '#ffffff', padding: '6px 12px', borderRadius: '4px', fontWeight: 600 }}>
                    + Agregar
                  </button>
                </div>

                <div className="table-wrapper">
                  <table className="portal-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Costo</th>
                        <th>Cant. Mínima</th>
                        <th>Moneda</th>
                        <th>Tarifa</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.newProductForm.priceCatalog.map((p: PriceCatalogItem) => (
                        <tr key={p.id}>
                          <td>{p.cost}</td>
                          <td>{p.quantity}</td>
                          <td>{p.currency}</td>
                          <td>{p.catalog}</td>
                          <td>
                            <button type="button" onClick={() => handleDeletePrice(p.id)} style={{ color: '#ef4444' }}>✕</button>
                          </td>
                        </tr>
                      ))}
                      {state.newProductForm.priceCatalog.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                            No se han añadido filas de precio
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="import-excel-btn" onClick={handleCloseNewProductModal}>Cancelar</button>
          <button type="button" className="register-prod-btn" onClick={handleSaveProduct}>Guardar Producto</button>
        </div>
      </div>
    </div>
  );
};
