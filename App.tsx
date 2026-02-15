
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
import { collection, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { LayoutGrid, Truck as TruckIcon, ClipboardList, MapPin, Users, LogOut, Settings, CloudRain, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [isOnline, setIsOnline] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // 1. Auth and Initial Profile Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = { id: fbUser.uid, ...userDoc.data() } as User;
            setCurrentUser(userData);
            
            // Apply preferences from Firestore
            const prefTheme = userData.themePreference || 'light';
            const prefLang = userData.languagePreference || 'en';
            
            setIsDarkMode(prefTheme === 'dark');
            setLanguage(prefLang);
            document.documentElement.classList.toggle('dark', prefTheme === 'dark');
            
            // Auto-switch to Jobs for Drivers
            if (userData.role === 'Driver') {
              setActiveTab('orders');
            }
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Profile sync error:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsInitialLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Data Listeners (Unified Pool)
  useEffect(() => {
    if (!currentUser) return;

    const unsubBranches = onSnapshot(collection(db, 'branches'), (snap) => {
      setBranches(snap.docs.map(d => ({ id: d.id, ...d.data() } as Branch)));
    });

    const unsubTrucks = onSnapshot(collection(db, 'trucks'), (snap) => {
      setTrucks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Truck)));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
    });

    // Listen to all orders for unified management
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setIsOnline(true);
    }, (err) => {
      console.error("Firestore sync error:", err);
      setIsOnline(false);
    });

    return () => {
      unsubBranches();
      unsubTrucks();
      unsubUsers();
      unsubOrders();
    };
  }, [currentUser]);

  if (isInitialLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Vora Cloud...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  const toggleTheme = async () => {
    const nextTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
    await updateDoc(doc(db, 'users', currentUser.id), { themePreference: nextTheme });
  };

  const toggleLanguage = async () => {
    const nextLang = language === 'en' ? 'mr' : 'en';
    setLanguage(nextLang);
    await updateDoc(doc(db, 'users', currentUser.id), { languagePreference: nextLang });
  };

  const handleLogout = () => {
    signOut(auth);
    setCurrentUser(null);
  };

  const menuItems = [
    ...(currentUser.role !== 'Driver' ? [{ id: 'dashboard', label: language === 'en' ? 'Dashboard' : 'मुख्य पृष्ठ', icon: LayoutGrid }] : []),
    ...(currentUser.role !== 'Driver' ? [{ id: 'trucks', label: language === 'en' ? 'Fleet & Manifest' : 'Fleet आणि Manifest', icon: TruckIcon }] : []),
    { id: 'orders', label: currentUser.role === 'Driver' ? (language === 'en' ? 'My Jobs' : 'माझे काम') : (language === 'en' ? 'Bookings' : 'बुकिंग्स'), icon: ClipboardList },
    ...(currentUser.role === 'Admin' ? [
      { id: 'branches', label: language === 'en' ? 'Branches' : 'शाखा', icon: MapPin },
      { id: 'users', label: language === 'en' ? 'Users' : 'वापरकर्ते', icon: Users },
      { id: 'system', label: language === 'en' ? 'System' : 'सिस्टम', icon: Settings },
    ] : []),
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <Sidebar 
        items={menuItems} 
        activeItem={activeTab} 
        onSelect={(id) => setActiveTab(id)} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        language={language} 
        toggleLanguage={toggleLanguage} 
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
        {activeTab === 'trucks' && <TruckManagement trucks={trucks} orders={orders} onAddTruck={(t) => addDoc(collection(db, 'trucks'), { ...t, availableWeight: t.weightCapacity })} />}
        {activeTab === 'orders' && (
          <OrderManagement 
            language={language} 
            currentUser={currentUser} 
            orders={orders} 
            trucks={trucks} 
            branches={branches} 
            onAddOrder={(o) => addDoc(collection(db, 'orders'), o)} 
            onUpdateStatus={(id, status) => updateDoc(doc(db, 'orders', id), { status })} 
            onDeleteOrder={(id) => deleteDoc(doc(db, 'orders', id))} 
            hideControls={currentUser.role === 'Driver'} 
          />
        )}
        {activeTab === 'branches' && <BranchManagement branches={branches} onAddBranch={(b) => addDoc(collection(db, 'branches'), b)} />}
        {activeTab === 'users' && <UserManagement users={users} onAddUser={(u) => addDoc(collection(db, 'users'), u)} onDeleteUser={(id) => deleteDoc(doc(db, 'users', id))} />}
        {activeTab === 'system' && <SystemSettings data={{ users, branches, trucks, orders }} />}
      </main>
    </div>
  );
};

export default App;
