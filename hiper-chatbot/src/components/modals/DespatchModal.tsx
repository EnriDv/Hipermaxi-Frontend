import { useDashboard } from '../../context/DashboardContext';
import type { OrderItem } from '../../types';

export const DespatchModal = () => {
  const { state, onChange } = useDashboard();

  if (!state.selectedOrderForAVD) return null;

  const handleCopyQuantities = () => {
    if (!state.selectedOrderForAVD) return;
    const order = state.selectedOrderForAVD;
    const updatedItems = order.items.map((item) => ({
      ...item,
      qtyDespatch: item.qtyOC,
    }));
    const updatedOrder: OrderItem = {
      ...order,
      items: updatedItems,
      totalAVD: order.totalOC,
    };
    onChange({
      ...state,
      selectedOrderForAVD: updatedOrder,
    });
  };

  const triggerError = (code: number, message: string) => {
    alert(`Error [${code}]: ${message}`);
  };

  const handleQtyDespatchChange = (index: number, val: string) => {
    if (!state.selectedOrderForAVD) return;
    const order = state.selectedOrderForAVD;
    const parsed = parseInt(val) || 0;
    const updatedItems = order.items.map((item, idx) => {
      if (idx === index) {
        return { ...item, qtyDespatch: parsed };
      }
      return item;
    });

    // Calculate new total AVD cost
    const newTotalAVD = updatedItems.reduce((acc, item) => acc + (item.qtyDespatch * item.unitPrice), 0);

    const updatedOrder: OrderItem = {
      ...order,
      items: updatedItems,
      totalAVD: newTotalAVD.toFixed(2),
    };

    onChange({
      ...state,
      selectedOrderForAVD: updatedOrder,
    });
  };

  const handleConfirmDespacho = () => {
    if (!state.selectedOrderForAVD) return;
    const order = state.selectedOrderForAVD;
    const hasZeroQty = order.items.some((item) => item.qtyDespatch === 0);

    if (hasZeroQty) {
      triggerError(403, 'Error 403: Permisos de despacho denegados. No se puede confirmar Aviso de Despacho (AVD) con ítems en cantidad cero.');
      return;
    }

    const updatedOrder: OrderItem = {
      ...order,
      despatchAlert: 'Confirmado',
    };

    // Update in orders list
    const updatedList = state.ordersList.map((o: OrderItem) => o.id === order.id ? updatedOrder : o);

    onChange({
      ...state,
      ordersList: updatedList,
      selectedOrderForAVD: updatedOrder,
    });
    alert('¡AVD Confirmado exitosamente!');
  };

  return (
    <div className="portal-modal-backdrop">
      <div className="portal-modal-card wide">
        <div className="modal-header">
          <h3>Aviso de Despacho (AVD) - Orden {state.selectedOrderForAVD.id}</h3>
          <button type="button" className="modal-close-btn" onClick={() => onChange({ ...state, selectedOrderForAVD: null })}>✕</button>
        </div>
        <div className="modal-body">
          <div className="avd-meta-card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '0.82rem', textAlign: 'left' }}>
              <div><strong>Razón Social:</strong> Hipermaxi S.A.</div>
              <div><strong>Cod. Proveedor:</strong> {state.selectedOrderForAVD.providerCode}</div>
              <div><strong>Unidad Recepción:</strong> {state.selectedOrderForAVD.businessUnit}</div>
              <div><strong>Fecha:</strong> {state.selectedOrderForAVD.date}</div>
              <div><strong>Total Solicitado OC:</strong> {state.selectedOrderForAVD.totalOC} {state.selectedOrderForAVD.currencyOC}</div>
              <div><strong>Total Despachado AVD:</strong> {state.selectedOrderForAVD.totalAVD} {state.selectedOrderForAVD.currencyOC}</div>
            </div>
          </div>

          {/* SOP-06 Locked AVD alert */}
          {state.selectedOrderForAVD.despatchAlert === 'Confirmado' && (
            <div className="scenario-info-banner lock-alert">
              🔒 <strong>Aviso de Despacho Bloqueado (Confirmado):</strong> De acuerdo con el procedimiento <strong>SOP-06</strong>, una vez que el AVD pasa al estado "Confirmado" se bloquean irreversiblemente los campos en base de datos. Si necesitas hacer cambios, debes comunicarte con el Comprador comercial para que lo anule en sistemas.
            </div>
          )}

          <div className="table-wrapper">
            <table className="portal-table purchase-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Código Barra Proveedor</th>
                  <th>Código Barra Hipermaxi</th>
                  <th>Descripción del Artículo</th>
                  <th>Moneda</th>
                  <th>Cant. Solicitada OC</th>
                  <th>Precio Costo</th>
                  <th>Subtotal OC</th>
                  <th style={{ width: '130px' }}>Cant. Despacho</th>
                </tr>
              </thead>
              <tbody>
                {state.selectedOrderForAVD.items.map((item, index) => (
                  <tr key={item.itemNum} className={state.selectedOrderForAVD?.despatchAlert === 'Confirmado' ? 'orange-row' : ''}>
                    <td>{item.itemNum}</td>
                    <td className="sku-cell">{item.barcodeProv}</td>
                    <td className="sku-cell">{item.barcodeHiper}</td>
                    <td className="bold-cell">{item.productName}</td>
                    <td>{item.currency}</td>
                    <td>{item.qtyOC}</td>
                    <td>{item.unitPrice.toFixed(2)}</td>
                    <td>{item.subtotal.toFixed(2)}</td>
                    <td>
                      <input 
                        type="number"
                        className="modal-text-input"
                        style={{ margin: 0, padding: '4px 8px', fontSize: '0.8rem', textAlign: 'center' }}
                        value={item.qtyDespatch || ''}
                        onChange={(e) => handleQtyDespatchChange(index, e.target.value)}
                        disabled={state.selectedOrderForAVD?.despatchAlert === 'Confirmado'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="import-excel-btn" onClick={() => onChange({ ...state, selectedOrderForAVD: null })}>Cerrar</button>
          <button 
            type="button" 
            className="action-link-btn green"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            disabled={state.selectedOrderForAVD.despatchAlert === 'Confirmado'}
            onClick={handleCopyQuantities}
          >
            Copiar Cant. OC
          </button>
          <button 
            type="button" 
            className="register-prod-btn" 
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            disabled={state.selectedOrderForAVD.despatchAlert === 'Confirmado'}
            onClick={handleConfirmDespacho}
          >
            Confirmar Despacho (AVD)
          </button>
        </div>
      </div>
    </div>
  );
};
