
import React, { useRef, useState } from 'react';
import { Song } from '../types';

interface LibraryViewProps {
  allSongs: Song[];
  radioStations: Song[];
  activeTab: string;
  recommendations: Song[];
  onPlaySong: (song: Song) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteSong?: (id: string) => void;
  onShare: (song: Song) => void;
  onToggleLike: (id: string) => void;
  onEditSong?: (song: Song) => void;
  onTabChange: (tab: string) => void;
  currentRadioGenre?: string;
  onRadioGenreChange?: (genre: string) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const RADIO_GENRES = ['lofi', 'pop', 'rock', 'jazz', 'classical', 'hip hop', 'electronic', 'news', 'country'];

const LibraryView: React.FC<LibraryViewProps> = ({ 
    allSongs, 
    radioStations,
    activeTab,
    onPlaySong, 
    onUpload, 
    onDeleteSong,
    onShare,
    onToggleLike,
    onEditSong,
    onTabChange,
    currentRadioGenre,
    onRadioGenreChange,
    isDarkMode,
    onToggleTheme
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Logic
  let displaySongs = [...allSongs];
  
  if (activeTab === 'Favorites') {
      displaySongs = displaySongs.filter(s => s.isLiked);
  } else if (activeTab === 'Local') {
      displaySongs = displaySongs.filter(s => s.isLocal);
  }

  // Search Filter
  displaySongs = displaySongs.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedList = [...displaySongs].reverse();

  return (
    <div className="w-full max-w-7xl mx-auto pb-4 transition-colors duration-300">
      
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between md:items-center relative z-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Discover</h1>
          
          <div className="flex flex-wrap items-center gap-3">
             {/* Search Bar */}
             <div className="relative group flex-grow md:flex-grow-0">
                 <input 
                    type="text" 
                    placeholder="Search library..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-48 pl-10 pr-4 py-2 bg-white dark:bg-white/10 rounded-full text-sm outline-none border border-transparent focus:border-rose-500 dark:text-white transition-all focus:w-full md:focus:w-64 shadow-sm"
                 />
                 <i className="fas fa-search absolute left-3.5 top-2.5 text-gray-400"></i>
             </div>

             <input type="file" ref={fileInputRef} onChange={onUpload} className="hidden" accept="audio/*" multiple />
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all gap-2 font-medium text-sm whitespace-nowrap"
             >
                <i className="fas fa-cloud-upload-alt"></i> <span>Upload</span>
             </button>

             {/* Theme Toggle Button - HIDDEN ON DESKTOP (md:hidden) to avoid duplicates */}
             <button 
                onClick={onToggleTheme}
                className="md:hidden w-10 h-10 rounded-full bg-white dark:bg-white/10 text-gray-600 dark:text-white flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-white/20 transition-all active:scale-95"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                <i className={`fas ${isDarkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-indigo-500'}`}></i>
            </button>
          </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 md:gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
          {['All', 'Radio', 'Favorites', 'Local'].map(tab => (
            <button 
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap shadow-sm border ${activeTab === tab ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-gray-700 border-transparent hover:bg-gray-50 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'}`}
            >
                {tab}
            </button>
          ))}
      </div>

      <div className="space-y-10">
          
          {/* RADIO VIEW */}
          {activeTab === 'Radio' && (
             <div className="animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <i className="fas fa-broadcast-tower text-rose-500"></i> Live Stations
                    </h2>
                    
                    {onRadioGenreChange && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {RADIO_GENRES.map(g => (
                                <button
                                    key={g}
                                    onClick={() => onRadioGenreChange(g)}
                                    className={`px-3 py-1 rounded-full capitalize whitespace-nowrap text-xs font-bold transition-colors ${
                                        currentRadioGenre === g 
                                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' 
                                        : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20'
                                    }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {radioStations.map((station) => (
                        <div key={station.id} className="group cursor-pointer" onClick={() => onPlaySong(station)}>
                            <div className="aspect-square rounded-2xl bg-gray-100 dark:bg-white/5 mb-3 overflow-hidden relative shadow-md group-hover:shadow-xl transition-all border border-gray-200 dark:border-white/5">
                                <img src={station.artUrl} className="w-full h-full object-cover p-4" alt={station.title} onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3075/3075836.png'} />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 dark:bg-black/40">
                                    <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center shadow-lg text-white transform scale-90 group-hover:scale-100 transition-transform">
                                        <i className="fas fa-play ml-1"></i>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">{station.title}</h3>
                            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> LIVE
                            </p>
                        </div>
                    ))}
                </div>
             </div>
          )}

          {/* MAIN LIST */}
          {activeTab !== 'Radio' && (
              <div className="animate-fade-in">
                <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    {searchQuery ? 'Search Results' : activeTab === 'Favorites' ? 'Liked Songs' : 'Your Tracks'}
                </h2>
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur rounded-3xl p-2 shadow-sm border border-white/60 dark:border-white/5 min-h-[300px]">
                  {displayedList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500 dark:text-gray-400">
                          <i className="fas fa-music text-4xl mb-4 opacity-50"></i>
                          <p className="text-lg font-medium mb-1">It's quiet here...</p>
                          <p className="text-sm opacity-70">
                              {activeTab === 'Favorites' ? 'Heart some tracks to see them here!' : 'Drag & drop audio files here to start listening.'}
                          </p>
                      </div>
                  ) : (
                      displayedList.map((song, index) => (
                        <div 
                          key={song.id} 
                          className="relative flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-white dark:hover:bg-white/10 rounded-2xl cursor-pointer group transition-colors hover:shadow-sm"
                          onClick={() => onPlaySong(song)}
                        >
                          <span className="w-6 text-center text-gray-400 dark:text-gray-600 text-xs font-medium group-hover:hidden hidden md:block">{index + 1}</span>
                          <span className="w-6 text-center text-rose-500 text-xs hidden group-hover:block"><i className="fas fa-play"></i></span>
                          
                          <img src={song.artUrl} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover bg-gray-200 dark:bg-white/10 shadow-sm" alt={song.title} />
                          
                          <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center md:gap-4">
                            <div className="md:w-1/3">
                                <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm">{song.title}</h4>
                                <div className="md:hidden text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</div>
                            </div>
                            <div className="hidden md:flex md:w-1/3 text-xs text-gray-500 dark:text-gray-400 truncate items-center gap-2">
                                {song.artist}
                                {song.isLocal && <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-[10px] font-bold">LOCAL</span>}
                            </div>
                            <div className="hidden md:block md:w-1/3 text-xs text-gray-400 dark:text-gray-500 truncate text-right pr-4">
                                {song.genre}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors md:opacity-0 md:group-hover:opacity-100 ${song.isLiked ? 'text-rose-500 opacity-100' : 'text-gray-400 dark:text-gray-500 hover:text-rose-500'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleLike(song.id);
                                }}
                            >
                                <i className={`${song.isLiked ? 'fas' : 'far'} fa-heart`}></i>
                            </button>

                            {/* EDIT BUTTON (Only for Local) */}
                            {song.isLocal && onEditSong && (
                                <button 
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors md:opacity-0 md:group-hover:opacity-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditSong(song);
                                    }}
                                    title="Edit Metadata"
                                >
                                    <i className="fas fa-pencil-alt text-xs"></i>
                                </button>
                            )}
                            
                            {song.isLocal && onDeleteSong && (
                                <button 
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors md:opacity-0 md:group-hover:opacity-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteSong(song.id);
                                    }}
                                    title="Delete Song"
                                >
                                    <i className="fas fa-trash text-xs"></i>
                                </button>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default LibraryView;
