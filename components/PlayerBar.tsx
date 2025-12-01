
import React, { useState } from 'react';
import { Song, PlaybackMode } from '../types';

interface PlayerBarProps {
  song: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  progress: number;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  onOpenFullPlayer: () => void;
  onVolumeChange?: (vol: number) => void;
  onToggleLike?: (id: string) => void;
  playbackMode?: PlaybackMode;
  onToggleMode?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ 
    song, 
    isPlaying, 
    onTogglePlay, 
    progress, 
    currentTime = 0,
    duration = 0,
    onSeek,
    onOpenFullPlayer, 
    onVolumeChange, 
    onToggleLike,
    playbackMode,
    onToggleMode,
    onNext,
    onPrev
}) => {
  const [volume, setVolume] = useState(1);

  const handleVolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setVolume(val);
      if (onVolumeChange) onVolumeChange(val);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onSeek && duration) {
          const val = parseFloat(e.target.value);
          onSeek(val);
      }
  };

  // Helper to get Mode Icon
  const getModeIcon = () => {
      if (playbackMode === 'shuffle') return 'fa-shuffle text-rose-500';
      if (playbackMode === 'repeat_one') return 'fa-repeat text-rose-500 relative after:content-["1"] after:absolute after:-top-1 after:-right-2 after:text-[8px] after:font-bold';
      if (playbackMode === 'repeat_list') return 'fa-repeat text-rose-500';
      return 'fa-repeat text-gray-400 dark:text-gray-500';
  };

  return (
    <div className="w-full h-24 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 flex items-center px-6 justify-between select-none transition-colors duration-300">
        
        {/* Left: Song Info */}
        <div className="flex items-center w-1/3 gap-4 min-w-0 pr-4">
            {song ? (
                <>
                    <div 
                        className="w-14 h-14 rounded-md shadow-md overflow-hidden cursor-pointer group relative flex-shrink-0 bg-gray-100 dark:bg-white/10"
                        onClick={onOpenFullPlayer}
                    >
                         <img src={song.artUrl} className="w-full h-full object-cover" alt="Art" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <i className="fas fa-expand text-white opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100 shadow-sm"></i>
                         </div>
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate hover:underline cursor-pointer" onClick={onOpenFullPlayer}>{song.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate hover:underline cursor-pointer">{song.artist}</p>
                    </div>
                    {onToggleLike && (
                        <button 
                            className={`ml-2 hover:scale-110 transition-transform ${song.isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            onClick={() => onToggleLike(song.id)}
                        >
                            <i className={`${song.isLiked ? 'fas' : 'far'} fa-heart`}></i>
                        </button>
                    )}
                </>
            ) : (
                <div className="flex items-center gap-4 opacity-50">
                    <div className="w-14 h-14 rounded-md bg-gray-200 dark:bg-white/10"></div>
                </div>
            )}
        </div>

        {/* Center: Controls */}
        <div className="flex flex-col items-center w-1/3 max-w-[600px]">
             <div className="flex items-center gap-6 mb-1">
                {/* Mode Toggle (Shuffle/Repeat) */}
                <button 
                    onClick={onToggleMode}
                    disabled={!song || song.isRadio}
                    className={`${song?.isRadio ? 'opacity-30 cursor-not-allowed' : 'hover:text-rose-500'} transition-colors`}
                    title="Toggle Mode"
                >
                    <i className={`fas ${getModeIcon()}`}></i>
                </button>

                <button 
                    onClick={onPrev} 
                    disabled={!song || song.isRadio}
                    className={`text-gray-800 dark:text-gray-200 text-xl transition-colors ${song?.isRadio ? 'opacity-30 cursor-not-allowed' : 'hover:text-black dark:hover:text-white'}`}
                >
                    <i className="fas fa-backward-step"></i>
                </button>
                
                <button 
                    className="w-9 h-9 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                    onClick={onTogglePlay}
                    disabled={!song}
                >
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play pl-0.5'} text-sm`}></i>
                </button>
                
                <button 
                    onClick={onNext} 
                    disabled={!song || song.isRadio}
                    className={`text-gray-800 dark:text-gray-200 text-xl transition-colors ${song?.isRadio ? 'opacity-30 cursor-not-allowed' : 'hover:text-black dark:hover:text-white'}`}
                >
                    <i className="fas fa-forward-step"></i>
                </button>
                
                {/* Shuffle Button (can be merged into toggle, but keeping visual balance if preferred) */}
                <button 
                     disabled={!song || song.isRadio}
                     onClick={() => onToggleMode && onToggleMode()} // Reuse toggle for simplicity in this layout
                     className={`text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 pointer-events-none`}
                >
                    <i className="fas fa-random"></i>
                </button>
             </div>

             <div className="w-full flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 font-medium font-mono">
                <span className="w-8 text-right">{song ? (song.isRadio ? 'LIVE' : formatTime(currentTime)) : '0:00'}</span>
                
                {song?.isRadio ? (
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden relative">
                         <div className="absolute inset-0 bg-rose-500/50 animate-pulse w-full"></div>
                    </div>
                ) : (
                    <div className="flex-1 h-1 relative group flex items-center">
                        <input 
                            type="range" 
                            min="0" 
                            max={duration || 100} 
                            value={currentTime} 
                            onChange={handleSeekChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden pointer-events-none">
                            <div className="h-full bg-gray-500 dark:bg-white/50 group-hover:bg-rose-500 transition-colors" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}
                
                <span className="w-8">{song ? (song.isRadio ? '∞' : formatTime(duration)) : '-:--'}</span>
             </div>
        </div>

        {/* Right: Volume */}
        <div className="flex items-center justify-end w-1/3 gap-4 text-gray-500 dark:text-gray-400">
             <div className="flex items-center gap-2 w-24 group">
                 <i className={`fas ${volume === 0 ? 'fa-volume-mute' : 'fa-volume-high'} text-xs`}></i>
                 <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={volume}
                    onChange={handleVolChange}
                    className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                 />
             </div>
        </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default PlayerBar;