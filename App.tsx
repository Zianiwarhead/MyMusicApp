import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Song } from './types';
import LibraryView from './components/LibraryView';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import FullPlayer from './components/FullPlayer';
import EditModal from './components/EditModal';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';
import { saveSongToDB, getSongsFromDB, updateSongInDB } from './utils/db';
import * as mm from 'music-metadata-browser';

const INITIAL_SONGS: Song[] = [
  { id: '1', title: 'Flower Boy', artist: 'Tyler, The Creator', genre: 'Hip-Hop', artUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Tyler%2C_the_Creator_-_Flower_Boy.png' },
  { id: '2', title: 'Currents', artist: 'Tame Impala', genre: 'Psychedelic Rock', artUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png' },
  { id: '3', title: 'Starboy', artist: 'The Weeknd', genre: 'R&B', artUrl: 'https://upload.wikimedia.org/wikipedia/en/3/39/The_Weeknd_-_Starboy.png' },
];

const App: React.FC = () => {
  // --- STATE ---
  const [allSongs, setAllSongs] = useState<Song[]>(INITIAL_SONGS);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Audio State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [playbackMode, setPlaybackMode] = useState<'normal' | 'repeat_one' | 'repeat_list' | 'shuffle'>('normal');
  const [lyrics, setLyrics] = useState<string | null>(null);

  // UI State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Web Audio API for Visualizer
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // --- INIT ---
  useEffect(() => {
    // 1. Dark Mode System Check
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
    }

    // 2. Load DB
    getSongsFromDB().then(localSongs => {
        if (localSongs.length > 0) {
            setAllSongs(prev => {
                const ids = new Set(prev.map(s => s.id));
                return [...prev, ...localSongs.filter(s => !ids.has(s.id))];
            });
        }
    });
  }, []);

  // --- RECOMMENDATION ENGINE (ARCHEOLOGIST) ---
  const recommendations = useMemo(() => {
      if (allSongs.length === 0) return [];
      
      // 1. Identify favorite genre based on play history (simulated by what's present)
      const genreCounts: Record<string, number> = {};
      allSongs.forEach(s => {
          if (s.lastPlayed) {
              genreCounts[s.genre] = (genreCounts[s.genre] || 0) + 2; // Weight played songs higher
          }
          genreCounts[s.genre] = (genreCounts[s.genre] || 0) + 1;
      });
      
      const sortedGenres = Object.keys(genreCounts).sort((a,b) => genreCounts[b] - genreCounts[a]);
      const topGenre = sortedGenres[0] || 'Pop';

      // 2. Find "Forgotten Gems" (Songs in top genres not played recently)
      // Since we don't have persistent history yet, we'll pick songs not currently playing
      const now = Date.now();
      const candidates = allSongs.filter(s => 
          s.genre === topGenre && 
          s.id !== currentSong?.id &&
          (!s.lastPlayed || now - s.lastPlayed > 24 * 60 * 60 * 1000) // Not played in last 24h
      );

      // Shuffle
      return candidates.sort(() => 0.5 - Math.random()).slice(0, 5);
  }, [allSongs, currentSong]);

  // --- AUDIO LOGIC ---
  
  // Initialize Web Audio API
  const initAudioContext = () => {
    if (!audioRef.current || audioContextRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    
    // Create source from the audio element
    // Note: This requires CORS to be handled for remote files, usually fine for local blob/data URLs
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyserNode);
    analyserNode.connect(ctx.destination);

    audioContextRef.current = ctx;
    sourceNodeRef.current = source;
    analyserRef.current = analyserNode;
    setAnalyser(analyserNode);
  };

  const togglePlay = async () => {
      if (!audioContextRef.current && audioRef.current) {
          initAudioContext();
      }
      if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
      }
      setIsPlaying(!isPlaying);
  };

  const toggleTheme = () => {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      if (newMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
  };

  const handleTimeUpdate = () => {
      if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
      }
  };

  const handleLoadedMetadata = () => {
      if (audioRef.current) {
          setDuration(audioRef.current.duration);
          if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
      }
  };

  const handleSeek = (time: number) => {
      if (audioRef.current) {
          audioRef.current.currentTime = time;
          setCurrentTime(time);
      }
  };

  const handleSongEnd = () => {
      if (playbackMode === 'repeat_one') {
          if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
          }
      } else {
          playNextSong();
      }
  };

  const playNextSong = () => {
      if (!currentSong) return;
      if (playbackMode === 'normal' && isLastSong()) return setIsPlaying(false);

      let nextIndex = 0;
      if (playbackMode === 'shuffle') {
          nextIndex = Math.floor(Math.random() * allSongs.length);
      } else {
          const currentIndex = allSongs.findIndex(s => s.id === currentSong.id);
          nextIndex = (currentIndex + 1) % allSongs.length;
      }
      handlePlaySong(allSongs[nextIndex]);
  };

  const playPrevSong = () => {
      if (!currentSong) return;
      if (currentTime > 3) {
          handleSeek(0);
          return;
      }
      const currentIndex = allSongs.findIndex(s => s.id === currentSong.id);
      const prevIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
      handlePlaySong(allSongs[prevIndex]);
  };

  const isLastSong = () => {
      if (!currentSong) return true;
      return allSongs.findIndex(s => s.id === currentSong.id) === allSongs.length - 1;
  };

  const handlePlaySong = (song: Song) => {
      // Initialize audio context on first user interaction
      if (!audioContextRef.current) {
          initAudioContext();
      }

      // Update Last Played
      const updatedSong = { ...song, lastPlayed: Date.now() };
      setAllSongs(prev => prev.map(s => s.id === song.id ? updatedSong : s));
      if (song.isLocal) updateSongInDB(updatedSong);

      if (currentSong?.id === song.id) {
          togglePlay();
      } else {
          setCurrentSong(updatedSong);
          setIsPlaying(true);
          // Reset lyrics when song changes
          setLyrics(song.lyrics || null);
          // Attempt to fetch lyrics if online
          if (!song.isLocal && !song.lyrics && !song.isRadio) {
              fetchLyrics(song.title, song.artist, song.duration || 0);
          }
      }
  };

  const fetchLyrics = async (title: string, artist: string, duration: number) => {
      try {
        const res = await fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`);
        const data = await res.json();
        if (data && data.plainLyrics) {
             setLyrics(data.plainLyrics);
             // Optionally save to song object if we want to persist
        }
      } catch (e) {
          console.log("No lyrics found online");
      }
  };

  const toggleMode = () => {
      const modes: ('normal' | 'repeat_one' | 'repeat_list' | 'shuffle')[] = ['normal', 'repeat_list', 'repeat_one', 'shuffle'];
      const currentIdx = modes.indexOf(playbackMode);
      setPlaybackMode(modes[(currentIdx + 1) % modes.length]);
  };

  const toggleLike = (id: string) => {
      setAllSongs(prev => prev.map(s => {
          if (s.id === id) {
              const updated = { ...s, isLiked: !s.isLiked };
              if (s.isLocal) updateSongInDB(updated); // Persist like
              return updated;
          }
          return s;
      }));
      if (currentSong?.id === id) {
          setCurrentSong(prev => prev ? { ...prev, isLiked: !prev.isLiked } : null);
      }
  };

  // Sync Audio Element
  useEffect(() => {
      if (audioRef.current && currentSong?.fileUrl) {
          if (audioRef.current.src !== currentSong.fileUrl) {
              audioRef.current.src = currentSong.fileUrl;
              audioRef.current.crossOrigin = "anonymous"; // Enable CORS for visualizer
              audioRef.current.load();
          }
          if (isPlaying) {
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                  playPromise.catch(error => {
                      if (error.name !== 'AbortError') console.log("Playback prevented");
                  });
              }
          } else {
              audioRef.current.pause();
          }
      }
  }, [currentSong, isPlaying]);

  useEffect(() => {
      if(audioRef.current) audioRef.current.volume = volume;
  }, [volume]);


  // --- DRAG & DROP & UPLOAD ---

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleFiles = async (files: FileList) => {
      const newSongs: Song[] = [];
      
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file.type.startsWith('audio/')) continue;

          // 1. Basic Metadata Fallback
          let title = file.name.replace(/\.[^/.]+$/, "");
          let artist = "Unknown Artist";
          let artUrl = generateOfflineArt(title);
          let lyrics = undefined;
          let duration = 0;
          
          // Smart filename parsing
          if (title.includes(' - ')) {
              const parts = title.split(' - ');
              artist = parts[0].trim();
              title = parts.slice(1).join(' - ').trim();
          }

          // 2. Advanced Metadata Parsing
          try {
              const metadata = await mm.parseBlob(file);
              if (metadata.common.title) title = metadata.common.title;
              if (metadata.common.artist) artist = metadata.common.artist;
              if (metadata.format.duration) duration = metadata.format.duration;
              
              if (metadata.common.picture && metadata.common.picture.length > 0) {
                  const pic = metadata.common.picture[0];
                  const blob = new Blob([pic.data], { type: pic.format });
                  artUrl = URL.createObjectURL(blob);
              }

              if (metadata.common.lyrics) {
                   lyrics = metadata.common.lyrics.join('\n');
              }
          } catch (e) {
              console.warn("Metadata parsing failed, using fallback", e);
          }

          const newSong: Song = {
              id: `local_${Date.now()}_${i}`,
              title,
              artist,
              artUrl,
              genre: 'Local',
              fileUrl: URL.createObjectURL(file),
              isLocal: true,
              isLiked: false,
              lyrics,
              duration
          };
          
          saveSongToDB(newSong, file); 
          newSongs.push(newSong);
      }
      setAllSongs(prev => [...prev, ...newSongs]);
  };

  const updateSongMetadata = async (updatedSong: Song) => {
      // 1. Update State
      setAllSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
      if (currentSong?.id === updatedSong.id) setCurrentSong(updatedSong);
      
      // 2. Persist to DB
      if (updatedSong.isLocal) {
        await updateSongInDB(updatedSong);
      }
      setIsEditModalOpen(false);
  };

  const generateOfflineArt = (seed: string) => {
      const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      const color = colors[seed.length % colors.length];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${color}"/><text x="50" y="60" font-size="50" fill="white" text-anchor="middle" font-family="sans-serif">${seed[0].toUpperCase()}</text></svg>`;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // --- RENDER ---
  return (
    <div 
        className={`w-full h-full bg-[#F2F2F7] dark:bg-[#0f0f12] dark:text-white transition-colors duration-300 flex flex-col md:flex-row relative ${isDragOver ? 'ring-4 ring-rose-500' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
    >
      <audio 
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleSongEnd}
      />

      <div className="hidden md:flex h-full z-30">
        <Sidebar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      </div>

      <div className="flex-1 flex flex-col h-full relative overflow-hidden z-10">
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 pb-32">
             <LibraryView 
                allSongs={allSongs} 
                onPlaySong={handlePlaySong}
                onUpload={(e) => e.target.files && handleFiles(e.target.files)}
                recommendations={recommendations}
                onToggleTheme={toggleTheme}
                isDarkMode={isDarkMode}
             />
          </div>

          <div className="md:hidden fixed bottom-20 left-0 w-full z-40 px-4 flex justify-center">
             <MiniPlayer song={currentSong} isPlaying={isPlaying} onTogglePlay={togglePlay} onClick={() => setIsFullPlayerOpen(true)} />
          </div>
          <div className="md:hidden fixed bottom-0 w-full z-50">
             <BottomNav 
                activeTab="All" 
                onTabChange={() => {}} 
             />
          </div>
      </div>

      <div className="hidden md:block absolute bottom-0 w-full z-50">
        <PlayerBar 
            song={currentSong} 
            isPlaying={isPlaying} 
            onTogglePlay={togglePlay} 
            currentTime={currentTime}
            duration={duration}
            progress={duration ? (currentTime / duration) * 100 : 0}
            onSeek={handleSeek}
            playbackMode={playbackMode}
            onToggleMode={toggleMode}
            onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
            onVolumeChange={setVolume}
            onToggleLike={toggleLike}
            onNext={playNextSong}
            onPrev={playPrevSong}
        />
      </div>

      <FullPlayer 
          isOpen={isFullPlayerOpen}
          onClose={() => setIsFullPlayerOpen(false)}
          song={currentSong}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          currentTime={currentTime}
          duration={duration}
          progress={duration ? (currentTime / duration) * 100 : 0}
          onSeek={handleSeek}
          onEdit={() => setIsEditModalOpen(true)}
          playbackMode={playbackMode}
          onToggleMode={toggleMode}
          onNext={playNextSong}
          onPrev={playPrevSong}
          onToggleLike={toggleLike}
          analyser={analyser}
          lyrics={lyrics}
      />

      <EditModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          song={currentSong} 
          onSave={updateSongMetadata} 
      />
    </div>
  );
};

export default App;