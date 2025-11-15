import { useState, useEffect } from 'react';
import { listProjects, deleteProject, type Project } from '../../lib/api';
import { FolderOpen, Calendar, Layers, Trash2 } from 'lucide-react';

export function ProjectLibraryView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectsList();
  }, []);

  const loadProjectsList = async () => {
    try {
      const result = await listProjects();
      if (result.success && result.projects) {
        setProjects(result.projects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await deleteProject(projectId);
      if (result.success) {
        // Reload the project list
        setLoading(true);
        await loadProjectsList();
        alert(`Project "${projectName}" deleted successfully!`);
      } else {
        alert(`Failed to delete project: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-50 p-8 flex items-center justify-center">
        <p className="text-gray-500">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Project Library</h1>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-500 mb-2">No projects yet</p>
            <p className="text-base text-gray-400">Create your first project from the Canvas view</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <FolderOpen className="w-8 h-8 text-blue-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">#{project.id.slice(-6)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id, project.name);
                      }}
                      className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-3 truncate">
                  {project.name}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Layers className="w-4 h-4 mr-2" />
                    <span>{project.space_count} space{project.space_count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(project.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
