import React from 'react';

const KeyboardShortcutsDialog = ({ onClose }) => {
  const shortcuts = [
    { key: 'M', description: 'Mute/Unmute music (when music window is open)' },
    { key: 'V', description: 'Select tool (Paint window)' },
    { key: '[', description: 'Move selected object down in z-index (Paint window)' },
    { key: ']', description: 'Move selected object up in z-index (Paint window)' },
  ];

  return (
    <div className="confirmation-dialog-overlay" onClick={onClose}>
      <div className="confirmation-dialog-window keyboard-shortcuts-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-dialog-header">
          <span className="confirmation-dialog-title">Keyboard Shortcuts</span>
          <button className="confirmation-dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="confirmation-dialog-content keyboard-shortcuts-content">
          <div className="shortcuts-list">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="shortcut-item">
                <div className="shortcut-key">{shortcut.key}</div>
                <div className="shortcut-description">{shortcut.description}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="confirmation-dialog-buttons">
          <button className="confirmation-dialog-btn confirmation-dialog-confirm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsDialog;






