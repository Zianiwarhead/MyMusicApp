import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Song, SmartPlaylist, User } from './types';
import LibraryView from './components/LibraryView';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import FullPlayer from './components/FullPlayer';
import ShareModal from './components/ShareModal';
import ProfileModal from './components/ProfileModal';

// --- DEMO DATA ---

const INITIAL_SONGS: Song[] = [
  { id: '1', title: 'Flower Boy', artist: 'Tyler, The Creator', genre: 'Hip-Hop', artUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Tyler%2C_the_Creator_-_Flower_Boy.png' },
  { id: '2', title: 'Currents', artist: 'Tame Impala', genre: 'Psychedelic Rock', artUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9b/Tame_Impala_-_Currents.png' },
  { id: '3', title: 'Starboy', artist: 'The Weeknd', genre: 'R&B', artUrl: 'https://upload.wikimedia.org/wikipedia/en/3/39/The_Weeknd_-_Starboy.png' },
  { id: '4', title: 'After Hours', artist: 'The Weeknd', genre: 'R&B', artUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png' },
  { id: '5', title: 'Random Access Memories', artist: 'Daft Punk', genre: 'Electronic', artUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg' },
  { id: 'lofi_demo', title: 'Study Beats 24/7', artist: 'Lofi Girl', genre: 'Lo-Fi', artUrl: 'https://i1.sndcdn.com/artworks-000572624843-evj69k-t500x500.jpg' },
  { id: 'phonk_demo', title: 'Drift Phonk', artist: 'Kordhell', genre: 'Phonk', artUrl: 'https://i1.sndcdn.com/artworks-Pq39687S8n3y-0-t500x500.jpg' },
];

const EXTENDED_CATALOG: Song[] = [
    { id: 'c1', title: 'Midnight City', artist: 'M83', genre: 'Electronic', artUrl: 'https://upload.wikimedia.org/wikipedia/en/4/47/M83_-_Midnight_City.jpg' },
    { id: 'c2', title: 'Chamber of Reflection', artist: 'Mac DeMarco', genre: 'Psychedelic Rock', artUrl: 'https://upload.wikimedia.org/wikipedia/en/6/65/Mac_DeMarco_-_Salad_Days.png' },
    { id: 'c3', title: 'Passionfruit', artist: 'Drake', genre: 'Hip-Hop', artUrl: 'https://upload.wikimedia.org/wikipedia/en/a/ae/Drake_-_More_Life_cover.jpg' },
    { id: 'c4', title: 'Lofi Rain', artist: 'Chillhop', genre: 'Lo-Fi', artUrl: 'https://f4.bcbits.com/img/a3399062327_10.jpg' },
    { id: 'c5', title: 'Cowbell Cult', artist: 'Smoke', genre: 'Phonk', artUrl: 'https://i.scdn.co/image/ab67616d0000b2735759715569502a9261da247d' },
];

const MOCK_FRIENDS: User[] = [
  { 
      id: 'u1', name: 'Alex', isOnline: true, avatar: 'https://ui-avatars.com/api/?name=Alex&background=random', status: 'Vibing to Lofi',
      publicPlaylists: [
          { id: 'pl_alex_1', name: 'Study Session', genreTarget: 'Lo-Fi', songs: [INITIAL_SONGS[5]], coverArt: 'https://media.istockphoto.com/id/1295963289/vector/lo-fi-hip-hop-girl.jpg?s=612x612&w=0&k=20&c=L28XJ7-7w5W9T0nFpZ7k5F5tZ8e3w9j5X8n4f5x6y7z', owner: 'Alex', isCollaborative: true }
      ]
  },
  { 
      id: 'u2', name: 'Sam', isOnline: false, avatar: 'https://ui-avatars.com/api/?name=Sam&background=random', status: 'Last seen 2h ago',
      publicPlaylists: [
          { id: 'pl_sam_1', name: 'Gym Phonk', genreTarget: 'Phonk', songs: [INITIAL_SONGS[6]], coverArt: 'https://i1.sndcdn.com/artworks-Pq39687S8n3y-0-t500x500.jpg', owner: 'Sam' }
      ]
  },
  { id: 'u3', name: 'Jordan', isOnline: true, avatar: 'https://ui-avatars.com/api/?name=Jordan&background=random', status: 'Listening to The Weeknd' },
];


const App: React.FC = () => {
  // Data State
  const [allSongs, setAllSongs] = useState<Song[]>(INITIAL_SONGS);
  const [friends, setFriends] = useState<User[]>(MOCK_FRIENDS);
  const [listeningHistory, setListeningHistory] = useState<string[]>([]); // Array of Genre strings

  // Playback State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);

  // Audio Reference for Real Playback
  const audioRef = useRef<HTMLAudioElement>(null);

  // UI State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalMode, setShareModalMode] = useState<'share_song' | 'invite_friends'>('share_song');
  const [songToShare, setSongToShare] = useState<Song | null>(null);
  
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);


  // --- SMART LOGIC ---

  // 1. Analyze Library to create Smart Playlists automatically
  const smartPlaylists: SmartPlaylist[] = useMemo(() => {
    const genres = Array.from(new Set(allSongs.map(s => s.genre || 'Pop')));
    const playlists: SmartPlaylist[] = [];

    const rules = [
      { key: 'Lo-Fi', name: 'Lofi Focus', cover: 'https://media.istockphoto.com/id/1295963289/vector/lo-fi-hip-hop-girl.jpg?s=612x612&w=0&k=20&c=L28XJ7-7w5W9T0nFpZ7k5F5tZ8e3w9j5X8n4f5x6y7z' },
      { key: 'Phonk', name: 'Phonk Drift', cover: 'https://i.pinimg.com/736x/2e/78/3f/2e783f94796332822944b0239f604473.jpg' },
      { key: 'Hip-Hop', name: 'Hip-Hop Essentials', cover: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Synthesizer_collection.jpg/1200px-Synthesizer_collection.jpg' },
      { key: 'Psychedelic Rock', name: 'Psych Vibes', cover: 'https://m.media-amazon.com/images/I/81+j7-8c31L._UF1000,1000_QL80_.jpg' }
    ];

    genres.forEach(genre => {
      const songsInGenre = allSongs.filter(s => s.genre === genre);
      if (songsInGenre.length > 0) {
        const rule = rules.find(r => r.key === genre);
        playlists.push({
          id: `smart_${genre}`,
          name: rule ? rule.name : `${genre} Mix`,
          genreTarget: genre,
          songs: songsInGenre,
          coverArt: rule ? rule.cover : songsInGenre[0].artUrl,
          owner: 'Vibe AI'
        });
      }
    });

    return playlists;
  }, [allSongs]);

  // 2. Generate Recommendations based on History + Library
  const recommendations: Song[] = useMemo(() => {
    const genreCounts: Record<string, number> = {};
    
    allSongs.forEach(s => {
        const g = s.genre || 'Pop';
        genreCounts[g] = (genreCounts[g] || 0) + 1;
    });

    listeningHistory.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 2;
    });

    const topGenres = Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([g]) => g);

    if (topGenres.length === 0) return [];

    const libraryIds = new Set(allSongs.map(s => s.id));
    return EXTENDED_CATALOG.filter(s => 
        topGenres.includes(s.genre) && !libraryIds.has(s.id)
    );
  }, [allSongs, listeningHistory]);

  // 3. Aggregate Community Playlists
  const communityPlaylists = useMemo(() => {
      return friends.flatMap(f => f.publicPlaylists || []);
  }, [friends]);


  // --- HANDLERS ---

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newSongs: Song[] = [];
    
    Array.from(files).forEach((file) => {
      const name = file.name.toLowerCase();
      let detectedGenre = 'Pop'; 
      
      if (name.includes('lofi') || name.includes('chill')) detectedGenre = 'Lo-Fi';
      else if (name.includes('phonk') || name.includes('drift')) detectedGenre = 'Phonk';
      else if (name.includes('rock') || name.includes('metal')) detectedGenre = 'Rock';
      else if (name.includes('rap') || name.includes('hip')) detectedGenre = 'Hip-Hop';
      else if (name.includes('electronic') || name.includes('dance')) detectedGenre = 'Electronic';

      newSongs.push({
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Local Artist', 
        artUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${file.name}`,
        genre: detectedGenre,
        fileUrl: URL.createObjectURL(file), 
        isLocal: true,
      });
    });

    setAllSongs(prev => [...prev, ...newSongs]);
  };

  // --- PLAYBACK LOGIC ---

  // 1. Manage Audio Source
  useEffect(() => {
      if (currentSong) {
          if (currentSong.fileUrl && audioRef.current) {
              // Real File Playback
              audioRef.current.src = currentSong.fileUrl;
              audioRef.current.load();
              if (isPlaying) {
                  audioRef.current.play().catch(e => {
                      console.error("Autoplay prevented:", e);
                      setIsPlaying(false);
                  });
              }
          } else if (audioRef.current) {
              // Demo Simulation
              audioRef.current.pause();
              audioRef.current.src = "";
          }
      }
  }, [currentSong]);

  // 2. Manage Play/Pause State
  useEffect(() => {
      if (audioRef.current && currentSong?.fileUrl) {
          if (isPlaying) {
              audioRef.current.play().catch(e => console.error("Playback error:", e));
          } else {
              audioRef.current.pause();
          }
      }
  }, [isPlaying, currentSong]);

  // 3. Simulation Loop (Only for demo songs without files)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Only run simulation if we DON'T have a real file
    if (isPlaying && !currentSong?.fileUrl) {
      interval = setInterval(() => {
        setProgress((prev) => {
            if (prev >= 100) {
                handleSongEnd();
                return 0;
            }
            return prev + 0.5; // Simulate progress
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSong]);

  const handleSongEnd = () => {
       if (currentSong && currentSong.genre) {
            setListeningHistory(h => [...h, currentSong.genre]);
        }
        setIsPlaying(false);
        setProgress(0);
  };

  const handleAudioTimeUpdate = () => {
      if (audioRef.current && audioRef.current.duration) {
          const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(p);
      }
  };

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      setProgress(0);
      setListeningHistory(prev => [...prev, song.genre]);
    }
  };

  const handlePlayPlaylist = (playlist: SmartPlaylist) => {
      if (playlist.songs.length > 0) {
          handlePlaySong(playlist.songs[0]);
      }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // --- SOCIAL HANDLERS ---

  const handleOpenShare = (song: Song) => {
    setSongToShare(song);
    setShareModalMode('share_song');
    setIsShareModalOpen(true);
  };

  const handleOpenInvite = () => {
    setShareModalMode('invite_friends');
    setIsShareModalOpen(true);
  };

  const handleSelectUser = (user: User) => {
      setSelectedProfile(user);
      setIsProfileModalOpen(true);
  };

  const handleFollowToggle = (userId: string) => {
      setFriends(prev => prev.map(u => 
          u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u
      ));
  };


  return (
    <div className="flex h-screen w-screen bg-[#f3f4f6] overflow-hidden relative">
      
      {/* HIDDEN AUDIO ELEMENT FOR REAL PLAYBACK */}
      <audio 
          ref={audioRef}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleSongEnd}
          onError={(e) => console.error("Audio playback error", e)}
      />

      {/* ATMOSPHERIC BACKGROUND */}
      <div className="blob-container">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
      </div>

      <Sidebar 
        smartPlaylists={smartPlaylists} 
        friends={friends}
        onInvite={handleOpenInvite}
        onSelectUser={handleSelectUser}
      />

      <div className="flex flex-col flex-1 relative min-w-0 z-10 glass rounded-l-[40px] my-2 mr-2 shadow-2xl overflow-hidden border border-white/50">
          <div className="flex-1 relative overflow-hidden bg-white/50">
              <LibraryView 
                allSongs={allSongs} 
                recommendations={recommendations}
                smartPlaylists={smartPlaylists}
                communityPlaylists={communityPlaylists}
                onPlaySong={handlePlaySong}
                onPlayPlaylist={handlePlayPlaylist} 
                onUpload={handleFileUpload}
                onShare={handleOpenShare}
              />
              
              <FullPlayer 
                  isOpen={isFullPlayerOpen}
                  onClose={() => setIsFullPlayerOpen(false)}
                  song={currentSong}
                  isPlaying={isPlaying}
                  onTogglePlay={togglePlay}
                  progress={progress}
                  onShare={() => currentSong && handleOpenShare(currentSong)}
              />
              
              <ShareModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                song={songToShare}
                mode={shareModalMode}
              />

              <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={selectedProfile}
                onFollowToggle={handleFollowToggle}
                onPlayPlaylist={(pl) => {
                    handlePlayPlaylist(pl);
                    setIsProfileModalOpen(false);
                }}
              />
          </div>

          <PlayerBar 
             song={currentSong}
             isPlaying={isPlaying}
             onTogglePlay={togglePlay}
             progress={progress}
             onOpenFullPlayer={() => currentSong && setIsFullPlayerOpen(true)}
          />
      </div>
    </div>
  );
};

export default App;