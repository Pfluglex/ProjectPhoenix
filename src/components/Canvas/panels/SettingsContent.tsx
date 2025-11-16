import { useState, useEffect } from "react";
import { LogOut, Save } from "lucide-react";
import { useAuth } from "../../System/AuthContext";

export function SettingsContent() {
  const { logout } = useAuth();

  // Project configuration state
  const [projectName, setProjectName] = useState("Flour Bluff CTE");
  const [budgetTarget, setBudgetTarget] = useState(85000);
  const [gridModuleSize, setGridModuleSize] = useState(7.5);
  const [level1Height, setLevel1Height] = useState(15);
  const [level2Height, setLevel2Height] = useState(15);
  const [level3Height, setLevel3Height] = useState(15);
  const [level4Height, setLevel4Height] = useState(15);
  const [hasChanges, setHasChanges] = useState(false);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('project_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setProjectName(config.projectName || "Flour Bluff CTE");
        setBudgetTarget(config.budgetTarget || 85000);
        setGridModuleSize(config.gridModuleSize || 7.5);
        setLevel1Height(config.level1Height || 15);
        setLevel2Height(config.level2Height || 15);
        setLevel3Height(config.level3Height || 15);
        setLevel4Height(config.level4Height || 15);
      } catch (error) {
        console.error('Error loading project config:', error);
      }
    }
  }, []);

  const handleSave = () => {
    const config = {
      projectName,
      budgetTarget,
      gridModuleSize,
      level1Height,
      level2Height,
      level3Height,
      level4Height,
    };

    localStorage.setItem('project_config', JSON.stringify(config));
    setHasChanges(false);
    alert('Project configuration saved successfully!');
  };

  const markChanged = () => {
    if (!hasChanges) setHasChanges(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Account Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Account</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-700">Logged in as</p>
              <p className="text-xs text-gray-500">apps@pflugerarchitects.com</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-xs font-medium"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Project Configuration */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Project Configuration</h3>
          {hasChanges && (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-xs font-medium"
            >
              <Save size={12} />
              <span>Save Changes</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                markChanged();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">Display name for this project</p>
          </div>

          {/* Grid Module Size */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Grid Module Size
            </label>
            <input
              type="number"
              value={gridModuleSize}
              onChange={(e) => {
                setGridModuleSize(Number(e.target.value));
                markChanged();
              }}
              step="0.5"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">Base grid module in feet</p>
          </div>

          {/* Budget Target */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Budget Target
            </label>
            <input
              type="number"
              value={budgetTarget}
              onChange={(e) => {
                setBudgetTarget(Number(e.target.value));
                markChanged();
              }}
              step="1000"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">Target square footage</p>
          </div>

          {/* Level Heights */}
          <div className="pt-2 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Building Level Heights</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Level 1
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={level1Height}
                    onChange={(e) => {
                      setLevel1Height(Number(e.target.value));
                      markChanged();
                    }}
                    min="8"
                    max="30"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500">ft</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Level 2
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={level2Height}
                    onChange={(e) => {
                      setLevel2Height(Number(e.target.value));
                      markChanged();
                    }}
                    min="8"
                    max="30"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500">ft</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Level 3
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={level3Height}
                    onChange={(e) => {
                      setLevel3Height(Number(e.target.value));
                      markChanged();
                    }}
                    min="8"
                    max="30"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500">ft</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Level 4
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={level4Height}
                    onChange={(e) => {
                      setLevel4Height(Number(e.target.value));
                      markChanged();
                    }}
                    min="8"
                    max="30"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-500">ft</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Floor-to-floor height for each building level</p>
          </div>
        </div>
      </div>
    </div>
  );
}