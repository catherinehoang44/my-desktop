import React from 'react';

const AboutDialog = ({ onClose }) => {
  return (
    <div className="confirmation-dialog-overlay" onClick={onClose}>
      <div className="confirmation-dialog-window about-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-dialog-header">
          <span className="confirmation-dialog-title">About Retro Desktop</span>
          <button className="confirmation-dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="confirmation-dialog-content about-content">
          <div className="about-info">
            <div className="about-title">Retro Desktop</div>
            <div className="about-version">Version 1.0</div>
            <div className="about-description">
              A nostalgic desktop experience that brings back the charm of classic operating systems.
            </div>
            <div className="about-features">
              <div className="about-feature-item">• Music Player with nostalgic soundtracks</div>
              <div className="about-feature-item">• Paint application for creative expression</div>
              <div className="about-feature-item">• Image gallery for memories</div>
              <div className="about-feature-item">• Classic window management</div>
            </div>
          </div>
        </div>
        <div className="confirmation-dialog-buttons">
          <button className="confirmation-dialog-btn confirmation-dialog-confirm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AboutDialog;






