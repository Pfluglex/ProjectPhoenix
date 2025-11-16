import { Ruler, Sun, Calendar, Save, FolderOpen, Trash2, Undo, FileText } from 'lucide-react';
import { useTheme } from '../../System/ThemeManager';
import { useState, useEffect } from 'react';

interface ToolsContentProps {
  snapInterval?: number;
  onSnapIntervalChange?: (interval: number) => void;
  currentLevel?: number;
  onLevelChange?: (level: number) => void;
  labelMode?: 'text' | 'icon';
  onLabelModeChange?: (mode: 'text' | 'icon') => void;
  cameraAngle?: 45 | 90;
  onCameraAngleChange?: (angle: 45 | 90) => void;
  placedSpaces?: any[];
  onSaveProject?: () => void;
  onClearCanvas?: () => void;
  onLoadProject?: (projectId?: string) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  measureMode?: boolean;
  onMeasureModeChange?: (enabled: boolean) => void;
  measurementCount?: number;
  onClearAllMeasurements?: () => void;
  presentationMode?: boolean;
  onPresentationModeChange?: (enabled: boolean) => void;
  timeOfDay?: number; // 0-24 hours
  onTimeOfDayChange?: (hour: number) => void;
  monthOfYear?: number; // 1-12 months
  onMonthOfYearChange?: (month: number) => void;
  showGrid?: boolean;
  onShowGridChange?: (show: boolean) => void;
  showLabels?: boolean;
  onShowLabelsChange?: (show: boolean) => void;
  showMeasurements?: boolean;
  onShowMeasurementsChange?: (show: boolean) => void;
  currentProjectId?: string | null;
  currentProjectName?: string;
}

export function ToolsContent({
  snapInterval = 5,
  onSnapIntervalChange,
  currentLevel = 1,
  onLevelChange,
  labelMode = 'text',
  onLabelModeChange,
  cameraAngle = 90,
  onCameraAngleChange,
  placedSpaces = [],
  onSaveProject,
  onClearCanvas,
  onLoadProject,
  onUndo,
  canUndo = false,
  measureMode = false,
  onMeasureModeChange,
  measurementCount = 0,
  onClearAllMeasurements,
  presentationMode = false,
  onPresentationModeChange,
  timeOfDay = 12,
  onTimeOfDayChange,
  monthOfYear = 6,
  onMonthOfYearChange,
  showGrid = true,
  onShowGridChange,
  showLabels = true,
  onShowLabelsChange,
  showMeasurements = true,
  onShowMeasurementsChange,
  currentProjectId = null,
  currentProjectName = '',
}: ToolsContentProps) {
  const { } = useTheme();

  // Get project name from localStorage if not provided
  const [displayProjectName, setDisplayProjectName] = useState(currentProjectName);

  useEffect(() => {
    if (currentProjectName) {
      setDisplayProjectName(currentProjectName);
    } else {
      // Try to get from localStorage
      const savedConfig = localStorage.getItem('project_config');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          setDisplayProjectName(config.projectName || 'New Project');
        } catch (error) {
          setDisplayProjectName('New Project');
        }
      } else {
        setDisplayProjectName('New Project');
      }
    }
  }, [currentProjectName]);

  // Helper to format hour display (12-hour format with AM/PM)
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  // Month names
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="p-4 space-y-3 overflow-y-auto">
      {/* Current Project Display */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wider">Current Project</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {displayProjectName}
              </p>
            </div>
          </div>
          {currentProjectId && (
            <span className="text-[10px] text-gray-500 font-mono">
              #{currentProjectId.slice(-6)}
            </span>
          )}
        </div>
      </div>

      {/* Project Actions Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Actions</h3>

        <div className="flex gap-2 justify-center">
          <button
            onClick={onSaveProject}
            disabled={placedSpaces.length === 0}
            className="flex items-center justify-center w-10 h-10 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: placedSpaces.length === 0 ? undefined : 'rgba(16, 185, 129, 0.5)',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              if (placedSpaces.length > 0) {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (placedSpaces.length > 0) {
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.5)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            title="Save Project"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            onClick={() => onLoadProject?.()}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.5)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Load Project"
          >
            <FolderOpen className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
                onClearCanvas?.();
              }
            }}
            disabled={placedSpaces.length === 0}
            className="flex items-center justify-center w-10 h-10 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: placedSpaces.length === 0 ? undefined : 'rgba(239, 68, 68, 0.5)',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              if (placedSpaces.length > 0) {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (placedSpaces.length > 0) {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.5)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            title="Clear Canvas"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center justify-center w-10 h-10 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: !canUndo ? undefined : 'rgba(139, 92, 246, 0.5)',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => {
              if (canUndo) {
                e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (canUndo) {
                e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.5)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            title="Undo"
          >
            <Undo className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200"></div>

      {/* Canvas Tools Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Canvas</h3>

        {/* Measure Tool */}
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1.5">
            <span>Measure Tool</span>
            <Ruler className="w-3.5 h-3.5 text-purple-500" />
          </label>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => onMeasureModeChange?.(!measureMode)}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: measureMode ? 'rgba(168, 85, 247, 1)' : 'rgba(168, 85, 247, 0.5)',
                color: '#ffffff',
                boxShadow: measureMode ? '0 2px 8px rgba(168, 85, 247, 0.3)' : undefined
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = measureMode ? 'rgba(168, 85, 247, 1)' : 'rgba(168, 85, 247, 0.5)';
                e.currentTarget.style.boxShadow = measureMode ? '0 2px 8px rgba(168, 85, 247, 0.3)' : 'none';
              }}
              title={measureMode ? 'Stop Measuring' : 'Start Measuring'}
            >
              <Ruler className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (measurementCount > 0 && window.confirm(`Clear all ${measurementCount} measurement(s)?`)) {
                  onClearAllMeasurements?.();
                }
              }}
              disabled={measurementCount === 0}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: measurementCount === 0 ? undefined : 'rgba(249, 115, 22, 0.5)',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                if (measurementCount > 0) {
                  e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(249, 115, 22, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (measurementCount > 0) {
                  e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.5)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              title={`Clear All Measurements${measurementCount > 0 ? ` (${measurementCount})` : ''}`}
            >
              <Trash2 className="w-5 h-5" />
              {measurementCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {measurementCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Snap to Grid - Compact */}
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
            <span>Snap to Grid</span>
            <span className="text-gray-500 text-[10px]">{snapInterval}'</span>
          </label>
          <input
            type="range"
            min="0"
            max="7"
            step="1"
            value={[1, 2.5, 5, 7.5, 10, 15, 20, 30].indexOf(snapInterval)}
            onChange={(e) => {
              const snapValues = [1, 2.5, 5, 7.5, 10, 15, 20, 30];
              onSnapIntervalChange?.(snapValues[Number(e.target.value)]);
            }}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[9px] text-gray-400 mt-0.5 px-0.5">
            <span>1'</span>
            <span>2.5'</span>
            <span>5'</span>
            <span>7.5'</span>
            <span>10'</span>
            <span>15'</span>
            <span>20'</span>
            <span>30'</span>
          </div>
        </div>

        {/* Building Level - Compact */}
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
            <span>Building Level</span>
            <span className="text-gray-500 text-[10px]">L{currentLevel} (Y={(currentLevel - 1) * 15}')</span>
          </label>
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            value={currentLevel}
            onChange={(e) => {
              onLevelChange?.(Number(e.target.value));
            }}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[9px] text-gray-400 mt-0.5 px-0.5">
            <span>L1</span>
            <span>L2</span>
            <span>L3</span>
            <span>L4</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200"></div>

      {/* View Controls Section - Moved to bottom with tighter spacing */}
      <div className="space-y-0.5">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">View</h3>

        {/* Isometric View Toggle - iOS 26 Style */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-gray-700">Isometric View</span>
          <button
            onClick={() => onCameraAngleChange?.(cameraAngle === 90 ? 45 : 90)}
            className={`relative inline-flex items-center transition-all duration-300 ${
              cameraAngle === 45 ? 'bg-green-500' : 'bg-gray-200'
            }`}
            style={{
              height: '23.25px',
              width: '52.5px',
              borderRadius: '11.625px',
              padding: '1.5px'
            }}
          >
            <span
              className={`inline-block transform bg-white transition-all duration-300 ${
                cameraAngle === 45 ? 'translate-x-[20.25px]' : 'translate-x-0'
              }`}
              style={{
                height: '20.25px',
                width: '30px',
                borderRadius: '10.125px',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15), 0 3px 1px rgba(0, 0, 0, 0.06)'
              }}
            />
          </button>
        </div>

        {/* Icon Labels Toggle - iOS 26 Style */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-gray-700">Icon Labels</span>
          <button
            onClick={() => onLabelModeChange?.(labelMode === 'text' ? 'icon' : 'text')}
            className={`relative inline-flex items-center transition-all duration-300 ${
              labelMode === 'icon' ? 'bg-green-500' : 'bg-gray-200'
            }`}
            style={{
              height: '23.25px',
              width: '52.5px',
              borderRadius: '11.625px',
              padding: '1.5px'
            }}
          >
            <span
              className={`inline-block transform bg-white transition-all duration-300 ${
                labelMode === 'icon' ? 'translate-x-[20.25px]' : 'translate-x-0'
              }`}
              style={{
                height: '20.25px',
                width: '30px',
                borderRadius: '10.125px',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15), 0 3px 1px rgba(0, 0, 0, 0.06)'
              }}
            />
          </button>
        </div>

        {/* Presentation Mode Toggle - iOS 26 Style */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-gray-700">Presentation Mode</span>
          <button
            onClick={() => onPresentationModeChange?.(!presentationMode)}
            className={`relative inline-flex items-center transition-all duration-300 ${
              presentationMode ? 'bg-green-500' : 'bg-gray-200'
            }`}
            style={{
              height: '23.25px',
              width: '52.5px',
              borderRadius: '11.625px',
              padding: '1.5px'
            }}
          >
            <span
              className={`inline-block transform bg-white transition-all duration-300 ${
                presentationMode ? 'translate-x-[20.25px]' : 'translate-x-0'
              }`}
              style={{
                height: '20.25px',
                width: '30px',
                borderRadius: '10.125px',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15), 0 3px 1px rgba(0, 0, 0, 0.06)'
              }}
            />
          </button>
        </div>

        {/* Show Grid Toggle - iOS 26 Style */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-gray-700">Show Grid</span>
          <button
            onClick={() => onShowGridChange?.(!showGrid)}
            className={`relative inline-flex items-center transition-all duration-300 ${
              showGrid ? 'bg-green-500' : 'bg-gray-200'
            }`}
            style={{
              height: '23.25px',
              width: '52.5px',
              borderRadius: '11.625px',
              padding: '1.5px'
            }}
          >
            <span
              className={`inline-block transform bg-white transition-all duration-300 ${
                showGrid ? 'translate-x-[20.25px]' : 'translate-x-0'
              }`}
              style={{
                height: '20.25px',
                width: '30px',
                borderRadius: '10.125px',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15), 0 3px 1px rgba(0, 0, 0, 0.06)'
              }}
            />
          </button>
        </div>

        {/* Show Labels Toggle - iOS 26 Style */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-gray-700">Show Labels</span>
          <button
            onClick={() => onShowLabelsChange?.(!showLabels)}
            className={`relative inline-flex items-center transition-all duration-300 ${
              showLabels ? 'bg-green-500' : 'bg-gray-200'
            }`}
            style={{
              height: '23.25px',
              width: '52.5px',
              borderRadius: '11.625px',
              padding: '1.5px'
            }}
          >
            <span
              className={`inline-block transform bg-white transition-all duration-300 ${
                showLabels ? 'translate-x-[20.25px]' : 'translate-x-0'
              }`}
              style={{
                height: '20.25px',
                width: '30px',
                borderRadius: '10.125px',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15), 0 3px 1px rgba(0, 0, 0, 0.06)'
              }}
            />
          </button>
        </div>

        {/* Show Measurements Toggle - iOS 26 Style */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs text-gray-700">Show Measurements</span>
          <button
            onClick={() => onShowMeasurementsChange?.(!showMeasurements)}
            className={`relative inline-flex items-center transition-all duration-300 ${
              showMeasurements ? 'bg-green-500' : 'bg-gray-200'
            }`}
            style={{
              height: '23.25px',
              width: '52.5px',
              borderRadius: '11.625px',
              padding: '1.5px'
            }}
          >
            <span
              className={`inline-block transform bg-white transition-all duration-300 ${
                showMeasurements ? 'translate-x-[20.25px]' : 'translate-x-0'
              }`}
              style={{
                height: '20.25px',
                width: '30px',
                borderRadius: '10.125px',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15), 0 3px 1px rgba(0, 0, 0, 0.06)'
              }}
            />
          </button>
        </div>

        {/* Time of Day Slider */}
        <div className="pt-1">
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Time of Day</span>
            </div>
            <span className="text-gray-500 text-[10px]">{formatHour(timeOfDay)}</span>
          </label>
          <input
            type="range"
            min="6"
            max="20"
            step="0.5"
            value={timeOfDay}
            onChange={(e) => onTimeOfDayChange?.(Number(e.target.value))}
            className="w-full h-1.5 bg-gradient-to-r from-blue-300 via-amber-300 to-orange-400 rounded-lg appearance-none cursor-pointer"
            style={{
              accentColor: '#F59E0B'
            }}
          />
          <div className="flex justify-between text-[9px] text-gray-400 mt-0.5 px-0.5">
            <span>6 AM</span>
            <span>10 AM</span>
            <span>2 PM</span>
            <span>6 PM</span>
            <span>8 PM</span>
          </div>
        </div>

        {/* Month of Year Slider */}
        <div className="pt-1">
          <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Month of Year</span>
            </div>
            <span className="text-gray-500 text-[10px]">{monthNames[monthOfYear - 1]}</span>
          </label>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            value={monthOfYear}
            onChange={(e) => onMonthOfYearChange?.(Number(e.target.value))}
            className="w-full h-1.5 bg-gradient-to-r from-blue-200 via-amber-100 to-blue-200 rounded-lg appearance-none cursor-pointer"
            style={{
              accentColor: '#3B82F6'
            }}
          />
          <div className="flex justify-between text-[9px] text-gray-400 mt-0.5 px-0.5">
            <span>Jan</span>
            <span>Apr</span>
            <span>Jul</span>
            <span>Oct</span>
            <span>Dec</span>
          </div>
        </div>
      </div>
    </div>
  );
}