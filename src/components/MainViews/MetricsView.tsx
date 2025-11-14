export function MetricsView() {
  return (
    <div className="w-full h-full bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Project Metrics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Placeholder metrics cards */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Total SF</p>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Budget SF</p>
            <p className="text-3xl font-bold text-gray-900">85,000</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Efficiency</p>
            <p className="text-3xl font-bold text-gray-900">--</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Status</p>
            <p className="text-3xl font-bold text-green-600">Under</p>
          </div>
        </div>
      </div>
    </div>
  );
}
