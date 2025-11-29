import React from 'react';
import { SmartPlaylist, User } from '../types';

interface SidebarProps {
    smartPlaylists?: SmartPlaylist[];
    friends?: User[];
    onInvite?: () => void;
    onSelectUser?: (user: User) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ smartPlaylists = [], friends = [], onInvite, onSelectUser }) => {
  return (
    <div className="w-64 h-full bg-[#f8f8fa]/90 backdrop-blur-xl flex flex-col border-r border-gray-200 z-20 flex-shrink-0 relative">
      <div className="p-6">
         <div className="flex items-center gap-2 mb-8 text-rose-500 cursor-pointer select-none">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-lg flex items-center justify-center shadow-lg text-white">
                <i className="fas fa-music text-sm"></i>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Vibe</span>
         </div>
         
         <div className="space-y-1">
            <NavItem icon="fa-house" label="Home" active />
            <NavItem icon="fa-compass" label="Discover" />
            <NavItem icon="fa-broadcast-tower" label="Radio" />
         </div>
      </div>
      
      <div className="p-6 pt-0">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Library</h3>
           <div className="space-y-1">
            <NavItem icon="fa-clock" label="Recent" />
            <NavItem icon="fa-heart" label="Favorites" />
            <NavItem icon="fa-folder" label="Local Files" />
         </div>
      </div>

       <div className="p-6 pt-0 flex-1 overflow-y-auto no-scrollbar">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Smart Mixes</h3>
           <div className="space-y-1">
            {/* Dynamic Smart Playlists */}
            {smartPlaylists.map(playlist => (
                <NavItem key={playlist.id} icon="fa-wand-magic-sparkles" label={playlist.name} />
            ))}
            
            {/* Fallback Static */}
            {smartPlaylists.length === 0 && (
                 <div className="px-3 py-2 text-xs text-gray-400 italic">
                    Add music to generate smart playlists...
                 </div>
            )}
            
            <div className="my-4 border-t border-gray-200"></div>
            
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Community</h3>
            {friends.map(friend => (
                <div 
                    key={friend.id} 
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200/50 transition-colors group"
                    onClick={() => onSelectUser && onSelectUser(friend)}
                >
                    <div className="relative">
                        <img src={friend.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-200" alt={friend.name} />
                        {friend.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{friend.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{friend.status || (friend.isOnline ? 'Online' : 'Offline')}</p>
                    </div>
                </div>
            ))}

            <button onClick={onInvite} className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-2 mt-2">
                <i className="fas fa-plus-circle"></i> Invite Friends
            </button>
         </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }: { icon: string, label: string, active?: boolean }) => (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${active ? 'bg-gray-200/80 text-rose-500' : 'text-gray-600 hover:bg-gray-200/50'}`}>
        <div className="w-5 flex justify-center">
             <i className={`fas ${icon} ${active ? 'text-rose-500' : 'text-gray-400 group-hover:text-gray-600'}`}></i>
        </div>
        <span className={`text-sm font-medium ${active ? 'font-semibold' : ''} truncate`}>{label}</span>
    </div>
);

export default Sidebar;
