
import React, { useState } from 'react';
import { Order, Truck, Branch, Route, User, Language } from '../types';
import { Search, Plus, Trash2, Truck as TruckIcon, Volume2, Loader2, CheckCircle, PackageOpen } from 'lucide-react';
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
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newOrder, setNewOrder] = useState({
    partyName: '', plotNo: '', mobileNo: '', brokerName: '', weight: 0, remark: '', rate: 0,
    branchId: branches[0]?.id || '', route: 'MUM_TO_KOP' as Route, status: 'Pending' as Order['status'],
    vehicleAssignedNo: '', bookingDate: new Date().toISOString().split('T')[0]
  });

  const filteredOrders = orders.filter(o => {
    if (currentUser.role === 'Driver') {
      return o.vehicleAssignedNo?.toUpperCase() === currentUser.linkedVehicleNo?.toUpperCase();
    }
    return o.route === activeRoute && o.bookingDate === selectedDate &&
           (selectedBranchId === 'all' || o.branchId === selectedBranchId) &&
           (o.partyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
            o.vehicleAssignedNo?.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const speakOrder = async (order: Order) => {
    setIsSpeaking(order.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = language === 'mr' 
        ? `मराठीत बोला: ${order.partyName} यांची ऑर्डर, वजन ${order.weight} टन. पत्ता प्लॉट नंबर ${order.plotNo}.`
        : `Say clearly: Order for ${order.partyName}, weight ${order.weight} tons. Destination Plot number ${order.plotNo}.`;

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
    } catch (err) {
      console.error(err);
      setIsSpeaking(null);
    }
  };

  const handleStatusToggle = (order: Order) => {
    setIsProcessing(order.id);
    const nextStatus: Order['status'] = order.status === 'Pending' ? 'Loaded' : 
                                       order.status === 'Loaded' ? 'Delivered' : 'Pending';
    onUpdateStatus(order.id, nextStatus);
    
    // Simulate processing time for UX feedback
    setTimeout(() => setIsProcessing(null), 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder(newOrder);
    setIsModalOpen(false);
    setNewOrder({
      partyName: '', plotNo: '', mobileNo: '', brokerName: '', weight: 0, remark: '', rate: 0,
      branchId: branches[0]?.id || '', route: activeRoute, status: 'Pending',
      vehicleAssignedNo: '', bookingDate: new Date().toISOString().split('T')[0]
    });
  };

  if (currentUser.role === 'Driver') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-indigo-600 uppercase tracking-widest">{language === 'mr' ? 'माझ्या ऑर्डर्स' : 'My Orders'}</h2>
          <div className="bg-white px-4 py-1 rounded-full text-[10px] font-black border border-slate-200">{currentUser.linkedVehicleNo}</div>
        </div>
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
            <PackageOpen className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="text-slate-400 font-black uppercase text-xs">{language === 'mr' ? 'अजून एकही ऑर्डर नाही' : 'No jobs assigned yet'}</p>
            <p className="text-slate-300 text-[10px] font-bold mt-2 uppercase">Office is checking for routes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.map(order => (
              <div key={order.id} className={`p-8 rounded-[3rem] border-4 transition-all shadow-xl ${
                order.status === 'Delivered' ? 'bg-emerald-50 border-emerald-500 opacity-60 scale-95' : 'bg-white border-indigo-600'
              }`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">{order.partyName}</h3>
                    <p className="text-lg font-bold text-slate-500">{language === 'mr' ? 'वजन' : 'Weight'}: <span className="text-indigo-600">{order.weight}T</span></p>
                    <p className="text-sm font-bold text-slate-400 mt-2">📍 {order.plotNo}</p>
                  </div>
                  <button onClick={() => speakOrder(order)} disabled={!!isSpeaking} className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 active:scale-90 transition-all shadow-md">
                    {isSpeaking === order.id ? <Loader2 className="animate-spin" /> : <Volume2 size={32} />}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-6 rounded-3xl flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{language === 'mr' ? 'सध्याची स्थिती' : 'Current Status'}</p>
                      <span className={`px-6 py-2 rounded-full font-black text-xs uppercase ${
                        order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                        order.status === 'Loaded' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {language === 'mr' ? (order.status === 'Pending' ? 'बाकी' : order.status === 'Loaded' ? 'भरलेले' : 'पोहोचले') : order.status}
                      </span>
                    </div>
                    {isProcessing === order.id && <Loader2 className="animate-spin text-indigo-600" size={24} />}
                  </div>

                  {order.status !== 'Delivered' && (
                    <button 
                      onClick={() => handleStatusToggle(order)} 
                      disabled={!!isProcessing}
                      className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isProcessing === order.id ? 'Syncing...' : (order.status === 'Pending' ? (language === 'mr' ? 'गाडी भरली (Loaded)' : 'Mark as Loaded') : (language === 'mr' ? 'माल पोहोचला (Delivered)' : 'Mark as Delivered'))}
                    </button>
                  )}
                  {order.status === 'Delivered' && (
                    <div className="flex items-center justify-center gap-3 text-emerald-600 font-black text-xl uppercase py-4">
                      <CheckCircle size={32} /> {language === 'mr' ? 'काम पूर्ण झाले' : 'Job Done'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hideControls && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setActiveRoute('MUM_TO_KOP')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeRoute === 'MUM_TO_KOP' ? 'bg-white text-indigo-600' : 'text-slate-500'}`}>MUM → KOP</button>
              <button onClick={() => setActiveRoute('KOP_TO_MUM')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeRoute === 'KOP_TO_MUM' ? 'bg-white text-indigo-600' : 'text-slate-500'}`}>KOP → MUM</button>
            </div>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold border-none" />
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input placeholder="Search Party..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs border-none" />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:bg-indigo-700 transition-colors"><Plus size={14} /> New Order</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
              <th className="px-6 py-5">Details</th>
              <th className="px-6 py-5">Vehicle</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{order.partyName}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black">{order.weight}T • Plot {order.plotNo}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-xl w-fit">
                    <TruckIcon size={14} /> {order.vehicleAssignedNo || 'PENDING'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleStatusToggle(order)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                    order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : order.status === 'Loaded' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {order.status}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onDeleteOrder(order.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
            No orders found for this selection
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl p-8 md:p-12 shadow-2xl border border-transparent dark:border-slate-800">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-8 tracking-tight">Create <span className="text-indigo-600">Booking</span></h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <input placeholder="Party Name" required className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white" value={newOrder.partyName} onChange={e => setNewOrder({...newOrder, partyName: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Plot No" className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white" value={newOrder.plotNo} onChange={e => setNewOrder({...newOrder, plotNo: e.target.value})} />
                    <input placeholder="Weight (T)" type="number" step="0.1" className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white" value={newOrder.weight} onChange={e => setNewOrder({...newOrder, weight: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-5">
                  <input placeholder="Assign Vehicle" className="w-full bg-indigo-50 dark:bg-indigo-900/40 border-none rounded-2xl px-5 py-4 font-black placeholder:text-indigo-200 text-indigo-700 dark:text-indigo-300 uppercase" value={newOrder.vehicleAssignedNo} onChange={e => setNewOrder({...newOrder, vehicleAssignedNo: e.target.value})} />
                  <textarea placeholder="Remarks..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 font-bold h-24 text-slate-900 dark:text-white" value={newOrder.remark} onChange={e => setNewOrder({...newOrder, remark: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-black text-slate-400 uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-xl uppercase tracking-widest active:scale-95 transition-all">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
