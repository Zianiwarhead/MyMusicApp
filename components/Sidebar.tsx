import React from 'react';

interface SidebarProps {
    onToggleTheme?: () => void;
    isDarkMode?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggleTheme, isDarkMode }) => {
  return (
    <div className="w-64 h-full bg-[#f8f8fa]/90 dark:bg-[#18181b]/95 backdrop-blur-xl flex flex-col border-r border-gray-200 dark:border-white/5 transition-colors duration-300 z-40">
      
      {/* Header */}
      <div className="p-6 flex-shrink-0">
         <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-2 text-rose-500 cursor-pointer select-none">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-lg flex items-center justify-center shadow-lg text-white">
                    <i className="fas fa-music text-sm"></i>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Vibe</span>
             </div>
             
             {/* Theme Toggle - Visible Here */}
             <button 
                onClick={onToggleTheme}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white flex items-center justify-center hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                <i className={`fas ${isDarkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-indigo-500'}`}></i>
            </button>
         </div>
         
         <div className="space-y-1">
            <NavItem icon="fa-house" label="Home" active />
            <NavItem icon="fa-compass" label="Discover" />
            <NavItem icon="fa-broadcast-tower" label="Radio" />
         </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 min-h-0 pb-32">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Library</h3>
           <div className="space-y-1">
            <NavItem icon="fa-clock" label="Recent" />
            <NavItem icon="fa-heart" label="Favorites" />
            <NavItem icon="fa-folder" label="Local Files" />
            <NavItem icon="fa-gear" label="Settings" />
         </div>
      </div>
      
      {/* Footer Removed - No more covered button */}
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: string, label: string, active?: boolean }) => (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${active ? 'bg-gray-200/80 dark:bg-white/10 text-rose-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
        <div className="w-5 flex justify-center">
             <i className={`fas ${icon} ${active ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}></i>
        </div>
        <span className="text-sm font-medium truncate">{label}</span>
    </div>
);

export default Sidebar;