# Sidebar Panel Integration Guide

This document explains how to integrate a collapsible sidebar with activity panels that move smoothly when the sidebar expands/collapses.

## Overview

The implementation consists of:
1. **Main Sidebar** - Collapsible sidebar that can be expanded/collapsed
2. **Activity Panels** - Multiple panels that stack on top of each other and shift position when sidebar state changes
3. **Integrated Collapse Button** - When sidebar is hidden, collapse button appears in panel headers

## Key Features

- ✅ Smooth animations when sidebar expands/collapses (500ms)
- ✅ Panels slide horizontally to accommodate sidebar changes
- ✅ Sidebar completely hidden when collapsed on specific views (e.g., canvas view)
- ✅ Collapse button integrated into panel headers when sidebar is hidden
- ✅ Multiple panels switch with opacity/scale animations
- ✅ No jarring jumps or resets - smooth transitions throughout

## Implementation Steps

### 1. State Management (App.tsx)

Set up sidebar state at the top level:

```tsx
function MainAppContent() {
  const [activeView, setActiveView] = useState<ActiveView>('canvas')
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-50">
      <AppSidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        isExpanded={isSidebarExpanded}
        onExpandedChange={setIsSidebarExpanded}
      />

      <CanvasView
        isSidebarExpanded={isSidebarExpanded}
        onSidebarExpandedChange={setIsSidebarExpanded}
      />
    </div>
  )
}
```

### 2. Sidebar Component (AppSidebar.tsx)

**Key Concepts:**
- Use `AnimatePresence` for smooth enter/exit animations
- Hide sidebar completely when collapsed on specific views
- Use cubic-bezier easing for natural motion

```tsx
export function AppSidebar({ activeView, onViewChange, isExpanded, onExpandedChange }: AppSidebarProps) {
  // Hide sidebar completely when collapsed on canvas view
  const shouldHideSidebar = !isExpanded && activeView === 'canvas'

  return (
    <>
      {/* Floating collapse button when sidebar is expanded */}
      {isExpanded && !shouldHideSidebar && (
        <motion.button
          onClick={() => onExpandedChange(!isExpanded)}
          className="fixed h-8 w-8 rounded-lg ... z-[3001]"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0, left: '15.625rem', top: '2.25rem' }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <PanelLeftClose className="h-4 w-4" />
        </motion.button>
      )}

      <AnimatePresence>
        {!shouldHideSidebar && (
          <motion.aside
            className="fixed overflow-hidden flex flex-col ... z-[3000]"
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
            {/* Sidebar content */}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
```

**Important:**
- `duration: 0.5` - Matches panel animation timing
- `ease: [0.4, 0, 0.2, 1]` - Cubic-bezier for smooth deceleration
- `AnimatePresence` - Enables exit animations when sidebar disappears

### 3. Activity Panels (LibraryPanel.tsx, ToolsPanel.tsx, PropertiesPanel.tsx)

**Key Concepts:**
- Use CSS transitions for horizontal position (not Framer Motion)
- Use Framer Motion for opacity/scale only
- Calculate left offset based on sidebar state
- Add collapse button in header when sidebar is hidden

```tsx
interface PanelProps {
  isSidebarExpanded: boolean;
  onSidebarExpandedChange?: (expanded: boolean) => void;
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

export function LibraryPanel({
  isSidebarExpanded,
  onSidebarExpandedChange,
  activePanel,
  onPanelChange
}: PanelProps) {
  // Calculate left offset based on sidebar state
  const leftOffset = isSidebarExpanded
    ? 'calc(280px + 2rem + 1rem)' // sidebar width + margins
    : '1rem'; // collapsed - move to left edge

  const isActive = activePanel === 'library';

  return (
    <motion.div
      className="absolute top-4 w-72 ... flex flex-col"
      style={{
        height: 'calc(100vh - 2rem)',
        zIndex: isActive ? 20 : 10,
        pointerEvents: isActive ? 'auto' : 'none',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'rgba(59, 130, 246, 0.2)',
        left: leftOffset, // Position set in style
        transition: 'left 500ms cubic-bezier(0.4, 0, 0.2, 1)' // CSS transition for position
      }}
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.95
      }}
      transition={{
        opacity: { duration: 0.3, ease: "easeInOut" },
        scale: { duration: 0.3, ease: "easeInOut" }
      }}
    >
      {/* Header with integrated collapse button */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <div className="py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Collapse button - only show when sidebar is collapsed */}
            {!isSidebarExpanded && onSidebarExpandedChange && (
              <motion.button
                onClick={() => onSidebarExpandedChange(true)}
                className="h-6 w-6 rounded-md bg-white/80 hover:bg-white flex items-center justify-center transition-all border border-gray-300 hover:border-gray-400 shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PanelLeftOpen className="h-3.5 w-3.5 text-gray-700" />
              </motion.button>
            )}
            <h2 className="text-sm font-semibold">Library</h2>
          </div>
          <PanelDots activePanel={activePanel} onPanelChange={onPanelChange} />
        </div>
      </div>

      {/* Panel content */}
    </motion.div>
  )
}
```

### 4. Panel Switching Component (PanelDots.tsx)

Allows users to switch between different panels:

```tsx
export type PanelType = 'library' | 'tools' | 'properties';

const DOT_COLORS = {
  library: '#3B82F6',   // Blue
  tools: '#F59E0B',     // Amber
  properties: '#10B981' // Green
};

export function PanelDots({ activePanel, onPanelChange }: PanelDotsProps) {
  const panels: PanelType[] = ['library', 'tools', 'properties'];

  return (
    <div className="flex items-center gap-2.5 h-6">
      {panels.map((panel) => (
        <motion.button
          key={panel}
          onClick={() => onPanelChange(panel)}
          className="rounded-full"
          style={{
            width: '15px',
            height: '15px',
            backgroundColor: DOT_COLORS[panel],
            opacity: activePanel === panel ? 1 : 0.4,
          }}
          whileHover={{ scale: 1.1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
        />
      ))}
    </div>
  )
}
```

## Animation Timings

| Element | Property | Duration | Easing | Notes |
|---------|----------|----------|--------|-------|
| Sidebar | width, opacity, x | 500ms | cubic-bezier(0.4, 0, 0.2, 1) | Smooth expand/collapse |
| Panels | left | 500ms | cubic-bezier(0.4, 0, 0.2, 1) | CSS transition - no reset |
| Panels | opacity, scale | 300ms | easeInOut | Fast panel switching |
| Collapse Button | opacity, x | 300ms | easeInOut | Quick fade in/out |

## Critical Implementation Details

### ❗ Use CSS Transitions for Position

**DO THIS:**
```tsx
style={{
  left: leftOffset,
  transition: 'left 500ms cubic-bezier(0.4, 0, 0.2, 1)'
}}
```

**NOT THIS:**
```tsx
// ❌ This causes panels to reset/jump
animate={{
  left: leftOffset,
  opacity: isActive ? 1 : 0,
}}
```

**Why?** Framer Motion recalculates animation paths on state changes, causing unwanted resets. CSS transitions smoothly animate from current position to new position.

### ❗ Match Animation Timings

Sidebar and panel animations must have the **same duration** (500ms) so they move in sync.

### ❗ Use Proper Easing

`cubic-bezier(0.4, 0, 0.2, 1)` creates natural deceleration:
- Starts fast
- Ends slow
- Feels organic and polished

### ❗ Conditional Rendering vs Visibility

**Sidebar:** Use `AnimatePresence` with conditional rendering for complete removal:
```tsx
<AnimatePresence>
  {!shouldHideSidebar && <motion.aside>...</motion.aside>}
</AnimatePresence>
```

**Panels:** Use `pointerEvents` and `opacity` to "hide" while keeping in DOM:
```tsx
style={{
  pointerEvents: isActive ? 'auto' : 'none',
  opacity: isActive ? 1 : 0,
}}
```

## z-index Hierarchy

```
3001 - Floating collapse button (when sidebar expanded)
3000 - Sidebar
  20 - Active panel
  10 - Inactive panels
```

## Props Flow

```
App.tsx
  ↓ isSidebarExpanded, setIsSidebarExpanded
  ├─→ AppSidebar
  │     - Shows/hides based on view + expanded state
  │     - Controls expand/collapse button
  │
  └─→ CanvasView
        ↓ passes props to all panels
        ├─→ LibraryPanel
        ├─→ ToolsPanel
        └─→ PropertiesPanel
              - Each panel calculates leftOffset
              - Each panel shows collapse button when sidebar hidden
              - Panels animate position via CSS transition
```

## File Structure

```
src/
├── App.tsx                          # State management
├── components/
│   ├── SideBars/
│   │   └── AppSidebar.tsx           # Main collapsible sidebar
│   ├── Canvas/
│   │   ├── LibraryPanel.tsx         # Activity panel (blue)
│   │   ├── ToolsPanel.tsx           # Activity panel (amber)
│   │   ├── PropertiesPanel.tsx      # Activity panel (green)
│   │   └── PanelDots.tsx            # Panel switcher component
│   └── MainViews/
│       └── CanvasView.tsx           # Container view
```

## Common Issues & Solutions

### Problem: Panels jump or reset position
**Solution:** Use CSS transitions for `left` property, not Framer Motion animate

### Problem: Animations feel too fast/slow
**Solution:** Adjust timing - sidebar and panels must match (500ms recommended)

### Problem: Panels appear/disappear instantly
**Solution:** Use Framer Motion for opacity/scale with proper transition timings

### Problem: Collapse button always visible
**Solution:** Add proper conditional: `{!isSidebarExpanded && onSidebarExpandedChange && (...)}`

### Problem: Sidebar still visible when collapsed on canvas
**Solution:** Add `shouldHideSidebar` logic based on view + expanded state

## Browser Compatibility

- ✅ CSS transitions: All modern browsers
- ✅ Framer Motion: Chrome, Firefox, Safari, Edge
- ✅ cubic-bezier easing: All modern browsers

## Performance Notes

- CSS transitions are GPU-accelerated
- Framer Motion uses transform properties for optimal performance
- Keep panel count reasonable (3-5 max for smooth animations)

---

**Last Updated:** 2025-01-15
**Project:** ProjectPhoenix
**Framework:** React + TypeScript + Framer Motion + Tailwind CSS
