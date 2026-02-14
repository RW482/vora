
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItem: string;
  onSelect: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, activeItem, onSelect }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-full transition-all">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <span className="font-bold text-xl">S</span>
          </div>
          <span className="font-bold text-slate-800 text-lg">Sahyadri Logi</span>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon size={22} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                <span className={`font-medium ${isActive ? 'text-indigo-600' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around p-2 shadow-2xl">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {item.id.slice(0, 5)}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
