
import React, { useState } from 'react';
import { LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out relative ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`p-6 flex items-center justify-between overflow-hidden ${isCollapsed ? 'px-4' : ''}`}>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
              <span className="font-bold text-xl uppercase">S</span>
            </div>
            {!isCollapsed && (
              <span className="font-bold text-slate-800 text-lg whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                Sahyadri Logi
              </span>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all ${
              isCollapsed ? 'absolute -right-3 top-8 bg-white border border-slate-200 shadow-sm z-10' : ''
            }`}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-2 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon size={22} className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-400'} shrink-0`} />
                {!isCollapsed && (
                  <span className={`font-medium whitespace-nowrap animate-in fade-in duration-300 ${isActive ? 'text-indigo-600' : ''}`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info (only if expanded) */}
        {!isCollapsed && (
          <div className="p-6 border-t border-slate-50">
            <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-xl shadow-indigo-100">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Status</p>
              <p className="text-sm font-bold">System Online</p>
              <div className="mt-3 w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-white" />
              </div>
            </div>
          </div>
        )}
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
                {item.label.slice(0, 5)}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
