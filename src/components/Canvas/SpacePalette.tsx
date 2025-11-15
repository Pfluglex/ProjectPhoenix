import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, Ruler, Eye } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { listSpaces, type SpaceDefinition } from '../../lib/api';
import { useTheme, getSpaceColor, SPACE_TYPE_COLORS } from '../System/ThemeManager';

interface SpacePaletteProps {
  isSidebarExpanded: boolean;
  canvasInfo?: {
    position: { x: number; y: number };
    zoom: number;
  };
  snapInterval?: number;
  onSnapIntervalChange?: (interval: number) => void;
  currentLevel?: number;
  onLevelChange?: (level: number) => void;
  labelMode?: 'text' | 'icon';
  onLabelModeChange?: (mode: 'text' | 'icon') => void;
  cameraAngle?: 45 | 90;
  onCameraAngleChange?: (angle: 45 | 90) => void;
  placedSpaces?: any[];
  onSaveProject?: () => void;
  onClearCanvas?: () => void;
  onLoadProject?: (projectId?: string) => void;
  onDragStart?: (space: any) => void;
  onDragEnd?: () => void;
  measureMode?: boolean;
  onMeasureModeChange?: (enabled: boolean) => void;
  measurementCount?: number;
  onClearAllMeasurements?: () => void;
  presentationMode?: boolean;
  onPresentationModeChange?: (enabled: boolean) => void;
}

export function SpacePalette({ isSidebarExpanded, snapInterval = 5, onSnapIntervalChange, currentLevel = 1, onLevelChange, labelMode = 'text', onLabelModeChange, cameraAngle = 90, onCameraAngleChange, placedSpaces = [], onSaveProject, onClearCanvas, onLoadProject, onDragStart, onDragEnd, measureMode = false, onMeasureModeChange, measurementCount = 0, onClearAllMeasurements, presentationMode = false, onPresentationModeChange }: SpacePaletteProps) {
  const { componentThemes, colors } = useTheme();
  const theme = componentThemes.canvasPalette.light;
  const [spaces, setSpaces] = useState<SpaceDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(
    new Set([]) // Start with all types collapsed
  );
  const [recentSpaces, setRecentSpaces] = useState<SpaceDefinition[]>([]);
  const [activePanel, setActivePanel] = useState<'library' | 'properties'>('library');

  useEffect(() => {
    // Load spaces from database API
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
        height: 'calc(100vh - 2rem)'
      }}
      initial={false}
      animate={{ left: leftOffset }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header with Tabs */}
      <div className="flex-shrink-0">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActivePanel('library')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all relative ${
              activePanel === 'library'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setActivePanel('properties')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all relative ${
              activePanel === 'properties'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            Properties
          </button>
        </div>

        {/* Controls - only show in Library mode */}
        {activePanel === 'library' && (
          <div className="p-4 space-y-2">
            {/* iOS 26 Style Toggles - Stacked Vertically */}

            {/* Isometric View Toggle */}
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-900">Isometric View</span>
              <button
                onClick={() => onCameraAngleChange?.(cameraAngle === 90 ? 45 : 90)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 ${
                  cameraAngle === 45 ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    cameraAngle === 45 ? 'translate-x-[26px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </div>

            {/* Icon Labels Toggle */}
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-900">Icon Labels</span>
              <button
                onClick={() => onLabelModeChange?.(labelMode === 'text' ? 'icon' : 'text')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 ${
                  labelMode === 'icon' ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    labelMode === 'icon' ? 'translate-x-[26px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </div>

            {/* Presentation Mode Toggle */}
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-900">Presentation Mode</span>
              <button
                onClick={() => onPresentationModeChange?.(!presentationMode)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 ${
                  presentationMode ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    presentationMode ? 'translate-x-[26px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </div>

            {/* Measure Tool Toggle */}
            <div>
              <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-2">
                <span>Measure Tool</span>
                <span className="text-gray-500">{measureMode ? 'On' : 'Off'} {measurementCount > 0 && `(${measurementCount})`}</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => onMeasureModeChange?.(!measureMode)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    measureMode
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Ruler className="w-4 h-4" />
                  {measureMode ? 'Measuring' : 'Measure'}
                </button>
                {measurementCount > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Clear all ${measurementCount} measurement(s)?`)) {
                        onClearAllMeasurements?.();
                      }
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                    title="Clear All Measurements"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Snap Interval */}
            <div>
              <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
                <span>Snap to Grid</span>
                <span className="text-gray-500">{snapInterval}'</span>
              </label>
              <input
                type="range"
                min="0"
                max="7"
                step="1"
                value={[1, 2.5, 5, 7.5, 10, 15, 20, 30].indexOf(snapInterval)}
                onChange={(e) => {
                  const snapValues = [1, 2.5, 5, 7.5, 10, 15, 20, 30];
                  onSnapIntervalChange?.(snapValues[Number(e.target.value)]);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                <span>1'</span>
                <span>2.5'</span>
                <span>5'</span>
                <span>7.5'</span>
                <span>10'</span>
                <span>15'</span>
                <span>20'</span>
                <span>30'</span>
              </div>
            </div>

            {/* Building Level */}
            <div>
              <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
                <span>Building Level</span>
                <span className="text-gray-500">L{currentLevel} (Y={(currentLevel - 1) * 15}')</span>
              </label>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={currentLevel}
                onChange={(e) => {
                  onLevelChange?.(Number(e.target.value));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                <span>L1</span>
                <span>L2</span>
                <span>L3</span>
                <span>L4</span>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Save, Load, and Clear Buttons - Horizontal Stack */}
            <div className="flex gap-2">
              <button
                onClick={onSaveProject}
                disabled={placedSpaces.length === 0}
                className="flex-1 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                style={{
                  backgroundColor: placedSpaces.length === 0 ? undefined : colors.secondary.darkBlue,
                }}
                onMouseEnter={(e) => {
                  if (placedSpaces.length > 0) {
                    e.currentTarget.style.backgroundColor = colors.secondary.darkBlue;
                    e.currentTarget.style.opacity = '0.85';
                  }
                }}
                onMouseLeave={(e) => {
                  if (placedSpaces.length > 0) {
                    e.currentTarget.style.backgroundColor = colors.secondary.darkBlue;
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                Save
              </button>
              <button
                onClick={() => onLoadProject?.()}
                className="flex-1 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.secondary.oliveGreen,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.85';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Load
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
                    onClearCanvas?.();
                  }
                }}
                disabled={placedSpaces.length === 0}
                className="flex-1 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                style={{
                  backgroundColor: placedSpaces.length === 0 ? undefined : colors.primary.brick,
                }}
                onMouseEnter={(e) => {
                  if (placedSpaces.length > 0) {
                    e.currentTarget.style.backgroundColor = colors.primary.brick;
                    e.currentTarget.style.opacity = '0.85';
                  }
                }}
                onMouseLeave={(e) => {
                  if (placedSpaces.length > 0) {
                    e.currentTarget.style.backgroundColor = colors.primary.brick;
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Search - only show in Library mode */}
        {activePanel === 'library' && (
          <div className="px-4 pb-3">
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
        )}
      </div>

      {/* Library Content */}
      {activePanel === 'library' && (
        <>
          <div className="flex-1 overflow-y-auto p-2 min-h-0">
            {Object.entries(groupedSpaces).length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No spaces found
              </div>
            ) : (
              <div className="space-y-1.5">
                {/* Recents Section - Always show 5 slots */}
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
                            console.log('🎯 [PALETTE] Dragging space from RECENT:', space.name, '| Initial Y: N/A (template)');
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
                                console.log('🎯 [PALETTE] Dragging space from LIBRARY:', space.name, '| Initial Y: N/A (template)');
                                e.dataTransfer.setData('application/json', JSON.stringify(space));
                                e.dataTransfer.effectAllowed = 'copy';

                                // Notify parent about drag start
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
        </>
      )}

      {/* Properties Content */}
      {activePanel === 'properties' && (
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

            {/* My Build Section - Grouped by Level */}
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
      )}
    </motion.div>
  );
}
