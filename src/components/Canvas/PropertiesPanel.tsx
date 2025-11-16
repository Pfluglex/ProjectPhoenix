import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, PanelLeftOpen } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useState } from 'react';
import { useTheme, getSpaceColor, SPACE_TYPE_COLORS } from '../System/ThemeManager';
import { PanelDots, type PanelType } from './PanelDots';

interface PropertiesPanelProps {
  isSidebarExpanded: boolean;
  onSidebarExpandedChange?: (expanded: boolean) => void;
  placedSpaces?: any[];
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

export function PropertiesPanel({ isSidebarExpanded, onSidebarExpandedChange, placedSpaces = [], activePanel, onPanelChange }: PropertiesPanelProps) {
  const { componentThemes } = useTheme();
  const theme = componentThemes.canvasPalette.light;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Calculate left offset (same position as Library and Tools - they stack)
  // When collapsed, move all the way to the left edge (1rem margin)
  const leftOffset = isSidebarExpanded
    ? 'calc(280px + 2rem + 1rem)' // sidebar + gap (same as library)
    : '1rem';

  // Determine if this panel is active
  const isActive = activePanel === 'properties';

  return (
    <motion.div
      className={`absolute top-4 w-72 ${theme.container.bg} ${theme.container.backdropBlur} rounded-2xl ${theme.container.shadow} flex flex-col`}
      style={{
        height: 'calc(100vh - 2rem)',
        zIndex: isActive ? 20 : 10,
        pointerEvents: isActive ? 'auto' : 'none',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'rgba(16, 185, 129, 0.2)', // Green with 20% opacity
        left: leftOffset,
        transition: 'left 500ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.95
      }}
      transition={{
        opacity: { duration: 0.3, ease: "easeInOut" },
        scale: { duration: 0.3, ease: "easeInOut" }
      }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 border-b border-gray-200"
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.05)' // Green with 5% opacity
        }}
      >
        <div className="py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Collapse button - only show when sidebar is collapsed */}
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
            <h2 className="text-sm font-semibold text-gray-800">Properties</h2>
          </div>
          <PanelDots activePanel={activePanel} onPanelChange={onPanelChange} />
        </div>
      </div>

      {/* Properties Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Building Level Totals */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Building Totals</h3>
          {placedSpaces.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-4">
              No spaces added yet
            </div>
          ) : (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((level) => {
                const levelSpaces = placedSpaces.filter((s: any) => s.level === level);
                const levelTotal = levelSpaces.reduce((sum: number, space: any) => sum + (space.width * space.depth), 0);

                if (levelSpaces.length === 0) return null;

                return (
                  <div key={level} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                    <span className="font-semibold text-gray-700">Level {level}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">{levelSpaces.length} space{levelSpaces.length !== 1 ? 's' : ''}</span>
                      <span className="font-bold text-blue-600">{levelTotal.toLocaleString()} sf</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded border border-blue-200 mt-3">
                <span className="font-bold text-gray-800">Total Building</span>
                <span className="font-bold text-blue-600">
                  {placedSpaces.reduce((total: number, space: any) => total + (space.width * space.depth), 0).toLocaleString()} sf
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Spaces by Level Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Spaces by Level</h3>

          {placedSpaces.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-4">
              No spaces added yet
            </div>
          ) : (
            <>
              {/* Group spaces by level */}
              {Object.entries(
                placedSpaces.reduce((acc, space) => {
                  const level = space.level || 1;
                  if (!acc[level]) {
                    acc[level] = [];
                  }
                  acc[level].push(space);
                  return acc;
                }, {} as Record<number, typeof placedSpaces>)
              )
              .sort(([a], [b]) => Number(a) - Number(b)) // Sort by level number
              .map(([level, levelSpaces]) => {
                const spacesArray = levelSpaces as typeof placedSpaces;
                const levelTotal = spacesArray.reduce((sum: number, space: typeof placedSpaces[0]) => sum + (space.width * space.depth), 0);

                // Group spaces by type within this level
                const spacesByType = spacesArray.reduce((acc, space) => {
                  const type = space.type || 'generic';
                  if (!acc[type]) {
                    acc[type] = [];
                  }
                  acc[type].push(space);
                  return acc;
                }, {} as Record<string, typeof spacesArray>);

                return (
                  <div key={level} className="mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-200">
                      <span>Level {level} ({spacesArray.length})</span>
                      <span className="text-blue-600">
                        {levelTotal.toLocaleString()} sf
                      </span>
                    </div>

                    {/* Types within this level */}
                    <div className="space-y-1">
                      {Object.entries(spacesByType).map(([type, typeSpaces]) => {
                        const sectionId = `level-${level}-type-${type}`;
                        const isExpanded = expandedSections.has(sectionId);
                        const typeTotal = (typeSpaces as any[]).reduce((sum: number, space: any) => sum + (space.width * space.depth), 0);
                        const typeLabel = SPACE_TYPE_COLORS[type as keyof typeof SPACE_TYPE_COLORS]?.label || type;

                        return (
                          <div key={type} className="rounded border border-gray-200">
                            {/* Type Header */}
                            <button
                              onClick={() => toggleSection(sectionId)}
                              className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-50 transition-colors rounded text-left"
                            >
                              <div className="flex items-center gap-1.5">
                                {isExpanded ? (
                                  <ChevronDown className="w-3 h-3 text-gray-500" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-gray-500" />
                                )}
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: getSpaceColor(type as any) }}
                                />
                                <span className="text-xs font-medium text-gray-700 capitalize">
                                  {typeLabel}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  ({(typeSpaces as any[]).length})
                                </span>
                              </div>
                              <span className="text-[10px] font-semibold text-gray-600">
                                {typeTotal.toLocaleString()} sf
                              </span>
                            </button>

                            {/* Type Spaces */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-2 pb-1.5 space-y-1">
                                    {(typeSpaces as any[]).map((space: any) => (
                                      <div key={space.instanceId} className="flex items-center gap-2 text-xs pl-5">
                                        <div
                                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                          style={{ backgroundColor: getSpaceColor(space.type) }}
                                        >
                                          {(() => {
                                            const IconComponent = (LucideIcons as any)[space.icon || 'Square'];
                                            return IconComponent ? <IconComponent className="w-2.5 h-2.5 text-white" /> : null;
                                          })()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-gray-900 truncate text-[11px]">{space.name}</p>
                                        </div>
                                        <span className="text-gray-600 text-[10px]">
                                          {(space.width * space.depth).toLocaleString()} sf
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
