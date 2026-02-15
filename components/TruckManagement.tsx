
import React, { useState } from 'react';
import { Truck, Order, Route, STATIONS } from '../types';
import { Plus, User, Phone, MapPin, Scale, Truck as TruckIcon, ArrowRight, ClipboardCheck, X } from 'lucide-react';

interface TruckManagementProps {
  trucks: Truck[];
  orders: Order[];
  onAddTruck: (truck: Omit<Truck, 'id' | 'availableWeight'>) => void;
}

const TruckManagement: React.FC<TruckManagementProps> = ({ trucks, orders, onAddTruck }) => {
  const [activeRoute, setActiveRoute] = useState<Route>('MUM_TO_KOP');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState<Truck | null>(null);
  
  const [newTruck, setNewTruck] = useState({
    driverName: '', driverMobile: '', fromStation: 'Mumbai', toStation: 'Kolhapur',
    weightCapacity: 10, vehicleNo: '', status: 'Available' as Truck['status'], currentRoute: 'MUM_TO_KOP' as Route
  });

  const filteredTrucks = trucks.filter(t => t.currentRoute === activeRoute);

  const getTruckLoad = (vehicleNo: string) => {
    return orders
      .filter(o => o.vehicleAssignedNo?.toUpperCase() === vehicleNo.toUpperCase() && o.status !== 'Delivered')
      .reduce((sum, o) => sum + o.weight, 0);
  };

  const getManifestOrders = (vehicleNo: string) => {
    return orders.filter(o => o.vehicleAssignedNo?.toUpperCase() === vehicleNo.toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTruck({ ...newTruck, vehicleNo: newTruck.vehicleNo.toUpperCase() });
    setIsModalOpen(false);
    setNewTruck({ ...newTruck, driverName: '', driverMobile: '', vehicleNo: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Active <span className="text-indigo-600">Fleet</span></h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Real-time capacity tracking for the MH-09 Corridor</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm w-full lg:w-auto">
            <button onClick={() => setActiveRoute('MUM_TO_KOP')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeRoute === 'MUM_TO_KOP' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>MUM → KOP</button>
            <button onClick={() => setActiveRoute('KOP_TO_MUM')} className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeRoute === 'KOP_TO_MUM' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>KOP → MUM</button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="w-full lg:w-auto bg-slate-900 dark:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"><Plus size={18} /> Register Truck</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredTrucks.map(truck => {
          const loadedWeight = getTruckLoad(truck.vehicleNo);
          const loadPercent = Math.min((loadedWeight / truck.weightCapacity) * 100, 100);
          
          return (
            <div key={truck.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8 hover:shadow-2xl transition-all group">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider mb-3">
                    <TruckIcon size={12} /> {truck.vehicleNo}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{truck.driverName}</h3>
                  <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">{truck.driverMobile}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${truck.status === 'Available' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-8">
                <div className="flex justify-between mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Load</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">{loadedWeight} / {truck.weightCapacity} <span className="text-[10px] opacity-40 uppercase ml-1">Tons</span></span>
                </div>
                <div className="h-3 bg-white dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-100 dark:border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${loadPercent > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
              </div>

              <button 
                onClick={() => setSelectedManifest(truck)}
                className="w-full py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm"
              >
                View Loading Manifest
              </button>
            </div>
          );
        })}
      </div>

      {/* Manifest Modal */}
      {selectedManifest && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300">
              <div className="p-10 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Manifest: <span className="text-indigo-600">{selectedManifest.vehicleNo}</span></h2>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Route: {selectedManifest.currentRoute.replace('_', ' to ')} • Capacity: {selectedManifest.weightCapacity}T</p>
                 </div>
                 <button onClick={() => setSelectedManifest(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-4">
                 {getManifestOrders(selectedManifest.vehicleNo).length === 0 ? (
                   <div className="py-20 text-center opacity-30 font-black text-xs uppercase tracking-widest">No Load Assigned to this Truck</div>
                 ) : (
                   getManifestOrders(selectedManifest.vehicleNo).map(order => (
                     <div key={order.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div>
                           <p className="font-black text-sm text-slate-900 dark:text-slate-100">{order.partyName}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Plot: {order.plotNo} • Status: {order.status}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-lg font-black text-indigo-600">{order.weight}<span className="text-[10px] ml-0.5">T</span></p>
                           <p className="text-[9px] font-black text-slate-400 uppercase">Weight Class</p>
                        </div>
                     </div>
                   ))
                 )}
              </div>
              
              <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 border-t border-indigo-100 dark:border-indigo-900/30">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Total Active Load</span>
                    <span className="text-2xl font-black text-indigo-600">{getTruckLoad(selectedManifest.vehicleNo)} <span className="text-xs uppercase opacity-60">Tons</span></span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Register Truck Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-8 uppercase tracking-tight">New <span className="text-indigo-600">Vehicle</span></h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input placeholder="Vehicle No (e.g. MH-09-AZ-1234)" required className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-black text-indigo-600 uppercase border-none" value={newTruck.vehicleNo} onChange={e => setNewTruck({...newTruck, vehicleNo: e.target.value})} />
              <input placeholder="Driver Name" required className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold border-none" value={newTruck.driverName} onChange={e => setNewTruck({...newTruck, driverName: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Mobile" required className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold border-none" value={newTruck.driverMobile} onChange={e => setNewTruck({...newTruck, driverMobile: e.target.value})} />
                <input placeholder="Tons (Capacity)" type="number" required className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold border-none" value={newTruck.weightCapacity} onChange={e => setNewTruck({...newTruck, weightCapacity: Number(e.target.value)})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-black text-slate-400 uppercase text-xs tracking-widest">Discard</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all active:scale-95">Add to Fleet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckManagement;
