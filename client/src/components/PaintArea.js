import React, { useState, useRef, useEffect } from 'react';

const PaintArea = React.forwardRef(({ selectedTool, onToolChange, currentLayer, layers = [], initialObjects = [], onObjectsChange }, ref) => {
  const [objects, setObjects] = useState(initialObjects);
  
  // Update parent when objects change
  useEffect(() => {
    if (onObjectsChange) {
      onObjectsChange(objects);
    }
  }, [objects, onObjectsChange]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState([]);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [moveStart, setMoveStart] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  // canvasRef removed - not currently used
  const containerRef = useRef(null);
  
  // Expose containerRef to parent via ref
  React.useImperativeHandle(ref, () => ({
    containerRef: containerRef
  }));

  // Remove objects from deleted layers
  useEffect(() => {
    setObjects(prevObjects => prevObjects.filter(obj => layers.includes(obj.layer)));
  }, [layers]);


  // Get coordinates relative to canvas
  const getCanvasCoordinates = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - canvasOffset.x,
      y: e.clientY - rect.top - canvasOffset.y
    };
  };

  // Check if point is inside an object
  const isPointInObject = (point, obj) => {
    if (obj.type === 'frame' || obj.type === 'rectangle') {
      return point.x >= obj.x && point.x <= obj.x + obj.width &&
             point.y >= obj.y && point.y <= obj.y + obj.height;
    } else if (obj.type === 'text') {
      // Approximate text bounds
      return point.x >= obj.x && point.x <= obj.x + 100 &&
             point.y >= obj.y && point.y <= obj.y + 20;
    } else if (obj.type === 'path') {
      // Check if point is near any point in the path
      return obj.points.some(p => 
        Math.abs(p.x - point.x) < 10 && Math.abs(p.y - point.y) < 10
      );
    }
    return false;
  };

  // Handle mouse down
  const handleMouseDown = (e) => {
    if (selectedTool === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (selectedTool === 'select') {
      const pos = getCanvasCoordinates(e);
      // Find all objects at this point on the current layer, sorted by z-index (highest first)
      const objectsAtPoint = objects
        .filter(obj => obj.layer === currentLayer && isPointInObject(pos, obj))
        .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
      
      if (objectsAtPoint.length > 0) {
        // Select the topmost object (highest z-index) on current layer
        const clickedObject = objectsAtPoint[0];
        // If clicking on already selected object, allow moving it
        if (clickedObject.id === selectedObjectId) {
          setIsMoving(true);
          setMoveStart({ x: pos.x - clickedObject.x, y: pos.y - clickedObject.y });
        } else {
          setSelectedObjectId(clickedObject.id);
          setIsMoving(true);
          setMoveStart({ x: pos.x - clickedObject.x, y: pos.y - clickedObject.y });
        }
      } else {
        setSelectedObjectId(null);
        setIsMoving(false);
      }
      return;
    }

    const pos = getCanvasCoordinates(e);
    setStartPos(pos);
    setCurrentPos(pos);
    setIsDrawing(true);

    if (selectedTool === 'pen') {
      setCurrentPath([pos]);
    } else if (selectedTool === 'text') {
      // Create text input at click position
      const textId = `text-${Date.now()}`;
      // Get max z-index for current layer
      const layerObjects = objects.filter(obj => obj.layer === currentLayer);
      const maxZIndex = layerObjects.length > 0 
        ? Math.max(...layerObjects.map(obj => obj.zIndex || 0))
        : 0;
      const newText = {
        id: textId,
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Text',
        editing: true,
        layer: currentLayer,
        zIndex: maxZIndex + 1
      };
      setObjects([...objects, newText]);
      setIsDrawing(false);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (selectedTool === 'hand' && isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setCanvasOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (selectedTool === 'select' && isMoving && selectedObjectId) {
      const pos = getCanvasCoordinates(e);
      const selectedObj = objects.find(obj => obj.id === selectedObjectId);
      // Only move if object is on current layer
      if (selectedObj && selectedObj.layer === currentLayer) {
        setObjects(objects.map(obj => {
          if (obj.id === selectedObjectId) {
            return {
              ...obj,
              x: pos.x - moveStart.x,
              y: pos.y - moveStart.y
            };
          }
          return obj;
        }));
      }
      return;
    }

    if (!isDrawing) return;

    const pos = getCanvasCoordinates(e);
    setCurrentPos(pos);

    if (selectedTool === 'pen') {
      setCurrentPath(prev => [...prev, pos]);
    }
  };

  // Handle mouse up
  const handleMouseUp = (e) => {
    if (selectedTool === 'hand' && isPanning) {
      setIsPanning(false);
      return;
    }

    if (selectedTool === 'select' && isMoving) {
      setIsMoving(false);
      return;
    }

    if (!isDrawing) return;

    const endPos = currentPos;
    
    // Get max z-index for current layer
    const layerObjects = objects.filter(obj => obj.layer === currentLayer);
    const maxZIndex = layerObjects.length > 0 
      ? Math.max(...layerObjects.map(obj => obj.zIndex || 0))
      : 0;
    
    if (selectedTool === 'frame') {
      const frameId = `frame-${Date.now()}`;
      const newFrame = {
        id: frameId,
        type: 'frame',
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width: Math.abs(endPos.x - startPos.x),
        height: Math.abs(endPos.y - startPos.y),
        layer: currentLayer,
        zIndex: maxZIndex + 1
      };
      setObjects([...objects, newFrame]);
    } else if (selectedTool === 'shape') {
      const shapeId = `shape-${Date.now()}`;
      const newShape = {
        id: shapeId,
        type: 'rectangle',
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width: Math.abs(endPos.x - startPos.x),
        height: Math.abs(endPos.y - startPos.y),
        layer: currentLayer,
        zIndex: maxZIndex + 1
      };
      setObjects([...objects, newShape]);
    } else if (selectedTool === 'pen') {
      if (currentPath.length > 1) {
        const pathId = `path-${Date.now()}`;
        const newPath = {
          id: pathId,
          type: 'path',
          points: [...currentPath],
          layer: currentLayer,
          zIndex: maxZIndex + 1
        };
        setObjects([...objects, newPath]);
      }
      setCurrentPath([]);
    }

    setIsDrawing(false);
  };

  // Handle keyboard shortcuts for z-index adjustment
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedTool === 'select' && selectedObjectId && (e.key === '[' || e.key === ']')) {
        e.preventDefault();
        const selectedObj = objects.find(obj => obj.id === selectedObjectId);
        if (!selectedObj || selectedObj.layer !== currentLayer) return;
        
        // Get all objects on the same layer (current layer)
        const sameLayerObjects = objects.filter(obj => 
          obj.layer === currentLayer && obj.id !== selectedObjectId
        );
        
        if (e.key === ']') {
          // Move up (increase z-index) - swap with object above
          const objectsAbove = sameLayerObjects.filter(obj => 
            (obj.zIndex || 0) > (selectedObj.zIndex || 0)
          ).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
          
          if (objectsAbove.length > 0) {
            const targetObj = objectsAbove[0];
            setObjects(objects.map(obj => {
              if (obj.id === selectedObjectId) {
                return { ...obj, zIndex: targetObj.zIndex };
              } else if (obj.id === targetObj.id) {
                return { ...obj, zIndex: selectedObj.zIndex || 0 };
              }
              return obj;
            }));
          } else {
            // Already on top, just increment
            setObjects(objects.map(obj => 
              obj.id === selectedObjectId 
                ? { ...obj, zIndex: (obj.zIndex || 0) + 1 }
                : obj
            ));
          }
        } else if (e.key === '[') {
          // Move down (decrease z-index) - swap with object below
          const objectsBelow = sameLayerObjects.filter(obj => 
            (obj.zIndex || 0) < (selectedObj.zIndex || 0)
          ).sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
          
          if (objectsBelow.length > 0) {
            const targetObj = objectsBelow[0];
            setObjects(objects.map(obj => {
              if (obj.id === selectedObjectId) {
                return { ...obj, zIndex: targetObj.zIndex };
              } else if (obj.id === targetObj.id) {
                return { ...obj, zIndex: selectedObj.zIndex || 0 };
              }
              return obj;
            }));
          } else {
            // Already on bottom, just decrement (but not below 0)
            setObjects(objects.map(obj => 
              obj.id === selectedObjectId 
                ? { ...obj, zIndex: Math.max(0, (obj.zIndex || 0) - 1) }
                : obj
            ));
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTool, selectedObjectId, objects, currentLayer]);

  // Update cursor based on tool
  useEffect(() => {
    if (!containerRef.current) return;
    
    const cursors = {
      select: 'default',
      frame: 'crosshair',
      shape: 'crosshair',
      pen: 'none', // Use custom cursor element instead
      text: 'text',
      hand: isPanning ? 'grabbing' : 'grab'
    };
    
    containerRef.current.style.cursor = cursors[selectedTool] || 'default';
  }, [selectedTool, isPanning]);

  // Track mouse position for custom pen cursor
  useEffect(() => {
    if (selectedTool !== 'pen') return;
    
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [selectedTool]);

  // Handle text editing
  const handleTextChange = (id, newText) => {
    setObjects(objects.map(obj => 
      obj.id === id ? { ...obj, text: newText, editing: false } : obj
    ));
  };

  // Render objects - show all layers, but only allow selection/movement of current layer
  const renderObjects = () => {
    // Show all objects, sorted by layer and z-index
    const allObjects = objects
      .sort((a, b) => {
        // First sort by layer (current layer on top)
        if (a.layer === currentLayer && b.layer !== currentLayer) return 1;
        if (a.layer !== currentLayer && b.layer === currentLayer) return -1;
        // Then sort by z-index within same layer
        return (a.zIndex || 0) - (b.zIndex || 0);
      });
    
    return allObjects.map(obj => {
      const isSelected = obj.id === selectedObjectId && obj.layer === currentLayer;
      const isCurrentLayer = obj.layer === currentLayer;
      
      if (obj.type === 'frame') {
        return (
          <div
            key={obj.id}
            style={{
              position: 'absolute',
              left: `${obj.x}px`,
              top: `${obj.y}px`,
              width: `${obj.width}px`,
              height: `${obj.height}px`,
              border: `2px solid ${isSelected ? '#5757FF' : '#000000'}`,
              backgroundColor: isSelected ? 'rgba(87, 87, 255, 0.2)' : 'transparent',
              opacity: isCurrentLayer ? 1 : 0.5,
              pointerEvents: 'none'
            }}
          />
        );
      } else if (obj.type === 'rectangle') {
        return (
          <div
            key={obj.id}
            style={{
              position: 'absolute',
              left: `${obj.x}px`,
              top: `${obj.y}px`,
              width: `${obj.width}px`,
              height: `${obj.height}px`,
              border: `2px solid ${isSelected ? '#5757FF' : '#000000'}`,
              backgroundColor: isSelected ? 'rgba(87, 87, 255, 0.2)' : '#ffffff',
              opacity: isCurrentLayer ? 1 : 0.5,
              pointerEvents: 'none'
            }}
          />
        );
      } else if (obj.type === 'path') {
        if (obj.points.length < 2) return null;
        const pathData = obj.points.map((point, index) => 
          `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ');
        return (
          <svg
            key={obj.id}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            <path
              d={pathData}
              stroke={isSelected ? '#5757FF' : '#000000'}
              strokeWidth={isSelected ? '3' : '2'}
              fill="none"
              opacity={isCurrentLayer ? 1 : 0.5}
            />
          </svg>
        );
      } else if (obj.type === 'text') {
        return (
          <div
            key={obj.id}
            style={{
              position: 'absolute',
              left: `${obj.x}px`,
              top: `${obj.y}px`,
              fontFamily: "'Dogica Pixel', 'Courier New', monospace",
              fontSize: '12px',
              color: '#000000',
              backgroundColor: isSelected ? 'rgba(87, 87, 255, 0.2)' : '#ffffff',
              padding: '2px 4px',
              border: `1px solid ${isSelected ? '#5757FF' : '#000000'}`,
              opacity: isCurrentLayer ? 1 : 0.5,
              pointerEvents: (obj.editing && isCurrentLayer) ? 'auto' : 'none',
              minWidth: '50px'
            }}
            contentEditable={obj.editing && isCurrentLayer}
            suppressContentEditableWarning
            onBlur={(e) => handleTextChange(obj.id, e.target.textContent)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTextChange(obj.id, e.target.textContent);
              }
            }}
          >
            {obj.text}
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="paint-area-wrapper">
      <div
        ref={containerRef}
        className="paint-area-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${canvasOffset.x}px`,
            top: `${canvasOffset.y}px`,
            width: '100%',
            height: '100%'
          }}
        >
          {renderObjects()}
          {/* Preview for frame and shape tools */}
          {isDrawing && (selectedTool === 'frame' || selectedTool === 'shape') && (
            <div
              style={{
                position: 'absolute',
                left: `${Math.min(startPos.x, currentPos.x)}px`,
                top: `${Math.min(startPos.y, currentPos.y)}px`,
                width: `${Math.abs(currentPos.x - startPos.x)}px`,
                height: `${Math.abs(currentPos.y - startPos.y)}px`,
                border: '2px dashed #000000',
                backgroundColor: selectedTool === 'shape' ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                pointerEvents: 'none'
              }}
            />
          )}
          {/* Preview for pen tool */}
          {selectedTool === 'pen' && currentPath.length > 0 && (
            <svg
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}
            >
              <path
                d={currentPath.map((point, index) => 
                  `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                ).join(' ')}
                stroke="#000000"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          )}
        </div>
        {/* Custom pen cursor (50% of original size, top-left corner at drawing point) */}
        {selectedTool === 'pen' && (
          <img
            src={`${process.env.PUBLIC_URL}/pen.svg`}
            alt=""
            style={{
              position: 'absolute',
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              width: 'auto',
              height: '20px', // 50% of 40px (or 10px if original was 20px)
              pointerEvents: 'none',
              zIndex: 1000
            }}
          />
        )}
      </div>
    </div>
  );
});

export default PaintArea;

