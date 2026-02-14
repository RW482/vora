
import React, { useState } from 'react';
import { Truck, Route, STATIONS } from '../types';
import { Plus, User, Phone, MapPin, Scale, ArrowRightLeft, Truck as TruckIcon } from 'lucide-react';

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
    onAddTruck(newTruck);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto">
          <button
            onClick={() => setActiveRoute('MUM_TO_KOP')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeRoute === 'MUM_TO_KOP' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Mumbai → Kolhapur
          </button>
          <button
            onClick={() => setActiveRoute('KOP_TO_MUM')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeRoute === 'KOP_TO_MUM' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Kolhapur → Mumbai
          </button>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all"
        >
          <Plus size={20} />
          Add Daily Truck
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrucks.map(truck => (
          <div key={truck.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-1.5 h-full ${truck.status === 'Available' ? 'bg-green-500' : 'bg-amber-500'}`} />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{truck.vehicleNo}</p>
                <h3 className="text-xl font-bold text-slate-800">{truck.driverName}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                truck.status === 'Available' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {truck.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={18} className="text-slate-400" />
                <span className="text-sm font-medium">{truck.driverMobile}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin size={18} className="text-slate-400" />
                <span className="text-sm font-medium">{truck.fromStation} to {truck.toStation}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Scale size={18} className="text-slate-400" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Load Capacity</span>
                    <span className="font-bold">{truck.weightCapacity}T</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500" 
                      style={{ width: `${(truck.availableWeight / truck.weightCapacity) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{truck.availableWeight}T available</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <img key={i} src={`https://picsum.photos/32/32?random=${truck.id}${i}`} className="w-8 h-8 rounded-full border-2 border-white" alt="driver" />
                ))}
              </div>
              <button className="text-indigo-600 font-bold text-xs hover:underline uppercase tracking-wide">View History</button>
            </div>
          </div>
        ))}

        {filteredTrucks.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <TruckIcon className="text-slate-300" size={40} />
            </div>
            <p className="text-slate-400 font-medium">No trucks active on this route yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Register Daily Truck</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Vehicle Number</label>
                    <input 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black"
                      placeholder="e.g. MH-09-AZ-1234"
                      value={newTruck.vehicleNo}
                      onChange={e => setNewTruck({...newTruck, vehicleNo: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Driver Name</label>
                    <input 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black"
                      value={newTruck.driverName}
                      onChange={e => setNewTruck({...newTruck, driverName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile No.</label>
                    <input 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black"
                      value={newTruck.driverMobile}
                      onChange={e => setNewTruck({...newTruck, driverMobile: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">From Station</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black"
                      value={newTruck.fromStation}
                      onChange={e => setNewTruck({...newTruck, fromStation: e.target.value})}
                    >
                      {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">To Station</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black"
                      value={newTruck.toStation}
                      onChange={e => setNewTruck({...newTruck, toStation: e.target.value})}
                    >
                      {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Weight Capacity (T)</label>
                    <input 
                      type="number"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black"
                      value={newTruck.weightCapacity}
                      onChange={e => setNewTruck({...newTruck, weightCapacity: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Current Route</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black"
                      value={newTruck.currentRoute}
                      onChange={e => setNewTruck({...newTruck, currentRoute: e.target.value as Route})}
                    >
                      <option value="MUM_TO_KOP">MUM to KOP</option>
                      <option value="KOP_TO_MUM">KOP to MUM</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                  >
                    Register Truck
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
