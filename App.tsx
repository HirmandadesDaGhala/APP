import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar as CalendarIcon, Package, DollarSign, LayoutDashboard, Menu, X, Plus, FileText, Settings, Camera, CheckCircle, Edit2, LogOut, ChevronRight, ChevronLeft, Trash2, ShoppingCart, BookOpen, Feather, MapPin, Bell, ShoppingBag, Send, RefreshCcw, Database, Shield, AlertCircle, Download, ShieldAlert, Heart, Compass, Clipboard, MessageCircle, List, CloudLightning
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { supabase } from './supabaseClient';
import { Member, Product, Event, Transaction, MemberStatus, Role, SystemMessage, EventConsumption, PaymentMethod, Location, TransactionCategory, RoleDefinition, UserMessage, FinancialMonthData, RolePermissions } from './types';
import { INITIAL_MEMBERS, INITIAL_INVENTORY, INITIAL_EVENTS, INITIAL_TRANSACTIONS, INITIAL_SYSTEM_MESSAGES, INITIAL_USER_MESSAGES, DOC_STATUTES, DOC_COMMITMENT, DOC_PHILOSOPHY, TUTORIAL_STEPS, GUEST_FEE, SOC_FEE, INITIAL_LOCATIONS, INITIAL_ROLE_DEFINITIONS } from './constants';

// --- COMPONENTS ---

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
    purple: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; colorHeader?: string; maxWidth?: string }> = ({ isOpen, onClose, title, children, colorHeader, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200`}>
        <div className={`flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 z-10 ${colorHeader ? colorHeader : 'bg-white'}`}>
          <h3 className={`text-xl font-bold ${colorHeader ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <button onClick={onClose} className={`${colorHeader ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const LoginScreen: React.FC<{ onLogin: (pin: string) => void; error: string | null; loading: boolean }> = ({ onLogin, error, loading }) => {
  const [pin, setPin] = useState('');
  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) setTimeout(() => onLogin(newPin), 300);
    }
  };
  const handleDelete = () => setPin(prev => prev.slice(0, -1));
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col h-[600px] md:h-auto border border-gray-100">
        <div className="bg-emerald-700 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-white/30">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 font-serif tracking-wide">Hirmandades da Ghala</h1>
          <p className="text-emerald-100 text-sm italic">"Donde se comparte la mesa y la vida"</p>
        </div>
        <div className="p-8 flex-1 flex flex-col justify-center">
          {loading ? (
            <div className="text-center text-emerald-600 animate-pulse font-bold">Iniciando sistema...</div>
          ) : (
            <>
              <div className="flex justify-center gap-4 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`w-4 h-4 rounded-full transition-all duration-200 ${i < pin.length ? 'bg-emerald-600 scale-110' : 'bg-gray-200'}`} />
                ))}
              </div>
              {error && <div className="text-red-500 text-center text-sm font-medium mb-6">{error}</div>}
              <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
                {numbers.map((num, idx) => {
                  if (num === '') return <div key={idx} />;
                  if (num === 'del') return (
                    <button key={idx} onClick={handleDelete} className="w-16 h-16 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100">
                      <X className="w-6 h-6" />
                    </button>
                  );
                  return (
                    <button key={idx} onClick={() => handleNumberClick(num)} className="w-16 h-16 rounded-full border-2 border-gray-100 text-2xl font-serif text-gray-700 hover:border-emerald-500 hover:text-emerald-600">
                      {num}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  // --- STATE (SUPABASE) ---
  const [loading, setLoading] = useState(true);
  const [useDemoMode, setUseDemoMode] = useState(false); // Fallback if no Supabase
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('welcome');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([]);
  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>([]);

  // UI States
  const [welcomeSection, setWelcomeSection] = useState<'hub' | 'tutorial' | 'docs'>('hub');
  const [viewingDoc, setViewingDoc] = useState<'statutes' | 'commitment' | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyItems, setEmergencyItems] = useState<Product[]>([]);
  const [eventViewMode, setEventViewMode] = useState<'list' | 'calendar'>('list');
  
  // Community
  const [communityTab, setCommunityTab] = useState<'wall' | 'private' | 'official'>('official');
  const [chatInput, setChatInput] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [isNewSystemMsgModalOpen, setIsNewSystemMsgModalOpen] = useState(false);
  const [newSystemMsg, setNewSystemMsg] = useState({ title: '', content: '', priority: 'normal' as 'high' | 'normal' });

  // Inventory UI
  const [showInactiveProducts, setShowInactiveProducts] = useState(false);

  // Modals
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [managingConsumptionsFor, setManagingConsumptionsFor] = useState<Event | null>(null);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDirectPurchaseModalOpen, setIsDirectPurchaseModalOpen] = useState(false);
  const [isOrderListModalOpen, setIsOrderListModalOpen] = useState(false);
  const [isShrinkageModalOpen, setIsShrinkageModalOpen] = useState(false);
  const [shrinkageForm, setShrinkageForm] = useState({ productId: '', quantity: 1, reason: 'Caducidad' });
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditData, setAuditData] = useState<Record<string, number>>({});

  // Settings Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);

  // Consumption
  const [customConsumption, setCustomConsumption] = useState({ name: '', price: '' });
  const [consumptionTab, setConsumptionTab] = useState<'inventory' | 'custom' | 'service'>('inventory');
  const [consumptionQty, setConsumptionQty] = useState(1);
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>('Efectivo');

  const [purchaseForm, setPurchaseForm] = useState({ productId: '', quantity: 1, totalCost: 0 });
  const [shoppingCart, setShoppingCart] = useState<EventConsumption[]>([]);
  const [shoppingSettleMethod, setShoppingSettleMethod] = useState<PaymentMethod>('Efectivo');

  // --- SUPABASE DATA FETCHING ---
  
  const fetchData = async () => {
    // Only set loading on initial fetch, not on realtime updates
    if (members.length === 0) setLoading(true);
    
    // Explicitly handle null supabase (Demo Mode)
    if (!supabase) {
       console.log("No Supabase client available. Entering Demo Mode.");
       setUseDemoMode(true);
       setMembers(INITIAL_MEMBERS);
       setInventory(INITIAL_INVENTORY);
       setEvents(INITIAL_EVENTS);
       setTransactions(INITIAL_TRANSACTIONS);
       setLocations(INITIAL_LOCATIONS);
       setRoleDefinitions(INITIAL_ROLE_DEFINITIONS);
       setSystemMessages(INITIAL_SYSTEM_MESSAGES);
       setUserMessages(INITIAL_USER_MESSAGES);
       setLoading(false);
       return;
    }

    try {
      const { data: mems, error: err1 } = await supabase.from('members').select('*');
      const { data: inv, error: err2 } = await supabase.from('inventory').select('*');
      const { data: evts, error: err3 } = await supabase.from('events').select('*');
      const { data: trxs, error: err4 } = await supabase.from('transactions').select('*');
      const { data: locs, error: err5 } = await supabase.from('locations').select('*');
      const { data: roles, error: err6 } = await supabase.from('roleDefinitions').select('*');
      const { data: sysMsgs, error: err7 } = await supabase.from('systemMessages').select('*');
      const { data: usrMsgs, error: err8 } = await supabase.from('userMessages').select('*');

      if (err1 || err2 || err3 || err4 || err5 || err6 || err7 || err8) {
         console.error("Supabase Error:", err1 || err2 || err3);
         throw new Error("Error fetching data from Supabase");
      }

      if (mems) setMembers(mems);
      if (inv) setInventory(inv);
      if (evts) setEvents(evts);
      if (trxs) setTransactions(trxs);
      if (locs) setLocations(locs);
      if (roles) setRoleDefinitions(roles);
      if (sysMsgs) setSystemMessages(sysMsgs);
      if (usrMsgs) setUserMessages(usrMsgs);
      
    } catch (error) {
      console.error("Critical Data Fetch Error:", error);
      // Fallback to demo mode on crash
      if (members.length === 0) {
        setUseDemoMode(true);
        setMembers(INITIAL_MEMBERS);
        setInventory(INITIAL_INVENTORY);
        setEvents(INITIAL_EVENTS);
        setTransactions(INITIAL_TRANSACTIONS);
        setLocations(INITIAL_LOCATIONS);
        setRoleDefinitions(INITIAL_ROLE_DEFINITIONS);
        setSystemMessages(INITIAL_SYSTEM_MESSAGES);
        setUserMessages(INITIAL_USER_MESSAGES);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // SETUP REALTIME SUBSCRIPTION
    if (supabase) {
      const channel = supabase.channel('db_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            console.log('Change received!', payload);
            fetchData(); // Refresh data on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // --- ACTIONS ---

  const can = (permission: keyof RolePermissions) => {
    if (!currentUser) return false;
    const roleDef = roleDefinitions.find(r => r.id === currentUser.role);
    return roleDef ? roleDef.permissions[permission] : false;
  };

  const handleLogin = (pin: string) => {
    const user = members.find(m => m.pin === pin);
    if (user) {
      if (user.status !== MemberStatus.ACTIVE) {
        setLoginError('Socia inactiva.');
        return;
      }
      setCurrentUser(user);
      setLoginError(null);
      
      const critical = inventory.filter(p => p.isActive && p.currentStock <= p.emergencyStock);
      if (critical.length > 0) {
        setEmergencyItems(critical);
        setShowEmergencyModal(true);
      }

      const unread = systemMessages.filter(msg => msg.readBy && !msg.readBy.includes(user.id));
      if (unread.length > 0) {
        setShowMessagesModal(true);
      }
      
      if (!user.documentsSigned?.statutes || !user.documentsSigned.paymentCommitment) { 
        setActiveTab('welcome'); 
        setWelcomeSection('hub'); 
      } else {
        setActiveTab('dashboard');
      }
    } else {
      setLoginError('PIN incorrecto.');
      setTimeout(() => setLoginError(null), 2000);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('welcome');
    setIsSidebarOpen(false);
  };

  const markMessagesRead = async () => {
    if (!currentUser) return;
    // Optimistic
    const updatedMessages = systemMessages.map(msg => {
       if (!msg.readBy.includes(currentUser.id)) {
          return { ...msg, readBy: [...msg.readBy, currentUser.id] };
       }
       return msg;
    });
    setSystemMessages(updatedMessages);
    setShowMessagesModal(false);

    if (supabase) {
       const unreadMsgs = systemMessages.filter(msg => !msg.readBy.includes(currentUser.id));
       for (const msg of unreadMsgs) {
          await supabase.from('systemMessages').update({ readBy: [...msg.readBy, currentUser.id] }).eq('id', msg.id);
       }
    }
  };

  // --- DATA MANAGEMENT ---
  const handleResetData = async () => {
    if (confirm("¿Estás segura? Esto borrará la base de datos y cargará los datos de ejemplo.")) {
      setLoading(true);
      if (supabase) {
        await supabase.from('transactions').delete().neq('id', '0');
        await supabase.from('events').delete().neq('id', '0');
        await supabase.from('inventory').delete().neq('id', '0');
        await supabase.from('members').delete().neq('id', '0');
        await supabase.from('locations').delete().neq('id', '0');
        await supabase.from('roleDefinitions').delete().neq('id', '0');
        await supabase.from('systemMessages').delete().neq('id', '0');
        await supabase.from('userMessages').delete().neq('id', '0');

        await supabase.from('roleDefinitions').insert(INITIAL_ROLE_DEFINITIONS);
        await supabase.from('locations').insert(INITIAL_LOCATIONS);
        await supabase.from('members').insert(INITIAL_MEMBERS);
        await supabase.from('inventory').insert(INITIAL_INVENTORY);
        await supabase.from('events').insert(INITIAL_EVENTS);
        await supabase.from('transactions').insert(INITIAL_TRANSACTIONS);
        await supabase.from('systemMessages').insert(INITIAL_SYSTEM_MESSAGES);
        await supabase.from('userMessages').insert(INITIAL_USER_MESSAGES);
        await fetchData();
      } else {
        setMembers(INITIAL_MEMBERS);
        setInventory(INITIAL_INVENTORY);
        setEvents(INITIAL_EVENTS);
        setTransactions(INITIAL_TRANSACTIONS);
        setLocations(INITIAL_LOCATIONS);
        setRoleDefinitions(INITIAL_ROLE_DEFINITIONS);
        setSystemMessages(INITIAL_SYSTEM_MESSAGES);
        setUserMessages(INITIAL_USER_MESSAGES);
        setLoading(false);
      }
      alert("Datos restaurados.");
    }
  };

  const handleClearData = async () => {
     if (confirm("¿PELIGRO! Esto borrará todas las socias, eventos y transacciones de la NUBE. ¿Continuar?")) {
        setLoading(true);
        if (supabase) {
           await supabase.from('transactions').delete().neq('id', '0');
           await supabase.from('events').delete().neq('id', '0');
           await fetchData();
        } else {
           setTransactions([]);
           setEvents([]);
           setLoading(false);
        }
        alert("Base de datos limpiada.");
     }
  };

  // --- SETTINGS MANAGEMENT ---
  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    if (supabase) {
       const { error } = await supabase.from('locations').upsert(editingLocation);
       if (!error) {
          // Realtime will fetch data
          setIsLocationModalOpen(false);
          setEditingLocation(null);
       } else {
          alert(error.message);
       }
    } else {
       // Demo
       if (locations.find(l => l.id === editingLocation.id)) {
          setLocations(locations.map(l => l.id === editingLocation.id ? editingLocation : l));
       } else {
          setLocations([...locations, editingLocation]);
       }
       setIsLocationModalOpen(false);
       setEditingLocation(null);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (confirm("¿Borrar esta ubicación?")) {
      if (supabase) {
         await supabase.from('locations').delete().eq('id', id);
         // Realtime fetch
      } else {
         setLocations(locations.filter(l => l.id !== id));
      }
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    if (supabase) {
       await supabase.from('roleDefinitions').upsert(editingRole);
       // Realtime fetch
    } else {
       setRoleDefinitions(roleDefinitions.map(r => r.id === editingRole.id ? editingRole : r));
    }
    setIsRoleModalOpen(false);
    setEditingRole(null);
  };

  // --- MESSAGING ---
  const handleSendUserMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !chatInput.trim()) return;

    const newMessage: UserMessage = {
      id: `UM-${Date.now()}`,
      senderId: currentUser.id,
      content: chatInput,
      timestamp: new Date().toISOString(),
      isRead: false,
      recipientId: communityTab === 'private' ? selectedRecipientId : undefined
    };

    if (supabase) {
       const { error } = await supabase.from('userMessages').insert(newMessage);
       if (!error) {
          // Optimistic update
          setUserMessages([...userMessages, newMessage]);
          setChatInput('');
       }
    } else {
       setUserMessages([...userMessages, newMessage]);
       setChatInput('');
    }
  };

  const handleCreateSystemMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const newMsg: SystemMessage = {
      id: `MSG-${Date.now()}`,
      title: newSystemMsg.title,
      content: newSystemMsg.content,
      date: new Date().toISOString().split('T')[0],
      priority: newSystemMsg.priority,
      authorId: currentUser.id,
      readBy: []
    };
    if (supabase) await supabase.from('systemMessages').insert(newMsg);
    setSystemMessages([newMsg, ...systemMessages]);
    setIsNewSystemMsgModalOpen(false);
    setNewSystemMsg({ title: '', content: '', priority: 'normal' });
    alert("Mensaje publicado.");
  };

  // --- MEMBERS ---
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    
    if (supabase) {
       const { error } = await supabase.from('members').upsert(editingMember);
       if (error) {
          alert("Error guardando socia: " + error.message);
          return;
       }
    }
    
    // Update local state optimistic
    if (members.find(m => m.id === editingMember.id)) {
      setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
      if (currentUser?.id === editingMember.id) setCurrentUser(editingMember);
    } else {
      setMembers([...members, editingMember]);
    }
    setIsMemberModalOpen(false);
    setEditingMember(null);
  };

  const openEditMember = (member?: Member) => {
    const isSelf = member?.id === currentUser?.id;
    if (!can('manage_members') && !isSelf && member) {
       alert("No tienes permiso para editar otras socias.");
       return;
    }
    if (!can('manage_members') && !member) {
       alert("Solo administradoras pueden crear socias.");
       return;
    }

    setEditingMember(member ? { ...member } : {
      id: `SOC-${Date.now()}`,
      fullName: '', dni: '', email: '', phone: '', iban: 'ES', address: '', status: MemberStatus.ACTIVE,
      joinDate: new Date().toISOString().split('T')[0], role: Role.MEMBER, pin: '0000',
      documentsSigned: { statutes: false, paymentCommitment: false, date: '' }
    });
    setIsMemberModalOpen(true);
  };

  // --- EVENTS ---
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    const hasConflict = events.some(ev => 
      ev.id !== editingEvent.id && 
      ev.date === editingEvent.date && 
      ev.zoneId === editingEvent.zoneId &&
      ev.status !== 'Cancelada'
    );
    if (hasConflict) {
      alert(`⚠️ CONFLICTO: La zona ya está ocupada el día ${editingEvent.date}.`);
      return;
    }

    const consumptionsCost = editingEvent.consumptions.reduce((acc, c) => acc + c.totalCost, 0);
    const guestCost = editingEvent.guestCount * GUEST_FEE;
    const updatedEvent = { ...editingEvent, totalCost: consumptionsCost + guestCost };

    if (supabase) {
       const { error } = await supabase.from('events').upsert(updatedEvent);
       if (!error) {
          // Realtime will handle update
          setIsEventModalOpen(false);
          setEditingEvent(null);
       } else {
          alert(error.message);
       }
    } else {
       if (events.find(ev => ev.id === updatedEvent.id)) {
         setEvents(events.map(ev => ev.id === updatedEvent.id ? updatedEvent : ev));
       } else {
         setEvents([...events, updatedEvent]);
       }
       setIsEventModalOpen(false);
       setEditingEvent(null);
    }
  };

  // --- PRODUCT MANAGEMENT ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (supabase) {
       const { error } = await supabase.from('inventory').upsert(editingProduct);
       if (!error) {
          setIsProductModalOpen(false);
          setEditingProduct(null);
       } else {
          alert(error.message);
       }
    } else {
       if (inventory.find(p => p.id === editingProduct.id)) {
          setInventory(inventory.map(p => p.id === editingProduct.id ? editingProduct : p));
       } else {
          setInventory([...inventory, editingProduct]);
       }
       setIsProductModalOpen(false);
       setEditingProduct(null);
    }
  };

  // --- SHRINKAGE ---
  const handleReportShrinkage = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = inventory.find(p => p.id === shrinkageForm.productId);
    if (!prod) return;
    
    const updatedProd = { ...prod, currentStock: prod.currentStock - shrinkageForm.quantity };
    
    const newTx: Transaction = {
      id: `TRX-LOSS-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Merma: ${prod.name} (x${shrinkageForm.quantity}) - ${shrinkageForm.reason}`,
      amount: -(prod.costPrice * shrinkageForm.quantity),
      category: 'Pérdidas/Mermas',
      isReconciled: true,
      paymentMethod: 'N/A'
    };

    if (supabase) {
       await supabase.from('inventory').update({ currentStock: updatedProd.currentStock }).eq('id', prod.id);
       await supabase.from('transactions').insert(newTx);
    }
    
    setInventory(inventory.map(p => p.id === prod.id ? updatedProd : p));
    setTransactions([...transactions, newTx]);
    
    setIsShrinkageModalOpen(false);
    setShrinkageForm({ productId: '', quantity: 1, reason: 'Caducidad' });
  };

  // --- AUDIT ---
  const initAudit = () => {
    const initialCounts: Record<string, number> = {};
    inventory.forEach(p => { if (p.isActive) initialCounts[p.id] = p.currentStock; });
    setAuditData(initialCounts);
    setIsAuditModalOpen(true);
  };

  const handleFinishAudit = async () => {
    if (!window.confirm("¿Finalizar auditoría?")) return;
    let totalVarianceValue = 0;
    const updates: Product[] = [];
    
    const updatedInventory = inventory.map(p => {
      if (!p.isActive) return p;
      const realCount = auditData[p.id] ?? p.currentStock;
      const variance = realCount - p.currentStock;
      if (variance !== 0) totalVarianceValue += (variance * p.costPrice);
      if (variance !== 0) updates.push({ ...p, currentStock: realCount });
      return { ...p, currentStock: realCount };
    });

    if (supabase) {
       for (const p of updates) {
          await supabase.from('inventory').update({ currentStock: p.currentStock }).eq('id', p.id);
       }
       if (totalVarianceValue !== 0) {
         const newTx: Transaction = {
           id: `TRX-AUDIT-${Date.now()}`,
           date: new Date().toISOString().split('T')[0],
           description: `Ajuste Inventario (Auditoría)`,
           amount: totalVarianceValue,
           category: 'Ajuste Inventario',
           isReconciled: true,
           paymentMethod: 'N/A'
         };
         await supabase.from('transactions').insert(newTx);
         setTransactions([...transactions, newTx]);
       }
    }
    
    setInventory(updatedInventory);
    setIsAuditModalOpen(false);
  };

  // --- CONSUMPTIONS ---
  const handleAddInventoryConsumption = (product: Product, quantity: number) => {
    if (!managingConsumptionsFor) return;
    if (product.currentStock < quantity) {
      alert(`⚠️ Stock insuficiente.`);
      return;
    }
    
    setInventory(inventory.map(p => p.id === product.id ? { ...p, currentStock: p.currentStock - quantity } : p));
    
    const newCon: EventConsumption = {
      id: `CONS-${Date.now()}`,
      type: 'product',
      productId: product.id,
      name: product.name,
      quantity: quantity,
      unitCost: product.salePrice,
      totalCost: quantity * product.salePrice
    };
    updateEventConsumptions([...managingConsumptionsFor.consumptions, newCon]);
  };

  const handleAddCustomConsumption = () => {
    if (!managingConsumptionsFor || !customConsumption.name || !customConsumption.price) return;
    const price = parseFloat(customConsumption.price);
    const newCon: EventConsumption = {
      id: `CONS-${Date.now()}`,
      type: consumptionTab === 'service' ? 'service' : 'custom',
      name: customConsumption.name,
      quantity: 1,
      unitCost: price,
      totalCost: price
    };
    updateEventConsumptions([...managingConsumptionsFor.consumptions, newCon]);
    setCustomConsumption({ name: '', price: '' });
  };

  const updateEventConsumptions = (newConsumptions: EventConsumption[]) => {
    if (!managingConsumptionsFor) return;
    const consumptionsCost = newConsumptions.reduce((acc, c) => acc + c.totalCost, 0);
    const guestCost = managingConsumptionsFor.guestCount * GUEST_FEE;
    setManagingConsumptionsFor({
      ...managingConsumptionsFor,
      consumptions: newConsumptions,
      totalCost: consumptionsCost + guestCost
    });
  };

  const handleRemoveConsumption = (id: string, type: string, productId?: string, quantity?: number) => {
    if (!managingConsumptionsFor) return;
    if (type === 'product' && productId && quantity) {
       // Return stock
       setInventory(inventory.map(p => p.id === productId ? { ...p, currentStock: p.currentStock + quantity } : p));
    }
    updateEventConsumptions(managingConsumptionsFor.consumptions.filter(c => c.id !== id));
  };

  const saveConsumptionsToEvent = async () => {
    if (!managingConsumptionsFor) return;
    
    if (supabase) {
       await supabase.from('events').upsert(managingConsumptionsFor);
       // Optimization: Only update products in the event
       for (const prod of inventory) {
          await supabase.from('inventory').update({ currentStock: prod.currentStock }).eq('id', prod.id);
       }
    }

    setEvents(events.map(e => e.id === managingConsumptionsFor.id ? managingConsumptionsFor : e));
    setIsConsumptionModalOpen(false);
    setManagingConsumptionsFor(null);
  };

  const handleSettleEvent = async () => {
     if (!managingConsumptionsFor || !currentUser) return;
     if (!window.confirm(`¿Confirmas que has recibido ${managingConsumptionsFor.totalCost.toFixed(2)}€?`)) return;
     const settledEvent: Event = {
        ...managingConsumptionsFor,
        paymentStatus: 'Pagada',
        paymentMethod: settleMethod,
        settledBy: currentUser.id,
        settlementDate: new Date().toISOString().split('T')[0]
     };

     const newTx: Transaction = {
        id: `TRX-AUTO-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `Ingreso Evento: ${settledEvent.title}`,
        amount: settledEvent.totalCost,
        category: 'Evento',
        relatedEventId: settledEvent.id,
        isReconciled: false,
        paymentMethod: settleMethod
     };

     if (supabase) {
        await supabase.from('events').upsert(settledEvent);
        await supabase.from('transactions').insert(newTx);
        for (const prod of inventory) {
           await supabase.from('inventory').update({ currentStock: prod.currentStock }).eq('id', prod.id);
        }
     }

     setEvents(events.map(e => e.id === settledEvent.id ? settledEvent : e));
     setTransactions([...transactions, newTx]);
     setIsConsumptionModalOpen(false);
     setManagingConsumptionsFor(null);
  };

  // --- DIRECT PURCHASE ---
  const addToCart = (product: Product, quantity: number) => {
     if (product.currentStock < quantity) { alert("Stock insuficiente"); return; }
     setInventory(inventory.map(p => p.id === product.id ? { ...p, currentStock: p.currentStock - quantity } : p));
     const newItem: EventConsumption = {
        id: `CART-${Date.now()}`,
        type: 'product',
        productId: product.id,
        name: product.name,
        quantity: quantity,
        unitCost: product.salePrice,
        totalCost: quantity * product.salePrice
     };
     setShoppingCart([...shoppingCart, newItem]);
  };

  const settleDirectPurchase = async () => {
     if (!currentUser) return;
     const total = shoppingCart.reduce((acc, c) => acc + c.totalCost, 0);
     if (total === 0) return;
     if (!window.confirm(`¿Confirmas el pago de ${total.toFixed(2)}€?`)) return;
     
     const newTx: Transaction = {
        id: `TRX-SHOP-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `Compra Directa: ${currentUser.fullName}`,
        amount: total,
        category: 'Venta Directa Economato',
        relatedMemberId: currentUser.id,
        isReconciled: false,
        paymentMethod: shoppingSettleMethod
     };

     if (supabase) {
        await supabase.from('transactions').insert(newTx);
        for (const prod of inventory) {
           await supabase.from('inventory').update({ currentStock: prod.currentStock }).eq('id', prod.id);
        }
     }

     setTransactions([...transactions, newTx]);
     setIsDirectPurchaseModalOpen(false);
     setShoppingCart([]);
     alert("Compra realizada y registrada.");
  };

  const cancelDirectPurchase = () => {
     fetchData();
     setShoppingCart([]);
     setIsDirectPurchaseModalOpen(false);
  };

  // --- REPOSITION ---
  const handleRegisterPurchase = async (e: React.FormEvent) => {
     e.preventDefault();
     const prod = inventory.find(p => p.id === purchaseForm.productId);
     if (!prod) return;
     const updatedInventory = inventory.map(p => p.id === prod.id ? { ...p, currentStock: p.currentStock + purchaseForm.quantity } : p);
     
     const newTx: Transaction = {
        id: `TRX-BUY-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `Compra Economato: ${prod.name} (x${purchaseForm.quantity})`,
        amount: -purchaseForm.totalCost,
        category: 'Compra Insumos',
        isReconciled: false,
        paymentMethod: 'Transferencia'
     };

     if (supabase) {
        await supabase.from('inventory').update({ currentStock: prod.currentStock + purchaseForm.quantity }).eq('id', prod.id);
        await supabase.from('transactions').insert(newTx);
     }

     setInventory(updatedInventory);
     setTransactions([...transactions, newTx]);
     setIsPurchaseModalOpen(false);
     setPurchaseForm({ productId: '', quantity: 1, totalCost: 0 });
     alert("Compra registrada.");
  };

  // --- FINANCE ---
  const openEditTransaction = (tx?: Transaction) => {
    if (tx) {
      setEditingTransaction({ ...tx });
    } else {
      setEditingTransaction({
        id: `TRX-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        category: 'Otros',
        isReconciled: false,
        paymentMethod: 'Transferencia'
      });
    }
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    
    if (supabase) {
       const { error } = await supabase.from('transactions').upsert(editingTransaction);
       if (!error) {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
       } else {
          alert(error.message);
       }
    } else {
       if (transactions.find(t => t.id === editingTransaction.id)) {
         setTransactions(transactions.map(t => t.id === editingTransaction.id ? editingTransaction : t));
       } else {
         setTransactions([...transactions, editingTransaction]);
       }
       setIsTransactionModalOpen(false);
       setEditingTransaction(null);
    }
  };

  const generateMonthlyQuotas = async () => {
     const today = new Date();
     const monthStr = today.toLocaleString('default', { month: 'long', year: 'numeric' });
     if (!confirm(`¿Generar remesa de cuotas para ${monthStr}?`)) return;
     const activeMembers = members.filter(m => m.status === MemberStatus.ACTIVE);
     const newTransactions: Transaction[] = activeMembers.map(m => ({
        id: `TRX-FEE-${m.id}-${Date.now()}`,
        date: today.toISOString().split('T')[0],
        description: `Cuota ${monthStr} - ${m.fullName}`,
        amount: m.monthlyFee || SOC_FEE,
        category: 'Cuota',
        relatedMemberId: m.id,
        isReconciled: false,
        paymentMethod: 'Transferencia'
     }));

     if (supabase) await supabase.from('transactions').insert(newTransactions);
     setTransactions([...transactions, ...newTransactions]);
     alert(`Generadas ${newTransactions.length} cuotas.`);
  };
  
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName])).join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // --- RENDER SECTIONS ---

  const renderWelcomeHub = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-serif font-bold text-emerald-800">Bienvenida a Casa, {currentUser?.fullName.split(' ')[0]}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Tu espacio para compartir y gestionar la comunidad.</p>
        {useDemoMode && <div className="bg-yellow-100 text-yellow-800 inline-block px-4 py-1 rounded text-sm font-bold mt-2 border border-yellow-200">MODO DEMO (Sin Base de Datos)</div>}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div onClick={() => setWelcomeSection('hub')} className="bg-emerald-800 text-white rounded-xl p-6 shadow-lg cursor-pointer">
          <Heart className="w-10 h-10 mb-4 text-emerald-300"/>
          <h3 className="text-xl font-bold mb-2">Filosofía</h3>
          <p className="text-emerald-100 text-sm">{DOC_PHILOSOPHY.slice(0, 80)}...</p>
        </div>
        <div onClick={() => { setWelcomeSection('tutorial'); setTutorialStep(0); }} className="bg-white border-2 border-emerald-100 rounded-xl p-6 shadow-sm cursor-pointer">
          <Compass className="w-10 h-10 mb-4 text-emerald-600"/>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Guía App</h3>
          <p className="text-gray-500 text-sm">Aprende a usar la herramienta.</p>
        </div>
        <div onClick={() => setWelcomeSection('docs')} className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm cursor-pointer">
          <FileText className="w-10 h-10 mb-4 text-gray-600"/>
          <h3 className="text-xl font-bold mb-2 text-gray-800">Legal</h3>
          <p className="text-gray-500 text-sm">Estatutos y Compromiso.</p>
        </div>
      </div>
    </div>
  );

  const renderTutorial = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
       <button onClick={() => setWelcomeSection('hub')} className="mb-4 text-emerald-600 font-bold flex items-center gap-2"><ChevronLeft className="w-4 h-4"/> Volver</button>
       <h2 className="text-2xl font-bold font-serif text-gray-800">Guía de Uso Rápida</h2>
       <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="p-8 text-center">
             <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                <Feather className="w-8 h-8"/>
             </div>
             <h3 className="text-xl font-bold mb-4">{TUTORIAL_STEPS[tutorialStep].title}</h3>
             <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">{TUTORIAL_STEPS[tutorialStep].desc}</p>
             <div className="flex justify-center gap-2 mb-8">
                {TUTORIAL_STEPS.map((_, i) => (
                   <div key={i} className={`w-3 h-3 rounded-full transition-all ${i === tutorialStep ? 'bg-emerald-600 scale-125' : 'bg-gray-200'}`} />
                ))}
             </div>
             <div className="flex justify-between items-center max-w-md mx-auto">
                <button onClick={() => setTutorialStep(prev => Math.max(0, prev - 1))} disabled={tutorialStep === 0} className="px-4 py-2 text-gray-400 hover:text-gray-600 disabled:opacity-30">Anterior</button>
                {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                   <button onClick={() => setTutorialStep(prev => prev + 1)} className="px-6 py-2 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700">Siguiente</button>
                ) : (
                   <button onClick={() => setWelcomeSection('hub')} className="px-6 py-2 bg-emerald-800 text-white rounded-full font-bold hover:bg-emerald-900">¡Entendido!</button>
                )}
             </div>
          </div>
       </div>
    </div>
  );

  const renderDocsSection = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
       <button onClick={() => { viewingDoc ? setViewingDoc(null) : setWelcomeSection('hub') }} className="mb-4 text-emerald-600 font-bold flex items-center gap-2">
          <ChevronLeft className="w-4 h-4"/> {viewingDoc ? 'Volver a Documentos' : 'Volver al Inicio'}
       </button>
       
       {!viewingDoc ? (
          <div className="grid md:grid-cols-2 gap-6">
             <div onClick={() => setViewingDoc('statutes')} className="bg-white p-6 rounded-xl shadow-sm border hover:border-emerald-300 cursor-pointer transition group">
                <BookOpen className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 mb-4"/>
                <h3 className="font-bold text-lg mb-2">Estatutos de Régimen Interno</h3>
                <p className="text-sm text-gray-500">Normas de convivencia, horarios y uso de instalaciones.</p>
             </div>
             <div onClick={() => setViewingDoc('commitment')} className="bg-white p-6 rounded-xl shadow-sm border hover:border-emerald-300 cursor-pointer transition group">
                <ShieldAlert className="w-8 h-8 text-gray-400 group-hover:text-emerald-600 mb-4"/>
                <h3 className="font-bold text-lg mb-2">Compromiso de Pago</h3>
                <p className="text-sm text-gray-500">Obligaciones financieras, cuotas y política de impagos.</p>
             </div>
          </div>
       ) : (
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto border border-gray-100">
             <h2 className="text-2xl font-serif font-bold mb-6 text-center">{viewingDoc === 'statutes' ? 'Estatutos' : 'Compromiso de Pago'}</h2>
             <div className="prose prose-emerald max-w-none text-gray-600 whitespace-pre-wrap">
                {viewingDoc === 'statutes' ? DOC_STATUTES : DOC_COMMITMENT}
             </div>
             {currentUser && (!currentUser.documentsSigned?.statutes || !currentUser.documentsSigned.paymentCommitment) && (
                <div className="mt-8 pt-8 border-t flex justify-center">
                   <button onClick={async () => {
                      const updatedUser = { 
                         ...currentUser, 
                         documentsSigned: { 
                            statutes: true, 
                            paymentCommitment: true, 
                            date: new Date().toISOString().split('T')[0] 
                         } 
                      };
                      if (supabase) await supabase.from('members').upsert(updatedUser);
                      setMembers(members.map(m => m.id === currentUser.id ? updatedUser : m));
                      setCurrentUser(updatedUser);
                      alert("¡Documentos firmados correctamente!");
                      setViewingDoc(null);
                   }} className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-emerald-700 animate-pulse">
                      Firmar y Aceptar Todo
                   </button>
                </div>
             )}
          </div>
       )}
    </div>
  );

  const renderDashboard = () => {
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0);
    const totalExpense = transactions.filter(t => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);
    const balance = totalIncome - totalExpense;
    const lowStockItems = inventory.filter(p => p.isActive && p.currentStock <= p.minStock);

    // Chart Data Preparation
    const monthlyData: FinancialMonthData[] = [];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    months.forEach((m, idx) => {
        const monthNum = idx; // 0-11
        const income = transactions.filter(t => new Date(t.date).getMonth() === monthNum && t.amount > 0).reduce((a,b) => a+b.amount, 0);
        const expense = transactions.filter(t => new Date(t.date).getMonth() === monthNum && t.amount < 0).reduce((a,b) => a+Math.abs(b.amount), 0);
        monthlyData.push({ name: m, ingresos: income, gastos: expense, balance: income - expense });
    });

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-serif font-bold text-gray-800">Panel Principal</h1>
        {lowStockItems.length > 0 && (
           <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex justify-between items-center cursor-pointer" onClick={() => { setActiveTab('inventory'); setIsOrderListModalOpen(true); }}>
              <div className="flex items-center gap-3">
                 <AlertCircle className="w-6 h-6 text-red-600" />
                 <div><h3 className="font-bold text-red-800">Stock Bajo</h3><p className="text-sm text-red-700">{lowStockItems.length} productos necesitan reposición.</p></div>
              </div>
              <ChevronRight className="text-red-400"/>
           </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
             <h3 className="text-sm font-medium text-gray-500">Balance Tesorería</h3>
             <span className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {can('view_sensitive_data') ? `${balance.toFixed(2)} €` : '****'}
             </span>
          </Card>
          <Card>
             <h3 className="text-sm font-medium text-gray-500">Eventos este mes</h3>
             <div className="text-3xl font-bold text-gray-800 mt-2">{events.length}</div>
          </Card>
          <Card>
             <h3 className="text-sm font-medium text-gray-500">Socias Activas</h3>
             <div className="text-3xl font-bold text-gray-800 mt-2">{members.filter(m => m.status === MemberStatus.ACTIVE).length}</div>
          </Card>
        </div>

        {can('view_sensitive_data') && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold mb-4">Evolución Financiera (Anual)</h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12}/>
                      <YAxis fontSize={12}/>
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="ingresos" fill="#10B981" name="Ingresos" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="gastos" fill="#EF4444" name="Gastos" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderEvents = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 font-serif">Eventos</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
               <button onClick={() => setEventViewMode('list')} className={`p-2 rounded-md transition ${eventViewMode === 'list' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}><List className="w-4 h-4"/></button>
               <button onClick={() => setEventViewMode('calendar')} className={`p-2 rounded-md transition ${eventViewMode === 'calendar' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}><CalendarIcon className="w-4 h-4"/></button>
            </div>
          </div>
          {can('manage_events') && (
            <button onClick={() => {
                setEditingEvent({
                  id: `EVT-${Date.now()}`,
                  title: '',
                  date: new Date().toISOString().split('T')[0],
                  organizerId: currentUser!.id,
                  attendeeIds: [currentUser!.id],
                  attendees: 1,
                  guestCount: 0,
                  zoneId: locations[0]?.id || '',
                  status: 'Programada',
                  consumptions: [],
                  totalCost: 0,
                  paymentStatus: 'Pendiente',
                  paymentMethod: 'N/A'
                });
                setIsEventModalOpen(true);
            }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4" /> Nuevo Evento
            </button>
          )}
        </div>

        {eventViewMode === 'list' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map(evt => {
               const isSettled = evt.paymentStatus === 'Pagada';
               return (
                  <Card key={evt.id} className="relative hover:shadow-md transition">
                     <div className="flex justify-between items-start mb-4">
                        <Badge color={evt.status === 'Finalizada' ? 'gray' : evt.status === 'Cancelada' ? 'red' : 'green'}>{evt.status}</Badge>
                        {!isSettled && <button onClick={() => { setEditingEvent({ ...evt }); setIsEventModalOpen(true); }}><Edit2 className="w-4 h-4 text-gray-400"/></button>}
                     </div>
                     <h3 className="font-bold text-gray-900">{evt.title}</h3>
                     <p className="text-sm text-gray-500 mb-4">{evt.date} · {locations.find(l=>l.id===evt.zoneId)?.name}</p>
                     <div className="border-t pt-2 flex justify-between items-center">
                        <span className="font-bold">Total: {evt.totalCost.toFixed(2)}€</span>
                        <Badge color={isSettled ? 'green' : 'red'}>{evt.paymentStatus}</Badge>
                     </div>
                     {!isSettled && (
                        <button onClick={() => { setManagingConsumptionsFor({ ...evt }); setIsConsumptionModalOpen(true); }} className="w-full mt-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                           <ShoppingCart className="w-4 h-4"/> Gestionar Consumos
                        </button>
                     )}
                  </Card>
               );
            })}
          </div>
        )}
        {eventViewMode === 'calendar' && (
           <div className="bg-white p-6 rounded-xl shadow-sm text-center py-20 text-gray-500">
              Vista Calendario simplificada para demo (ver lista).
           </div>
        )}
    </div>
  );

  const renderInventory = () => (
     <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           <h2 className="text-2xl font-bold font-serif">Economato</h2>
           <div className="flex gap-2">
              <button onClick={initAudit} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Auditoría</button>
              <button onClick={() => setIsShrinkageModalOpen(true)} className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100">Reportar Merma</button>
              <button onClick={() => setIsPurchaseModalOpen(true)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100">Entrada Mercancía</button>
              <button onClick={() => setIsDirectPurchaseModalOpen(true)} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 flex items-center gap-2"><ShoppingBag className="w-4 h-4"/> Tienda</button>
              {can('manage_inventory') && (
                 <button onClick={() => { setEditingProduct({ id: `PROD-${Date.now()}`, name: '', category: 'Alimento', unit: 'Ud', currentStock: 0, minStock: 5, emergencyStock: 2, costPrice: 0, salePrice: 0, provider: '', isActive: true }); setIsProductModalOpen(true); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4"/> Nuevo Producto
                 </button>
              )}
           </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           {inventory.filter(p => p.isActive || showInactiveProducts).map(prod => {
              const statusColor = prod.currentStock <= prod.emergencyStock ? 'bg-red-500' : prod.currentStock <= prod.minStock ? 'bg-yellow-500' : 'bg-emerald-500';
              const percent = Math.min(100, (prod.currentStock / (prod.minStock * 2)) * 100);
              
              return (
                 <Card key={prod.id} className={!prod.isActive ? 'opacity-60 bg-gray-50' : ''}>
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{prod.category}</span>
                       <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{prod.name}</h3>
                    <div className="text-2xl font-bold text-gray-800 mb-2">{prod.currentStock} <span className="text-sm font-normal text-gray-500">{prod.unit}s</span></div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                       <div className={`h-1.5 rounded-full ${statusColor}`} style={{ width: `${percent}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 border-t pt-3">
                       <span>P.V.P: {prod.salePrice.toFixed(2)}€</span>
                       {can('manage_inventory') && <button onClick={() => { setEditingProduct(prod); setIsProductModalOpen(true); }} className="text-emerald-600 hover:underline">Editar</button>}
                    </div>
                 </Card>
              );
           })}
        </div>
     </div>
  );

  const renderFinance = () => (
     <div className="space-y-6">
        <div className="flex justify-between items-center">
           <h2 className="text-2xl font-bold font-serif">Tesorería</h2>
           <div className="flex gap-2">
              <button onClick={() => exportToCSV(transactions, 'transacciones')} className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"><Download className="w-4 h-4"/> CSV</button>
              {can('manage_finance') && (
                 <>
                    <button onClick={generateMonthlyQuotas} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"><RefreshCcw className="w-4 h-4"/> Generar Remesa</button>
                    <button onClick={() => openEditTransaction()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"><Plus className="w-4 h-4"/> Apunte Manual</button>
                 </>
              )}
           </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
           <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                 <tr>
                    <th className="p-4 text-left">Fecha</th>
                    <th className="p-4 text-left">Concepto</th>
                    <th className="p-4 text-left">Categoría</th>
                    <th className="p-4 text-right">Importe</th>
                    <th className="p-4 text-center">Estado</th>
                 </tr>
              </thead>
              <tbody className="divide-y">
                 {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => can('manage_finance') && openEditTransaction(tx)}>
                       <td className="p-4 text-gray-500">{tx.date}</td>
                       <td className="p-4 font-medium">{tx.description}</td>
                       <td className="p-4"><Badge>{tx.category}</Badge></td>
                       <td className={`p-4 text-right font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} €
                       </td>
                       <td className="p-4 text-center">
                          {tx.isReconciled ? <CheckCircle className="w-4 h-4 text-green-500 inline"/> : <div className="w-2 h-2 rounded-full bg-gray-300 inline-block"/>}
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
     </div>
  );

  const renderMembers = () => (
     <div className="space-y-6">
        <div className="flex justify-between items-center">
           <h2 className="text-2xl font-bold font-serif">Socias</h2>
           {can('manage_members') && (
              <button onClick={() => openEditMember()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"><Plus className="w-4 h-4"/> Alta Socia</button>
           )}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           {members.map(m => (
              <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer" onClick={() => openEditMember(m)}>
                 <img src={m.avatarUrl || `https://ui-avatars.com/api/?name=${m.fullName}&background=random`} className="w-12 h-12 rounded-full object-cover"/>
                 <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{m.fullName}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                       <Badge color={m.status === MemberStatus.ACTIVE ? 'green' : 'gray'}>{m.role}</Badge>
                       <span>{m.status}</span>
                    </div>
                 </div>
                 {can('manage_members') && <Edit2 className="w-4 h-4 text-gray-400"/>}
              </div>
           ))}
        </div>
     </div>
  );

  const renderCommunity = () => (
     <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
        <div className="flex justify-between items-center flex-shrink-0">
           <h2 className="text-2xl font-bold font-serif">Comunidad</h2>
           <div className="flex bg-gray-100 rounded-lg p-1">
              <button onClick={() => setCommunityTab('official')} className={`px-4 py-2 rounded-md text-sm font-bold transition ${communityTab === 'official' ? 'bg-white shadow text-emerald-800' : 'text-gray-500'}`}>Tablón Oficial</button>
              <button onClick={() => setCommunityTab('wall')} className={`px-4 py-2 rounded-md text-sm font-bold transition ${communityTab === 'wall' ? 'bg-white shadow text-emerald-800' : 'text-gray-500'}`}>Muro Social</button>
           </div>
        </div>

        {communityTab === 'official' && (
           <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="flex justify-between items-center mb-2">
                 <p className="text-sm text-gray-500">Comunicados oficiales de la Junta Directiva.</p>
                 {can('manage_settings') && <button onClick={() => setIsNewSystemMsgModalOpen(true)} className="text-emerald-600 text-sm font-bold hover:underline">+ Publicar Aviso</button>}
              </div>
              {systemMessages.map(msg => (
                 <div key={msg.id} className={`p-6 rounded-xl border-l-4 shadow-sm ${msg.priority === 'high' ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'}`}>
                    <div className="flex justify-between items-start mb-2">
                       <h3 className={`font-bold text-lg ${msg.priority === 'high' ? 'text-red-900' : 'text-blue-900'}`}>{msg.title}</h3>
                       <span className="text-xs text-gray-400">{msg.date}</span>
                    </div>
                    <p className={`whitespace-pre-wrap ${msg.priority === 'high' ? 'text-red-800' : 'text-blue-800'}`}>{msg.content}</p>
                    <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center text-xs opacity-70">
                       <span>Publicado por: {members.find(m => m.id === msg.authorId)?.fullName}</span>
                       <span>Leído por {msg.readBy?.length || 0} socias</span>
                    </div>
                 </div>
              ))}
           </div>
        )}

        {communityTab === 'wall' && (
           <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50">
                 {userMessages.filter(m => !m.recipientId).map(msg => {
                    const isMe = msg.senderId === currentUser?.id;
                    const author = members.find(m => m.id === msg.senderId);
                    return (
                       <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <img src={author?.avatarUrl || `https://ui-avatars.com/api/?name=${author?.fullName}`} className="w-8 h-8 rounded-full bg-gray-200 object-cover flex-shrink-0"/>
                          <div className={`max-w-[80%] p-3 rounded-xl text-sm ${isMe ? 'bg-emerald-100 text-emerald-900 rounded-tr-none' : 'bg-white text-gray-800 shadow-sm rounded-tl-none'}`}>
                             {!isMe && <div className="font-bold text-xs mb-1 text-emerald-700">{author?.fullName}</div>}
                             {msg.content}
                             <div className="text-[10px] text-right mt-1 opacity-50">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </div>
                       </div>
                    );
                 })}
              </div>
              <form onSubmit={handleSendUserMessage} className="p-4 bg-white border-t flex gap-2">
                 <input className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 focus:ring-2 focus:ring-emerald-500" placeholder="Escribe algo al grupo..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
                 <button type="submit" className="w-10 h-10 bg-emerald-600 rounded-full text-white flex items-center justify-center hover:bg-emerald-700 transition"><Send className="w-5 h-5"/></button>
              </form>
           </div>
        )}
     </div>
  );

  const renderSettings = () => (
     <div className="space-y-6">
        <h2 className="text-2xl font-bold font-serif">Configuración Global</h2>
        {useDemoMode && <div className="bg-yellow-100 p-4 rounded text-yellow-800 mb-4 border border-yellow-300 font-bold">⚠️ Estás usando el Modo Demo (Memoria Local). Los cambios no se guardarán permanentemente porque no hay conexión a Supabase.</div>}
        
        {/* DATA */}
        <Card>
           <h3 className="font-bold mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-gray-400"/> Gestión de Datos</h3>
           <div className="flex gap-4">
              <button onClick={handleResetData} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">Restaurar Datos de Fábrica</button>
              <button onClick={handleClearData} className="px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm">Borrar Base de Datos</button>
           </div>
        </Card>

        {/* LOCATIONS */}
        <Card>
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-gray-400"/> Ubicaciones (Zonas)</h3>
             <button onClick={() => { setEditingLocation({ id: `LOC-${Date.now()}`, name: '', capacity: 10 }); setIsLocationModalOpen(true); }} className="text-sm text-emerald-600 font-bold hover:underline">+ Añadir Zona</button>
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map(loc => (
                 <div key={loc.id} className="border p-3 rounded-lg flex justify-between items-center bg-gray-50">
                    <div>
                       <div className="font-bold text-sm">{loc.name}</div>
                       <div className="text-xs text-gray-500">Aforo: {loc.capacity} pax</div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => { setEditingLocation(loc); setIsLocationModalOpen(true); }} className="text-gray-400 hover:text-emerald-600"><Edit2 className="w-4 h-4"/></button>
                       <button onClick={() => handleDeleteLocation(loc.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                    </div>
                 </div>
              ))}
           </div>
        </Card>

        {/* ROLES */}
        <Card>
           <h3 className="font-bold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-gray-400"/> Roles y Permisos</h3>
           <div className="space-y-2">
              {roleDefinitions.map(role => (
                 <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition cursor-pointer" onClick={() => { setEditingRole(role); setIsRoleModalOpen(true); }}>
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${role.id === Role.PRESIDENT ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'}`}>
                          {role.name.substring(0,2)}
                       </div>
                       <span className="font-medium">{role.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400"/>
                 </div>
              ))}
           </div>
        </Card>
     </div>
  );

  if (!currentUser) return <LoginScreen onLogin={handleLogin} error={loginError} loading={loading} />;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-emerald-900 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col`}>
        <div className="p-6 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm"><Heart className="w-6 h-6 text-white" /></div>
            <span className="font-bold text-lg font-serif tracking-wide">Hirmandades</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/70"><X className="w-6 h-6"/></button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button onClick={() => setActiveTab('welcome')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'welcome' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <Compass className="w-5 h-5"/> Bienvenida
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <LayoutDashboard className="w-5 h-5"/> Panel
          </button>
          <button onClick={() => setActiveTab('events')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'events' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <CalendarIcon className="w-5 h-5"/> Eventos
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'inventory' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <Package className="w-5 h-5"/> Economato
          </button>
          <button onClick={() => setActiveTab('community')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'community' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <MessageCircle className="w-5 h-5"/> Comunidad
          </button>
          <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'finance' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <DollarSign className="w-5 h-5"/> Tesorería
          </button>
          <button onClick={() => setActiveTab('members')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'members' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
            <Users className="w-5 h-5"/> Socias
          </button>
          {can('manage_settings') && (
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}`}>
              <Settings className="w-5 h-5"/> Configuración
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-emerald-800">
           {!useDemoMode ? (
              <div className="flex items-center gap-2 mb-2 text-xs text-emerald-300 px-2">
                 <CloudLightning className="w-3 h-3 text-emerald-400 animate-pulse"/> En línea
              </div>
           ) : (
              <div className="flex items-center gap-2 mb-2 text-xs text-yellow-300 px-2">
                 <AlertCircle className="w-3 h-3"/> Modo Local (Sin Sync)
              </div>
           )}
           <div className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-emerald-800 p-2 rounded-lg transition" onClick={() => openEditMember(currentUser)}>
              <img src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.fullName}&background=random`} className="w-10 h-10 rounded-full bg-emerald-200 object-cover"/>
              <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-bold truncate">{currentUser.fullName}</p>
                 <p className="text-xs text-emerald-300 truncate">{currentUser.role}</p>
              </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-950 rounded-lg text-sm text-emerald-200 hover:text-white hover:bg-black/20 transition">
              <LogOut className="w-4 h-4"/> Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-100 h-16 flex items-center justify-between px-6 md:px-8 z-20">
           <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700"><Menu className="w-6 h-6"/></button>
           <h2 className="text-lg font-bold text-emerald-900 hidden md:block opacity-50 uppercase tracking-widest text-xs">Sistema de Gestión Integral</h2>
           <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-emerald-600 transition" onClick={() => { setActiveTab('community'); setCommunityTab('official'); }}>
                 <Bell className="w-5 h-5"/>
                 {systemMessages.some(m => !m.readBy?.includes(currentUser.id)) && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
           </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6 md:p-8 custom-scrollbar">
           {activeTab === 'welcome' && (welcomeSection === 'hub' ? renderWelcomeHub() : welcomeSection === 'tutorial' ? renderTutorial() : renderDocsSection())}
           {activeTab === 'dashboard' && renderDashboard()}
           {activeTab === 'events' && renderEvents()}
           {activeTab === 'inventory' && renderInventory()}
           {activeTab === 'finance' && renderFinance()}
           {activeTab === 'community' && renderCommunity()}
           {activeTab === 'members' && renderMembers()}
           {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* --- MODALS --- */}
      
      {/* 1. MEMBER EDIT MODAL */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title={editingMember?.id ? 'Editar Socia' : 'Nueva Socia'}>
        {editingMember && (
          <form onSubmit={handleSaveMember} className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center relative overflow-hidden group border-2 border-emerald-100">
                 <img src={editingMember.avatarUrl || `https://ui-avatars.com/api/?name=${editingMember.fullName}`} className="w-full h-full object-cover"/>
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <Camera className="text-white"/>
                 </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                 <label className="block text-xs font-bold text-gray-500 mb-1">Nombre Completo</label>
                 <input className="w-full p-2 border rounded" value={editingMember.fullName} onChange={e => setEditingMember({...editingMember, fullName: e.target.value})} required />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">DNI</label>
                 <input className="w-full p-2 border rounded" value={editingMember.dni} onChange={e => setEditingMember({...editingMember, dni: e.target.value})} />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Teléfono</label>
                 <input className="w-full p-2 border rounded" value={editingMember.phone} onChange={e => setEditingMember({...editingMember, phone: e.target.value})} />
              </div>
              <div className="col-span-2">
                 <label className="block text-xs font-bold text-gray-500 mb-1">Dirección Postal</label>
                 <input className="w-full p-2 border rounded" value={editingMember.address} onChange={e => setEditingMember({...editingMember, address: e.target.value})} />
              </div>
              <div className="col-span-2">
                 <label className="block text-xs font-bold text-gray-500 mb-1">IBAN</label>
                 <input className="w-full p-2 border rounded font-mono bg-gray-50" value={editingMember.iban} onChange={e => setEditingMember({...editingMember, iban: e.target.value})} placeholder="ESXX XXXX XXXX XXXX XXXX" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                 <input className="w-full p-2 border rounded" type="email" value={editingMember.email} onChange={e => setEditingMember({...editingMember, email: e.target.value})} required />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">PIN Acceso</label>
                 <input className="w-full p-2 border rounded font-mono text-center tracking-widest" maxLength={4} value={editingMember.pin} onChange={e => setEditingMember({...editingMember, pin: e.target.value})} />
              </div>
              
              {can('manage_members') && (
                 <>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Rol</label>
                       <select className="w-full p-2 border rounded" value={editingMember.role} onChange={e => setEditingMember({...editingMember, role: e.target.value as Role})}>
                          {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 mb-1">Estado</label>
                       <select className="w-full p-2 border rounded" value={editingMember.status} onChange={e => setEditingMember({...editingMember, status: e.target.value as MemberStatus})}>
                          <option value={MemberStatus.ACTIVE}>Activa</option>
                          <option value={MemberStatus.INACTIVE}>Inactiva</option>
                       </select>
                    </div>
                    <div className="col-span-2 p-3 bg-blue-50 rounded border border-blue-100">
                       <label className="block text-xs font-bold text-blue-800 mb-1">Cuota Mensual Personalizada (€)</label>
                       <div className="flex items-center gap-2">
                          <input type="number" className="w-24 p-2 border rounded text-right" value={editingMember.monthlyFee || ''} placeholder={SOC_FEE.toString()} onChange={e => setEditingMember({...editingMember, monthlyFee: parseFloat(e.target.value) || undefined})} />
                          <span className="text-xs text-blue-600">Dejar vacío para usar cuota estándar ({SOC_FEE}€)</span>
                       </div>
                    </div>
                 </>
              )}
              
              <div className="col-span-2">
                 <label className="block text-xs font-bold text-gray-500 mb-1">Alergias / Notas</label>
                 <textarea className="w-full p-2 border rounded" rows={2} value={editingMember.notes} onChange={e => setEditingMember({...editingMember, notes: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700">Guardar Cambios</button>
          </form>
        )}
      </Modal>

      {/* 2. EVENT EDIT MODAL */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title={editingEvent?.id ? 'Editar Evento' : 'Nuevo Evento'}>
        {editingEvent && (
          <form onSubmit={handleSaveEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Título del Evento</label>
              <input className="w-full p-2 border rounded" value={editingEvent.title} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} required placeholder="Ej: Cumpleaños Ana" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Fecha</label>
                <input type="date" className="w-full p-2 border rounded" value={editingEvent.date} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Zona</label>
                <select className="w-full p-2 border rounded" value={editingEvent.zoneId} onChange={e => setEditingEvent({...editingEvent, zoneId: e.target.value})}>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Asistentes Totales</label>
                  <input type="number" className="w-full p-2 border rounded" value={editingEvent.attendees} onChange={e => setEditingEvent({...editingEvent, attendees: parseInt(e.target.value)})} min="1" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nº Invitadas (No socias)</label>
                  <input type="number" className="w-full p-2 border rounded bg-yellow-50" value={editingEvent.guestCount} onChange={e => setEditingEvent({...editingEvent, guestCount: parseInt(e.target.value)})} min="0" />
                  <p className="text-[10px] text-yellow-700 mt-1">Suplemento: +{GUEST_FEE}€/persona</p>
               </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700">Guardar Evento</button>
          </form>
        )}
      </Modal>

      {/* 3. CONSUMPTIONS MODAL */}
      <Modal isOpen={isConsumptionModalOpen} onClose={() => setIsConsumptionModalOpen(false)} title="Gestionar Consumos y Pagos" maxWidth="max-w-4xl" colorHeader="bg-emerald-900">
         {managingConsumptionsFor && (
            <div className="flex flex-col md:flex-row gap-6 h-[600px]">
               {/* Left: Input */}
               <div className="flex-1 flex flex-col">
                  <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
                     <button onClick={() => setConsumptionTab('inventory')} className={`flex-1 py-2 rounded text-sm font-bold ${consumptionTab === 'inventory' ? 'bg-white shadow text-emerald-800' : 'text-gray-500'}`}>Productos</button>
                     <button onClick={() => setConsumptionTab('service')} className={`flex-1 py-2 rounded text-sm font-bold ${consumptionTab === 'service' ? 'bg-white shadow text-emerald-800' : 'text-gray-500'}`}>Servicios</button>
                     <button onClick={() => setConsumptionTab('custom')} className={`flex-1 py-2 rounded text-sm font-bold ${consumptionTab === 'custom' ? 'bg-white shadow text-emerald-800' : 'text-gray-500'}`}>Manual</button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                     {consumptionTab === 'inventory' && (
                        <>
                           <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                              {[1, 6, 12, 24].map(q => (
                                 <button key={q} onClick={() => setConsumptionQty(q)} className={`px-4 py-1 rounded-full text-sm font-bold transition ${consumptionQty === q ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>x{q}</button>
                              ))}
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              {inventory.filter(p => p.isActive).map(p => (
                                 <button key={p.id} onClick={() => handleAddInventoryConsumption(p, consumptionQty)} className="text-left p-3 border rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition group">
                                    <div className="font-bold text-gray-800 group-hover:text-emerald-800">{p.name}</div>
                                    <div className="text-xs text-gray-500 flex justify-between mt-1">
                                       <span>Stock: {p.currentStock}</span>
                                       <span className="font-bold">{p.salePrice.toFixed(2)}€</span>
                                    </div>
                                 </button>
                              ))}
                           </div>
                        </>
                     )}
                     {(consumptionTab === 'custom' || consumptionTab === 'service') && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Concepto</label>
                              <input className="w-full p-2 border rounded" placeholder={consumptionTab === 'service' ? "Ej: Limpieza Extra, Cocinera" : "Ej: Hielo gasolinera"} value={customConsumption.name} onChange={e => setCustomConsumption({...customConsumption, name: e.target.value})} />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Coste Total (€)</label>
                              <input type="number" className="w-full p-2 border rounded" placeholder="0.00" value={customConsumption.price} onChange={e => setCustomConsumption({...customConsumption, price: e.target.value})} />
                           </div>
                           <button onClick={handleAddCustomConsumption} className="w-full bg-emerald-600 text-white py-2 rounded font-bold">Añadir Concepto</button>
                        </div>
                     )}
                  </div>
               </div>

               {/* Right: Summary */}
               <div className="w-full md:w-80 bg-gray-50 border-l p-4 flex flex-col">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Clipboard className="w-4 h-4"/> Cuenta</h4>
                  <div className="flex-1 overflow-y-auto mb-4 space-y-2 text-sm">
                     {/* Guest Fee Line */}
                     {managingConsumptionsFor.guestCount > 0 && (
                        <div className="flex justify-between items-center bg-yellow-100 p-2 rounded text-yellow-800">
                           <span>Tasa Invitadas (x{managingConsumptionsFor.guestCount})</span>
                           <span className="font-bold">{(managingConsumptionsFor.guestCount * GUEST_FEE).toFixed(2)}€</span>
                        </div>
                     )}
                     {managingConsumptionsFor.consumptions.map(c => (
                        <div key={c.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm group">
                           <div>
                              <div className="font-medium">{c.name}</div>
                              <div className="text-xs text-gray-400">x{c.quantity} · {c.type === 'service' ? 'Servicio' : 'Producto'}</div>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="font-bold">{c.totalCost.toFixed(2)}€</span>
                              <button onClick={() => handleRemoveConsumption(c.id, c.type, c.productId, c.quantity)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="border-t pt-4 mt-auto">
                     <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-500">Total a Pagar</span>
                        <span className="text-3xl font-bold text-emerald-800">{managingConsumptionsFor.totalCost.toFixed(2)}€</span>
                     </div>
                     <div className="space-y-2">
                        <div className="flex gap-2">
                           <button onClick={() => setSettleMethod('Efectivo')} className={`flex-1 py-2 text-xs font-bold rounded border ${settleMethod === 'Efectivo' ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'bg-white'}`}>Efectivo</button>
                           <button onClick={() => setSettleMethod('Transferencia')} className={`flex-1 py-2 text-xs font-bold rounded border ${settleMethod === 'Transferencia' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-white'}`}>Transf.</button>
                        </div>
                        <button onClick={handleSettleEvent} className="w-full py-3 bg-emerald-800 text-white rounded-lg font-bold hover:bg-emerald-900 shadow-lg flex items-center justify-center gap-2">
                           <CheckCircle className="w-5 h-5"/> Cerrar y Saldar Evento
                        </button>
                        <button onClick={saveConsumptionsToEvent} className="w-full py-2 text-gray-500 text-sm hover:text-gray-800">Guardar sin Saldar</button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </Modal>
      
      {/* 4. PRODUCT MODAL */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Editar Producto">
        {editingProduct && (
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div><label className="label">Nombre</label><input className="input w-full border p-2 rounded" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
               <div><label className="label">Categoría</label><select className="input w-full border p-2 rounded" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})}><option>Bebida</option><option>Alimento</option><option>Limpieza</option><option>Otros</option></select></div>
               <div><label className="label">Unidad</label><input className="input w-full border p-2 rounded" value={editingProduct.unit} onChange={e => setEditingProduct({...editingProduct, unit: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
               <div><label className="label">Stock Actual</label><input type="number" className="input w-full border p-2 rounded font-bold" value={editingProduct.currentStock} onChange={e => setEditingProduct({...editingProduct, currentStock: parseFloat(e.target.value)})} /></div>
               <div><label className="label text-yellow-700">Stock Mínimo</label><input type="number" className="input w-full border p-2 rounded" value={editingProduct.minStock} onChange={e => setEditingProduct({...editingProduct, minStock: parseFloat(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div><label className="label">Coste Compra</label><input type="number" step="0.01" className="input w-full border p-2 rounded" value={editingProduct.costPrice} onChange={e => setEditingProduct({...editingProduct, costPrice: parseFloat(e.target.value)})} /></div>
               <div><label className="label text-emerald-700">P.V.P Venta</label><input type="number" step="0.01" className="input w-full border p-2 rounded" value={editingProduct.salePrice} onChange={e => setEditingProduct({...editingProduct, salePrice: parseFloat(e.target.value)})} /></div>
            </div>
            <div className="flex items-center gap-2">
               <input type="checkbox" checked={editingProduct.isActive} onChange={e => setEditingProduct({...editingProduct, isActive: e.target.checked})} />
               <label>Producto Activo (Visible en listas)</label>
            </div>
            <button type="submit" className="btn-primary w-full bg-emerald-600 text-white p-3 rounded font-bold">Guardar Producto</button>
          </form>
        )}
      </Modal>

      {/* 5. TRANSACTION MODAL */}
      <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title="Apunte Contable">
        {editingTransaction && (
          <form onSubmit={handleSaveTransaction} className="space-y-4">
             <input type="date" className="w-full border p-2 rounded" value={editingTransaction.date} onChange={e => setEditingTransaction({...editingTransaction, date: e.target.value})} />
             <input className="w-full border p-2 rounded" placeholder="Descripción" value={editingTransaction.description} onChange={e => setEditingTransaction({...editingTransaction, description: e.target.value})} />
             <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" className="w-full border p-2 rounded" placeholder="Importe (+/-)" value={editingTransaction.amount} onChange={e => setEditingTransaction({...editingTransaction, amount: parseFloat(e.target.value)})} />
                <select className="w-full border p-2 rounded" value={editingTransaction.category} onChange={e => setEditingTransaction({...editingTransaction, category: e.target.value as TransactionCategory})}>
                   <option value="Otros">Otros</option><option value="Cuota">Cuota</option><option value="Compra Insumos">Compra</option><option value="Suministros (Luz/Agua)">Suministros</option><option value="Mantenimiento">Mantenimiento</option>
                </select>
             </div>
             <div className="flex items-center gap-2 mt-4 bg-gray-100 p-3 rounded">
                <input type="checkbox" checked={editingTransaction.isReconciled} onChange={e => setEditingTransaction({...editingTransaction, isReconciled: e.target.checked})} className="w-5 h-5 text-emerald-600"/>
                <label className="font-bold text-gray-700">Conciliada en Banco</label>
             </div>
             <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded font-bold">Guardar Apunte</button>
          </form>
        )}
      </Modal>

      {/* 6. EMERGENCY MODAL */}
      <Modal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} title="🚨 ALERTA DE STOCK CRÍTICO" colorHeader="bg-red-600">
         <div className="space-y-4">
            <p className="text-red-800 font-bold">Los siguientes productos están agotados o en reserva. ¡Hay que reponer ya!</p>
            <ul className="space-y-2">
               {emergencyItems.map(p => (
                  <li key={p.id} className="flex justify-between border-b pb-2">
                     <span>{p.name}</span>
                     <span className="font-bold text-red-600">{p.currentStock} ud.</span>
                  </li>
               ))}
            </ul>
            <button onClick={() => setShowEmergencyModal(false)} className="w-full bg-red-100 text-red-800 py-3 rounded font-bold hover:bg-red-200">Entendido, avisaré a compras</button>
         </div>
      </Modal>

      {/* 7. SYSTEM MESSAGES ALERT */}
      <Modal isOpen={showMessagesModal} onClose={markMessagesRead} title="Tablón de Anuncios Oficial" colorHeader="bg-blue-600">
         <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {systemMessages.filter(m => !m.readBy?.includes(currentUser.id)).map(msg => (
               <div key={msg.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded shadow-sm">
                  <h3 className="font-bold text-blue-900 text-lg">{msg.title}</h3>
                  <p className="text-blue-800 mt-2 whitespace-pre-line">{msg.content}</p>
                  <div className="text-xs text-blue-400 mt-2">{msg.date}</div>
               </div>
            ))}
            <button onClick={markMessagesRead} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">Marcar como Leídos</button>
         </div>
      </Modal>
      
      {/* 8. PURCHASE ENTRY MODAL */}
      <Modal isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)} title="Entrada de Mercancía (Compra)">
         <form onSubmit={handleRegisterPurchase} className="space-y-4">
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Producto</label>
               <select className="w-full border p-2 rounded" value={purchaseForm.productId} onChange={e => setPurchaseForm({...purchaseForm, productId: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {inventory.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Cantidad Recibida</label>
                  <input type="number" className="w-full border p-2 rounded" value={purchaseForm.quantity} onChange={e => setPurchaseForm({...purchaseForm, quantity: parseFloat(e.target.value)})} />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Coste Total Factura (€)</label>
                  <input type="number" step="0.01" className="w-full border p-2 rounded" value={purchaseForm.totalCost} onChange={e => setPurchaseForm({...purchaseForm, totalCost: parseFloat(e.target.value)})} />
               </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-bold">Registrar Entrada y Gasto</button>
         </form>
      </Modal>

      {/* 9. DIRECT SHOPPING MODAL */}
      <Modal isOpen={isDirectPurchaseModalOpen} onClose={cancelDirectPurchase} title="Tienda / Compra Directa" maxWidth="max-w-4xl">
         <div className="flex flex-col md:flex-row gap-6 h-[500px]">
            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-3 custom-scrollbar">
               {inventory.filter(p => p.isActive && p.currentStock > 0).map(p => (
                  <button key={p.id} onClick={() => addToCart(p, 1)} className="text-left p-3 border rounded-lg hover:bg-purple-50 transition">
                     <div className="font-bold">{p.name}</div>
                     <div className="text-xs text-gray-500">{p.salePrice.toFixed(2)}€</div>
                  </button>
               ))}
            </div>
            <div className="w-80 bg-gray-50 border-l p-4 flex flex-col">
               <h4 className="font-bold mb-4">Carrito</h4>
               <div className="flex-1 space-y-2 overflow-y-auto">
                  {shoppingCart.map(item => (
                     <div key={item.id} className="flex justify-between bg-white p-2 rounded shadow-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="font-bold">{item.totalCost.toFixed(2)}€</span>
                     </div>
                  ))}
               </div>
               <div className="mt-4 border-t pt-4">
                  <div className="text-2xl font-bold text-right mb-4">{shoppingCart.reduce((a,b) => a+b.totalCost, 0).toFixed(2)}€</div>
                  <button onClick={settleDirectPurchase} className="w-full bg-purple-600 text-white py-3 rounded font-bold">Pagar y Llevar</button>
               </div>
            </div>
         </div>
      </Modal>

      {/* 10. NEW SYSTEM ALERT CREATION MODAL */}
      <Modal isOpen={isNewSystemMsgModalOpen} onClose={() => setIsNewSystemMsgModalOpen(false)} title="Crear Alerta General">
         <form onSubmit={handleCreateSystemMessage} className="space-y-4">
            <input className="w-full border p-2 rounded" placeholder="Título del Aviso" value={newSystemMsg.title} onChange={e => setNewSystemMsg({...newSystemMsg, title: e.target.value})} required />
            <textarea className="w-full border p-2 rounded" rows={4} placeholder="Contenido del mensaje..." value={newSystemMsg.content} onChange={e => setNewSystemMsg({...newSystemMsg, content: e.target.value})} required />
            <div className="flex items-center gap-2">
               <input type="checkbox" checked={newSystemMsg.priority === 'high'} onChange={e => setNewSystemMsg({...newSystemMsg, priority: e.target.checked ? 'high' : 'normal'})} />
               <label>Marcar como Prioridad Alta (Saltará alerta)</label>
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded font-bold">Publicar Aviso</button>
         </form>
      </Modal>

      {/* 11. SHRINKAGE MODAL */}
      <Modal isOpen={isShrinkageModalOpen} onClose={() => setIsShrinkageModalOpen(false)} title="Reportar Merma/Rotura">
         <form onSubmit={handleReportShrinkage} className="space-y-4">
            <select className="w-full border p-2 rounded" value={shrinkageForm.productId} onChange={e => setShrinkageForm({...shrinkageForm, productId: e.target.value})}>
               <option value="">Seleccionar Producto...</option>
               {inventory.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>)}
            </select>
            <input type="number" className="w-full border p-2 rounded" min="1" value={shrinkageForm.quantity} onChange={e => setShrinkageForm({...shrinkageForm, quantity: parseInt(e.target.value)})} />
            <select className="w-full border p-2 rounded" value={shrinkageForm.reason} onChange={e => setShrinkageForm({...shrinkageForm, reason: e.target.value})}>
               <option>Caducidad</option><option>Rotura</option><option>Defecto</option><option>Robo/Desaparición</option>
            </select>
            <button type="submit" className="w-full bg-red-600 text-white p-3 rounded font-bold">Registrar Pérdida</button>
         </form>
      </Modal>
      
      {/* 12. AUDIT MODAL */}
      <Modal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} title="Auditoría de Inventario" maxWidth="max-w-4xl">
         <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm mb-6">
               <thead className="bg-gray-100 text-left">
                  <tr><th>Producto</th><th>Teórico</th><th>REAL (Contado)</th><th>Diferencia</th></tr>
               </thead>
               <tbody>
                  {inventory.filter(p => p.isActive).map(p => {
                     const real = auditData[p.id] ?? p.currentStock;
                     const diff = real - p.currentStock;
                     return (
                        <tr key={p.id} className="border-b">
                           <td className="p-2">{p.name}</td>
                           <td className="p-2 text-gray-500">{p.currentStock}</td>
                           <td className="p-2"><input type="number" className={`w-20 border rounded p-1 text-center font-bold ${diff !== 0 ? 'bg-yellow-50 border-yellow-300' : ''}`} value={real} onChange={e => setAuditData({...auditData, [p.id]: parseInt(e.target.value) || 0})} /></td>
                           <td className={`p-2 font-bold ${diff < 0 ? 'text-red-600' : diff > 0 ? 'text-green-600' : 'text-gray-300'}`}>{diff > 0 ? '+' : ''}{diff}</td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
            <button onClick={handleFinishAudit} className="w-full bg-emerald-800 text-white py-3 rounded font-bold">Finalizar Auditoría y Ajustar Stock</button>
         </div>
      </Modal>

      {/* 13. LOCATION MODAL */}
      <Modal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} title={editingLocation?.id ? 'Editar Ubicación' : 'Nueva Ubicación'}>
        {editingLocation && (
           <form onSubmit={handleSaveLocation} className="space-y-4">
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Nombre de la Zona</label>
                 <input className="w-full border p-2 rounded" value={editingLocation.name} onChange={e => setEditingLocation({...editingLocation, name: e.target.value})} placeholder="Ej: Terraza" required/>
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Aforo Máximo (Personas)</label>
                 <input type="number" className="w-full border p-2 rounded" value={editingLocation.capacity} onChange={e => setEditingLocation({...editingLocation, capacity: parseInt(e.target.value)})} min="1" required/>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded font-bold">Guardar Zona</button>
           </form>
        )}
      </Modal>

      {/* 14. ROLE MODAL */}
      <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Editar Permisos de Rol">
        {editingRole && (
           <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded mb-4">
                 <span className="font-bold text-lg">{editingRole.name}</span>
                 <p className="text-xs text-gray-500">Editando permisos para este perfil de usuaria.</p>
              </div>
              <div className="space-y-2">
                 {[
                    { key: 'manage_events', label: 'Crear/Editar Eventos' },
                    { key: 'manage_members', label: 'Gestión de Socias (Alta/Baja)' },
                    { key: 'manage_inventory', label: 'Gestión de Economato (Productos)' },
                    { key: 'manage_finance', label: 'Tesorería y Gastos' },
                    { key: 'manage_settings', label: 'Configuración Global' },
                    { key: 'view_sensitive_data', label: 'Ver Datos Sensibles (IBAN, Saldos)' },
                 ].map(perm => (
                    <div key={perm.key} className="flex items-center justify-between border-b pb-2">
                       <span className="text-sm">{perm.label}</span>
                       <button type="button" onClick={() => setEditingRole({
                          ...editingRole,
                          permissions: { 
                             ...editingRole.permissions, 
                             [perm.key]: !editingRole.permissions[perm.key as keyof RolePermissions] 
                          }
                       })} className={`w-12 h-6 rounded-full p-1 transition-colors ${editingRole.permissions[perm.key as keyof RolePermissions] ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${editingRole.permissions[perm.key as keyof RolePermissions] ? 'translate-x-6' : ''}`}/>
                       </button>
                    </div>
                 ))}
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded font-bold mt-4">Guardar Permisos</button>
           </form>
        )}
      </Modal>

    </div>
  );
}