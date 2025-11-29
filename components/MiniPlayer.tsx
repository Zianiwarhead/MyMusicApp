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
      className="w-[90%] h-16 glass rounded-2xl mb-4 flex items-center px-3 shadow-lg pointer-events-auto cursor-pointer border border-white/40 hover:scale-[1.02] transition-transform duration-300"
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden relative shadow-inner">
        <img 
          src={song.artUrl} 
          className={`w-full h-full object-cover ${isPlaying ? 'spinning' : 'spinning paused-spin'}`} 
          alt="Album Art"
          style={{ animationDuration: '8s' }}
        />
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 truncate">{song.title}</h4>
        <p className="text-xs text-gray-500 truncate">{song.artist}</p>
      </div>
      <div className="flex gap-3 pr-2 items-center">
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-gray-900 text-lg`}></i>
        </button>
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <i className="fas fa-forward text-gray-400 hover:text-gray-600 transition-colors"></i>
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;