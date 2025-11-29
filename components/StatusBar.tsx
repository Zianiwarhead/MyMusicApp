import React from 'react';

const StatusBar: React.FC = () => {
  return (
    <div className="absolute top-0 w-full h-12 flex justify-between items-center px-6 z-50 text-black font-semibold text-sm select-none pointer-events-none">
      <span>9:41</span>
      <div className="flex gap-2 items-center">
        <i className="fas fa-signal"></i>
        <i className="fas fa-wifi"></i>
        <i className="fas fa-battery-full"></i>
      </div>
    </div>
  );
};

export default StatusBar;