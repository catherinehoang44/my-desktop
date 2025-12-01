import React from 'react';

const HelpCenterDialog = ({ onClose }) => {
  const helpTopics = [
    { 
      title: 'Getting Started',
      content: 'Welcome to Retro Desktop! Click on desktop icons to open windows. Use the menu bar at the top to access various features.'
    },
    { 
      title: 'Windows',
      content: 'You can drag windows by clicking and dragging the title bar. Most windows can be resized by dragging the edges. Close windows using the × button.'
    },
    { 
      title: 'Music Player',
      content: 'Open the Nostalgia window to play music. Use the forward/back buttons to navigate songs, or click the pause/play button to control playback. Press M to mute/unmute.'
    },
    { 
      title: 'Paint Window',
      content: 'Use the Paint window to create drawings. Select tools from the toolbar. Press V to select the selection tool. Use [ and ] to adjust object z-index when an object is selected.'
    },
    { 
      title: 'Images Window',
      content: 'Browse your childhood images in the Childhood window. Click on any image to view it in full size.'
    },
    { 
      title: 'Keyboard Shortcuts',
      content: 'See the Keyboard Shortcuts dialog from the Help menu for a complete list of available shortcuts.'
    },
  ];

  return (
    <div className="confirmation-dialog-overlay" onClick={onClose}>
      <div className="confirmation-dialog-window help-center-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-dialog-header">
          <span className="confirmation-dialog-title">Help Center</span>
          <button className="confirmation-dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="confirmation-dialog-content help-center-content">
          <div className="help-topics-list">
            {helpTopics.map((topic, index) => (
              <div key={index} className="help-topic-item">
                <div className="help-topic-title">{topic.title}</div>
                <div className="help-topic-content">{topic.content}</div>
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

export default HelpCenterDialog;


