
import React, { useState } from 'react';
import { LucideIcon, ChevronLeft, ChevronRight, Circle, Sun, Moon } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItem: string;
  onSelect: (id: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, activeItem, onSelect, isDarkMode, toggleTheme }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-500 ease-in-out relative ${
          isCollapsed ? 'w-24' : 'w-72'
        }`}
      >
        <div className={`p-8 flex items-center justify-between overflow-hidden ${isCollapsed ? 'px-6' : ''}`}>
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 dark:shadow-none shrink-0 rotate-3 group hover:rotate-0 transition-transform cursor-pointer">
              <span className="font-extrabold text-2xl tracking-tighter">V</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="font-black text-slate-900 dark:text-slate-100 text-lg leading-none tracking-tight">VORA</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">Transport</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-300 hover:text-indigo-600 transition-all ${
              isCollapsed ? 'absolute -right-4 top-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md z-10' : ''
            }`}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 px-6 mt-6 space-y-1.5 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon size={22} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} shrink-0 transition-colors`} />
                {!isCollapsed && (
                  <span className={`font-semibold text-sm whitespace-nowrap animate-in fade-in duration-500 ${isActive ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Health Card */}
        {!isCollapsed && (
          <div className="px-6 space-y-4 pb-6">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
            >
              <span className="text-xs font-bold uppercase tracking-widest">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
                {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
              </div>
            </button>

            <div className="bg-slate-900 dark:bg-indigo-600/10 rounded-[2rem] p-6 text-white relative overflow-hidden group shadow-2xl dark:shadow-none border border-transparent dark:border-indigo-500/20">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/40 transition-all" />
              <div className="flex items-center gap-2 mb-4">
                <Circle size={8} fill="#10b981" className="text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Network</span>
              </div>
              <p className="text-xs font-medium text-slate-300 mb-1">Active Deliveries</p>
              <p className="text-2xl font-bold tracking-tight">24 <span className="text-slate-500 text-sm font-normal">Units</span></p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation - Enhanced */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 z-50 flex justify-around p-3 rounded-[2rem] shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
                isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Icon size={22} />
              {isActive && <span className="text-[9px] font-black uppercase tracking-tighter">
                {item.label}
              </span>}
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
