import { Html } from '@react-three/drei';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface MeasurementProps {
  id: string;
  point1: { x: number; z: number };
  point2: { x: number; z: number };
  isPreview?: boolean;
  onDelete?: (id: string) => void;
}

export function Measurement({ id, point1, point2, isPreview = false, onDelete }: MeasurementProps) {
  const [showDelete, setShowDelete] = useState(false);

  const dx = point2.x - point1.x;
  const dz = point2.z - point1.z;
  const distance = Math.sqrt(dx * dx + dz * dz);

  const handleRightClick = (e: React.MouseEvent) => {
    if (!isPreview && onDelete) {
      e.stopPropagation();
      e.preventDefault();
      setShowDelete(!showDelete);
    }
  };

  return (
    <>
      {/* First point marker */}
      <mesh position={[point1.x, 0.5, point1.z]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={isPreview ? "#60A5FA" : "#3B82F6"}
          transparent={isPreview}
          opacity={isPreview ? 0.7 : 1}
        />
      </mesh>

      {/* Second point marker */}
      <mesh position={[point2.x, 0.5, point2.z]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={isPreview ? "#60A5FA" : "#3B82F6"}
          transparent={isPreview}
          opacity={isPreview ? 0.7 : 1}
        />
      </mesh>

      {/* Line between points */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              point1.x, 0.5, point1.z,
              point2.x, 0.5, point2.z
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={isPreview ? "#60A5FA" : "#3B82F6"}
          linewidth={isPreview ? 4 : 6}
          transparent={isPreview}
          opacity={isPreview ? 0.7 : 1}
        />
      </line>

      {/* Distance label */}
      <Html
        position={[
          (point1.x + point2.x) / 2,
          2,
          (point1.z + point2.z) / 2
        ]}
        center
        sprite
        zIndexRange={[50, 50]}
        style={{ pointerEvents: isPreview ? 'none' : 'auto' }}
      >
        <div
          className={`${isPreview ? 'bg-blue-400' : 'bg-blue-500'} text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg select-none ${isPreview ? 'pointer-events-none' : 'cursor-context-menu'}`}
          onContextMenu={handleRightClick}
        >
          {distance.toFixed(1)}'
        </div>
      </Html>

      {/* Delete button (appears on right-click) */}
      {showDelete && !isPreview && onDelete && (
        <Html
          position={[
            (point1.x + point2.x) / 2,
            4,
            (point1.z + point2.z) / 2
          ]}
          center
          sprite
          zIndexRange={[100, 100]}
          style={{ pointerEvents: 'auto' }}
        >
          <button
            onClick={() => {
              onDelete(id);
              setShowDelete(false);
            }}
            className="bg-gray-400 hover:bg-red-500 text-white p-2 rounded-full shadow-lg transition-colors"
            title="Delete Measurement"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Html>
      )}
    </>
  );
}
