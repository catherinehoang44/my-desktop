import React, { useState, useRef, useEffect } from 'react';

const ChildhoodImage = ({ onImageLoad }) => {
  const [aspectRatio, setAspectRatio] = useState(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = `${process.env.PUBLIC_URL}/spyro-enter-the-dragonfly-ps2.png`;
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      setAspectRatio(ratio);
      // Notify parent of image size on first load
      if (onImageLoad && imgRef.current) {
        onImageLoad(img.naturalWidth, img.naturalHeight);
      }
    };
  }, [onImageLoad]);

  const handleImageLoad = () => {
    if (imgRef.current && !aspectRatio) {
      const ratio = imgRef.current.naturalWidth / imgRef.current.naturalHeight;
      setAspectRatio(ratio);
      // Notify parent of image size
      if (onImageLoad) {
        onImageLoad(imgRef.current.naturalWidth, imgRef.current.naturalHeight);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="childhood-image-container"
      style={aspectRatio ? { aspectRatio: aspectRatio } : {}}
    >
      <img 
        ref={imgRef}
        src={`${process.env.PUBLIC_URL}/spyro-enter-the-dragonfly-ps2.png`} 
        alt="Spyro Enter the Dragonfly PS2"
        className="childhood-image"
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default ChildhoodImage;

