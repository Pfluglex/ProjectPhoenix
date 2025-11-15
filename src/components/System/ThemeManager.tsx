import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Application Brand Colors (Pfluger)
export const APP_COLORS = {
  // Primary Colors
  primary: {
    brick: '#9A3324',
    black: '#000000',
    mediumGray: '#707372',
    lightGray: '#C7C9C7',
    white: '#FFFFFF'
  },

  // Secondary Colors
  secondary: {
    darkBlue: '#003C71',
    skyBlue: '#00A9E0',
    oliveGreen: '#67823A',
    chartreuse: '#B5BD00',
    orange: '#F2A900',
    salmon: '#f16555'
  }
}

// Space type color mappings
export const SPACE_TYPE_COLORS = {
  'technology': {
    color: APP_COLORS.secondary.darkBlue,
    label: 'Technology'
  },
  'trades': {
    color: APP_COLORS.secondary.skyBlue,
    label: 'Trades'
  },
  'band': {
    color: APP_COLORS.primary.brick,
    label: 'Band'
  },
  'systems': {
    color: APP_COLORS.secondary.chartreuse,
    label: 'Systems'
  },
  'admin': {
    color: APP_COLORS.secondary.salmon,
    label: 'Admin'
  },
  'service': {
    color: APP_COLORS.secondary.orange,
    label: 'Service'
  },
  'generic': {
    color: APP_COLORS.secondary.oliveGreen,
    label: 'Generic'
  },
  'egress': {
    color: '#6B7280',
    label: 'Egress'
  }
}

/**
 * Get color for a space based on its type
 */
export function getSpaceColor(type: 'technology' | 'trades' | 'band' | 'systems' | 'admin' | 'service' | 'generic' | 'egress'): string {
  return SPACE_TYPE_COLORS[type]?.color || APP_COLORS.secondary.oliveGreen;
}

// Glassmorphism Effects
export const GLASS_EFFECTS = {
  standard: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(20px)',
    border: 'rgba(255, 255, 255, 0.3)',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    tailwind: 'bg-white/50 backdrop-blur-xl border-white/30'
  },
  strong: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(24px)',
    border: 'rgba(255, 255, 255, 0.4)',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
    tailwind: 'bg-white/70 backdrop-blur-2xl border-white/40'
  }
}

// Component-Specific Theming
export const COMPONENT_THEMES = {
  sidebar: {
    light: {
      container: {
        bg: 'bg-white/50',
        backdropBlur: 'backdrop-blur-xl',
        border: 'border-white/30',
        shadow: 'shadow-lg'
      },
      nav: {
        active: 'bg-gray-100/80 backdrop-blur-sm',
        hover: 'hover:bg-gray-50/50 backdrop-blur-sm',
        inactive: ''
      },
      icon: {
        active: 'bg-blue-100 backdrop-blur-sm',
        inactive: 'bg-gray-100 backdrop-blur-sm'
      },
      button: {
        bg: 'bg-white/70 backdrop-blur-xl',
        hover: 'hover:bg-gray-50/70',
        border: 'border-white/40'
      },
      divider: 'border-gray-200'
    }
  },
  canvasPalette: {
    light: {
      container: {
        bg: 'bg-white/70',
        backdropBlur: 'backdrop-blur-xl',
        border: 'border-white/40',
        shadow: 'shadow-lg'
      },
      header: {
        divider: 'border-gray-200'
      },
      search: {
        bg: 'bg-white/60',
        border: 'border-gray-300',
        focusRing: 'focus:ring-blue-500/50',
        backdropBlur: 'backdrop-blur-sm'
      },
      category: {
        bg: 'bg-gray-50/40',
        backdropBlur: 'backdrop-blur-sm',
        border: 'border-gray-300',
        hover: 'hover:bg-gray-100/50'
      },
      spaceItem: {
        hover: 'hover:bg-gray-50/40',
        border: 'border-transparent',
        hoverBorder: 'hover:border-gray-300'
      },
      footer: {
        bg: 'bg-white/50',
        divider: 'border-gray-200'
      }
    }
  },
  canvasControls: {
    light: {
      button: {
        bg: 'bg-white/70',
        backdropBlur: 'backdrop-blur-xl',
        border: 'border-white/40',
        hover: 'hover:bg-white/80',
        shadow: 'shadow-lg'
      }
    }
  }
}

// Utility functions
export const colorUtils = {
  hexToRgb: (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },

  rgba: (hex: string, opacity: number) => {
    const rgb = colorUtils.hexToRgb(hex)
    return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})` : hex
  }
}

// Theme context
type ThemeContextType = {
  currentTheme: 'light'
  colors: typeof APP_COLORS
  spaceTypeColors: typeof SPACE_TYPE_COLORS
  componentThemes: typeof COMPONENT_THEMES
  glassEffects: typeof GLASS_EFFECTS
  utils: typeof colorUtils
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme] = useState<'light'>('light')

  useEffect(() => {
    const root = document.documentElement

    // Apply app brand colors as CSS variables
    Object.entries(APP_COLORS.primary).forEach(([key, value]) => {
      root.style.setProperty(`--app-${key}`, value)
    })

    Object.entries(APP_COLORS.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--app-${key}`, value)
    })
  }, [currentTheme])

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      colors: APP_COLORS,
      spaceTypeColors: SPACE_TYPE_COLORS,
      componentThemes: COMPONENT_THEMES,
      glassEffects: GLASS_EFFECTS,
      utils: colorUtils
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
