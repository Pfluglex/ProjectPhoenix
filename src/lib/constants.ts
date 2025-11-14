import { GRID_MODULE, SNAP_SIZES } from '../types';

// Grid Configuration
export const GRID_CONFIG = {
  // Base grid module (1 foot)
  baseModule: GRID_MODULE,

  // Available snap increments (in feet)
  snapSizes: SNAP_SIZES,

  // Default snap size for placement (10 feet is common in architecture)
  defaultSnap: 10,

  // Grid visibility toggles
  showBaseGrid: false, // Show 1' grid lines
  showSnapGrid: true, // Show snap increment lines (5', 10', etc.)

  // Visual settings
  baseGridOpacity: 0.1,
  snapGridOpacity: 0.3,
  baseGridColor: '#E5E7EB', // gray-200
  snapGridColor: '#9CA3AF', // gray-400
};

// Project Configuration
export const PROJECT_CONFIG = {
  // Budget target
  budgetSF: 85000,

  // Default ceiling height
  defaultCeilingHeight: 12, // feet

  // Canvas bounds (in feet) - defines the buildable area
  canvasWidth: 500,
  canvasHeight: 500,
};

// Visual Configuration
export const VISUAL_CONFIG = {
  // 2D Canvas
  canvas2D: {
    pixelsPerFoot: 2, // Scale factor for 2D view
    spaceStrokeWidth: 2,
    spaceStrokeColor: '#000000',
    selectedStrokeColor: '#FFFFFF',
    selectedStrokeWidth: 3,
  },

  // 3D View
  canvas3D: {
    cameraPosition: [150, 100, 150] as [number, number, number],
    cameraFOV: 50,
    floorHeight: 1.5, // multiplier for floor-to-floor height
  },

  // Space labels
  labels: {
    fontSize2D: 14,
    fontSize3D: 2.5,
    showDimensions: true,
    showSF: true,
  },
};

// Interaction Configuration
export const INTERACTION_CONFIG = {
  // Drag sensitivity
  dragThreshold: 5, // pixels

  // Rotation
  rotationStep: 90, // degrees

  // Keyboard shortcuts
  shortcuts: {
    rotate: 'r',
    delete: 'Delete',
    duplicate: 'd',
    escape: 'Escape',
  },
};

// Export all configs as a single object
export const APP_CONFIG = {
  grid: GRID_CONFIG,
  project: PROJECT_CONFIG,
  visual: VISUAL_CONFIG,
  interaction: INTERACTION_CONFIG,
};

export default APP_CONFIG;
