import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useTheme } from '../System/ThemeManager';
import type { SpaceInstance } from '../../types';
import { SpaceBlock3D } from './SpaceBlock3D';
import * as THREE from 'three';

interface Canvas3DProps {
  width?: number;
  height?: number;
  placedSpaces?: SpaceInstance[];
  onCanvasStateChange?: (state: { position: { x: number; y: number }; zoom: number }) => void;
  onSpaceDrop?: (space: SpaceInstance) => void;
  onSpaceMove?: (instanceId: string, x: number, y: number, z: number) => void;
  onSpaceTransform?: (instanceId: string, position: { x: number; y: number; z: number }, rotation: number, scale: { x: number; y: number; z: number }) => void;
  snapInterval?: number;
}

export function Canvas3D({
  width = 1200,
  height = 800,
  placedSpaces = [],
  onCanvasStateChange,
  onSpaceDrop,
  onSpaceMove,
  onSpaceTransform,
  snapInterval = 5
}: Canvas3DProps) {
  const { componentThemes } = useTheme();
  const theme = componentThemes.canvasControls.light;
  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);
  const [isDraggingSpace, setIsDraggingSpace] = useState(false);
  const controlsRef = useRef<any>(null);

  // Handle drop from palette
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const spaceData = e.dataTransfer.getData('application/json');
    if (!spaceData || !onSpaceDrop) return;

    const spaceTemplate = JSON.parse(spaceData);

    // Get drop position in the container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // For now, place at a simple position - we'll improve this with raycasting
    const canvasX = ((x - rect.width / 2) / 10);
    const canvasZ = ((y - rect.height / 2) / 10);

    // Snap to grid
    const snappedX = Math.round(canvasX / snapInterval) * snapInterval;
    const snappedZ = Math.round(canvasZ / snapInterval) * snapInterval;

    // Create space instance
    const newSpace: SpaceInstance = {
      ...spaceTemplate,
      instanceId: `${spaceTemplate.id}-${Date.now()}`,
      templateId: spaceTemplate.id,
      position: { x: snappedX, y: 0, z: snappedZ },
      rotation: 0,
    };

    onSpaceDrop(newSpace);
    setIsDraggingFromPalette(false);
  };

  return (
    <div
      className="relative w-full h-full bg-gray-50"
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        if (!isDraggingFromPalette) {
          setIsDraggingFromPalette(true);
        }
      }}
      onDragLeave={() => {
        setIsDraggingFromPalette(false);
      }}
    >
      {/* Controls placeholder - will add later */}

      {/* Three.js Canvas */}
      <Canvas
        camera={{
          position: [0, 200, 0.001], // Straight down (90 degrees)
          fov: 50,
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />

        {/* Grid */}
        <Grid
          args={[500, 500]} // 500x500 feet
          cellSize={5} // 5-foot cells
          cellThickness={0.5}
          cellColor="#D1D5DB"
          sectionSize={30} // 30-foot sections (major grid)
          sectionThickness={1}
          sectionColor="#9CA3AF"
          fadeDistance={400}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />

        {/* Origin marker */}
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2, 32]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>

        {/* Invisible ground plane for drag events */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial />
        </mesh>

        {/* Placed Spaces */}
        {placedSpaces.map((space) => (
          <SpaceBlock3D
            key={space.instanceId}
            space={space}
            snapInterval={snapInterval}
            onDragStart={() => setIsDraggingSpace(true)}
            onDragEnd={() => setIsDraggingSpace(false)}
            onMove={(x, y, z) => {
              if (onSpaceMove) {
                onSpaceMove(space.instanceId, x, y, z);
              }
            }}
            onTransform={(position, rotation, scale) => {
              if (onSpaceTransform) {
                onSpaceTransform(space.instanceId, position, rotation, scale);
              }
            }}
          />
        ))}

        {/* Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={false} // Disable rotation completely
          enablePan={!isDraggingSpace} // Disable pan when dragging a space
          enableZoom={true}
          minDistance={100}
          maxDistance={500}
          minPolarAngle={0} // Lock at 90 degrees (straight down)
          maxPolarAngle={0} // Lock at 90 degrees (straight down)
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,      // Pan with left click
            MIDDLE: THREE.MOUSE.DOLLY,  // Zoom with middle mouse
            RIGHT: THREE.MOUSE.PAN      // Right click also pans
          }}
        />
      </Canvas>
    </div>
  );
}
