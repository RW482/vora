
import React, { useState, useEffect, useRef } from 'react';
import { Truck, Order, Route, Branch, User, UserRole } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TruckManagement from './components/TruckManagement';
import OrderManagement from './components/OrderManagement';
import BranchManagement from './components/BranchManagement';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import { LayoutGrid, Truck as TruckIcon, ClipboardList, MapPin, Users, LogOut } from 'lucide-react';

const STORAGE_KEY = 'VORA_LOGISTICS_DATA_v2';

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Persistence logic
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isInitialMount = useRef(true);

  // Initialize Data from LocalStorage or Defaults
  useEffect(() => {
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
      // Default initial data if nothing exists
      const defaultUsers: User[] = [
        { id: 'u1', username: 'admin', password: '123', role: 'Admin', fullName: 'System Admin' },
        { id: 'u2', username: 'driver1', password: '123', role: 'Driver', fullName: 'Rahul Shinde', linkedVehicleNo: 'MH-09-CQ-1234' }
      ];
      setUsers(defaultUsers);
      setBranches([{ id: 'B1', name: 'Mumbai Main', location: 'Mumbai' }, { id: 'B2', name: 'Kolhapur Hub', location: 'Kolhapur' }]);
      setTrucks([{
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
      }]);
    }
    setIsDataLoaded(true);
  }, []);

  // Sync state to storage - Only after initial load and only when data actually changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isDataLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, branches, trucks, orders }));
    }
  }, [users, branches, trucks, orders, isDataLoaded]);

  const handleLogin = (un: string, pw: string) => {
    // Basic trim to avoid whitespace issues
    const cleanUn = un.trim();
    const cleanPw = pw.trim();
    
    const user = users.find(u => u.username === cleanUn && u.password === cleanPw);
    if (user) {
      setCurrentUser(user);
      setAuthError('');
      // Set default tab based on role
      setActiveTab(user.role === 'Driver' ? 'orders' : 'dashboard');
    } else {
      setAuthError('Invalid credentials. Check username/password or ensure user is created.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // State updates
  const addTruck = (truck: Omit<Truck, 'id' | 'availableWeight'>) => {
    setTrucks(prev => [...prev, { ...truck, id: `T${Date.now()}`, availableWeight: truck.weightCapacity }]);
  };

  const addOrder = (order: Omit<Order, 'id'>) => {
    setOrders(prev => [...prev, { ...order, id: `O${Date.now()}` }]);
  };

  const deleteOrder = (id: string) => {
    if (window.confirm('Delete this order?')) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const addBranch = (branch: Omit<Branch, 'id'>) => {
    setBranches(prev => [...prev, { ...branch, id: `B${Date.now()}` }]);
  };

  const addUser = (user: Omit<User, 'id'>) => {
    setUsers(prev => [...prev, { ...user, id: `U${Date.now()}` }]);
  };

  const deleteUser = (id: string) => {
    if (window.confirm(`Are you sure you want to remove user access for ${users.find(u => u.id === id)?.fullName}?`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} error={authError} />;
  }

  // Define Menu Items based on role
  const isStaff = currentUser.role === 'Admin' || currentUser.role === 'Staff';
  
  const menuItems = [
    ...(isStaff ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutGrid }] : []),
    ...(isStaff ? [{ id: 'trucks', label: 'Daily Trucks', icon: TruckIcon }] : []),
    { id: 'orders', label: currentUser.role === 'Driver' ? 'My Deliveries' : 'Order Mgmt', icon: ClipboardList },
    ...(isStaff ? [{ id: 'branches', label: 'Branches', icon: MapPin }] : []),
    ...(currentUser.role === 'Admin' ? [{ id: 'users', label: 'Users', icon: Users }] : []),
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        items={menuItems} 
        activeItem={activeTab} 
        onSelect={(id: any) => setActiveTab(id)} 
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-xs md:text-sm">
              <span>Logged in as <span className="font-bold text-indigo-600">{currentUser.fullName}</span> ({currentUser.role})</span>
              {currentUser.linkedVehicleNo && (
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                  TRUCK: {currentUser.linkedVehicleNo}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut size={16} /> Logout
          </button>
        </header>

        {activeTab === 'dashboard' && <Dashboard trucks={trucks} orders={orders} />}
        {activeTab === 'trucks' && <TruckManagement trucks={trucks} onAddTruck={addTruck} />}
        {activeTab === 'orders' && (
          <OrderManagement 
            currentUser={currentUser}
            orders={orders} 
            trucks={trucks} 
            branches={branches}
            onAddOrder={addOrder} 
            onUpdateStatus={updateOrderStatus}
            onDeleteOrder={deleteOrder}
            hideControls={currentUser.role === 'Driver'}
          />
        )}
        {activeTab === 'branches' && <BranchManagement branches={branches} onAddBranch={addBranch} />}
        {activeTab === 'users' && <UserManagement users={users} onAddUser={addUser} onDeleteUser={deleteUser} />}
      </main>
    </div>
  );
};

export default App;
