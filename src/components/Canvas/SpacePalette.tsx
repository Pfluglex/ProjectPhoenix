import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { loadSpacesFromCSV } from '../../lib/csvParser';
import type { SpaceDefinition } from '../../types';
import { useTheme } from '../System/ThemeManager';

interface SpacePaletteProps {
  isSidebarExpanded: boolean;
  canvasInfo?: {
    position: { x: number; y: number };
    zoom: number;
  };
  snapInterval?: number;
  onSnapIntervalChange?: (interval: number) => void;
}

export function SpacePalette({ isSidebarExpanded, canvasInfo, snapInterval = 5, onSnapIntervalChange }: SpacePaletteProps) {
  const { componentThemes } = useTheme();
  const theme = componentThemes.canvasPalette.light;
  const [spaces, setSpaces] = useState<SpaceDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['technology', 'trades', 'band'])
  );

  useEffect(() => {
    loadSpacesFromCSV('/data/cte-spaces.csv').then((loadedSpaces) => {
      setSpaces(loadedSpaces);
      setLoading(false);
    });
  }, []);

  // Filter spaces by search query
  const filteredSpaces = spaces.filter(
    (space) =>
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group spaces by category
  const groupedSpaces = filteredSpaces.reduce((acc, space) => {
    if (!acc[space.category]) {
      acc[space.category] = [];
    }
    acc[space.category].push(space);
    return acc;
  }, {} as Record<string, SpaceDefinition[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Calculate left offset based on sidebar state
  // Sidebar has m-4 (16px) margin and is either 80px or 280px wide
  const leftOffset = isSidebarExpanded
    ? 'calc(280px + 2rem + 1rem)' // 280px sidebar + 16px margin + 16px spacing
    : 'calc(80px + 2rem + 1rem)';  // 80px sidebar + 16px margin + 16px spacing

  if (loading) {
    return (
      <motion.div
        className={`absolute top-4 w-80 ${theme.container.bg} ${theme.container.backdropBlur} rounded-lg ${theme.container.shadow} border ${theme.container.border} p-4`}
        style={{ left: leftOffset }}
        initial={false}
        animate={{ left: leftOffset }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <p className="text-gray-600 text-sm">Loading spaces...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`absolute top-4 w-80 ${theme.container.bg} ${theme.container.backdropBlur} rounded-lg ${theme.container.shadow} border ${theme.container.border} flex flex-col`}
      style={{
        left: leftOffset,
        height: 'calc(100vh - 2rem)'
      }}
      initial={false}
      animate={{ left: leftOffset }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className={`p-4 border-b ${theme.header.divider} flex-shrink-0`}>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Space Library</h2>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spaces..."
            className={`w-full pl-10 pr-3 py-2 ${theme.search.bg} border ${theme.search.border} rounded-md focus:outline-none focus:ring-2 ${theme.search.focusRing} text-sm ${theme.search.backdropBlur}`}
          />
        </div>

        {/* Snap Interval */}
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
            <span>Snap to Grid</span>
            <span className="text-gray-500">{snapInterval}'</span>
          </label>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={snapInterval}
            onChange={(e) => onSnapIntervalChange?.(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>1'</span>
            <span>5'</span>
            <span>10'</span>
            <span>30'</span>
          </div>
        </div>
      </div>

      {/* Space List */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        {Object.entries(groupedSpaces).length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No spaces found
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(groupedSpaces).map(([category, categorySpaces]) => {
              const isExpanded = expandedCategories.has(category);

              return (
                <div key={category} className={`${theme.category.bg} ${theme.category.backdropBlur} rounded-lg border ${theme.category.border}`}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className={`w-full px-3 py-2 flex items-center justify-between ${theme.category.hover} transition-colors rounded-lg`}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                      <span className="font-medium text-gray-800 capitalize text-sm">
                        {category}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({categorySpaces.length})
                      </span>
                    </div>
                  </button>

                  {/* Category Spaces */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-2 pb-2 space-y-1">
                          {categorySpaces.map((space, index) => (
                            <motion.div
                              key={space.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify(space));
                                e.dataTransfer.effectAllowed = 'copy';
                              }}
                              className={`p-2 ${theme.spaceItem.hover} rounded cursor-grab active:cursor-grabbing transition-colors border ${theme.spaceItem.border} ${theme.spaceItem.hoverBorder}`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded flex-shrink-0"
                                  style={{ backgroundColor: space.color }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {space.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {space.width}' × {space.depth}' × {space.height}'
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with space count */}
      <div className={`p-3 border-t ${theme.footer.divider} ${theme.footer.bg} flex-shrink-0`}>
        <p className="text-xs text-gray-600 text-center">
          {filteredSpaces.length} space{filteredSpaces.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Canvas Info */}
      {canvasInfo && (
        <div className={`p-3 border-t ${theme.footer.divider} ${theme.footer.bg} flex-shrink-0`}>
          <div className="text-xs text-gray-600 space-y-1">
            <div>
              <span className="font-medium">Position:</span> ({Math.round(canvasInfo.position.x)}, {Math.round(canvasInfo.position.y)})
            </div>
            <div>
              <span className="font-medium">Zoom:</span> {Math.round(canvasInfo.zoom * 100)}%
            </div>
            <div className={`text-gray-500 mt-2 pt-2 border-t ${theme.footer.divider}`}>
              Click + drag to pan
            </div>
            <div className="text-gray-500">
              Scroll to zoom
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
