import { RotateCw, Trash2, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpaceControlsProps {
  onRotate: () => void;
  onDelete: () => void;
  onResize: () => void;
  isClosing?: boolean;
}

export function SpaceControls({ onRotate, onDelete, onResize, isClosing = false }: SpaceControlsProps) {
  const radius = 40; // Distance from center
  const buttonSize = 36; // Size of each button

  // Calculate positions for 3 buttons in a circle
  const positions = [
    { angle: -90, handler: onRotate, icon: RotateCw, color: 'blue', title: 'Rotate 90°' },  // Top
    { angle: 30, handler: onResize, icon: Maximize2, color: 'green', title: 'Resize' },     // Bottom right
    { angle: 150, handler: onDelete, icon: Trash2, color: 'red', title: 'Delete' },         // Bottom left
  ];

  return (
    <div className="relative" style={{ width: radius * 2.5, height: radius * 2.5 }}>
      {positions.map(({ angle, handler, icon: Icon, color, title }, index) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;

        return (
          <motion.button
            key={index}
            onClick={handler}
            className={`absolute bg-white/90 backdrop-blur-sm hover:bg-${color}-100 rounded-full shadow-lg border border-gray-200 group`}
            style={{
              width: buttonSize,
              height: buttonSize,
              left: `calc(50% - ${buttonSize / 2}px)`,
              top: `calc(50% - ${buttonSize / 2}px)`,
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={isClosing ? {
              x: 0,
              y: 0,
              scale: 0,
              opacity: 0,
              rotate: -360
            } : {
              x: x,
              y: y,
              scale: 1,
              opacity: 1,
              rotate: 360
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: isClosing ? (2 - index) * 0.05 : index * 0.05
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            title={title}
          >
            <Icon className={`w-4 h-4 text-gray-700 group-hover:text-${color}-600 m-auto`} />
          </motion.button>
        );
      })}
    </div>
  );
}
