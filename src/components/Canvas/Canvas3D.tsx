import { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../System/ThemeManager';
import type { SpaceInstance } from '../../types';
import { SpaceBlock3D } from './SpaceBlock3D';
import { Measurement } from './Measurement';

// Component to handle raycasting for drag preview
function DragPreviewHandler({
  onPositionUpdate,
  snapInterval,
  gridY
}: {
  onPositionUpdate: (pos: { x: number; y: number; z: number }) => void;
  snapInterval: number;
  gridY: number;
}) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -gridY));

  console.log('🔧 [DRAG PREVIEW HANDLER] Component mounted | gridY:', gridY);

  useEffect(() => {
    console.log('🔧 [DRAG PREVIEW HANDLER] Effect running | gridY:', gridY);

    // Update plane when gridY changes
    groundPlane.current.constant = -gridY;

    const handleDragOver = (event: DragEvent) => {
      console.log('📍 [DRAG PREVIEW] DragOver event fired | clientX:', event.clientX, '| clientY:', event.clientY);

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

        const newPos = { x: snappedX, y: gridY, z: snappedZ };
        console.log('📍 [DRAG PREVIEW] Preview position updated | Y:', gridY, '| Full pos:', newPos);
        onPositionUpdate(newPos);
      }
    };

    // Use dragover event instead of mousemove since we're in a drag operation
    window.addEventListener('dragover', handleDragOver as any);
    return () => window.removeEventListener('dragover', handleDragOver as any);
  }, [camera, gl, snapInterval, gridY, onPositionUpdate]);

  return null;
}

// Component to handle raycasting for measure preview
function MeasurePreviewHandler({
  onPositionUpdate,
  snapInterval,
  enabled,
  gridY
}: {
  onPositionUpdate: (pos: { x: number; z: number } | null) => void;
  snapInterval: number;
  enabled: boolean;
  gridY: number;
}) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -gridY));

  useEffect(() => {
    if (!enabled) {
      onPositionUpdate(null);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(new THREE.Vector2(x, y), camera);

      const intersection = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(groundPlane.current, intersection);

      if (intersection) {
        const snappedX = Math.round(intersection.x / snapInterval) * snapInterval;
        const snappedZ = Math.round(intersection.z / snapInterval) * snapInterval;
        onPositionUpdate({ x: snappedX, z: snappedZ });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera, gl, snapInterval, gridY, enabled, onPositionUpdate]);

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
  currentLevel?: number;
  labelMode?: 'text' | 'icon';
  cameraAngle?: 45 | 90;
  draggedSpace?: any;
  selectedSpaceIds?: Set<string>;
  onToggleSelection?: (instanceId: string) => void;
  measureMode?: boolean;
  measurePoints?: Array<{ x: number; z: number }>;
  measurements?: Array<{ id: string; point1: { x: number; z: number }; point2: { x: number; z: number } }>;
  onMeasureClick?: (x: number, z: number) => void;
  onDeleteMeasurement?: (id: string) => void;
  presentationMode?: boolean;
  timeOfDay?: number; // 0-24 hours
  monthOfYear?: number; // 1-12 months
}

// Calculate sun position using proper solar position algorithm
// Based on NOAA solar calculator methodology
function calculateSunPosition(timeOfDay: number, monthOfYear: number, latitude: number = 32) {
  // Convert latitude to radians
  const latRad = latitude * (Math.PI / 180);

  // Approximate day of year (simplified - assumes 15th of each month)
  const dayOfYear = (monthOfYear - 1) * 30.5 + 15;

  // Calculate solar declination (sun's angle relative to equator)
  // δ = -23.45° × cos[360/365 × (d + 10)]
  const declinationDeg = -23.45 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));
  const declinationRad = declinationDeg * (Math.PI / 180);

  // Calculate hour angle (sun's position relative to solar noon)
  // Solar noon is at 12:00, each hour = 15°
  const hourAngleDeg = (timeOfDay - 12) * 15;
  const hourAngleRad = hourAngleDeg * (Math.PI / 180);

  // Calculate solar elevation (altitude) angle
  // elevation = arcsin[sin(lat) × sin(decl) + cos(lat) × cos(decl) × cos(hour_angle)]
  const elevationRad = Math.asin(
    Math.sin(latRad) * Math.sin(declinationRad) +
    Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad)
  );
  const elevationDeg = elevationRad * (180 / Math.PI);

  // Calculate solar azimuth angle (measured clockwise from north)
  // azimuth = arcsin[-cos(decl) × sin(hour_angle) / cos(elevation)]
  let azimuthRad = Math.asin(
    -Math.cos(declinationRad) * Math.sin(hourAngleRad) / Math.cos(elevationRad)
  );

  // Quadrant correction for azimuth
  const sinDec = Math.sin(declinationRad);
  const sinElev = Math.sin(elevationRad);
  const sinLat = Math.sin(latRad);

  if (sinDec - sinElev * sinLat >= 0) {
    if (Math.sin(azimuthRad) < 0) {
      azimuthRad += 2 * Math.PI;
    }
  } else {
    azimuthRad = Math.PI - azimuthRad;
  }

  const azimuthDeg = azimuthRad * (180 / Math.PI);

  // Convert to 3D position (spherical to Cartesian)
  const distance = 200;

  // Azimuth: 0° = North, 90° = East, 180° = South, 270° = West
  // In our coordinate system: +Z = North, +X = East
  const azimuthFor3D = (90 - azimuthDeg) * (Math.PI / 180); // Convert to standard math angle

  const x = distance * Math.cos(elevationRad) * Math.cos(azimuthFor3D);
  const y = distance * Math.sin(elevationRad);
  const z = distance * Math.cos(elevationRad) * Math.sin(azimuthFor3D);

  // Calculate intensity based on elevation (0 at horizon, max at zenith)
  const intensity = Math.max(0.1, Math.sin(elevationRad) * 1.5);

  return {
    position: [x, y, z] as [number, number, number],
    intensity,
    elevation: elevationDeg,
    azimuth: azimuthDeg
  };
}

export function Canvas3D({
  placedSpaces = [],
  onSpaceDrop,
  onSpaceMove,
  onSpaceTransform,
  onSpaceDelete,
  snapInterval = 5,
  currentLevel = 1,
  labelMode = 'text',
  cameraAngle = 90,
  draggedSpace,
  selectedSpaceIds = new Set(),
  onToggleSelection,
  measureMode = false,
  measurePoints = [],
  measurements = [],
  onMeasureClick,
  onDeleteMeasurement,
  presentationMode = false,
  timeOfDay = 12,
  monthOfYear = 6
}: Canvas3DProps) {
  const { componentThemes } = useTheme();
  componentThemes.canvasControls.light;
  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);
  const [isDraggingSpace, setIsDraggingSpace] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const [measurePreviewPosition, setMeasurePreviewPosition] = useState<{ x: number; z: number } | null>(null);
  const controlsRef = useRef<any>(null);

  // Calculate current level Y position (each level is 15 feet)
  const gridY = (currentLevel - 1) * 15;

  // Calculate sun position based on time and season
  const sunPosition = calculateSunPosition(timeOfDay, monthOfYear);

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

    console.log('🎯 [CANVAS3D handleDrop] currentLevel:', currentLevel, '| Calculated gridY:', gridY, '| Formula: (currentLevel - 1) * 15 = (' + currentLevel + ' - 1) * 15 = ' + gridY);

    // Use the preview position that was calculated by raycasting
    // IMPORTANT: Force Y to gridY since DragPreviewHandler may not update it properly
    const finalPosition = {
      x: previewPosition.x,
      y: gridY, // Force Y to be the correct level height
      z: previewPosition.z
    };

    const newSpace: SpaceInstance = {
      ...spaceTemplate,
      instanceId: `${spaceTemplate.id}-${Date.now()}`,
      templateId: spaceTemplate.id,
      position: finalPosition,
      rotation: 0,
      level: currentLevel, // Assign to current building level
    };

    console.log('🎨 [CANVAS3D] Dropping new space:', spaceTemplate.name, '| Preview pos:', previewPosition, '| Final pos:', finalPosition, '| Level:', currentLevel, '| gridY:', gridY);
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
          console.log('🟢 [CANVAS3D] onDragOver - Setting isDraggingFromPalette to TRUE | draggedSpace:', draggedSpace?.name);
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
        shadows // Enable shadow rendering
        gl={{
          antialias: true,
          alpha: true,
        }}
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
            gridY={gridY}
          />
        )}

        {/* Measure preview position tracker */}
        {measureMode && measurePoints.length === 1 && (
          <MeasurePreviewHandler
            onPositionUpdate={setMeasurePreviewPosition}
            snapInterval={snapInterval}
            gridY={gridY}
            enabled={true}
          />
        )}

        {/* Lighting */}
        {presentationMode ? (
          // Presentation mode: Dynamic sun with realistic shadows
          <>
            <ambientLight intensity={0.4} />
            {/* Main sun light - controlled by time of day and season */}
            <directionalLight
              position={sunPosition.position}
              intensity={sunPosition.intensity}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={500}
              shadow-camera-left={-200}
              shadow-camera-right={200}
              shadow-camera-top={200}
              shadow-camera-bottom={-200}
              shadow-bias={-0.0001}
            />
            {/* Fill light - softer, opposite side */}
            <directionalLight position={[-sunPosition.position[0] * 0.3, sunPosition.position[1] * 0.5, -sunPosition.position[2] * 0.3]} intensity={0.3} />
            <hemisphereLight args={['#87CEEB', '#68574D', 0.5]} />
          </>
        ) : (
          // Normal mode: Soft global illumination with subtle directional light
          <>
            <ambientLight intensity={0.8} />
            <directionalLight position={[50, 80, 50]} intensity={0.6} />
            <directionalLight position={[-30, 40, -30]} intensity={0.3} />
            <hemisphereLight args={['#ffffff', '#999999', 0.6]} />
          </>
        )}

        {/* Grid or Ground Plane based on presentation mode */}
        {presentationMode ? (
          /* White ground plane for presentation mode */
          <mesh position={[0, gridY - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.9}
              metalness={0}
            />
          </mesh>
        ) : (
          <>
            {/* Custom dashed grid */}
            <group position={[0, gridY, 0]}>
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
            <mesh position={[0, gridY + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[2, 32]} />
              <meshBasicMaterial color="#EF4444" />
            </mesh>
          </>
        )}

        {/* Invisible ground plane for drag events and measurements */}
        <mesh
          position={[0, gridY, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            if (measureMode && onMeasureClick) {
              e.stopPropagation();
              // Snap to grid
              const snappedX = Math.round(e.point.x / snapInterval) * snapInterval;
              const snappedZ = Math.round(e.point.z / snapInterval) * snapInterval;
              onMeasureClick(snappedX, snappedZ);
            }
          }}
        >
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial />
        </mesh>

        {/* Persistent measurements */}
        {measurements.map((measurement) => (
          <Measurement
            key={measurement.id}
            id={measurement.id}
            point1={measurement.point1}
            point2={measurement.point2}
            gridY={gridY}
            onDelete={onDeleteMeasurement}
          />
        ))}

        {/* Current measurement in progress */}
        {measureMode && measurePoints.length > 0 && (
          <>
            {/* First point marker */}
            <mesh position={[measurePoints[0].x, gridY + 0.5, measurePoints[0].z]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color="#3B82F6" />
            </mesh>

            {/* Live preview (after first point, before second click) */}
            {measurePoints.length === 1 && measurePreviewPosition && (
              <Measurement
                id="preview"
                point1={measurePoints[0]}
                point2={measurePreviewPosition}
                gridY={gridY}
                isPreview={true}
              />
            )}
          </>
        )}

        {/* Placed Spaces */}
        {placedSpaces.map((space) => (
          <SpaceBlock3D
            key={space.instanceId}
            space={space}
            snapInterval={snapInterval}
            currentLevel={currentLevel}
            labelMode={labelMode}
            isSelected={selectedSpaceIds.has(space.instanceId)}
            presentationMode={presentationMode}
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
            onToggleSelection={() => {
              if (onToggleSelection) {
                onToggleSelection(space.instanceId);
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
              level: currentLevel, // Preview is always on current level
            }}
            snapInterval={snapInterval}
            currentLevel={currentLevel}
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
