
import React, { useRef, useState } from 'react';
import { Download, Upload, Database, FileJson, CloudRain, Loader2, CheckCircle } from 'lucide-react';

interface SystemSettingsProps {
  data: any;
  onRestore: (data: any) => void;
  syncCode: string;
  onSetSyncCode: (code: string) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ data, onRestore, syncCode, onSetSyncCode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSyncKey = async () => {
    setIsGenerating(true);
    try {
      // npoint POST to / generates a new bin ID
      const response = await fetch('https://api.npoint.io/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to create cloud bin');
      
      const result = await response.json();
      if (result.id) {
        onSetSyncCode(`VOR-${result.id}`);
        alert('Cloud Office Link Created! Share this key with your drivers.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating sync key. Please check your internet connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `vora_backup_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Cloud Sync Section */}
      <div className="bg-indigo-600 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000" />
         
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md text-white">
                  <CloudRain size={32} />
               </div>
               <div>
                  <h2 className="text-3xl font-black tracking-tight">Cloud <span className="opacity-60">Sync Hub</span></h2>
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">Remote Device Synchronization</p>
               </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 max-w-xl">
               <p className="text-sm font-medium mb-6 opacity-80 leading-relaxed">
                  To sync with a driver's phone, generate an Office Sync Key. Drivers enter this on their login screen to automatically download all users and orders.
               </p>
               
               <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 w-full">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Your Office Key</label>
                     <div className="bg-black/20 rounded-2xl py-5 text-center text-xl md:text-2xl font-black tracking-widest border border-white/10">
                        {syncCode || '---'}
                     </div>
                  </div>
                  <button 
                    onClick={generateSyncKey}
                    disabled={isGenerating}
                    className="w-full md:w-auto bg-white text-indigo-600 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : (syncCode ? 'Regenerate' : 'Create Sync Key')}
                  </button>
               </div>
               {syncCode && (
                 <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                   <CheckCircle size={14} />
                   <span>Cloud Bin is Active. Share the key above.</span>
                 </div>
               )}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Backup Section */}
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white mb-2">
              <Database size={24} />
              <h3 className="font-black uppercase tracking-widest text-xs">Offline Backup</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
              Download your database to a local file. Good for moving data manually or keeping safe copies.
            </p>
            <button 
              onClick={handleExport}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 py-4 rounded-2xl font-bold text-xs shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-3"
            >
              <FileJson size={18} /> Download Local JSON
            </button>
          </div>

          {/* Manual Import Section */}
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-2">
              <Upload size={24} />
              <h3 className="font-black uppercase tracking-widest text-xs">Manual Restore</h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
              Upload a previously saved .json file to overwrite current data on this specific phone.
            </p>
            <input type="file" ref={fileInputRef} onChange={(e) => {
               const file = e.target.files?.[0];
               if(!file) return;
               const reader = new FileReader();
               reader.onload = (re) => {
                 try {
                    const parsed = JSON.parse(re.target?.result as string);
                    onRestore(parsed);
                    alert('Data restored from file!');
                 } catch(err) {
                    alert('Invalid file format.');
                 }
               };
               reader.readAsText(file);
            }} className="hidden" accept=".json" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 py-4 rounded-2xl font-bold text-xs shadow-sm ring-1 ring-amber-200 dark:ring-amber-900/50 hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-3"
            >
              <Upload size={18} /> Select Backup File
            </button>
          </div>
      </div>
    </div>
  );
};

export default SystemSettings;
