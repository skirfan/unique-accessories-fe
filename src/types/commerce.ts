export interface StoreSettings {
  id: string;
  autoApproveOrders: boolean;
  invoiceLogoImage: string | null;
  invoiceLogoUrl: string | null;
  invoiceLogoKey: string | null;
  sellerName: string;
  sellerAddress: string;
  sellerEmail: string;
  sellerPhone: string;
  sellerGstin: string;
  minimumOrderEnabled: boolean;
  minimumOrderAmount: number;
  shippingFee: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  upiEnabled: boolean;
  whatsappNumber: string;
  upiId: string;
  upiName: string;
  upiQrImage: string | null;
  paymentInstructions: string;
  version: number;
}
export type PublicStoreSettings = Omit<
  StoreSettings,
  | "upiId"
  | "upiName"
  | "upiQrImage"
  | "paymentInstructions"
  | "invoiceLogoImage"
  | "invoiceLogoUrl"
  | "invoiceLogoKey"
  | "sellerName"
  | "sellerAddress"
  | "sellerEmail"
  | "sellerPhone"
  | "sellerGstin"
>;
export interface CheckoutQuote {
  lines: {
    variantId: string;
    productName: string;
    productSlug: string;
    variantLabel: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    stock: number;
  }[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode: string | null;
  minimumOrderEnabled: boolean;
  minimumOrderAmount: number;
  remainingForMinimum: number;
  eligible: boolean;
  settingsVersion: number;
  quoteToken: string;
}
export type OrderStatus =
  | "AWAITING_APPROVAL"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED";
export interface Order {
  accountLinked: boolean;
  invoiceNumber: string | null;
  canPayUpi: boolean;
  shipment: {
    state: string;
    awb: string | null;
    courierName: string | null;
    trackingUrl: string | null;
  } | null;
  reference: string;
  status: OrderStatus;
  paymentMethod: "COD" | "UPI";
  paymentStatus:
    "UNPAID" | "PENDING_VERIFICATION" | "PAID" | "REFUND_REQUIRED" | "REFUNDED";
  paymentReference: string | null;
  paymentVerifiedAt: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  items: {
    productName: string;
    productSlug: string;
    variantLabel: string;
    quantity: number;
    unitPrice: number;
    sku: string;
  }[];
  history: { status: OrderStatus; note: string | null; createdAt: string }[];
  trackingNumber: string | null;
  createdAt: string;
  whatsappUrl: string | null;
  upi: {
    id: string;
    name: string;
    url: string | null;
    qrDataUrl: string;
    instructions: string;
    customQr: boolean;
  } | null;
}
export const statusLabel = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (s) => s.toUpperCase());
