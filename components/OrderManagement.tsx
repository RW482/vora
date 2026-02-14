
import React, { useState } from 'react';
import { Order, Truck, Branch, Route } from '../types';
import { Search, Plus, MoreHorizontal, User, Weight, MapPin, Truck as TruckIcon, Scale, Calendar, Trash2, Building2 } from 'lucide-react';

interface OrderManagementProps {
  orders: Order[];
  trucks: Truck[];
  branches: Branch[];
  onAddOrder: (order: Omit<Order, 'id'>) => void;
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onDeleteOrder: (id: string) => void;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ orders, trucks, branches, onAddOrder, onUpdateStatus, onDeleteOrder }) => {
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
    vehicleAssignedId: '',
    bookingDate: new Date().toISOString().split('T')[0]
  });

  const filteredOrders = orders.filter(o => 
    o.route === activeRoute && 
    o.bookingDate === selectedDate &&
    (selectedBranchId === 'all' || o.branchId === selectedBranchId) &&
    (o.partyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     o.brokerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder(newOrder);
    setIsModalOpen(false);
  };

  const handleStatusToggle = (order: Order) => {
    const nextStatus: Order['status'] = order.status === 'Pending' ? 'Loaded' : 
                                       order.status === 'Loaded' ? 'Delivered' : 'Pending';
    onUpdateStatus(order.id, nextStatus);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-4 bg-white p-2 md:p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveRoute('MUM_TO_KOP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeRoute === 'MUM_TO_KOP' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              MUM → KOP
            </button>
            <button
              onClick={() => setActiveRoute('KOP_TO_MUM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeRoute === 'KOP_TO_MUM' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              KOP → MUM
            </button>
          </div>

          <select 
            className="bg-slate-50 border-none text-xs font-bold text-slate-700 rounded-lg px-3 py-1.5 focus:ring-0"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
          >
            <option value="all">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border-none text-xs font-bold text-slate-700 rounded-lg px-3 py-1.5 focus:ring-0"
          />

          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              placeholder="Search Party..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-lg pl-9 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-indigo-200 text-black"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Plus size={14} /> New Order
          </button>
        </div>
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              <th className="px-6 py-4">Branch</th>
              <th className="px-6 py-4">Party Details</th>
              <th className="px-6 py-4">Broker/Weight</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map(order => {
              const isFinished = order.status !== 'Pending';
              return (
                <tr key={order.id} className={`${isFinished ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Building2 size={14} /></div>
                      <span className="text-sm font-bold text-slate-700">{branches.find(b => b.id === order.branchId)?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-bold text-slate-800 ${isFinished ? 'line-through' : ''}`}>{order.partyName}</p>
                    <p className="text-[10px] text-slate-400">Plot: {order.plotNo} | {order.mobileNo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-600">{order.brokerName}</p>
                    <p className="text-xs text-indigo-600 font-bold">{order.weight}T @ ₹{order.rate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleStatusToggle(order)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                        order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {order.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDeleteOrder(order.id)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet View (Cards) */}
      <div className="lg:hidden space-y-3">
        {filteredOrders.map(order => {
           const isFinished = order.status !== 'Pending';
           return (
            <div key={order.id} className={`bg-white p-4 rounded-2xl border border-slate-200 shadow-sm ${isFinished ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`font-bold text-slate-800 ${isFinished ? 'line-through' : ''}`}>{order.partyName}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                    {branches.find(b => b.id === order.branchId)?.name}
                  </p>
                </div>
                <button onClick={() => onDeleteOrder(order.id)} className="p-1.5 text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <p className="text-slate-400">Weight</p>
                  <p className="font-bold text-indigo-600">{order.weight} Tons</p>
                </div>
                <div>
                  <p className="text-slate-400">Rate</p>
                  <p className="font-bold">₹{order.rate}/T</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                <p className="text-[10px] font-medium text-slate-400 italic">Broker: {order.brokerName}</p>
                <button 
                  onClick={() => handleStatusToggle(order)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase ${
                    order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {order.status}
                </button>
              </div>
            </div>
           );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="py-12 text-center text-slate-400 italic bg-white rounded-3xl border border-dashed border-slate-200">
          No bookings found for this criteria.
        </div>
      )}

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-10 shadow-2xl my-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">New Load Booking</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Select Branch</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-indigo-500"
                      value={newOrder.branchId}
                      onChange={e => setNewOrder({...newOrder, branchId: e.target.value})}
                    >
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Party Name</label>
                    <input required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-black" value={newOrder.partyName} onChange={e => setNewOrder({...newOrder, partyName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Plot No" className="bg-slate-50 border-none rounded-xl px-4 py-3 text-black" value={newOrder.plotNo} onChange={e => setNewOrder({...newOrder, plotNo: e.target.value})} />
                    <input placeholder="Mobile" className="bg-slate-50 border-none rounded-xl px-4 py-3 text-black" value={newOrder.mobileNo} onChange={e => setNewOrder({...newOrder, mobileNo: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Weight (T)</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-black" value={newOrder.weight} onChange={e => setNewOrder({...newOrder, weight: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Rate (₹)</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-black" value={newOrder.rate} onChange={e => setNewOrder({...newOrder, rate: Number(e.target.value)})} />
                    </div>
                  </div>
                  <input placeholder="Broker Name" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-black" value={newOrder.brokerName} onChange={e => setNewOrder({...newOrder, brokerName: e.target.value})} />
                  <textarea placeholder="Remarks" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-black h-24" value={newOrder.remark} onChange={e => setNewOrder({...newOrder, remark: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-slate-500">Cancel</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
