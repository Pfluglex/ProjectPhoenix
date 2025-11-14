import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Text } from 'react-konva';
import Konva from 'konva';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useTheme } from '../System/ThemeManager';

interface Canvas2DProps {
  width?: number;
  height?: number;
  onCanvasStateChange?: (state: { position: { x: number; y: number }; zoom: number }) => void;
}

export function Canvas2D({ width = 1200, height = 800, onCanvasStateChange }: Canvas2DProps) {
  const { componentThemes } = useTheme();
  const theme = componentThemes.canvasControls.light;
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState({ width, height });
  const [stageScale, setStageScale] = useState(1.5); // Default zoom 150%
  const [stagePos, setStagePos] = useState({ x: width / 2, y: height / 2 });

  // Grid settings
  const GRID_MINOR = 5; // 5-foot grid
  const GRID_MAJOR = 30; // 30-foot grid
  const GRID_EXTENT = 250; // Grid from -250 to 250 feet

  // Update stage size on window resize
  useEffect(() => {
    const handleResize = () => {
      const container = stageRef.current?.container();
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Notify parent of canvas state changes
  useEffect(() => {
    if (onCanvasStateChange) {
      onCanvasStateChange({
        position: {
          x: -stagePos.x + stageSize.width / 2,
          y: -stagePos.y + stageSize.height / 2,
        },
        zoom: stageScale,
      });
    }
  }, [stagePos, stageScale, stageSize, onCanvasStateChange]);

  // Zoom functions
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // Calculate new scale
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.05;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limit zoom
    if (newScale < 0.1 || newScale > 10) return;

    setStageScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setStagePos(newPos);
  };

  const zoomIn = () => {
    const newScale = Math.min(stageScale * 1.2, 10);
    setStageScale(newScale);
  };

  const zoomOut = () => {
    const newScale = Math.max(stageScale / 1.2, 0.1);
    setStageScale(newScale);
  };

  const resetView = () => {
    setStageScale(1.5);
    setStagePos({ x: stageSize.width / 2, y: stageSize.height / 2 });
  };

  // Generate grid lines
  const generateGridLines = () => {
    const lines: JSX.Element[] = [];
    let key = 0;

    // Vertical lines
    for (let x = -GRID_EXTENT; x <= GRID_EXTENT; x += GRID_MINOR) {
      const isMajor = x % GRID_MAJOR === 0;
      lines.push(
        <Line
          key={`v-${key++}`}
          points={[x, -GRID_EXTENT, x, GRID_EXTENT]}
          stroke={isMajor ? '#9CA3AF' : '#D1D5DB'}
          strokeWidth={isMajor ? 2 / stageScale : 1 / stageScale}
          dash={isMajor ? [10 / stageScale, 5 / stageScale] : [5 / stageScale, 5 / stageScale]}
          opacity={isMajor ? 0.6 : 0.5}
          listening={false}
        />
      );
    }

    // Horizontal lines
    for (let y = -GRID_EXTENT; y <= GRID_EXTENT; y += GRID_MINOR) {
      const isMajor = y % GRID_MAJOR === 0;
      lines.push(
        <Line
          key={`h-${key++}`}
          points={[-GRID_EXTENT, y, GRID_EXTENT, y]}
          stroke={isMajor ? '#9CA3AF' : '#D1D5DB'}
          strokeWidth={isMajor ? 2 / stageScale : 1 / stageScale}
          dash={isMajor ? [10 / stageScale, 5 / stageScale] : [5 / stageScale, 5 / stageScale]}
          opacity={isMajor ? 0.6 : 0.5}
          listening={false}
        />
      );
    }

    return lines;
  };

  // Generate axis labels
  const generateAxisLabels = () => {
    const labels: JSX.Element[] = [];
    const step = 100;
    let key = 0;

    // X-axis labels
    for (let x = -GRID_EXTENT; x <= GRID_EXTENT; x += step) {
      if (x !== 0) {
        labels.push(
          <Text
            key={`x-label-${key++}`}
            x={x}
            y={15 / stageScale}
            text={`${x}'`}
            fontSize={12 / stageScale}
            fill="#9CA3AF"
            align="center"
            offsetX={0}
            listening={false}
          />
        );
      }
    }

    // Y-axis labels
    for (let y = -GRID_EXTENT; y <= GRID_EXTENT; y += step) {
      if (y !== 0) {
        labels.push(
          <Text
            key={`y-label-${key++}`}
            x={-15 / stageScale}
            y={y}
            text={`${y}'`}
            fontSize={12 / stageScale}
            fill="#9CA3AF"
            align="right"
            offsetX={0}
            offsetY={6 / stageScale}
            listening={false}
          />
        );
      }
    }

    return labels;
  };

  return (
    <div className="relative w-full h-full bg-white">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className={`p-2 ${theme.button.bg} ${theme.button.backdropBlur} rounded-lg ${theme.button.shadow} border ${theme.button.border} ${theme.button.hover} transition-colors`}
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={zoomOut}
          className={`p-2 ${theme.button.bg} ${theme.button.backdropBlur} rounded-lg ${theme.button.shadow} border ${theme.button.border} ${theme.button.hover} transition-colors`}
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={resetView}
          className={`p-2 ${theme.button.bg} ${theme.button.backdropBlur} rounded-lg ${theme.button.shadow} border ${theme.button.border} ${theme.button.hover} transition-colors`}
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Konva Stage */}
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        draggable
        onWheel={handleWheel}
        onDragEnd={(e) => {
          setStagePos({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
      >
        <Layer>
          {/* Grid */}
          {generateGridLines()}

          {/* Origin Crosshair */}
          <Line
            points={[-50, 0, 50, 0]}
            stroke="#EF4444"
            strokeWidth={2 / stageScale}
            listening={false}
          />
          <Line
            points={[0, -50, 0, 50]}
            stroke="#EF4444"
            strokeWidth={2 / stageScale}
            listening={false}
          />

          {/* Origin Dot */}
          <Circle
            x={0}
            y={0}
            radius={8 / stageScale}
            fill="#EF4444"
            listening={false}
          />
          <Circle
            x={0}
            y={0}
            radius={4 / stageScale}
            fill="white"
            listening={false}
          />

          {/* Origin Label */}
          <Text
            x={15 / stageScale}
            y={-15 / stageScale}
            text="(0,0)"
            fontSize={14 / stageScale}
            fontStyle="bold"
            fill="#EF4444"
            listening={false}
          />

          {/* Axis Labels */}
          {generateAxisLabels()}
        </Layer>
      </Stage>
    </div>
  );
}
