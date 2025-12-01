import React, { useState, useRef, useEffect } from 'react';

const DesktopIcon = ({ type, name, icon, x, y, selected, onClick, onDoubleClick, isEditing, onNameChange, onEditComplete }) => {
  const [isEditingLocal, setIsEditingLocal] = useState(isEditing || false);
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef(null);
  const isImage = icon.endsWith('.png') || icon.endsWith('.svg') || icon.endsWith('.jpg') || icon.endsWith('.jpeg');
  const isMyReads = type === 'web' && name === 'My Reads';
  
  // Sync editing state from props
  useEffect(() => {
    if (isEditing) {
      setIsEditingLocal(true);
      setEditValue(name);
    }
  }, [isEditing, name]);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditingLocal && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLocal]);
  
  const handleClick = (e) => {
    if (onClick && e) {
      onClick(e);
    }
  };
  
  const handleLabelDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditingLocal(true);
    setEditValue(name);
  };
  
  const handleInputBlur = () => {
    setIsEditingLocal(false);
    if (onEditComplete && editValue.trim()) {
      onEditComplete(editValue.trim());
    } else {
      setEditValue(name);
    }
  };
  
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditingLocal(false);
      setEditValue(name);
      if (onEditComplete) {
        onEditComplete(name);
      }
    }
  };
  
  return (
    <div
      className={`desktop-icon ${selected ? 'selected' : ''}`}
      data-icon={type}
      style={{ 
        left: `${x}px`, 
        top: `${y}px`
      }}
      onClick={(e) => {
        if (e && !isEditingLocal) {
          handleClick(e);
        }
      }}
      onDoubleClick={(e) => {
        if (e && onDoubleClick && !isEditingLocal) {
          e.stopPropagation();
          onDoubleClick(e);
        }
      }}
      title={isMyReads ? 'Open in new tab' : undefined}
    >
      <div className="icon-image">
        {isImage ? (
          <img 
            src={icon} 
            alt={name} 
            className="icon-img" 
            draggable={false}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        ) : (
          icon
        )}
      </div>
      {isEditingLocal ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="icon-label-input"
          style={{
            fontSize: '9px',
            color: '#fff',
            background: 'rgba(0, 0, 0, 0.7)',
            border: '1px solid #5757FF',
            padding: '2px 4px',
            width: '70px',
            textAlign: 'center',
            fontFamily: 'inherit',
            outline: 'none'
          }}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div 
          className="icon-label"
          onDoubleClick={handleLabelDoubleClick}
        >
          {name}
        </div>
      )}
    </div>
  );
};

export default DesktopIcon;

