import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeProvider } from "./components/System/ThemeManager"
import { AuthProvider, useAuth } from "./components/System/AuthContext"
import { Login } from "./components/MainViews/Login"
import { AppSidebar } from "./components/SideBars/AppSidebar"
import { CanvasView } from "./components/MainViews/CanvasView"
import { SpaceLibrary } from "./components/MainViews/SpaceLibrary"
import { ProjectLibraryView } from "./components/MainViews/ProjectLibraryView"
import { SettingsView } from "./components/MainViews/SettingsView"
import type { ActiveView } from "./types"

function MainAppContent() {
  const { isAuthenticated } = useAuth()
  const [activeView, setActiveView] = useState<ActiveView>('canvas')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />
  }

  const handleViewChange = (view: ActiveView) => {
    setActiveView(view)
  }

  const renderContent = () => {
    switch (activeView) {
      case 'canvas':
        return <CanvasView isSidebarExpanded={isSidebarExpanded} onSidebarExpandedChange={setIsSidebarExpanded} />
      case 'library':
        return <SpaceLibrary />
      case 'metrics':
        return <ProjectLibraryView />
      case 'settings':
        return <SettingsView />
      default:
        return <CanvasView isSidebarExpanded={isSidebarExpanded} onSidebarExpandedChange={setIsSidebarExpanded} />
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-50">
      {/* Main content - full screen */}
      <main className="absolute inset-0 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: 1,
              scale: 1,
              // Apply padding for all views except canvas (which is full-screen)
              paddingLeft: activeView === 'canvas'
                ? 0
                : (isSidebarExpanded ? '316px' : '116px')
            }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={activeView === 'canvas' ? 'w-full h-full absolute inset-0' : 'flex-1 overflow-auto'}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Main Sidebar - floating above content */}
      <AppSidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        isExpanded={isSidebarExpanded}
        onExpandedChange={setIsSidebarExpanded}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainAppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}
