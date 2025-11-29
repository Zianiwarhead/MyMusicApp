export interface Song {
  id: string;
  title: string;
  artist: string;
  artUrl: string;
  genre: string; // Made required for easier logic, default to 'Pop' if unknown
  fileUrl?: string; // For local playback
  isLocal?: boolean; // To distinguish user uploads
}

export interface PlaybackState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number; // 0 to 100
}

export interface SmartPlaylist {
  id: string;
  name: string;
  genreTarget: string;
  songs: Song[];
  coverArt: string;
  owner?: string; // 'You' or User Name
  isCollaborative?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  isFollowing?: boolean;
  publicPlaylists?: SmartPlaylist[];
  status?: string; // e.g., "Listening to Lofi"
}
