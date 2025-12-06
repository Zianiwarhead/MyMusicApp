
import React from 'react';

interface SidebarProps {
    onTabChange?: (tab: string) => void;
    activeTab?: string;
    isDarkMode: boolean;
    onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onTabChange, activeTab, isDarkMode, onToggleTheme }) => {
  return (
    <div className="w-64 h-full bg-[#f8f8fa]/90 dark:bg-[#18181b]/90 backdrop-blur-xl flex flex-col border-r border-gray-200 dark:border-white/10 z-20 flex-shrink-0 relative transition-colors duration-300">
      <div className="p-6">
         {/* Logo */}
         <div className="flex items-center gap-2 mb-6 text-rose-500 cursor-pointer select-none">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-lg flex items-center justify-center shadow-lg text-white">
                <i className="fas fa-music text-sm"></i>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Vibe</span>
         </div>

         {/* TOGGLE BUTTON MOVED TO HEADER */}
         <button 
            onClick={onToggleTheme}
            className="w-full mb-6 py-2.5 rounded-xl bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white font-medium text-xs flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-white/20 transition-all shadow-sm"
        >
            <i className={`fas ${isDarkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-indigo-500'}`}></i>
            {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
        </button>
         
         {/* Navigation */}
         <div className="space-y-1">
            <NavItem 
                icon="fa-house" 
                label="Home" 
                active={activeTab === 'All'} 
                onClick={() => onTabChange && onTabChange('All')}
            />
            <NavItem 
                icon="fa-broadcast-tower" 
                label="Radio" 
                active={activeTab === 'Radio'} 
                onClick={() => onTabChange && onTabChange('Radio')}
            />
         </div>
      </div>
      
      <div className="p-6 pt-0 flex-1 overflow-y-auto no-scrollbar">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">Library</h3>
           <div className="space-y-1">
            <NavItem icon="fa-heart" label="Favorites" active={activeTab === 'Favorites'} onClick={() => onTabChange && onTabChange('Favorites')} />
            <NavItem icon="fa-folder" label="Local Files" active={activeTab === 'Local'} onClick={() => onTabChange && onTabChange('Local')} />
         </div>
      </div>
      
      {/* FOOTER REMOVED COMPLETELY */}
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: string, label: string, active?: boolean, onClick?: () => void }) => (
    <div 
        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${active ? 'bg-gray-200/80 dark:bg-white/10 text-rose-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-white/5'}`}
        onClick={onClick}
    >
        <div className="w-5 flex justify-center">
             <i className={`fas ${icon} ${active ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}></i>
        </div>
        <span className={`text-sm font-medium ${active ? 'font-semibold' : ''} truncate`}>{label}</span>
    </div>
);

export default Sidebar;
