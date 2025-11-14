import { useState } from 'react';
import { Canvas2D } from '../Canvas/Canvas2D';
import { SpacePalette } from '../Canvas/SpacePalette';

interface CanvasViewProps {
  isSidebarExpanded: boolean;
}

export function CanvasView({ isSidebarExpanded }: CanvasViewProps) {
  const [canvasState, setCanvasState] = useState({
    position: { x: 0, y: 0 },
    zoom: 1.5,
  });

  return (
    <div className="w-full h-full relative">
      <Canvas2D onCanvasStateChange={setCanvasState} />
      <SpacePalette isSidebarExpanded={isSidebarExpanded} canvasInfo={canvasState} />
    </div>
  );
}
