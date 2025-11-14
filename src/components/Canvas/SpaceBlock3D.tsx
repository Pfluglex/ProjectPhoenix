import { useRef, useState } from 'react';
import { Mesh, BoxGeometry } from 'three';
import { Html } from '@react-three/drei';
import type { SpaceInstance } from '../../types';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface SpaceBlock3DProps {
  space: SpaceInstance;
  snapInterval: number;
  onMove?: (x: number, y: number, z: number) => void;
  onTransform?: (
    position: { x: number; y: number; z: number },
    rotation: number,
    scale: { x: number; y: number; z: number }
  ) => void;
}

export function SpaceBlock3D({ space, snapInterval, onMove, onTransform }: SpaceBlock3DProps) {
  const meshRef = useRef<Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const snapToGrid = (value: number) => {
    return Math.round(value / snapInterval) * snapInterval;
  };

  // Y position is half the height (so base sits on y=0)
  const yPosition = space.height / 2;

  return (
    <group position={[space.position.x, yPosition, space.position.z]} rotation={[0, space.rotation || 0, 0]}>
      {/* The 3D box */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[space.width, space.height, space.depth]} />
        <meshStandardMaterial
          color={space.color}
          opacity={hovered ? 0.9 : 0.85}
          transparent
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Edges for better visibility */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(space.width, space.height, space.depth)]} />
        <lineBasicMaterial color={hovered ? '#1f2937' : '#6b7280'} linewidth={2} />
      </lineSegments>

      {/* Space label (HTML overlay) */}
      <Html
        position={[0, space.height / 2 + 2, 0]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-gray-200">
          <div className="text-sm font-semibold text-gray-800 whitespace-nowrap">{space.name}</div>
          <div className="text-xs text-gray-600 whitespace-nowrap">
            {space.width}' × {space.depth}' × {space.height}'
          </div>
        </div>
      </Html>
    </group>
  );
}
