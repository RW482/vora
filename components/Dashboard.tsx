
import React from 'react';
import { Truck, Order } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Package, Truck as TruckIcon, TrendingUp, AlertCircle, Calendar, IndianRupee, MapPin } from 'lucide-react';

interface DashboardProps {
  trucks: Truck[];
  orders: Order[];
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ trucks, orders, isDarkMode }) => {
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const pendingPayments = orders.filter(o => o.paymentStatus !== 'Paid').reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const stats = [
    { label: 'Fleet Online', value: trucks.length, icon: TruckIcon, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Active Bookings', value: orders.filter(o => o.status !== 'Delivered').length, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Unpaid Dues', value: `₹${pendingPayments.toLocaleString()}`, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  const routeData = [
    { name: 'MUM → KOP', count: orders.filter(o => o.route === 'MUM_TO_KOP').length, weight: orders.filter(o => o.route === 'MUM_TO_KOP').reduce((a,b) => a + b.weight, 0) },
    { name: 'KOP → MUM', count: orders.filter(o => o.route === 'KOP_TO_MUM').length, weight: orders.filter(o => o.route === 'KOP_TO_MUM').reduce((a,b) => a + b.weight, 0) },
  ];

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];
  const chartTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const chartGridColor = isDarkMode ? '#1e293b' : '#f1f5f9';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:border-indigo-500 transition-all cursor-default">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Route Volume (Tons)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={routeData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#0f172a', color: '#fff' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#6366f1" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Fleet Status</h3>
          <div className="space-y-6">
            {trucks.slice(0, 4).map(truck => (
              <div key={truck.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600">
                    <TruckIcon size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-xs dark:text-white">{truck.vehicleNo}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{truck.driverName}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                  truck.status === 'Available' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                }`}>
                  {truck.status}
                </span>
              </div>
            ))}
            {trucks.length === 0 && <p className="text-center py-10 text-slate-400 text-xs font-bold uppercase">No Trucks Registered</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
