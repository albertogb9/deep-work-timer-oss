import React, { useState, useRef } from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Playlist(){
    // States
    const [selectedGenre, setSelectedGenre] = useState('lofi');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [webViewLoaded, setWebViewLoaded] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const webViewRef = useRef(null);
 
    // Music genres
    const genres = [
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
    
    // List of ad domains to block
    const adBlockList = [
    'googlesyndication.com',
    'doubleclick.net',
    'googleadservices.com',
    ];

    const injectedJavaScript = `
    // Bloquear requests de anuncios
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (${JSON.stringify(adBlockList)}.some(domain => url.includes(domain))) {
        return Promise.reject('Blocked by adblock');
        }
        return originalFetch.apply(this, args);
    };
    const video = document.querySelector('video');
    if (video) {
      video.muted = false;
      video.volume = 0.7; // Volumen al 70%
    }
    `;
    
    const currentGenre = genres.find(g => g.id === selectedGenre);
    const currentVideoUrl = `https://www.youtube.com/watch?v=${currentGenre?.videoId}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&loop=1&playlist=${currentGenre?.videoId}`;
    console.log(currentVideoUrl);
    const handlePlayPause = () => {
    if (!webViewLoaded) {
        // Load Webview for the first time
        setWebViewLoaded(true);
        setIsPlaying(true);
    } else {
        // Control play/pause via JS
        const jsCode = `
        const video = document.querySelector('video');
        if (video) {
            if (video.paused) {
            video.play();
            } else {
            video.pause();
            }
        }
        `;
        webViewRef.current?.injectJavaScript(jsCode);
        setIsPlaying(!isPlaying);
    }
    };

    const handleMute = () => {
        const jsCode = `
            const video = document.querySelector('video');
            if (video) {
            video.muted = ${!isMuted};
            }
        `;
        webViewRef.current?.injectJavaScript(jsCode);
        setIsMuted(!isMuted);
        };

return (
       <View style={styles.container}>
         <View style={styles.selectorContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>Background Music: </Text>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.selectedText}>{currentGenre?.name}</Text>
            <Ionicons 
              name={showDropdown ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
        
        {showDropdown && (
          <View style={styles.dropdown}>
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedGenre(genre.id);
                  setShowDropdown(false);
                  setIsPlaying(false);
                  setWebViewLoaded(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{genre.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePlayPause}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color="white" 
          />
          <Text style={styles.buttonText}>
            {isPlaying ? "Pause" : "Play"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleMute}
        >
          <Ionicons 
            name={isMuted ? "volume-mute" : "volume-high"} 
            size={24} 
            color="white" 
          />
          <Text style={styles.buttonText}>
            {isMuted ? "Unmute" : "Mute"}
          </Text>
        </TouchableOpacity>
      </View>

      {isPlaying && (
         <WebView
           ref={webViewRef}
           source={{ uri: currentVideoUrl }}
           style={styles.hiddenWebView}
           allowsInlineMediaPlayback={true}
           mediaPlaybackRequiresUserAction={false}
           onLoad={() => setWebViewLoaded(true)}
           injectedJavaScript={injectedJavaScript}
         />
       )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
     flex: 1,
     paddingHorizontal: 20,
     paddingVertical: 10,
   },
   selectorContainer: {
     marginBottom: 10,
     position: 'relative',
   },
  titleRow: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     marginBottom: 5,
   },
  titleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  selectedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdown: {
     position: 'absolute',
     bottom: '120%',
     left: 0,
     right: 0,
    gap: 4,
     backgroundColor: 'black',
     zIndex: 1000,
   },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#333',
  },
  dropdownItemText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },

  controlsContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
   
   controlButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#333',
      borderWidth: 1,
      borderColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
      minWidth: 80,
    },
   
   buttonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
   
   hiddenWebView: {
       width: 1,
       height: 1,
       opacity: 0,
       position: 'absolute',
       zIndex: -1,
     },
});