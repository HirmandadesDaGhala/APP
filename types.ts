
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

export interface InventoryAudit {
  id: string;
  date: string;
  memberId: string;
  memberName: string;
  items: {
    productId: string;
    productName: string;
    expectedStock: number;
    actualStock: number;
    discrepancy: number;
  }[];
  notes?: string;
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

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'N/A';
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
  | 'Alquiler' 
  | 'Suministros (Luz/Agua)' 
  | 'Mantenimiento' 
  | 'Servicios Externos'
  | 'Pérdidas/Mermas'    
  | 'Ajuste Inventario'  
  | 'Otros';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: TransactionCategory;
  relatedEventId?: string;
  relatedMemberId?: string;
  isReconciled: boolean;
  paymentMethod: PaymentMethod;
}

export interface SystemMessage {
  id: string;
  title: string;
  content: string;
  date: string;
  authorId: string;
  priority: 'high' | 'normal';
  readBy: string[];
}

export interface UserMessage {
  id: string;
  senderId: string;
  recipientId?: string;
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

export interface WorkspaceSettings {
  googleSheetUrl: string;
  autoSync: boolean;
  lastSync?: string;
}
