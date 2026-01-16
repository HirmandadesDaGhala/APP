
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, Calendar as CalendarIcon, Package, DollarSign, LayoutDashboard, Menu, X, Plus, Edit2, LogOut, Trash2, MapPin, Send, RefreshCcw, Heart, Brain, Info, MessageCircle, AlertTriangle, Check, ShoppingCart, AlertCircle, TrendingUp, TrendingDown, Landmark, Search
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Member, Product, Event, Transaction, Location, RoleDefinition, UserMessage, RolePermissions, Role, MemberStatus, TransactionCategory, PaymentMethod } from './types';
import { INITIAL_MEMBERS, INITIAL_INVENTORY, INITIAL_EVENTS, INITIAL_TRANSACTIONS, INITIAL_LOCATIONS, INITIAL_ROLE_DEFINITIONS, INITIAL_USER_MESSAGES } from './constants';

// --- ATOM COMPONENTS ---

const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all ${onClick ? 'cursor-pointer hover:border-emerald-200 active:scale-[0.98]' : ''} ${className}`}
  >
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple' | 'emerald' | 'orange' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
    purple: 'bg-purple-100 text-purple-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    orange: 'bg-orange-100 text-orange-800',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; colorHeader?: string; maxWidth?: string }> = ({ isOpen, onClose, title, children, colorHeader, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-md">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200`}>
        <div className={`flex justify-between items-center p-6 border-b border-gray-100 ${colorHeader ? colorHeader : 'bg-white'}`}>
          <h3 className={`text-xl font-bold font-serif ${colorHeader ? 'text-white' : 'text-emerald-900'}`}>{title}</h3>
          <button type="button" onClick={onClose} className={`${colorHeader ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-gray-600'} p-2 rounded-full hover:bg-black/5 transition`}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState('welcome');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // App State
  const [members, setMembers] = useState<Member[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);
  const [locations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [roleDefinitions] = useState<RoleDefinition[]>(INITIAL_ROLE_DEFINITIONS);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Confirmation states
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(false);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState(false);

  // AI Assistant
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Persistence Loading
  useEffect(() => {
    const saved = localStorage.getItem('gastro_soc_v14_pro');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setMembers(p.members || INITIAL_MEMBERS);
        setInventory(p.inventory || INITIAL_INVENTORY);
        setEvents(p.events || INITIAL_EVENTS);
        setTransactions(p.transactions || INITIAL_TRANSACTIONS);
        setUserMessages(p.userMessages || INITIAL_USER_MESSAGES);
      } catch (e) {
        resetToDefaults();
      }
    } else {
      resetToDefaults();
    }
    setLoading(false);
  }, []);

  const resetToDefaults = () => {
    setMembers(INITIAL_MEMBERS);
    setInventory(INITIAL_INVENTORY);
    setEvents(INITIAL_EVENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setUserMessages(INITIAL_USER_MESSAGES);
  };

  useEffect(() => {
    if (!loading) {
      const state = { members, inventory, events, transactions, userMessages };
      localStorage.setItem('gastro_soc_v14_pro', JSON.stringify(state));
    }
  }, [members, inventory, events, transactions, userMessages, loading]);

  const can = useCallback((permission: keyof RolePermissions) => {
    if (!currentUser) return false;
    const roleDef = roleDefinitions.find(r => r.id === currentUser.role);
    return roleDef ? roleDef.permissions[permission] : false;
  }, [currentUser, roleDefinitions]);

  const handleLogin = (pin: string) => {
    const user = members.find(m => m.pin === pin) || INITIAL_MEMBERS.find(m => m.pin === pin);
    if (user) { 
      setCurrentUser(user); 
      setLoginError(null); 
      setActiveTab('dashboard'); 
    } else {
      setLoginError('PIN incorrecto. Revisa el código maestro (0628) o los últimos 4 dígitos de tu móvil.');
    }
  };

  const handleSendMessage = (content: string) => {
    if (!currentUser) return;
    const msg: UserMessage = {
      id: `MSG-${Date.now()}`,
      senderId: currentUser.id,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setUserMessages(prev => [...prev, msg]);
  };

  const askGemini = async () => {
    if (!aiMessage.trim()) return;
    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `Asistente de Gestión para Sociedades Gastronómicas. Datos actuales: ${inventory.length} productos, ${members.length} socias. Responde brevemente: ${aiMessage}.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiResponse(response.text || "No hay respuesta disponible.");
    } catch (e) { setAiResponse("Error de conexión con la IA."); }
    finally { setIsAiThinking(false); setAiMessage(''); }
  };

  // --- ACTIONS ---

  const saveProduct = () => {
    if (!editingProduct) return;
    setInventory(prev => {
      const idx = prev.findIndex(p => p.id === editingProduct.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = editingProduct;
        return next;
      }
      return [...prev, editingProduct];
    });
    setIsProductModalOpen(false);
  };

  const saveMember = () => {
    if (!editingMember) return;
    setMembers(prev => {
      const idx = prev.findIndex(m => m.id === editingMember.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = editingMember;
        return next;
      }
      return [...prev, editingMember];
    });
    setIsMemberModalOpen(false);
  };

  const saveEvent = (ev: Event) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === ev.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = ev;
        return next;
      }
      return [...prev, ev];
    });
    if (ev.status === 'Finalizada') {
      // Registrar transaccion automática
      setTransactions(prev => [...prev, {
        id: `TR-EV-${ev.id}`,
        date: new Date().toISOString(),
        description: `Liquidación Evento: ${ev.title}`,
        amount: ev.totalCost,
        category: 'Evento',
        relatedEventId: ev.id,
        isReconciled: false,
        paymentMethod: ev.paymentMethod
      }]);
    }
    setIsEventModalOpen(false);
  };

  const saveTransaction = () => {
    if (!editingTransaction) return;
    setTransactions(prev => {
      const idx = prev.findIndex(t => t.id === editingTransaction.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = editingTransaction;
        return next;
      }
      return [...prev, editingTransaction];
    });
    setIsTransactionModalOpen(false);
  };

  const toggleReconciliation = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, isReconciled: !t.isReconciled } : t));
  };

  // Lógica de Stock Crítico
  const criticalStockItems = inventory.filter(p => p.currentStock <= p.minStock);
  const emergencyStockItems = inventory.filter(p => p.currentStock <= p.emergencyStock);

  if (loading) return <div className="min-h-screen bg-emerald-950 flex items-center justify-center text-white font-serif text-2xl animate-pulse">Cargando Irmandades PRO...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-emerald-800 p-10 text-center">
            <Landmark className="w-10 h-10 text-white mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold text-white mb-2 tracking-tight">Irmandades da Ghala</h1>
            <p className="text-emerald-100 text-xs uppercase font-bold tracking-widest opacity-70">Sistema Profesional de Gestión</p>
          </div>
          <LoginPad onLogin={handleLogin} error={loginError} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-emerald-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-emerald-900 text-white transform transition-transform duration-500 lg:translate-x-0 lg:static flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-8 border-b border-emerald-800/50 flex items-center gap-3">
           <Heart className="w-5 h-5 text-emerald-300 fill-emerald-300" />
           <span className="font-bold text-xl font-serif tracking-tight text-white">Irmandades</span>
         </div>
         <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
            {[
               { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
               { id: 'events', icon: CalendarIcon, label: 'Eventos y Reservas' },
               { id: 'inventory', icon: Package, label: 'Economato' },
               { id: 'finance', icon: DollarSign, label: 'Tesorería', admin: true },
               { id: 'members', icon: Users, label: 'Socias' },
               { id: 'community', icon: MessageCircle, label: 'Comunidad' },
            ].map(item => {
               if (item.admin && !can('manage_finance')) return null;
               return (
                 <button key={item.id} type="button" onClick={() => {setActiveTab(item.id); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-emerald-800 text-white shadow-lg' : 'text-emerald-100/70 hover:bg-emerald-800/40'}`}>
                   <item.icon className="w-5 h-5"/><span className="font-bold text-sm">{item.label}</span>
                 </button>
               );
            })}
         </nav>
         <div className="p-6 border-t border-emerald-800/50">
            <div onClick={() => { setEditingMember(currentUser); setIsMemberModalOpen(true); }} className="flex items-center gap-4 mb-6 p-3 rounded-2xl hover:bg-emerald-800 transition cursor-pointer">
              <img src={currentUser.avatarUrl} className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-700" alt="me"/>
              <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate text-white">{currentUser.fullName}</p><p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">{currentUser.role}</p></div>
            </div>
            <button type="button" onClick={() => setCurrentUser(null)} className="w-full py-3 bg-emerald-950 text-emerald-200 rounded-2xl text-xs font-bold hover:bg-red-900/40 transition flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4"/> Salir
            </button>
         </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-emerald-900"><Menu className="w-6 h-6"/></button>
            <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-xs">
              <Info className="w-4 h-4 text-emerald-400"/>
              <span className="hidden sm:inline">Irmandades PRO v1.4.0</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {emergencyStockItems.length > 0 && <Badge color="red">STOCK CRÍTICO</Badge>}
             <button type="button" onClick={() => setIsAiOpen(true)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition shadow-sm"><Brain className="w-5 h-5"/></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           {activeTab === 'dashboard' && <DashboardView transactions={transactions} events={events} inventory={inventory} members={members} currentUser={currentUser}/>}
           {activeTab === 'events' && <EventsView events={events} locations={locations} currentUser={currentUser} setEditingEvent={setEditingEvent} setIsEventModalOpen={setIsEventModalOpen} setConfirmDeleteEvent={setConfirmDeleteEvent} inventory={inventory}/>}
           {activeTab === 'inventory' && <InventoryView inventory={inventory} canManage={can('manage_inventory')} setEditingProduct={setEditingProduct} setIsProductModalOpen={setIsProductModalOpen} setConfirmDeleteProduct={setConfirmDeleteProduct}/>}
           {activeTab === 'community' && <CommunitySection userMessages={userMessages} currentUser={currentUser} members={members} onSendMessage={handleSendMessage}/>}
           {activeTab === 'finance' && <FinanceView transactions={transactions} onAdd={() => { setEditingTransaction({ id: `TR-${Date.now()}`, date: new Date().toISOString().split('T')[0], description: '', amount: 0, category: 'Otros', isReconciled: false, paymentMethod: 'Transferencia' }); setIsTransactionModalOpen(true); }} onToggleReconcile={toggleReconciliation} />}
           {activeTab === 'members' && <MembersView members={members} canManage={can('manage_members')} setEditingMember={setEditingMember} setIsMemberModalOpen={setIsMemberModalOpen} onAdd={() => { setEditingMember({ id: `SOC-${Date.now()}`, fullName: '', dni: '', email: '', phone: '', address: '', iban: '', status: MemberStatus.ACTIVE, joinDate: new Date().toISOString().split('T')[0], role: Role.USER, pin: '0000', avatarUrl: `https://ui-avatars.com/api/?name=Nueva+Socia&background=random&color=fff` }); setIsMemberModalOpen(true); }} />}
        </div>
      </main>

      {/* MODAL SOCIA (EDICIÓN COMPLETA) */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title={editingMember?.fullName || "Ficha de Socia"} colorHeader="bg-emerald-800">
        {editingMember && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 mb-4">
               <img src={editingMember.avatarUrl} className="w-20 h-20 rounded-3xl border-4 border-emerald-100" alt="avatar" />
               <div className="flex-1">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Nombre Completo</label>
                 <input className="w-full p-3 bg-gray-50 border-0 rounded-xl font-bold text-lg" value={editingMember.fullName} onChange={e => setEditingMember({...editingMember, fullName: e.target.value})} />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">DNI</label><input className="w-full p-3 bg-gray-50 rounded-xl border-0" value={editingMember.dni} onChange={e => setEditingMember({...editingMember, dni: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Teléfono</label><input className="w-full p-3 bg-gray-50 rounded-xl border-0" value={editingMember.phone} onChange={e => setEditingMember({...editingMember, phone: e.target.value})} /></div>
              <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Email</label><input className="w-full p-3 bg-gray-50 rounded-xl border-0" value={editingMember.email} onChange={e => setEditingMember({...editingMember, email: e.target.value})} /></div>
              <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">IBAN Bancario</label><input className="w-full p-3 bg-emerald-50 rounded-xl border-0 font-mono text-sm" value={editingMember.iban} onChange={e => setEditingMember({...editingMember, iban: e.target.value})} placeholder="ES00 0000..." /></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Rol</label><select className="w-full p-3 bg-gray-50 rounded-xl border-0" value={editingMember.role} onChange={e => setEditingMember({...editingMember, role: e.target.value as Role})}>{Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">PIN Acceso (4 dgt)</label><input className="w-full p-3 bg-gray-50 rounded-xl border-0 text-center font-bold tracking-[1em]" maxLength={4} value={editingMember.pin} onChange={e => setEditingMember({...editingMember, pin: e.target.value})} /></div>
            </div>
            <button onClick={saveMember} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition">Guardar Cambios en Ficha</button>
          </div>
        )}
      </Modal>

      {/* MODAL TRANSACCIÓN (TESORERÍA) */}
      <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title="Detalle de Movimiento" colorHeader="bg-emerald-950">
        {editingTransaction && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl text-center mb-4">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Importe (€)</label>
               <input type="number" step="0.01" className={`w-full text-4xl font-black bg-transparent border-0 text-center focus:ring-0 ${editingTransaction.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`} value={editingTransaction.amount} onChange={e => setEditingTransaction({...editingTransaction, amount: parseFloat(e.target.value)})} />
               <p className="text-[10px] text-gray-400 mt-2 font-bold italic">Importe positivo para ingresos, negativo para gastos.</p>
            </div>
            <div className="space-y-4">
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Descripción / Concepto</label><input className="w-full p-4 bg-gray-50 rounded-xl border-0" value={editingTransaction.description} onChange={e => setEditingTransaction({...editingTransaction, description: e.target.value})} placeholder="Ej: Pago cuota trimestral" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Categoría</label><select className="w-full p-4 bg-gray-50 rounded-xl border-0" value={editingTransaction.category} onChange={e => setEditingTransaction({...editingTransaction, category: e.target.value as TransactionCategory})}><option value="Cuota">Cuota</option><option value="Evento">Evento</option><option value="Suministros (Luz/Agua/Internet)">Suministros</option><option value="Mantenimiento">Mantenimiento</option><option value="Otros">Otros</option></select></div>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Método</label><select className="w-full p-4 bg-gray-50 rounded-xl border-0" value={editingTransaction.paymentMethod} onChange={e => setEditingTransaction({...editingTransaction, paymentMethod: e.target.value as PaymentMethod})}><option value="Transferencia">Transferencia</option><option value="Efectivo">Efectivo</option><option value="Bizum">Bizum</option></select></div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <input type="checkbox" className="w-5 h-5 rounded border-emerald-300 text-emerald-600" checked={editingTransaction.isReconciled} onChange={e => setEditingTransaction({...editingTransaction, isReconciled: e.target.checked})} />
                <label className="text-xs font-bold text-emerald-900">Conciliado (Comprobado en banco/caja)</label>
              </div>
            </div>
            <button onClick={saveTransaction} className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition">Registrar Movimiento</button>
          </div>
        )}
      </Modal>

      {/* REUTILIZAR MODALES DE PRODUCTO Y EVENTO DE LA V1.3 */}
      {/* ... (Se mantienen igual pero con la lógica de cierre mejorada) */}
      <Modal 
        isOpen={isProductModalOpen} 
        onClose={() => { setIsProductModalOpen(false); setConfirmDeleteProduct(false); }} 
        title={editingProduct?.name || "Detalle do Producto"} 
        colorHeader="bg-emerald-700"
      >
        {editingProduct && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Nome do Producto</label><input className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-0 focus:ring-2 focus:ring-emerald-500" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Stock Actual</label><input type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-0" value={editingProduct.currentStock} onChange={e => setEditingProduct({...editingProduct, currentStock: parseFloat(e.target.value)})} /></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Prezo Venta (€)</label><input type="number" step="0.01" className="w-full p-4 bg-emerald-50 rounded-2xl font-bold border-0" value={editingProduct.salePrice} onChange={e => setEditingProduct({...editingProduct, salePrice: parseFloat(e.target.value)})} /></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Stock Mínimo</label><input type="number" className="w-full p-4 bg-gray-50 rounded-2xl border-0" value={editingProduct.minStock} onChange={e => setEditingProduct({...editingProduct, minStock: parseInt(e.target.value)})} /></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Stock Emerxencia</label><input type="number" className="w-full p-4 bg-red-50 text-red-600 rounded-2xl border-0" value={editingProduct.emergencyStock} onChange={e => setEditingProduct({...editingProduct, emergencyStock: parseInt(e.target.value)})} /></div>
            </div>
            <button type="button" onClick={saveProduct} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"><Check className="w-5 h-5"/> Gardar Cambios</button>
          </div>
        )}
      </Modal>

      <Modal isOpen={isEventModalOpen} onClose={() => { setIsEventModalOpen(false); setConfirmDeleteEvent(false); }} title={editingEvent?.title || "Ficha de Reserva"} colorHeader="bg-emerald-800" maxWidth="max-w-3xl">
        {editingEvent && (
          <div className="space-y-6">
            {inventory.filter(p => p.currentStock <= p.minStock).length > 0 && (
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
                <p className="text-xs text-orange-950 font-medium">Aviso de Stock: Asegúrate de comprar suministros críticos antes del evento.</p>
              </div>
            )}
            <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Título da Reserva</label><input className="w-full p-5 bg-gray-50 border-0 rounded-2xl font-bold text-xl" value={editingEvent.title} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Data</label><input type="date" className="w-full p-4 bg-gray-50 rounded-2xl border-0" value={editingEvent.date} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Localización</label><select className="w-full p-4 bg-gray-50 rounded-2xl border-0" value={editingEvent.zoneId} onChange={e => setEditingEvent({...editingEvent, zoneId: e.target.value})} >{locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
               <h3 className="text-2xl font-black text-emerald-950">{editingEvent.totalCost.toFixed(2)}€</h3>
               <div className="flex gap-2">
                 <select className="p-3 bg-gray-50 rounded-xl border-0 font-bold text-xs" value={editingEvent.status} onChange={e => setEditingEvent({...editingEvent, status: e.target.value as any})}><option value="Programada">Reservada</option><option value="Finalizada">Liquidada</option></select>
                 <button onClick={() => saveEvent(editingEvent)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md">Guardar</button>
               </div>
            </div>
          </div>
        )}
      </Modal>

      {/* AI Assistant */}
      <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${isAiOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="bg-white w-80 rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col h-[28rem]">
          <div className="bg-emerald-900 p-5 flex justify-between items-center text-white font-bold">
            <div className="flex items-center gap-2"><Brain className="w-4 h-4 text-emerald-300"/> <span>IA Asistente</span></div>
            <button type="button" onClick={() => setIsAiOpen(false)} className="hover:rotate-90 transition-transform"><X className="w-5 h-5"/></button>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs custom-scrollbar bg-gray-50/50">
            {aiResponse && <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm leading-relaxed text-emerald-900 animate-in slide-in-from-bottom-2">{aiResponse}</div>}
            {isAiThinking && <div className="flex justify-center py-4"><RefreshCcw className="w-5 h-5 animate-spin text-emerald-600"/></div>}
          </div>
          <div className="p-5 border-t bg-white">
            <div className="flex gap-2">
              <input className="flex-1 p-3 bg-gray-50 rounded-xl text-xs border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Pregunta algo..." value={aiMessage} onChange={e => setAiMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && askGemini()} />
              <button type="button" onClick={askGemini} className="p-3 bg-emerald-600 text-white rounded-xl shadow-md"><Send className="w-4 h-4"/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const LoginPad: React.FC<{ onLogin: (pin: string) => void; error: string | null }> = ({ onLogin, error }) => {
  const [pin, setPin] = useState('');
  const keys = ['1','2','3','4','5','6','7','8','9','X','0','OK'];
  const handleKey = (k: string) => {
    if (k === 'X') setPin('');
    else if (k === 'OK') { if(pin.length === 4) onLogin(pin); }
    else if (pin.length < 4) {
      const next = pin + k;
      setPin(next);
      if (next.length === 4) setTimeout(() => onLogin(next), 300);
    }
  };
  return (
    <div className="p-10 text-center bg-gray-50/80">
      <div className="flex justify-center gap-6 mb-12">
        {[0,1,2,3].map(i => <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${i < pin.length ? 'bg-emerald-600 border-emerald-600 scale-125' : 'bg-white border-gray-200'}`}></div>)}
      </div>
      {error && <p className="text-red-600 text-[10px] font-bold mb-4 bg-red-50 p-2 rounded-lg">{error}</p>}
      <div className="grid grid-cols-3 gap-5 max-w-[280px] mx-auto">
        {keys.map(k => <button key={k} onClick={() => handleKey(k)} className={`h-16 rounded-2xl text-2xl font-black shadow-sm border-b-4 ${k === 'OK' ? 'bg-emerald-600 text-white border-emerald-800' : k === 'X' ? 'bg-red-500 text-white border-red-800' : 'bg-white text-emerald-950 border-gray-300'}`}>{k}</button>)}
      </div>
    </div>
  );
};

const DashboardView: React.FC<{ transactions: Transaction[], events: Event[], inventory: Product[], members: Member[], currentUser: Member }> = ({ transactions, events, inventory, members, currentUser }) => {
  const balanceTotal = transactions.reduce((acc, t) => acc + t.amount, 0);
  const balanceReal = transactions.filter(t => t.isReconciled).reduce((acc, t) => acc + t.amount, 0);
  return (
    <div className="space-y-8 animate-in fade-in">
      <h1 className="text-3xl font-serif font-bold text-emerald-950">Boas tardes, {currentUser.fullName.split(' ')[0]}</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-emerald-50 border-emerald-100">
           <p className="text-xs text-emerald-800 font-bold mb-1">Saldo Reconciliado</p>
           <h3 className="text-3xl font-black text-emerald-950">{balanceReal.toFixed(2)}€</h3>
           <p className="text-[10px] text-emerald-600 mt-2 font-bold uppercase">Previsto: {balanceTotal.toFixed(2)}€</p>
        </Card>
        <Card><Badge color="blue">Agenda</Badge><h3 className="text-3xl font-black text-gray-900 mt-2">{events.filter(e => e.status === 'Programada').length}</h3><p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Reservas Ativas</p></Card>
        <Card><Badge color="purple">Socias</Badge><h3 className="text-3xl font-black text-gray-900 mt-2">{members.length}</h3><p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Membros Irmandade</p></Card>
        <Card><Badge color="orange">Economato</Badge><h3 className="text-3xl font-black text-gray-900 mt-2">{inventory.filter(p => p.currentStock <= p.minStock).length}</h3><p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Avisos de Stock</p></Card>
      </div>
      <Card className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={transactions.slice(-15)}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/><XAxis dataKey="date" hide/><YAxis hide/><Tooltip/><Area type="monotone" dataKey="amount" stroke="#10b981" fill="#ecfdf5" strokeWidth={3}/></AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

const EventsView: React.FC<{ events: Event[], locations: Location[], currentUser: Member, setEditingEvent: (e: any) => void, setIsEventModalOpen: (o: boolean) => void, setConfirmDeleteEvent: (c: boolean) => void, inventory: Product[] }> = ({ events, locations, currentUser, setEditingEvent, setIsEventModalOpen, setConfirmDeleteEvent }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-serif font-bold text-emerald-900">Eventos</h2>
      <button onClick={() => { setEditingEvent({ id: `EV-${Date.now()}`, title: '', date: new Date().toISOString().split('T')[0], organizerId: currentUser.id, attendeeIds: [], attendees: 1, guestCount: 0, zoneId: 'LOC-001', status: 'Programada', consumptions: [], totalCost: 0, paymentStatus: 'Pendiente', paymentMethod: 'Efectivo' }); setIsEventModalOpen(true); }} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg">+ Nueva Reserva</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {events.slice().reverse().map(e => (
        <Card key={e.id} onClick={() => { setEditingEvent(e); setIsEventModalOpen(true); }}>
          <div className="flex justify-between items-start mb-4"><Badge color={e.status === 'Programada' ? 'blue' : 'emerald'}>{e.status}</Badge><span className="text-[10px] font-bold text-gray-400">{new Date(e.date).toLocaleDateString()}</span></div>
          <h4 className="text-xl font-bold text-emerald-950 mb-2 truncate">{e.title || 'Sin Título'}</h4>
          <div className="flex items-center gap-3 text-xs text-gray-500"><Users className="w-3 h-3"/> {e.attendees} personas <MapPin className="w-3 h-3"/> {locations.find(l => l.id === e.zoneId)?.name}</div>
        </Card>
      ))}
    </div>
  </div>
);

const InventoryView: React.FC<{ inventory: Product[], canManage: boolean, setEditingProduct: (p: any) => void, setIsProductModalOpen: (o: boolean) => void, setConfirmDeleteProduct: (c: boolean) => void }> = ({ inventory, canManage, setEditingProduct, setIsProductModalOpen }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center"><h2 className="text-3xl font-serif font-bold text-emerald-900">Economato</h2>{canManage && <button onClick={() => { setEditingProduct({ id: `PROD-${Date.now()}`, name: '', category: 'Bebida', unit: 'Botella', currentStock: 0, minStock: 5, emergencyStock: 2, costPrice: 0, salePrice: 0, provider: '', isActive: true }); setIsProductModalOpen(true); }} className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold">+ Producto</button>}</div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {inventory.map(item => (
        <Card key={item.id} onClick={() => { setEditingProduct(item); setIsProductModalOpen(true); }} className={item.currentStock <= item.minStock ? 'border-orange-200 bg-orange-50/20' : ''}>
          <div className="flex justify-between items-start mb-4"><Badge color={item.category === 'Bebida' ? 'blue' : 'emerald'}>{item.category}</Badge><div className="text-right"><p className="text-[9px] font-black text-gray-400">STOCK</p><p className={`font-black ${item.currentStock <= item.minStock ? 'text-orange-600' : 'text-emerald-950'}`}>{item.currentStock} uds</p></div></div>
          <h4 className="font-bold text-lg text-emerald-950 truncate leading-tight">{item.name}</h4>
          <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-end"><p className="text-sm font-black text-emerald-700">{item.salePrice.toFixed(2)}€</p><Edit2 className="w-4 h-4 text-gray-300"/></div>
        </Card>
      ))}
    </div>
  </div>
);

const FinanceView: React.FC<{ transactions: Transaction[], onAdd: () => void, onToggleReconcile: (id: string) => void }> = ({ transactions, onAdd, onToggleReconcile }) => {
  const [filter, setFilter] = useState('');
  const filtered = transactions.filter(t => t.description.toLowerCase().includes(filter.toLowerCase()));
  
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif font-bold text-emerald-900">Tesorería</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Conciliación Bancaria y Caja</p>
        </div>
        <button onClick={onAdd} className="px-6 py-3 bg-emerald-950 text-white rounded-xl font-bold shadow-lg flex items-center gap-2"><Plus className="w-4 h-4"/> Añadir Movimiento</button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-80">
             <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
             <input className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm" placeholder="Buscar transacción..." value={filter} onChange={e => setFilter(e.target.value)} />
           </div>
           <div className="flex gap-4">
             <div className="text-right"><p className="text-[10px] text-gray-400 font-black">PENDIENTE</p><p className="font-black text-red-600">{transactions.filter(t => !t.isReconciled).reduce((acc, t) => acc + t.amount, 0).toFixed(2)}€</p></div>
             <div className="text-right"><p className="text-[10px] text-gray-400 font-black">CONCILIADO</p><p className="font-black text-emerald-600">{transactions.filter(t => t.isReconciled).reduce((acc, t) => acc + t.amount, 0).toFixed(2)}€</p></div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-right">Importe</th>
                <th className="px-6 py-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.slice().reverse().map(t => (
                <tr key={t.id} className={`hover:bg-emerald-50/30 transition ${!t.isReconciled ? 'bg-orange-50/10' : ''}`}>
                  <td className="px-6 py-4">
                    <button onClick={() => onToggleReconcile(t.id)} className={`p-2 rounded-lg transition ${t.isReconciled ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700 animate-pulse'}`}>
                      {t.isReconciled ? <Check className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-emerald-950">{t.description}</td>
                  <td className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">{t.category}</td>
                  <td className={`px-6 py-4 text-right font-black text-lg ${t.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{t.amount.toFixed(2)}€</td>
                  <td className="px-6 py-4 text-center">
                    <Edit2 className="w-4 h-4 mx-auto text-gray-300 cursor-pointer hover:text-emerald-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const MembersView: React.FC<{ members: Member[], canManage: boolean, setEditingMember: (m: any) => void, setIsMemberModalOpen: (o: boolean) => void, onAdd: () => void }> = ({ members, canManage, setEditingMember, setIsMemberModalOpen, onAdd }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-serif font-bold text-emerald-900">Socias</h2>
      {canManage && <button onClick={onAdd} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg">+ Nueva Socia</button>}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {members.map(m => (
        <Card key={m.id} onClick={() => { setEditingMember(m); setIsMemberModalOpen(true); }} className="hover:border-emerald-500 transition-all border-2 border-transparent">
          <div className="flex items-center gap-4">
            <img src={m.avatarUrl} className="w-14 h-14 rounded-2xl border border-emerald-50 shadow-sm" alt="avatar" />
            <div className="flex-1 truncate">
              <p className="font-bold text-emerald-950 truncate leading-tight">{m.fullName}</p>
              <p className="text-[10px] text-gray-400 font-black uppercase mt-1">{m.role}</p>
            </div>
            <div className="text-right">
              <Badge color={m.status === MemberStatus.ACTIVE ? 'green' : 'gray'}>{m.status}</Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const CommunitySection: React.FC<{ userMessages: UserMessage[]; currentUser: Member; members: Member[]; onSendMessage: (c: string) => void }> = ({ userMessages, currentUser, members, onSendMessage }) => {
  const [msgInput, setMsgInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [userMessages]);
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <div className="mb-6"><h2 className="text-3xl font-serif font-bold text-emerald-900">Comunidad</h2></div>
      <Card className="flex-1 flex flex-col p-0 overflow-hidden shadow-2xl border-emerald-100 min-h-[500px]">
        <div ref={scrollRef} className="flex-1 p-6 space-y-4 overflow-y-auto bg-emerald-50/10 custom-scrollbar">
          {userMessages.map(msg => {
            const sender = members.find(m => m.id === msg.senderId);
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-3`}>
                {!isMe && <img src={sender?.avatarUrl} className="w-8 h-8 rounded-full border border-gray-200 self-end mb-1" alt="avatar"/>}
                <div className={`max-w-[75%] p-4 rounded-3xl text-sm ${isMe ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-emerald-950 border border-emerald-100 shadow-sm'}`}>
                  {!isMe && <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1">{sender?.fullName.split(' ')[0]}</p>}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-6 bg-white border-t border-emerald-100 flex gap-4 items-center">
          <input className="flex-1 p-4 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Escribe un mensaje..." value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && msgInput.trim()) { onSendMessage(msgInput); setMsgInput(''); } }} />
          <button onClick={() => { if (msgInput.trim()) { onSendMessage(msgInput); setMsgInput(''); } }} className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition shadow-lg"><Send className="w-5 h-5"/></button>
        </div>
      </Card>
    </div>
  );
};
