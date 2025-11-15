// API configuration
const API_BASE_URL = 'https://phoenix.pflugerarchitects.com/api';

/**
 * Get auth headers with token from localStorage
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export interface Project {
  id: string;
  name: string;
  timestamp: string;
  space_count: number;
}

export interface ProjectSpace {
  project_id: string;
  space_instance_id: string;
  template_id: string;
  id: string;
  name: string;
  width: number;
  depth: number;
  height: number;
  icon: string;
  type: 'technology' | 'trades' | 'band' | 'systems' | 'admin' | 'service' | 'generic' | 'egress';
  position_x: number;
  position_y: number;
  position_z: number;
  rotation: number;
  level: number; // Building level (1-4)
}

export interface Measurement {
  id: string;
  point1: { x: number; z: number };
  point2: { x: number; z: number };
}

/**
 * Save a project to the database
 */
export async function saveProject(project: Project, spaces: ProjectSpace[], measurements: Measurement[] = []): Promise<{ success: boolean; project_id?: string; error?: string }> {
  try {
    const payload = {
      project: {
        id: project.id,
        name: project.name,
        timestamp: project.timestamp,
        spaceCount: project.space_count
      },
      spaces,
      measurements
    };

    console.log('Sending to API:', payload);

    const response = await fetch(`${API_BASE_URL}/projects.php?action=save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('API response:', data);

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to save project' };
    }

    return { success: true, project_id: data.project_id };
  } catch (error) {
    console.error('Error saving project:', error);
    return { success: false, error: 'Network error while saving project' };
  }
}

/**
 * Load a project from the database
 */
export async function loadProject(projectId: string): Promise<{ success: boolean; project?: Project; spaces?: ProjectSpace[]; measurements?: Measurement[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects.php?action=load&project_id=${encodeURIComponent(projectId)}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to load project' };
    }

    return {
      success: true,
      project: data.project,
      spaces: data.spaces,
      measurements: data.measurements
    };
  } catch (error) {
    console.error('Error loading project:', error);
    return { success: false, error: 'Network error while loading project' };
  }
}

/**
 * List all projects from the database
 */
export async function listProjects(): Promise<{ success: boolean; projects?: Project[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects.php?action=list`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to list projects' };
    }

    return {
      success: true,
      projects: data.projects
    };
  } catch (error) {
    console.error('Error listing projects:', error);
    return { success: false, error: 'Network error while listing projects' };
  }
}

/**
 * Delete a project from the database
 */
export async function deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects.php?action=delete&project_id=${encodeURIComponent(projectId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to delete project' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: 'Network error while deleting project' };
  }
}

// ========================================
// SPACE LIBRARY API
// ========================================

export interface SpaceDefinition {
  id: string;
  name: string;
  width: number;
  depth: number;
  height: number;
  type: 'technology' | 'trades' | 'band' | 'systems' | 'admin' | 'service' | 'generic' | 'egress';
  icon: string;
}

/**
 * List all spaces from the library
 */
export async function listSpaces(): Promise<{ success: boolean; spaces?: SpaceDefinition[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/spaces.php?action=list`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to list spaces' };
    }

    return {
      success: true,
      spaces: data.spaces
    };
  } catch (error) {
    console.error('Error listing spaces:', error);
    return { success: false, error: 'Network error while listing spaces' };
  }
}

/**
 * Get a single space by ID
 */
export async function getSpace(spaceId: string): Promise<{ success: boolean; space?: SpaceDefinition; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/spaces.php?action=get&id=${encodeURIComponent(spaceId)}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to get space' };
    }

    return {
      success: true,
      space: data.space
    };
  } catch (error) {
    console.error('Error getting space:', error);
    return { success: false, error: 'Network error while getting space' };
  }
}

/**
 * Create a new space in the library
 */
export async function createSpace(space: SpaceDefinition): Promise<{ success: boolean; space_id?: string; error?: string }> {
  try {
    console.log('Creating space:', space);
    console.log('API URL:', `${API_BASE_URL}/spaces.php?action=create`);

    const response = await fetch(`${API_BASE_URL}/spaces.php?action=create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(space)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));

    // Get the raw text first
    const text = await response.text();
    console.log('Response text:', text);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return { success: false, error: `Server returned invalid JSON. Response: ${text.substring(0, 200)}` };
    }

    console.log('Response data:', data);

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create space' };
    }

    return { success: true, space_id: data.space_id };
  } catch (error) {
    console.error('Error creating space:', error);
    return { success: false, error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Update an existing space
 */
export async function updateSpace(spaceId: string, updates: Partial<SpaceDefinition>): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/spaces.php?action=update`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id: spaceId, ...updates })
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update space' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating space:', error);
    return { success: false, error: 'Network error while updating space' };
  }
}

/**
 * Delete a space from the library
 */
export async function deleteSpace(spaceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/spaces.php?action=delete&id=${encodeURIComponent(spaceId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to delete space' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting space:', error);
    return { success: false, error: 'Network error while deleting space' };
  }
}
