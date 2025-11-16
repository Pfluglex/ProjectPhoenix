import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Download } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useState } from 'react';
import { useTheme, getSpaceColor, SPACE_TYPE_COLORS } from '../../System/ThemeManager';

interface PropertiesContentProps {
  placedSpaces?: any[];
}

export function PropertiesContent({ placedSpaces = [] }: PropertiesContentProps) {
  const { } = useTheme();
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

  const handleExportCSV = () => {
    if (placedSpaces.length === 0) {
      alert('No spaces to export');
      return;
    }

    // Create CSV content
    const headers = ['Level', 'Space ID', 'Name', 'Type', 'Width (ft)', 'Depth (ft)', 'Area (sf)', 'X Position', 'Z Position', 'Rotation'];
    const rows = placedSpaces.map((space: any) => [
      space.level || 1,
      space.id,
      space.name,
      space.type,
      space.width,
      space.depth,
      space.width * space.depth,
      space.position.x.toFixed(2),
      space.position.z.toFixed(2),
      space.rotation || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `project_spaces_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExportCSV}
          disabled={placedSpaces.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-xs font-medium"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

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
  );
}