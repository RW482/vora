
import React, { useState } from 'react';
import { Branch, STATIONS } from '../types';
import { Plus, MapPin, Building2, Trash2 } from 'lucide-react';

interface BranchManagementProps {
  branches: Branch[];
  onAddBranch: (branch: Omit<Branch, 'id'>) => void;
}

const BranchManagement: React.FC<BranchManagementProps> = ({ branches, onAddBranch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', location: STATIONS[0] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBranch(newBranch);
    setIsModalOpen(false);
    setNewBranch({ name: '', location: STATIONS[0] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Registered Branches</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100"
        >
          <Plus size={18} /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map(branch => (
          <div key={branch.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div className="flex gap-4">
              <div className="bg-slate-50 p-3 rounded-xl text-slate-400">
                <Building2 size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800">{branch.name}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin size={12} /> {branch.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">New Branch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Branch Name</label>
                <input 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-black"
                  value={newBranch.name}
                  onChange={e => setNewBranch({...newBranch, name: e.target.value})}
                  placeholder="e.g. Pune Regional Office"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Base Location</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-black"
                  value={newBranch.location}
                  onChange={e => setNewBranch({...newBranch, location: e.target.value})}
                >
                  {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-slate-500">Cancel</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg">Save Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
