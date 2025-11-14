import { useRef, useState, useMemo, useEffect } from 'react';
import { Mesh, Shape, ExtrudeGeometry, Raycaster, Plane, Vector3, Vector2 } from 'three';
import { Html } from '@react-three/drei';
import type { SpaceInstance } from '../../types';
import { ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface SpaceBlock3DProps {
  space: SpaceInstance;
  snapInterval: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onMove?: (x: number, y: number, z: number) => void;
  onTransform?: (
    position: { x: number; y: number; z: number },
    rotation: number,
    scale: { x: number; y: number; z: number }
  ) => void;
}

export function SpaceBlock3D({ space, snapInterval, onDragStart, onDragEnd, onMove, onTransform }: SpaceBlock3DProps) {
  const meshRef = useRef<Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { camera, gl } = useThree();
  const planeRef = useRef(new Plane(new Vector3(0, 1, 0), 0));

  const snapToGrid = (value: number) => {
    return Math.round(value / snapInterval) * snapInterval;
  };

  // Y position is half the height (so base sits on y=0)
  const height = 1; // Fixed height for now
  const [position, setPosition] = useState<[number, number, number]>([
    space.position.x,
    0,
    space.position.z,
  ]);

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
        setPosition([intersection.x, 0, intersection.z]);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);

      if (onDragEnd) {
        onDragEnd();
      }

      const snappedX = snapToGrid(position[0]);
      const snappedZ = snapToGrid(position[2]);

      setPosition([snappedX, 0, snappedZ]);

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
    const width = space.width;
    const depth = space.depth;
    const radius = 2; // Corner radius

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
      bevelEnabled: false,
    };

    return new ExtrudeGeometry(shape, extrudeSettings);
  }, [space.width, space.depth, height]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);

    // Notify parent to disable panning
    if (onDragStart) {
      onDragStart();
    }
  };

  return (
    <group position={position} rotation={[0, space.rotation || 0, 0]}>
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
          opacity={hovered || isDragging ? 0.9 : 0.85}
          transparent
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Space label (HTML overlay) */}
      <Html
        position={[0, height + 5, 0]}
        center
        transform
        occlude
        sprite // Makes it always face the camera (billboard)
        scale={10} // Scale up the entire HTML element
        zIndexRange={[0, 0]} // Keep z-index low so UI elements appear above
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      >
        <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-gray-200">
          <div className="text-lg font-bold text-gray-900 whitespace-nowrap">{space.name}</div>
          <div className="text-base text-gray-600 whitespace-nowrap">
            {space.width}' × {space.depth}'
          </div>
        </div>
      </Html>
    </group>
  );
}
