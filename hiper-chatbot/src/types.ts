export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  screenSnapshot?: string; // Optional snapshot of screen state captured at the time
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface DifyChatRequest {
  query: string;
  inputs: {
    screenContent?: string;
    url?: string;
    [key: string]: any;
  };
  user: string;
  conversation_id: string;
  response_mode: 'blocking' | 'streaming';
}

export interface DifyChatResponse {
  event: 'message';
  task_id: string;
  id: string;
  message_id: string;
  conversation_id: string;
  mode: 'chat';
  answer: string;
  metadata: {
    usage?: {
      total_tokens: number;
    };
    retriever_resources?: any[];
  };
  created_at: number;
}

export interface PriceCatalogItem {
  id: string;
  cost: string;
  quantity: string;
  currency: string;
  catalog: string;
  status: string;
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  sanitaryRegister: string;
  imageAttached: boolean;
  prices: PriceCatalogItem[];
}

export interface OrderItem {
  id: string; // Nro. Orden (e.g., OC-2026-0981)
  date: string;
  businessUnit: string;
  providerCode: string;
  totalOC: string;
  totalAVD: string;
  currencyOC: string;
  despatchAlert: 'Sin Aviso de Despacho' | 'Borrador' | 'Confirmado';
  invoiceStatus: 'Sin Factura' | 'Factura Observada' | 'Cargada';
  items: Array<{
    itemNum: number;
    barcodeProv: string;
    barcodeHiper: string;
    productName: string;
    currency: string;
    qtyOC: number;
    unitPrice: number;
    subtotal: number;
    qtyDespatch: number;
  }>;
}

export interface MockDashboardState {
  isAuthenticated: boolean;
  username: string;
  activeTab: 'catalogo' | 'compras';
  productsList: ProductItem[];
  ordersList: OrderItem[];
  selectedOrderForInvoice: OrderItem | null;
  selectedOrderForAVD: OrderItem | null;
  invoiceScenario: 'A' | 'B' | 'C';
  uploadedInvoiceFile: { name: string; size: string; status: string; error?: string } | null;
  newProductForm?: {
    sanitaryRegister: string;
    hasProductImage: boolean;
    priceCatalog: PriceCatalogItem[];
  };
  activeError?: {
    code: number;
    message: string;
    timestamp: number;
  };
}
