
import React, { useState } from 'react';
import { LucideIcon, ChevronLeft, ChevronRight, Sun, Moon, Languages } from 'lucide-react';
import { Language } from '../types';

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
  language: Language;
  toggleLanguage: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, activeItem, onSelect, isDarkMode, toggleTheme, language, toggleLanguage }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <aside className={`hidden md:flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-500 relative ${isCollapsed ? 'w-24' : 'w-72'}`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
              <span className="font-extrabold text-2xl tracking-tighter">V</span>
            </div>
            {!isCollapsed && <span className="font-black text-slate-900 dark:text-slate-100 text-lg leading-none tracking-tight">VORA</span>}
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 text-slate-300 hover:text-indigo-600">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button key={item.id} onClick={() => onSelect(item.id)} className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'} ${isCollapsed ? 'justify-center px-0' : ''}`}>
                <Icon size={22} className={isActive ? 'text-white' : 'text-slate-400'} />
                {!isCollapsed && <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="px-6 space-y-3 pb-6">
            <button onClick={toggleLanguage} className="w-full flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase tracking-widest">
              <span>{language === 'en' ? 'English' : 'मराठी'}</span>
              <Languages size={18} />
            </button>
            <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-widest">
              <span>{isDarkMode ? 'Dark' : 'Light'}</span>
              {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        )}
      </aside>

      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 z-50 flex justify-around p-3 rounded-[2rem] shadow-2xl">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button key={item.id} onClick={() => onSelect(item.id)} className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <Icon size={22} />
            </button>
          );
        })}
        <button onClick={toggleLanguage} className="p-3 text-emerald-600 font-black text-[10px]">{language === 'en' ? 'EN' : 'मरा'}</button>
      </nav>
    </>
  );
};

export default Sidebar;
