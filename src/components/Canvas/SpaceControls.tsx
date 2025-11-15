import { RotateCw, Trash2, Maximize2, Move } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpaceControlsProps {
  onRotate: () => void;
  onDelete: () => void;
  onResize: () => void;
  onMove: () => void;
  isSelected?: boolean;
  isClosing?: boolean;
}

export function SpaceControls({ onRotate, onDelete, onResize, onMove, isSelected = false, isClosing = false }: SpaceControlsProps) {
  const radius = 40; // Distance from center
  const buttonSize = 36; // Size of each button

  // Calculate positions for 4 buttons in a circle (cardinal directions)
  const positions = [
    { angle: -90, handler: onRotate, icon: RotateCw, color: 'blue', title: 'Rotate 90°' },    // Top
    { angle: 0, handler: onMove, icon: Move, color: isSelected ? 'blue' : 'purple', title: isSelected ? 'Remove from Group (Shift+Click to add more)' : 'Add to Group Move (Shift+Click for more)' },  // Right
    { angle: 90, handler: onResize, icon: Maximize2, color: 'green', title: 'Resize' },       // Bottom
    { angle: 180, handler: onDelete, icon: Trash2, color: 'red', title: 'Delete' },           // Left
  ];

  return (
    <div className="relative" style={{ width: radius * 2.5, height: radius * 2.5 }}>
      {positions.map(({ angle, handler, icon: Icon, color, title }, index) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;

        // Get color classes based on color prop
        const getColorClasses = (color: string) => {
          switch (color) {
            case 'blue':
              return { bg: 'hover:bg-blue-100', text: 'group-hover:text-blue-600' };
            case 'purple':
              return { bg: 'hover:bg-purple-100', text: 'group-hover:text-purple-600' };
            case 'green':
              return { bg: 'hover:bg-green-100', text: 'group-hover:text-green-600' };
            case 'red':
              return { bg: 'hover:bg-red-100', text: 'group-hover:text-red-600' };
            default:
              return { bg: 'hover:bg-gray-100', text: 'group-hover:text-gray-600' };
          }
        };

        const colorClasses = getColorClasses(color);

        return (
          <motion.button
            key={index}
            onClick={handler}
            className={`absolute bg-white/90 backdrop-blur-sm ${colorClasses.bg} rounded-full shadow-lg border border-gray-200 group`}
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
            <Icon className={`w-4 h-4 text-gray-700 ${colorClasses.text} m-auto`} />
          </motion.button>
        );
      })}
    </div>
  );
}
