export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export type StoneType = 'DIAMOND' | 'RUBY' | 'SAPPHIRE' | 'EMERALD' | 'AMETHYST' | 'CITRINE' | 'QUARTZ' | 'OTHER';
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Stone {
  id: number;
  name: string;
  slug: string;
  type: StoneType;
  color: string;
  weight: string;
  origin: string;
  shortInfo: string;
  description: string;
  price: string;
  currency: string;
  stock: number;
  images: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  quantity: number;
  stone: Stone;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  subtotal: string;
  shippingFee: string;
  total: string;
  paymentRef?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface OrderItem {
  id: number;
  orderId: number;
  stoneId: number;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  stone: Stone;
}

export interface Address {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface WishlistItem {
  id: number;
  stone: Stone;
  createdAt: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentBlock {
  id: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}