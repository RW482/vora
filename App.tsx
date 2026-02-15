
import React, { useState, useEffect, useRef } from 'react';
import { Truck, Order, Branch, User } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TruckManagement from './components/TruckManagement';
import OrderManagement from './components/OrderManagement';
import BranchManagement from './components/BranchManagement';
import UserManagement from './components/UserManagement';
import SystemSettings from './components/SystemSettings';
import Login from './components/Login';
import { LayoutGrid, Truck as TruckIcon, ClipboardList, MapPin, Users, LogOut, Settings, CloudRain } from 'lucide-react';

const STORAGE_KEY = 'VORA_LOGISTICS_DATA_v3';
const THEME_KEY = 'VORA_THEME';
const SYNC_KEY_STORAGE = 'VORA_SYNC_CODE';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [syncCode, setSyncCode] = useState<string>(localStorage.getItem(SYNC_KEY_STORAGE) || '');
  const [isSyncing, setIsSyncing] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isInitialMount = useRef(true);

  // Initialize App
  useEffect(() => {
    // 1. Theme Setup
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldShowDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldShowDark);
    if (shouldShowDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Data Loading
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setUsers(parsed.users || []);
        setBranches(parsed.branches || []);
        setTrucks(parsed.trucks || []);
        setOrders(parsed.orders || []);
      } catch (e) {
        console.error("Failed to parse stored data", e);
      }
    } else {
      // Default initial data
      setUsers([{ id: 'u1', username: 'admin', password: '123', role: 'Admin', fullName: 'System Admin' }]);
      setBranches([
        { id: 'B1', name: 'Mumbai Main', location: 'Mumbai' }, 
        { id: 'B2', name: 'Kolhapur Hub', location: 'Kolhapur' }
      ]);
      // Adding some initial daily trucks for clarity
      setTrucks([
        {
          id: 'T1',
          driverName: 'Rahul Shinde',
          driverMobile: '9876543210',
          fromStation: 'Mumbai',
          toStation: 'Kolhapur',
          weightCapacity: 12,
          availableWeight: 12,
          status: 'Available',
          currentRoute: 'MUM_TO_KOP',
          vehicleNo: 'MH-09-CQ-1234'
        },
        {
          id: 'T2',
          driverName: 'Amit Patil',
          driverMobile: '9876543211',
          fromStation: 'Kolhapur',
          toStation: 'Mumbai',
          weightCapacity: 15,
          availableWeight: 15,
          status: 'Available',
          currentRoute: 'KOP_TO_MUM',
          vehicleNo: 'MH-07-JK-5678'
        }
      ]);
      setOrders([]);
    }
    setIsDataLoaded(true);
  }, []);

  // Theme Toggle Fix
  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  };

  // Auto-Save to LocalStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isDataLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, branches, trucks, orders }));
    }
  }, [users, branches, trucks, orders, isDataLoaded]);

  // Cloud Sync Logic
  const handleCloudSync = async (code: string, mode: 'PUSH' | 'PULL') => {
    if (!code) {
      alert("No Sync Key available. Go to System tab to generate one.");
      return;
    }
    
    setIsSyncing(true);
    const binId = code.replace('VOR-', '');
    const API_URL = `https://api.npoint.io/${binId}`;
    
    try {
      if (mode === 'PUSH') {
        // npoint expects the JSON body directly to update
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users, branches, trucks, orders })
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Push failed:', errorData);
          throw new Error('Sync Push Failed');
        }
        alert('Cloud Update Success! Other devices can now pull these changes.');
      } else {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Could not find sync data for this key.');
        
        const data = await response.json();
        // Check if data is wrapped in a "contents" object (some npoint versions do this)
        const finalData = data.contents ? data.contents : data;

        if (finalData.users) {
          setUsers(finalData.users);
          setBranches(finalData.branches || []);
          setTrucks(finalData.trucks || []);
          setOrders(finalData.orders || []);
          localStorage.setItem(SYNC_KEY_STORAGE, code);
          setSyncCode(code);
          alert('Device successfully linked and updated!');
        } else {
          throw new Error('Invalid data format received from cloud.');
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(`Sync Error: ${err.message || 'Check your internet or sync key.'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogin = async (un: string, pw: string) => {
    const cleanUn = un.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === cleanUn && u.password === pw);
    
    if (user) {
      setCurrentUser(user);
      setAuthError('');
      setActiveTab(user.role === 'Driver' ? 'orders' : 'dashboard');
    } else {
      setAuthError('Login Failed. If you just created this account on another device, click "Connect to Remote Office" below.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  if (!currentUser) {
    return (
      <Login 
        onLogin={handleLogin} 
        error={authError} 
        onSync={(code) => handleCloudSync(code, 'PULL')}
        isSyncing={isSyncing}
      />
    );
  }

  const isAdmin = currentUser.role === 'Admin';
  const isStaff = isAdmin || currentUser.role === 'Staff';

  const menuItems = [
    ...(isStaff ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutGrid }] : []),
    ...(isStaff ? [{ id: 'trucks', label: 'Daily Trucks', icon: TruckIcon }] : []),
    { id: 'orders', label: currentUser.role === 'Driver' ? 'My Jobs' : 'Orders', icon: ClipboardList },
    ...(isStaff ? [{ id: 'branches', label: 'Branches', icon: MapPin }] : []),
    ...(isAdmin ? [{ id: 'users', label: 'Users', icon: Users }] : []),
    ...(isAdmin ? [{ id: 'system', label: 'System', icon: Settings }] : []),
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <Sidebar 
        items={menuItems} 
        activeItem={activeTab} 
        onSelect={(id: any) => setActiveTab(id)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              {currentUser.fullName} • <span className="text-indigo-600 dark:text-indigo-400">{currentUser.role}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
             {isAdmin && (
               <button 
                 onClick={() => handleCloudSync(syncCode, 'PUSH')}
                 disabled={isSyncing || !syncCode}
                 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <CloudRain size={14} className={isSyncing ? 'animate-bounce' : ''} />
                 {isSyncing ? 'Syncing...' : 'Push Updates'}
               </button>
             )}
             <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
                <LogOut size={20} />
             </button>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard trucks={trucks} orders={orders} isDarkMode={isDarkMode} />}
        {activeTab === 'trucks' && <TruckManagement trucks={trucks} onAddTruck={(t) => setTrucks(prev => [...prev, {...t, id: `T${Date.now()}`, availableWeight: t.weightCapacity}])} />}
        {activeTab === 'orders' && (
          <OrderManagement 
            currentUser={currentUser}
            orders={orders} 
            trucks={trucks} 
            branches={branches}
            onAddOrder={(o) => setOrders(prev => [...prev, {...o, id: `O${Date.now()}`}])} 
            onUpdateStatus={(id, status) => setOrders(prev => prev.map(o => o.id === id ? {...o, status} : o))}
            onDeleteOrder={(id) => setOrders(prev => prev.filter(o => o.id !== id))}
            hideControls={currentUser.role === 'Driver'}
          />
        )}
        {activeTab === 'branches' && <BranchManagement branches={branches} onAddBranch={(b) => setBranches(prev => [...prev, {...b, id: `B${Date.now()}`}])} />}
        {activeTab === 'users' && <UserManagement users={users} onAddUser={(u) => setUsers(prev => [...prev, {...u, id: `U${Date.now()}`}])} onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))} />}
        {activeTab === 'system' && (
          <SystemSettings 
            data={{ users, branches, trucks, orders }} 
            onRestore={(d) => { setUsers(d.users); setBranches(d.branches); setTrucks(d.trucks); setOrders(d.orders); }} 
            syncCode={syncCode}
            onSetSyncCode={(c) => { setSyncCode(c); localStorage.setItem(SYNC_KEY_STORAGE, c); }}
          />
        )}
      </main>
    </div>
  );
};

export default App;
