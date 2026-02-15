
import React, { useState } from 'react';
import { User, Lock, User as UserIcon, ShieldCheck, CloudRain, Smartphone } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  onSync: (code: string) => void;
  error?: string;
  isSyncing?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSync, error, isSyncing }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSync, setShowSync] = useState(false);
  const [syncKey, setSyncKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-[3rem] w-full max-w-md shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">VORA <span className="text-indigo-400">LOGISTICS</span></h1>
          <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-widest">Mumbai • Kolhapur</p>
        </div>

        {!showSync ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase ml-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="admin or driver name"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/20 border border-rose-500/50 p-4 rounded-xl text-rose-200 text-xs font-bold">
                {error}
              </div>
            )}

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95 uppercase tracking-widest">
              Login to System
            </button>

            <button 
              type="button" 
              onClick={() => setShowSync(true)}
              className="w-full flex items-center justify-center gap-2 py-4 text-slate-400 text-xs font-bold hover:text-indigo-400 transition-colors"
            >
              <CloudRain size={16} /> Connect to Remote Office
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             <div className="bg-indigo-500/10 p-6 rounded-2xl border border-indigo-500/20">
                <div className="flex items-center gap-3 text-indigo-400 mb-2">
                   <Smartphone size={20} />
                   <h3 className="font-bold text-sm">Remote Phone Setup</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  Enter the 6-digit Sync Key provided by your office admin to download account data to this phone.
                </p>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 uppercase ml-1 tracking-widest">Office Sync Key</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-center text-xl font-black tracking-[0.5em] placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                  placeholder="VOR-XXX"
                  value={syncKey}
                  onChange={e => setSyncKey(e.target.value)}
                />
             </div>

             <button 
               onClick={() => onSync(syncKey)}
               disabled={isSyncing || syncKey.length < 5}
               className="w-full bg-indigo-600 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all"
             >
               {isSyncing ? 'Syncing...' : 'Link this Device'}
             </button>

             <button 
              onClick={() => setShowSync(false)}
              className="w-full py-2 text-slate-500 text-xs font-bold"
             >
               Back to Login
             </button>
          </div>
        )}

        <p className="text-center text-slate-600 text-[10px] mt-8 uppercase font-bold tracking-widest">
          VORA TRANSPORT v3.0 • Premium Logistics
        </p>
      </div>
    </div>
  );
};

export default Login;
