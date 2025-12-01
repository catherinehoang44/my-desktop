import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImagesGrid = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('/api/images');
        setImages(response.data || []);
      } catch (error) {
        console.error('Error fetching images:', error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Web files data (4 items)
  const webFiles = [
    { name: 'Curiosity Quench', icon: '/web-icon.svg' },
    { name: 'Game of Life', icon: '/web-icon.svg' },
    { name: 'Old Portfolio', icon: '/web-icon.svg' },
    { name: 'Whose Cat', icon: '/web-icon.svg' }
  ];

  // Image names in order
  const imageNames = [
    'Board Game',
    'Crochet Cow',
    'Lunchbox',
    'Memory Palace',
    'Pacus',
    'Record Player',
    'Residency',
    'Travel Slot',
    'Work w/ Cat',
    'xibii'
  ];

  // Get first 10 images (or pad with placeholders if less than 10)
  const displayImages = images.slice(0, 10);
  const imagePlaceholders = Array(Math.max(0, 10 - images.length)).fill(null);

  return (
    <div className="images-grid-container">
      {loading ? (
        <div className="images-grid-loading">Loading...</div>
      ) : (
        <div className="images-grid">
          {/* Web Files Section */}
          {webFiles.map((file, index) => (
            <div key={`web-${index}`} className="grid-item web-file">
              <div className="grid-item-icon">
                <img src={file.icon} alt={file.name} />
              </div>
              <div className="grid-item-label">{file.name}</div>
            </div>
          ))}
          
          {/* Images Section */}
          {displayImages.map((image, index) => (
            <div key={image._id || index} className="grid-item image-item">
              <div className="grid-item-icon">
                <img src="/img-icon.svg" alt={imageNames[index] || 'Image'} />
              </div>
              <div className="grid-item-label">
                {imageNames[index] || 'Image'}
              </div>
            </div>
          ))}
          
          {/* Placeholder for remaining images if less than 10 */}
          {imagePlaceholders.map((_, index) => {
            const imageIndex = displayImages.length + index;
            return (
              <div key={`placeholder-${index}`} className="grid-item image-item placeholder">
                <div className="grid-item-icon">
                  <img src="/img-icon.svg" alt={imageNames[imageIndex] || 'Empty'} />
                </div>
                <div className="grid-item-label">{imageNames[imageIndex] || 'Empty'}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImagesGrid;

