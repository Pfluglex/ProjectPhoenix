import { useState, useEffect } from 'react';
import { listSpaces, deleteSpace, createSpace, updateSpace } from '../../lib/api';
import type { SpaceDefinition } from '../../types';
import { Search, X, Edit2, Trash2, Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getSpaceColor, SPACE_TYPE_COLORS } from '../System/ThemeManager';
import { AddSpaceModal } from '../SpaceLibrary/AddSpaceModal';
import { EditSpaceModal } from '../SpaceLibrary/EditSpaceModal';

export function SpaceLibrary() {
  const [spaces, setSpaces] = useState<SpaceDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<SpaceDefinition | null>(null);

  useEffect(() => {
    loadSpacesFromDB();
  }, []);

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

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading spaces...</p>
      </div>
    );
  }

  // Filter spaces
  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         space.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Group by type
  const groupedByType = filteredSpaces.reduce((acc, space) => {
    if (!acc[space.type]) {
      acc[space.type] = [];
    }
    acc[space.type].push(space);
    return acc;
  }, {} as Record<string, SpaceDefinition[]>);

  // Calculate totals
  const totalSpaces = spaces.length;
  const totalSF = spaces.reduce((sum, space) => sum + (space.width * space.depth), 0);

  // Reset filters
  const hasActiveFilters = searchQuery !== '';
  const resetFilters = () => {
    setSearchQuery('');
  };

  const handleEditSpace = (space: SpaceDefinition) => {
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

  const handleDeleteSpace = async (space: SpaceDefinition) => {
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

  return (
    <div className="w-full h-full bg-gray-50 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Space Library</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Space
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Total Spaces</p>
            <p className="text-3xl font-bold text-gray-900">{totalSpaces}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Total SF</p>
            <p className="text-3xl font-bold text-gray-900">{totalSF.toLocaleString()}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Search</h2>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Spaces Grouped by Type */}
        {filteredSpaces.length === 0 ? (
          <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 text-center">
            <p className="text-lg text-gray-500 mb-2">No spaces found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByType).map(([type, typeSpaces]) => (
              <div key={type}>
                {/* Type Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getSpaceColor(type as any) }}
                  />
                  <h2 className="text-xl font-semibold text-gray-800 capitalize">
                    {SPACE_TYPE_COLORS[type as keyof typeof SPACE_TYPE_COLORS]?.label || type}
                    <span className="text-gray-500 font-normal ml-2">({typeSpaces.length})</span>
                  </h2>
                </div>

                {/* Space Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {typeSpaces.map((space) => {
                    const IconComponent = (LucideIcons as any)[space.icon || 'Square'];
                    return (
                      <div
                        key={space.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative"
                      >
                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex gap-1">
                          <button
                            onClick={() => handleEditSpace(space)}
                            className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit space"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSpace(space)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete space"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Icon and Name */}
                        <div className="flex items-start gap-3 mb-3 pr-16">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: getSpaceColor(space.type) }}
                          >
                            {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {space.name}
                            </h3>
                            <p className="text-xs text-gray-500 capitalize">{SPACE_TYPE_COLORS[space.type]?.label}</p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Dimensions:</span>
                            <span className="font-medium">{space.width}' × {space.depth}'</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Height:</span>
                            <span className="font-medium">{space.height}'</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Area:</span>
                            <span className="font-medium">{(space.width * space.depth).toLocaleString()} SF</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Space Modal */}
      <AddSpaceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSpace}
      />

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
    </div>
  );
}
