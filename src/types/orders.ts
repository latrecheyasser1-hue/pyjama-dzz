import { OrderStatus, DeliveryType } from './admin';

export type OrderType = 'RETAIL' | 'WHOLESALE';

export type PaymentStatus = 'CASH' | 'DEPOSIT' | 'CREDIT';

export type Carrier = 'YALIDINE' | 'ZR_EXPRESS' | 'OTHER';

export interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface DetailedOrder {
  id: string;
  sequentialId: number;
  formattedId: string;
  orderType: OrderType;
  // Customer / Business Info
  customerName: string;
  customerPhone: string;
  traderBusinessName?: string; // For Wholesale
  wilaya: string;
  commune: string;
  // Delivery details
  deliveryType: DeliveryType;
  carrier?: Carrier;
  shippingFee?: number;
  // Items & Pricing
  items: OrderItem[];
  totalQuantity: number;
  totalAmountDzd: number;
  wholesaleDiscount?: number;
  // Payment
  paymentStatus?: PaymentStatus;
  depositAmount?: number;
  // Status
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}
