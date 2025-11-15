import { useState, useEffect } from 'react';
import { Canvas3D } from '../Canvas/Canvas3D';
import { SpacePalette } from '../Canvas/SpacePalette';
import { LoadProjectModal } from '../Canvas/LoadProjectModal';
import type { SpaceInstance } from '../../types';
import { saveProject, loadProject, type Project, type ProjectSpace } from '../../lib/api';

interface CanvasViewProps {
  isSidebarExpanded: boolean;
}

const TEMP_PROJECT_KEY = 'phoenix_temp_project';

export function CanvasView({ isSidebarExpanded }: CanvasViewProps) {
  const [canvasState, setCanvasState] = useState({
    position: { x: 0, y: 0 },
    zoom: 1.5,
  });
  const [draggedSpace, setDraggedSpace] = useState<any>(null); // Track space being dragged from palette
  const [placedSpaces, setPlacedSpaces] = useState<SpaceInstance[]>(() => {
    // Load from localStorage on initial mount
    try {
      const saved = localStorage.getItem(TEMP_PROJECT_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.spaces || [];
      }
    } catch (error) {
      console.error('Error loading temp project:', error);
    }
    return [];
  });
  const [snapInterval, setSnapInterval] = useState(5);
  const [labelMode, setLabelMode] = useState<'text' | 'icon'>('text');
  const [cameraAngle, setCameraAngle] = useState<45 | 90>(90);
  const [showLoadModal, setShowLoadModal] = useState(false);

  // Save to localStorage whenever placedSpaces changes
  useEffect(() => {
    try {
      const tempProject = {
        spaces: placedSpaces,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(TEMP_PROJECT_KEY, JSON.stringify(tempProject));
    } catch (error) {
      console.error('Error saving temp project:', error);
    }
  }, [placedSpaces]);

  const handleSpaceDrop = (space: SpaceInstance) => {
    setPlacedSpaces((prev) => [...prev, space]);
  };

  const handleSaveProject = async () => {
    const projectName = prompt('Enter a name for this project:');
    if (!projectName) return;

    const projectId = `proj_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Create project object
    const newProject: Project = {
      id: projectId,
      name: projectName,
      timestamp: timestamp,
      space_count: placedSpaces.length,
    };

    // Create spaces array
    const newSpaces: ProjectSpace[] = placedSpaces.map(space => ({
      project_id: projectId,
      space_instance_id: space.instanceId,
      template_id: space.templateId,
      id: space.id,
      name: space.name,
      width: space.width,
      depth: space.depth,
      height: space.height,
      icon: space.icon,
      type: space.type,
      position_x: space.position.x,
      position_y: space.position.y,
      position_z: space.position.z,
      rotation: space.rotation || 0,
    }));

    // Save to database via API
    const result = await saveProject(newProject, newSpaces);

    if (result.success) {
      alert(`Project "${projectName}" saved successfully!`);
    } else {
      alert(`Failed to save project: ${result.error}`);
    }
  };

  const handleClearCanvas = () => {
    setPlacedSpaces([]);
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      // Load project from API
      const result = await loadProject(projectId);

      if (!result.success || !result.spaces) {
        alert(`Failed to load project: ${result.error}`);
        return;
      }

      // Convert to SpaceInstance format
      const loadedSpaces: SpaceInstance[] = result.spaces.map((s) => ({
        instanceId: s.space_instance_id,
        templateId: s.template_id,
        id: s.id,
        name: s.name,
        width: s.width,
        depth: s.depth,
        height: s.height,
        icon: s.icon,
        type: s.type,
        position: {
          x: s.position_x,
          y: s.position_y,
          z: s.position_z
        },
        rotation: (s.rotation === 0 || s.rotation === 90 || s.rotation === 180 || s.rotation === 270) ? s.rotation : 0
      }));

      // Confirm if replacing existing spaces
      if (placedSpaces.length > 0) {
        if (window.confirm(`This will replace ${placedSpaces.length} existing space(s) with ${loadedSpaces.length} loaded space(s). Continue?`)) {
          setPlacedSpaces(loadedSpaces);
          alert(`Successfully loaded ${loadedSpaces.length} space(s)!`);
        }
      } else {
        setPlacedSpaces(loadedSpaces);
        alert(`Successfully loaded ${loadedSpaces.length} space(s)!`);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Error loading project. Please try again.');
    }
  };

  const handleSpaceMove = (instanceId: string, x: number, y: number, z: number = 0) => {
    setPlacedSpaces((prev) =>
      prev.map((space) =>
        space.instanceId === instanceId
          ? { ...space, position: { x, y, z } }
          : space
      )
    );
  };

  const handleSpaceTransform = (
    instanceId: string,
    position: { x: number; y: number; z: number },
    rotation: number,
    scale: { x: number; y: number; z: number }
  ) => {
    setPlacedSpaces((prev) =>
      prev.map((space) =>
        space.instanceId === instanceId
          ? {
              ...space,
              position,
              rotation: (rotation === 0 || rotation === 90 || rotation === 180 || rotation === 270) ? rotation : 0,
              width: space.width * scale.x,
              depth: space.depth * scale.z,
              height: space.height * scale.y,
            }
          : space
      )
    );
  };

  const handleSpaceDelete = (instanceId: string) => {
    setPlacedSpaces((prev) => prev.filter((space) => space.instanceId !== instanceId));
  };

  return (
    <div className="w-full h-full relative">
      <Canvas3D
        onCanvasStateChange={setCanvasState}
        placedSpaces={placedSpaces}
        onSpaceDrop={handleSpaceDrop}
        onSpaceMove={handleSpaceMove}
        onSpaceTransform={handleSpaceTransform}
        onSpaceDelete={handleSpaceDelete}
        snapInterval={snapInterval}
        labelMode={labelMode}
        cameraAngle={cameraAngle}
        draggedSpace={draggedSpace}
      />
      <SpacePalette
        isSidebarExpanded={isSidebarExpanded}
        canvasInfo={canvasState}
        snapInterval={snapInterval}
        onSnapIntervalChange={setSnapInterval}
        labelMode={labelMode}
        onLabelModeChange={setLabelMode}
        cameraAngle={cameraAngle}
        onCameraAngleChange={setCameraAngle}
        placedSpaces={placedSpaces}
        onSaveProject={handleSaveProject}
        onLoadProject={() => setShowLoadModal(true)}
        onClearCanvas={handleClearCanvas}
        onDragStart={setDraggedSpace}
        onDragEnd={() => setDraggedSpace(null)}
      />

      {/* Load Project Modal */}
      <LoadProjectModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onSelectProject={handleLoadProject}
      />
    </div>
  );
}
