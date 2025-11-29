import React from 'react';

const BottomNav: React.FC = () => {
  return (
    <div className="h-16 glass rounded-full flex items-center justify-between px-8 shadow-2xl pointer-events-auto w-[85%] border border-white/40">
      <div className="flex flex-col items-center text-black cursor-pointer group">
        <i className="fas fa-house text-xl mb-1 group-active:scale-90 transition-transform"></i>
        <span className="text-[10px] font-bold">Home</span>
      </div>
      <div className="flex flex-col items-center text-gray-400 cursor-pointer group hover:text-gray-600 transition-colors">
        <i className="fas fa-music text-xl mb-1 group-active:scale-90 transition-transform"></i>
      </div>
      <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center -mt-6 cursor-pointer hover:bg-gray-50 active:scale-95 transition-all">
        <i className="fas fa-search text-lg text-gray-800"></i>
      </div>
    </div>
  );
};

export default BottomNav;