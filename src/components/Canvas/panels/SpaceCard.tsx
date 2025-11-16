import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useTheme, getSpaceColor } from '../../System/ThemeManager';
import type { SpaceDefinition } from '../../../types';

interface SpaceCardProps {
  space: SpaceDefinition;
  index?: number;
  onDragStart?: (space: SpaceDefinition) => void;
  onDragEnd?: () => void;
  onEdit?: (space: SpaceDefinition, e: React.MouseEvent) => void;
  onDelete?: (space: SpaceDefinition, e: React.MouseEvent) => void;
}

export function SpaceCard({
  space,
  index = 0,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
}: SpaceCardProps) {
  const { componentThemes } = useTheme();
  const theme = componentThemes.canvasPalette.light;

  const IconComponent = (LucideIcons as any)[space.icon || 'Square'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`p-1.5 ${theme.spaceItem.hover} rounded cursor-grab active:cursor-grabbing transition-colors border ${theme.spaceItem.border} ${theme.spaceItem.hoverBorder} bg-white select-none relative group`}
      draggable="true"
      onDragStart={(e: any) => {
        console.log('🎯 [LIBRARY] Dragging space:', space.name);
        e.dataTransfer.setData('application/json', JSON.stringify(space));
        e.dataTransfer.effectAllowed = 'copy';
        onDragStart?.(space);
      }}
      onDragEnd={() => {
        onDragEnd?.();
      }}
    >
      <div className="flex items-center gap-2 pointer-events-none">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: getSpaceColor(space.type) }}
        >
          {IconComponent && <IconComponent className="w-3.5 h-3.5 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate">
            {space.name}
          </p>
          <p className="text-[10px] text-gray-500">
            {space.width}' × {space.depth}' × {space.height}'
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pointer-events-auto flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => onEdit(space, e)}
              className="p-1 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit space"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => onDelete(space, e)}
              className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete space"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}