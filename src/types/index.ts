// Grid fundamentals
export const GRID_MODULE = 1; // feet - base grid is 1 foot
export const SNAP_SIZES = [1, 5, 10]; // snap increments in feet

export interface GridPosition {
  x: number; // feet (not grid units!)
  y: number; // feet
  z: number; // floor level
}

export interface Space3D {
  id: string;
  category: string; // technology, trades, band, service, generic
  name: string;

  // Grid position (in feet)
  position: GridPosition;

  // Actual dimensions (in feet) - from CSV
  width: number; // width_Actual from CSV
  depth: number; // depth_Actual from CSV
  height: number; // height_actual from CSV (defaults to 12' if not specified)

  // Rotation (0, 90, 180, 270)
  rotation: 0 | 90 | 180 | 270;

  color: string;
  type: 'program' | 'circulation' | 'support' | 'generic';
}

// Raw CSV row structure
export interface SpaceCSVRow {
  id: string;
  Cat: string; // category
  name: string;
  width_Actual: string;
  depth_Actual: string;
  height_actual: string;
  color: string;
  type: string;
}

// Space definition from CSV (template)
export interface SpaceDefinition {
  id: string; // Template ID (e.g., "tech-001")
  category: string;
  name: string;
  width: number;
  depth: number;
  height: number;
  color: string;
  type: 'program' | 'circulation' | 'support' | 'generic';
}

// Instance of a space on the canvas (has unique instance ID)
export interface SpaceInstance extends Space3D {
  templateId: string; // References SpaceDefinition.id (e.g., "tech-001")
  instanceId: string; // Unique instance ID (e.g., "tech-001-instance-1")
}

export interface ProjectMetrics {
  // SF Totals
  totalSF: number;
  programSF: number;
  circulationSF: number;
  supportSF: number;

  // Budget
  budgetSF: number;
  overBudget: number;
  percentOverBudget: number;

  // Efficiency
  grossToNet: number; // Program / Total
  circulationFactor: number; // Circulation / Program
  supportRatio: number; // Support / Total

  // Form
  envelopeArea: number; // Square feet
  envelopePerimeter: number; // Linear feet
  envelopeRatio: number; // Perimeter / sqrt(Area)
  compactness: number; // 4πA / P²

  // Layout Quality
  adjacencyScore: number; // 0-100
  daylightAccess: number; // 0-1
  perimeterSpaces: number;

  // Status
  status: 'under' | 'at' | 'over' | 'critical';
}

export interface AdjacencyRule {
  space1: string;
  space2: string;
  importance: 'required' | 'preferred' | 'optional';
  points: number;
}

export type ActiveView = 'canvas' | 'library' | 'metrics' | 'settings';
