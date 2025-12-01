
import React, { useEffect, useRef, useState } from 'react';
import { Song, PlaybackMode } from '../types';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  progress: number;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  onShare?: () => void;
  onToggleLike?: (id: string) => void;
  playbackMode?: PlaybackMode;
  onToggleMode?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  analyser?: AnalyserNode | null;
  lyrics?: string | null;
  onEdit?: () => void;
}

const FullPlayer: React.FC<FullPlayerProps> = ({ 
    isOpen, onClose, song, isPlaying, onTogglePlay, progress, 
    currentTime = 0, duration = 0, onSeek,
    onShare, onToggleLike, playbackMode, onToggleMode, onNext, onPrev, analyser, lyrics,
    onEdit
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [showLyrics, setShowLyrics] = useState(false);

  // --- VISUALIZER LOOP ---
  useEffect(() => {
    if (!isOpen || !analyser || !canvasRef.current || !isPlaying) {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
        analyser.getByteFrequencyData(dataArray);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = 180; // slightly larger than vinyl
        const barWidth = 3;
        const barHeightScale = 0.8;
        
        // Draw circular bars
        for (let i = 0; i < bufferLength; i += 2) { 
            const barHeight = dataArray[i] * barHeightScale;
            const rads = (i / bufferLength) * (2 * Math.PI);
            
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rads);
            
            ctx.fillStyle = `rgba(244, 63, 94, ${dataArray[i] / 255})`; 
            ctx.fillRect(0, radius, barWidth, barHeight);
            
            ctx.restore();
        }

        animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isOpen, analyser, isPlaying]);

  // Adjust canvas size
  useEffect(() => {
      if (canvasRef.current) {
          canvasRef.current.width = 800;
          canvasRef.current.height = 800;
      }
  }, []);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onSeek && duration) {
          onSeek(parseFloat(e.target.value));
      }
  };

  const getModeIcon = () => {
      if (playbackMode === 'shuffle') return 'fa-shuffle text-rose-500';
      if (playbackMode === 'repeat_one') return 'fa-repeat text-rose-500';
      if (playbackMode === 'repeat_list') return 'fa-repeat text-rose-500';
      return 'fa-repeat text-gray-400 dark:text-gray-500';
  };
  const getModeLabel = () => {
       if (playbackMode === 'repeat_one') return '1';
       return '';
  };

  if (!song) return null;

  return (
    <div className={`absolute inset-0 bg-[#F2F2F7]/95 dark:bg-[#000]/95 backdrop-blur-3xl z-[60] transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'} flex flex-col items-center justify-center`}>
      
      <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors z-20 text-gray-600 dark:text-white">
        <i className="fas fa-chevron-down text-xl"></i>
      </button>

      {/* Lyrics & Edit Toggles */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-20">
        <button 
            onClick={() => setShowLyrics(!showLyrics)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${showLyrics ? 'bg-rose-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white'}`}
        >
            <i className="fas fa-music mr-2"></i> Lyrics
        </button>
        {onEdit && (
            <button 
                onClick={onEdit}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                title="Edit Song"
            >
                <i className="fas fa-pen text-sm"></i>
            </button>
        )}
      </div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-12 px-8 relative">
          
          {/* LYRICS OVERLAY */}
          {showLyrics && (
             <div className="absolute inset-0 z-30 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center text-center overflow-y-auto h-[500px] shadow-2xl border border-white dark:border-white/10">
                 <h3 className="text-gray-400 font-bold uppercase tracking-widest mb-6 text-xs">Lyrics</h3>
                 {lyrics ? (
                     <p className="whitespace-pre-line text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed animate-fade-in">
                         {lyrics}
                     </p>
                 ) : (
                     <div className="flex flex-col items-center opacity-50 dark:text-white">
                        <i className="fas fa-microphone-slash text-4xl mb-4"></i>
                        <p>No lyrics found for this track.</p>
                     </div>
                 )}
             </div>
          )}

          {/* Vinyl & Visualizer */}
          <div className="flex-1 flex items-center justify-center relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0 scale-110" />

            <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-white dark:bg-white/5 rounded-[40px] shadow-2xl flex items-center justify-center relative border border-gray-100 dark:border-white/5 z-10">
                <div 
                    className={`w-[260px] h-[260px] md:w-[400px] md:h-[400px] rounded-full bg-black relative shadow-2xl overflow-hidden ${isPlaying ? 'spinning' : 'spinning paused-spin'}`} 
                    style={{ animationDuration: song.isRadio ? '2s' : '8s' }}
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
          <div className="flex-1 w-full md:max-w-md z-10">
            <div className="mb-10 text-center md:text-left flex flex-col md:block items-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 truncate">{song.title}</h2>
                <p className="text-xl text-rose-500 font-medium">{song.artist}</p>
                <div className="mt-4 flex gap-2">
                     <span className="px-3 py-1 bg-gray-200 dark:bg-white/10 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300">{song.genre || 'Music'}</span>
                     {song.isRadio && <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full text-xs font-bold text-red-600 dark:text-red-400 animate-pulse">LIVE RADIO</span>}
                </div>
            </div>

            {/* Scrubber */}
            <div className="w-full mb-8">
                {song.isRadio ? (
                     <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full w-full overflow-hidden relative">
                         <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-rose-500 to-rose-500/20 animate-[shimmer_2s_infinite] w-full"></div>
                     </div>
                ) : (
                    <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full w-full relative cursor-pointer group flex items-center">
                        <input 
                            type="range" 
                            min="0" 
                            max={duration || 100} 
                            value={currentTime} 
                            onChange={handleSeekChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute inset-y-0 left-0 bg-gray-900 dark:bg-white rounded-full group-hover:bg-rose-500 transition-colors pointer-events-none" style={{ width: `${progress}%` }}></div>
                        <div 
                            className="w-4 h-4 bg-gray-900 dark:bg-white rounded-full absolute top-1/2 transform -translate-y-1/2 shadow-lg border-2 border-white dark:border-black scale-0 group-hover:scale-100 transition-transform pointer-events-none" 
                            style={{ left: `${progress}%` }}
                        ></div>
                    </div>
                )}
                
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium font-mono">
                    <span>{song.isRadio ? 'LIVE' : formatTime(currentTime)}</span>
                    <span>{song.isRadio ? '∞' : formatTime(duration)}</span>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center md:justify-between items-center gap-8 md:gap-0">
                <button 
                    onClick={onToggleMode}
                    disabled={song.isRadio}
                    className={`relative ${song.isRadio ? 'opacity-30' : 'hover:text-rose-500'} text-gray-400 dark:text-gray-500 transition-colors`}
                >
                    <i className={`fas ${getModeIcon()} text-lg`}></i>
                    {playbackMode === 'repeat_one' && <span className="absolute -top-1 -right-2 text-[8px] font-bold">1</span>}
                </button>

                <button 
                    onClick={onPrev} 
                    disabled={song.isRadio}
                    className="text-gray-900 dark:text-white hover:text-rose-500 transition-colors disabled:opacity-30"
                >
                    <i className="fas fa-backward-step text-3xl"></i>
                </button>
                
                <button 
                    className="w-20 h-20 bg-gray-900 dark:bg-white hover:bg-rose-500 dark:hover:bg-rose-500 rounded-full flex items-center justify-center shadow-2xl transform active:scale-95 transition-all group" 
                    onClick={onTogglePlay}
                >
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play pl-1'} text-white dark:text-black group-hover:text-white text-3xl`}></i>
                </button>
                
                <button 
                    onClick={onNext} 
                    disabled={song.isRadio}
                    className="text-gray-900 dark:text-white hover:text-rose-500 transition-colors disabled:opacity-30"
                >
                    <i className="fas fa-forward-step text-3xl"></i>
                </button>

                <button 
                  className={`transition-colors ${song.isLiked ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}
                  onClick={() => onToggleLike && onToggleLike(song.id)}
                >
                  <i className={`${song.isLiked ? 'fas' : 'far'} fa-heart text-2xl`}></i>
                </button>
            </div>
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

export default FullPlayer;
