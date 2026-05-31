import type { Conversation, MockDashboardState } from '../../types';

export interface SuggestedChip {
  label: string;
  query: string;
  isSupport?: boolean;
  isTicket?: boolean;
}

export const buildScreenLabel = (state: MockDashboardState): string => {
  if (!state.isAuthenticated) {
    return 'Pantalla de Login';
  }
  if (state.activeTab === 'catalogo') {
    if (state.newProductForm && state.newProductForm.sanitaryRegister !== undefined) {
      return 'Modal Registrar Producto';
    }
    return 'Catálogo Electrónico';
  }

  if (state.selectedOrderForInvoice) {
    return `Modal Factura OC ${state.selectedOrderForInvoice.id} (Escenario ${state.invoiceScenario})`;
  }
  if (state.selectedOrderForAVD) {
    return `Modal AVD OC ${state.selectedOrderForAVD.id} (${state.selectedOrderForAVD.despatchAlert})`;
  }
  return 'Órdenes de Compra';
};

export const buildSuggestedChips = (options: {
  dashboardState: MockDashboardState;
  activeConversation: Conversation | null;
  isInPortal: boolean;
}): SuggestedChip[] => {
  const { dashboardState: state, activeConversation, isInPortal } = options;
  const chips: SuggestedChip[] = [];
  const isPortalContext = state.isAuthenticated && isInPortal;

  const credentialFaqs: SuggestedChip[] = [
    { label: 'Necesito mis credenciales', query: '¿Cómo solicito mis credenciales por primera vez?' },
    { label: 'Olvide de credenciales', query: 'No recibí mis credenciales, necesito que las reenvíen' },
    { label: 'Activar mi código proveedor', query: '¿Cómo activo mi código de proveedor para el catálogo?' },
  ];

  if (!isPortalContext) {
    chips.push(...credentialFaqs);
    chips.push({ label: '- Servicio Técnico (WhatsApp)', query: 'Hablar con el Servicio Técnico', isSupport: true });
    return chips;
  }

  if (state.activeTab === 'catalogo') {
    if (state.newProductForm && state.newProductForm.sanitaryRegister !== undefined) {
      chips.push({ label: '- Formatos de imagen aceptados', query: '¿Qué formatos de imagen acepta el portal?' });
      chips.push({ label: '- Registro sanitario (AGEMED)', query: '¿Cómo debo ingresar el registro sanitario?' });
      chips.push({ label: '- Cómo agregar precios', query: '¿Cómo agrego precios al catálogo?' });
    } else {
      chips.push({ label: '- Registrar un producto', query: 'Como puedo registrar un producto al catalogo?' });
      chips.push({ label: '- Datos obligatorios', query: '¿Qué campos son obligatorios para registrar un producto?' });
    }
  } else if (state.activeTab === 'compras') {
    if (state.selectedOrderForInvoice) {
      chips.push({ label: '- No aparece el botón de factura', query: 'No veo el botón para cargar la factura en la OC' });
      chips.push({ label: '- Rechazo al subir PDF', query: 'El sistema no acepta mi archivo de factura' });
      chips.push({ label: '- Factura Observada', query: 'Mi factura salió observada, ¿qué significa?' });
    } else if (state.selectedOrderForAVD) {
      chips.push({ label: '- Cambiar cantidades del AVD', query: 'Necesito cambiar cantidades del Aviso de Despacho' });
      chips.push({ label: '- AVD confirmado', query: 'Mi Aviso de Despacho quedó confirmado y no puedo editarlo' });
      chips.push({ label: '- Copiar cantidades de OC', query: '¿Para qué sirve Copiar cantidades de la OC?' });
    } else {
      chips.push({ label: '- Subir factura PDF', query: '¿Cómo subo mi factura PDF a una orden?' });
      chips.push({ label: '- Aviso de Despacho', query: '¿Cómo completo el Aviso de Despacho (AVD)?' });
      chips.push({ label: '- AVD no editable', query: '¿Qué pasa si confirmo el AVD y necesito cambiarlo?' });
    }
  }

  chips.push({ label: '- Servicio Técnico (WhatsApp)', query: 'Hablar con el Servicio Técnico', isSupport: true });

  return chips;
};

export const buildWelcomeSuggestions = (chips: SuggestedChip[]): SuggestedChip[] => {
  return chips.filter((chip) => !chip.isSupport && !chip.isTicket).slice(0, 3);
};
