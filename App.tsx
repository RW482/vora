
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Truck, Order, Branch, User, Language } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TruckManagement from './components/TruckManagement';
import OrderManagement from './components/OrderManagement';
import BranchManagement from './components/BranchManagement';
import UserManagement from './components/UserManagement';
import SystemSettings from './components/SystemSettings';
import Login from './components/Login';
import { LayoutGrid, Truck as TruckIcon, ClipboardList, MapPin, Users, LogOut, Settings, CloudRain, Wifi, WifiOff } from 'lucide-react';

const STORAGE_KEY = 'VORA_LOGISTICS_DATA_v3';
const THEME_KEY = 'VORA_THEME';
const SYNC_KEY_STORAGE = 'VORA_SYNC_CODE';
const LAST_SYNC_TIME = 'VORA_LAST_SYNC';
const LANG_KEY = 'VORA_LANG';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>((localStorage.getItem(LANG_KEY) as Language) || 'en');
  const [syncCode, setSyncCode] = useState<string>(localStorage.getItem(SYNC_KEY_STORAGE) || '');
  const [lastSync, setLastSync] = useState<string>(localStorage.getItem(LAST_SYNC_TIME) || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const isInitialMount = useRef(true);
  // Fix: Use ReturnType<typeof setTimeout> to avoid NodeJS namespace issues in browser environment
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize Data
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldShowDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldShowDark);
    if (shouldShowDark) document.documentElement.classList.add('dark');

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUsers(parsed.users || []);
        setBranches(parsed.branches || []);
        setTrucks(parsed.trucks || []);
        setOrders(parsed.orders || []);
      } catch (e) { console.error(e); }
    } else {
      setUsers([{ id: 'u1', username: 'admin', password: '123', role: 'Admin', fullName: 'System Admin' }]);
      setBranches([{ id: 'B1', name: 'Mumbai Main', location: 'Mumbai' }, { id: 'B2', name: 'Kolhapur Hub', location: 'Kolhapur' }]);
    }
    setIsDataLoaded(true);
  }, []);

  // Cloud Sync Core Logic
  const handleCloudSync = useCallback(async (code: string, mode: 'PUSH' | 'PULL', silent = false) => {
    if (!code) return;
    if (!silent) setIsSyncing(true);
    
    try {
      const binId = code.replace('VOR-', '');
      const url = `https://api.npoint.io/${binId}`;
      
      if (mode === 'PUSH') {
        const payload = { users, branches, trucks, orders, lastUpdated: Date.now() };
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const response = await fetch(url);
        const data = await response.json();
        const finalData = data.contents ? data.contents : data;
        
        if (finalData && finalData.users) {
          // Compare with local to avoid unnecessary re-renders
          const localStr = JSON.stringify({ users, branches, trucks, orders });
          const remoteStr = JSON.stringify({ users: finalData.users, branches: finalData.branches, trucks: finalData.trucks, orders: finalData.orders });
          
          if (localStr !== remoteStr) {
            setUsers(finalData.users);
            setBranches(finalData.branches || []);
            setTrucks(finalData.trucks || []);
            setOrders(finalData.orders || []);
          }
        }
      }
      
      const now = new Date().toLocaleTimeString();
      setLastSync(now);
      localStorage.setItem(LAST_SYNC_TIME, now);
      setIsOnline(true);
    } catch (err) {
      console.error("Sync Error:", err);
      setIsOnline(false);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  }, [users, branches, trucks, orders]);

  // Background Auto-Polling (PULL every 15 seconds)
  useEffect(() => {
    if (syncCode && currentUser) {
      const interval = setInterval(() => {
        handleCloudSync(syncCode, 'PULL', true);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [syncCode, currentUser, handleCloudSync]);

  // Auto-PUSH on any change
  useEffect(() => {
    if (!isInitialMount.current && isDataLoaded && syncCode) {
      // Debounce push to prevent API spamming
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        handleCloudSync(syncCode, 'PUSH', true);
      }, 2000);

      localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, branches, trucks, orders }));
    }
    isInitialMount.current = false;
  }, [users, branches, trucks, orders, isDataLoaded, syncCode, handleCloudSync]);

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'mr' : 'en';
    setLanguage(nextLang);
    localStorage.setItem(LANG_KEY, nextLang);
  };

  const handleLogin = (un: string, pw: string) => {
    const user = users.find(u => u.username.toLowerCase() === un.toLowerCase() && u.password === pw);
    if (user) {
      setCurrentUser(user);
      setActiveTab(user.role === 'Driver' ? 'orders' : 'dashboard');
      if (syncCode) handleCloudSync(syncCode, 'PULL');
    } else {
      setAuthError('Login Failed.');
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} error={authError} onSync={(code) => handleCloudSync(code, 'PULL')} isSyncing={isSyncing} />;
  }

  const menuItems = [
    ...(currentUser.role !== 'Driver' ? [{ id: 'dashboard', label: language === 'en' ? 'Dashboard' : 'मुख्य पृष्ठ', icon: LayoutGrid }] : []),
    ...(currentUser.role !== 'Driver' ? [{ id: 'trucks', label: language === 'en' ? 'Daily Trucks' : 'दैनंदिन गाड्या', icon: TruckIcon }] : []),
    { id: 'orders', label: currentUser.role === 'Driver' ? (language === 'en' ? 'My Jobs' : 'माझे काम') : (language === 'en' ? 'Orders' : 'ऑर्डर्स'), icon: ClipboardList },
    ...(currentUser.role === 'Admin' ? [{ id: 'branches', label: language === 'en' ? 'Branches' : 'शाखा', icon: MapPin }] : []),
    ...(currentUser.role === 'Admin' ? [{ id: 'users', label: language === 'en' ? 'Users' : 'वापरकर्ते', icon: Users }] : []),
    ...(currentUser.role === 'Admin' ? [{ id: 'system', label: language === 'en' ? 'System' : 'सिस्टम', icon: Settings }] : []),
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <Sidebar items={menuItems} activeItem={activeTab} onSelect={(id: any) => setActiveTab(id)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} language={language} toggleLanguage={toggleLanguage} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">{menuItems.find(i => i.id === activeTab)?.label}</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{currentUser.fullName} • {currentUser.role}</p>
            </div>
            {syncCode && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                {isOnline ? 'Live Office Connect' : 'Sync Offline'}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[10px] text-slate-400 font-bold uppercase hidden lg:block mr-2">Last Sync: {lastSync || 'Never'}</div>
            {currentUser.role === 'Admin' && (
              <button onClick={() => handleCloudSync(syncCode, 'PUSH')} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                <CloudRain size={14} className={isSyncing ? 'animate-bounce' : ''} />
                {isSyncing ? 'Pushing...' : (language === 'en' ? 'Sync Cloud Now' : 'क्लाउड अपडेट करा')}
              </button>
            )}
            <button onClick={() => setCurrentUser(null)} className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"><LogOut size={20} /></button>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard trucks={trucks} orders={orders} isDarkMode={isDarkMode} />}
        {activeTab === 'trucks' && <TruckManagement trucks={trucks} onAddTruck={(t) => setTrucks(prev => [...prev, {...t, id: `T${Date.now()}`, availableWeight: t.weightCapacity}])} />}
        {activeTab === 'orders' && (
          <OrderManagement language={language} currentUser={currentUser} orders={orders} trucks={trucks} branches={branches} 
            onAddOrder={(o) => setOrders(prev => [...prev, {...o, id: `O${Date.now()}`}])} 
            onUpdateStatus={(id, status) => setOrders(prev => prev.map(o => o.id === id ? {...o, status} : o))} 
            onDeleteOrder={(id) => setOrders(prev => prev.filter(o => o.id !== id))} 
            hideControls={currentUser.role === 'Driver'} 
          />
        )}
        {activeTab === 'branches' && <BranchManagement branches={branches} onAddBranch={(b) => setBranches(prev => [...prev, {...b, id: `B${Date.now()}`}])} />}
        {activeTab === 'users' && <UserManagement users={users} onAddUser={(u) => setUsers(prev => [...prev, {...u, id: `U${Date.now()}`}])} onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))} />}
        {activeTab === 'system' && <SystemSettings data={{ users, branches, trucks, orders }} onRestore={(d) => { setUsers(d.users); setBranches(d.branches); setTrucks(d.trucks); setOrders(d.orders); }} syncCode={syncCode} onSetSyncCode={(c) => { setSyncCode(c); localStorage.setItem(SYNC_KEY_STORAGE, c); }} />}
      </main>
    </div>
  );
};

export default App;
