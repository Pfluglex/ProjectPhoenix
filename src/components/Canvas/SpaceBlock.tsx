import { Group, Rect } from 'react-konva';
import { SpaceTag } from './SpaceTag';
import type { SpaceInstance } from '../../types';
import { getSpaceColor } from '../System/ThemeManager';

interface SpaceBlockProps {
  space: SpaceInstance;
  scale: number;
  snapInterval: number;
  onDragStart: () => void;
  onDragEnd: (x: number, y: number) => void;
}

export function SpaceBlock({ space, scale, snapInterval, onDragStart, onDragEnd }: SpaceBlockProps) {
  const snapToGrid = (value: number) => {
    return Math.round(value / snapInterval) * snapInterval;
  };

  const cornerRadius = 20 / scale;

  return (
    <Group>
      {/* Simple rounded rectangle */}
      <Rect
        x={space.position.x}
        y={space.position.y}
        width={space.width}
        height={space.depth}
        fill={getSpaceColor(space.type)}
        opacity={0.85}
        cornerRadius={cornerRadius}
        draggable
        onDragStart={onDragStart}
        onDragEnd={(e) => {
          const snappedX = snapToGrid(e.target.x());
          const snappedY = snapToGrid(e.target.y());
          e.target.x(snappedX);
          e.target.y(snappedY);
          onDragEnd(snappedX, snappedY);
        }}
      />

      {/* Space Tag */}
      <SpaceTag
        x={space.position.x}
        y={space.position.y}
        width={space.width}
        depth={space.depth}
        name={space.name}
        scale={scale}
      />
    </Group>
  );
}
