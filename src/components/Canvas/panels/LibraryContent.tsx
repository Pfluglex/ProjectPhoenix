import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { listSpaces, updateSpace, deleteSpace, createSpace, type SpaceDefinition } from '../../../lib/api';
import { useTheme, SPACE_TYPE_COLORS } from '../../System/ThemeManager';
import { EditSpaceModal } from '../../SpaceLibrary/EditSpaceModal';
import { AddSpaceModal } from '../../SpaceLibrary/AddSpaceModal';
import { SpaceCard } from './SpaceCard';

interface LibraryContentProps {
  onDragStart?: (space: any) => void;
  onDragEnd?: () => void;
}

export function LibraryContent({ onDragStart, onDragEnd }: LibraryContentProps) {
  const { componentThemes } = useTheme();
  const theme = componentThemes.canvasPalette.light;
  const [spaces, setSpaces] = useState<SpaceDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set([]));
  const [recentSpaces, setRecentSpaces] = useState<SpaceDefinition[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<SpaceDefinition | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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

  useEffect(() => {
    loadSpacesFromDB();
  }, []);

  const handleEditSpace = (space: SpaceDefinition, e?: React.MouseEvent) => {
    // Stop propagation to prevent drag start
    e?.stopPropagation();
    setSelectedSpace(space);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (spaceId: string, updates: Partial<SpaceDefinition>) => {
    try {
      const result = await updateSpace(spaceId, updates);
      if (result.success) {
        // Reload spaces
        setLoading(true);
        await loadSpacesFromDB();
        alert(`Space updated successfully!`);
      } else {
        alert(`Failed to update space: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating space:', error);
      alert('Error updating space. Please try again.');
    }
  };

  const handleDeleteSpace = async (space: SpaceDefinition, e?: React.MouseEvent) => {
    // Stop propagation to prevent drag start
    e?.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete "${space.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await deleteSpace(space.id);
      if (result.success) {
        // Reload spaces
        setLoading(true);
        await loadSpacesFromDB();
        alert(`Space "${space.name}" deleted successfully!`);
      } else {
        alert(`Failed to delete space: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting space:', error);
      alert('Error deleting space. Please try again.');
    }
  };

  const handleAddSpace = async (spaceData: Omit<SpaceDefinition, 'id'>) => {
    try {
      // Generate ID from type and timestamp
      const id = `${spaceData.type.substring(0, 4)}-${Date.now().toString().slice(-6)}`;

      const result = await createSpace({ ...spaceData, id });
      if (result.success) {
        // Reload spaces
        setLoading(true);
        await loadSpacesFromDB();
        alert(`Space "${spaceData.name}" added successfully!`);
      } else {
        alert(`Failed to add space: ${result.error}`);
      }
    } catch (error) {
      console.error('Error adding space:', error);
      alert('Error adding space. Please try again.');
    }
  };

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
      <div className="p-4">
        <p className="text-gray-600 text-sm">Loading spaces...</p>
      </div>
    );
  }

  return (
    <>
      {/* Search */}
      <div className="px-4 py-3 flex-shrink-0">
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
                    <SpaceCard
                      key={`recent-${space.id}`}
                      space={space}
                      index={0}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      onEdit={handleEditSpace}
                      onDelete={handleDeleteSpace}
                    />
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
                            <SpaceCard
                              key={space.id}
                              space={space}
                              index={index}
                              onDragStart={(s) => {
                                onDragStart?.(s);
                                // Add to recents (avoid duplicates, keep max 3)
                                setRecentSpaces((prev) => {
                                  const filtered = prev.filter(prevSpace => prevSpace.id !== s.id);
                                  return [s, ...filtered].slice(0, 3);
                                });
                              }}
                              onDragEnd={onDragEnd}
                              onEdit={handleEditSpace}
                              onDelete={handleDeleteSpace}
                            />
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

      {/* Footer with Add Space button and space count */}
      <div className={`p-3 border-t ${theme.footer.divider} ${theme.footer.bg} flex-shrink-0 space-y-2`}>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/60 text-white rounded-lg hover:bg-blue-500 transition-all text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Space
        </button>
        <p className="text-xs text-gray-600 text-center">
          {filteredSpaces.length} space{filteredSpaces.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Edit Space Modal */}
      <EditSpaceModal
        isOpen={showEditModal}
        space={selectedSpace}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSpace(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* Add Space Modal */}
      <AddSpaceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSpace}
      />
    </>
  );
}