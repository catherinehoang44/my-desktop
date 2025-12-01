import React, { useState, useRef, useEffect } from 'react';

const InputDialog = ({ title, message, placeholder, onConfirm, onCancel, initialValue = '' }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleConfirm = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="confirmation-dialog-overlay">
      <div className="confirmation-dialog-window" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-dialog-header">
          <span className="confirmation-dialog-title">{title}</span>
          <button className="confirmation-dialog-close" onClick={onCancel}>×</button>
        </div>
        <div className="confirmation-dialog-content">
          <p>{message}</p>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="input-dialog-input"
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '8px',
              fontFamily: "'Dogica Pixel', 'Courier New', monospace",
              fontSize: '12px',
              border: '2px solid #000000',
              outline: 'none'
            }}
          />
        </div>
        <div className="confirmation-dialog-buttons">
          <button className="confirmation-dialog-btn confirmation-dialog-cancel" onClick={onCancel}>Cancel</button>
          <button 
            className="confirmation-dialog-btn confirmation-dialog-confirm" 
            onClick={handleConfirm}
            disabled={!inputValue.trim()}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputDialog;


