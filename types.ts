
export enum MemberStatus {
  ACTIVE = 'Activa',
  INACTIVE = 'Inactiva',
  PENDING = 'Pendiente'
}

export enum Role {
  PRESIDENT = 'Presidenta',
  TREASURER = 'Tesorera',
  SECRETARY = 'Secretaria',
  MEMBER = 'Socia',
  USER = 'Usuaria'
}

export interface RolePermissions {
  manage_events: boolean;      // Can create/edit events
  manage_members: boolean;     // Can create/edit members
  manage_inventory: boolean;   // Can create products/add stock
  manage_finance: boolean;     // Can add/edit transactions
  manage_settings: boolean;    // Can edit roles/locations
  view_sensitive_data: boolean; // Can see IBANs, specific finance details
}

export interface RoleDefinition {
  id: Role;
  name: string;
  permissions: RolePermissions;
}

export interface Location {
  id: string;
  name: string;
  capacity: number;
}

export interface Member {
  id: string;
  fullName: string;
  dni: string;
  email: string;
  phone: string;
  address: string;    // New: Physical Address
  iban: string;       // New: Bank Account
  monthlyFee?: number; // New: Custom fee override (optional)
  status: MemberStatus;
  joinDate: string;
  role: Role;
  pin: string;        // 4-digit PIN for login
  avatarUrl?: string; 
  allergies?: string; 
  notes?: string;
  documentsSigned?: {
    statutes: boolean;
    paymentCommitment: boolean;
    date: string;
  };
}

export interface Product {
  id: string;
  name: string;
  category: 'Bebida' | 'Alimento' | 'Limpieza' | 'Otros';
  unit: string;
  currentStock: number;
  minStock: number;       // Stock Seguridad
  emergencyStock: number; // Stock Emergencia
  costPrice: number;
  salePrice: number;
  provider: string;
  isActive: boolean; // TRUE = Available, FALSE = Discontinued/Hidden
}

export interface EventConsumption {
  id: string;
  type: 'product' | 'custom' | 'service'; // Added 'service'
  productId?: string; // If it is from inventory
  name: string;       // Name of product or custom concept
  quantity: number;
  unitCost: number;   // Cost per unit at moment of consumption
  totalCost: number;  // quantity * unitCost
}

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'N/A';
export type PaymentStatus = 'Pendiente' | 'Pagada';

export interface Event {
  id: string;
  title: string;
  date: string;
  organizerId: string;
  attendeeIds: string[]; // List of User IDs attending (for permission filtering)
  attendees: number;     // Total count
  guestCount: number;    // Non-members (pay extra fee)
  zoneId: string;        // Linked to Location
  status: 'Programada' | 'Finalizada' | 'Cancelada';
  consumptions: EventConsumption[];
  totalCost: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  settledBy?: string;    // ID of the user who processed the payment
  settlementDate?: string;
}

export type TransactionCategory = 
  | 'Cuota' 
  | 'Evento' 
  | 'Compra Insumos' 
  | 'Venta Directa Economato'
  | 'Alquiler' 
  | 'Suministros (Luz/Agua)' 
  | 'Mantenimiento' 
  | 'Servicios Externos' // New: Staff/Cleaning costs
  | 'Pérdidas/Mermas'    
  | 'Ajuste Inventario'  
  | 'Otros';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // Positive for income, negative for expense
  category: TransactionCategory;
  relatedEventId?: string;
  relatedMemberId?: string; // If it's a direct purchase or fee
  isReconciled: boolean; // Checked against bank statement
  paymentMethod: PaymentMethod;
}

export interface SystemMessage {
  id: string;
  title: string;
  content: string;
  date: string;
  authorId: string;
  priority: 'high' | 'normal';
  readBy: string[]; // List of user IDs who have closed the popup
}

export interface UserMessage {
  id: string;
  senderId: string;
  recipientId?: string; // If undefined, it is a PUBLIC message (Wall)
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface FinancialMonthData {
  name: string;
  ingresos: number;
  gastos: number;
  balance: number;
}
