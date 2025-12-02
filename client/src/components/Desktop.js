import React, { useState, useEffect } from 'react';
import DesktopIcon from './DesktopIcon';
import Window from './Window';
import axios from 'axios';

const Desktop = ({ onMusicWindowStateChange, onMuteToggle, onCloseTopWindow, onWindowCountChange, onOpenSelectedIcon, onCreateNewFolder }) => {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [editingIcon, setEditingIcon] = useState(null);
  const [openWindows, setOpenWindows] = useState([]);
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [closedPaintWindows, setClosedPaintWindows] = useState({}); // Store paint state by window type
  const [paintWindowStates, setPaintWindowStates] = useState({}); // Store paint state by window id
  const [, setMusicWindowMuteHandler] = useState(null); // Setter used, value not needed
  
  // Notify parent of window count changes
  useEffect(() => {
    if (onWindowCountChange) {
      onWindowCountChange(openWindows.length);
    }
  }, [openWindows.length, onWindowCountChange]);
  
  // Calculate desktop height (window height minus menu bar ~60px)
  const getDesktopHeight = () => window.innerHeight - 60;
  // Calculate bottom position for icons (desktop height - icon height - margin)
  const getBottomIconY = () => getDesktopHeight() - 100; // 100px from bottom (icon + label + margin)
  // Calculate right position for bottom icons (icon width is 80px, spacing is 100px)
  const getBottomIconX = (isRecycle = false) => {
    const iconWidth = 80;
    const spacing = 100;
    const margin = 20;
    if (isRecycle) {
      return window.innerWidth - iconWidth - margin;
    } else {
      return window.innerWidth - iconWidth - margin - spacing;
    }
  };
  
  const [desktopHeight, setDesktopHeight] = useState(getDesktopHeight());
  
  const [desktopItems, setDesktopItems] = useState(() => {
    const bottomY = getBottomIconY();
    return [
      // First row: folder, doc, web
      { type: 'folder', name: 'Past Lives', icon: '/folder-closed.png', x: 20, y: 20, isBottom: false },
      { type: 'doc', name: 'Kind Msgs', icon: '/doc-icon.svg', x: 120, y: 20, isBottom: false },
      { type: 'web', name: 'My Reads', icon: '/web-icon.svg', x: 220, y: 20, isBottom: false },
      // Second row: paint, audio
      { type: 'paint', name: 'Paint', icon: '/paint-icon.svg', x: 20, y: 128, isBottom: false },
      { type: 'audio', name: 'Nostalgia', icon: '/audio-icon.svg', x: 120, y: 128, isBottom: false },
      // Bottom right: img, recycle (will be positioned dynamically)
      { type: 'images', name: 'Childhood', icon: '/img-icon.svg', x: getBottomIconX(false), y: bottomY, isBottom: true },
      { type: 'recycle', name: 'Recycle Bin', icon: '/recycle-icon.svg', x: getBottomIconX(true), y: bottomY, isBottom: true }
    ];
  });

  useEffect(() => {
    // Update desktop height and icon positions on resize
    const handleResize = () => {
      const newHeight = getDesktopHeight();
      setDesktopHeight(newHeight);
      const newBottomY = newHeight - 100;
      
      setDesktopItems(prev => prev.map(item => {
        if (item.isBottom) {
          const isRecycle = item.type === 'recycle';
          return { 
            ...item, 
            y: newBottomY,
            x: getBottomIconX(isRecycle)
          };
        }
        return item;
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Load desktop items from API
    const loadDesktopItems = async () => {
      try {
        const response = await axios.get('/api/desktop/items');
        if (response.data.length > 0) {
          // Merge with default items
          const merged = [...desktopItems];
          response.data.forEach(item => {
            const existing = merged.find(d => d.type === item.type);
            if (existing) {
              existing.x = item.position.x;
              existing.y = item.position.y;
            } else {
              merged.push({
                type: item.type,
                name: item.name,
                icon: getIconForType(item.type),
                x: item.position.x,
                y: item.position.y
              });
            }
          });
          setDesktopItems(merged);
        }
      } catch (error) {
        console.error('Error loading desktop items:', error);
      }
    };

    loadDesktopItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getIconForType = (type) => {
    const icons = {
      paint: '/paint-icon.svg',
      folder: '/folder-closed.png',
      doc: '/doc-icon.svg',
      web: '/web-icon.svg',
      audio: '/audio-icon.svg',
      recycle: '/recycle-icon.svg',
      images: '/img-icon.svg'
    };
    return icons[type] || '/doc-icon.svg';
  };

  const getIconPath = (item) => {
    if (item.type === 'folder' || item.type.startsWith('folder-')) {
      // Check if folder window is open (check by name since type might be unique)
      const isOpen = openWindows.some(window => 
        (window.type === 'folder' || window.type.startsWith('folder-')) && window.name === item.name
      );
      return isOpen ? '/folder-open.png' : '/folder-closed.png';
    }
    return item.icon;
  };

  // handleIconMove removed - desktop icons are not draggable

  const handleIconClick = (type, name) => {
    // Single click only selects the icon (unless editing)
    if (editingIcon !== type) {
      setSelectedIcon(selectedIcon === type ? null : type);
    }
  };
  
  const handleIconNameChange = (type, newName) => {
    // Update the icon name
    setDesktopItems(prev => prev.map(item => 
      item.type === type ? { ...item, name: newName } : item
    ));
    
    // Save to API
    const item = desktopItems.find(i => i.type === type);
    if (item) {
      try {
        axios.post('/api/desktop/items', {
          name: newName,
          type: item.type.startsWith('folder-') ? 'folder' : item.type,
          position: { x: item.x, y: item.y }
        }).catch(err => console.error('Error saving item:', err));
      } catch (error) {
        console.error('Error saving item:', error);
      }
    }
    
    // Stop editing
    setEditingIcon(null);
  };

  const handleIconDoubleClick = (type, name) => {
    // Special handling for "my reads" - open in new tab instead of window
    if (type === 'web' && name === 'My Reads') {
      window.open('https://curius.app/catherine-hoang', '_blank');
      return;
    }
    
    // Handle folders (both default 'folder' type and dynamically created 'folder-*' types)
    const isFolder = type === 'folder' || type.startsWith('folder-');
    
    // For folders, check if any folder window with the same name is minimized
    const minimizedWindow = isFolder 
      ? minimizedWindows.find(w => (w.type === 'folder' || w.type.startsWith('folder-')) && w.name === name)
      : minimizedWindows.find(w => w.type === type);
    if (minimizedWindow) {
      // Restore minimized window
      const maxZIndex = openWindows.length > 0 
        ? Math.max(...openWindows.map(w => w.zIndex || 0))
        : 100;
      
      // Remove from minimized, add back to open with preserved state
      setMinimizedWindows(minimizedWindows.filter(w => w.id !== minimizedWindow.id));
      setOpenWindows([...openWindows, { ...minimizedWindow, zIndex: maxZIndex + 1 }]);
      return;
    }
    
    // Open window on double-click
    // For folders, find by name since type might be unique
    const existingWindow = isFolder
      ? openWindows.find(w => (w.type === 'folder' || w.type.startsWith('folder-')) && w.name === name)
      : openWindows.find(w => w.type === type);
    if (existingWindow) {
      // Window already exists - bring it to top and shift others down
      const maxZIndex = openWindows.length > 0 
        ? Math.max(...openWindows.map(w => w.zIndex || 0))
        : 100;
      
      const updatedWindows = openWindows.map(w => {
        if (w.id === existingWindow.id) {
          return { ...w, zIndex: maxZIndex + 1 }; // Bring to top
        }
        return { ...w, zIndex: (w.zIndex || 0) - 1 }; // Shift others down
      });
      
      setOpenWindows(updatedWindows);
    } else {
      // Find max z-index from existing windows
      const maxZIndex = openWindows.length > 0 
        ? Math.max(...openWindows.map(w => w.zIndex || 0))
        : 100;
      
      // Restore paint state if available
      const savedPaintState = type === 'paint' ? closedPaintWindows['paint'] : null;
      
      // For folders, use 'folder' as the window type (standardize it)
      const windowType = isFolder ? 'folder' : type;
      
      // Calculate position for paint window (centered y-axis, 50px from right)
      let windowX = 100 + openWindows.length * 30;
      let windowY = 100 + openWindows.length * 30;
      
      if (type === 'paint') {
        const paintWidth = Math.floor(window.innerWidth * 0.75);
        const paintHeight = Math.floor((window.innerWidth * 0.75) * (689 / 1055));
        windowX = window.innerWidth - paintWidth - 50; // 50px from right
        windowY = (window.innerHeight - paintHeight) / 2; // Centered on y-axis
      }
      
      const newWindow = {
        id: `${windowType}-${Date.now()}`,
        type: windowType,
        name: name,
        x: windowX,
        y: windowY,
        zIndex: maxZIndex + 1, // New window gets top z-index
        // Set default size for paint window - 75% of screen width, maintain aspect ratio
        ...(type === 'paint' ? { 
          width: Math.floor(window.innerWidth * 0.75),
          height: Math.floor((window.innerWidth * 0.75) * (689 / 1055))
        } : {}),
        // Set default size for images window - 40% of screen height, maintain aspect ratio
        ...(type === 'images' ? {
          height: Math.floor(window.innerHeight * 0.4),
          width: null // Will be calculated based on image aspect ratio
        } : {}),
        // Set default size for doc window - fit the form content
        ...(type === 'doc' ? {
          width: 400,
          height: 480 // Header (30px) + form content (~450px)
        } : {}),
        // Set default size for music window - 500x340, not resizable
        ...(type === 'audio' ? {
          width: 500,
          height: 340
        } : {}),
        // Restore paint state if available
        ...(savedPaintState ? { paintState: savedPaintState } : {})
      };
      
      // Shift other windows down in z-index
      const updatedWindows = openWindows.map(w => ({
        ...w,
        zIndex: (w.zIndex || 0) - 1 // Shift down
      }));
      
      setOpenWindows([...updatedWindows, newWindow]);
    }
  };

  const handleWindowClose = (windowId, windowType, paintState, windowName) => {
    // If closing paint window, save its state
    if (windowType === 'paint' && paintState) {
      setClosedPaintWindows(prev => ({
        ...prev,
        [windowType]: paintState
      }));
    }
    setOpenWindows(openWindows.filter(w => w.id !== windowId));
    // If closing folder window, deselect icon
    if (windowType === 'folder') {
      // Find and deselect the folder icon by name
      const folderItem = desktopItems.find(item => 
        (item.type === 'folder' || item.type.startsWith('folder-')) && item.name === windowName
      );
      if (folderItem && selectedIcon === folderItem.type) {
        setSelectedIcon(null);
      }
    }
    // If closing music window, notify parent
    if (windowType === 'audio' && onMusicWindowStateChange) {
      onMusicWindowStateChange(false, null);
      setMusicWindowMuteHandler(null);
    }
  };

  const handleWindowMinimize = (windowId) => {
    // Move window to minimized state, preserving all its data
    const windowToMinimize = openWindows.find(w => w.id === windowId);
    if (windowToMinimize) {
      // If it's a paint window, get the saved state
      const paintState = paintWindowStates[windowId];
      const windowWithState = paintState ? { ...windowToMinimize, paintState } : windowToMinimize;
      setOpenWindows(openWindows.filter(w => w.id !== windowId));
      setMinimizedWindows([...minimizedWindows, windowWithState]);
    }
  };
  
  const handlePaintStateChange = (windowId, paintState) => {
    // Update paint state for the window
    setPaintWindowStates(prev => ({
      ...prev,
      [windowId]: paintState
    }));
  };

  const handleWindowMove = (windowId, newX, newY) => {
    setOpenWindows(prevWindows => {
      // Find max z-index from other windows
      const otherWindows = prevWindows.filter(w => w.id !== windowId);
      const maxZIndex = otherWindows.length > 0 
        ? Math.max(...otherWindows.map(w => w.zIndex || 0))
        : 100;
      
      // Set dragged window to highest z-index, others maintain order
      return prevWindows.map(w => {
        if (w.id === windowId) {
          return { ...w, x: newX, y: newY, zIndex: maxZIndex + 1 };
        }
        return w; // Other windows keep their z-index
      });
    });
  };

  const handleWindowResize = (windowId, newWidth, newHeight) => {
    setOpenWindows(prevWindows => {
      return prevWindows.map(w => {
        if (w.id === windowId) {
          return { ...w, width: newWidth, height: newHeight };
        }
        return w;
      });
    });
  };

  const handleWindowFocus = (windowId) => {
    setOpenWindows(prevWindows => {
      // Find max z-index from other windows
      const otherWindows = prevWindows.filter(w => w.id !== windowId);
      const maxZIndex = otherWindows.length > 0 
        ? Math.max(...otherWindows.map(w => w.zIndex || 0))
        : 100;
      
      // Set focused window to highest z-index, others maintain order
      return prevWindows.map(w => {
        if (w.id === windowId) {
          return { ...w, zIndex: maxZIndex + 1 };
        }
        return w; // Other windows keep their z-index
      });
    });
  };

  // Expose createNewFolder function to parent
  useEffect(() => {
    if (!onCreateNewFolder) return;
    
    const createNewFolder = (folderName) => {
      // Generate a unique type for the new folder
      const newFolderType = `folder-${Date.now()}`;
      
      // Find a position that doesn't overlap (simple grid placement)
      let newX = 20;
      let newY = 20;
      let attempts = 0;
      const maxAttempts = 100;
      
      while (attempts < maxAttempts) {
        // Use a closure-safe check for overlaps
        const checkX = newX;
        const checkY = newY;
        const overlaps = desktopItems.some(item => 
          Math.abs(item.x - checkX) < 100 && Math.abs(item.y - checkY) < 100
        );
        if (!overlaps) break;
        
        newX += 100;
        if (newX > window.innerWidth - 100) {
          newX = 20;
          newY += 100;
        }
        attempts++;
      }
      
      // Add new folder to desktop items
      const newFolder = {
        type: newFolderType,
        name: 'New Folder',
        icon: '/folder-closed.png',
        x: newX,
        y: newY,
        isBottom: false
      };
      
      setDesktopItems(prev => [...prev, newFolder]);
      
      // Auto-select the new folder for editing
      setSelectedIcon(newFolderType);
      setEditingIcon(newFolderType);
      
      // Optionally save to API (will be saved when editing is complete)
    };
    
    onCreateNewFolder(createNewFolder);
  }, [desktopItems, onCreateNewFolder]);

  // Expose openSelectedIcon function to parent
  useEffect(() => {
    if (!onOpenSelectedIcon) return;
    
    const openSelectedIconWindow = () => {
      if (!selectedIcon) return;
      
      const selectedItem = desktopItems.find(item => item.type === selectedIcon);
      if (!selectedItem) return;
      
      const type = selectedIcon;
      const name = selectedItem.name;
      
      // Special handling for "my reads" - open in new tab instead of window
      if (type === 'web' && name === 'My Reads') {
        window.open('https://curius.app/catherine-hoang', '_blank');
        return;
      }
      
      // Check if window is minimized
      const minimizedWindow = minimizedWindows.find(w => w.type === type);
      if (minimizedWindow) {
        // Restore minimized window
        const maxZIndex = openWindows.length > 0 
          ? Math.max(...openWindows.map(w => w.zIndex || 0))
          : 100;
        
        // Remove from minimized, add back to open with preserved state
        setMinimizedWindows(minimizedWindows.filter(w => w.id !== minimizedWindow.id));
        setOpenWindows([...openWindows, { ...minimizedWindow, zIndex: maxZIndex + 1 }]);
        return;
      }
      
      // Open window
      const existingWindow = openWindows.find(w => w.type === type);
      if (existingWindow) {
        // Window already exists - bring it to top and shift others down
        const maxZIndex = openWindows.length > 0 
          ? Math.max(...openWindows.map(w => w.zIndex || 0))
          : 100;
        
        const updatedWindows = openWindows.map(w => {
          if (w.id === existingWindow.id) {
            return { ...w, zIndex: maxZIndex + 1 }; // Bring to top
          }
          return { ...w, zIndex: (w.zIndex || 0) - 1 }; // Shift others down
        });
        
        setOpenWindows(updatedWindows);
      } else {
        // Find max z-index from existing windows
        const maxZIndex = openWindows.length > 0 
          ? Math.max(...openWindows.map(w => w.zIndex || 0))
          : 100;
        
        // Restore paint state if available
        const savedPaintState = type === 'paint' ? closedPaintWindows['paint'] : null;
        
        // Calculate position for paint window (centered y-axis, 50px from right)
        let windowX = 100 + openWindows.length * 30;
        let windowY = 100 + openWindows.length * 30;
        
        if (type === 'paint') {
          const paintWidth = Math.floor(window.innerWidth * 0.75);
          const paintHeight = Math.floor((window.innerWidth * 0.75) * (689 / 1055));
          windowX = window.innerWidth - paintWidth - 50; // 50px from right
          windowY = (window.innerHeight - paintHeight) / 2; // Centered on y-axis
        }
        
        const newWindow = {
          id: `${type}-${Date.now()}`,
          type: type,
          name: name,
          x: windowX,
          y: windowY,
          zIndex: maxZIndex + 1,
          ...(type === 'paint' ? { 
            width: Math.floor(window.innerWidth * 0.75),
            height: Math.floor((window.innerWidth * 0.75) * (689 / 1055))
          } : {}),
          ...(type === 'images' ? {
            height: Math.floor(window.innerHeight * 0.4),
            width: null
          } : {}),
          ...(type === 'doc' ? {
            width: 400,
            height: 480
          } : {}),
          ...(type === 'audio' ? {
            width: 500,
            height: 340
          } : {}),
          ...(savedPaintState ? { paintState: savedPaintState } : {})
        };
        
        // Shift other windows down in z-index
        const updatedWindows = openWindows.map(w => ({
          ...w,
          zIndex: (w.zIndex || 0) - 1
        }));
        
        setOpenWindows([...updatedWindows, newWindow]);
      }
    };
    
    onOpenSelectedIcon(openSelectedIconWindow);
  }, [selectedIcon, desktopItems, openWindows, minimizedWindows, closedPaintWindows, onOpenSelectedIcon]);

  // Expose closeTopWindow function to parent via callback
  useEffect(() => {
    if (!onCloseTopWindow) return;
    
    // Function to close the topmost window (highest z-index)
    const closeTopWindow = () => {
      setOpenWindows(prevWindows => {
        if (prevWindows.length === 0) return prevWindows;
        
        // Find window with highest z-index
        const topWindow = prevWindows.reduce((top, current) => {
          const topZ = top.zIndex || 0;
          const currentZ = current.zIndex || 0;
          return currentZ > topZ ? current : top;
        });
        
        // Close the top window
        if (topWindow) {
          // Get paint state if it's a paint window
          const paintState = topWindow.type === 'paint' ? paintWindowStates[topWindow.id] : null;
          
          // If closing paint window, save its state
          if (topWindow.type === 'paint' && paintState) {
            setClosedPaintWindows(prev => ({
              ...prev,
              [topWindow.type]: paintState
            }));
          }
          
          // Remove from open windows
          const updatedWindows = prevWindows.filter(w => w.id !== topWindow.id);
          
          // If closing folder window, deselect icon
          if (topWindow.type === 'folder') {
            setSelectedIcon(null);
          }
          
          // If closing music window, notify parent and stop audio
          if (topWindow.type === 'audio') {
            // Stop audio immediately before removing window
            // The Window component's cleanup will also handle this, but we do it here to ensure it happens
            if (onMusicWindowStateChange) {
              onMusicWindowStateChange(false, null);
            }
            setMusicWindowMuteHandler(null);
            // Note: The Window component's useEffect cleanup will also stop audio when it unmounts
          }
          
          return updatedWindows;
        }
        
        return prevWindows;
      });
    };
    
    onCloseTopWindow(closeTopWindow);
  }, [openWindows, paintWindowStates, onCloseTopWindow, onMusicWindowStateChange]);

  // Handle desktop click to deselect icons
  const handleDesktopClick = (e) => {
    // Only deselect if clicking directly on desktop (not on icons, windows, or their children)
    const target = e.target;
    const isIcon = target.closest('.desktop-icon');
    const isWindow = target.closest('.window');
    
    if (!isIcon && !isWindow && target.classList.contains('desktop')) {
      setSelectedIcon(null);
    }
  };

  return (
    <div 
      className="desktop"
      onClick={handleDesktopClick}
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/retro-site-bg.png)`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {desktopItems.map((item, index) => (
        <DesktopIcon
          key={index}
          type={item.type}
          name={item.name}
          icon={getIconPath(item)}
          x={item.x}
          y={item.y}
          selected={selectedIcon === item.type}
          isEditing={editingIcon === item.type}
          onNameChange={(newName) => handleIconNameChange(item.type, newName)}
          onEditComplete={(newName) => handleIconNameChange(item.type, newName)}
          onClick={(e) => {
            if (e) {
              e.stopPropagation();
            }
            handleIconClick(item.type, item.name);
          }}
          onDoubleClick={(e) => {
            if (e) {
              e.stopPropagation();
            }
            handleIconDoubleClick(item.type, item.name);
          }}
        />
      ))}
      {openWindows.map((window, index) => (
        <Window
          key={window.id}
          id={window.id}
          type={window.type}
          name={window.name}
          x={window.x}
          y={window.y}
          width={window.width}
          height={window.height}
          zIndex={window.zIndex || index}
          onClose={(id, type, paintState) => handleWindowClose(id, type, paintState, window.name)}
          onMinimize={handleWindowMinimize}
          onMove={handleWindowMove}
          onResize={handleWindowResize}
          onFocus={handleWindowFocus}
          paintState={window.paintState}
          onPaintStateChange={handlePaintStateChange}
          onMusicWindowOpen={(muteHandler, isMuted) => {
            setMusicWindowMuteHandler(() => muteHandler);
            if (onMusicWindowStateChange) {
              onMusicWindowStateChange(true, muteHandler, isMuted);
            }
          }}
        />
      ))}
    </div>
  );
};

export default Desktop;

