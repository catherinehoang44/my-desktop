import React, { useState, useEffect, useRef } from 'react';

const PaintToolBar = ({ onToolChange, untitledName, onUntitledChange, onRestartClick, onExportJPG }) => {
  const [selectedTool, setSelectedTool] = useState('select'); // Default to select tool
  const [editingUntitled, setEditingUntitled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  const imgMenuBurger = "https://www.figma.com/api/mcp/asset/681c24d4-5054-46cd-a9e2-6a011eff5c6d";
  const imgSelect = "https://www.figma.com/api/mcp/asset/43e3eed8-4cbb-45b8-8de3-7f93c5d38615";
  const imgFrame = "https://www.figma.com/api/mcp/asset/d37b7e16-ac6f-482f-ab9c-e9871f46b19d";
  const imgShape = "https://www.figma.com/api/mcp/asset/07d6b638-e648-4bac-ab98-df7d3065c6d0";
  const imgPen = "https://www.figma.com/api/mcp/asset/af6a6114-7eed-493d-809e-05d3a793a56d";
  const imgUnion = "https://www.figma.com/api/mcp/asset/53a22476-89c7-4b11-8cbd-fc41d73e0734";
  const imgHand = "https://www.figma.com/api/mcp/asset/303d6ef6-f1d8-44a5-be91-5c5cadc2a73d";
  // imgComment removed - not currently used

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

