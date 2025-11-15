import { motion } from 'framer-motion';
import { Ruler, Sun, Calendar } from 'lucide-react';
import { useTheme } from '../System/ThemeManager';
import { PanelDots, type PanelType } from './PanelDots';

interface ToolsPanelProps {
  isSidebarExpanded: boolean;
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
  measureMode?: boolean;
  onMeasureModeChange?: (enabled: boolean) => void;
  measurementCount?: number;
  onClearAllMeasurements?: () => void;
  presentationMode?: boolean;
  onPresentationModeChange?: (enabled: boolean) => void;
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
  timeOfDay?: number; // 0-24 hours
  onTimeOfDayChange?: (hour: number) => void;
  monthOfYear?: number; // 1-12 months
  onMonthOfYearChange?: (month: number) => void;
}

export function ToolsPanel({
  isSidebarExpanded,
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
  measureMode = false,
  onMeasureModeChange,
  measurementCount = 0,
  onClearAllMeasurements,
  presentationMode = false,
  onPresentationModeChange,
  activePanel,
  onPanelChange,
  timeOfDay = 12,
  onTimeOfDayChange,
  monthOfYear = 6,
  onMonthOfYearChange,
}: ToolsPanelProps) {
  const { componentThemes, colors } = useTheme();
  const theme = componentThemes.canvasPalette.light;

  // Helper to format hour display (12-hour format with AM/PM)
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  // Month names
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate left offset (same position as Library - they stack)
  const leftOffset = isSidebarExpanded
    ? 'calc(280px + 2rem + 1rem)' // sidebar + gap (same as library)
    : 'calc(80px + 2rem + 1rem)';

  // Determine if this panel is active
  const isActive = activePanel === 'tools';

  return (
    <motion.div
      className={`absolute top-4 w-72 ${theme.container.bg} ${theme.container.backdropBlur} rounded-2xl ${theme.container.shadow} flex flex-col`}
      style={{
        height: 'calc(100vh - 2rem)',
        zIndex: isActive ? 20 : 10,
        pointerEvents: isActive ? 'auto' : 'none',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'rgba(245, 158, 11, 0.2)' // Amber with 20% opacity
      }}
      initial={false}
      animate={{
        left: leftOffset,
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.95
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 border-b border-gray-200"
        style={{
          backgroundColor: 'rgba(245, 158, 11, 0.05)' // Amber with 5% opacity
        }}
      >
        <div className="py-3 px-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Tools</h2>
          <PanelDots activePanel={activePanel} onPanelChange={onPanelChange} />
        </div>
      </div>

      {/* Tools Content */}
      <div className="p-4 space-y-3">
        {/* View Controls Section */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">View</h3>

          {/* Isometric View Toggle - Compact */}
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-gray-700">Isometric View</span>
            <button
              onClick={() => onCameraAngleChange?.(cameraAngle === 90 ? 45 : 90)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                cameraAngle === 45 ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  cameraAngle === 45 ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
              />
            </button>
          </div>

          {/* Icon Labels Toggle - Compact */}
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-gray-700">Icon Labels</span>
            <button
              onClick={() => onLabelModeChange?.(labelMode === 'text' ? 'icon' : 'text')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                labelMode === 'icon' ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  labelMode === 'icon' ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
              />
            </button>
          </div>

          {/* Presentation Mode Toggle - Compact */}
          <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-gray-700">Presentation Mode</span>
            <button
              onClick={() => onPresentationModeChange?.(!presentationMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                presentationMode ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  presentationMode ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
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

        <div className="border-t border-gray-200"></div>

        {/* Canvas Tools Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Canvas</h3>

          {/* Measure Tool */}
          <div>
            <label className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1.5">
              <span>Measure Tool</span>
              <span className="text-gray-500 text-[10px]">{measureMode ? 'On' : 'Off'} {measurementCount > 0 && `(${measurementCount})`}</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onMeasureModeChange?.(!measureMode)}
                className={`flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  measureMode
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                {measureMode ? 'Measuring' : 'Measure'}
              </button>
              {measurementCount > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm(`Clear all ${measurementCount} measurement(s)?`)) {
                      onClearAllMeasurements?.();
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  title="Clear All Measurements"
                >
                  Clear
                </button>
              )}
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

        {/* Project Actions Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Project</h3>

          <div className="flex gap-2">
            <button
              onClick={onSaveProject}
              disabled={placedSpaces.length === 0}
              className="flex-1 text-white px-2.5 py-2 rounded-md text-xs font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              style={{
                backgroundColor: placedSpaces.length === 0 ? undefined : colors.secondary.darkBlue,
              }}
              onMouseEnter={(e) => {
                if (placedSpaces.length > 0) {
                  e.currentTarget.style.opacity = '0.85';
                }
              }}
              onMouseLeave={(e) => {
                if (placedSpaces.length > 0) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              Save
            </button>
            <button
              onClick={() => onLoadProject?.()}
              className="flex-1 text-white px-2.5 py-2 rounded-md text-xs font-medium transition-colors"
              style={{
                backgroundColor: colors.secondary.oliveGreen,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.85';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Load
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
                  onClearCanvas?.();
                }
              }}
              disabled={placedSpaces.length === 0}
              className="flex-1 text-white px-2.5 py-2 rounded-md text-xs font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              style={{
                backgroundColor: placedSpaces.length === 0 ? undefined : colors.primary.brick,
              }}
              onMouseEnter={(e) => {
                if (placedSpaces.length > 0) {
                  e.currentTarget.style.opacity = '0.85';
                }
              }}
              onMouseLeave={(e) => {
                if (placedSpaces.length > 0) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
