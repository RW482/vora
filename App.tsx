
import React, { useState } from 'react';
import { Truck, Order, Route, Branch } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TruckManagement from './components/TruckManagement';
import OrderManagement from './components/OrderManagement';
import BranchManagement from './components/BranchManagement';
import { LayoutGrid, Truck as TruckIcon, ClipboardList, MapPin } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trucks' | 'orders' | 'branches'>('dashboard');
  
  const today = new Date().toISOString().split('T')[0];

  const [branches, setBranches] = useState<Branch[]>([
    { id: 'B1', name: 'Mumbai Main', location: 'Mumbai' },
    { id: 'B2', name: 'Kolhapur Hub', location: 'Kolhapur' },
    { id: 'B3', name: 'Pune Express', location: 'Pune' }
  ]);

  const [trucks, setTrucks] = useState<Truck[]>([
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
    }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'O1',
      partyName: 'Vinayak Steel',
      plotNo: 'A-12',
      mobileNo: '8888777766',
      brokerName: 'Mahesh Brokerage',
      weight: 5,
      remark: 'Careful handling',
      vehicleAssignedId: undefined,
      rate: 1200,
      branchId: 'B1',
      route: 'MUM_TO_KOP',
      status: 'Pending',
      bookingDate: today
    }
  ]);

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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'trucks', label: 'Daily Trucks', icon: TruckIcon },
    { id: 'orders', label: 'Order Mgmt', icon: ClipboardList },
    { id: 'branches', label: 'Branches', icon: MapPin },
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
            <p className="text-slate-500 text-xs md:text-sm">Logistics Dashboard</p>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard trucks={trucks} orders={orders} />}
        {activeTab === 'trucks' && <TruckManagement trucks={trucks} onAddTruck={addTruck} />}
        {activeTab === 'orders' && (
          <OrderManagement 
            orders={orders} 
            trucks={trucks} 
            branches={branches}
            onAddOrder={addOrder} 
            onUpdateStatus={updateOrderStatus}
            onDeleteOrder={deleteOrder}
          />
        )}
        {activeTab === 'branches' && (
          <BranchManagement branches={branches} onAddBranch={addBranch} />
        )}
      </main>
    </div>
  );
};

export default App;
