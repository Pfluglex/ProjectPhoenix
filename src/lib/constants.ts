/**
 * GLOBAL CONFIGURATION FILE
 *
 * This file contains ALL configurable constants for Project Phoenix.
 * To add new space types or icons, just edit this file - everything else updates automatically!
 *
 * ADDING A NEW SPACE TYPE:
 * 1. Add to SPACE_TYPES object below with: id, label, color, description
 * 2. That's it! The type will appear everywhere (modals, filters, palette, etc.)
 *
 * ADDING A NEW ICON:
 * 1. Add the Lucide icon name to COMMON_SPACE_ICONS array
 * 2. That's it! The icon will appear in Add/Edit space modals
 */

// ============================================
// GRID CONFIGURATION
// ============================================
export const GRID_CONFIG = {
  defaultSnap: 5, // feet
  snapSizes: [1, 2.5, 5, 7.5, 10, 15, 20, 30] // available snap intervals
} as const;

// ============================================
// SPACE TYPE CONFIGURATION
// ============================================
// Define all space types in ONE place - add new types here!
export const SPACE_TYPES = {
  technology: {
    id: 'technology',
    label: 'Technology',
    color: '#003C71', // darkBlue
    description: 'Computer labs, cyber security, audio visual'
  },
  trades: {
    id: 'trades',
    label: 'Trades',
    color: '#00A9E0', // skyBlue
    description: 'Construction, aviation, culinary, automotive'
  },
  band: {
    id: 'band',
    label: 'Band',
    color: '#9A3324', // brick
    description: 'Band hall, choir, music, dressing rooms'
  },
  systems: {
    id: 'systems',
    label: 'Systems',
    color: '#B5BD00', // chartreuse
    description: 'PLC support, control rooms, server rooms'
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    color: '#f16555', // salmon
    description: 'Offices, conference rooms, meeting spaces'
  },
  service: {
    id: 'service',
    label: 'Service',
    color: '#F2A900', // orange
    description: 'Storage, mechanical, electrical, janitorial'
  },
  generic: {
    id: 'generic',
    label: 'Generic',
    color: '#67823A', // oliveGreen
    description: 'Career centers, circulation, commons'
  },
  egress: {
    id: 'egress',
    label: 'Egress',
    color: '#6B7280', // gray
    description: 'Emergency exits, corridors, stairs, exit routes'
  }
} as const;

// Extract type IDs as a union type
export type SpaceTypeId = keyof typeof SPACE_TYPES;

// Helper to get all type IDs as an array
export const SPACE_TYPE_IDS = Object.keys(SPACE_TYPES) as SpaceTypeId[];

// ============================================
// ICON CONFIGURATION
// ============================================
// Common Lucide icons for spaces - add new icons here!
export const COMMON_SPACE_ICONS = [
  'Square', 'Circle', 'Triangle', 'Laptop', 'Monitor', 'Computer',
  'Shield', 'Video', 'Stethoscope', 'Cross', 'Shirt', 'ChefHat',
  'HardHat', 'Anchor', 'Hammer', 'Plane', 'Wrench', 'Package',
  'Music', 'Archive', 'Book', 'Lightbulb', 'Beaker', 'Microscope',
  'Palette', 'Camera', 'Tv', 'Speaker', 'Headphones', 'Users',
  'User', 'Briefcase', 'Coffee', 'Home', 'Building', 'School',
  'Bath', 'Droplet', 'Footprints', 'MoveVertical', 'Toilet'
] as const;
