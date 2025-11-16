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

    // Get type and icon from CSV
    const type = (row.type || 'generic') as 'technology' | 'trades' | 'band' | 'systems' | 'admin' | 'service' | 'generic';
    const icon = row.icon || 'Square'; // Default icon

    definitions.push({
      id: row.id,
      name: row.name,
      width,
      depth,
      height,
      type,
      icon
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
    name: definition.name,
    position,
    width: definition.width,
    depth: definition.depth,
    height: definition.height,
    rotation: 0,
    type: definition.type,
    icon: definition.icon,
    level: 1
  };
}

/**
 * Get summary statistics from space definitions
 */
export function getSpacesSummary(spaces: SpaceDefinition[]) {
  const totalSF = spaces.reduce((sum, space) => sum + (space.width * space.depth), 0);
  const types = [...new Set(spaces.map(s => s.type))];
  const byType = types.map(type => ({
    type,
    count: spaces.filter(s => s.type === type).length,
    sf: spaces.filter(s => s.type === type).reduce((sum, s) => sum + (s.width * s.depth), 0)
  }));

  return {
    totalSpaces: spaces.length,
    totalSF,
    types: byType
  };
}

/**
 * Project type for CSV storage
 */
export interface Project {
  id: string;
  name: string;
  timestamp: string;
  spaceCount: number;
}

/**
 * Project Space type for CSV storage
 */
export interface ProjectSpace {
  project_id: string;
  space_instance_id: string;
  template_id: string;
  id: string;
  name: string;
  width: number;
  depth: number;
  height: number;
  type: string;
  icon: string;
  position_x: number;
  position_y: number;
  position_z: number;
  rotation: number;
}

/**
 * Load projects from CSV file
 */
export async function loadProjectsFromCSV(): Promise<Project[]> {
  try {
    const response = await fetch('/data/projects.csv');
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');

    if (lines.length < 2) return [];

    const projects: Project[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, ''));
      if (!values || values.length < 4) continue;

      projects.push({
        id: values[0],
        name: values[1],
        timestamp: values[2],
        spaceCount: parseInt(values[3])
      });
    }

    return projects;
  } catch (error) {
    console.error('Failed to load projects CSV:', error);
    return [];
  }
}

/**
 * Load project spaces from CSV file
 */
export async function loadProjectSpacesFromCSV(): Promise<ProjectSpace[]> {
  try {
    const response = await fetch('/data/spaces.csv');
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');

    if (lines.length < 2) return [];

    const spaces: ProjectSpace[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, ''));
      if (!values || values.length < 15) continue;

      spaces.push({
        project_id: values[0],
        space_instance_id: values[1],
        template_id: values[2],
        id: values[3],
        name: values[4],
        width: parseFloat(values[5]),
        depth: parseFloat(values[6]),
        height: parseFloat(values[7]),
        type: values[8],
        icon: values[9],
        position_x: parseFloat(values[10]),
        position_y: parseFloat(values[11]),
        position_z: parseFloat(values[12]),
        rotation: parseFloat(values[13])
      });
    }

    return spaces;
  } catch (error) {
    console.error('Failed to load spaces CSV:', error);
    return [];
  }
}

/**
 * Convert projects array to CSV string
 */
export function projectsToCSV(projects: Project[]): string {
  const header = 'Project ID,Project Name,Timestamp,Space Count';
  const rows = projects.map(p =>
    `"${p.id}","${p.name}","${p.timestamp}",${p.spaceCount}`
  );
  return [header, ...rows].join('\n');
}

/**
 * Convert project spaces array to CSV string
 */
export function projectSpacesToCSV(spaces: ProjectSpace[]): string {
  const header = 'Project ID,Space Instance ID,Template ID,ID,Name,Width,Depth,Height,Type,Icon,Position X,Position Y,Position Z,Rotation';
  const rows = spaces.map(s =>
    `"${s.project_id}","${s.space_instance_id}","${s.template_id}","${s.id}","${s.name}",${s.width},${s.depth},${s.height},"${s.type}","${s.icon}",${s.position_x},${s.position_y},${s.position_z},${s.rotation}`
  );
  return [header, ...rows].join('\n');
}
