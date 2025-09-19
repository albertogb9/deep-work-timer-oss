import { useState, useRef, useCallback } from 'react';
import { PlaylistHook, MusicGenre } from '../types';

/**
 * Custom hook for playlist functionality
 * Separates business logic from UI components
 */
export const usePlaylist = () => {
  // State
  const [selectedGenre, setSelectedGenre] = useState('lofi');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const webViewRef = useRef(null);

  // Music genres configuration
  const genres: MusicGenre[] = [
    {
      id: 'lofi',
      name: 'Chill Lofi',
      color: '#ff6b6b',
      videoId: 'CLeZyIID9Bo'
    },
    {
      id: 'dnb',
      name: "90's Drum & Bass",
      color: '#4ecdc4',
      videoId: 'rzRI7p_zfhg'
    },
    {
      id: 'sanandreas',
      name: 'San Andreas Radio',
      color: '#45b7d1',
      videoId: '-Vb2RnDK2vs'
    }
  ];

  // Ad blocking configuration
  const adBlockList = [
    'googlesyndication.com',
    'doubleclick.net',
    'googleadservices.com',
  ];

  /**
   * Get the currently selected genre data
   */
  const getSelectedGenreData = useCallback((): MusicGenre | undefined => {
    return genres.find(genre => genre.id === selectedGenre);
  }, [selectedGenre, genres]);

  /**
   * Generate YouTube embed URL with parameters
   */
  const getYouTubeEmbedUrl = useCallback((videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0&cc_load_policy=0&playsinline=1&enablejsapi=1`;
  }, []);

  /**
   * Toggle play/pause state and control WebView
   */
  const togglePlayPause = useCallback(() => {
    if (webViewRef.current && webViewLoaded) {
      const action = isPlaying ? 'pauseVideo' : 'playVideo';
      const jsCode = `
        if (window.YT && window.YT.get) {
          const player = window.YT.get('player');
          if (player && player.${action}) {
            player.${action}();
          }
        }
        true;
      `;
      
      (webViewRef.current as any).injectJavaScript(jsCode);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, webViewLoaded]);

  /**
   * Toggle mute state and control WebView
   */
  const toggleMute = useCallback(() => {
    if (webViewRef.current && webViewLoaded) {
      const action = isMuted ? 'unMute' : 'mute';
      const jsCode = `
        if (window.YT && window.YT.get) {
          const player = window.YT.get('player');
          if (player && player.${action}) {
            player.${action}();
          }
        }
        true;
      `;
      
      (webViewRef.current as any).injectJavaScript(jsCode);
    }
    setIsMuted(!isMuted);
  }, [isMuted, webViewLoaded]);

  /**
   * Change selected genre and reload WebView
   */
  const changeGenre = useCallback((genreId: string) => {
    setSelectedGenre(genreId);
    setIsPlaying(false);
    setIsMuted(false);
    setWebViewLoaded(false);
    setShowDropdown(false);
  }, []);

  /**
   * Get injected JavaScript for ad blocking and player setup
   */
  const getInjectedJavaScript = useCallback((): string => {
    return `
      // Block ad requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        if (${JSON.stringify(adBlockList)}.some(domain => url.includes(domain))) {
          return Promise.reject('Blocked by adblock');
        }
        return originalFetch.apply(this, args);
      };

      // Block ad-related network requests
      const originalXHR = window.XMLHttpRequest;
      window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        xhr.open = function(method, url) {
          if (${JSON.stringify(adBlockList)}.some(domain => url.includes(domain))) {
            return;
          }
          return originalOpen.apply(this, arguments);
        };
        return xhr;
      };

      // Setup YouTube player when ready
      function onYouTubeIframeAPIReady() {
        if (window.YT && window.YT.Player) {
          const player = new window.YT.Player('player', {
            events: {
              'onReady': function(event) {
                event.target.mute();
                window.ReactNativeWebView?.postMessage('player_ready');
              }
            }
          });
        }
      }

      // Load YouTube API if not already loaded
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
      } else {
        onYouTubeIframeAPIReady();
      }

      true;
    `;
  }, [adBlockList]);

  return {
    // State
    selectedGenre,
    isPlaying,
    isMuted,
    webViewLoaded,
    showDropdown,
    webViewRef,
    genres,
    
    // Actions
    setSelectedGenre: changeGenre,
    togglePlayPause,
    toggleMute,
    setWebViewLoaded,
    setShowDropdown,
    
    // Utils
    getSelectedGenreData,
    getYouTubeEmbedUrl,
    getInjectedJavaScript,
  };
};