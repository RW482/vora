
import React, { useState } from 'react';
import { Truck, Route, STATIONS } from '../types';
import { Plus, User, Phone, MapPin, Scale, Truck as TruckIcon, ArrowRight, CheckCircle2 } from 'lucide-react';

interface TruckManagementProps {
  trucks: Truck[];
  onAddTruck: (truck: Omit<Truck, 'id' | 'availableWeight'>) => void;
}

const TruckManagement: React.FC<TruckManagementProps> = ({ trucks, onAddTruck }) => {
  const [activeRoute, setActiveRoute] = useState<Route>('MUM_TO_KOP');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTruck, setNewTruck] = useState({
    driverName: '',
    driverMobile: '',
    fromStation: 'Mumbai',
    toStation: 'Kolhapur',
    weightCapacity: 10,
    vehicleNo: '',
    status: 'Available' as Truck['status'],
    currentRoute: 'MUM_TO_KOP' as Route
  });

  const filteredTrucks = trucks.filter(t => t.currentRoute === activeRoute);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTruck({
      ...newTruck,
      vehicleNo: newTruck.vehicleNo.toUpperCase()
    });
    setIsModalOpen(false);
    setNewTruck({
      driverName: '',
      driverMobile: '',
      fromStation: 'Mumbai',
      toStation: 'Kolhapur',
      weightCapacity: 10,
      vehicleNo: '',
      status: 'Available',
      currentRoute: activeRoute
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Fleet <span className="text-indigo-600 dark:text-indigo-400">Scheduler</span></h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Manage daily routes between Mumbai & Kolhapur</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[1.25rem] ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm w-full lg:w-auto">
            <button
              onClick={() => setActiveRoute('MUM_TO_KOP')}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                activeRoute === 'MUM_TO_KOP' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Mumbai → Kolhapur
            </button>
            <button
              onClick={() => setActiveRoute('KOP_TO_MUM')}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                activeRoute === 'KOP_TO_MUM' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Kolhapur → Mumbai
            </button>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full lg:w-auto flex items-center justify-center gap-3 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95"
          >
            <Plus size={18} />
            Register Vehicle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredTrucks.map(truck => (
          <div key={truck.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm p-8 hover:shadow-2xl dark:hover:ring-indigo-500/50 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-3 h-full ${truck.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2">
                  <TruckIcon size={12} /> {truck.vehicleNo}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{truck.driverName}</h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest flex items-center gap-1">
                  <Phone size={10} /> {truck.driverMobile}
                </p>
              </div>
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                truck.status === 'Available' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
              }`}>
                {truck.status}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">From</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{truck.fromStation}</p>
                </div>
                <ArrowRight className="text-slate-300 dark:text-slate-600" size={20} />
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">To</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{truck.toStation}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Manifest Capacity</span>
                  <span className="text-lg font-black text-slate-900 dark:text-slate-100">{truck.weightCapacity}<span className="text-slate-400 text-xs ml-0.5">T</span></span>
                </div>
                <div className="h-2.5 bg-white dark:bg-slate-900 rounded-full overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 p-0.5">
                  <div 
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${(truck.availableWeight / truck.weightCapacity) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-indigo-600/60 dark:text-indigo-400/60 tracking-widest uppercase">
                  <span>Available</span>
                  <span>{truck.availableWeight}T Remaining</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-[0.2em] group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              Manifest Details
            </button>
          </div>
        ))}

        {filteredTrucks.length === 0 && (
          <div className="col-span-full py-24 bg-white dark:bg-slate-900 rounded-[3rem] ring-1 ring-slate-200 dark:ring-slate-800 ring-dashed flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-6 text-slate-200 dark:text-slate-700">
              <TruckIcon size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Fleet Idle</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs font-medium">No active transport manifests currently registered for the {activeRoute.replace('_', ' to ')} route.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-transparent dark:border-slate-800">
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Register <span className="text-indigo-600 dark:text-indigo-400">Truck</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Vehicle Plate Number</label>
                    <input 
                      required
                      autoFocus
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 uppercase"
                      placeholder="e.g. MH-09-AZ-1234"
                      value={newTruck.vehicleNo}
                      onChange={e => setNewTruck({...newTruck, vehicleNo: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Driver Name</label>
                    <input 
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"
                      value={newTruck.driverName}
                      onChange={e => setNewTruck({...newTruck, driverName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Contact Mobile</label>
                    <input 
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"
                      value={newTruck.driverMobile}
                      onChange={e => setNewTruck({...newTruck, driverMobile: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">From</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold appearance-none"
                      value={newTruck.fromStation}
                      onChange={e => setNewTruck({...newTruck, fromStation: e.target.value})}
                    >
                      {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">To</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold appearance-none"
                      value={newTruck.toStation}
                      onChange={e => setNewTruck({...newTruck, toStation: e.target.value})}
                    >
                      {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Capacity (Tons)</label>
                    <input 
                      type="number"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"
                      value={newTruck.weightCapacity}
                      onChange={e => setNewTruck({...newTruck, weightCapacity: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Route Assignment</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold appearance-none"
                      value={newTruck.currentRoute}
                      onChange={e => setNewTruck({...newTruck, currentRoute: e.target.value as Route})}
                    >
                      <option value="MUM_TO_KOP">MUM to KOP</option>
                      <option value="KOP_TO_MUM">KOP to MUM</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-8">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-400 active:scale-95 transition-all"
                  >
                    Authorize Fleet Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckManagement;
