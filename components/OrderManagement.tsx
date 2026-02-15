
import React, { useState } from 'react';
import { Order, Truck, Branch, Route, User, Language, PaymentStatus } from '../types';
import { Search, Plus, Trash2, Truck as TruckIcon, Volume2, Loader2, CheckCircle, PackageOpen, IndianRupee, Calendar } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

interface OrderManagementProps {
  currentUser: User;
  orders: Order[];
  trucks: Truck[];
  branches: Branch[];
  onAddOrder: (order: Omit<Order, 'id'>) => void;
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onDeleteOrder: (id: string) => void;
  hideControls?: boolean;
  language?: Language;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ currentUser, orders, trucks, branches, onAddOrder, onUpdateStatus, onDeleteOrder, hideControls, language = 'en' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [activeRoute, setActiveRoute] = useState<Route>('MUM_TO_KOP');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newOrder, setNewOrder] = useState({
    partyName: '', plotNo: '', mobileNo: '', brokerName: '', weight: 0, remark: '', rate: 0, totalAmount: 0,
    paymentStatus: 'Pending' as PaymentStatus, branchId: branches[0]?.id || '', route: 'MUM_TO_KOP' as Route, 
    status: 'Pending' as Order['status'], vehicleAssignedNo: '', bookingDate: new Date().toISOString().split('T')[0]
  });

  const filteredOrders = orders.filter(o => {
    if (currentUser.role === 'Driver') {
      return o.vehicleAssignedNo?.toUpperCase() === currentUser.linkedVehicleNo?.toUpperCase();
    }
    return o.route === activeRoute && o.bookingDate === selectedDate &&
           (o.partyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
            o.vehicleAssignedNo?.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const speakOrder = async (order: Order) => {
    setIsSpeaking(order.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = language === 'mr' 
        ? `लक्ष द्या: ${order.partyName} यांची ऑर्डर. प्लॉट ${order.plotNo}. वजन ${order.weight} टन.`
        : `Dispatch update: Order for ${order.partyName}. Plot ${order.plotNo}. Weight ${order.weight} tons.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: language === 'mr' ? 'Kore' : 'Zephyr' } } },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
        source.onended = () => setIsSpeaking(null);
      }
    } catch (err) { setIsSpeaking(null); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder({ ...newOrder, totalAmount: newOrder.weight * newOrder.rate });
    setIsModalOpen(false);
  };

  if (currentUser.role === 'Driver') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-black text-indigo-600 uppercase tracking-widest">{language === 'mr' ? 'माझे काम' : 'Assigned Jobs'}</h2>
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <PackageOpen className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="text-slate-400 font-black uppercase text-xs">Waiting for office to assign routes...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => (
              <div key={order.id} className={`p-8 rounded-[3rem] border-4 transition-all shadow-xl ${order.status === 'Delivered' ? 'bg-emerald-50 border-emerald-500 opacity-60' : 'bg-white border-indigo-600'}`}>
                <div className="flex justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">{order.partyName}</h3>
                    <p className="text-sm font-bold text-slate-500 mt-1">📍 Plot: {order.plotNo}</p>
                    <p className="text-2xl font-black text-indigo-600 mt-2">{order.weight} Tons</p>
                  </div>
                  <button onClick={() => speakOrder(order)} className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 active:scale-90 transition-all">
                    {isSpeaking === order.id ? <Loader2 className="animate-spin" /> : <Volume2 size={32} />}
                  </button>
                </div>
                {order.status !== 'Delivered' && (
                  <button 
                    onClick={() => {
                      setIsProcessing(order.id);
                      onUpdateStatus(order.id, order.status === 'Pending' ? 'Loaded' : 'Delivered');
                      setTimeout(() => setIsProcessing(null), 1000);
                    }} 
                    className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-2xl active:scale-95 transition-all"
                  >
                    {isProcessing === order.id ? 'Updating Cloud...' : (order.status === 'Pending' ? 'MARK AS LOADED' : 'MARK AS DELIVERED')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button onClick={() => setActiveRoute('MUM_TO_KOP')} className={`px-4 py-2 rounded-lg text-xs font-black tracking-widest ${activeRoute === 'MUM_TO_KOP' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>MUM → KOP</button>
          <button onClick={() => setActiveRoute('KOP_TO_MUM')} className={`px-4 py-2 rounded-lg text-xs font-black tracking-widest ${activeRoute === 'KOP_TO_MUM' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>KOP → MUM</button>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
           <Calendar size={14} className="text-slate-400" />
           <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent border-none text-xs font-bold focus:ring-0 text-slate-600 dark:text-slate-200" />
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input placeholder="Search Party / Truck..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium" />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"><Plus size={16} /> New Booking</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
              <th className="px-8 py-5">Party & Plot</th>
              <th className="px-8 py-5">Assigned Vehicle</th>
              <th className="px-8 py-5">Finance</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredOrders.map(order => (
              <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{order.partyName}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase mt-1">Plot: {order.plotNo} • {order.weight}T</p>
                </td>
                <td className="px-8 py-6">
                  <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg text-indigo-600 font-black text-[10px] uppercase">
                    <TruckIcon size={12} /> {order.vehicleAssignedNo || 'UNASSIGNED'}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">₹{(order.totalAmount || 0).toLocaleString()}</p>
                  <span className={`text-[9px] font-black uppercase ${order.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-rose-500'}`}>{order.paymentStatus}</span>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${
                    order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : order.status === 'Loaded' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => onDeleteOrder(order.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && <div className="py-20 text-center text-slate-300 font-black uppercase text-xs tracking-[0.2em]">No Bookings Found</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-8">Professional <span className="text-indigo-600">Booking</span></h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <input placeholder="Party Name" required className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold border-none" value={newOrder.partyName} onChange={e => setNewOrder({...newOrder, partyName: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Plot No" className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold border-none" value={newOrder.plotNo} onChange={e => setNewOrder({...newOrder, plotNo: e.target.value})} />
                  <input placeholder="Weight (T)" type="number" className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold border-none" value={newOrder.weight} onChange={e => setNewOrder({...newOrder, weight: Number(e.target.value)})} />
                </div>
                <input placeholder="Assign Vehicle" className="w-full bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl p-4 font-black text-indigo-600 uppercase border-none" value={newOrder.vehicleAssignedNo} onChange={e => setNewOrder({...newOrder, vehicleAssignedNo: e.target.value.toUpperCase()})} />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Rate (₹/T)" type="number" className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold border-none" value={newOrder.rate} onChange={e => setNewOrder({...newOrder, rate: Number(e.target.value)})} />
                  <select className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-bold border-none appearance-none" value={newOrder.paymentStatus} onChange={e => setNewOrder({...newOrder, paymentStatus: e.target.value as PaymentStatus})}>
                    <option value="Pending">Payment Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="To-Pay">To-Pay (Unloading)</option>
                  </select>
                </div>
                <textarea placeholder="Special Instructions..." className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 font-medium h-32 border-none" value={newOrder.remark} onChange={e => setNewOrder({...newOrder, remark: e.target.value})} />
              </div>
              <div className="col-span-2 flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-black text-slate-400 uppercase tracking-widest text-xs">Discard</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl uppercase tracking-widest active:scale-95 transition-all">Confirm Manifest</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
