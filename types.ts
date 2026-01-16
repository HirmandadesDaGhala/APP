
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
  manage_events: boolean;
  manage_members: boolean;
  manage_inventory: boolean;
  manage_finance: boolean;
  manage_settings: boolean;
  view_sensitive_data: boolean;
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
  address: string;
  iban: string;
  monthlyFee?: number;
  status: MemberStatus;
  joinDate: string;
  role: Role;
  pin: string;
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
  minStock: number;
  emergencyStock: number;
  costPrice: number;
  salePrice: number;
  provider: string;
  isActive: boolean;
  lastAuditDate?: string;
}

export interface EventConsumption {
  id: string;
  type: 'product' | 'custom' | 'service';
  productId?: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Bizum' | 'N/A';
export type PaymentStatus = 'Pendiente' | 'Pagada';

export interface Event {
  id: string;
  title: string;
  date: string;
  organizerId: string;
  attendeeIds: string[];
  attendees: number;
  guestCount: number;
  zoneId: string;
  status: 'Programada' | 'Finalizada' | 'Cancelada';
  consumptions: EventConsumption[];
  totalCost: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  settledBy?: string;
  settlementDate?: string;
}

export type TransactionCategory = 
  | 'Cuota' 
  | 'Evento' 
  | 'Compra Insumos' 
  | 'Venta Directa Economato'
  | 'Suministros (Luz/Agua/Internet)' 
  | 'Mantenimiento' 
  | 'Impuestos'
  | 'Otros';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // Positivo para ingresos, Negativo para gastos
  category: TransactionCategory;
  relatedEventId?: string;
  relatedMemberId?: string;
  isReconciled: boolean; // Si ha sido comprobado en banco/caja
  paymentMethod: PaymentMethod;
}

export interface UserMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}
