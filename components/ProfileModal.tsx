import React from 'react';
import { User, SmartPlaylist } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onFollowToggle: (userId: string) => void;
  onPlayPlaylist: (playlist: SmartPlaylist) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onFollowToggle, onPlayPlaylist }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#18181b] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all scale-100" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Photo area */}
        <div className="h-32 bg-gradient-to-r from-rose-200 to-blue-200 dark:from-rose-900 dark:to-blue-900 relative">
             <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors">
                <i className="fas fa-times"></i>
             </button>
        </div>

        <div className="px-8 pb-8">
            {/* Avatar & Header */}
            <div className="relative -mt-12 mb-4 flex justify-between items-end">
                <div className="relative">
                    <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white dark:border-[#18181b] shadow-lg" alt={user.name} />
                    {user.isOnline && <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-[#18181b] rounded-full"></div>}
                </div>
                <button 
                    onClick={() => onFollowToggle(user.id)}
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${user.isFollowing ? 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'}`}
                >
                    {user.isFollowing ? 'Following' : 'Follow'}
                </button>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    {user.status || 'Music Enthusiast'}
                </p>
                <div className="flex gap-4 mt-3 text-sm">
                    <span className="font-semibold text-gray-900 dark:text-white">124 <span className="font-normal text-gray-500 dark:text-gray-400">Followers</span></span>
                    <span className="font-semibold text-gray-900 dark:text-white">45 <span className="font-normal text-gray-500 dark:text-gray-400">Following</span></span>
                </div>
            </div>

            {/* Public Playlists */}
            <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Public Playlists</h3>
                <div className="space-y-3">
                    {user.publicPlaylists && user.publicPlaylists.length > 0 ? (
                        user.publicPlaylists.map(playlist => (
                            <div key={playlist.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg cursor-pointer group transition-colors" onClick={() => onPlayPlaylist(playlist)}>
                                <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                                    <img src={playlist.coverArt} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center">
                                        <i className="fas fa-play text-white text-xs"></i>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{playlist.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{playlist.songs.length} Tracks • {playlist.isCollaborative ? 'Collaborative' : 'Solo'}</p>
                                </div>
                                {playlist.isCollaborative && (
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">Collab</span>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400 italic">No public playlists yet.</p>
                    )}
                </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
                <button className="w-full py-3 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <i className="fas fa-envelope"></i> Invite to Collaborate
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;