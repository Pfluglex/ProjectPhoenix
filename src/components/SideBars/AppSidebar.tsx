import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3x3,
  Library,
  BarChart3,
  Settings,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";

import { useTheme } from "../System/ThemeManager";
import type { ActiveView } from "../../types";

interface AppSidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  isExpanded: boolean
  onExpandedChange: (expanded: boolean) => void
}

export function AppSidebar({ activeView, onViewChange, isExpanded, onExpandedChange }: AppSidebarProps) {
  const { componentThemes } = useTheme()
  const sidebarTheme = componentThemes.sidebar.light

  // Hide sidebar completely when collapsed on canvas view
  const shouldHideSidebar = !isExpanded && activeView === 'canvas'

  // Main navigation items
  const items = [
    {
      title: "Canvas",
      view: "canvas" as ActiveView,
      icon: Grid3x3,
      description: "Space planning grid"
    },
    {
      title: "Space Library",
      view: "library" as ActiveView,
      icon: Library,
      description: "Browse all spaces"
    },
    {
      title: "Metrics",
      view: "metrics" as ActiveView,
      icon: BarChart3,
      description: "View efficiency metrics"
    },
    {
      title: "Settings",
      view: "settings" as ActiveView,
      icon: Settings,
      description: "App settings"
    },
  ];

  return (
    <>
      {/* Collapse Button - Floating when expanded, only show if sidebar is visible */}
      {isExpanded && !shouldHideSidebar && (
        <motion.button
          onClick={() => onExpandedChange(!isExpanded)}
          className={`fixed h-8 w-8 rounded-lg ${sidebarTheme.button.bg} ${sidebarTheme.button.hover} flex items-center justify-center transition-all border ${sidebarTheme.button.border} shadow-md z-[3001]`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0, left: '15.625rem', top: '2.25rem' }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          aria-label="Toggle sidebar"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <PanelLeftClose className="h-4 w-4 text-gray-700" />
        </motion.button>
      )}

      <AnimatePresence>
        {!shouldHideSidebar && (
          <motion.aside
            className={`${sidebarTheme.container.bg} ${sidebarTheme.container.backdropBlur} fixed overflow-hidden flex flex-col shrink-0 m-4 rounded-2xl ${sidebarTheme.container.shadow} border ${sidebarTheme.container.border} z-[3000]`}
            style={{ height: 'calc(100vh - 2rem)' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              width: isExpanded ? 280 : 80,
              opacity: 1,
              x: 0
            }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >


      {/* Header with Logo */}
      <div className={`${isExpanded ? 'p-4' : 'p-2'} pb-3 border-b ${sidebarTheme.divider}`}>
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 w-full">
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="bg-black rounded-lg flex items-center justify-center px-1.5 py-0.5 h-6 w-12">
                <span className="text-white font-semibold text-[10px]">Pfluger</span>
              </div>
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col overflow-hidden"
                >
                  <span className="text-sm font-semibold leading-tight whitespace-nowrap">Phoenix</span>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">CTE Space Planning</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;

            return (
              <motion.button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={`
                  relative w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? `${sidebarTheme.nav.active} text-gray-900`
                    : `${sidebarTheme.nav.hover} text-gray-700`
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900 rounded-r"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`p-2 rounded-lg ${isActive ? sidebarTheme.icon.active : sidebarTheme.icon.inactive}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-600'}`} />
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <span className={`font-medium whitespace-nowrap text-sm ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                        {item.title}
                      </span>
                      <p className="text-xs text-gray-500 whitespace-nowrap">{item.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className={`p-0 mt-auto border-t ${sidebarTheme.divider}`}>
        {/* Project Info */}
        <div className={`w-full flex items-center justify-center py-3`}>
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded-info"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="px-4 text-center"
              >
                <p className="text-xs font-semibold text-gray-900">Flour Bluff CTE</p>
                <p className="text-[10px] text-gray-500">Budget: 85,000 SF</p>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-info"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <p className="text-[10px] font-semibold text-gray-900">CTE</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
