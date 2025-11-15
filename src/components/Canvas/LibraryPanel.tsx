import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { listSpaces, type SpaceDefinition } from '../../lib/api';
import { useTheme, getSpaceColor, SPACE_TYPE_COLORS } from '../System/ThemeManager';

interface LibraryPanelProps {
  isSidebarExpanded: boolean;
  onDragStart?: (space: any) => void;
  onDragEnd?: () => void;
}

export function LibraryPanel({ isSidebarExpanded, onDragStart, onDragEnd }: LibraryPanelProps) {
  const { componentThemes } = useTheme();
  const theme = componentThemes.canvasPalette.light;
  const [spaces, setSpaces] = useState<SpaceDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set([]));
  const [recentSpaces, setRecentSpaces] = useState<SpaceDefinition[]>([]);

  // Calculate left offset based on sidebar state
  const leftOffset = isSidebarExpanded
    ? 'calc(280px + 2rem + 1rem)'
    : 'calc(80px + 2rem + 1rem)';

  useEffect(() => {
    const loadSpacesFromDB = async () => {
      try {
        const result = await listSpaces();
        if (result.success && result.spaces) {
          setSpaces(result.spaces);
        }
      } catch (error) {
        console.error('Error loading spaces:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpacesFromDB();
  }, []);

  // Filter spaces by search query
  const filteredSpaces = spaces.filter(
    (space) =>
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group spaces by type
  const groupedSpaces = filteredSpaces.reduce((acc, space) => {
    if (!acc[space.type]) {
      acc[space.type] = [];
    }
    acc[space.type].push(space);
    return acc;
  }, {} as Record<string, SpaceDefinition[]>);

  const toggleType = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

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
        height: 'calc(100vh - 2rem)'
      }}
      initial={false}
      animate={{ left: leftOffset }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="border-b border-gray-200">
          <div className="py-3 px-4">
            <h2 className="text-sm font-semibold text-gray-800">Library</h2>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spaces..."
              className={`w-full pl-10 pr-3 py-2 ${theme.search.bg} border ${theme.search.border} rounded-md focus:outline-none focus:ring-2 ${theme.search.focusRing} text-sm ${theme.search.backdropBlur}`}
            />
          </div>
        </div>
      </div>

      {/* Library Content */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        {Object.entries(groupedSpaces).length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No spaces found
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Recents Section */}
            <div className="rounded-lg border border-blue-300 bg-blue-50/30">
              <div className="px-2 py-1.5 border-b border-blue-200">
                <span className="font-medium text-blue-900 text-sm">
                  Recent
                </span>
              </div>
              <div className="px-1.5 pb-1.5 pt-1 space-y-0.5">
                {Array.from({ length: 3 }).map((_, index) => {
                  const space = recentSpaces[index];
                  return space ? (
                    <motion.div
                      key={`recent-${space.id}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-1.5 ${theme.spaceItem.hover} rounded cursor-grab active:cursor-grabbing transition-colors border ${theme.spaceItem.border} ${theme.spaceItem.hoverBorder} bg-white select-none`}
                      draggable="true"
                      onDragStart={(e: any) => {
                        console.log('🎯 [LIBRARY] Dragging space from RECENT:', space.name);
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
                          {(() => {
                            const IconComponent = (LucideIcons as any)[space.icon || 'Square'];
                            return IconComponent ? <IconComponent className="w-3.5 h-3.5 text-white" /> : null;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {space.name}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {space.width}' × {space.depth}' × {space.height}'
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div key={`empty-${index}`} className="p-1.5 rounded border border-dashed border-gray-300 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                          <div className="h-2 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Type Buckets */}
            {Object.entries(groupedSpaces).map(([type, typeSpaces]) => {
              const isExpanded = expandedTypes.has(type);

              return (
                <div key={type} className="rounded-lg border border-gray-300">
                  {/* Type Header */}
                  <button
                    onClick={() => toggleType(type)}
                    className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                      <span className="font-medium text-gray-800 capitalize text-sm">
                        {SPACE_TYPE_COLORS[type as keyof typeof SPACE_TYPE_COLORS]?.label || type}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({typeSpaces.length})
                      </span>
                    </div>
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
                        <div className="px-1.5 pb-1.5 space-y-0.5">
                          {typeSpaces.map((space, index) => (
                            <motion.div
                              key={space.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className={`p-1.5 ${theme.spaceItem.hover} rounded cursor-grab active:cursor-grabbing transition-colors border ${theme.spaceItem.border} ${theme.spaceItem.hoverBorder} select-none`}
                              draggable="true"
                              onDragStart={(e: any) => {
                                console.log('🎯 [LIBRARY] Dragging space from LIBRARY:', space.name);
                                e.dataTransfer.setData('application/json', JSON.stringify(space));
                                e.dataTransfer.effectAllowed = 'copy';

                                onDragStart?.(space);

                                // Add to recents (avoid duplicates, keep max 3)
                                setRecentSpaces((prev) => {
                                  const filtered = prev.filter(s => s.id !== space.id);
                                  return [space, ...filtered].slice(0, 3);
                                });
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
                                  {(() => {
                                    const IconComponent = (LucideIcons as any)[space.icon || 'Square'];
                                    return IconComponent ? <IconComponent className="w-3.5 h-3.5 text-white" /> : null;
                                  })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-900 truncate">
                                    {space.name}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
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
    </motion.div>
  );
}
