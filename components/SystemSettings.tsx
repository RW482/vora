
import React, { useRef } from 'react';
import { Download, Upload, Database, FileJson, CloudRain, CheckCircle, Info } from 'lucide-react';

interface SystemSettingsProps {
  data: any;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ data }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `Vora_Backup_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-indigo-600 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
         
         <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                     <CloudRain size={32} />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">Cloud <span className="opacity-60">Status</span></h2>
               </div>
               <p className="text-indigo-100/70 text-sm font-medium leading-relaxed max-w-lg">
                  VORA TRANSPORT is now fully synchronized with Google Firebase Cloud. All branches, fleets, and daily manifests are live across all authorized devices.
               </p>

               <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Auth Service: Online</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Firestore: Linked</span>
                  </div>
               </div>
            </div>

            <div className="w-full lg:w-96 bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-inner flex flex-col items-center justify-center text-center">
               <Database size={48} className="text-indigo-200 mb-4 opacity-40" />
               <h4 className="font-black text-lg mb-2">Enterprise Storage</h4>
               <p className="text-xs text-indigo-100/60 mb-6">Real-time persistence for Mumbai-Kolhapur Corridor data.</p>
               <div className="w-full bg-indigo-500/20 p-4 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest">
                  Active Region: vora-transport
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm group hover:border-indigo-500 transition-colors">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white mb-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <FileJson size={24} />
            </div>
            <h3 className="font-black uppercase tracking-widest text-xs">Snapshot Export</h3>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
            While data is securely stored in Firebase, you can download a local JSON snapshot for audit purposes or legacy reporting.
          </p>
          <button onClick={handleExport} className="w-full bg-slate-900 text-white dark:bg-slate-800 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
            <Download size={18} /> Generate Manifest Audit Log (JSON)
          </button>
        </div>
      </div>
      
      <div className="bg-indigo-50 dark:bg-slate-800/50 p-6 rounded-3xl flex items-start gap-4 border border-indigo-100 dark:border-slate-700">
        <Info className="text-indigo-600 dark:text-indigo-400 shrink-0" size={20} />
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          <strong>Security Note:</strong> User management and branch configurations are governed by Firebase Security Rules. Only authenticated Admins can perform destructive operations. All changes are logged to the cloud audit trail.
        </p>
      </div>
    </div>
  );
};

export default SystemSettings;
