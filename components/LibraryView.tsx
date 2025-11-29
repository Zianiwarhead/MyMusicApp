import React, { useRef } from 'react';
import { Song, SmartPlaylist, User } from '../types';

interface LibraryViewProps {
  allSongs: Song[];
  recommendations: Song[];
  smartPlaylists: SmartPlaylist[];
  communityPlaylists?: SmartPlaylist[]; // Playlists from friends
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
    <div className="w-full h-full overflow-y-auto custom-scrollbar relative z-10">
      
      {/* Top Banner / Header Area */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-gray-100 flex justify-between items-center shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Discover</h1>
        <div className="flex items-center gap-4">
             <div className="relative group">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors"></i>
                <input type="text" placeholder="Search..." className="bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 w-64 transition-all" />
             </div>
             
             {/* Upload Button */}
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
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg hover:shadow-xl"
             >
                <i className="fas fa-cloud-upload-alt"></i> Upload
             </button>

             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors border-2 border-white shadow-sm">
                <img src="https://ui-avatars.com/api/?name=You&background=random" className="w-full h-full rounded-full" />
             </div>
        </div>
      </div>

      <div className="p-8 pb-32 space-y-10">
          
          {/* Smart Playlists Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <i className="fas fa-wand-magic-sparkles text-rose-500"></i> Smart Mixes
                </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {smartPlaylists.map((playlist) => (
                    <div key={playlist.id} className="group cursor-pointer relative overflow-hidden rounded-2xl aspect-video bg-gray-900 transition-all hover:shadow-xl hover:-translate-y-1" onClick={() => onPlayPlaylist && onPlayPlaylist(playlist)}>
                        <img src={playlist.coverArt} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity duration-500 transform group-hover:scale-110" alt={playlist.name} />
                        <div className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                            <h3 className="text-white font-bold text-lg mb-0.5">{playlist.name}</h3>
                            <p className="text-gray-300 text-xs font-medium">{playlist.songs.length} Tracks • {playlist.genreTarget}</p>
                        </div>
                        <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1 rounded text-[10px] text-white font-bold uppercase tracking-wider">
                            AI Mix
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                                 <i className="fas fa-play text-black ml-1"></i>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Recommendations based on History */}
          {recommendations.length > 0 && (
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-3xl border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">For You</h2>
                            <p className="text-sm text-gray-500">Based on your recent listening habits.</p>
                        </div>
                    </div>
                    <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
                        {recommendations.map(song => (
                            <div key={song.id} className="flex-shrink-0 w-36 cursor-pointer group" onClick={() => onPlaySong(song)}>
                                <div className="w-36 h-36 rounded-2xl overflow-hidden shadow-sm mb-3 relative">
                                    <img src={song.artUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={song.title} />
                                    <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center backdrop-blur-[2px] transition-all">
                                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                                            <i className="fas fa-play text-rose-500 ml-0.5"></i>
                                        </div>
                                    </div>
                                </div>
                                <p className="font-bold text-sm text-gray-900 truncate px-1">{song.title}</p>
                                <p className="text-xs text-gray-500 truncate px-1">{song.artist}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          )}

           {/* Friend Activity / Community Playlists */}
           {communityPlaylists.length > 0 && (
             <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <i className="fas fa-users text-blue-500"></i> Community Picks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {communityPlaylists.map(playlist => (
                        <div key={playlist.id} className="flex items-center gap-4 bg-white hover:bg-gray-50 p-3 rounded-2xl border border-gray-100 transition-all hover:shadow-md cursor-pointer group" onClick={() => onPlayPlaylist && onPlayPlaylist(playlist)}>
                             <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0">
                                 <img src={playlist.coverArt} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/10 hidden group-hover:flex items-center justify-center">
                                      <i className="fas fa-play text-white"></i>
                                  </div>
                             </div>
                             <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-gray-900 truncate">{playlist.name}</h4>
                                 <p className="text-xs text-gray-500 truncate">By {playlist.owner} • {playlist.isCollaborative ? 'Collab' : 'Solo'}</p>
                             </div>
                             {playlist.isCollaborative && (
                                 <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center" title="Collaborative Playlist">
                                     <i className="fas fa-user-group text-xs"></i>
                                 </div>
                             )}
                        </div>
                    ))}
                </div>
             </div>
           )}

          {/* Recently Added / All Songs */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Your Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {recentSongs.map((song) => (
                <div 
                  key={song.id} 
                  className="flex items-center gap-3 bg-white/60 hover:bg-white p-2 pr-4 rounded-xl transition-all border border-transparent hover:border-gray-100 hover:shadow-sm cursor-pointer group"
                  onClick={() => onPlaySong(song)}
                >
                  <div className="relative w-12 h-12 flex-shrink-0">
                      <img src={song.artUrl} className="w-12 h-12 rounded-lg object-cover shadow-sm" alt={song.title} />
                      <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center rounded-lg">
                           <i className="fas fa-play text-white text-xs"></i>
                      </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate text-sm">{song.title}</h4>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        {song.artist}
                        {song.isLocal && <span className="px-1.5 py-0.5 bg-gray-200 rounded text-[9px] font-bold text-gray-600 uppercase">Local</span>}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-rose-500 transition-colors"
                        onClick={(e) => { e.stopPropagation(); /* Like */ }}
                      >
                        <i className="far fa-heart"></i>
                      </button>
                      <button 
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onShare(song);
                        }}
                      >
                        <i className="fas fa-share-nodes"></i>
                      </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
};

export default LibraryView;
