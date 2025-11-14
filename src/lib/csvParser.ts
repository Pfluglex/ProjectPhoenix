import type { SpaceDefinition, SpaceInstance, SpaceCSVRow } from '../types';

/**
 * Parse CSV text into SpaceDefinition objects (templates)
 */
export function parseSpacesCSV(csvText: string): SpaceDefinition[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  const definitions: SpaceDefinition[] = [];

  // Process each line (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line || line.split(',').every(cell => !cell.trim())) {
      continue;
    }

    const values = line.split(',');
    const row: Partial<SpaceCSVRow> = {};

    // Map values to headers
    headers.forEach((header, index) => {
      row[header.trim() as keyof SpaceCSVRow] = values[index]?.trim() || '';
    });

    // Skip if no ID or name
    if (!row.id || !row.name) continue;

    // Parse dimensions
    const width = parseFloat(row.width_Actual || '0');
    const depth = parseFloat(row.depth_Actual || '0');
    const height = parseFloat(row.height_actual || '12'); // default 12' ceiling

    // Skip if invalid dimensions
    if (width === 0 || depth === 0) continue;

    // Get category, color, and type from CSV
    const category = (row.Cat || 'generic').toLowerCase();
    const color = row.color || '#9CA3AF';
    const type = (row.type || 'generic') as 'program' | 'circulation' | 'support' | 'generic';

    definitions.push({
      id: row.id,
      category,
      name: row.name,
      width,
      depth,
      height,
      color,
      type
    });
  }

  return definitions;
}

/**
 * Load space definitions from CSV file
 */
export async function loadSpacesFromCSV(filePath: string): Promise<SpaceDefinition[]> {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();
    return parseSpacesCSV(csvText);
  } catch (error) {
    console.error('Failed to load spaces CSV:', error);
    return [];
  }
}

/**
 * Create a space instance from a definition
 * This is used when placing a space on the canvas
 */
export function createSpaceInstance(
  definition: SpaceDefinition,
  position: { x: number; y: number; z: number },
  instanceNumber: number = 1
): SpaceInstance {
  return {
    id: definition.id,
    templateId: definition.id,
    instanceId: `${definition.id}-instance-${instanceNumber}`,
    category: definition.category,
    name: definition.name,
    position,
    width: definition.width,
    depth: definition.depth,
    height: definition.height,
    rotation: 0,
    color: definition.color,
    type: definition.type
  };
}

/**
 * Get summary statistics from space definitions
 */
export function getSpacesSummary(spaces: SpaceDefinition[]) {
  const totalSF = spaces.reduce((sum, space) => sum + (space.width * space.depth), 0);
  const categories = [...new Set(spaces.map(s => s.category))];
  const byCategory = categories.map(cat => ({
    category: cat,
    count: spaces.filter(s => s.category === cat).length,
    sf: spaces.filter(s => s.category === cat).reduce((sum, s) => sum + (s.width * s.depth), 0)
  }));

  return {
    totalSpaces: spaces.length,
    totalSF,
    categories: byCategory
  };
}
