
import React from 'react';
import { Truck, Order } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Package, Truck as TruckIcon, TrendingUp, AlertCircle, Calendar, Info } from 'lucide-react';

interface DashboardProps {
  trucks: Truck[];
  orders: Order[];
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ trucks, orders, isDarkMode }) => {
  const stats = [
    { label: 'Fleet Online', value: trucks.length, icon: TruckIcon, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Unloaded Orders', value: orders.filter(o => o.status === 'Pending').length, icon: Package, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Total Volume', value: `${orders.reduce((acc, o) => acc + o.weight, 0)}T`, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Delivery Rate', value: '98%', icon: AlertCircle, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/50' },
  ];

  const routeData = [
    { name: 'MUM to KOP', count: orders.filter(o => o.route === 'MUM_TO_KOP').length },
    { name: 'KOP to MUM', count: orders.filter(o => o.route === 'KOP_TO_MUM').length },
  ];

  const weightDistribution = [
    { name: 'In Transit', value: orders.filter(o => o.status === 'Loaded').reduce((acc, o) => acc + o.weight, 0) },
    { name: 'Queued', value: orders.filter(o => o.status === 'Pending').reduce((acc, o) => acc + o.weight, 0) },
  ];

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#64748b'];
  const chartTextColor = isDarkMode ? '#94a3b8' : '#64748b';
  const chartGridColor = isDarkMode ? '#1e293b' : '#f1f5f9';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex items-start gap-4 mb-4">
        <Info className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-widest mb-1">Local Storage Mode</p>
          <p className="text-xs text-amber-700 dark:text-amber-600 leading-relaxed font-medium">
            This app saves data to your browser memory. To access this data on another phone or laptop, go to <b>System > Export</b> and then <b>Import</b> the file on the other device.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">System <span className="text-indigo-600 dark:text-indigo-400">Overview</span></h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Real-time Logistics Analytics</p>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
           <Calendar size={18} className="text-slate-400" />
           <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex items-center gap-6 hover:shadow-xl dark:hover:ring-indigo-500/50 transition-all cursor-default group">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-10 rounded-[3rem] ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase tracking-widest text-[10px]">Route Performance</h3>
            <span className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-3 py-1 rounded-lg text-[9px] font-bold tracking-widest uppercase">Weekly Data</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 10, fontWeight: 700}} dx={-10} />
                <Tooltip 
                  cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }} 
                  contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: isDarkMode ? '#0f172a' : '#fff', color: isDarkMode ? '#f1f5f9' : '#000', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[12, 12, 4, 4]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3rem] ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm flex flex-col items-center">
          <h3 className="w-full text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase tracking-widest text-[10px] mb-10">Load Efficiency</h3>
          <div className="h-72 w-full flex items-center justify-center relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active</span>
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">Total</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={weightDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {weightDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: isDarkMode ? '#0f172a' : '#fff', color: isDarkMode ? '#f1f5f9' : '#000', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest mt-6">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><div className="w-3 h-3 rounded-full bg-indigo-500" /> Transit</span>
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><div className="w-3 h-3 rounded-full bg-amber-500" /> Queued</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
