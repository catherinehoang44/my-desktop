import React, { useState, useEffect, useRef } from 'react';

const MenuBar = ({ onMenuAction, isMusicWindowOpen, onMuteToggle, musicMuteState, windowCount }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  const handleVolumeClick = () => {
    if (onMuteToggle) {
      onMuteToggle();
    }
  };

  const menuItems = [
    {
      name: 'File',
      items: [
        'New',
        'Open',
        'divider',
        'Exit'
      ]
    },
    {
      name: 'Edit',
      items: [
        'Undo',
        'Redo',
        'divider',
        'Cut',
        'Copy',
        'Paste'
      ]
    },
    {
      name: 'View',
      items: [
        'Show Grid'
      ]
    },
    {
      name: 'Go',
      items: [
        'Back',
        'Forward',
        'Home',
        'divider',
        'Go to Folder...'
      ]
    },
    {
      name: 'Window',
      items: [
        'Minimize',
        'Zoom',
        'Bring All to Front',
        'divider',
        'Close Window'
      ]
    },
    {
      name: 'Help',
      items: [
        'Help Center',
        'Keyboard Shortcuts',
        'divider',
        'About'
      ]
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (menuName, item) => {
    if (onMenuAction) {
      onMenuAction(menuName, item);
    }
    setActiveMenu(null);
  };

  return (
    <div className="menu-bar" ref={menuRef}>
      {menuItems.map((menu) => (
        <div
          key={menu.name}
          className={`menu-item ${activeMenu === menu.name ? 'active' : ''}`}
          onClick={() => handleMenuClick(menu.name)}
        >
          <span>{menu.name}</span>
          <div className="dropdown-menu">
            {menu.items.map((item, index) => (
              item === 'divider' ? (
                <div key={index} className="dropdown-divider"></div>
              ) : (
                <div
                  key={index}
                  className={`dropdown-item ${item === 'Exit' && windowCount === 0 ? 'disabled' : ''}`}
                  onClick={() => {
                    if (item === 'Exit' && windowCount === 0) {
                      return; // Don't do anything if Exit is disabled
                    }
                    handleMenuItemClick(menu.name, item);
                  }}
                  style={item === 'Exit' && windowCount === 0 ? { 
                    color: '#999', 
                    cursor: 'default',
                    opacity: 0.5 
                  } : {}}
                >
                  {item}
                </div>
              )
            ))}
          </div>
        </div>
      ))}
      {isMusicWindowOpen && (
        <div 
          className="volume-button"
          onClick={handleVolumeClick}
          title={musicMuteState ? "Unmute" : "Mute"}
        >
          <div className="volume-button-pixel">
            {musicMuteState ? (
              // Muted icon (pixel art style - X over speaker)
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
                {/* Speaker bars */}
                <rect x="2" y="5" width="1.5" height="6" fill="#000" />
                <rect x="4.5" y="4" width="1.5" height="8" fill="#000" />
                <rect x="7" y="3" width="1.5" height="10" fill="#000" />
                {/* X mark */}
                <line x1="10" y1="3" x2="14" y2="13" stroke="#000" strokeWidth="1.5" strokeLinecap="square" />
                <line x1="14" y1="3" x2="10" y2="13" stroke="#000" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            ) : (
              // Unmuted icon (pixel art style - speaker with sound waves)
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
                {/* Speaker bars */}
                <rect x="2" y="5" width="1.5" height="6" fill="#000" />
                <rect x="4.5" y="4" width="1.5" height="8" fill="#000" />
                <rect x="7" y="3" width="1.5" height="10" fill="#000" />
                {/* Sound waves */}
                <path d="M10 4 L11 5 L10 6 M11 5 L12 4 M11 5 L12 6" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="square" />
                <path d="M11 7 L12 8 L11 9 M12 8 L13 7 M12 8 L13 9" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="square" />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBar;

