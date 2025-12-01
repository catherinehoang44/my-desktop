import React, { useState, useEffect, useRef } from 'react';

const PaintToolBar = ({ onToolChange, untitledName, onUntitledChange, onRestartClick, onExportJPG }) => {
  const [selectedTool, setSelectedTool] = useState('select'); // Default to select tool
  const [editingUntitled, setEditingUntitled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  const imgMenuBurger = "https://www.figma.com/api/mcp/asset/1b037a62-2610-4553-b4e9-060a11f3a211";
  const imgSelect = "https://www.figma.com/api/mcp/asset/aaeae489-6c06-47d2-bc30-ea3ebf5a8443";
  const imgFrame = "https://www.figma.com/api/mcp/asset/4d40240d-b546-4b80-bb31-bd6bfe9b79c7";
  const imgShape = "https://www.figma.com/api/mcp/asset/38a3458c-bd31-43b6-8049-11be79156efa";
  const imgPen = "https://www.figma.com/api/mcp/asset/690c6fda-42cb-4d2c-aeba-5541b227c3fc";
  const imgUnion = "https://www.figma.com/api/mcp/asset/d54b6e1c-f9e3-4252-87d4-2e9d97b4d373";
  const imgHand = "https://www.figma.com/api/mcp/asset/9abc006b-7d20-46f3-8f37-efccb221e0a4";
  const imgComment = "https://www.figma.com/api/mcp/asset/030707a1-40ea-45ee-a7b2-c9458b128f27";

  const handleToolClick = (toolName) => {
    if (toolName === 'menu') {
      setShowMenu(!showMenu);
      return;
    }
    setSelectedTool(toolName);
    if (onToolChange) {
      onToolChange(toolName);
    }
    setShowMenu(false);
  };

  const handleExportJPG = () => {
    if (onExportJPG) {
      onExportJPG();
    }
    setShowMenu(false);
  };

  const handleRestartFile = () => {
    setShowMenu(false);
    if (onRestartClick) {
      onRestartClick();
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="paint-toolbar">
      <div className="paint-tools-container">
        <div className="paint-tool-wrapper paint-menu-wrapper" ref={menuRef}>
          <div 
            className={`paint-tool-item paint-menu-burger ${showMenu ? 'selected' : ''}`}
            onClick={() => handleToolClick('menu')}
          >
            <img src={imgMenuBurger} alt="Menu" />
          </div>
          {showMenu && (
            <div className="paint-menu-dropdown">
              <button className="paint-menu-item" onClick={handleExportJPG}>Export as JPG</button>
              <button className="paint-menu-item" onClick={handleRestartFile}>Restart File</button>
            </div>
          )}
        </div>
        <div className="paint-tool-wrapper">
          <div 
            className={`paint-tool-item ${selectedTool === 'select' ? 'selected' : ''}`}
            onClick={() => handleToolClick('select')}
          >
            <img src={imgSelect} alt="Select" />
          </div>
        </div>
        <div className="paint-tool-wrapper">
          <div 
            className={`paint-tool-item ${selectedTool === 'frame' ? 'selected' : ''}`}
            onClick={() => handleToolClick('frame')}
          >
            <img src={imgFrame} alt="Frame" />
          </div>
        </div>
        <div className="paint-tool-wrapper">
          <div 
            className={`paint-tool-item ${selectedTool === 'shape' ? 'selected' : ''}`}
            onClick={() => handleToolClick('shape')}
          >
            <img src={imgShape} alt="Shape" />
          </div>
        </div>
        <div className="paint-tool-wrapper">
          <div 
            className={`paint-tool-item ${selectedTool === 'pen' ? 'selected' : ''}`}
            onClick={() => handleToolClick('pen')}
          >
            <img src={imgPen} alt="Pen" />
          </div>
        </div>
        <div className="paint-tool-wrapper">
          <div 
            className={`paint-tool-item ${selectedTool === 'text' ? 'selected' : ''}`}
            onClick={() => handleToolClick('text')}
          >
            <img src={imgUnion} alt="Text" />
          </div>
        </div>
        <div className="paint-tool-wrapper">
          <div 
            className={`paint-tool-item ${selectedTool === 'hand' ? 'selected' : ''}`}
            onClick={() => handleToolClick('hand')}
          >
            <img src={imgHand} alt="Hand" />
          </div>
        </div>
      </div>
      <div 
        className="paint-toolbar-filename"
        onDoubleClick={() => setEditingUntitled(true)}
      >
        {editingUntitled ? (
          <input
            type="text"
            value={untitledName || 'untitled'}
            onChange={(e) => {
              const newName = e.target.value.slice(0, 12);
              if (onUntitledChange) {
                onUntitledChange(newName);
              }
            }}
            onBlur={() => setEditingUntitled(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditingUntitled(false);
              }
            }}
            autoFocus
            className="paint-untitled-rename-input"
            style={{ textAlign: 'right' }}
          />
        ) : (
          untitledName || 'untitled'
        )}
      </div>
    </div>
  );
};

export default PaintToolBar;

