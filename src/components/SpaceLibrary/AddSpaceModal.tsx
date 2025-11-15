import { useState } from 'react';
import { X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getSpaceColor, SPACE_TYPE_COLORS } from '../System/ThemeManager';
import type { SpaceDefinition } from '../../types';

interface AddSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (space: Omit<SpaceDefinition, 'id'>) => void;
}


// Common Lucide icons for spaces
const COMMON_ICONS = [
  'Square', 'Circle', 'Triangle', 'Laptop', 'Monitor', 'Computer',
  'Shield', 'Video', 'Stethoscope', 'Cross', 'Shirt', 'ChefHat',
  'HardHat', 'Anchor', 'Hammer', 'Plane', 'Wrench', 'Package',
  'Music', 'Archive', 'Book', 'Lightbulb', 'Beaker', 'Microscope',
  'Palette', 'Camera', 'Tv', 'Speaker', 'Headphones', 'Users',
  'User', 'Briefcase', 'Coffee', 'Home', 'Building', 'School'
];

export function AddSpaceModal({ isOpen, onClose, onSave }: AddSpaceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    width: '',
    depth: '',
    height: '12',
    type: 'technology' as 'technology' | 'trades' | 'band' | 'systems' | 'admin' | 'service' | 'generic',
    icon: 'Square'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.width || parseFloat(formData.width) <= 0) newErrors.width = 'Valid width is required';
    if (!formData.depth || parseFloat(formData.depth) <= 0) newErrors.depth = 'Valid depth is required';
    if (!formData.height || parseFloat(formData.height) <= 0) newErrors.height = 'Valid height is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create space object
    const newSpace: Omit<SpaceDefinition, 'id'> = {
      name: formData.name.trim(),
      width: parseFloat(formData.width),
      depth: parseFloat(formData.depth),
      height: parseFloat(formData.height),
      type: formData.type,
      icon: formData.icon
    };

    onSave(newSpace);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      width: '',
      depth: '',
      height: '12',
      type: 'technology',
      icon: 'Square'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const IconComponent = (LucideIcons as any)[formData.icon];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Add New Space</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Space Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Computer Science Lab"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Space Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SPACE_TYPE_COLORS).map(([type, { color, label }]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type as any })}
                    className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                      formData.type === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width (ft) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.width ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="40"
                />
                {errors.width && <p className="text-red-500 text-xs mt-1">{errors.width}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Depth (ft) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.depth}
                  onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.depth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="30"
                />
                {errors.depth && <p className="text-red-500 text-xs mt-1">{errors.depth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (ft) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.height ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="12"
                />
                {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon *
              </label>
              <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                {COMMON_ICONS.map((iconName) => {
                  const Icon = (LucideIcons as any)[iconName];
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: iconName })}
                      className={`p-2 rounded-md border-2 transition-all ${
                        formData.icon === iconName
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      title={iconName}
                    >
                      {Icon && <Icon className="w-5 h-5 text-gray-700" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">Selected: {formData.icon}</p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getSpaceColor(formData.type) }}
                >
                  {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{formData.name || 'Space Name'}</p>
                  <p className="text-sm text-gray-600 capitalize">{SPACE_TYPE_COLORS[formData.type]?.label}</p>
                  <p className="text-xs text-gray-500">
                    {formData.width || '0'}' × {formData.depth || '0'}' × {formData.height || '0'}'
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Add Space
          </button>
        </div>
      </div>
    </div>
  );
}
