
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Song, PlaybackMode } from './types';
import LibraryView from './components/LibraryView';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import FullPlayer from './components/FullPlayer';
import ShareModal from './components/ShareModal';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';
import EditModal from './components/EditModal';
import { saveSongToDB, getSongsFromDB, deleteSongFromDB, updateSongInDB } from './utils/db';

// --- DEMO DATA ---

const INITIAL_SONGS: Song[] = [
  { id: '1', title: 'Flower Boy', artist: 'Tyler, The Creator', genre: 'Hip-Hop', artUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Tyler%2C_the_Creator_-_Flower_Boy.png' },
  { id: '2', title: 'Currents', artist: 'Tame Impala', genre: 'Psychedelic Rock', artUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png' },
  { id: '3', title: 'Starboy', artist: 'The Weeknd', genre: 'R&B', artUrl: 'https://upload.wikimedia.org/wikipedia/en/3/39/The_Weeknd_-_Starboy.png' },
  { id: '4', title: 'After Hours', artist: 'The Weeknd', genre: 'R&B', artUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png' },
  { id: '5', title: 'Random Access Memories', artist: 'Daft Punk', genre: 'Electronic', artUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg' },
];

const App: React.FC = () => {
  // Data State
  const [allSongs, setAllSongs] = useState<Song[]>(INITIAL_SONGS);
  const [listeningHistory, setListeningHistory] = useState<string[]>([]);
  const [radioStations, setRadioStations] = useState<Song[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  
  // Radio State
  const [radioGenre, setRadioGenre] = useState('lofi');

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Playback State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState(0); // 0 to 100 percentage
  const [duration, setDuration] = useState(0); // in seconds
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('normal');
  const [lyrics, setLyrics] = useState<string | null>(null);

  // Audio Reference
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // UI State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [songToShare, setSongToShare] = useState<Song | null>(null);
  const [songToEdit, setSongToEdit] = useState<Song | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // --- SOUND ENGINE ---
  
  const playUiSound = (type: 'click' | 'open' | 'close' | 'success') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
  
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'open') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'close') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.15);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {}
  };

  // --- INIT & PERSISTENCE ---

  useEffect(() => {
    // Detect System Theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
    }

    const loadLocalSongs = async () => {
      try {
        const localSongs = await getSongsFromDB();
        if (localSongs.length > 0) {
          setAllSongs(prev => {
            const existingIds = new Set(prev.map(s => s.id));
            const uniqueLocal = localSongs.filter(s => !existingIds.has(s.id));
            return [...prev, ...uniqueLocal];
          });
        }
      } catch (err) {
        console.error("Failed to load local songs:", err);
      }
    };
    loadLocalSongs();
  }, []);

  // Fetch Radio when Genre Changes
  useEffect(() => {
     fetchRadioStations(radioGenre);
  }, [radioGenre]);

  const fetchRadioStations = async (genre: string) => {
      try {
          const response = await fetch(`https://de1.api.radio-browser.info/json/stations/bytag/${genre}?limit=15&order=votes&reverse=true`);
          const data = await response.json();
          const stations: Song[] = data.map((station: any) => ({
              id: station.stationuuid,
              title: station.name,
              artist: 'Live Radio',
              genre: genre.charAt(0).toUpperCase() + genre.slice(1),
              artUrl: station.favicon || 'https://cdn-icons-png.flaticon.com/512/3075/3075836.png',
              fileUrl: station.url_resolved,
              isRadio: true
          }));
          setRadioStations(stations);
      } catch (e) {
          console.error("Failed to fetch radio", e);
      }
  };

  const fetchLyrics = async (title: string, artist: string) => {
      setLyrics(null);
      try {
          const res = await fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`);
          if (res.ok) {
              const data = await res.json();
              if (data.plainLyrics) setLyrics(data.plainLyrics);
              else if (data.syncedLyrics) setLyrics(data.syncedLyrics);
          }
      } catch (e) {
          console.log("Lyrics not found");
      }
  };

  const toggleTheme = () => {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      if (newMode) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
      playUiSound('click');
  };

  // --- AUDIO CONTEXT SETUP ---
  useEffect(() => {
      if (isPlaying && !audioContextRef.current && audioRef.current) {
          try {
              const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
              const ctx = new AudioContext();
              const analyser = ctx.createAnalyser();
              analyser.fftSize = 256;
              if (!sourceRef.current) {
                const source = ctx.createMediaElementSource(audioRef.current);
                source.connect(analyser);
                analyser.connect(ctx.destination);
                sourceRef.current = source;
              }
              audioContextRef.current = ctx;
              analyserRef.current = analyser;
          } catch (e) {
              console.error("Web Audio API error", e);
          }
      }
  }, [isPlaying]);

  // --- RECOMMENDATIONS ---
  const recommendations: Song[] = useMemo(() => {
    if (allSongs.length < 3) return [];
    const genreCounts: Record<string, number> = {};
    listeningHistory.forEach(g => genreCounts[g] = (genreCounts[g] || 0) + 1);
    const topGenre = Object.entries(genreCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Pop';
    const localCandidates = allSongs.filter(s => s.genre === topGenre && s.id !== currentSong?.id);
    const pool = localCandidates.length > 0 ? localCandidates : allSongs;
    return pool.sort(() => 0.5 - Math.random()).slice(0, 6);
  }, [allSongs, listeningHistory, currentSong]);


  // --- HANDLERS ---
  
  const generateOfflineArt = (seed: string) => {
    const colors = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#d946ef'];
    const bg = colors[seed.length % colors.length];
    const svg = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="${bg}"/>
        <text x="50" y="50" font-family="sans-serif" font-size="50" font-weight="bold" fill="white" text-anchor="middle" dy=".35em">${seed.charAt(0).toUpperCase()}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const newSongs: Song[] = [];
    const fileArray = Array.from(fileList);
    
    for (const file of fileArray) {
      if (!file.type.startsWith('audio/')) continue;

      const nameParts = file.name.replace(/\.[^/.]+$/, "").split('-');
      let title = nameParts.length > 1 ? nameParts[1].trim() : nameParts[0].trim();
      let artist = nameParts.length > 1 ? nameParts[0].trim() : 'Local Artist';
      
      const name = file.name.toLowerCase();
      let detectedGenre = 'Pop'; 
      if (name.includes('lofi')) detectedGenre = 'Lo-Fi';
      else if (name.includes('phonk')) detectedGenre = 'Phonk';
      else if (name.includes('rock')) detectedGenre = 'Rock';
      else if (name.includes('hip')) detectedGenre = 'Hip-Hop';
      else if (name.includes('electronic')) detectedGenre = 'Electronic';

      const offlineArt = generateOfflineArt(title);
      const newSong: Song = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title,
        artist,
        artUrl: offlineArt,
        genre: detectedGenre,
        fileUrl: URL.createObjectURL(file), 
        isLocal: true,
        isLiked: false,
      };

      try {
        await saveSongToDB(newSong, file);
        newSongs.push(newSong);
      } catch (e) {
        console.error("DB Save failed", e);
        newSongs.push(newSong);
      }
    }
    setAllSongs(prev => [...prev, ...newSongs]);
    if (newSongs.length > 0) playUiSound('success');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
  };

  const handleDeleteSong = async (id: string) => {
      try {
          await deleteSongFromDB(id);
          setAllSongs(prev => prev.filter(s => s.id !== id));
          playUiSound('click');
      } catch (e) {
          console.error("Delete failed", e);
      }
  };

  const handleToggleLike = async (id: string) => {
      playUiSound('click');
      const songIndex = allSongs.findIndex(s => s.id === id);
      if (songIndex === -1) return;

      const updatedSong = { ...allSongs[songIndex], isLiked: !allSongs[songIndex].isLiked };
      const newAllSongs = [...allSongs];
      newAllSongs[songIndex] = updatedSong;
      setAllSongs(newAllSongs);
      
      if (currentSong?.id === id) {
          setCurrentSong(updatedSong);
      }

      if (updatedSong.isLocal) {
          await updateSongInDB(updatedSong);
      }
  };

  const handleEditSong = (song: Song) => {
      setSongToEdit(song);
      setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedSong: Song) => {
      const newAllSongs = allSongs.map(s => s.id === updatedSong.id ? updatedSong : s);
      setAllSongs(newAllSongs);
      if (currentSong?.id === updatedSong.id) setCurrentSong(updatedSong);
      
      if (updatedSong.isLocal) {
          await updateSongInDB(updatedSong);
      }
      setIsEditModalOpen(false);
      playUiSound('success');
  };

  // --- PLAYBACK LOGIC ---

  useEffect(() => {
    const audio = audioRef.current;
    if (!currentSong || !audio) return;

    if (!currentSong.isRadio) {
        fetchLyrics(currentSong.title, currentSong.artist);
    } else {
        setLyrics("Live Radio Station");
    }

    if (currentSong.fileUrl) {
       if (audio.src !== currentSong.fileUrl) {
           audio.src = currentSong.fileUrl;
           audio.load();
           if (isPlaying) {
               audio.play().catch(e => { if (e.name !== 'AbortError') console.error("Autoplay prevent", e); });
           }
       }
    } else {
       // Stop audio if no valid source
       audio.pause();
       audio.removeAttribute('src');
       audio.load();
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.fileUrl) return;
    if (isPlaying && audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
    }
    if (isPlaying) {
        if (audio.paused) audio.play().catch(e => { console.warn("Play prevented", e) });
    } else {
        if (!audio.paused) audio.pause();
    }
  }, [isPlaying]);

  const handleVolumeChange = (vol: number) => {
      if (audioRef.current) {
          audioRef.current.volume = vol;
      }
  };

  const handleMetadataLoaded = () => {
      if (audioRef.current) {
          const dur = audioRef.current.duration;
          if (!isNaN(dur) && isFinite(dur)) {
              setDuration(dur);
          } else {
              setDuration(0); // Radio or stream
          }
      }
  };

  const handleSongEnd = () => {
       if (currentSong && currentSong.genre) {
            setListeningHistory(h => [...h, currentSong.genre]);
        }
        
        if (currentSong?.isRadio) return; // Radio shouldn't end usually

        if (playbackMode === 'repeat_one') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
        } else if (playbackMode === 'repeat_list') {
             playNext();
        } else if (playbackMode === 'shuffle') {
             playRandom();
        } else {
             setIsPlaying(false);
             setProgress(0);
        }
  };

  const handleAudioTimeUpdate = () => {
      if (audioRef.current && audioRef.current.duration) {
          setCurrentTime(audioRef.current.currentTime);
          const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(p);
      }
  };

  const handleSeek = (newTime: number) => {
      if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
          audioRef.current.currentTime = newTime;
          setCurrentTime(newTime);
          setProgress((newTime / audioRef.current.duration) * 100);
      }
  };

  const playNext = () => {
      if (!currentSong) return;
      // Define playlist source based on tab or just use allSongs
      // For simplicity, using allSongs. A proper queue system would be better but simple logic:
      const idx = allSongs.findIndex(s => s.id === currentSong.id);
      if (idx !== -1 && idx < allSongs.length - 1) {
          handlePlaySong(allSongs[idx + 1]);
      } else {
          // Wrap around
          handlePlaySong(allSongs[0]);
      }
  };

  const playPrevious = () => {
      if (!currentSong) return;
      const idx = allSongs.findIndex(s => s.id === currentSong.id);
      if (idx > 0) {
          handlePlaySong(allSongs[idx - 1]);
      } else {
          handlePlaySong(allSongs[allSongs.length - 1]);
      }
  };

  const playRandom = () => {
      const candidates = allSongs.filter(s => s.id !== currentSong?.id);
      if (candidates.length > 0) {
          const randomSong = candidates[Math.floor(Math.random() * candidates.length)];
          handlePlaySong(randomSong);
      }
  };

  const togglePlaybackMode = () => {
      if (playbackMode === 'normal') setPlaybackMode('shuffle');
      else if (playbackMode === 'shuffle') setPlaybackMode('repeat_list');
      else if (playbackMode === 'repeat_list') setPlaybackMode('repeat_one');
      else setPlaybackMode('normal');
  };

  const handlePlaySong = (song: Song) => {
    playUiSound('click');
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      setProgress(0);
      setListeningHistory(prev => [...prev, song.genre]);
    }
  };

  const togglePlay = () => {
    playUiSound('click');
    setIsPlaying(!isPlaying);
  };

  const handleOpenShare = (song: Song) => {
    playUiSound('open');
    setSongToShare(song);
    setIsShareModalOpen(true);
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
  };


  return (
    <div 
        className="w-full h-full relative text-black font-sans overflow-hidden bg-[#F2F2F7] dark:bg-[#09090b] dark:text-white flex flex-col md:flex-row transition-colors duration-300"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      
      {/* Audio Element */}
      <audio 
          ref={audioRef}
          crossOrigin="anonymous" 
          onTimeUpdate={handleAudioTimeUpdate}
          onLoadedMetadata={handleMetadataLoaded}
          onEnded={handleSongEnd}
          onError={(e) => console.log("Audio Error (handled safely)")}
      />

      {/* Drag Overlay */}
      {isDragging && (
          <div className="absolute inset-0 z-[100] bg-rose-500/80 backdrop-blur-sm flex flex-col items-center justify-center text-white pointer-events-none animate-fade-in">
              <i className="fas fa-cloud-upload-alt text-6xl mb-4 animate-bounce"></i>
              <h2 className="text-3xl font-bold">Drop Audio Files Here</h2>
              <p>to add them to your library</p>
          </div>
      )}

      {/* SIDEBAR */}
      <div className="hidden md:flex h-full">
        <Sidebar 
          onTabChange={setActiveTab}
          activeTab={activeTab}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full relative min-w-0 bg-white/50 dark:bg-black/20 z-0">
          
          <div className="blob-container opacity-50 pointer-events-none">
              <div className="blob blob-1 mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
              <div className="blob blob-2 mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 pt-4 px-4 md:pt-8 md:px-8 pb-32">
              <LibraryView 
                allSongs={allSongs} 
                radioStations={radioStations}
                activeTab={activeTab}
                recommendations={recommendations}
                onPlaySong={handlePlaySong}
                onUpload={handleFileUpload}
                onDeleteSong={handleDeleteSong}
                onShare={handleOpenShare}
                onToggleLike={handleToggleLike}
                onEditSong={handleEditSong}
                onTabChange={setActiveTab}
                currentRadioGenre={radioGenre}
                onRadioGenreChange={setRadioGenre}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
              />
          </div>

          <div className="md:hidden fixed bottom-20 left-0 w-full z-50 px-4 flex justify-center">
             <MiniPlayer 
                song={currentSong}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onClick={() => {
                  playUiSound('open');
                  setIsFullPlayerOpen(true);
                }}
             />
          </div>

          <div className="md:hidden fixed bottom-0 w-full z-50">
             <BottomNav 
                activeTab={activeTab}
                onTabChange={setActiveTab}
             />
          </div>

      </div>

      <div className="hidden md:flex absolute bottom-0 w-full z-50">
        <PlayerBar 
          song={currentSong} 
          isPlaying={isPlaying} 
          onTogglePlay={togglePlay} 
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onToggleLike={handleToggleLike}
          playbackMode={playbackMode}
          onToggleMode={togglePlaybackMode}
          onNext={playNext}
          onPrev={playPrevious}
          onOpenFullPlayer={() => {
            playUiSound('open');
            setIsFullPlayerOpen(true);
          }}
        />
      </div>

      <FullPlayer 
          isOpen={isFullPlayerOpen}
          onClose={() => {
            playUiSound('close');
            setIsFullPlayerOpen(false);
          }}
          song={currentSong}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onToggleLike={handleToggleLike}
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          playbackMode={playbackMode}
          onToggleMode={togglePlaybackMode}
          onNext={playNext}
          onPrev={playPrevious}
          onShare={() => currentSong && handleOpenShare(currentSong)}
          analyser={analyserRef.current}
          lyrics={lyrics}
      />
      
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        song={songToShare}
        mode="share_song"
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        song={songToEdit}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default App;
