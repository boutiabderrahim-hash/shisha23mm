// types.ts

export type Language = 'en' | 'es' | 'ar';
export type UserRole = 'WAITER' | 'MANAGER' | 'ADMIN';

export interface Waiter {
  id: string;
  name: string;
  pin: string;
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface CustomizationOption {
    id: string;
    name: string;
    priceModifier: number;
}

export interface CustomizationCategory {
    id: string;
    name: string;
    type: 'single' | 'multiple';
    options: CustomizationOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  stockItemId: string;
  stockConsumption: number;
  ingredients: string[];
  customizations?: CustomizationCategory[];
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  customizations: { [key: string]: CustomizationOption | CustomizationOption[] };
  removedIngredients: string[];
  totalPrice: number; // Price of a single item with customizations
  discount?: number; // percentage
  timestamp: string; // ISO string
}

export interface Order {
  id: number;
  waiterId: string;
  tableNumber: number;
  area: Area;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'paid' | 'on_credit' | 'cancelled';
  timestamp: string; // ISO string
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  customerName?: string;
  paymentDetails?: PaymentDetails;
}

export interface HeldOrder {
  id: string;
  waiterId: string;
  tableNumber: number;
  area: Area;
  items: OrderItem[];
  notes?: string;
  timestamp: string;
}

export interface PartialPayment {
  method: 'cash' | 'card';
  amount: number;
}

export interface PaymentDetails {
  method: 'cash' | 'card' | 'split' | 'multiple';
  amount?: number; // for single method
  cashAmount?: number; // for split
  cardAmount?: number; // for split
  payments?: PartialPayment[]; // for multiple
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  categoryId: string;
}

export interface ShiftReport {
  id: string;
  dayOpenedTimestamp: string;
  dayClosedTimestamp: string | null;
  openingBalance: number;
  cashSales: number;
  cardSales: number;
  manualIncomeCash: number;
  manualIncomeCard: number;
  totalTax: number;
  status: 'OPEN' | 'CLOSED';
  finalTotalRevenue?: number;
  finalTotalTax?: number;
  finalCashSales?: number;
  finalManualIncomeCash?: number;
}

export interface Transaction {
    id: string;
    type: 'sale' | 'manual';
    amount: number;
    timestamp: string;
    description: string;
    paymentMethod: 'cash' | 'card';
    tax: number;
}

export type Area = 'Bar' | 'VIP' | 'Barra' | 'Gaming';
export type TableShape = 'square' | 'circle' | 'rectangle' | 'bar' | 'fixture';

export interface Table {
    id: string;
    number: number;
    area: Area;
    shape: TableShape;
    x: number; // percentage
    y: number; // percentage
    width: number; // percentage
    height: number; // percentage
}

export interface RestaurantSettings {
    name: string;
    address: string;
    phone: string;
    footer: string;
    logoUrl?: string;
}