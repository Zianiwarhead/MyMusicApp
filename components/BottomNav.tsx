
import React from 'react';

const BottomNav: React.FC = () => {
  return (
    <div className="h-16 bg-white/90 backdrop-blur-xl border-t border-gray-200 flex items-center justify-around px-2 pb-safe">
      <div className="flex flex-col items-center justify-center w-full h-full text-rose-500 cursor-pointer">
        <i className="fas fa-compass text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Discover</span>
      </div>
      <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 cursor-pointer hover:text-gray-600">
        <i className="fas fa-search text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Search</span>
      </div>
      <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 cursor-pointer hover:text-gray-600">
        <i className="fas fa-book text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Library</span>
      </div>
      <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 cursor-pointer hover:text-gray-600">
        <i className="fas fa-user-group text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Friends</span>
      </div>
    </div>
  );
};

export default BottomNav;
