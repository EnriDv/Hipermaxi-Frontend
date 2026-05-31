import { useDashboard } from '../context/DashboardContext';
import type { ProductItem, PriceCatalogItem } from '../types';
import { NewProductModal } from '../components/modals/NewProductModal';

export const Catalog = () => {
  const { state, onChange } = useDashboard();

  const handleDeleteProduct = (id: string) => {
    onChange({
      ...state,
      productsList: state.productsList.filter((p: ProductItem) => p.id !== id),
    });
  };

  const handleOpenNewProductModal = () => {
    onChange({
      ...state,
      newProductForm: {
        description: '',
        internalCode: '',
        sanitaryRegister: '',
        hasProductImage: false,
        priceCatalog: [],
      },
    });
  };

  return (
    <div className="workspace-tab-content">
      <div className="workspace-header">
        <h2>Catálogo Electrónico (Productos del Proveedor)</h2>
        <div className="header-actions">
          <button type="button" className="import-excel-btn" onClick={() => alert('Simulación: Formulario Excel importado con éxito (5 registros leídos).')}>
            📥 Importar Excel
          </button>
          <button type="button" className="register-prod-btn" onClick={handleOpenNewProductModal}>
            ✚ Registrar Producto
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Código SKU</th>
              <th>Nombre del Producto</th>
              <th>Registro Sanitario (AGEMED)</th>
              <th>Imagen Adjunta</th>
              <th>Precios Tarifario</th>
              <th style={{ width: '80px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {state.productsList.map((prod: ProductItem) => (
              <tr key={prod.id}>
                <td className="sku-cell">{prod.sku}</td>
                <td className="bold-cell">{prod.name}</td>
                <td>{prod.sanitaryRegister}</td>
                <td>{prod.imageAttached ? '✅ Cargada (JPG/PNG)' : '❌ Sin Imagen'}</td>
                <td>
                  {prod.prices.map((pr: PriceCatalogItem) => (
                    <div key={pr.id} style={{ fontSize: '0.78rem' }}>
                      • cost: {pr.cost} {pr.currency} ({pr.quantity} un) - {pr.catalog}
                    </div>
                  ))}
                </td>
                <td>
                  <button type="button" onClick={() => handleDeleteProduct(prod.id)} title="Eliminar del catálogo" style={{ color: '#ef4444', fontSize: '1.1rem' }}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NewProductModal />
    </div>
  );
};
