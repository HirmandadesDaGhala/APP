
import { Member, Product, Event, Transaction, MemberStatus, Role, Location, RoleDefinition, UserMessage } from './types';

export const SOC_FEE = 30.00;
export const GUEST_FEE = 3.00;

export const INITIAL_LOCATIONS: Location[] = [
  { id: 'LOC-001', name: 'Comedor Principal', capacity: 40 },
  { id: 'LOC-002', name: 'Txoko (Cocina)', capacity: 10 },
  { id: 'LOC-003', name: 'Terraza Jardín', capacity: 25 },
  { id: 'LOC-004', name: 'Sala de Juntas', capacity: 8 },
];

export const INITIAL_ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: Role.PRESIDENT,
    name: 'Presidenta',
    permissions: { manage_events: true, manage_members: true, manage_inventory: true, manage_finance: true, manage_settings: true, view_sensitive_data: true }
  },
  {
    id: Role.TREASURER,
    name: 'Tesorera',
    permissions: { manage_events: true, manage_members: true, manage_inventory: true, manage_finance: true, manage_settings: true, view_sensitive_data: true }
  },
  {
    id: Role.SECRETARY,
    name: 'Secretaria',
    permissions: { manage_events: true, manage_members: true, manage_inventory: true, manage_finance: true, manage_settings: true, view_sensitive_data: true }
  },
  {
    id: Role.MEMBER,
    name: 'Socia',
    permissions: { manage_events: true, manage_members: false, manage_inventory: true, manage_finance: false, manage_settings: false, view_sensitive_data: false }
  },
  {
    id: Role.USER,
    name: 'Usuaria',
    permissions: { manage_events: true, manage_members: false, manage_inventory: true, manage_finance: false, manage_settings: false, view_sensitive_data: false }
  }
];

const createMember = (id: string, name: string, dni: string, phone: string, email: string, role: Role = Role.USER): Member => ({
  id: `SOC-${id.padStart(3, '0')}`,
  fullName: name,
  dni: dni,
  email: email,
  phone: phone,
  address: 'Sede Social Ghala',
  iban: 'ES91 1234 5678 9012 3456 7890',
  status: MemberStatus.ACTIVE,
  joinDate: new Date().toISOString().split('T')[0],
  role: role,
  pin: phone.slice(-4), // REGLA: Últimos 4 dígitos del móvil
  avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
  documentsSigned: { statutes: true, paymentCommitment: true, date: '2025-01-01' }
});

export const INITIAL_MEMBERS: Member[] = [
  createMember('1', 'Anxo Bernárdez (Presidente)', '12345678A', '600000628', 'anxo@ghala.org', Role.PRESIDENT),
  createMember('2', 'Sabela Rey (Tesourería)', '87654321B', '600002222', 'sabela@ghala.org', Role.TREASURER),
  createMember('3', 'Iago Montes', '11223344C', '600003333', 'iago@ghala.org', Role.MEMBER),
  createMember('4', 'Socia Demo 1', '44332211D', '600004444', 'demo1@ghala.org', Role.MEMBER),
];

export const INITIAL_INVENTORY: Product[] = [
  { id: 'PROD-001', name: 'Estrella Galicia 0,33l', category: 'Bebida', unit: 'Botella', currentStock: 48, minStock: 24, emergencyStock: 12, costPrice: 0.8, salePrice: 1.5, provider: 'Distribuciones Rías Baixas', isActive: true },
  { id: 'PROD-002', name: 'Viño Branco Albariño', category: 'Bebida', unit: 'Botella', currentStock: 12, minStock: 6, emergencyStock: 3, costPrice: 4.5, salePrice: 9.0, provider: 'Adega Local', isActive: true },
  { id: 'PROD-003', name: 'Café en Grán 1kg', category: 'Alimento', unit: 'Paquete', currentStock: 5, minStock: 2, emergencyStock: 1, costPrice: 12.0, salePrice: 15.0, provider: 'Tostadeiro Galego', isActive: true },
  { id: 'PROD-004', name: 'Auga Mineral 0,5l', category: 'Bebida', unit: 'Botella', currentStock: 20, minStock: 10, emergencyStock: 5, costPrice: 0.3, salePrice: 1.0, provider: 'Mondariz', isActive: true },
];

export const INITIAL_EVENTS: Event[] = [
  { id: 'EV-001', title: 'Cea de Benvida 2025', date: '2025-02-15', organizerId: 'SOC-001', attendeeIds: ['SOC-001', 'SOC-002', 'SOC-003'], attendees: 15, guestCount: 5, zoneId: 'LOC-001', status: 'Programada', consumptions: [], totalCost: 45.0, paymentStatus: 'Pendiente', paymentMethod: 'Efectivo' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'TR-001', date: '2025-01-01', description: 'Fondo Inicial Irmandade', amount: 1500.0, category: 'Otros', isReconciled: true, paymentMethod: 'Efectivo' },
  { id: 'TR-002', date: '2025-01-15', description: 'Compra Bebidas Distribuidor', amount: -250.0, category: 'Compra Insumos', isReconciled: true, paymentMethod: 'Transferencia' },
  { id: 'TR-003', date: '2025-02-01', description: 'Recibo Luz Enero', amount: -85.20, category: 'Suministros (Luz/Agua/Internet)', isReconciled: false, paymentMethod: 'Transferencia' },
];

export const INITIAL_USER_MESSAGES: UserMessage[] = [
  { id: 'MSG-001', senderId: 'SOC-002', content: 'Boas a todas! Alguén sabe onde quedou a chave da bodega?', timestamp: new Date().toISOString(), isRead: false },
  { id: 'MSG-002', senderId: 'SOC-001', content: 'Está colgada detrás da porta da cociña, Sabela.', timestamp: new Date().toISOString(), isRead: true },
];
