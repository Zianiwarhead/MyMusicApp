import React from 'react';
import { Song } from '../types';

interface MiniPlayerProps {
  song: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClick: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ song, isPlaying, onTogglePlay, onClick }) => {
  if (!song) return null;

  return (
    <div 
      className="w-full max-w-md h-14 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center px-3 border border-white/50 dark:border-white/10 cursor-pointer overflow-hidden mb-2"
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden relative flex-shrink-0">
        <img 
          src={song.artUrl} 
          className={`w-full h-full object-cover ${isPlaying ? 'spinning' : 'spinning paused-spin'}`} 
          alt="Art"
          style={{ animationDuration: '8s' }}
        />
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{song.title}</h4>
        <p className="text-xs text-rose-500 truncate">{song.artist}</p>
      </div>
      <div className="flex gap-2 pr-1 items-center">
        <button 
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play pl-0.5'} text-gray-900 dark:text-white text-lg`}></i>
        </button>
        <button 
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <i className="fas fa-forward text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"></i>
        </button>
      </div>
      
      {/* Progress Bar (Visual Only for Mini) */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-rose-500 opacity-50 w-full" style={{ width: '45%' }}></div>
    </div>
  );
};

export default MiniPlayer;