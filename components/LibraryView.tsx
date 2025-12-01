import React, { useState } from 'react';
import { Song } from '../types';
import RadioView from './RadioView';

interface LibraryViewProps {
  allSongs: Song[];
  onPlaySong: (song: Song) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  recommendations?: Song[];
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
}

const LibraryView: React.FC<LibraryViewProps> = ({ 
    allSongs, 
    onPlaySong, 
    onUpload, 
    recommendations = [], 
    onToggleTheme, 
    isDarkMode 
}) => {
  const [tab, setTab] = useState<'all' | 'radio' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Search Logic
  const filteredSongs = allSongs.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.artist.toLowerCase().includes(searchQuery.toLowerCase());
    if (tab === 'favorites') return matchesSearch && s.isLiked;
    return matchesSearch;
  });

  const handlePlayRadio = (url: string, name: string, icon: string) => {
     const radioSong: Song = {
         id: `radio_${Date.now()}`,
         title: name,
         artist: 'Live Radio',
         artUrl: icon,
         genre: 'Radio',
         fileUrl: url,
         isRadio: true,
         isLocal: false
     };
     onPlaySong(radioSong);
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-4">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between md:items-center relative z-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Discover</h1>
          
          <div className="flex items-center gap-3">
             {/* Mobile Theme Toggle (Hidden on Desktop) */}
             <button 
                onClick={onToggleTheme}
                className="md:hidden w-10 h-10 rounded-full bg-white dark:bg-white/10 text-gray-600 dark:text-white flex items-center justify-center shadow-sm"
             >
                <i className={`fas ${isDarkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-indigo-500'}`}></i>
             </button>

             <label className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all gap-2 font-medium text-sm cursor-pointer">
                <i className="fas fa-cloud-upload-alt"></i> <span className="hidden md:inline">Upload Music</span><span className="md:hidden">Upload</span>
                <input type="file" onChange={onUpload} className="hidden" accept="audio/*" multiple />
             </label>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 md:gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
          {['all', 'radio', 'favorites'].map((t) => (
              <button 
                key={t}
                onClick={() => setTab(t as any)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap capitalize transition-colors ${
                    tab === t 
                    ? 'bg-black dark:bg-white text-white dark:text-black' 
                    : 'bg-white dark:bg-white/10 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/20'
                }`}
              >
                  {t}
              </button>
          ))}
      </div>

      {tab === 'radio' ? (
          <RadioView onPlayRadio={handlePlayRadio} />
      ) : (
        <>
          {/* Recommendations / Rediscover Gems */}
          {recommendations.length > 0 && tab === 'all' && !searchQuery && (
              <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <i className="fas fa-sparkles text-rose-500"></i> Rediscover Gems
                  </h2>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                      {recommendations.map(song => (
                          <div 
                              key={song.id} 
                              className="flex-shrink-0 w-36 md:w-44 group cursor-pointer"
                              onClick={() => onPlaySong(song)}
                          >
                              <div className="w-full aspect-square rounded-2xl bg-gray-200 dark:bg-white/5 mb-3 overflow-hidden relative shadow-md">
                                  <img src={song.artUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={song.title} />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg text-white">
                                          <i className="fas fa-play pl-0.5"></i>
                                      </div>
                                  </div>
                              </div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{song.title}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Search Bar */}
          <div className="mb-6 relative group">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors"></i>
                <input 
                    type="text" 
                    placeholder="Search your tracks..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-white/5 border-none rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 transition-all shadow-sm outline-none"
                />
          </div>

          <div className="space-y-2">
            {filteredSongs.length > 0 ? filteredSongs.map((song, index) => (
                <div 
                  key={song.id} 
                  className="flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-white dark:hover:bg-white/10 rounded-2xl cursor-pointer group transition-colors hover:shadow-sm border border-transparent dark:hover:border-white/5"
                  onClick={() => onPlaySong(song)}
                >
                  <span className="w-6 text-center text-gray-400 text-xs font-medium group-hover:hidden hidden md:block">{index + 1}</span>
                  <span className="w-6 text-center text-rose-500 text-xs hidden group-hover:block"><i className="fas fa-play"></i></span>
                  
                  <img src={song.artUrl} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover bg-gray-200 dark:bg-gray-800 shadow-sm" alt="art" />
                  
                  <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center md:gap-4">
                    <div className="md:w-1/3">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm">{song.title}</h4>
                        <div className="md:hidden text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</div>
                    </div>
                    <div className="hidden md:flex md:w-1/3 text-xs text-gray-500 dark:text-gray-400 truncate items-center gap-2">
                        {song.artist}
                        {song.isLocal && <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 text-[10px] font-bold">LOCAL</span>}
                    </div>
                    <div className="hidden md:block md:w-1/3 text-xs text-gray-400 truncate text-right pr-4">
                        {song.genre}
                    </div>
                  </div>
                </div>
            )) : (
                <div className="text-center py-10 text-gray-400 dark:text-gray-600">
                    <p>No songs found. {tab === 'favorites' ? 'Go heart some tracks!' : 'Try dragging an MP3 here!'}</p>
                </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LibraryView;