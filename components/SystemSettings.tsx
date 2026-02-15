
import React, { useRef, useState } from 'react';
import { Download, Upload, Database, FileJson, CloudRain, Loader2, CheckCircle, Copy, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SystemSettingsProps {
  data: any;
  onRestore: (data: any) => void;
  syncCode: string;
  onSetSyncCode: (code: string) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ data, onRestore, syncCode, onSetSyncCode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateSyncKey = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      // npoint.io requires the /bins endpoint for creation
      // The body MUST be wrapped in "contents" for reliable parsing
      const response = await fetch('https://api.npoint.io/bins', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contents: data })
      });
      
      if (!response.ok) {
        throw new Error(`Cloud Error: ${response.status}`);
      }
      
      const result = await response.json();
      // npoint returns binId in different fields depending on version
      const binId = result.binId || result.id;
      
      if (binId) {
        onSetSyncCode(`VOR-${binId}`);
      } else {
        throw new Error("Cloud failed to provide an ID.");
      }
    } catch (err: any) {
      console.error('Sync Error:', err);
      setErrorMsg("Failed to reach Cloud. Check your internet and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!syncCode) return;
    navigator.clipboard.writeText(syncCode);
    alert('Key copied!');
  };

  const shareViaWhatsApp = () => {
    const text = `VORA TRANSPORT OFFICE LINK\nKey: *${syncCode}*\n\nLogin Instructions:\n1. Open Vora App\n2. Click "Connect to Remote Office"\n3. Enter Key.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `Vora_Backup.json`);
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
                  <h2 className="text-3xl font-black tracking-tight">Cloud <span className="opacity-60">Sync Hub</span></h2>
               </div>
               <p className="text-indigo-100/70 text-sm font-medium leading-relaxed max-w-lg">
                  Link your office computer to driver phones. 
                  Generate a key once, and all devices will share the same live bookings.
               </p>

               {errorMsg && (
                 <div className="mt-6 flex items-center gap-3 p-4 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-100 text-xs font-bold animate-pulse">
                    <AlertCircle size={18} />
                    {errorMsg}
                 </div>
               )}
            </div>

            <div className="w-full lg:w-96 bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-inner">
               <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3 block text-center">Your Sync Key</label>
               <div className="bg-black/20 rounded-2xl py-6 text-center text-2xl font-black tracking-widest border border-white/5 flex items-center justify-center gap-4 mb-6">
                  {syncCode || '---'}
                  {syncCode && (
                    <button onClick={copyToClipboard} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                      <Copy size={16} />
                    </button>
                  )}
               </div>

               <div className="space-y-3">
                  <button 
                    onClick={generateSyncKey}
                    disabled={isGenerating}
                    className="w-full bg-white text-indigo-700 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : (syncCode ? <RefreshCw size={18} /> : null)}
                    {isGenerating ? 'Connecting...' : (syncCode ? 'Update Key' : 'Create Sync Key')}
                  </button>

                  {syncCode && (
                    <button 
                      onClick={shareViaWhatsApp}
                      className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                    >
                      <MessageCircle size={18} /> Send to Drivers
                    </button>
                  )}
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm group hover:border-indigo-500 transition-colors">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white mb-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <Database size={24} />
            </div>
            <h3 className="font-black uppercase tracking-widest text-xs">Offline Backup</h3>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
            Download your data locally. Good for moving data manually or keeping safe copies.
          </p>
          <button onClick={handleExport} className="w-full bg-slate-900 text-white dark:bg-slate-800 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
            <FileJson size={18} /> Download JSON
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm group hover:border-amber-500 transition-colors">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Upload size={24} />
            </div>
            <h3 className="font-black uppercase tracking-widest text-xs">Restore</h3>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
            Upload a previously saved .json file to overwrite current data on this phone.
          </p>
          <input type="file" ref={fileInputRef} onChange={(e) => {
             const file = e.target.files?.[0];
             if(!file) return;
             const reader = new FileReader();
             reader.onload = (re) => {
               try {
                  const parsed = JSON.parse(re.target?.result as string);
                  onRestore(parsed);
                  alert('Data restored!');
               } catch(err) { alert('Invalid file.'); }
             };
             reader.readAsText(file);
          }} className="hidden" accept=".json" />
          <button onClick={() => fileInputRef.current?.click()} className="w-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-3">
            <Upload size={18} /> Upload JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
