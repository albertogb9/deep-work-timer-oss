// Playlist-related type definitions

export interface MusicGenre {
  id: string;
  name: string;
  color: string;
  videoId: string;
}

export interface PlaylistState {
  selectedGenre: string;
  isPlaying: boolean;
  isMuted: boolean;
  webViewLoaded: boolean;
  showDropdown: boolean;
}

export interface PlaylistActions {
  setSelectedGenre: (genre: string) => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  setWebViewLoaded: (loaded: boolean) => void;
  setShowDropdown: (show: boolean) => void;
}

export interface PlaylistUtils {
  getSelectedGenreData: () => MusicGenre | undefined;
  getYouTubeEmbedUrl: (videoId: string) => string;
}

export type PlaylistHook = PlaylistState & PlaylistActions & PlaylistUtils;