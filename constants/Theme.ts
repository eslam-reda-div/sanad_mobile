/**
 * SANAD Mobile App - Modern Design System
 * Professional UI/UX Design Theme
 */

export const Theme = {
  // Color Palette - Modern & Professional
  colors: {
    primary: '#6366F1',        // Indigo - Main brand color
    primaryDark: '#4F46E5',    // Darker indigo for pressed states
    primaryLight: '#818CF8',   // Light indigo for highlights
    
    secondary: '#10B981',      // Emerald green - Success/Active
    secondaryDark: '#059669',
    secondaryLight: '#34D399',
    
    accent: '#F59E0B',         // Amber - Warnings/Important
    accentDark: '#D97706',
    accentLight: '#FBBF24',
    
    danger: '#EF4444',         // Red - Errors/Delete
    dangerDark: '#DC2626',
    dangerLight: '#F87171',
    
    info: '#3B82F6',           // Blue - Information
    infoDark: '#2563EB',
    infoLight: '#60A5FA',
    
    // Neutrals
    background: '#F9FAFB',     // Light gray background
    surface: '#FFFFFF',        // White cards/surfaces
    surfaceHover: '#F3F4F6',   // Hover state
    
    text: {
      primary: '#111827',      // Almost black
      secondary: '#6B7280',    // Gray for secondary text
      tertiary: '#9CA3AF',     // Light gray for hints
      inverse: '#FFFFFF',      // White text on dark backgrounds
    },
    
    border: {
      light: '#E5E7EB',        // Light borders
      medium: '#D1D5DB',       // Medium borders
      dark: '#9CA3AF',         // Dark borders
    },
    
    // Gradients
    gradients: {
      primary: ['#6366F1', '#8B5CF6'],     // Indigo to purple
      secondary: ['#10B981', '#059669'],    // Green gradient
      accent: ['#F59E0B', '#EF4444'],       // Amber to red
      background: ['#F9FAFB', '#FFFFFF'],   // Subtle background
    },
    
    // Status Colors
    status: {
      pending: '#F59E0B',      // Amber
      active: '#10B981',       // Green
      completed: '#6366F1',    // Indigo
      cancelled: '#EF4444',    // Red
      emergency: '#DC2626',    // Dark red
    },
  },
  
  // Typography - Professional Scale
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 28,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
      letterSpacing: 0.3,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
      letterSpacing: 0.5,
    },
  },
  
  // Spacing - 8px Grid System
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Border Radius - Consistent Rounding
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  // Shadows - iOS-style Depth
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Component Sizes
  components: {
    button: {
      height: 48,
      minWidth: 120,
      paddingHorizontal: 24,
    },
    input: {
      height: 48,
      paddingHorizontal: 16,
    },
    card: {
      padding: 16,
      borderRadius: 12,
    },
    avatar: {
      small: 32,
      medium: 48,
      large: 64,
      xlarge: 96,
    },
    iconButton: {
      size: 44,
      iconSize: 24,
    },
  },
};

export type ThemeType = typeof Theme;
