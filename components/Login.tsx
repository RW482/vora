
import React, { useState } from 'react';
import { Lock, User as UserIcon, ShieldCheck, Loader2, Info } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login: React.FC = () => {
  const [username, setUsername] = useState(''); // We use this as email or part of email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // To maintain existing "admin" login feel, we auto-append a domain if not present
    const email = username.includes('@') ? username : `${username}@vora.com`;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setError(err.code === 'auth/user-not-found' ? 'User not registered in Firebase.' : 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[3rem] w-full max-w-md shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">VORA <span className="text-indigo-400">CLOUD</span></h1>
          <p className="text-slate-400 text-[10px] mt-2 font-black uppercase tracking-[0.2em]">Mumbai • Kolhapur Corridor</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Login ID</label>
            <div className="relative">
              <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-14 py-4 text-white placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold"
                placeholder="admin or driver_name"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">Secure Key</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password"
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-14 py-4 text-white placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-xs font-bold text-center animate-shake">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-3xl font-black shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Sync with Office Cloud'}
          </button>
        </form>

        <div className="mt-8 flex items-start gap-3 bg-indigo-500/5 p-4 rounded-2xl border border-white/5">
           <Info className="text-indigo-400 shrink-0" size={14} />
           <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
             Authorized personnel only. For cloud setup instructions, contact the <strong>Mumbai Dispatch Office</strong>.
           </p>
        </div>

        <p className="text-center text-slate-700 text-[9px] mt-10 uppercase font-black tracking-[0.3em]">
          Powered by Firebase Realtime • Enterprise 3.1
        </p>
      </div>
    </div>
  );
};

export default Login;
