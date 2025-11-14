# Project Phoenix

Grid-based 3D space planning tool for Flour Bluff CTE.

## Overview

Project Phoenix is a rapid-response space planning tool that transforms the Flour Bluff CTE challenge (96,560 SF program in 85,000 SF budget) into an interactive, visual problem-solving experience.

**Key Features:**
- Grid-based placement system (7.5-foot module)
- 2D/3D dual visualization
- Real-time metrics calculation
- Drag-and-drop space blocks
- Budget tracking with visual indicators

## Tech Stack

- **Framework:** React 18 + TypeScript 5
- **Build Tool:** Vite 5
- **3D Engine:** Three.js + React Three Fiber
- **State:** Zustand (lightweight global state)
- **Animations:** Framer Motion
- **Styling:** Tailwind CSS 3

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
│   ├── MainViews/        # Canvas, Metrics, Settings views
│   └── System/           # ThemeManager, utilities
├── lib/                  # Core logic (GridManager, metrics)
├── data/                 # CTE spaces CSV data
├── types/                # TypeScript interfaces
└── store/                # Zustand state management
```

## Space Data

CTE space definitions are stored in `/data/cte-spaces.csv` with the following structure:
- Grid-based dimensions (width/depth/height in module units)
- Square footage
- Color coding
- Space type (program/circulation/support)

## Development Notes

- No database required - all data is local/CSV-based
- Grid module: 7.5 feet
- Budget target: 85,000 SF
- Harvested components from ProjectPrism for UI consistency
- Theme system supports Pfluger brand colors

## Next Steps

1. Implement GridManager class for collision detection
2. Build 2D Canvas view with SVG
3. Add 3D visualization with React Three Fiber
4. Create space palette for drag-and-drop
5. Implement real-time metrics calculations
6. Add scenario save/load functionality

## License

Private - Pfluger Architects
