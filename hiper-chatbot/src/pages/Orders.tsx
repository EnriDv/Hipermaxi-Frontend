import { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import type { OrderItem } from '../types';
import { InvoiceModal } from '../components/modals/InvoiceModal';
import { DespatchModal } from '../components/modals/DespatchModal';

export const Orders = () => {
  const { state, onChange } = useDashboard();
  
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('Todos');

  return (
    <div className="workspace-tab-content">
      <div className="workspace-header">
        <h2>Lista de Órdenes de Compra Vigentes</h2>
        <div className="portal-filters-row">
          <input 
            type="text" 
            placeholder="Buscar por Nro. Orden (e.g. OC-2026)..." 
            className="filter-search-input"
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
          />
          <div className="filter-select-group">
            <span>Estado AVD:</span>
            <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Sin Aviso de Despacho">Sin Aviso de Despacho</option>
              <option value="Borrador">Borrador</option>
              <option value="Confirmado">Confirmado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Nro. Orden</th>
              <th>Fecha Emisión</th>
              <th>Unidad Sucursal</th>
              <th>Cod. Prov</th>
              <th>Total OC</th>
              <th>Total AVD</th>
              <th>Estado Despacho</th>
              <th>Facturación PDF</th>
              <th style={{ width: '220px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {state.ordersList
              .filter((order: OrderItem) => {
                const matchesSearch = order.id.toLowerCase().includes(orderSearch.toLowerCase());
                const matchesFilter = orderFilter === 'Todos' || order.despatchAlert === orderFilter;
                return matchesSearch && matchesFilter;
              })
              .map((order: OrderItem) => (
                <tr key={order.id}>
                  <td className="sku-cell">{order.id}</td>
                  <td>{order.date}</td>
                  <td>{order.businessUnit}</td>
                  <td className="sku-cell">{order.providerCode}</td>
                  <td className="bold-cell">{order.totalOC} {order.currencyOC}</td>
                  <td className="bold-cell">{order.totalAVD} {order.currencyOC}</td>
                  <td>
                    <span className={`status-badge-outline ${order.despatchAlert.replace(/ /g, '.')}`}>
                      {order.despatchAlert}
                    </span>
                  </td>
                  <td>
                    <span className={`invoice-badge ${order.invoiceStatus.replace(/ /g, '-')}`}>
                      {order.invoiceStatus}
                    </span>
                  </td>
                  <td>
                    <div className="flex-actions">
                      <button 
                        type="button" 
                        className="action-link-btn green"
                        onClick={() => onChange({ ...state, selectedOrderForAVD: order })}
                      >
                        🚚 AVD / Despachar
                      </button>
                      <button 
                        type="button" 
                        className="action-link-btn orange"
                        onClick={() => onChange({ ...state, selectedOrderForInvoice: order })}
                      >
                        🧾 Cargar Factura
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <InvoiceModal />
      <DespatchModal />
    </div>
  );
};
