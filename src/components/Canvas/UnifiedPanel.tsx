import { motion } from 'framer-motion';
import { PanelLeftOpen } from 'lucide-react';
import { useTheme } from '../System/ThemeManager';
import { PanelDots, type PanelType } from './PanelDots';

interface UnifiedPanelProps {
  isSidebarExpanded: boolean;
  onSidebarExpandedChange?: (expanded: boolean) => void;
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
  children: React.ReactNode;
}

// Panel configurations
const PANEL_CONFIG = {
  library: {
    title: 'Library',
    borderColor: 'rgba(59, 130, 246, 0.2)', // Blue
    bgColor: 'rgba(59, 130, 246, 0.05)',
  },
  tools: {
    title: 'Tools',
    borderColor: 'rgba(245, 158, 11, 0.2)', // Amber
    bgColor: 'rgba(245, 158, 11, 0.05)',
  },
  properties: {
    title: 'Properties',
    borderColor: 'rgba(16, 185, 129, 0.2)', // Green
    bgColor: 'rgba(16, 185, 129, 0.05)',
  },
  settings: {
    title: 'Settings',
    borderColor: 'rgba(107, 114, 128, 0.2)', // Gray
    bgColor: 'rgba(107, 114, 128, 0.05)',
  },
};

export function UnifiedPanel({
  isSidebarExpanded,
  onSidebarExpandedChange,
  activePanel,
  onPanelChange,
  children,
}: UnifiedPanelProps) {
  const { componentThemes } = useTheme();
  const theme = componentThemes.canvasPalette.light;
  const config = PANEL_CONFIG[activePanel];

  // Calculate left offset based on sidebar state
  // When collapsed, move all the way to the left edge (1rem margin)
  const leftOffset = isSidebarExpanded
    ? 'calc(280px + 2rem + 1rem)'
    : '1rem';

  return (
    <motion.div
      className={`absolute top-4 w-72 ${theme.container.bg} ${theme.container.backdropBlur} rounded-2xl ${theme.container.shadow} flex flex-col`}
      style={{
        height: 'calc(100vh - 2rem)',
        zIndex: 20,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: config.borderColor,
        left: leftOffset,
        transition: 'left 500ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        opacity: { duration: 0.3, ease: "easeInOut" },
        scale: { duration: 0.3, ease: "easeInOut" }
      }}
    >
      {/* Unified Header */}
      <div
        className="flex-shrink-0 border-b border-gray-200"
        style={{
          backgroundColor: config.bgColor
        }}
      >
        <div className="py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Expand sidebar button - only show when sidebar is collapsed */}
            {!isSidebarExpanded && onSidebarExpandedChange && (
              <motion.button
                onClick={() => onSidebarExpandedChange(true)}
                className="h-6 w-6 rounded-md bg-white/80 hover:bg-white flex items-center justify-center transition-all border border-gray-300 hover:border-gray-400 shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="h-3.5 w-3.5 text-gray-700" />
              </motion.button>
            )}
            <h2 className="text-sm font-semibold text-gray-800">{config.title}</h2>
          </div>
          <PanelDots activePanel={activePanel} onPanelChange={onPanelChange} />
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}