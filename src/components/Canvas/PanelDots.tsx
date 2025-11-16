import { motion } from 'framer-motion';
import { Library, Wrench, ScrollText, Settings } from 'lucide-react';
import { useState } from 'react';

export type PanelType = 'library' | 'tools' | 'properties' | 'settings';

interface PanelDotsProps {
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

const DOT_COLORS = {
  library: '#3B82F6',   // Blue
  tools: '#F59E0B',     // Amber/Yellow
  properties: '#10B981', // Green
  settings: '#6B7280'   // Gray
};

const PANEL_ICONS = {
  library: Library,
  tools: Wrench,
  properties: ScrollText,
  settings: Settings
};

export function PanelDots({ activePanel, onPanelChange }: PanelDotsProps) {
  const panels: PanelType[] = ['library', 'tools', 'properties', 'settings'];
  const [hoveredPanel, setHoveredPanel] = useState<PanelType | null>(null);

  return (
    <div className="flex items-center gap-2.5 h-6">
      {panels.map((panel) => {
        const isActive = activePanel === panel;
        const isHovered = hoveredPanel === panel;
        const Icon = PANEL_ICONS[panel];

        return (
          <motion.button
            key={panel}
            onClick={() => onPanelChange(panel)}
            onMouseEnter={() => setHoveredPanel(panel)}
            onMouseLeave={() => setHoveredPanel(null)}
            className="rounded-full transition-all relative group flex items-center justify-center"
            style={{
              width: isHovered ? '24px' : '15px',
              height: isHovered ? '24px' : '15px',
              backgroundColor: DOT_COLORS[panel],
              opacity: isActive ? 1 : 0.4,
            }}
            whileHover={{
              scale: 1.1,
              opacity: 1,
            }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Icon on hover */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.15 }}
              >
                <Icon className="w-3 h-3 text-white" strokeWidth={2.5} />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
