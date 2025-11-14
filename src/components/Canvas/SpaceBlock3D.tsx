import { useRef, useState, useMemo, useEffect } from 'react';
import { Mesh, Shape, ExtrudeGeometry, Raycaster, Plane, Vector3, Vector2 } from 'three';
import { Html } from '@react-three/drei';
import type { SpaceInstance } from '../../types';
import { ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import * as LucideIcons from 'lucide-react';
import { SpaceControls } from './SpaceControls';
import { useSpring, animated, config } from '@react-spring/three';

interface SpaceBlock3DProps {
  space: SpaceInstance;
  snapInterval: number;
  labelMode?: 'text' | 'icon';
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onMove?: (x: number, y: number, z: number) => void;
  onTransform?: (
    position: { x: number; y: number; z: number },
    rotation: number,
    scale: { x: number; y: number; z: number }
  ) => void;
  onDelete?: () => void;
}

export function SpaceBlock3D({ space, snapInterval, labelMode = 'text', onDragStart, onDragEnd, onMove, onTransform, onDelete }: SpaceBlock3DProps) {
  const meshRef = useRef<Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [controlsHovered, setControlsHovered] = useState(false);
  const { camera, gl } = useThree();
  const planeRef = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const dragOffsetRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  const snapToGrid = (value: number) => {
    return Math.round(value / snapInterval) * snapInterval;
  };

  // Y position is half the height (so base sits on y=0)
  const height = 1; // Fixed height for now
  const [targetPosition, setTargetPosition] = useState<[number, number, number]>([
    space.position.x,
    0,
    space.position.z,
  ]);

  // Animated position with spring physics
  const { position, yOffset } = useSpring({
    position: targetPosition,
    yOffset: isDragging ? 5 : (hovered ? 2 : 0), // Subtle hover, more lift when grabbed
    config: isDragging
      ? { tension: 500, friction: 15 } // Super responsive during drag
      : { tension: 300, friction: 20 }, // Fast and bouncy when snapping to grid
    immediate: isDragging, // No interpolation during drag for instant response
  });

  // Sync local position with space prop when not dragging
  useEffect(() => {
    if (!isDragging) {
      setTargetPosition([space.position.x, 0, space.position.z]);
    }
  }, [space.position.x, space.position.z, isDragging]);

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
        // Apply the drag offset to maintain relative position
        setTargetPosition([
          intersection.x - dragOffsetRef.current.x,
          0,
          intersection.z - dragOffsetRef.current.z
        ]);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);

      if (onDragEnd) {
        onDragEnd();
      }

      // Calculate offset for spaces with odd number of snap intervals
      // e.g., 45' space with 5' snap = 9 intervals (odd), needs 2.5' offset
      const xIntervals = space.width / snapInterval;
      const zIntervals = space.depth / snapInterval;
      const xOffset = (xIntervals % 2 !== 0) ? snapInterval / 2 : 0;
      const zOffset = (zIntervals % 2 !== 0) ? snapInterval / 2 : 0;

      // Snap the corner to grid, then add offset for center
      const snappedX = snapToGrid(targetPosition[0] - xOffset) + xOffset;
      const snappedZ = snapToGrid(targetPosition[2] - zOffset) + zOffset;

      setTargetPosition([snappedX, 0, snappedZ]);

      if (onMove) {
        onMove(snappedX, 0, snappedZ);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, camera, gl, position, snapToGrid, onDragEnd, onMove]);

  // Create extruded rounded rectangle geometry
  const geometry = useMemo(() => {
    // Calculate bevel size based on smallest dimension
    const minDimension = Math.min(space.width, space.depth);
    const bevelSize = minDimension <= 15 ? Math.max(1, minDimension * 0.15) : 5;

    // Shrink the base shape by the bevel size so final dimensions match space.width/depth
    const width = space.width - (bevelSize * 2);
    const depth = space.depth - (bevelSize * 2);

    // Corner radius scales with bevel - smaller bevels need smaller corners
    const radius = Math.max(0.5, bevelSize * 0.4);

    // Create a rounded rectangle shape
    const shape = new Shape();
    const x = -width / 2;
    const y = -depth / 2;

    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + depth - radius);
    shape.quadraticCurveTo(x, y + depth, x + radius, y + depth);
    shape.lineTo(x + width - radius, y + depth);
    shape.quadraticCurveTo(x + width, y + depth, x + width, y + depth - radius);
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);

    // Extrude the shape to create 3D geometry
    const extrudeSettings = {
      steps: 1,
      depth: height,
      bevelEnabled: true,
      bevelThickness: bevelSize,
      bevelSize: bevelSize,
      bevelSegments: 10,
    };

    return new ExtrudeGeometry(shape, extrudeSettings);
  }, [space.width, space.depth, height]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

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
  };

  const handleRotate = () => {
    // Rotate 90 degrees (convert to radians)
    const newRotation = ((space.rotation || 0) + Math.PI / 2) % (Math.PI * 2);

    if (onTransform) {
      onTransform(
        { x: targetPosition[0], y: targetPosition[1], z: targetPosition[2] },
        newRotation,
        { x: 1, y: 1, z: 1 }
      );
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const handleResize = () => {
    // TODO: Implement resize functionality
    console.log('Resize clicked for', space.name);
  };

  // Combine position with yOffset
  const animatedPosition = position.to((x, y, z) => [x, y, z]) as any;

  return (
    <animated.group
      position={animatedPosition}
      position-y={yOffset as any}
      rotation={[0, space.rotation || 0, 0]}
    >
      {/* The 3D extruded rounded rectangle */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]} // Rotate to stand upright
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerDown={handlePointerDown}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={space.color}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Hover controls (appears on hover) */}
      {(hovered || controlsHovered) && !isDragging && (
        <Html
          position={[0, height + 1, 0]}
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
            />
          </div>
        </Html>
      )}

      {/* Space label (HTML overlay) - scale based on space size */}
      <Html
        position={[0, height + 5, 0]}
        center
        transform
        sprite // Makes it always face the camera (billboard)
        scale={Math.min(10, Math.max(6, Math.min(space.width, space.depth) / 4))} // Scale from 6-10 based on smallest dimension
        zIndexRange={[0, 0]} // Keep z-index low so UI elements appear above
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      >
        {labelMode === 'icon' ? (
          // Icon mode - show lucide icon
          <div className="flex items-center justify-center">
            {(() => {
              const IconComponent = (LucideIcons as any)[space.icon || 'Square'];
              return IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : null;
            })()}
          </div>
        ) : (
          // Text mode - show name and dimensions
          <div
            className="px-3 py-2 text-center"
            style={{
              maxWidth: `${Math.min(space.width, space.depth) * 10}px`,
              overflow: 'hidden',
            }}
          >
            <div
              className="text-lg font-bold truncate"
              style={{
                color: 'white',
              }}
            >
              {space.name}
            </div>
            <div
              className="text-base truncate"
              style={{
                color: 'white',
              }}
            >
              {space.width}' × {space.depth}'
            </div>
          </div>
        )}
      </Html>
    </animated.group>
  );
}
