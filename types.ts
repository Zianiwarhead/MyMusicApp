
export interface Song {
  id: string;
  title: string;
  artist: string;
  artUrl: string;
  genre: string; 
  fileUrl?: string; // For local playback
  isLocal?: boolean; // To distinguish user uploads
  isRadio?: boolean;
  lyrics?: string;
  radioUrl?: string;
  isLiked?: boolean;
}

export interface PlaybackState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number; // 0 to 100
  duration: number; // in seconds
  mode: 'normal' | 'repeat_one' | 'repeat_list' | 'shuffle';
}

export interface SmartPlaylist {
  id: string;
  name: string;
  coverArt: string;
  songs: Song[];
  isCollaborative: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  isFollowing: boolean;
  status?: string;
  publicPlaylists?: SmartPlaylist[];
}

export type PlaybackMode = 'normal' | 'repeat_one' | 'repeat_list' | 'shuffle';