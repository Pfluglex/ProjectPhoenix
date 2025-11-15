import { useState, useEffect } from 'react';
import { Canvas3D } from '../Canvas/Canvas3D';
import { LibraryPanel } from '../Canvas/LibraryPanel';
import { ToolsPanel } from '../Canvas/ToolsPanel';
import { PropertiesPanel } from '../Canvas/PropertiesPanel';
import { LoadProjectModal } from '../Canvas/LoadProjectModal';
import type { PanelType } from '../Canvas/PanelDots';
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
  const [currentLevel, setCurrentLevel] = useState(1); // Building level (1-4)
  const [labelMode, setLabelMode] = useState<'text' | 'icon'>('text');
  const [cameraAngle, setCameraAngle] = useState<45 | 90>(90);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<Set<string>>(new Set());
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<Array<{ x: number; z: number }>>([]);
  const [measurements, setMeasurements] = useState<Array<{ id: string; point1: { x: number; z: number }; point2: { x: number; z: number } }>>([]);
  const [presentationMode, setPresentationMode] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelType>('library');
  const [timeOfDay, setTimeOfDay] = useState(12); // 12 PM (noon)
  const [monthOfYear, setMonthOfYear] = useState(6); // June

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
    console.log('✅ [CANVASVIEW] Space dropped and added to state:', space.name, '| Position:', space.position, '| Level:', space.level);
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
      level: space.level || 1, // Default to level 1 if not set
    }));

    // Save to database via API (now includes measurements)
    console.log('Saving project with measurements:', measurements);
    const result = await saveProject(newProject, newSpaces, measurements);

    if (result.success) {
      alert(`Project "${projectName}" saved successfully with ${placedSpaces.length} space(s) and ${measurements.length} measurement(s)!`);
    } else {
      alert(`Failed to save project: ${result.error}`);
    }
  };

  const handleClearCanvas = () => {
    setPlacedSpaces([]);
    setMeasurements([]);
    setMeasurePoints([]);
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
        rotation: (s.rotation === 0 || s.rotation === 90 || s.rotation === 180 || s.rotation === 270) ? s.rotation : 0,
        level: s.level || 1 // Default to level 1 for backward compatibility
      }));

      // Load measurements if they exist
      const loadedMeasurements = result.measurements || [];

      // Confirm if replacing existing content
      const totalExisting = placedSpaces.length + measurements.length;

      if (totalExisting > 0) {
        if (window.confirm(`This will replace ${placedSpaces.length} space(s) and ${measurements.length} measurement(s) with ${loadedSpaces.length} space(s) and ${loadedMeasurements.length} measurement(s). Continue?`)) {
          setPlacedSpaces(loadedSpaces);
          setMeasurements(loadedMeasurements);
          alert(`Successfully loaded ${loadedSpaces.length} space(s) and ${loadedMeasurements.length} measurement(s)!`);
        }
      } else {
        setPlacedSpaces(loadedSpaces);
        setMeasurements(loadedMeasurements);
        alert(`Successfully loaded ${loadedSpaces.length} space(s) and ${loadedMeasurements.length} measurement(s)!`);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Error loading project. Please try again.');
    }
  };

  const handleSpaceMove = (instanceId: string, x: number, y: number, z: number = 0) => {
    console.log('🔧 [CANVASVIEW] handleSpaceMove called | instanceId:', instanceId, '| x:', x, '| y:', y, '| z:', z);

    // If the moved space is selected and there are multiple selected spaces, move all of them
    if (selectedSpaceIds.has(instanceId) && selectedSpaceIds.size > 1) {
      // Find the space being dragged
      const draggedSpace = placedSpaces.find(s => s.instanceId === instanceId);
      if (!draggedSpace) return;

      console.log('   → Moving multiple spaces (group drag)');

      // Calculate the delta from the dragged space's current position
      const deltaX = x - draggedSpace.position.x;
      const deltaZ = z - draggedSpace.position.z;

      // Move all selected spaces by the same delta
      setPlacedSpaces((prev) =>
        prev.map((space) =>
          selectedSpaceIds.has(space.instanceId)
            ? {
                ...space,
                position: {
                  x: space.position.x + deltaX,
                  y: space.position.y,
                  z: space.position.z + deltaZ
                }
              }
            : space
        )
      );
    } else {
      // Normal single space move
      console.log('   → Moving single space | Setting position to:', { x, y, z });
      setPlacedSpaces((prev) =>
        prev.map((space) =>
          space.instanceId === instanceId
            ? { ...space, position: { x, y, z } }
            : space
        )
      );
    }
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
    // Remove from selection if it was selected
    setSelectedSpaceIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(instanceId);
      return newSet;
    });
  };

  const handleToggleSelection = (instanceId: string) => {
    setSelectedSpaceIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(instanceId)) {
        newSet.delete(instanceId);
      } else {
        newSet.add(instanceId);
      }
      return newSet;
    });
  };

  const handleClearSelection = () => {
    setSelectedSpaceIds(new Set());
  };

  const handleMeasureClick = (x: number, z: number) => {
    if (measurePoints.length === 0) {
      // First point
      setMeasurePoints([{ x, z }]);
    } else if (measurePoints.length === 1) {
      // Second point - save measurement and add second point to array
      const newMeasurement = {
        id: `measure_${Date.now()}`,
        point1: measurePoints[0],
        point2: { x, z }
      };
      setMeasurements((prev) => [...prev, newMeasurement]);
      setMeasurePoints([...measurePoints, { x, z }]); // Keep both points to show completed state
    } else if (measurePoints.length === 2) {
      // Third click - start new measurement
      setMeasurePoints([{ x, z }]);
    }
  };

  const handleClearMeasurement = () => {
    setMeasurePoints([]);
  };

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter(m => m.id !== id));
  };

  const handleClearAllMeasurements = () => {
    setMeasurements([]);
    setMeasurePoints([]);
  };

  // ESC key to clear selection and current measurement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClearSelection();
        handleClearMeasurement(); // Only clears current measurement, not all
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        currentLevel={currentLevel}
        labelMode={labelMode}
        cameraAngle={cameraAngle}
        draggedSpace={draggedSpace}
        selectedSpaceIds={selectedSpaceIds}
        onToggleSelection={handleToggleSelection}
        measureMode={measureMode}
        measurePoints={measurePoints}
        measurements={measurements}
        onMeasureClick={handleMeasureClick}
        onDeleteMeasurement={handleDeleteMeasurement}
        presentationMode={presentationMode}
        timeOfDay={timeOfDay}
        monthOfYear={monthOfYear}
      />

      {/* Library Panel */}
      <LibraryPanel
        isSidebarExpanded={isSidebarExpanded}
        onDragStart={setDraggedSpace}
        onDragEnd={() => setDraggedSpace(null)}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      />

      {/* Tools Panel */}
      <ToolsPanel
        isSidebarExpanded={isSidebarExpanded}
        snapInterval={snapInterval}
        onSnapIntervalChange={setSnapInterval}
        currentLevel={currentLevel}
        onLevelChange={setCurrentLevel}
        labelMode={labelMode}
        onLabelModeChange={setLabelMode}
        cameraAngle={cameraAngle}
        onCameraAngleChange={setCameraAngle}
        placedSpaces={placedSpaces}
        onSaveProject={handleSaveProject}
        onLoadProject={() => setShowLoadModal(true)}
        onClearCanvas={handleClearCanvas}
        measureMode={measureMode}
        onMeasureModeChange={setMeasureMode}
        measurementCount={measurements.length}
        onClearAllMeasurements={handleClearAllMeasurements}
        presentationMode={presentationMode}
        onPresentationModeChange={setPresentationMode}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        timeOfDay={timeOfDay}
        onTimeOfDayChange={setTimeOfDay}
        monthOfYear={monthOfYear}
        onMonthOfYearChange={setMonthOfYear}
      />

      {/* Properties Panel */}
      <PropertiesPanel
        isSidebarExpanded={isSidebarExpanded}
        placedSpaces={placedSpaces}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
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
