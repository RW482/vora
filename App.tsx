
import React, { useState, useEffect } from 'react';
import { Truck, Order, Branch, User, Language } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TruckManagement from './components/TruckManagement';
import OrderManagement from './components/OrderManagement';
import BranchManagement from './components/BranchManagement';
import UserManagement from './components/UserManagement';
import SystemSettings from './components/SystemSettings';
import Login from './components/Login';
import { db, auth } from './firebase';
import { collection, onSnapshot, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { LayoutGrid, Truck as TruckIcon, ClipboardList, MapPin, Users, LogOut, Settings, CloudRain } from 'lucide-react';

const THEME_KEY = 'VORA_THEME';
const LANG_KEY = 'VORA_LANG';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>((localStorage.getItem(LANG_KEY) as Language) || 'en');
  const [isOnline, setIsOnline] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // 1. Theme and Auth Init
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldShowDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldShowDark);
    if (shouldShowDark) document.documentElement.classList.add('dark');

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          const userData = { id: fbUser.uid, ...userDoc.data() } as User;
          setCurrentUser(userData);
          setActiveTab(userData.role === 'Driver' ? 'orders' : 'dashboard');
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Listeners (Firestore)
  useEffect(() => {
    if (!currentUser) return;

    // Branches & Users (Admin only usually, but let's keep all for now)
    const unsubBranches = onSnapshot(collection(db, 'branches'), (snap) => {
      setBranches(snap.docs.map(d => ({ id: d.id, ...d.data() } as Branch)));
    });

    const unsubTrucks = onSnapshot(collection(db, 'trucks'), (snap) => {
      setTrucks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Truck)));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
    });

    // Orders - If Driver, only their assigned truck. Else, everything.
    let ordersQuery = collection(db, 'orders');
    if (currentUser.role === 'Driver' && currentUser.linkedVehicleNo) {
       // Note: In production, ensure linkedVehicleNo is stored in Uppercase for consistent queries
       ordersQuery = query(collection(db, 'orders'), where('vehicleAssignedNo', '==', currentUser.linkedVehicleNo.toUpperCase()));
    }

    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    }, (err) => {
      console.error("Firestore Listen Error:", err);
      setIsOnline(false);
    });

    return () => {
      unsubBranches();
      unsubTrucks();
      unsubUsers();
      unsubOrders();
    };
  }, [currentUser]);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  };

  const handleLogout = () => {
    signOut(auth);
    setCurrentUser(null);
  };

  // Firestore Mutators
  const addOrder = async (o: Omit<Order, 'id'>) => {
    await addDoc(collection(db, 'orders'), o);
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    await updateDoc(doc(db, 'orders', id), { status });
  };

  const deleteOrder = async (id: string) => {
    await deleteDoc(doc(db, 'orders', id));
  };

  const addTruck = async (t: Omit<Truck, 'id' | 'availableWeight'>) => {
    await addDoc(collection(db, 'trucks'), { ...t, availableWeight: t.weightCapacity });
  };

  if (!currentUser) {
    return <Login />;
  }

  const menuItems = [
    ...(currentUser.role !== 'Driver' ? [{ id: 'dashboard', label: language === 'en' ? 'Dashboard' : 'मुख्य पृष्ठ', icon: LayoutGrid }] : []),
    ...(currentUser.role !== 'Driver' ? [{ id: 'trucks', label: language === 'en' ? 'Fleet & Manifest' : ' fleet आणि manifest', icon: TruckIcon }] : []),
    { id: 'orders', label: currentUser.role === 'Driver' ? (language === 'en' ? 'My Jobs' : 'माझे काम') : (language === 'en' ? 'Bookings' : 'बुकिंग्स'), icon: ClipboardList },
    ...(currentUser.role === 'Admin' ? [{ id: 'branches', label: language === 'en' ? 'Branches' : 'शाखा', icon: MapPin }] : []),
    ...(currentUser.role === 'Admin' ? [{ id: 'users', label: language === 'en' ? 'Users' : 'वापरकर्ते', icon: Users }] : []),
    ...(currentUser.role === 'Admin' ? [{ id: 'system', label: language === 'en' ? 'System' : 'सिस्टम', icon: Settings }] : []),
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <Sidebar 
        items={menuItems} 
        activeItem={activeTab} 
        onSelect={(id: any) => setActiveTab(id)} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        language={language} 
        toggleLanguage={() => setLanguage(l => l === 'en' ? 'mr' : 'en')} 
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
               <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100">{menuItems.find(i => i.id === activeTab)?.label}</h1>
               <div className="flex items-center gap-2 mt-1">
                 <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`} />
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{currentUser.fullName} • {currentUser.role}</p>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl flex items-center gap-2">
              <CloudRain size={20} />
              <span className="text-[10px] font-black uppercase hidden lg:block">Cloud Sync: Active</span>
            </div>
            <button onClick={handleLogout} className="p-4 bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard trucks={trucks} orders={orders} isDarkMode={isDarkMode} />}
        {activeTab === 'trucks' && <TruckManagement trucks={trucks} orders={orders} onAddTruck={addTruck} />}
        {activeTab === 'orders' && (
          <OrderManagement language={language} currentUser={currentUser} orders={orders} trucks={trucks} branches={branches} 
            onAddOrder={addOrder} 
            onUpdateStatus={updateOrderStatus} 
            onDeleteOrder={deleteOrder} 
            hideControls={currentUser.role === 'Driver'} 
          />
        )}
        {activeTab === 'branches' && <BranchManagement branches={branches} onAddBranch={(b) => addDoc(collection(db, 'branches'), b)} />}
        {activeTab === 'users' && <UserManagement users={users} onAddUser={(u) => addDoc(collection(db, 'users'), u)} onDeleteUser={(id) => deleteDoc(doc(db, 'users', id))} />}
        {activeTab === 'system' && <SystemSettings data={{ users, branches, trucks, orders }} onRestore={() => alert('Feature disabled for Firebase mode')} syncCode="FIREBASE-CLOUD" onSetSyncCode={() => {}} />}
      </main>
    </div>
  );
};

export default App;
