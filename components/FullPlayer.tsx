import React from 'react';
import { Song } from '../types';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  progress: number;
  onShare?: () => void;
}

const FullPlayer: React.FC<FullPlayerProps> = ({ isOpen, onClose, song, isPlaying, onTogglePlay, progress, onShare }) => {
  if (!song) return null;

  return (
    <div className={`absolute inset-0 bg-[#F2F2F7]/95 backdrop-blur-3xl z-[60] transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'} flex flex-col items-center justify-center`}>
      
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
      >
        <i className="fas fa-chevron-down text-gray-600 text-xl"></i>
      </button>

      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-12 px-8">
          
          {/* Vinyl Record */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-white rounded-[40px] shadow-2xl flex items-center justify-center relative border border-gray-100">
                <div 
                    className={`w-[260px] h-[260px] md:w-[400px] md:h-[400px] rounded-full bg-black relative shadow-2xl overflow-hidden ${isPlaying ? 'spinning' : 'spinning paused-spin'}`} 
                    style={{ animationDuration: '8s' }}
                >
                    <img src={song.artUrl} className="w-full h-full object-cover opacity-80" alt="Vinyl" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-black rounded-full border-8 border-gray-800 flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Meta & Controls */}
          <div className="flex-1 w-full md:max-w-md">
            <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{song.title}</h2>
                <p className="text-xl text-rose-500 font-medium">{song.artist}</p>
                <div className="mt-4 flex justify-center md:justify-start gap-2">
                     <span className="px-3 py-1 bg-gray-200 rounded-full text-xs font-bold text-gray-600">{song.genre || 'Music'}</span>
                     {song.isLocal && <span className="px-3 py-1 bg-blue-100 rounded-full text-xs font-bold text-blue-600">Local File</span>}
                </div>
            </div>

            {/* Scrubber */}
            <div className="w-full mb-8">
                <div className="h-2 bg-gray-200 rounded-full w-full relative cursor-pointer group">
                    <div className="absolute inset-y-0 left-0 bg-gray-900 rounded-full group-hover:bg-rose-500 transition-colors" style={{ width: `${progress}%` }}></div>
                    <div 
                        className="w-4 h-4 bg-gray-900 rounded-full absolute top-1/2 transform -translate-y-1/2 shadow-lg border-2 border-white scale-0 group-hover:scale-100 transition-transform" 
                        style={{ left: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium font-mono">
                    <span>{Math.floor((progress/100)*240 / 60)}:{String(Math.floor((progress/100)*240 % 60)).padStart(2, '0')}</span>
                    <span>4:00</span>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center md:justify-between items-center gap-8 md:gap-0">
                <button className="text-gray-400 hover:text-gray-800 transition-colors"><i className="fas fa-shuffle text-2xl"></i></button>
                <button className="text-gray-900 hover:text-rose-500 transition-colors"><i className="fas fa-backward-step text-3xl"></i></button>
                <button 
                    className="w-20 h-20 bg-gray-900 hover:bg-rose-500 rounded-full flex items-center justify-center shadow-2xl transform active:scale-95 transition-all" 
                    onClick={onTogglePlay}
                >
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play pl-1'} text-white text-3xl`}></i>
                </button>
                <button className="text-gray-900 hover:text-rose-500 transition-colors"><i className="fas fa-forward-step text-3xl"></i></button>
                <button className="text-gray-400 hover:text-gray-800 transition-colors"><i className="fas fa-repeat text-2xl"></i></button>
            </div>
            
            <div className="mt-10 flex justify-center md:justify-start gap-4">
                 <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors" onClick={onShare}>
                     <i className="fas fa-share-nodes"></i>
                 </button>
                 <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                     <i className="fas fa-heart"></i>
                 </button>
                 <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                     <i className="fas fa-list-ul"></i>
                 </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default FullPlayer;