import React, { useState, useRef, useEffect } from 'react';
import ImagesGrid from './ImagesGrid';
import PaintToolBar from './PaintToolBar';
import PaintArea from './PaintArea';
import ChildhoodImage from './ChildhoodImage';
import MusicContainer from './MusicContainer';
import ConfirmationDialog from './ConfirmationDialog';
import KindMsgsForm from './KindMsgsForm';

const Window = ({ id, type, name, onClose, onMinimize, x, y, width, height, zIndex, onMove, onResize, onFocus, paintState: initialPaintState, onPaintStateChange, onMusicWindowOpen }) => {
  // Define window type flags early so they can be used in state initialization
  const isMusic = type === 'audio';
  
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ 
    width: isMusic ? 500 : (width || 500), 
    height: isMusic ? 340 : (height || 300) 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isClosing, setIsClosing] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [scrollThumbPosition, setScrollThumbPosition] = useState(0);
  const [scrollThumbHeight, setScrollThumbHeight] = useState(50);
  const [isDraggingThumb, setIsDraggingThumb] = useState(false);
  const [thumbDragStart, setThumbDragStart] = useState(0);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const windowRef = useRef(null);
  const contentAreaRef = useRef(null);
  const scrollbarTrackRef = useRef(null);
  const musicHeaderRef = useRef(null);

  // Define window type flags early so they can be used in useEffect hooks
  const isFolderOrRecycle = type === 'folder' || type === 'recycle' || type === 'images';
  const isPaint = type === 'paint';
  const isWeb = type === 'web';
  const isDoc = type === 'doc';
  const [selectedPaintTool, setSelectedPaintTool] = useState('select');
  const [layers, setLayers] = useState(initialPaintState?.layers || ['Layer 1', 'Layer 2']); // Array of layer IDs
  const [layerNames, setLayerNames] = useState(initialPaintState?.layerNames || { 'Layer 1': 'Layer 1', 'Layer 2': 'Layer 2' });
  const [selectedLayer, setSelectedLayer] = useState(initialPaintState?.selectedLayer || 'Layer 1');
  const [paintObjects, setPaintObjects] = useState(initialPaintState?.objects || []); // Store objects from PaintArea
  const paintAreaRef = useRef(null);
  const [editingLayer, setEditingLayer] = useState(null);
  const [editingUntitled, setEditingUntitled] = useState(false);
  const [untitledName, setUntitledName] = useState(initialPaintState?.untitledName || 'untitled');
  
  // Music rotation state - tracks which song is at index 0
  const [songRotationOffset, setSongRotationOffset] = useState(0);
  
  // Audio playback state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const forwardHandlerRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const previousSongRef = useRef(null);
  
  // All 6 songs based on audio file names with their audio file paths
  const allSongs = [
    { title: 'Opening Theme', artist: 'Spyro', audioFile: `${process.env.PUBLIC_URL}/sound0-OpeningTheme.mp3` },
    { title: 'Dragon Realms', artist: 'Spyro', audioFile: `${process.env.PUBLIC_URL}/sound1-DragonRealms.mp3` },
    { title: 'Dragonfly Dojo', artist: 'Spyro', audioFile: `${process.env.PUBLIC_URL}/sound2-DragonflyDojo.mp3` },
    { title: 'Luau Island', artist: 'Spyro', audioFile: `${process.env.PUBLIC_URL}/sound3-LuauIsland.mp3` },
    { title: 'Cloud 9', artist: 'Spyro', audioFile: `${process.env.PUBLIC_URL}/sound4-Cloud9.mp3` },
    { title: 'Peaceful Ice Slider', artist: 'Spyro', audioFile: `${process.env.PUBLIC_URL}/sound5-PeacefulIceSlider.mp3` }
  ];
  
  // Get rotated songs array based on current offset
  const getRotatedSongs = () => {
    const rotated = [];
    for (let i = 0; i < allSongs.length; i++) {
      const index = (i + songRotationOffset) % allSongs.length;
      rotated.push(allSongs[index]);
    }
    return rotated;
  };
  
  const rotatedSongs = getRotatedSongs();
  const currentSong = rotatedSongs[0]; // Song 0 is currently playing
  const soundtrackSongs = rotatedSongs.slice(1, 6); // Songs 1-5 for soundtrack container
  
  // Store durations for all songs (will be populated as songs load)
  const [songDurations, setSongDurations] = useState({});
  
  // Preload all song durations when music window opens
  useEffect(() => {
    if (!isMusic) return;
    
    // Load metadata for all songs to get their durations
    const loadDurations = async () => {
      const songs = [
        { title: 'Opening Theme', artist: 'Spyro', audioFile: `${process.env.PUBLIC_URL}/sound0-OpeningTheme.mp3` },
        { title: 'Dragon Realms', artist: 'Spyro', audioFile: `${process.env.PUBLIC_URL}/sound1-DragonRealms.mp3` },
        { title: 'Dragonfly Dojo', artist: 'Spyro', audioFile: `${process.env.PUBLIC_URL}/sound2-DragonflyDojo.mp3` },
        { title: 'Luau Island', artist: 'Spyro', audioFile: `${process.env.PUBLIC_URL}/sound3-LuauIsland.mp3` },
        { title: 'Cloud 9', artist: 'Spyro', audioFile: `${process.env.PUBLIC_URL}/sound4-Cloud9.mp3` },
        { title: 'Peaceful Ice Slider', artist: 'Spyro', audioFile: `${process.env.PUBLIC_URL}/sound5-PeacefulIceSlider.mp3` }
      ];
      
      const durationPromises = songs.map((song) => {
        return new Promise((resolve) => {
          const audio = new Audio(song.audioFile);
          audio.addEventListener('loadedmetadata', () => {
            if (audio.duration && isFinite(audio.duration)) {
              resolve({ audioFile: song.audioFile, duration: audio.duration });
            } else {
              resolve({ audioFile: song.audioFile, duration: 0 });
            }
          });
          audio.addEventListener('error', () => {
            resolve({ audioFile: song.audioFile, duration: 0 });
          });
          audio.load();
        });
      });
      
      const durations = await Promise.all(durationPromises);
      const durationMap = {};
      durations.forEach(({ audioFile, duration }) => {
        durationMap[audioFile] = duration;
      });
      setSongDurations(durationMap);
      console.log('🎵 All song durations loaded:', durationMap);
    };
    
    loadDurations();
  }, [isMusic]);
  
  // Rotate songs forward (shift backward by 1)
  const handleForward = () => {
    console.log('🎵 Forward button clicked');
    setSongRotationOffset((prev) => {
      const newOffset = (prev + 1) % allSongs.length;
      console.log('🎵 Rotating forward - new offset:', newOffset);
      return newOffset;
    });
  };
  
  // Rotate songs backward (shift forward by 1)
  const handleBack = () => {
    console.log('🎵 Back button clicked');
    setSongRotationOffset((prev) => {
      const newOffset = (prev - 1 + allSongs.length) % allSongs.length;
      console.log('🎵 Rotating backward - new offset:', newOffset);
      return newOffset;
    });
  };
  
  // Update forward handler ref
  forwardHandlerRef.current = handleForward;
  
  // Initialize audio element and handle song changes
  useEffect(() => {
    if (!isMusic) {
      console.log('🎵 Music window closed - cleaning up audio');
      // Clean up when window closes - stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      hasInitializedRef.current = false;
      previousSongRef.current = null;
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }
    
    console.log('🎵 Music window opened');
    
    // Initialize audio element if needed
    if (!audioRef.current) {
      console.log('🎵 Creating new Audio element');
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = 0.7; // Default volume 70%
      audioRef.current = audio;
      
      // Handle audio ended - play next song
      audio.addEventListener('ended', () => {
        console.log('🎵 Song ended - advancing to next song');
        console.log('🎵 Current song before advance:', previousSongRef.current?.title);
        if (forwardHandlerRef.current) {
          forwardHandlerRef.current();
        } else {
          console.error('🎵 forwardHandlerRef.current is null!');
        }
      });
      
      // Keep isPlaying state in sync with audio element
      audio.addEventListener('play', () => {
        console.log('🎵 Audio play event fired');
        setIsPlaying(true);
      });
      audio.addEventListener('pause', () => {
        console.log('🎵 Audio pause event fired');
        setIsPlaying(false);
      });
      
      // Track time updates
      audio.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      });
      
      // Track duration when metadata loads
      audio.addEventListener('loadedmetadata', () => {
        if (audioRef.current && currentSong) {
          const songDuration = audioRef.current.duration;
          setDuration(songDuration);
          // Store duration for this song
          setSongDurations(prev => ({
            ...prev,
            [currentSong.audioFile]: songDuration
          }));
          console.log('🎵 Audio loaded:', audio.src);
          console.log('🎵 Duration:', songDuration);
        }
      });
      
      audio.addEventListener('error', (e) => {
        console.error('🎵 Audio error:', e);
        console.error('🎵 Audio error details:', audio.error);
        console.error('🎵 Audio src:', audio.src);
      });
    }
    
    // Only proceed if we have a current song
    if (!currentSong) {
      console.log('🎵 No current song available');
      return;
    }
    
    if (!audioRef.current) {
      console.log('🎵 No audio element available');
      return;
    }
    
    const audio = audioRef.current;
    const isNewSong = previousSongRef.current?.audioFile !== currentSong.audioFile;
    
    console.log('🎵 Current song:', currentSong.title, '-', currentSong.artist);
    console.log('🎵 Audio file:', currentSong.audioFile);
    console.log('🎵 Is new song?', isNewSong);
    console.log('🎵 Has initialized?', hasInitializedRef.current);
    console.log('🎵 Audio paused?', audio.paused);
    console.log('🎵 Audio src:', audio.src);
    
    // If this is a new song, switch to it
    if (isNewSong) {
      // Check if audio was playing before switching
      const wasPlaying = !audio.paused;
      console.log('🎵 Was playing?', wasPlaying);
      
      console.log('🎵 Loading new song:', currentSong.audioFile);
      audio.src = currentSong.audioFile;
      audio.load();
      previousSongRef.current = currentSong;
      setCurrentTime(0); // Reset time when switching songs
      
      // Auto-play on first load or continue playing if was playing
      if (!hasInitializedRef.current || wasPlaying) {
        console.log('🎵 Attempting to play song...');
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ Song playing successfully:', currentSong.title);
              setIsPlaying(true);
              hasInitializedRef.current = true;
            })
            .catch((error) => {
              // Auto-play was prevented (browser policy)
              console.error('❌ Failed to play song:', error.name, error.message);
              console.error('❌ Song:', currentSong.title);
              setIsPlaying(false);
              hasInitializedRef.current = true;
            });
        } else {
          console.log('⚠️ play() returned undefined');
        }
      } else {
        console.log('🎵 Skipping auto-play (not initialized and was not playing)');
        hasInitializedRef.current = true;
      }
    }
    
    return () => {
      // Clean up on unmount
      if (audioRef.current && !isMusic) {
        console.log('🎵 Cleaning up audio on unmount');
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isMusic, currentSong, songRotationOffset]);
  
  // Handle mute/unmute with 'm' key
  useEffect(() => {
    if (!isMusic) return;
    
    const handleKeyPress = (e) => {
      if (e.key === 'm' || e.key === 'M') {
        handleMuteToggle();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isMusic]);
  
  // Mute toggle handler
  const handleMuteToggle = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
      console.log('🎵 Mute toggled:', audioRef.current.muted ? 'MUTED' : 'UNMUTED');
    }
  };
  
  // Register mute handler when music window opens and update on mute state change
  useEffect(() => {
    if (isMusic && onMusicWindowOpen) {
      onMusicWindowOpen(handleMuteToggle, isMuted);
    }
    // Cleanup: notify when window closes
    return () => {
      if (!isMusic && onMusicWindowOpen) {
        onMusicWindowOpen(null, false);
      }
    };
  }, [isMusic, isMuted]);
  
  // Handle play/pause
  const handlePlayPause = () => {
    if (!audioRef.current) {
      console.log('🎵 Play/Pause clicked but no audio element');
      return;
    }
    
    const audio = audioRef.current;
    if (audio.paused) {
      console.log('🎵 Play button clicked - attempting to play:', currentSong?.title);
      console.log('🎵 Audio src:', audio.src);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Play successful:', currentSong?.title);
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error('❌ Play failed:', error.name, error.message);
            console.error('❌ Song:', currentSong?.title);
          });
      }
    } else {
      console.log('🎵 Pause button clicked - pausing:', currentSong?.title);
      audio.pause();
      setIsPlaying(false);
    }
  };
  
  // Handle seeking to a specific time
  const handleSeek = (newTime) => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    const clampedTime = Math.max(0, Math.min(newTime, duration || 0));
    audio.currentTime = clampedTime;
    setCurrentTime(clampedTime);
    console.log('🎵 Seeking to:', clampedTime);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Update paint state whenever it changes (for minimize/close)
  useEffect(() => {
    if (isPaint && onPaintStateChange) {
      const paintState = {
        layers,
        layerNames,
        selectedLayer,
        objects: paintObjects,
        untitledName
      };
      onPaintStateChange(id, paintState);
    }
  }, [isPaint, layers, layerNames, selectedLayer, paintObjects, untitledName, id, onPaintStateChange]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDeleteLayer, setPendingDeleteLayer] = useState(null);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  const handleLayerClick = (layerName) => {
    setSelectedLayer(layerName);
  };

  const handleAddLayer = () => {
    const newLayerId = `untitled layer ${Date.now()}`;
    const newLayerName = 'untitled layer';
    setLayers(prev => [...prev, newLayerId]);
    setLayerNames(prev => ({ ...prev, [newLayerId]: newLayerName }));
    setSelectedLayer(newLayerId);
  };

  const handleDeleteLayer = () => {
    if (layers.length <= 1) {
      alert('Cannot delete the last layer');
      return;
    }
    
    setPendingDeleteLayer(selectedLayer);
    setShowConfirmDialog(true);
  };

  const confirmDeleteLayer = () => {
    if (!pendingDeleteLayer) return;
    
    const layerToDelete = pendingDeleteLayer;
    const currentIndex = layers.indexOf(layerToDelete);
    
    // Determine which layer to switch to
    let newSelectedLayer;
    if (currentIndex > 0) {
      // Switch to the layer above
      newSelectedLayer = layers[currentIndex - 1];
    } else {
      // Switch to the layer below
      newSelectedLayer = layers[currentIndex + 1];
    }
    
    // Remove the layer from the array
    setLayers(prev => prev.filter(layer => layer !== layerToDelete));
    
    // Remove the layer name from the names object
    setLayerNames(prev => {
      const newNames = { ...prev };
      delete newNames[layerToDelete];
      return newNames;
    });
    
    // Switch to the new layer
    setSelectedLayer(newSelectedLayer);
    
    // Close dialog
    setShowConfirmDialog(false);
    setPendingDeleteLayer(null);
  };

  const cancelDeleteLayer = () => {
    setShowConfirmDialog(false);
    setPendingDeleteLayer(null);
  };

  const confirmRestartFile = () => {
    // Reset paint area by changing key to force remount
    setRestartKey(prev => prev + 1);
    // Reset layers to default
    setLayers(['Layer 1', 'Layer 2']);
    setLayerNames({ 'Layer 1': 'Layer 1', 'Layer 2': 'Layer 2' });
    setSelectedLayer('Layer 1');
    setShowRestartDialog(false);
  };

  const cancelRestartFile = () => {
    setShowRestartDialog(false);
  };

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);
  
  // Keep music window size fixed at 500x340
  useEffect(() => {
    if (isMusic && (size.width !== 500 || size.height !== 340)) {
      setSize({ width: 500, height: 340 });
      if (onResize) {
        onResize(id, 500, 340);
      }
    }
  }, [isMusic, size.width, size.height, id, onResize]);

  // Handle image size for images window - adjust window to hug image
  const handleImageSize = (imgWidth, imgHeight) => {
    if (type === 'images' && onResize) {
      // Image should fill width of content container (window width - 14px padding - 6px borders)
      const borderWidth = 3;
      const horizontalPadding = 7 * 2; // 7px left + 7px right
      const headerHeight = 37; // Folder header height
      
      // Calculate available width for image
      const availableWidth = window.innerWidth * 0.5; // Start with 50% of screen width
      const imageAspectRatio = imgWidth / imgHeight;
      const targetImageHeight = availableWidth / imageAspectRatio;
      
      // Content container size (image fills width)
      const contentWidth = availableWidth;
      const contentHeight = targetImageHeight;
      
      // Window size = content container + padding + borders
      const totalWidth = contentWidth + (borderWidth * 2) + horizontalPadding;
      const totalHeight = contentHeight + headerHeight + (borderWidth * 2);
      
      setSize({ width: totalWidth, height: totalHeight });
      onResize(id, totalWidth, totalHeight);
    }
  };

  // Update music header height for content container positioning (7px under music base img)
  useEffect(() => {
    if (isMusic && musicHeaderRef.current) {
      const header = musicHeaderRef.current;
      const musicBaseImg = header.querySelector('.music-bar-image');
      const musicBarBgImg = header.querySelector('.music-bar-bg-image');
      
      const updateHeights = () => {
        if (musicBaseImg) {
          // Lock the music base image height to its natural height + 13px (only on first load)
          if (!document.documentElement.style.getPropertyValue('--music-base-height')) {
            const naturalHeight = musicBaseImg.naturalHeight || musicBaseImg.offsetHeight;
            if (naturalHeight > 0) {
              document.documentElement.style.setProperty('--music-base-height', `${naturalHeight + 13}px`);
            }
          }
          // Get the total header height (image + 7px top padding)
          const headerHeight = header.offsetHeight;
          document.documentElement.style.setProperty('--music-header-height', `${headerHeight}px`);
        }
        if (musicBarBgImg) {
          // Lock the music bg image height to its natural height (only on first load)
          if (!document.documentElement.style.getPropertyValue('--music-bar-bg-height-locked')) {
            const naturalHeight = musicBarBgImg.naturalHeight || musicBarBgImg.offsetHeight;
            if (naturalHeight > 0) {
              document.documentElement.style.setProperty('--music-bar-bg-height-locked', `${naturalHeight}px`);
            }
          }
          const bgHeight = musicBarBgImg.offsetHeight;
          document.documentElement.style.setProperty('--music-bar-bg-height', `${bgHeight}px`);
        }
      };

      if (musicBaseImg) {
        if (musicBaseImg.complete && musicBaseImg.naturalHeight > 0) {
          updateHeights();
        } else {
          musicBaseImg.addEventListener('load', updateHeights, { once: true });
        }
      }
      if (musicBarBgImg) {
        if (musicBarBgImg.complete && musicBarBgImg.naturalHeight > 0) {
          updateHeights();
        } else {
          musicBarBgImg.addEventListener('load', updateHeights, { once: true });
        }
      }
      if (!musicBaseImg && !musicBarBgImg) {
        updateHeights();
      }
    }
  }, [isMusic, size.width]);

  // Update scrollbar thumb position and size based on content scroll
  useEffect(() => {
    const updateScrollbar = () => {
      if (contentAreaRef.current && scrollbarTrackRef.current) {
        const content = contentAreaRef.current;
        const track = scrollbarTrackRef.current;
        const scrollTop = content.scrollTop;
        const scrollHeight = content.scrollHeight;
        const clientHeight = content.clientHeight;
        const trackHeight = track.clientHeight;

        // Only show scrollbar for folder windows when content is scrollable
        const needsScroll = type === 'folder' && scrollHeight > clientHeight;
        setShowScrollbar(needsScroll);

        if (needsScroll) {
          const thumbHeight = Math.max(20, (clientHeight / scrollHeight) * trackHeight);
          const maxThumbTop = trackHeight - thumbHeight;
          const thumbTop = scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop : 0;
          
          setScrollThumbHeight(thumbHeight);
          setScrollThumbPosition(thumbTop);
        } else {
          setScrollThumbHeight(0);
          setScrollThumbPosition(0);
        }
      }
    };

    const contentArea = contentAreaRef.current;
    if (contentArea) {
      contentArea.addEventListener('scroll', updateScrollbar);
      window.addEventListener('resize', updateScrollbar);
      // Use setTimeout to ensure refs are ready
      setTimeout(updateScrollbar, 0);
    }

    return () => {
      if (contentArea) {
        contentArea.removeEventListener('scroll', updateScrollbar);
      }
      window.removeEventListener('resize', updateScrollbar);
    };
  }, [size.height, size.width, position.x, position.y, type]);

  // Handle keyboard shortcuts for paint window
  useEffect(() => {
    if (!isPaint) return;

    const handleKeyDown = (e) => {
      // Only handle if paint window is focused (highest z-index)
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setSelectedPaintTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPaint]);

  // Export paint area as JPG
  const handleExportJPG = () => {
    if (!isPaint || !paintAreaRef.current) return;
    
    const paintAreaContainer = paintAreaRef.current.containerRef?.current;
    if (!paintAreaContainer) return;

    // Create a canvas to render all layers
    const canvas = document.createElement('canvas');
    const rect = paintAreaContainer.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#9393FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw all objects from all layers
    paintObjects.forEach(obj => {
      if (obj.type === 'frame' || obj.type === 'rectangle') {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        if (obj.type === 'rectangle') {
          ctx.fillStyle = obj.fillColor || '#ffffff';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        }
      } else if (obj.type === 'text') {
        ctx.fillStyle = '#000000';
        ctx.font = '12px "Dogica Pixel", "Courier New", monospace';
        ctx.fillText(obj.text, obj.x, obj.y + 12);
      } else if (obj.type === 'pen' && obj.path) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        obj.path.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }
    });
    
    // Convert to JPG and download
    const filename = (untitledName || 'untitled') + '.jpg';
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
  };

  useEffect(() => {
    if (width) setSize(prev => ({ ...prev, width }));
    if (height) setSize(prev => ({ ...prev, height }));
  }, [width, height]);

  // Update paint window size to 75% of screen width on resize
  useEffect(() => {
    if (isPaint) {
      const updatePaintSize = () => {
        const newWidth = Math.floor(window.innerWidth * 0.75);
        const newHeight = Math.floor(newWidth * (689 / 1055));
        setSize({ width: newWidth, height: newHeight });
        onResize(id, newWidth, newHeight);
      };

      window.addEventListener('resize', updatePaintSize);
      return () => window.removeEventListener('resize', updatePaintSize);
    }
  }, [isPaint, id, onResize]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.window-close')) {
      return; // Don't drag if clicking close button
    }
    
    setIsDragging(true);
    // Calculate offset from mouse position to window's current CSS position
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    onFocus(id);
    e.preventDefault();
  };

  const handleResizeStart = (e, handle) => {
    // Prevent resizing for music windows
    if (isMusic) {
      return;
    }
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      startX: position.x,
      startY: position.y
    });
    onFocus(id);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Prevent resizing for music windows
      if (isMusic && isResizing) {
        return;
      }
      if (isResizing && resizeHandle) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.startX;
        let newY = resizeStart.startY;

        // Calculate minimum height for music windows (5 songs = 250px + header)
        const minMusicHeight = isMusic ? (parseFloat(document.documentElement.style.getPropertyValue('--music-header-height')) || 0) + 250 : 200;
        const minHeight = isMusic ? minMusicHeight : 200;

        // Handle different resize handles
        if (resizeHandle.includes('right')) {
          newWidth = Math.max(300, resizeStart.width + deltaX);
        }
        if (resizeHandle.includes('left')) {
          newWidth = Math.max(300, resizeStart.width - deltaX);
          newX = resizeStart.startX + deltaX;
        }
        if (resizeHandle.includes('bottom')) {
          newHeight = Math.max(minHeight, resizeStart.height + deltaY);
        }
        if (resizeHandle.includes('top')) {
          newHeight = Math.max(minHeight, resizeStart.height - deltaY);
          newY = resizeStart.startY + deltaY;
        }

        // Keep within bounds
        const maxWidth = window.innerWidth - newX;
        const maxHeight = window.innerHeight - newY;
        newWidth = Math.min(newWidth, maxWidth);
        newHeight = Math.min(newHeight, maxHeight);

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
        onResize(id, newWidth, newHeight);
        onMove(id, newX, newY);
      } else if (isDragging) {
        // Calculate new position based on mouse position minus the offset
        let newX = e.clientX - dragOffset.x;
        let newY = e.clientY - dragOffset.y;

        // Constrain window to desktop bounds - CANNOT go above desktop (Y must be >= 0)
        // Keep left edge visible (X >= 0)
        newX = Math.max(0, newX);
        // Keep right edge visible (X + width <= window.innerWidth)
        newX = Math.min(newX, window.innerWidth - size.width);
        // Cannot go above desktop (Y >= 0)
        newY = Math.max(0, newY);
        // Keep bottom edge visible (Y + height <= window.innerHeight)
        newY = Math.min(newY, window.innerHeight - size.height);

        setPosition({ x: newX, y: newY });
        onMove(id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeHandle, dragOffset, resizeStart, id, onMove, onResize, size.width, size.height]);

  const getWindowContent = () => {
    switch (type) {
      case 'folder':
        return <ImagesGrid />;
      case 'doc':
        return <KindMsgsForm />;
      case 'web':
        // For "my reads", show Curius page, otherwise show a generic web browser
        const webUrl = name === 'my reads' ? 'https://curius.app/catherine-hoang' : 'https://example.com';
        return (
          <div className="web-content-wrapper">
            <object
              data={webUrl}
              type="text/html"
              className="web-content-iframe"
              title={name}
            >
              <div className="web-content-fallback">
                <p>Unable to load content. <a href={webUrl} target="_blank" rel="noopener noreferrer">Click here to open in new tab</a></p>
              </div>
            </object>
            <div 
              className="web-content-overlay"
              onClick={() => window.open(webUrl, '_blank')}
              title="Click to open in new tab"
            />
          </div>
        );
      case 'paint':
        return (
          <>
            <div className="paint-layer-container">
              <div className="paint-layer-group paint-layer-title">
                <span>Layers</span>
                <div className="paint-layer-buttons">
                  <button className="paint-layer-btn paint-layer-add" onClick={handleAddLayer}>+</button>
                  <button className="paint-layer-btn paint-layer-remove" onClick={handleDeleteLayer}>−</button>
                </div>
              </div>
              {layers.map((layerId) => (
                <div 
                  key={layerId}
                  className={`paint-layer-group paint-layer-item ${selectedLayer === layerId ? 'paint-layer-selected' : ''}`}
                  onClick={() => !editingLayer && handleLayerClick(layerId)}
                  onDoubleClick={() => setEditingLayer(layerId)}
                >
                  {editingLayer === layerId ? (
                    <input
                      type="text"
                      value={layerNames[layerId] || layerId}
                      onChange={(e) => {
                        const newName = e.target.value.slice(0, 12);
                        setLayerNames(prev => ({ ...prev, [layerId]: newName }));
                      }}
                      onBlur={() => setEditingLayer(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingLayer(null);
                        }
                      }}
                      autoFocus
                      className="paint-layer-rename-input"
                    />
                  ) : (
                    layerNames[layerId] || layerId
                  )}
                </div>
              ))}
            </div>
            <PaintArea 
              key={restartKey} 
              ref={paintAreaRef}
              selectedTool={selectedPaintTool} 
              currentLayer={selectedLayer} 
              layers={layers}
              initialObjects={initialPaintState?.objects || []}
              onObjectsChange={setPaintObjects}
            />
          </>
        );
      case 'audio':
        return null;
      case 'images':
        return null; // No image for now
      case 'recycle':
        return null;
      default:
        return <div className="window-content">Application Window</div>;
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    
    // Stop audio if closing music window
    if (isMusic && audioRef.current) {
      console.log('🎵 Closing music window - stopping audio');
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      // Save paint state before closing
      if (isPaint) {
        const paintState = {
          layers,
          layerNames,
          selectedLayer,
          objects: paintObjects,
          untitledName
        };
        onClose(id, type, paintState);
      } else {
        onClose(id, type);
      }
    }, 150); // Match animation duration
  };

  const handleMinimize = () => {
    setIsMinimizing(true);
    // Wait for animation to complete before calling onMinimize
    setTimeout(() => {
      if (onMinimize) {
        onMinimize(id);
      }
    }, 200); // Match animation duration
  };

  const handleScrollUp = () => {
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollBy({ top: -50, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (contentAreaRef.current) {
      contentAreaRef.current.scrollBy({ top: 50, behavior: 'smooth' });
    }
  };

  const handleTrackClick = (e) => {
    if (contentAreaRef.current && scrollbarTrackRef.current) {
      const track = scrollbarTrackRef.current;
      const trackRect = track.getBoundingClientRect();
      const clickY = e.clientY - trackRect.top;
      const trackHeight = track.clientHeight;
      const content = contentAreaRef.current;
      const scrollHeight = content.scrollHeight;
      const clientHeight = content.clientHeight;
      
      const scrollRatio = clickY / trackHeight;
      const targetScroll = scrollRatio * (scrollHeight - clientHeight);
      content.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  const handleThumbMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingThumb(true);
    setThumbDragStart(e.clientY - scrollThumbPosition);
  };

  useEffect(() => {
    let animationFrameId = null;
    
    const handleThumbMouseMove = (e) => {
      if (isDraggingThumb && contentAreaRef.current && scrollbarTrackRef.current) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        
        animationFrameId = requestAnimationFrame(() => {
          const track = scrollbarTrackRef.current;
          const trackRect = track.getBoundingClientRect();
          const trackHeight = track.clientHeight;
          const content = contentAreaRef.current;
          const scrollHeight = content.scrollHeight;
          const clientHeight = content.clientHeight;
          
          const mouseY = e.clientY - trackRect.top - thumbDragStart;
          const maxThumbTop = trackHeight - scrollThumbHeight;
          const newThumbTop = Math.max(0, Math.min(maxThumbTop, mouseY));
          
          const scrollRatio = newThumbTop / maxThumbTop;
          const targetScroll = scrollRatio * (scrollHeight - clientHeight);
          content.scrollTo({ top: targetScroll, behavior: 'smooth' });
        });
      }
    };

    const handleThumbMouseUp = () => {
      setIsDraggingThumb(false);
    };

    if (isDraggingThumb) {
      document.addEventListener('mousemove', handleThumbMouseMove);
      document.addEventListener('mouseup', handleThumbMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleThumbMouseMove);
      document.removeEventListener('mouseup', handleThumbMouseUp);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDraggingThumb, thumbDragStart, scrollThumbHeight]);

  const getBarBackground = () => {
    if (isMusic) {
      return '/music-base.png';
    }
    // For folder/recycle/images, use the folder bar background
    return "https://www.figma.com/api/mcp/asset/6c116bd5-55b4-4ab3-b842-5a2a7ec65e6a";
  };

  const renderHeader = () => {
    if (isPaint) {
      return (
        <div 
          className="window-header-paint"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="paint-bar-bg">
            <img 
              src="https://www.figma.com/api/mcp/asset/4f8c94fb-a17f-4e99-9be9-54387d21236f" 
              alt="paint bar" 
              className="paint-bar-image"
            />
          </div>
          <div className="paint-title-container">
            <p className="paint-title">{name}</p>
          </div>
          <div className="paint-minimize-btn-container">
            <button className="paint-window-minimize" onClick={handleMinimize}></button>
          </div>
        </div>
      );
    } else if (isDoc) {
      const docBarBg = "https://www.figma.com/api/mcp/asset/a27e0125-8a95-440b-b33d-c835f8fe09e2";
      return (
        <div 
          className="window-header-doc"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="doc-bar-bg">
            <img 
              src={docBarBg} 
              alt="doc bar background" 
              className="doc-bar-image"
            />
            <div className="doc-menu-hamburger">
              <div className="doc-hamburger-line"></div>
              <div className="doc-hamburger-line"></div>
              <div className="doc-hamburger-line"></div>
            </div>
            <div className="doc-text-container">
              <p className="doc-title">{name}</p>
            </div>
            <div className="doc-x-btn-container">
              <button className="doc-window-close" onClick={handleClose}>×</button>
            </div>
          </div>
        </div>
      );
    } else if (isFolderOrRecycle || isMusic || isWeb) {
      return (
        <div 
          ref={isMusic ? musicHeaderRef : null}
          className={`window-header-folder ${isMusic ? 'music-header' : ''} ${isWeb ? 'web-header' : ''}`}
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className={`folder-bar-bg ${isMusic ? 'music-bar-bg' : ''} ${isWeb ? 'web-bar-bg' : ''}`}>
            {isMusic ? (
              <>
                <img 
                  src="/music-base.png" 
                  alt="music base" 
                  className="music-bar-image"
                />
                <img 
                  src="/music-bar-bg.png" 
                  alt="music bar background" 
                  className="music-bar-bg-image"
                />
                <p className="folder-bar-title">{name}</p>
                <div className="folder-x-btn-container">
                  <button className="folder-window-close" onClick={handleClose}>×</button>
                </div>
                <div className="music-container-wrapper">
                  <MusicContainer 
                    currentSong={currentSong}
                    onForward={handleForward}
                    onBack={handleBack}
                    onPlayPause={handlePlayPause}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleSeek}
                    formatTime={formatTime}
                  />
                </div>
              </>
            ) : isWeb ? (
              <>
                <img 
                  src="/music-bar-bg.png" 
                  alt="web bar background" 
                  className="folder-bar-image"
                />
                <p className="folder-bar-title">{name}</p>
                <div className="folder-x-btn-container">
                  <button className="folder-window-close" onClick={handleClose}>×</button>
                </div>
              </>
            ) : (
              <img 
                src={getBarBackground()} 
                alt="bar background" 
                className="folder-bar-image"
              />
            )}
          </div>
          {!isMusic && !isWeb && (
            <>
              <p className="folder-bar-title">{name}</p>
              <div className="folder-x-btn-container">
                <button className="folder-window-close" onClick={handleClose}>×</button>
              </div>
            </>
          )}
        </div>
      );
    } else {
      return (
        <div 
          className="window-header"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <span className="window-title">{name}</span>
          <button className="window-close" onClick={handleClose}>×</button>
        </div>
      );
    }
  };

  return (
    <div 
      ref={windowRef}
      className={`window ${isClosing ? 'closing' : ''} ${isMinimizing ? 'minimizing' : ''} ${isPaint ? 'paint-window' : ''} ${type === 'images' ? 'images-window' : ''} ${isMusic ? 'music-window' : ''}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: zIndex || 100
      }}
    >
      {renderHeader()}
      {isPaint && (
        <>
          <PaintToolBar 
            onToolChange={(tool) => setSelectedPaintTool(tool)} 
            untitledName={untitledName}
            onUntitledChange={(name) => setUntitledName(name)}
            onRestartClick={() => setShowRestartDialog(true)}
            onExportJPG={handleExportJPG}
          />
          <div className="paint-content-container">
            {getWindowContent()}
          </div>
        </>
      )}
      {!isPaint && (
        <div className="window-content-container">
          {type === 'images' ? (
            <div className="window-content-area">
              {getWindowContent()}
            </div>
          ) : isMusic ? (
            <div className="window-content-area">
              <div className="music-content-left">
                <div className="sound-track-id-container">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="sound-track-id-item">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
              <div className="music-content-right">
                <div className="sound-track-container">
                  {soundtrackSongs.map((track, index) => {
                    const trackDuration = songDurations[track.audioFile];
                    const formatTime = (seconds) => {
                      if (!isFinite(seconds) || isNaN(seconds) || seconds === 0 || seconds === undefined) return '0:00';
                      const mins = Math.floor(seconds / 60);
                      const secs = Math.floor(seconds % 60);
                      return `${mins}:${secs.toString().padStart(2, '0')}`;
                    };
                    return (
                      <div key={index} className="sound-track-item">
                        <span className="sound-track-title">{track.title}</span>
                        <span className="sound-track-duration">{formatTime(trackDuration)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div 
              className={`window-content-area ${showScrollbar ? 'has-scrollbar' : ''}`}
              ref={contentAreaRef}
            >
              {getWindowContent()}
            </div>
          )}
          {showScrollbar && (
            <div className="custom-scrollbar">
              <button className="scroll-arrow scroll-arrow-up" onClick={handleScrollUp}>▲</button>
              <div 
                className="scrollbar-track-container" 
                ref={scrollbarTrackRef}
                onClick={handleTrackClick}
              >
                <div 
                  className="scrollbar-thumb"
                  style={{
                    top: `${scrollThumbPosition}px`,
                    height: `${scrollThumbHeight}px`,
                    display: scrollThumbHeight > 0 ? 'block' : 'none'
                  }}
                  onMouseDown={handleThumbMouseDown}
                ></div>
              </div>
              <button className="scroll-arrow scroll-arrow-down" onClick={handleScrollDown}>▼</button>
            </div>
          )}
        </div>
      )}
      {/* Resize handles */}
      {!isMusic && (
        <>
          <div className="resize-handle resize-handle-top" onMouseDown={(e) => handleResizeStart(e, 'top')}></div>
          <div className="resize-handle resize-handle-right" onMouseDown={(e) => handleResizeStart(e, 'right')}></div>
          <div className="resize-handle resize-handle-bottom" onMouseDown={(e) => handleResizeStart(e, 'bottom')}></div>
          <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleResizeStart(e, 'left')}></div>
          <div className="resize-handle resize-handle-top-right" onMouseDown={(e) => handleResizeStart(e, 'top-right')}></div>
          <div className="resize-handle resize-handle-top-left" onMouseDown={(e) => handleResizeStart(e, 'top-left')}></div>
          <div className="resize-handle resize-handle-bottom-right" onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}></div>
          <div className="resize-handle resize-handle-bottom-left" onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}></div>
        </>
      )}
      {showConfirmDialog && (
        <ConfirmationDialog
          message={`Are you sure you want to delete "${layerNames[pendingDeleteLayer] || pendingDeleteLayer}"?`}
          onConfirm={confirmDeleteLayer}
          onCancel={cancelDeleteLayer}
        />
      )}
      {showRestartDialog && (
        <ConfirmationDialog
          message="Are you sure you want to restart your paint file?"
          onConfirm={confirmRestartFile}
          onCancel={cancelRestartFile}
        />
      )}
    </div>
  );
};

export default Window;

