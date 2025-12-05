
import { Member, Product, Event, Transaction, MemberStatus, Role, SystemMessage, Location, RoleDefinition, UserMessage } from './types';

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
    id: Role.MEMBER, // Socia
    name: 'Socia',
    permissions: { manage_events: true, manage_members: false, manage_inventory: false, manage_finance: false, manage_settings: false, view_sensitive_data: false }
  },
  {
    id: Role.USER, // Usuaria
    name: 'Usuaria',
    permissions: { manage_events: false, manage_members: false, manage_inventory: false, manage_finance: false, manage_settings: false, view_sensitive_data: false }
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'SOC-001',
    fullName: 'Maria Do Carme (Presidenta)',
    dni: '12345678A',
    email: 'maria@hirmandades.com',
    phone: '600123456',
    address: 'Rúa do Sol 1, Vigo',
    iban: 'ES98 1234 5678 9012 3456',
    status: MemberStatus.ACTIVE,
    joinDate: '2020-01-15',
    role: Role.PRESIDENT,
    pin: '1111', 
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    allergies: 'Ninguna',
    notes: 'Fundadora de Hirmandades da Ghala',
    documentsSigned: { statutes: true, paymentCommitment: true, date: '2020-01-15' }
  },
  {
    id: 'SOC-002',
    fullName: 'Lucía Míguez (Tesorera)',
    dni: '87654321B',
    email: 'lucia@hirmandades.com',
    phone: '600654321',
    address: 'Avda. Castelao 23, Vigo',
    iban: 'ES98 4321 0987 6543 2109',
    status: MemberStatus.ACTIVE,
    joinDate: '2021-03-20',
    role: Role.TREASURER,
    pin: '2222', 
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    allergies: 'Gluten',
    notes: '',
    documentsSigned: { statutes: true, paymentCommitment: true, date: '2021-03-20' }
  },
  {
    id: 'SOC-003',
    fullName: 'Antía Rivas (Socia)',
    dni: '11223344C',
    email: 'antia@hirmandades.com',
    phone: '600998877',
    address: 'Camiño Real 5, Redondela',
    iban: 'ES98 1111 2222 3333 4444',
    status: MemberStatus.ACTIVE,
    joinDate: '2019-11-05',
    role: Role.MEMBER,
    pin: '3333',
    avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656ec?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    allergies: 'Marisco',
    notes: '',
    documentsSigned: { statutes: false, paymentCommitment: false, date: '' }
  },
  {
    id: 'SOC-004',
    fullName: 'Ana Torres (Secretaria)',
    dni: '55667788D',
    email: 'ana@hirmandades.com',
    phone: '600555666',
    address: 'Plaza América 12, Vigo',
    iban: 'ES98 5555 6666 7777 8888',
    status: MemberStatus.ACTIVE,
    joinDate: '2022-01-10',
    role: Role.SECRETARY,
    pin: '4444',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    allergies: '',
    notes: '',
    documentsSigned: { statutes: true, paymentCommitment: true, date: '2022-01-10' }
  },
  {
    id: 'SOC-005',
    fullName: 'Carmen Invitada (Usuaria)',
    dni: '99887766E',
    email: 'carmen@gmail.com',
    phone: '600000000',
    address: 'Sin dirección',
    iban: '',
    status: MemberStatus.ACTIVE,
    joinDate: '2023-10-01',
    role: Role.USER,
    pin: '5555',
    avatarUrl: '',
    allergies: '',
    notes: 'Usuaria ocasional',
    documentsSigned: { statutes: true, paymentCommitment: false, date: '2023-10-01' }
  }
];

export const INITIAL_INVENTORY: Product[] = [
  { id: 'PROD-001', name: 'Vino Albariño Casa', category: 'Bebida', unit: 'Botella', currentStock: 24, minStock: 12, emergencyStock: 6, costPrice: 6.50, salePrice: 10.00, provider: 'Bodegas Salnés', isActive: true },
  { id: 'PROD-002', name: 'Licor Café Casero', category: 'Bebida', unit: 'Botella', currentStock: 10, minStock: 5, emergencyStock: 2, costPrice: 8.00, salePrice: 12.00, provider: 'Ourensana Dest', isActive: true },
  { id: 'PROD-003', name: 'Pulpo (Congelado)', category: 'Alimento', unit: 'Kg', currentStock: 15, minStock: 5, emergencyStock: 2, costPrice: 18.00, salePrice: 28.00, provider: 'Pescados Rías Baixas', isActive: true },
  { id: 'PROD-004', name: 'Pan de Cea', category: 'Alimento', unit: 'Unidad', currentStock: 10, minStock: 5, emergencyStock: 3, costPrice: 1.20, salePrice: 2.00, provider: 'Panadería Local', isActive: true },
  { id: 'PROD-005', name: 'Kit Limpieza Eco', category: 'Limpieza', unit: 'Pack', currentStock: 5, minStock: 3, emergencyStock: 1, costPrice: 3.50, salePrice: 0.00, provider: 'SuperEco', isActive: true },
  { id: 'PROD-006', name: 'Vino Tinto (Descatalogado)', category: 'Bebida', unit: 'Botella', currentStock: 0, minStock: 0, emergencyStock: 0, costPrice: 4.00, salePrice: 7.00, provider: 'Antiguo Prov', isActive: false },
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'EVT-001',
    title: 'Xuntanza de Outono',
    date: '2023-10-27',
    organizerId: 'SOC-002', // Lucía (Tesorera)
    attendeeIds: ['SOC-001', 'SOC-002', 'SOC-003'],
    attendees: 12,
    guestCount: 2,
    zoneId: 'LOC-001',
    status: 'Finalizada',
    consumptions: [
      { id: 'CONS-1', type: 'product', productId: 'PROD-001', name: 'Vino Albariño Casa', quantity: 6, unitCost: 10.00, totalCost: 60.00 },
      { id: 'CONS-2', type: 'product', productId: 'PROD-003', name: 'Pulpo (Congelado)', quantity: 4, unitCost: 28.00, totalCost: 112.00 }
    ],
    totalCost: 178.00, // 172 + 6 guests
    paymentStatus: 'Pagada',
    paymentMethod: 'Transferencia',
    settledBy: 'SOC-002',
    settlementDate: '2023-10-28'
  },
  {
    id: 'EVT-002',
    title: 'Cena de Amigas',
    date: '2023-11-05',
    organizerId: 'SOC-003', // Antía (Socia)
    attendeeIds: ['SOC-003', 'SOC-005'],
    attendees: 4,
    guestCount: 0,
    zoneId: 'LOC-002',
    status: 'Programada',
    consumptions: [],
    totalCost: 0,
    paymentStatus: 'Pendiente',
    paymentMethod: 'N/A'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'TRX-001', date: '2023-10-01', description: 'Remesa Cuotas - Octubre', amount: 900, category: 'Cuota', isReconciled: true, paymentMethod: 'Transferencia' },
  { id: 'TRX-002', date: '2023-10-05', description: 'Compra Bodega Salnés', amount: -450, category: 'Compra Insumos', isReconciled: true, paymentMethod: 'Transferencia' },
  { id: 'TRX-003', date: '2023-10-01', description: 'Alquiler Local', amount: -600, category: 'Alquiler', isReconciled: true, paymentMethod: 'Transferencia' },
  { id: 'TRX-004', date: '2023-10-02', description: 'Factura Iberdrola', amount: -120.50, category: 'Suministros (Luz/Agua)', isReconciled: false, paymentMethod: 'Transferencia' },
  { id: 'TRX-005', date: '2023-10-27', description: 'Ingreso Xuntanza Outono', amount: 178, category: 'Evento', relatedEventId: 'EVT-001', isReconciled: false, paymentMethod: 'Transferencia' },
];

export const INITIAL_SYSTEM_MESSAGES: SystemMessage[] = [
  {
    id: 'MSG-001',
    title: '👋 ¡Benvidas a Hirmandades da Ghala!',
    content: 'Estrenamos nueva app. Por favor, revisad la sección "Bienvenida y Documentos" para firmar los nuevos estatutos digitales.',
    date: '2023-10-25',
    priority: 'high',
    authorId: 'SOC-001',
    readBy: []
  }
];

export const INITIAL_USER_MESSAGES: UserMessage[] = [
  {
     id: 'UM-001',
     senderId: 'SOC-002',
     content: '¡Hola a todas! He dejado unas lechugas de mi huerta en el mostrador. Serviros libremente. 🥬',
     timestamp: '2023-10-26T10:30:00',
     isRead: false
  },
  {
     id: 'UM-002',
     senderId: 'SOC-003',
     recipientId: 'SOC-002',
     content: 'Gracias Lucía, ¡tienen pintaza! Cogeré una para la cena.',
     timestamp: '2023-10-26T11:00:00',
     isRead: false
  }
];

export const DOC_PHILOSOPHY = `
**NUESTRA ESENCIA**

En **Hirmandades da Ghala**, creemos que la mesa es el lugar donde se teje la comunidad. No somos un restaurante, ni un bar; somos una extensión de tu casa, un espacio compartido donde la confianza y la responsabilidad individual son los pilares fundamentales.

**1. Autogestión:** Aquí no hay camareros. Tú cocinas, tú sirves, tú recoges. La magia reside en hacerlo juntas.
**2. Honestidad:** El Economato está abierto y confiamos en ti. Si coges una botella, la apuntas. Si rompes una copa, la repones o avisas.
**3. Respeto:** El espacio es de todas. Dejarlo más limpio de lo que lo encontraste es nuestra regla de oro.

Bienvenida a tu segunda casa. Disfruta, comparte y cuida.
`;

export const DOC_STATUTES = `
**ESTATUTOS DE RÉGIMEN INTERNO - HIRMANDADES DA GHALA**

**CAPÍTULO I: DE LAS SOCIAS Y EL ACCESO**
1. El acceso al local es exclusivo para socias e invitadas acompañadas.
2. Cada socia posee un código personal e intransferible. Cederlo a terceros supone expulsión inmediata.
3. El horario de cierre debe respetarse estrictamente para garantizar el descanso vecinal (01:00 AM laborables, 02:30 AM festivos).

**CAPÍTULO II: DEL USO DE INSTALACIONES Y COCINA**
4. Es obligatorio reservar el evento en la App antes de ocupar una zona.
5. La limpieza es responsabilidad exclusiva de la socia organizadora. Esto incluye: vajilla, plancha, suelos y retirada de basura a los contenedores municipales.
6. Si se detecta suciedad previa, debe notificarse antes de comenzar el evento mediante la App.

**CAPÍTULO III: ECONOMATO Y CONSUMOS**
7. Todo producto retirado del Economato debe registrarse inmediatamente en el evento correspondiente o mediante la opción de "Compra Directa" si es para uso personal externo.
8. Está prohibido traer bebidas externas si estas existen en el Economato de la sociedad, salvo autorización de la Junta.

**CAPÍTULO IV: INVITADAS**
9. Las invitadas no socias deben abonar una tasa de uso de instalaciones de 3,00€ por evento.
10. La socia titular es responsable subsidiaria del comportamiento y deudas de sus invitadas.
`;

export const DOC_COMMITMENT = `
**COMPROMISO DE PAGO Y PERMANENCIA**

Yo, como socia de **Hirmandades da Ghala**, reconozco y acepto las siguientes obligaciones financieras:

1. **Cuota Mensual:** Me comprometo al pago de una cuota de **30,00 €/mes**, pagadera mediante domiciliación bancaria o transferencia los primeros 5 días del mes.
2. **Permanencia:** La condición de socia implica un compromiso anual. En caso de baja voluntaria antes de finalizar el año fiscal, me comprometo a abonar las cuotas restantes hasta completar el ciclo, salvo causa de fuerza mayor aprobada por la Junta.
3. **Consumos:** Me comprometo a liquidar los gastos de mis eventos (consumiciones y tasas de invitadas) en un plazo máximo de 48 horas tras la finalización del mismo.
4. **Impagos:** El impago de dos cuotas mensuales o de consumos por valor superior a 50€ conllevará la suspensión temporal del acceso al local y a la App.

Este documento tiene validez contractual interna.
`;

export const TUTORIAL_STEPS = [
  {
    title: "1. Crea tu Evento",
    desc: "Entra en la sección 'Eventos' y pulsa '+ Nuevo Evento'. Reserva tu día, elige la zona (Comedor, Terraza...) y anota cuántas seréis.",
    icon: "Calendar"
  },
  {
    title: "2. Disfruta y Anota",
    desc: "Durante la comida, usa el botón 'Gestionar Consumos'. Puedes añadir bebidas del Economato (se descuentan solas del stock) o gastos manuales (hielo, pan...).",
    icon: "ShoppingCart"
  },
  {
    title: "3. Salda la Cuenta",
    desc: "Al terminar, en la misma pantalla de consumos, verás el total (incluyendo tasas de invitadas). Elige si pagas en efectivo en la caja fuerte o por transferencia y pulsa 'Saldar'.",
    icon: "CreditCard"
  },
  {
    title: "4. Compra Directa",
    desc: "¿Quieres llevarte vino a casa? Usa el botón 'Hacer la Compra' en el Economato para comprar productos fuera de un evento.",
    icon: "ShoppingBag"
  }
];
