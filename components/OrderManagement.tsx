
import React, { useState } from 'react';
import { Order, Truck, Branch, Route, User } from '../types';
import { Search, Plus, Building2, Trash2, Truck as TruckIcon, ClipboardList } from 'lucide-react';

interface OrderManagementProps {
  currentUser: User;
  orders: Order[];
  trucks: Truck[];
  branches: Branch[];
  onAddOrder: (order: Omit<Order, 'id'>) => void;
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onDeleteOrder: (id: string) => void;
  hideControls?: boolean;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ currentUser, orders, trucks, branches, onAddOrder, onUpdateStatus, onDeleteOrder, hideControls }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState<Route>('MUM_TO_KOP');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newOrder, setNewOrder] = useState({
    partyName: '',
    plotNo: '',
    mobileNo: '',
    brokerName: '',
    weight: 0,
    remark: '',
    rate: 0,
    branchId: branches[0]?.id || '',
    route: 'MUM_TO_KOP' as Route,
    status: 'Pending' as Order['status'],
    vehicleAssignedNo: '',
    bookingDate: new Date().toISOString().split('T')[0]
  });

  const filteredOrders = orders.filter(o => {
    if (currentUser.role === 'Driver') {
      if (!currentUser.linkedVehicleNo) return false;
      return o.vehicleAssignedNo?.toUpperCase().trim() === currentUser.linkedVehicleNo.toUpperCase().trim();
    }
    const routeMatch = o.route === activeRoute;
    const dateMatch = o.bookingDate === selectedDate;
    return routeMatch && dateMatch &&
    (selectedBranchId === 'all' || o.branchId === selectedBranchId) &&
    (o.partyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     o.brokerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     o.vehicleAssignedNo?.toLowerCase().includes(searchQuery.toLowerCase()))
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder({
      ...newOrder,
      vehicleAssignedNo: newOrder.vehicleAssignedNo.toUpperCase().trim()
    });
    setIsModalOpen(false);
    setNewOrder({
      ...newOrder,
      partyName: '',
      plotNo: '',
      mobileNo: '',
      brokerName: '',
      weight: 0,
      remark: '',
      rate: 0,
      vehicleAssignedNo: ''
    });
  };

  const handleStatusToggle = (order: Order) => {
    const nextStatus: Order['status'] = order.status === 'Pending' ? 'Loaded' : 
                                       order.status === 'Loaded' ? 'Delivered' : 'Pending';
    onUpdateStatus(order.id, nextStatus);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {!hideControls && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-white dark:bg-slate-900 p-2 md:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setActiveRoute('MUM_TO_KOP')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeRoute === 'MUM_TO_KOP' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'}`}>MUM → KOP</button>
              <button onClick={() => setActiveRoute('KOP_TO_MUM')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeRoute === 'KOP_TO_MUM' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'}`}>KOP → MUM</button>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 focus:ring-0 appearance-none" value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)}>
              <option value="all">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 focus:ring-0" />
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600" size={14} />
              <input placeholder="Search Party or Vehicle..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg pl-9 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-800 text-black dark:text-white" />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Plus size={14} /> New Order</button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] uppercase font-black text-slate-400 dark:text-slate-600 tracking-widest">
                <th className="px-6 py-5">Details</th>
                <th className="px-6 py-5">Route & Load</th>
                <th className="px-6 py-5">Vehicle Assigned</th>
                <th className="px-6 py-5">Status</th>
                {!hideControls && <th className="px-6 py-5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map(order => {
                const isFinished = order.status === 'Delivered';
                return (
                  <tr key={order.id} className={`${isFinished ? 'opacity-40' : ''} hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-600"><Building2 size={16} /></div>
                        <div>
                          <p className={`font-bold text-slate-800 dark:text-slate-200 ${isFinished ? 'line-through' : ''}`}>{order.partyName}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-tighter">{branches.find(b => b.id === order.branchId)?.name || 'Central'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">{order.route.replace(/_/g, ' ')}</p>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{order.weight}T Load @ {order.rate}/T</p>
                    </td>
                    <td className="px-6 py-4">
                      {order.vehicleAssignedNo ? (
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-xl w-fit">
                          <TruckIcon size={14} />
                          <span className="text-[10px] font-black">{order.vehicleAssignedNo}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleStatusToggle(order)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
                          order.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' : 
                          order.status === 'Loaded' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                        }`}>
                        {order.status}
                      </button>
                    </td>
                    {!hideControls && (
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => onDeleteOrder(order.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 dark:text-slate-700 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
           <div className="flex flex-col items-center gap-3">
              <ClipboardList className="text-slate-200 dark:text-slate-800" size={48} />
              <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs">
                {currentUser.role === 'Driver' ? 'No orders assigned to your truck yet' : 'No active records found for this date/route'}
              </p>
           </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl p-6 md:p-12 shadow-2xl my-auto border border-transparent dark:border-slate-800">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-8 tracking-tight">Create <span className="text-indigo-600 dark:text-indigo-400">Booking</span></h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Branch</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-black dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 appearance-none" value={newOrder.branchId} onChange={e => setNewOrder({...newOrder, branchId: e.target.value})}>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Party Name</label>
                    <input required className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-black dark:text-white font-bold" value={newOrder.partyName} onChange={e => setNewOrder({...newOrder, partyName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Plot No" className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-black dark:text-white font-bold" value={newOrder.plotNo} onChange={e => setNewOrder({...newOrder, plotNo: e.target.value})} />
                    <input placeholder="Mobile" className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-black dark:text-white font-bold" value={newOrder.mobileNo} onChange={e => setNewOrder({...newOrder, mobileNo: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-5">
                   <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Assign Vehicle No.</label>
                    <div className="relative">
                      <input 
                        list="truck-numbers"
                        placeholder="e.g. MH-09-AZ-1234"
                        className="w-full bg-indigo-50 dark:bg-indigo-900/40 border-none rounded-2xl px-5 py-4 text-indigo-900 dark:text-indigo-100 font-black placeholder:text-indigo-200 dark:placeholder:text-indigo-800 focus:ring-2 focus:ring-indigo-500" 
                        value={newOrder.vehicleAssignedNo} 
                        onChange={e => setNewOrder({...newOrder, vehicleAssignedNo: e.target.value})} 
                      />
                      <datalist id="truck-numbers">
                        {trucks.map(t => (
                          <option key={t.id} value={t.vehicleNo}>{t.driverName}</option>
                        ))}
                      </datalist>
                      <TruckIcon size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-300 dark:text-indigo-700" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Weight (T)" type="number" step="0.1" className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-black dark:text-white font-bold" value={newOrder.weight} onChange={e => setNewOrder({...newOrder, weight: Number(e.target.value)})} />
                    <input placeholder="Rate (₹)" type="number" className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-black dark:text-white font-bold" value={newOrder.rate} onChange={e => setNewOrder({...newOrder, rate: Number(e.target.value)})} />
                  </div>
                  <input placeholder="Broker Name" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-black dark:text-white font-bold" value={newOrder.brokerName} onChange={e => setNewOrder({...newOrder, brokerName: e.target.value})} />
                  <textarea placeholder="Remarks..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-black dark:text-white font-bold h-24" value={newOrder.remark} onChange={e => setNewOrder({...newOrder, remark: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="flex-[2] bg-indigo-600 dark:bg-indigo-500 text-white py-5 rounded-3xl font-black shadow-xl shadow-indigo-200 dark:shadow-none uppercase tracking-widest active:scale-95 transition-all">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
