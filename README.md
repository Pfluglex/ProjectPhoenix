# Project Phoenix

Grid-based 3D space planning tool for Flour Bluff CTE.

## Overview

Project Phoenix is a rapid-response space planning tool that transforms the Flour Bluff CTE challenge (96,560 SF program in 85,000 SF budget) into an interactive, visual problem-solving experience.

**Key Features:**
- ✅ 3D Canvas with drag-and-drop space placement
- ✅ Dynamic space palette with 7 categorized space types
- ✅ Real-time project save/load with MySQL database
- ✅ Space Library with full CRUD operations (Create, Read, Update, Delete)
- ✅ Project management (save, load, delete projects)
- ✅ Interactive 3D visualization with rotation and manipulation
- ✅ Type-based color coding (Technology, Trades, Band, Systems, Admin, Service, Generic)
- ✅ Responsive UI with glassmorphic design system

## Tech Stack

- **Framework:** React 18 + TypeScript 5
- **Build Tool:** Vite 5
- **3D Engine:** Three.js + React Three Fiber
- **Database:** MySQL 8.0
- **Backend:** PHP 8.0+ (REST API)
- **Animations:** Framer Motion
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── SideBars/         # AppSidebar navigation
│   ├── MainViews/        # CanvasView, SpaceLibrary, ProjectLibrary, Settings
│   ├── Canvas/           # Canvas3D, SpacePalette, SpaceBlock3D, LoadProjectModal
│   ├── SpaceLibrary/     # AddSpaceModal, EditSpaceModal
│   └── System/           # ThemeManager with Pfluger brand colors
├── lib/                  # API client, metrics calculations
├── types/                # TypeScript interfaces
api/
├── db_config.php         # Database configuration
├── spaces.php            # Space library CRUD endpoints
└── projects.php          # Project save/load/delete endpoints
migrations/               # Database migration scripts
```

## Database Setup

### MySQL Configuration

1. Create database: `projectphoenix`
2. Run migrations in order from `/migrations/` folder:
   - `001_initial_schema.sql` - Create tables
   - `002_remove_category_column.sql` - Remove category from space_library
   - `003_migrate_type_values.sql` - Update type values
   - `004_map_all_types.sql` - Map spaces to new type system
   - `005_remove_category_from_project_spaces.sql` - Remove category from project_spaces

### Database Tables

**space_library** - Space templates
- `id`, `name`, `width`, `depth`, `height`, `type`, `icon`

**projects** - Saved projects
- `id`, `name`, `timestamp`, `space_count`

**project_spaces** - Space instances in projects
- `project_id`, `space_instance_id`, `template_id`, `space_id`, `name`, `width`, `depth`, `height`, `icon`, `type`, `position_x`, `position_y`, `position_z`, `rotation`

## Space Types

Project Phoenix uses 7 color-coded space types:
- **Technology** (Dark Blue) - Computer labs, cyber security, audio visual
- **Trades** (Sky Blue) - Construction, aviation, culinary, automotive
- **Band** (Brick Red) - Band hall, choir, music, dressing rooms
- **Systems** (Chartreuse) - PLC support, control rooms, server rooms
- **Admin** (Salmon) - Offices, conference rooms, meeting spaces
- **Service** (Orange) - Storage, mechanical, electrical, janitorial
- **Generic** (Olive Green) - Career centers, circulation, commons

## Development Notes

- Snap intervals: 1', 2.5', 5', 7.5', 10', 15', 20', 30'
- Default snap: 5 feet
- Budget target: 85,000 SF
- Pfluger brand color system with glassmorphic UI
- Recent spaces palette (5 slots) for quick access
- Real-time SF totals in Properties panel

## Completed Features (8-hour sprint!)

✅ Full MySQL database integration
✅ Space Library with Add/Edit/Delete functionality
✅ Project Library with Save/Load/Delete
✅ 3D Canvas with drag-and-drop placement
✅ Dynamic space palette with type grouping
✅ Space manipulation (move, rotate, scale)
✅ Type-based color system (7 types)
✅ Merged category/type into unified field
✅ PHP REST API backend
✅ Responsive glassmorphic UI
✅ Production build pipeline

## License

Private - Pfluger Architects
