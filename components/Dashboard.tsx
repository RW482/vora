
import React from 'react';
import { Truck, Order } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Package, Truck as TruckIcon, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardProps {
  trucks: Truck[];
  orders: Order[];
}

const Dashboard: React.FC<DashboardProps> = ({ trucks, orders }) => {
  const stats = [
    { label: 'Active Trucks', value: trucks.length, icon: TruckIcon, color: 'bg-blue-500' },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, icon: Package, color: 'bg-orange-500' },
    { label: 'Total Weight', value: `${orders.reduce((acc, o) => acc + o.weight, 0)}T`, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Issues', value: 0, icon: AlertCircle, color: 'bg-rose-500' },
  ];

  const routeData = [
    { name: 'MUM to KOP', count: orders.filter(o => o.route === 'MUM_TO_KOP').length },
    { name: 'KOP to MUM', count: orders.filter(o => o.route === 'KOP_TO_MUM').length },
  ];

  const weightDistribution = [
    { name: 'Loaded', value: orders.filter(o => o.status === 'Loaded').reduce((acc, o) => acc + o.weight, 0) },
    { name: 'Pending', value: orders.filter(o => o.status === 'Pending').reduce((acc, o) => acc + o.weight, 0) },
  ];

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-xl text-white`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Route Distribution (Orders)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Weight Load Summary (Tons)</h3>
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={weightDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {weightDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-indigo-500" /> Loaded</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500" /> Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
