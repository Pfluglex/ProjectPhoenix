import { useState } from 'react';
import { Canvas2D } from '../Canvas/Canvas2D';
import { Canvas3D } from '../Canvas/Canvas3D';
import { SpacePalette } from '../Canvas/SpacePalette';
import type { SpaceInstance } from '../../types';

interface CanvasViewProps {
  isSidebarExpanded: boolean;
}

export function CanvasView({ isSidebarExpanded }: CanvasViewProps) {
  const [canvasState, setCanvasState] = useState({
    position: { x: 0, y: 0 },
    zoom: 1.5,
  });
  const [placedSpaces, setPlacedSpaces] = useState<SpaceInstance[]>([]);
  const [snapInterval, setSnapInterval] = useState(5);
  const [labelMode, setLabelMode] = useState<'text' | 'icon'>('text');

  const handleSpaceDrop = (space: SpaceInstance) => {
    setPlacedSpaces((prev) => [...prev, space]);
  };

  const handleSpaceMove = (instanceId: string, x: number, y: number, z: number = 0) => {
    setPlacedSpaces((prev) =>
      prev.map((space) =>
        space.instanceId === instanceId
          ? { ...space, position: { x, y, z } }
          : space
      )
    );
  };

  const handleSpaceTransform = (
    instanceId: string,
    position: { x: number; y: number; z: number },
    rotation: number,
    scale: { x: number; y: number; z: number }
  ) => {
    setPlacedSpaces((prev) =>
      prev.map((space) =>
        space.instanceId === instanceId
          ? {
              ...space,
              position,
              rotation,
              width: space.width * scale.x,
              depth: space.depth * scale.z,
              height: space.height * scale.y,
            }
          : space
      )
    );
  };

  const handleSpaceDelete = (instanceId: string) => {
    setPlacedSpaces((prev) => prev.filter((space) => space.instanceId !== instanceId));
  };

  return (
    <div className="w-full h-full relative">
      <Canvas3D
        onCanvasStateChange={setCanvasState}
        placedSpaces={placedSpaces}
        onSpaceDrop={handleSpaceDrop}
        onSpaceMove={handleSpaceMove}
        onSpaceTransform={handleSpaceTransform}
        onSpaceDelete={handleSpaceDelete}
        snapInterval={snapInterval}
        labelMode={labelMode}
      />
      <SpacePalette
        isSidebarExpanded={isSidebarExpanded}
        canvasInfo={canvasState}
        snapInterval={snapInterval}
        onSnapIntervalChange={setSnapInterval}
        labelMode={labelMode}
        onLabelModeChange={setLabelMode}
      />
    </div>
  );
}
