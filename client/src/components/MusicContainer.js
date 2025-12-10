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
              <img alt="Music" src="https://www.figma.com/api/mcp/asset/1a971149-6cc3-45b8-8c7f-23d84057268f" />
              <img alt="Music Icon" src={`${process.env.PUBLIC_URL}/music-icon.svg`} className="music-icon-overlay" />
            </div>
          </div>
        </div>
      </div>
      <div className="music-title-artist-wrapper">
        <div className="music-option-rotated">
          <div className="music-title-artist">
            <img alt="Title/Artist" src="https://www.figma.com/api/mcp/asset/c9fc6553-11e9-4be8-a836-fa4ec1f30a0f" />
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
              <img alt="Back" src="https://www.figma.com/api/mcp/asset/2783f422-b189-4f49-a2c0-7304de7929af" />
              <img alt="Back Arrow" src={`${process.env.PUBLIC_URL}/back-arrow.svg`} className="music-icon-overlay" />
            </div>
          </div>
        </div>
        <div className="music-option-item pause-play-container" onClick={onPlayPause} style={{ cursor: 'pointer' }}>
          <div className="music-option-rotated">
            <div className="music-option-icon">
              <img alt="Pause/Play" src="https://www.figma.com/api/mcp/asset/2783f422-b189-4f49-a2c0-7304de7929af" />
              {isPlaying ? (
                <img alt="Pause Icon" src={`${process.env.PUBLIC_URL}/pause-icon.svg`} className="music-icon-overlay" />
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
              <img alt="Forward" src="https://www.figma.com/api/mcp/asset/2783f422-b189-4f49-a2c0-7304de7929af" />
              <img alt="Forward Arrow" src={`${process.env.PUBLIC_URL}/forward-arrow.svg`} className="music-icon-overlay" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicContainer;

