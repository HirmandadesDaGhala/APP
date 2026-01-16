
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, Calendar as CalendarIcon, Package, DollarSign, LayoutDashboard, Menu, X, Plus, Edit2, LogOut, Trash2, MapPin, Send, RefreshCcw, Heart, Brain, Info, MessageCircle, AlertTriangle, Check
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Member, Product, Event, Transaction, Location, RoleDefinition, UserMessage, RolePermissions } from './types';
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

const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple' | 'emerald' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
    purple: 'bg-purple-100 text-purple-800',
    emerald: 'bg-emerald-100 text-emerald-800',
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
  
  // Confirmation states
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(false);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState(false);

  // AI Assistant
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Persistence Loading (V12.1 for maximum reliability)
  useEffect(() => {
    const saved = localStorage.getItem('gastro_soc_v12_stable');
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
      localStorage.setItem('gastro_soc_v12_stable', JSON.stringify(state));
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
      setLoginError('PIN incorrecto. Revisa el código maestro (0628).');
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

  // AI Assistant logic
  const askGemini = async () => {
    if (!aiMessage.trim()) return;
    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `Asistente Irmandades da Ghala. Responde brevemente en Galego: ${aiMessage}.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiResponse(response.text || "Sen resposta.");
    } catch (e) { setAiResponse("Erro na rede."); }
    finally { setIsAiThinking(false); setAiMessage(''); }
  };

  // Operations - Inventory
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

  const handleDeleteProductAction = () => {
    if (!editingProduct) return;
    const idToRemove = editingProduct.id;
    setInventory(current => current.filter(p => p.id !== idToRemove));
    setIsProductModalOpen(false);
    setConfirmDeleteProduct(false);
    setEditingProduct(null);
  };

  // Operations - Events
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
      setInventory(prev => prev.map(p => {
        const cons = ev.consumptions.find(c => c.productId === p.id);
        return cons ? { ...p, currentStock: Math.max(0, p.currentStock - cons.quantity) } : p;
      }));
      setTransactions(prev => [...prev, {
        id: `TR-${Date.now()}`,
        date: new Date().toISOString(),
        description: `Evento: ${ev.title}`,
        amount: ev.totalCost,
        category: 'Evento',
        isReconciled: false,
        paymentMethod: ev.paymentMethod
      }]);
    }
    setIsEventModalOpen(false);
  };

  const handleDeleteEventAction = () => {
    if (!editingEvent) return;
    const idToRemove = editingEvent.id;
    setEvents(current => current.filter(e => e.id !== idToRemove));
    setIsEventModalOpen(false);
    setConfirmDeleteEvent(false);
    setEditingEvent(null);
  };

  if (loading) return <div className="min-h-screen bg-emerald-950 flex items-center justify-center text-white font-serif text-2xl animate-pulse">Cargando Irmandades...</div>;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-emerald-800 p-10 text-center">
            <Heart className="w-10 h-10 text-white fill-white mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold text-white mb-2 tracking-tight">Irmandades da Ghala</h1>
            <Badge color="emerald">Control de Acceso</Badge>
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
         <div className="p-8 border-b border-emerald-800/50 flex items-center gap-3"><Heart className="w-5 h-5 text-emerald-300 fill-emerald-300" /><span className="font-bold text-xl font-serif tracking-tight text-white">Irmandades</span></div>
         <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
            {[
               { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
               { id: 'events', icon: CalendarIcon, label: 'Reservas & Eventos' },
               { id: 'inventory', icon: Package, label: 'Economato' },
               { id: 'community', icon: MessageCircle, label: 'Comunidade' },
               { id: 'finance', icon: DollarSign, label: 'Tesourería', admin: true },
               { id: 'members', icon: Users, label: 'Socias' },
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
              <LogOut className="w-4 h-4"/> Sair
            </button>
         </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-30">
          <button type="button" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-emerald-900"><Menu className="w-6 h-6"/></button>
          <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-xs">
            <Info className="w-4 h-4 text-emerald-400"/>
            <span className="hidden sm:inline">Irmandades da Ghala v1.2.2</span>
          </div>
          <button type="button" onClick={() => setIsAiOpen(true)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition shadow-sm"><Brain className="w-5 h-5"/></button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           {activeTab === 'dashboard' && <DashboardView transactions={transactions} events={events} inventory={inventory} members={members} currentUser={currentUser}/>}
           {activeTab === 'events' && <EventsView events={events} locations={locations} currentUser={currentUser} setEditingEvent={setEditingEvent} setIsEventModalOpen={setIsEventModalOpen} setConfirmDeleteEvent={setConfirmDeleteEvent}/>}
           {activeTab === 'inventory' && <InventoryView inventory={inventory} canManage={can('manage_inventory')} setEditingProduct={setEditingProduct} setIsProductModalOpen={setIsProductModalOpen} setConfirmDeleteProduct={setConfirmDeleteProduct}/>}
           {activeTab === 'community' && <CommunitySection userMessages={userMessages} currentUser={currentUser} members={members} onSendMessage={handleSendMessage}/>}
           {activeTab === 'finance' && <FinanceView transactions={transactions}/>}
           {activeTab === 'members' && <MembersView members={members} canManage={can('manage_members')} setEditingMember={setEditingMember} setIsMemberModalOpen={setIsMemberModalOpen}/>}
           
           {activeTab === 'welcome' && (
              <div className="max-w-4xl mx-auto py-12 text-center h-full flex flex-col items-center justify-center animate-in fade-in duration-700">
                <Heart className="w-20 h-20 text-emerald-100 fill-emerald-100 mb-6"/>
                <h1 className="text-5xl font-serif font-bold text-emerald-950 mb-4 tracking-tighter">Irmandades da Ghala</h1>
                <p className="text-gray-500 text-lg max-w-md mx-auto">Xestión centralizada de economato, reservas e tesourería.</p>
                <button type="button" onClick={() => setActiveTab('dashboard')} className="mt-10 px-12 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-2xl hover:bg-emerald-700 transition transform hover:scale-105">Acceder ao Panel</button>
              </div>
           )}
        </div>
      </main>

      {/* MODAL PRODUCTO */}
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
            </div>
            
            <div className="pt-4 space-y-3">
              <button type="button" onClick={saveProduct} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"><Check className="w-5 h-5"/> Gardar Cambios</button>
              
              {can('manage_inventory') && (
                <div className="pt-6 border-t border-gray-100">
                  {!confirmDeleteProduct ? (
                    <button 
                      type="button" 
                      onClick={() => setConfirmDeleteProduct(true)} 
                      className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4"/> Eliminar Producto
                    </button>
                  ) : (
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-200 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-red-800 font-bold text-center text-sm mb-4 flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5"/> ¿Confirmar eliminación definitiva?</p>
                      <div className="flex gap-3">
                        <button type="button" onClick={handleDeleteProductAction} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 flex items-center justify-center gap-2 shadow-lg shadow-red-100"><Trash2 className="w-4 h-4"/> Si, eliminar</button>
                        <button type="button" onClick={() => setConfirmDeleteProduct(false)} className="flex-1 py-3 bg-white text-gray-600 rounded-xl font-bold border border-red-200">Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL EVENTO */}
      <Modal 
        isOpen={isEventModalOpen} 
        onClose={() => { setIsEventModalOpen(false); setConfirmDeleteEvent(false); }} 
        title={editingEvent?.title || "Ficha de Reserva"} 
        colorHeader="bg-emerald-800" 
        maxWidth="max-w-3xl"
      >
        {editingEvent && (
          <div className="space-y-8">
            <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Título da Reserva</label><input className="w-full p-5 bg-gray-50 border-0 rounded-2xl font-bold text-xl" value={editingEvent.title} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} placeholder="Título do evento" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Data</label><input type="date" className="w-full p-4 bg-gray-50 rounded-2xl border-0" value={editingEvent.date} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} /></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Localización</label><select className="w-full p-4 bg-gray-50 rounded-2xl border-0" value={editingEvent.zoneId} onChange={e => setEditingEvent({...editingEvent, zoneId: e.target.value})} >{locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
            </div>
            
            <div className="pt-6 border-t border-gray-100 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-2xl font-bold text-emerald-950">Total: {editingEvent.totalCost.toFixed(2)}€</p>
                <div className="flex gap-2 w-full sm:w-auto">
                   <select className="flex-1 sm:flex-none p-3 bg-gray-50 rounded-2xl font-bold text-xs border-0" value={editingEvent.status} onChange={e => setEditingEvent({...editingEvent, status: e.target.value as any})}>
                    <option value="Programada">Reservada</option>
                    <option value="Finalizada">Finalizada</option>
                  </select>
                  <button type="button" onClick={() => saveEvent(editingEvent)} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition">Actualizar</button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                {!confirmDeleteEvent ? (
                  <button 
                    type="button" 
                    onClick={() => setConfirmDeleteEvent(true)} 
                    className="w-full py-4 text-red-600 bg-red-50 rounded-2xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4"/> Eliminar esta reserva definitivamente
                  </button>
                ) : (
                  <div className="bg-red-50 p-8 rounded-2xl border border-red-200 animate-in slide-in-from-top-2">
                    <p className="text-red-800 font-bold text-center text-lg mb-6 flex items-center justify-center gap-2"><AlertTriangle className="w-6 h-6"/> ¿Confirmas o borrado?</p>
                    <div className="flex gap-4">
                      <button type="button" onClick={handleDeleteEventAction} className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 flex items-center justify-center gap-2 shadow-xl shadow-red-100"><Trash2 className="w-4 h-4"/> Si, eliminar</button>
                      <button type="button" onClick={() => setConfirmDeleteEvent(false)} className="flex-1 py-4 bg-white text-gray-600 rounded-xl font-bold border border-red-200">Cancelar</button>
                    </div>
                  </div>
                )}
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

// --- SUB-COMPONENTS WITH PROPER TYPES ---

interface LoginPadProps {
  onLogin: (pin: string) => void;
  error: string | null;
}

const LoginPad: React.FC<LoginPadProps> = ({ onLogin, error }) => {
  const [pin, setPin] = useState('');
  const keys = ['1','2','3','4','5','6','7','8','9','X','0','OK'];

  const handleKey = (key: string) => {
    if (key === 'X') setPin('');
    else if (key === 'OK') { if(pin.length === 4) onLogin(pin); }
    else if (pin.length < 4) {
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === 4) setTimeout(() => onLogin(newPin), 300);
    }
  };

  return (
    <div className="p-10 text-center bg-gray-50/80">
      <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-6">Acceso de Socia</p>
      <div className="flex justify-center gap-6 mb-12">
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${i < pin.length ? 'bg-emerald-600 border-emerald-600 scale-125 shadow-lg shadow-emerald-200' : 'bg-white border-gray-200'}`}></div>
        ))}
      </div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold mb-8 animate-in shake duration-500">{error}</div>}
      <div className="grid grid-cols-3 gap-5 max-w-[320px] mx-auto">
        {keys.map(k => (
          <button 
            key={k} 
            type="button"
            onClick={() => handleKey(k)} 
            className={`h-16 rounded-2xl text-2xl font-black flex items-center justify-center transition-all active:scale-90 shadow-sm border-b-4 
              ${k === 'OK' ? 'bg-emerald-600 text-white border-emerald-800' : k === 'X' ? 'bg-red-500 text-white border-red-800' : 'bg-white text-emerald-950 border-gray-300 hover:bg-gray-100 active:bg-gray-200'}`}
          >
            {k}
          </button>
        ))}
      </div>
      <p className="mt-10 text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">Código Maestro: 0628</p>
    </div>
  );
};

interface DashboardViewProps { 
  transactions: Transaction[]; 
  events: Event[]; 
  inventory: Product[]; 
  members: Member[]; 
  currentUser: Member;
}

const DashboardView: React.FC<DashboardViewProps> = ({ transactions, events, inventory, members, currentUser }) => {
  const balance = transactions.reduce((acc, t) => acc + t.amount, 0);
  const critical = inventory.filter(p => p.currentStock <= p.minStock).length;
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-serif font-bold text-emerald-950">Boas tardes, {currentUser.fullName.split(' ')[0]}</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-emerald-50 border-emerald-100"><Badge color="emerald">Tesourería</Badge><p className="text-xs text-emerald-800 font-bold mt-2">Saldo</p><h3 className="text-3xl font-bold text-emerald-950">{balance.toFixed(2)}€</h3></Card>
        <Card><Badge color="blue">Agenda</Badge><p className="text-xs text-gray-400 font-bold mt-2">Reservas</p><h3 className="text-3xl font-bold text-gray-900">{events.filter(e => e.status === 'Programada').length}</h3></Card>
        <Card className={critical > 0 ? 'bg-red-50 border-red-100' : ''}><Badge color={critical > 0 ? 'red' : 'gray'}>Stock</Badge><p className="text-xs text-gray-400 font-bold mt-2">Críticos</p><h3 className="text-3xl font-bold text-gray-900">{critical}</h3></Card>
        <Card><Badge color="purple">Socias</Badge><p className="text-xs text-gray-400 font-bold mt-2">Membros</p><h3 className="text-3xl font-bold text-gray-900">{members.length}</h3></Card>
      </div>
      <Card className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={transactions.slice(-15)}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/><XAxis dataKey="date" hide/><YAxis hide/><Tooltip contentStyle={{borderRadius:'16px', border:'0'}}/><Area type="monotone" dataKey="amount" stroke="#10b981" fill="#ecfdf5" strokeWidth={3}/></AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

interface EventsViewProps { 
  events: Event[]; 
  locations: Location[]; 
  currentUser: Member; 
  setEditingEvent: (e: Event | null) => void; 
  setIsEventModalOpen: (o: boolean) => void; 
  setConfirmDeleteEvent: (c: boolean) => void; 
}

const EventsView: React.FC<EventsViewProps> = ({ events, locations, currentUser, setEditingEvent, setIsEventModalOpen, setConfirmDeleteEvent }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-serif font-bold text-emerald-900">Reservas</h2>
      <button type="button" onClick={() => { setEditingEvent({ id: `EV-${Date.now()}`, title: '', date: new Date().toISOString().split('T')[0], organizerId: currentUser.id, attendeeIds: [], attendees: 1, guestCount: 0, zoneId: 'LOC-001', status: 'Programada', consumptions: [], totalCost: 0, paymentStatus: 'Pendiente', paymentMethod: 'Efectivo' }); setConfirmDeleteEvent(false); setIsEventModalOpen(true); }} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl">Nova Reserva</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {events.slice().reverse().map((e: Event) => (
        <Card key={e.id} onClick={() => { setEditingEvent(e); setConfirmDeleteEvent(false); setIsEventModalOpen(true); }}>
          <div className="flex justify-between items-start mb-4"><Badge color={e.status === 'Programada' ? 'blue' : 'emerald'}>{e.status}</Badge><span className="text-[10px] font-black text-gray-400">{new Date(e.date).toLocaleDateString()}</span></div>
          <h4 className="text-xl font-bold text-emerald-950 mb-2 truncate leading-tight">{e.title || 'Sen título'}</h4>
          <div className="flex items-center gap-4 text-xs text-gray-600 mb-6"><div className="flex items-center gap-1"><Users className="w-3 h-3"/> {e.attendees}</div><div className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {locations.find((l: Location) => l.id === e.zoneId)?.name}</div></div>
          <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-emerald-700">
            <p className="font-bold text-lg">{e.totalCost.toFixed(2)}€</p>
            <Edit2 className="w-4 h-4 text-emerald-200"/>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

interface InventoryViewProps { 
  inventory: Product[]; 
  canManage: boolean; 
  setEditingProduct: (p: Product | null) => void; 
  setIsProductModalOpen: (o: boolean) => void; 
  setConfirmDeleteProduct: (c: boolean) => void; 
}

const InventoryView: React.FC<InventoryViewProps> = ({ inventory, canManage, setEditingProduct, setIsProductModalOpen, setConfirmDeleteProduct }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-serif font-bold text-emerald-900">Economato</h2>
      {canManage && (
         <button type="button" onClick={() => { setEditingProduct({ id: `PROD-${Date.now()}`, name: '', category: 'Bebida', unit: 'Botella', currentStock: 0, minStock: 5, emergencyStock: 2, costPrice: 0, salePrice: 0, provider: '', isActive: true }); setConfirmDeleteProduct(false); setIsProductModalOpen(true); }} className="px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl">Novo Producto</button>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {inventory.map((item: Product) => (
        <Card key={item.id} className={item.currentStock <= item.minStock ? 'border-red-200 bg-red-50/20' : ''} onClick={() => { setEditingProduct(item); setConfirmDeleteProduct(false); setIsProductModalOpen(true); }}>
          <div className="flex justify-between items-start mb-4"><Badge color={item.category === 'Bebida' ? 'blue' : 'emerald'}>{item.category}</Badge><div className="text-right"><p className="text-[9px] font-bold text-gray-400 uppercase">Stock</p><p className={`font-black ${item.currentStock <= item.minStock ? 'text-red-600' : 'text-emerald-950'}`}>{item.currentStock} uds</p></div></div>
          <h4 className="font-bold text-lg text-emerald-950 truncate mb-4 leading-tight">{item.name}</h4>
          <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50"><div><p className="text-[9px] font-bold text-gray-400 uppercase">Prezo</p><p className="font-black text-emerald-700 text-lg">{item.salePrice.toFixed(2)}€</p></div><div className="flex items-end justify-end"><Edit2 className="w-4 h-4 text-emerald-200"/></div></div>
        </Card>
      ))}
    </div>
  </div>
);

interface CommunitySectionProps { 
  userMessages: UserMessage[]; 
  currentUser: Member; 
  members: Member[]; 
  onSendMessage: (c: string) => void; 
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ userMessages, currentUser, members, onSendMessage }) => {
  const [msgInput, setMsgInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [userMessages]);
  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto animate-in fade-in">
      <div className="mb-6"><h2 className="text-3xl font-serif font-bold text-emerald-900">Comunidade</h2></div>
      <Card className="flex-1 flex flex-col p-0 overflow-hidden shadow-2xl border-emerald-100 min-h-[500px]">
        <div ref={scrollRef} className="flex-1 p-6 space-y-4 overflow-y-auto bg-emerald-50/10 custom-scrollbar">
          {userMessages.map((msg: UserMessage) => {
            const sender = members.find((m: Member) => m.id === msg.senderId);
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
          <input className="flex-1 p-4 bg-gray-50 rounded-2xl border-0 focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Escribe unha mensaxe..." value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && msgInput.trim()) { onSendMessage(msgInput); setMsgInput(''); } }} />
          <button type="button" onClick={() => { if (msgInput.trim()) { onSendMessage(msgInput); setMsgInput(''); } }} className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition shadow-lg"><Send className="w-5 h-5"/></button>
        </div>
      </Card>
    </div>
  );
};

interface FinanceViewProps { transactions: Transaction[] }

const FinanceView: React.FC<FinanceViewProps> = ({ transactions }) => (
  <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
    <h2 className="text-3xl font-serif font-bold text-emerald-900">Contabilidade</h2>
    <Card className="p-0 overflow-hidden shadow-xl border-emerald-50">
      <table className="w-full text-left text-sm">
        <thead className="bg-emerald-900 text-[10px] uppercase text-emerald-100 font-bold tracking-widest"><tr><th className="px-6 py-5">Data</th><th className="px-6 py-5">Concepto</th><th className="px-6 py-5 text-right">Contía</th></tr></thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.slice().reverse().map((t: Transaction) => (
            <tr key={t.id} className="hover:bg-gray-50 transition"><td className="px-6 py-4 font-bold text-gray-400">{new Date(t.date).toLocaleDateString()}</td><td className="px-6 py-4 font-bold text-emerald-950">{t.description}</td><td className={`px-6 py-4 text-right font-black ${t.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{t.amount.toFixed(2)}€</td></tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

interface MembersViewProps { 
  members: Member[]; 
  canManage: boolean; 
  setEditingMember: (m: Member | null) => void; 
  setIsMemberModalOpen: (o: boolean) => void; 
}

const MembersView: React.FC<MembersViewProps> = ({ members, canManage, setEditingMember, setIsMemberModalOpen }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <h2 className="text-3xl font-serif font-bold text-emerald-900">Socias</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {members.map((m: Member) => (
        <Card key={m.id} className="border-2 border-transparent hover:border-emerald-100 transition-all"><div className="flex items-center gap-4"><img src={m.avatarUrl} className="w-14 h-14 rounded-2xl shadow-sm border border-emerald-50" alt="avatar" /><div className="flex-1 truncate"><p className="font-bold text-emerald-950 truncate leading-tight">{m.fullName}</p><p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter mt-1">{m.role}</p></div>{canManage && (<button type="button" onClick={() => { setEditingMember(m); setIsMemberModalOpen(true); }} className="p-2.5 text-gray-400 hover:text-emerald-600 bg-gray-50 rounded-xl transition"><Edit2 className="w-4 h-4"/></button>)}</div></Card>
      ))}
    </div>
  </div>
);
