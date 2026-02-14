
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Plus, Users, UserCog, Key, Trash2, Truck } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onDeleteUser: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'Staff' as UserRole,
    fullName: '',
    linkedVehicleNo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser(newUser);
    setIsModalOpen(false);
    setNewUser({ username: '', password: '', role: 'Staff', fullName: '', linkedVehicleNo: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">User Access Control</h2>
          <p className="text-slate-500 text-xs font-medium">Manage system users and drivers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100"
        >
          <Plus size={18} /> Add New User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative group overflow-hidden">
             <div className={`absolute top-0 right-0 p-3 ${user.role === 'Admin' ? 'text-indigo-600' : 'text-slate-300'}`}>
                <UserCog size={20} />
             </div>
             
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <Users size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-slate-800">{user.fullName}</h3>
                   <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                     user.role === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 
                     user.role === 'Driver' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                   }`}>
                     {user.role}
                   </span>
                </div>
             </div>

             <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Username</span>
                  <span className="font-bold text-slate-700">{user.username}</span>
                </div>
                {user.role === 'Driver' && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Linked Truck</span>
                    <span className="font-bold text-indigo-600">{user.linkedVehicleNo || 'Not Assigned'}</span>
                  </div>
                )}
             </div>

             <button 
              onClick={() => onDeleteUser(user.id)}
              disabled={user.username === 'admin'}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-500 bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all disabled:hidden"
             >
                <Trash2 size={14} /> Remove Access
             </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Access</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                  <input required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-black font-medium" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Username</label>
                  <input required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-black font-medium" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Initial Password</label>
                  <input type="password" required className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-black font-medium" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Role</label>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-black font-medium"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                  >
                    <option value="Staff">Operations Staff</option>
                    <option value="Driver">Truck Driver</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
                {newUser.role === 'Driver' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                      <Truck size={12}/> Linked Vehicle No.
                    </label>
                    <input required className="w-full bg-amber-50 border-none rounded-xl px-4 py-3 text-amber-900 font-bold placeholder:text-amber-300" placeholder="e.g. MH-09-CQ-1234" value={newUser.linkedVehicleNo} onChange={e => setNewUser({...newUser, linkedVehicleNo: e.target.value})} />
                  </div>
                )}
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-slate-500">Cancel</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
