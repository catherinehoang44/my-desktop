import React, { useState, useRef, useEffect } from 'react';

const MusicContainer = ({ currentSong, onForward, onBack, onPlayPause, isPlaying, currentTime, duration, onSeek, formatTime }) => {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editTimeValue, setEditTimeValue] = useState('');
  const timeInputRef = useRef(null);

  // Update edit value when entering edit mode
  useEffect(() => {
    if (isEditingTime && timeInputRef.current) {
      setEditTimeValue(formatTime(currentTime));
      timeInputRef.current.focus();
      timeInputRef.current.select();
    }
  }, [isEditingTime, currentTime, formatTime]);

  const handleTimeClick = () => {
    setIsEditingTime(true);
  };

  const handleTimeBlur = () => {
    setIsEditingTime(false);
    // Parse time input (supports MM:SS, M:SS, or just seconds)
    let totalSeconds = 0;
    
    // Try MM:SS or M:SS format
    const timeMatch = editTimeValue.match(/^(\d+):(\d{1,2})$/);
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1], 10);
      const seconds = parseInt(timeMatch[2], 10);
      totalSeconds = minutes * 60 + seconds;
    } else {
      // Try parsing as just seconds
      const secondsOnly = parseFloat(editTimeValue);
      if (!isNaN(secondsOnly)) {
        totalSeconds = secondsOnly;
      }
    }
    
    if (onSeek && isFinite(totalSeconds) && totalSeconds >= 0) {
      onSeek(totalSeconds);
    }
  };

  const handleTimeKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setIsEditingTime(false);
    }
  };

  const handleTimeChange = (e) => {
    setEditTimeValue(e.target.value);
  };

  const displayTime = formatTime(currentTime);
  const displayDuration = formatTime(duration);

  return (
    <div className="music-container">
      <div className="music-icon-container">
        <div className="music-option-item">
          <div className="music-option-rotated">
            <div className="music-option-icon">
              <img alt="Music" src="https://www.figma.com/api/mcp/asset/919229da-3ef1-4b8e-b60e-80131d4de18c" />
              <img alt="Music Icon" src="/music-icon.svg" className="music-icon-overlay" />
            </div>
          </div>
        </div>
      </div>
      <div className="music-title-artist-wrapper">
        <div className="music-option-rotated">
          <div className="music-title-artist">
            <img alt="Title/Artist" src="https://www.figma.com/api/mcp/asset/087ad46d-157e-44f0-94af-0d2731c5339a" />
            <div className="music-title-artist-text">
              <span className="music-song-title">{currentSong?.title}</span>
              <span className="music-time-display">
                {
                  isEditingTime ? (
                    <input
                      ref={timeInputRef}
                      type="text"
                      value={editTimeValue}
                      onChange={handleTimeChange}
                      onBlur={handleTimeBlur}
                      onKeyDown={handleTimeKeyDown}
                      style={{
                        background: '#fff',
                        border: '1px solid #000',
                        color: '#000',
                        fontFamily: "'Dogica Pixel', 'Courier New', monospace",
                        fontSize: '12px',
                        width: '60px',
                        padding: '0 2px',
                        outline: 'none',
                        margin: '0 2px'
                      }}
                    />
                  ) : (
                    <span 
                      onClick={handleTimeClick}
                      style={{ cursor: 'text', textDecoration: 'underline' }}
                      title="Click to edit time"
                    >
                      {displayTime}
                    </span>
                  )
                }/{displayDuration}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="music-options">
        <div className="music-option-item back-music-container" onClick={onBack} style={{ cursor: 'pointer' }}>
          <div className="music-option-rotated">
            <div className="music-option-icon">
              <img alt="Back" src="https://www.figma.com/api/mcp/asset/295b63c0-ced4-48d0-87f9-9817b303b6bf" />
              <img alt="Back Arrow" src="/back-arrow.svg" className="music-icon-overlay" />
            </div>
          </div>
        </div>
        <div className="music-option-item pause-play-container" onClick={onPlayPause} style={{ cursor: 'pointer' }}>
          <div className="music-option-rotated">
            <div className="music-option-icon">
              <img alt="Pause/Play" src="https://www.figma.com/api/mcp/asset/771c163e-779b-40be-a37d-f259c8288c2d" />
              {isPlaying ? (
                <img alt="Pause Icon" src="/pause-icon.svg" className="music-icon-overlay" />
              ) : (
                <svg className="music-icon-overlay" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
                  {/* Play icon - triangle pointing right */}
                  <polygon points="6,4 6,12 12,8" fill="#000" />
                </svg>
              )}
            </div>
          </div>
        </div>
        <div className="music-option-item forward-music-container" onClick={onForward} style={{ cursor: 'pointer' }}>
          <div className="music-option-rotated">
            <div className="music-option-icon">
              <img alt="Forward" src="https://www.figma.com/api/mcp/asset/d18e6de6-26c5-4045-9a63-9b98ffd691ba" />
              <img alt="Forward Arrow" src="/forward-arrow.svg" className="music-icon-overlay" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicContainer;

