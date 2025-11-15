// API configuration
const API_BASE_URL = 'https://phoenix.pflugerarchitects.com/api';

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
  category: string;
  width: number;
  depth: number;
  height: number;
  icon: string;
  type: 'program' | 'circulation' | 'support' | 'generic';
  position_x: number;
  position_y: number;
  position_z: number;
  rotation: number;
}

/**
 * Save a project to the database
 */
export async function saveProject(project: Project, spaces: ProjectSpace[]): Promise<{ success: boolean; project_id?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects.php?action=save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project: {
          id: project.id,
          name: project.name,
          timestamp: project.timestamp,
          spaceCount: project.space_count
        },
        spaces
      })
    });

    const data = await response.json();

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
export async function loadProject(projectId: string): Promise<{ success: boolean; project?: Project; spaces?: ProjectSpace[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects.php?action=load&project_id=${encodeURIComponent(projectId)}`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to load project' };
    }

    return {
      success: true,
      project: data.project,
      spaces: data.spaces
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
    const response = await fetch(`${API_BASE_URL}/projects.php?action=list`);
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
      method: 'DELETE'
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
  category: string;
  name: string;
  width: number;
  depth: number;
  height: number;
  type: 'program' | 'circulation' | 'support' | 'generic';
  icon: string;
}

/**
 * List all spaces from the library
 */
export async function listSpaces(): Promise<{ success: boolean; spaces?: SpaceDefinition[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/spaces.php?action=list`);
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
    const response = await fetch(`${API_BASE_URL}/spaces.php?action=get&id=${encodeURIComponent(spaceId)}`);
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
    const response = await fetch(`${API_BASE_URL}/spaces.php?action=create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(space)
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create space' };
    }

    return { success: true, space_id: data.space_id };
  } catch (error) {
    console.error('Error creating space:', error);
    return { success: false, error: 'Network error while creating space' };
  }
}

/**
 * Update an existing space
 */
export async function updateSpace(spaceId: string, updates: Partial<SpaceDefinition>): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/spaces.php?action=update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      method: 'DELETE'
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
