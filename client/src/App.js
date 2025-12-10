import React, { useState, useEffect, useRef } from 'react';
import MenuBar from './components/MenuBar';
import Desktop from './components/Desktop';
import KeyboardShortcutsDialog from './components/KeyboardShortcutsDialog';
import HelpCenterDialog from './components/HelpCenterDialog';
import AboutDialog from './components/AboutDialog';
import './App.css';

function App() {
  const audioRef = useRef(null);
  const audioUnlockedRef = useRef(false);
  const mouseDownRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [isMusicWindowOpen, setIsMusicWindowOpen] = useState(false);
  const [musicMuteHandler, setMusicMuteHandler] = useState(null);
  const [musicMuteState, setMusicMuteState] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const closeTopWindowRef = useRef(null);
  const openSelectedIconRef = useRef(null);
  const createNewFolderRef = useRef(null);
  const [windowCount, setWindowCount] = useState(0);

  useEffect(() => {
    // Set CSS variable for scrollbar background image
    document.documentElement.style.setProperty(
      '--scrollbar-bg-image',
      `url(/scroll-bar-bg.png)`
    );

    // Load audio file
    const audioPath = '/click.mp3';
    const audio = new Audio(audioPath);
    
    // Set up audio
    audio.preload = 'auto';
    audio.volume = 0.7;
    
    // Handle audio loading errors
    audio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      console.error('Audio error details:', audio.error);
    });

    audioRef.current = audio;

    // Function to play click sound
    const playClickSound = () => {
      if (!audioRef.current) return;
      
      const audio = audioRef.current;
      
      // Check if audio is ready
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        // Reset audio to start
        audio.currentTime = 0;
        
        // Try to play
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              audioUnlockedRef.current = true;
            })
            .catch(error => {
              // Only log if it's not a user interaction issue
              if (error.name !== 'NotAllowedError') {
                console.error('Audio play error:', error);
              }
            });
        }
      } else {
        // Audio not loaded yet, try to load it
        audio.load();
      }
    };

    // Unlock audio on first user interaction
    const unlockAudio = () => {
      if (!audioRef.current || audioUnlockedRef.current) return;
      
      const audio = audioRef.current;
      
      // Try to play and pause immediately to unlock audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audioUnlockedRef.current = true;
          })
          .catch((error) => {
            // This is expected on first interaction - browser blocks autoplay
            if (error.name !== 'NotAllowedError') {
              console.error('Audio unlock error:', error);
            }
          });
      }
    };

    // Check if element is interactive (triggers an action)
    const isInteractiveElement = (element) => {
      if (!element) return false;
      
      // Check tag names
      const interactiveTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'];
      if (interactiveTags.includes(element.tagName)) {
        return true;
      }
      
      // Check if it's content editable
      if (element.isContentEditable) {
        return true;
      }
      
      // Check if it has an onClick handler or is clickable
      if (element.onclick || element.getAttribute('onclick')) {
        return true;
      }
      
      // Check for common interactive classes/data attributes
      if (element.classList.contains('desktop-icon') || 
          element.classList.contains('menu-item') ||
          element.classList.contains('dropdown-item') ||
          element.classList.contains('paint-tool-item') ||
          element.classList.contains('window-close') ||
          element.classList.contains('doc-window-close') ||
          element.classList.contains('folder-window-close') ||
          element.hasAttribute('data-icon') ||
          element.closest('.desktop-icon') ||
          element.closest('.menu-item') ||
          element.closest('.dropdown-item') ||
          element.closest('.paint-tool-item') ||
          element.closest('button') ||
          element.closest('a')) {
        return true;
      }
      
      return false;
    };

    // Track mouse down for drag detection
    const handleMouseDown = (e) => {
      mouseDownRef.current = {
        x: e.clientX,
        y: e.clientY,
        target: e.target,
        time: Date.now()
      };
      isDraggingRef.current = false;
      
      // Unlock audio on first interaction
      if (!audioUnlockedRef.current) {
        unlockAudio();
      }
    };

    // Track mouse move to detect dragging
    const handleMouseMove = (e) => {
      if (mouseDownRef.current) {
        const dx = Math.abs(e.clientX - mouseDownRef.current.x);
        const dy = Math.abs(e.clientY - mouseDownRef.current.y);
        
        // If mouse moved more than 5px, it's a drag
        if (dx > 5 || dy > 5) {
          isDraggingRef.current = true;
        }
      }
    };

    // Handle mouse up - only play sound if it was a click (not drag) on interactive element
    const handleMouseUp = (e) => {
      if (!mouseDownRef.current) return;
      
      const wasDrag = isDraggingRef.current;
      const target = e.target;
      const originalTarget = mouseDownRef.current.target;
      
      // Check if clicking on an interactive element
      const isInteractive = isInteractiveElement(target) || isInteractiveElement(originalTarget);
      
      // Only play sound if:
      // 1. It was NOT a drag (was a click)
      // 2. It was on an interactive element
      if (!wasDrag && isInteractive) {
        playClickSound();
      }
      
      // Reset
      mouseDownRef.current = null;
      isDraggingRef.current = false;
    };

    // Add event listeners
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const handleMenuAction = (menuName, item) => {
    // Handle menu actions
    switch (menuName) {
      case 'File':
        if (item === 'New') {
          // Create a new folder (auto-selects for editing)
          if (createNewFolderRef.current) {
            createNewFolderRef.current('New Folder');
          }
        } else if (item === 'Open') {
          // Open the selected desktop icon window
          if (openSelectedIconRef.current) {
            openSelectedIconRef.current();
          }
        } else if (item === 'Save') {
          console.log('Save file');
        } else if (item === 'Save As...') {
          console.log('Save As...');
        } else if (item === 'Exit') {
          // Close the topmost window
          if (closeTopWindowRef.current) {
            closeTopWindowRef.current();
          }
        }
        break;
      case 'Edit':
        if (item === 'Undo') {
          console.log('Undo');
        } else if (item === 'Redo') {
          console.log('Redo');
        } else if (item === 'Cut') {
          document.execCommand('cut');
        } else if (item === 'Copy') {
          document.execCommand('copy');
        } else if (item === 'Paste') {
          document.execCommand('paste');
        }
        break;
      case 'View':
        if (item === 'Show Grid') {
          console.log('Toggle grid');
        }
        break;
      case 'Go':
        if (item === 'Back') {
          window.history.back();
        } else if (item === 'Forward') {
          window.history.forward();
        } else if (item === 'Home') {
          window.scrollTo(0, 0);
        } else if (item === 'Go to Folder...') {
          console.log('Go to folder');
        }
        break;
      case 'Window':
        if (item === 'Minimize') {
          // Minimize all windows
          console.log('Minimize all');
        } else if (item === 'Zoom') {
          // Zoom current window
          console.log('Zoom window');
        } else if (item === 'Bring All to Front') {
          // Bring all windows to front
          console.log('Bring all to front');
        } else if (item === 'Close Window') {
          // Close current window
          console.log('Close window');
        }
        break;
      case 'Help':
        if (item === 'Help Center') {
          setShowHelpCenter(true);
        } else if (item === 'Keyboard Shortcuts') {
          setShowKeyboardShortcuts(true);
        } else if (item === 'About') {
          setShowAbout(true);
        }
        break;
      default:
        // No action for other menu names
        break;
    }
  };

  const handleMusicWindowStateChange = (isOpen, muteHandler, muteState) => {
    setIsMusicWindowOpen(isOpen);
    setMusicMuteHandler(() => muteHandler);
    if (muteState !== undefined) {
      setMusicMuteState(muteState);
    }
  };

  const handleMuteToggle = () => {
    if (musicMuteHandler) {
      musicMuteHandler();
      // Toggle state locally (will be updated when Window reports back)
      setMusicMuteState(prev => !prev);
    }
  };

  return (
    <div className="App">
      <MenuBar 
        onMenuAction={handleMenuAction} 
        isMusicWindowOpen={isMusicWindowOpen}
        onMuteToggle={handleMuteToggle}
        musicMuteState={musicMuteState}
        windowCount={windowCount}
      />
      <Desktop 
        onMusicWindowStateChange={handleMusicWindowStateChange}
        onCloseTopWindow={(closeFn) => {
          closeTopWindowRef.current = closeFn;
        }}
        onWindowCountChange={setWindowCount}
        onOpenSelectedIcon={(openFn) => {
          openSelectedIconRef.current = openFn;
        }}
        onCreateNewFolder={(createFn) => {
          createNewFolderRef.current = createFn;
        }}
      />
      {showKeyboardShortcuts && (
        <KeyboardShortcutsDialog onClose={() => setShowKeyboardShortcuts(false)} />
      )}
      {showHelpCenter && (
        <HelpCenterDialog onClose={() => setShowHelpCenter(false)} />
      )}
      {showAbout && (
        <AboutDialog onClose={() => setShowAbout(false)} />
      )}
    </div>
  );
}

export default App;

