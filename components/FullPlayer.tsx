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
    <div className={`absolute inset-0 bg-white/95 backdrop-blur-3xl z-40 transition-transform duration-500 ease-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} flex flex-col`}>
      
      {/* Close Button */}
      <div className="absolute top-6 right-8 z-50">
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <i className="fas fa-chevron-down text-gray-600"></i>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-12 gap-16">
          
          {/* Left: Art (Vinyl Style) */}
          <div className="w-[450px] h-[450px] flex-shrink-0 relative">
             <div className="w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center relative">
                 <div className={`w-[90%] h-[90%] rounded-full bg-black relative shadow-xl overflow-hidden ${isPlaying ? 'spinning' : 'spinning paused-spin'}`} style={{ animationDuration: '8s' }}>
                    <img src={song.artUrl} className="w-full h-full object-cover opacity-90" alt="Vinyl Art" />
                    <div className="absolute inset-0 rounded-full" style={{ background: 'repeating-radial-gradient(#111 0, #111 2px, transparent 3px, transparent 4px)' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-black rounded-full border-4 border-gray-800 flex items-center justify-center">
                             <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>
                 </div>
             </div>
          </div>

          {/* Right: Info & Lyrics placeholder */}
          <div className="w-[400px] flex flex-col justify-center h-[450px]">
             <div className="mb-8">
                 <h2 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">{song.title}</h2>
                 <p className="text-2xl text-rose-500 font-medium">{song.artist}</p>
             </div>

             {/* Fake Lyrics / Next Up */}
             <div className="flex-1 overflow-hidden relative">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Up Next</h3>
                 <div className="space-y-4 opacity-60">
                     <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gray-200 rounded"></div>
                         <div className="h-2 w-32 bg-gray-200 rounded"></div>
                     </div>
                     <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gray-200 rounded"></div>
                         <div className="h-2 w-24 bg-gray-200 rounded"></div>
                     </div>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gray-200 rounded"></div>
                         <div className="h-2 w-40 bg-gray-200 rounded"></div>
                     </div>
                 </div>
                 <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
             </div>
             
             <div className="mt-8 flex gap-4">
                 <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-semibold transition-colors">Save to Library</button>
                 <button 
                    onClick={onShare}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 transition-colors"
                 >
                     <i className="fas fa-share-nodes"></i>
                 </button>
                 <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 transition-colors">
                     <i className="fas fa-ellipsis"></i>
                 </button>
             </div>
          </div>
      </div>

    </div>
  );
};

export default FullPlayer;