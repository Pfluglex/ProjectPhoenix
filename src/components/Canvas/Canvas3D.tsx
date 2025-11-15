import { useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../System/ThemeManager';
import type { SpaceInstance } from '../../types';
import { SpaceBlock3D } from './SpaceBlock3D';

// Component to handle raycasting for drag preview
function DragPreviewHandler({
  onPositionUpdate,
  snapInterval
}: {
  onPositionUpdate: (pos: { x: number; y: number; z: number }) => void;
  snapInterval: number;
}) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Get mouse position in normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycaster.current.setFromCamera(new THREE.Vector2(x, y), camera);

      // Find intersection with ground plane
      const intersection = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(groundPlane.current, intersection);

      if (intersection) {
        // Snap to grid
        const snappedX = Math.round(intersection.x / snapInterval) * snapInterval;
        const snappedZ = Math.round(intersection.z / snapInterval) * snapInterval;

        onPositionUpdate({ x: snappedX, y: 0, z: snappedZ });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera, gl, snapInterval, onPositionUpdate]);

  return null;
}

interface Canvas3DProps {
  width?: number;
  height?: number;
  placedSpaces?: SpaceInstance[];
  onCanvasStateChange?: (state: { position: { x: number; y: number }; zoom: number }) => void;
  onSpaceDrop?: (space: SpaceInstance) => void;
  onSpaceMove?: (instanceId: string, x: number, y: number, z: number) => void;
  onSpaceTransform?: (instanceId: string, position: { x: number; y: number; z: number }, rotation: number, scale: { x: number; y: number; z: number }) => void;
  onSpaceDelete?: (instanceId: string) => void;
  snapInterval?: number;
  labelMode?: 'text' | 'icon';
  cameraAngle?: 45 | 90;
  draggedSpace?: any;
}

export function Canvas3D({
  placedSpaces = [],
  onSpaceDrop,
  onSpaceMove,
  onSpaceTransform,
  onSpaceDelete,
  snapInterval = 5,
  labelMode = 'text',
  cameraAngle = 90,
  draggedSpace
}: Canvas3DProps) {
  const { componentThemes } = useTheme();
  componentThemes.canvasControls.light;
  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);
  const [isDraggingSpace, setIsDraggingSpace] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const controlsRef = useRef<any>(null);

  // Calculate camera position based on angle
  const getCameraPosition = (angle: 45 | 90): [number, number, number] => {
    if (angle === 90) {
      return [0, 200, 0.001]; // Top-down
    } else {
      // 45 degree with 30 degree rotation around Y-axis
      const distance = 150;
      const height = 150;
      const yRotation = (30 * Math.PI) / 180; // 30 degrees in radians
      return [
        Math.sin(yRotation) * distance,
        height,
        Math.cos(yRotation) * distance
      ];
    }
  };

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

        // Set dragging state
        if (!isDraggingFromPalette && draggedSpace) {
          setIsDraggingFromPalette(true);
        }
      }}
      onDragLeave={() => {
        setIsDraggingFromPalette(false);
      }}
    >
      {/* Top-right controls */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 z-10">
        <div className="text-xs font-medium text-gray-700 mb-2">Canvas Controls</div>
        <div className="space-y-2 text-xs text-gray-600">
          <div>Left-click: Pan</div>
          <div>Right-click: Show controls</div>
          <div>Scroll: Zoom</div>
        </div>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        key={cameraAngle} // Re-mount canvas when angle changes for instant switch
        orthographic={cameraAngle === 90} // Use orthographic for top-down, perspective for isometric
        camera={
          cameraAngle === 90
            ? {
                position: getCameraPosition(cameraAngle),
                zoom: 2, // Adjust zoom level for orthographic
              }
            : {
                position: getCameraPosition(cameraAngle),
                fov: 50,
              }
        }
      >
        {/* Drag preview position tracker */}
        {isDraggingFromPalette && draggedSpace && (
          <DragPreviewHandler
            onPositionUpdate={setPreviewPosition}
            snapInterval={snapInterval}
          />
        )}

        {/* Lighting */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[50, 100, 50]} intensity={1.5} castShadow />
        <directionalLight position={[-50, 50, -50]} intensity={0.8} />
        <hemisphereLight args={['#ffffff', '#666666', 0.6]} />

        {/* Custom dashed grid */}
        <group position={[0, 0, 0]}>
          {/* Create dashed grid lines */}
          {Array.from({ length: 201 }, (_, i) => i - 100).map((i) => {
            const pos = i * 5;
            const isMajor = i % 6 === 0; // Every 6th line (30 feet)
            return (
              <group key={`grid-${i}`}>
                {/* Vertical line */}
                <line>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      count={2}
                      array={new Float32Array([pos, 0, -500, pos, 0, 500])}
                      itemSize={3}
                    />
                  </bufferGeometry>
                  <lineDashedMaterial
                    color={isMajor ? "#9CA3AF" : "#E5E7EB"}
                    linewidth={isMajor ? 4.5 : 1.5}
                    dashSize={isMajor ? 10 : 5}
                    gapSize={isMajor ? 5 : 5}
                  />
                </line>
                {/* Horizontal line */}
                <line>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      count={2}
                      array={new Float32Array([-500, 0, pos, 500, 0, pos])}
                      itemSize={3}
                    />
                  </bufferGeometry>
                  <lineDashedMaterial
                    color={isMajor ? "#9CA3AF" : "#E5E7EB"}
                    linewidth={isMajor ? 4.5 : 1.5}
                    dashSize={isMajor ? 10 : 5}
                    gapSize={isMajor ? 5 : 5}
                  />
                </line>
              </group>
            );
          })}
        </group>

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
            labelMode={labelMode}
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
            onDelete={() => {
              if (onSpaceDelete) {
                onSpaceDelete(space.instanceId);
              }
            }}
          />
        ))}

        {/* Drag Preview - show while dragging from palette */}
        {isDraggingFromPalette && draggedSpace && (
          <SpaceBlock3D
            key="drag-preview"
            space={{
              ...draggedSpace,
              instanceId: 'preview',
              templateId: draggedSpace.id,
              position: previewPosition,
              rotation: 0,
            }}
            snapInterval={snapInterval}
            labelMode={labelMode}
          />
        )}

        {/* Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={false} // Completely disable rotation
          enablePan={!isDraggingSpace} // Disable pan when dragging a space
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.15}
          panSpeed={1.5}
          minDistance={100}
          maxDistance={500}
          target={[0, 0, 0]} // Always look at origin
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
          }}
        />
      </Canvas>
    </div>
  );
}
