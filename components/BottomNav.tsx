
import React from 'react';

interface BottomNavProps {
    onTabChange: (tab: string) => void;
    activeTab: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ onTabChange, activeTab }) => {
  return (
    <div className="h-16 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 flex items-center justify-around px-2 pb-safe transition-colors duration-300">
      <div 
        className={`flex flex-col items-center justify-center w-full h-full cursor-pointer ${activeTab === 'All' ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        onClick={() => onTabChange('All')}
      >
        <i className="fas fa-compass text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Discover</span>
      </div>
      
      <div 
        className={`flex flex-col items-center justify-center w-full h-full cursor-pointer ${activeTab === 'Radio' ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        onClick={() => onTabChange('Radio')}
      >
        <i className="fas fa-broadcast-tower text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Radio</span>
      </div>

      <div 
        className={`flex flex-col items-center justify-center w-full h-full cursor-pointer ${activeTab === 'Favorites' ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        onClick={() => onTabChange('Favorites')}
      >
        <i className="fas fa-heart text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Favorites</span>
      </div>

      <div 
        className={`flex flex-col items-center justify-center w-full h-full cursor-pointer ${activeTab === 'Local' ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
        onClick={() => onTabChange('Local')}
      >
        <i className="fas fa-folder text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Library</span>
      </div>
    </div>
  );
};

export default BottomNav;
