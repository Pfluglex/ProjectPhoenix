import { LogOut } from "lucide-react";
import { useAuth } from "../System/AuthContext";

export function SettingsView() {
  const { logout } = useAuth();

  return (
    <div className="w-full h-full bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

        {/* Account Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Logged in as</p>
              <p className="text-sm text-gray-500">apps@pflugerarchitects.com</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Project Configuration */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Project Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grid Module Size
              </label>
              <input
                type="number"
                defaultValue="7.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Base grid module in feet</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Target
              </label>
              <input
                type="number"
                defaultValue="85000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Target square footage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
