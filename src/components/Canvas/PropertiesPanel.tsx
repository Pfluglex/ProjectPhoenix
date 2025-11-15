import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useTheme, getSpaceColor } from '../System/ThemeManager';

interface PropertiesPanelProps {
  isSidebarExpanded: boolean;
  placedSpaces?: any[];
}

export function PropertiesPanel({ isSidebarExpanded, placedSpaces = [] }: PropertiesPanelProps) {
  const { componentThemes } = useTheme();
  const theme = componentThemes.canvasPalette.light;

  // Calculate left offset (positioned next to Tools panel)
  const leftOffset = isSidebarExpanded
    ? 'calc(280px + 2rem + 1rem + 320px + 1rem + 288px + 1rem)' // sidebar + library + tools + gaps
    : 'calc(80px + 2rem + 1rem + 320px + 1rem + 288px + 1rem)';

  return (
    <motion.div
      className={`absolute top-4 w-80 ${theme.container.bg} ${theme.container.backdropBlur} rounded-2xl ${theme.container.shadow} border ${theme.container.border} flex flex-col`}
      style={{
        height: 'calc(100vh - 2rem)'
      }}
      initial={false}
      animate={{ left: leftOffset }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="py-3 px-4">
          <h2 className="text-sm font-semibold text-gray-800">Properties</h2>
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
                return (
                  <div key={level} className="mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2 pb-1 border-b border-gray-200">
                      <span>Level {level} ({spacesArray.length})</span>
                      <span className="text-blue-600">
                        {levelTotal.toLocaleString()} sf
                      </span>
                    </div>
                    <div className="space-y-1">
                      {spacesArray.map((space: typeof placedSpaces[0]) => (
                        <div key={space.instanceId} className="flex items-center gap-2 text-xs">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: getSpaceColor(space.type) }}
                          >
                            {(() => {
                              const IconComponent = (LucideIcons as any)[space.icon || 'Square'];
                              return IconComponent ? <IconComponent className="w-3 h-3 text-white" /> : null;
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 truncate font-medium">{space.name}</p>
                          </div>
                          <span className="text-gray-600 text-[10px]">
                            {(space.width * space.depth).toLocaleString()} sf
                          </span>
                        </div>
                      ))}
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
