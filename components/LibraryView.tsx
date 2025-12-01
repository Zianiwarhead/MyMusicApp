
import React, { useRef } from 'react';
import { Song, SmartPlaylist } from '../types';

interface LibraryViewProps {
  allSongs: Song[];
  recommendations: Song[];
  smartPlaylists: SmartPlaylist[];
  communityPlaylists?: SmartPlaylist[];
  onPlaySong: (song: Song) => void;
  onPlayPlaylist?: (playlist: SmartPlaylist) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onShare: (song: Song) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ 
    allSongs, 
    recommendations, 
    smartPlaylists, 
    communityPlaylists = [],
    onPlaySong, 
    onPlayPlaylist,
    onUpload, 
    onShare 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter recently added
  const recentSongs = [...allSongs].reverse().slice(0, 12);

  return (
    <div className="w-full max-w-7xl mx-auto pb-4">
      
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between md:items-center relative z-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Discover</h1>
          <div className="flex items-center gap-3">
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={onUpload} 
                className="hidden" 
                accept="audio/*" 
                multiple 
             />
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform gap-2 font-medium text-sm hover:bg-gray-800"
             >
                <i className="fas fa-cloud-upload-alt"></i> <span className="hidden md:inline">Upload Music</span><span className="md:hidden">Upload</span>
             </button>
             <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-white flex items-center justify-center text-gray-500 cursor-pointer shadow-sm">
                 <i className="fas fa-user"></i>
             </div>
          </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 md:gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
          <button className="px-5 py-2 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap">All</button>
          <button className="px-5 py-2 bg-white text-black rounded-full text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors whitespace-nowrap">Mixes</button>
          <button className="px-5 py-2 bg-white text-black rounded-full text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors whitespace-nowrap">Local</button>
          <button className="px-5 py-2 bg-white text-black rounded-full text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors whitespace-nowrap">Friends</button>
      </div>

      <div className="space-y-10">
          
          {/* Smart Playlists Section */}
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800">Smart Mixes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {smartPlaylists.map((playlist) => (
                    <div key={playlist.id} className="group cursor-pointer" onClick={() => onPlayPlaylist && onPlayPlaylist(playlist)}>
                        <div className="aspect-square rounded-2xl bg-gray-900 mb-3 overflow-hidden relative shadow-lg group-hover:shadow-xl transition-all group-hover:-translate-y-1">
                            <img src={playlist.coverArt} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt={playlist.name} />
                            <div className="absolute inset-0 flex items-end p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <span className="text-white text-xs md:text-sm font-bold">{playlist.genreTarget}</span>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-black">
                                    <i className="fas fa-play ml-1 text-sm md:text-base"></i>
                                </div>
                            </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">{playlist.name}</h3>
                        <p className="text-xs text-gray-500">{playlist.songs.length} Tracks</p>
                    </div>
                ))}
            </div>
          </div>

          {/* Recommendations based on History */}
          {recommendations.length > 0 && (
            <div>
                <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800">For You</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                    {recommendations.map(song => (
                        <div key={song.id} className="cursor-pointer group" onClick={() => onPlaySong(song)}>
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-md mb-3 bg-gray-200 relative group-hover:shadow-lg transition-all">
                                <img src={song.artUrl} className="w-full h-full object-cover" alt={song.title} />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <i className="fas fa-play text-white text-2xl drop-shadow-lg"></i>
                                </div>
                            </div>
                            <p className="font-semibold text-sm text-gray-900 truncate">{song.title}</p>
                            <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                        </div>
                    ))}
                </div>
            </div>
          )}

           {/* Friend Activity / Community Picks */}
           {communityPlaylists.length > 0 && (
             <div>
                <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800">Community Picks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {communityPlaylists.map(playlist => (
                        <div key={playlist.id} className="flex items-center gap-4 bg-white/60 backdrop-blur p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-white/50" onClick={() => onPlayPlaylist && onPlayPlaylist(playlist)}>
                             <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                                 <img src={playlist.coverArt} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-gray-900 truncate text-sm md:text-base">{playlist.name}</h4>
                                 <p className="text-xs text-gray-500 truncate mt-1">By <span className="text-rose-500 font-medium">{playlist.owner}</span> • {playlist.isCollaborative ? 'Collab' : 'Solo'}</p>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                 <i className="fas fa-chevron-right text-xs"></i>
                             </div>
                        </div>
                    ))}
                </div>
             </div>
           )}

          {/* Recently Added List */}
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-800">Your Tracks</h2>
            <div className="bg-white/70 backdrop-blur rounded-3xl p-2 shadow-sm border border-white/60">
              {recentSongs.map((song, index) => (
                <div 
                  key={song.id} 
                  className="relative flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-white rounded-2xl cursor-pointer group transition-colors hover:shadow-sm"
                  onClick={() => onPlaySong(song)}
                  title={`${song.title} by ${song.artist} (${song.genre})`}
                >
                  <span className="w-6 text-center text-gray-400 text-xs font-medium group-hover:hidden hidden md:block">{index + 1}</span>
                  <span className="w-6 text-center text-gray-800 text-xs hidden group-hover:block"><i className="fas fa-play"></i></span>
                  
                  <img src={song.artUrl} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover bg-gray-200 shadow-sm" alt={song.title} />
                  
                  <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center md:gap-4">
                    <div className="md:w-1/3">
                        <h4 className="font-semibold text-gray-900 truncate text-sm">{song.title}</h4>
                        <div className="md:hidden text-xs text-gray-500 truncate">{song.artist}</div>
                    </div>
                    <div className="hidden md:flex md:w-1/3 text-xs text-gray-500 truncate items-center gap-2">
                        {song.artist}
                        {song.isLocal && <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-600 text-[10px] font-bold">LOCAL</span>}
                    </div>
                    <div className="hidden md:block md:w-1/3 text-xs text-gray-400 truncate text-right pr-4">
                        {song.genre}
                    </div>
                  </div>

                  <button 
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors md:opacity-0 md:group-hover:opacity-100"
                    onClick={(e) => {
                        e.stopPropagation();
                        onShare(song);
                    }}
                  >
                    <i className="fas fa-share-nodes"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
};

export default LibraryView;
