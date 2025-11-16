import { useRef, useState, useMemo, useEffect } from 'react';
import { Mesh, Shape, ExtrudeGeometry, ShapeGeometry, Raycaster, Plane, Vector3, Vector2 } from 'three';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { SpaceInstance } from '../../types';
import { ThreeEvent, useThree } from '@react-three/fiber';
import * as LucideIcons from 'lucide-react';
import { SpaceControls } from './SpaceControls';
import { useSpring, animated } from '@react-spring/three';
import { getSpaceColor } from '../System/ThemeManager';

interface SpaceBlock3DProps {
  space: SpaceInstance;
  snapInterval: number;
  currentLevel: number; // Current building level being viewed
  labelMode?: 'text' | 'icon';
  isSelected?: boolean;
  presentationMode?: boolean;
  showLabels?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onMove?: (x: number, y: number, z: number) => void;
  onTransform?: (
    position: { x: number; y: number; z: number },
    rotation: number,
    scale: { x: number; y: number; z: number }
  ) => void;
  onDelete?: () => void;
  onToggleSelection?: () => void;
}

export function SpaceBlock3D({ space, snapInterval, currentLevel, labelMode = 'text', isSelected = false, presentationMode = false, showLabels = true, onDragStart, onDragEnd, onMove, onTransform, onDelete, onToggleSelection }: SpaceBlock3DProps) {
  // Visual filtering based on level
  // In presentation mode, show all spaces at full opacity
  // Otherwise, ghost spaces that are NOT on the current level
  const isOnCurrentLevel = space.level === currentLevel;

  // Helper function to desaturate and dim colors for spaces not on current level
  const getDisplayColor = (baseColor: string): string => {
    if (presentationMode || isOnCurrentLevel) return baseColor;

    // Convert hex to RGB, desaturate, and dim
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Convert to grayscale (simple average method)
    const gray = (r + g + b) / 3;

    // Mix 70% gray with 30% original color for slight color hint
    const mixedR = Math.round(gray * 0.7 + r * 0.3);
    const mixedG = Math.round(gray * 0.7 + g * 0.3);
    const mixedB = Math.round(gray * 0.7 + b * 0.3);

    // Dim by 40%
    const dimR = Math.round(mixedR * 0.6);
    const dimG = Math.round(mixedG * 0.6);
    const dimB = Math.round(mixedB * 0.6);

    return `#${dimR.toString(16).padStart(2, '0')}${dimG.toString(16).padStart(2, '0')}${dimB.toString(16).padStart(2, '0')}`;
  };

  const meshRef = useRef<Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [controlsHovered, setControlsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [editWidth, setEditWidth] = useState<string>(space.width.toString());
  const [editDepth, setEditDepth] = useState<string>(space.depth.toString());
  const [editHeight, setEditHeight] = useState<string>(space.height.toString());
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const { camera, gl } = useThree();
  // Drag plane at the space's Y level
  const planeRef = useRef(new Plane(new Vector3(0, 1, 0), -space.position.y));
  const dragOffsetRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  // Update plane position when space Y changes
  useEffect(() => {
    planeRef.current.constant = -space.position.y;
  }, [space.position.y]);

  const snapToGrid = (value: number) => {
    return Math.round(value / snapInterval) * snapInterval;
  };

  // Y position is half the height (so base sits on level's Y position)
  const height = space.height; // Use actual space height

  // Calculate bevel radius for 3D geometry (not used in shadow)
  //
  // GEOMETRY CREATION PROCESS:
  // 1. Create 2D rounded rectangle shape using quadraticCurveTo (vertical corner rounding)
  // 2. Extrude that shape upward along Z-axis
  // 3. Apply bevels to top/bottom edges via bevelEnabled (horizontal edge rounding)
  // 4. Rotate -90° around X-axis to stand upright
  //
  // DIMENSIONAL HANDLING:
  //
  // XZ PLANE (Width/Depth) - Vertical Edges:
  // - quadraticCurveTo rounds the 4 vertical corners within the shape bounds
  // - Corners DON'T expand footprint, they curve inward from corner points
  // - Shape dimensions (width × depth) already represent final XZ footprint
  // - ExtrudeGeometry's bevelSize affects top/bottom beveling, NOT XZ expansion
  // - TODO: Verify if subtracting bevelRadius*2 from width/depth (lines 235-236) is needed
  //
  // Y AXIS (Height) - Horizontal Edges:
  // - bevelThickness adds material on top and bottom edges during extrusion
  // - Must subtract bevelRadius * 2 from extrusion depth (line 266)
  // - Must offset mesh up by bevelRadius so bottom bevel sits at Y=0 (line 443)
  // - Result: bevelRadius + (height - bevelRadius*2) + bevelRadius = space.height ✓
  //
  // Minimum dimension for any space is 5 units (5x5x1 minimum)
  const minDimension = Math.min(space.width, space.depth, space.height);
  const bevelRadius = useMemo(() => {
    // For dimensions >= 10: use full 2.5 radius
    if (minDimension >= 10) {
      return 2.5;
    }
    // For dimensions between 5 and 10: scale linearly from 1.25 to 2.5
    else if (minDimension >= 5) {
      return 1.25 + ((minDimension - 5) / (10 - 5)) * (2.5 - 1.25);
    }
    // For dimensions < 5 (should not happen, but safety): cap at 1.25
    else {
      return 1.25;
    }
  }, [minDimension]);

  const [targetPosition, setTargetPosition] = useState<[number, number, number]>([
    space.position.x,
    space.position.y,
    space.position.z,
  ]);

  // Animated position with spring physics
  const { position, scale } = useSpring({
    position: targetPosition,
    scale: isDragging ? 0.9 : 1, // Shrink slightly when grabbed
    config: (key) => {
      if (key === 'scale') {
        return { tension: 800, friction: 25 }; // Snappy pop for haptic feel
      }
      return { tension: 300, friction: 20 }; // Normal spring for everything else
    },
    immediate: (key) => key === 'position' && isDragging, // Only position is immediate during drag
    onRest: () => {
      // Debug: log final position
      console.log(`Space ${space.name} final position:`, targetPosition, 'space.position.y:', space.position.y);
    }
  });

  // Sync local position with space prop when not dragging
  useEffect(() => {
    if (!isDragging) {
      setTargetPosition([space.position.x, space.position.y, space.position.z]);
    }
  }, [space.position.x, space.position.y, space.position.z, isDragging]);

  // Close controls when clicking outside
  useEffect(() => {
    if (!showControls) return;

    const handleClickOutside = () => {
      // Don't close if clicking on controls
      if (controlsHovered) return;
      setShowControls(false);
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showControls, controlsHovered]);

  // Handle global pointer move
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new Raycaster();
      raycaster.setFromCamera(new Vector2(x, y), camera);

      const intersection = new Vector3();
      raycaster.ray.intersectPlane(planeRef.current, intersection);

      if (intersection) {
        // Calculate offset for spaces with odd number of snap intervals
        const xIntervals = space.width / snapInterval;
        const zIntervals = space.depth / snapInterval;
        const xOffset = (xIntervals % 2 !== 0) ? snapInterval / 2 : 0;
        const zOffset = (zIntervals % 2 !== 0) ? snapInterval / 2 : 0;

        // Apply the drag offset to maintain relative position
        const rawX = intersection.x - dragOffsetRef.current.x;
        const rawZ = intersection.z - dragOffsetRef.current.z;

        // Snap while dragging
        const snappedX = snapToGrid(rawX - xOffset) + xOffset;
        const snappedZ = snapToGrid(rawZ - zOffset) + zOffset;

        setTargetPosition([snappedX, space.position.y, snappedZ]);

        // Call onMove during drag to update group positions in real-time
        if (onMove) {
          console.log('🔄 [SPACEBLOCK3D] Dragging:', space.name, '| Y preserved:', space.position.y, '| New position: [', snappedX, space.position.y, snappedZ, ']');
          onMove(snappedX, space.position.y, snappedZ);
        }
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);

      if (onDragEnd) {
        onDragEnd();
      }

      // Final snap on release (already handled by continuous onMove calls during drag)
      const xIntervals = space.width / snapInterval;
      const zIntervals = space.depth / snapInterval;
      const xOffset = (xIntervals % 2 !== 0) ? snapInterval / 2 : 0;
      const zOffset = (zIntervals % 2 !== 0) ? snapInterval / 2 : 0;

      const snappedX = snapToGrid(targetPosition[0] - xOffset) + xOffset;
      const snappedZ = snapToGrid(targetPosition[2] - zOffset) + zOffset;

      const finalPos = [snappedX, space.position.y, snappedZ];
      console.log('🏁 [SPACEBLOCK3D] Drag released:', space.name, '| Final Y:', space.position.y, '| Final position:', finalPos);
      setTargetPosition(finalPos as [number, number, number]);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, camera, gl, position, snapToGrid, onDragEnd, onMove]);


  // Create extruded rounded rectangle geometry with bevels on all edges
  const geometry = useMemo(() => {
    // Subtract bevelSize from width/depth since it expands the geometry outward
    const width = space.width - (bevelRadius * 2);
    const depth = space.depth - (bevelRadius * 2);

    // Create a rounded rectangle shape for beveled vertical edges
    const shape = new Shape();
    const x = -width / 2;
    const y = -depth / 2;
    const radius = bevelRadius;

    // Start at bottom-left corner (after the radius)
    shape.moveTo(x + radius, y);

    // Bottom edge to bottom-right corner
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);

    // Right edge to top-right corner
    shape.lineTo(x + width, y + depth - radius);
    shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);

    // Top edge to top-left corner
    shape.lineTo(x + radius, y + depth);
    shape.quadraticCurveTo(x, y + depth, x, y + depth - radius);

    // Left edge back to bottom-left corner
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);

    // Extrude the rounded shape with bevels on top/bottom edges
    const extrudeSettings = {
      steps: 1,
      depth: height - (bevelRadius * 2), // Subtract bevel thickness from height
      bevelEnabled: true,
      bevelThickness: bevelRadius,
      bevelSize: bevelRadius,
      bevelSegments: 10, // Smooth rounded edges on horizontal bevels
    };

    const geometry = new ExtrudeGeometry(shape, extrudeSettings);

    // Compute smooth vertex normals for better lighting and normal map display
    geometry.computeVertexNormals();

    // Generate proper UV coordinates for texture mapping
    // Texture scale: 100 feet = 1 texture repeat
    const textureScale = 100;
    const posAttribute = geometry.attributes.position;
    const normalAttribute = geometry.attributes.normal;
    const uvs: number[] = [];

    if (posAttribute && normalAttribute) {
      for (let i = 0; i < posAttribute.count; i++) {
        const x = posAttribute.getX(i);
        const y = posAttribute.getY(i);
        const z = posAttribute.getZ(i);

        const nx = normalAttribute.getX(i);
        const ny = normalAttribute.getY(i);
        const nz = normalAttribute.getZ(i);

        // Box/triplanar mapping: choose UV based on dominant normal direction
        // Scale UVs so 30 feet = 1 texture repeat
        let u = 0, v = 0;
        const absNx = Math.abs(nx);
        const absNy = Math.abs(ny);
        const absNz = Math.abs(nz);

        if (absNy > absNx && absNy > absNz) {
          // Top/bottom faces (Y-dominant)
          u = (x + width / 2) / textureScale;
          v = (z + depth / 2) / textureScale;
        } else if (absNx > absNz) {
          // Side faces (X-dominant)
          u = (z + depth / 2) / textureScale;
          v = (y + (height - bevelRadius * 2) / 2) / textureScale;
        } else {
          // Front/back faces (Z-dominant)
          u = (x + width / 2) / textureScale;
          v = (y + (height - bevelRadius * 2) / 2) / textureScale;
        }

        uvs.push(u, v);
      }

      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    }

    return geometry;
  }, [space.width, space.depth, height, bevelRadius]);

  // The total visual height is exactly space.height
  const totalHeight = height;

  // Create flat shadow geometry (simple rectangle to match main geometry)
  const shadowGeometry = useMemo(() => {
    const width = space.width;
    const depth = space.depth;

    // Create a simple rectangle shape
    const shape = new Shape();
    const x = -width / 2;
    const y = -depth / 2;

    shape.moveTo(x, y);
    shape.lineTo(x + width, y);
    shape.lineTo(x + width, y + depth);
    shape.lineTo(x, y + depth);
    shape.lineTo(x, y);

    return new ShapeGeometry(shape);
  }, [space.width, space.depth]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    // Don't allow dragging or controls while resizing
    if (isResizing) {
      return;
    }

    // Right-click to show controls
    if (e.button === 2) {
      setShowControls(!showControls);
      return;
    }

    // Left-click to drag
    if (e.button === 0) {
      console.log('🖱️ [SPACEBLOCK3D] Clicked to drag existing space:', space.name, '| Current Y:', space.position.y, '| Level:', space.level, '| Full position:', space.position);

      // Calculate offset between click point and object center
      const clickPoint = e.point;
      dragOffsetRef.current = {
        x: clickPoint.x - targetPosition[0],
        z: clickPoint.z - targetPosition[2],
      };

      setIsDragging(true);

      // Notify parent to disable panning
      if (onDragStart) {
        onDragStart();
      }
    }
  };

  const handleRotate = () => {
    // Rotate 90 degrees (rotation is stored in degrees: 0, 90, 180, 270)
    const currentRotation = space.rotation || 0;
    const newRotation = (currentRotation + 90) % 360;

    if (onTransform) {
      onTransform(
        { x: targetPosition[0], y: targetPosition[1], z: targetPosition[2] },
        newRotation as 0 | 90 | 180 | 270,
        { x: 1, y: 1, z: 1 }
      );
    }
    setShowControls(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowControls(false);
  };

  const handleMove = () => {
    if (onToggleSelection) {
      onToggleSelection();
    }
    setShowControls(false);
  };

  const handleResize = () => {
    setIsResizing(true);
    setShowControls(false);
    setEditWidth(space.width.toString());
    setEditDepth(space.depth.toString());
    setEditHeight(space.height.toString());

    // Notify parent to disable panning
    if (onDragStart) {
      onDragStart();
    }
  };

  const handleChangeHeight = () => {
    // This is now integrated into resize modal
    handleResize();
  };

  const handleChangeLevel = () => {
    setShowLevelDropdown(true);
    setShowControls(false);
  };

  const handleSelectLevel = (level: number) => {
    if (onMove) {
      // Calculate new Y position based on level (each level is 15 feet apart)
      const newY = (level - 1) * 15;
      onMove(targetPosition[0], newY, targetPosition[2]);
    }
    setShowLevelDropdown(false);
  };

  const handleApplyResize = () => {
    const newWidth = parseFloat(editWidth);
    const newDepth = parseFloat(editDepth);
    const newHeight = parseFloat(editHeight);

    // Only apply if all values are valid numbers
    if (!isNaN(newWidth) && !isNaN(newDepth) && !isNaN(newHeight) &&
        newWidth >= snapInterval && newDepth >= snapInterval && newHeight > 0 && onTransform) {
      const scaleX = newWidth / space.width;
      const scaleZ = newDepth / space.depth;
      const scaleY = newHeight / space.height;

      onTransform(
        { x: targetPosition[0], y: space.position.y, z: targetPosition[2] },
        space.rotation || 0,
        { x: scaleX, y: scaleY, z: scaleZ }
      );
    }

    setIsResizing(false);

    // Re-enable panning
    if (onDragEnd) {
      onDragEnd();
    }
  };

  // Use position directly without any offset
  const animatedPosition = position as any;

  return (
    <>
      {/* Shadow/ghost outline on ground when dragging - positioned independently */}
      {isDragging && (
        <animated.group position={animatedPosition} rotation={[0, ((space.rotation || 0) * Math.PI) / 180, 0]}>
          <mesh
            geometry={shadowGeometry}
            rotation={[-Math.PI / 2, 0, 0]} // Rotate to lie flat on XZ plane
            position={[0, 0.02, 0]} // Slightly above ground to prevent z-fighting
            renderOrder={-1}
          >
            <meshBasicMaterial
              color={getDisplayColor(getSpaceColor(space.type))}
              transparent
              opacity={presentationMode || isOnCurrentLevel ? 0.25 : 0.1}
              depthWrite={false}
              side={2} // DoubleSide so it's visible from both sides
            />
          </mesh>
        </animated.group>
      )}

      {/* Main space group - positioned and rotated */}
      <animated.group
        position={animatedPosition}
        rotation={[0, ((space.rotation || 0) * Math.PI) / 180, 0]}
      >
        {/* Inner group for scale */}
        <animated.group scale={scale as any}>
          {/* The 3D extruded beveled rectangle */}
          <animated.mesh
            ref={meshRef}
            geometry={geometry}
            rotation={[-Math.PI / 2, 0, 0]} // Rotate to stand upright
            position={[0, bevelRadius, 0]} // Offset up by bevelRadius so bottom edge sits at Y=0
        onPointerDown={handlePointerDown}
        onContextMenu={(e) => {
          e.stopPropagation();
          (e.nativeEvent as any).preventDefault?.();
        }}
        castShadow
        receiveShadow
        renderOrder={0}
      >
        <animated.meshStandardMaterial
          color={getDisplayColor(getSpaceColor(space.type))}
          roughness={0.4}          // 40% roughness - soft plastic sheen
          metalness={0}            // Non-metallic
          flatShading={false}      // Use smooth shading (interpolate normals across faces)

          // For ghosted objects on other levels: use traditional transparency
          {...(!presentationMode && !isOnCurrentLevel
            ? {
                transparent: true,
                opacity: 0.3
              }
            : {}
          )}

          depthWrite={!isDragging}
        />
      </animated.mesh>

          {/* Selection outline - blue glow when selected */}
          {isSelected && (
            <animated.mesh
              geometry={geometry}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, bevelRadius, 0]} // Match main mesh offset
              scale={1.02} // Slightly larger to show as outline
              renderOrder={1}
            >
          <meshBasicMaterial
            color="#3B82F6"
            transparent
            opacity={0.4}
            depthWrite={false}
          />
            </animated.mesh>
          )}
        </animated.group>

      {/* Controls (appears on right-click) - outside the scaled group */}
      {(showControls || controlsHovered) && !isDragging && (
        <Html
          position={[0, totalHeight + 1, 0]}
          center
          sprite
          zIndexRange={[100, 100]}
          style={{
            pointerEvents: 'auto',
          }}
        >
          <div
            onMouseEnter={() => setControlsHovered(true)}
            onMouseLeave={() => setControlsHovered(false)}
            style={{ paddingBottom: '20px' }}
          >
            <SpaceControls
              onRotate={handleRotate}
              onDelete={handleDelete}
              onResize={handleResize}
              onMove={handleMove}
              onChangeHeight={handleChangeHeight}
              onChangeLevel={handleChangeLevel}
              isSelected={isSelected}
              isClosing={!showControls && controlsHovered}
            />
          </div>
        </Html>
      )}

      {/* Selection badge */}
      {isSelected && (
        <Html
          position={[0, totalHeight + 10, 0]}
          center
          sprite
          zIndexRange={[10, 10]}
          pointerEvents="none"
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg pointer-events-none select-none">
            SELECTED
          </div>
        </Html>
      )}

      {/* Space label (HTML overlay) - scale based on space size - only shown if showLabels is true */}
      {showLabels && (
        <Html
          position={[0, totalHeight + 5, 0]}
          center
          transform
          sprite // Makes it always face the camera (billboard)
          scale={Math.min(10, Math.max(6, Math.min(space.width, space.depth) / 4))} // Scale from 6-10 based on smallest dimension
          zIndexRange={[0, 0]} // Keep z-index low so UI elements appear above
          pointerEvents="none"
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
        >
          {labelMode === 'icon' ? (
            // Icon mode - show lucide icon only
            <div className="flex flex-col items-center gap-1 pointer-events-none select-none">
              {(() => {
                const IconComponent = (LucideIcons as any)[space.icon || 'Square'];
                return IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : null;
              })()}
            </div>
          ) : (
            // Text mode - show name and dimensions
            <div
              className="px-3 py-2 text-center select-none pointer-events-none"
              style={{
                maxWidth: `${Math.min(space.width, space.depth) * 10}px`,
                overflow: 'hidden',
              }}
            >
              <div
                className="text-lg font-bold truncate select-none pointer-events-none"
                style={{
                  color: 'white',
                }}
              >
                {space.name}
              </div>
              <div
                className="text-sm truncate select-none pointer-events-none"
                style={{
                  color: 'white',
                }}
              >
                {space.width}' × {space.depth}'
              </div>
            </div>
          )}
        </Html>
      )}

      {/* Resize Form */}
      {isResizing && (
        <Html
          position={[0, totalHeight + 1, 0]}
          center
          sprite
          zIndexRange={[100, 100]}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 p-3 min-w-[220px]">
            <div className="space-y-2">
              {/* Width Input */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Width</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const current = parseFloat(editWidth) || 0;
                      setEditWidth(Math.max(snapInterval, current - snapInterval).toString());
                    }}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={editWidth}
                    onChange={(e) => setEditWidth(e.target.value)}
                    step={snapInterval}
                    min={snapInterval}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  />
                  <button
                    onClick={() => {
                      const current = parseFloat(editWidth) || 0;
                      setEditWidth((current + snapInterval).toString());
                    }}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Depth Input */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Depth</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const current = parseFloat(editDepth) || 0;
                      setEditDepth(Math.max(snapInterval, current - snapInterval).toString());
                    }}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={editDepth}
                    onChange={(e) => setEditDepth(e.target.value)}
                    step={snapInterval}
                    min={snapInterval}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  />
                  <button
                    onClick={() => {
                      const current = parseFloat(editDepth) || 0;
                      setEditDepth((current + snapInterval).toString());
                    }}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Height Input */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Height</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const current = parseFloat(editHeight) || 0;
                      setEditHeight(Math.max(snapInterval, current - snapInterval).toString());
                    }}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={editHeight}
                    onChange={(e) => setEditHeight(e.target.value)}
                    step={snapInterval}
                    min={snapInterval}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  />
                  <button
                    onClick={() => {
                      const current = parseFloat(editHeight) || 0;
                      setEditHeight((current + snapInterval).toString());
                    }}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleApplyResize}
                  className="flex-1 bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm font-medium"
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setIsResizing(false);
                    if (onDragEnd) {
                      onDragEnd();
                    }
                  }}
                  className="flex-1 bg-gray-500 text-white px-3 py-1.5 rounded hover:bg-gray-600 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* Level Dropdown */}
      {showLevelDropdown && (
        <Html
          position={[0, totalHeight + 1, 0]}
          center
          sprite
          zIndexRange={[100, 100]}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-3 min-w-[140px]">
            <div className="text-xs font-semibold text-gray-700 mb-2 px-1">Select Level</div>
            <div className="space-y-1.5">
              {[1, 2, 3, 4].map((level) => {
                // Calculate current level from Y position (Y = (level - 1) * 15)
                const currentLevel = Math.round(space.position.y / 15) + 1;
                const isCurrentLevel = currentLevel === level;
                return (
                  <button
                    key={level}
                    onClick={() => handleSelectLevel(level)}
                    className={`w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left ${
                      isCurrentLevel
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Level {level}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowLevelDropdown(false)}
              className="w-full mt-2 px-3 py-1.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </Html>
      )}
      </animated.group>
    </>
  );
}
