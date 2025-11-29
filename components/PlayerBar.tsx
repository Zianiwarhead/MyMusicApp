import React from 'react';
import { Song } from '../types';

interface PlayerBarProps {
  song: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  progress: number;
  onOpenFullPlayer: () => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ song, isPlaying, onTogglePlay, progress, onOpenFullPlayer }) => {
  return (
    <div className="h-24 bg-white/80 backdrop-blur-xl border-t border-gray-200 flex items-center px-6 justify-between z-50 flex-shrink-0 select-none">
        
        {/* Left: Song Info */}
        <div className="flex items-center w-1/3 gap-4 min-w-0 pr-4">
            {song ? (
                <>
                    <div 
                        className="w-14 h-14 rounded-md shadow-md overflow-hidden cursor-pointer group relative flex-shrink-0 bg-gray-100"
                        onClick={onOpenFullPlayer}
                    >
                         <img src={song.artUrl} className="w-full h-full object-cover" alt="Art" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <i className="fas fa-expand text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100 shadow-sm"></i>
                         </div>
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate hover:underline cursor-pointer" onClick={onOpenFullPlayer}>{song.title}</h4>
                        <p className="text-xs text-gray-500 truncate hover:underline cursor-pointer">{song.artist}</p>
                    </div>
                    <button className="text-gray-400 hover:text-rose-500 transition-colors ml-2 flex-shrink-0">
                         <i className="far fa-heart"></i>
                    </button>
                </>
            ) : (
                <div className="flex items-center gap-4 opacity-50">
                    <div className="w-14 h-14 rounded-md bg-gray-200"></div>
                    <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
            )}
        </div>

        {/* Center: Controls */}
        <div className="flex flex-col items-center w-1/3 max-w-[600px]">
             <div className="flex items-center gap-6 mb-1">
                <button className="text-gray-400 hover:text-gray-600 transition-colors"><i className="fas fa-shuffle"></i></button>
                <button className="text-gray-800 hover:text-black text-xl transition-colors"><i className="fas fa-backward-step"></i></button>
                <button 
                    className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                    onClick={onTogglePlay}
                    disabled={!song}
                >
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play pl-0.5'} text-sm`}></i>
                </button>
                <button className="text-gray-800 hover:text-black text-xl transition-colors"><i className="fas fa-forward-step"></i></button>
                <button className="text-gray-400 hover:text-gray-600 transition-colors"><i className="fas fa-repeat"></i></button>
             </div>
             <div className="w-full flex items-center gap-2 text-[10px] text-gray-400 font-medium font-mono">
                <span className="w-8 text-right">{song ? formatTime((progress/100)*240) : '0:00'}</span>
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden relative group cursor-pointer">
                    <div className="absolute inset-y-0 left-0 bg-gray-500 group-hover:bg-rose-500 rounded-full transition-colors" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="w-8">{song ? '4:00' : '-:--'}</span>
             </div>
        </div>

        {/* Right: Volume/Misc */}
        <div className="flex items-center justify-end w-1/3 gap-4 text-gray-500">
             <button title="Lyrics" className="hover:text-gray-800 transition-colors"><i className="fas fa-quote-right text-sm"></i></button>
             <button title="Devices" className="hover:text-gray-800 transition-colors"><i className="fas fa-computer text-sm"></i></button>
             <div className="flex items-center gap-2 w-24 group">
                 <i className="fas fa-volume-high text-xs"></i>
                 <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden relative cursor-pointer">
                    <div className="absolute inset-y-0 left-0 bg-gray-500 group-hover:bg-gray-600 rounded-full w-2/3"></div>
                 </div>
             </div>
             <button title="Queue" className="hover:text-gray-800 transition-colors"><i className="fas fa-list text-sm"></i></button>
        </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default PlayerBar;