export const theme = {
  colors: {
    background: '#F8FAFC', // Very light slate base background
    surface: '#FFFFFF',    // White cards
    surfaceContainerLow: '#F1F5F9',
    surfaceContainerHigh: '#E2E8F0', // Light border / divider line
    surfaceContainerHighest: '#CBD5E1',
    
    primary: '#4F46E5',    // Indigo primary
    primaryMid: '#6366F1', // Indigo mid
    primaryLight: '#A5B4FC',
    primaryTint: '#EEF2FF',
    
    text: '#1E293B',       // Near-black headings
    textMuted: '#64748B',  // Slate-grey body/muted text
    textDim: '#94A3B8',
    
    border: '#E2E8F0',     // Soft borders
    borderMuted: '#F1F5F9',
    borderActive: '#4F46E5', // Indigo active borders
    
    success: '#22C55E',    // Green approved
    successTint: '#D1FAE5',
    
    warning: '#F59E0B',    // Amber pending
    warningTint: '#FEF3C7',
    
    error: '#EF4444',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#991B1B',
    
    // Chart color array
    chartColors: [
      '#6366F1', // Indigo mid
      '#F97316', // Orange
      '#14B8A6', // Teal
      '#EC4899', // Pink
      '#3B82F6', // Blue
      '#A855F7', // Purple
      '#EF4444', // Red
      '#06B6D4', // Cyan
      '#84CC16', // Lime
    ]
  },
  
  roundness: {
    sharp: 0,
    small: 6,
    medium: 12,
    large: 16,
    full: 9999,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  typography: {
    displayXl: {
      fontSize: 54,
      fontWeight: '900',
      letterSpacing: -1,
      color: '#4F46E5',
    },
    displayLg: {
      fontSize: 28,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    headline: {
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    bodyLg: {
      fontSize: 16,
      fontWeight: '500',
    },
    bodyMd: {
      fontSize: 14,
      fontWeight: '400',
    },
    labelCaps: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    mono: {
      fontFamily: 'Courier',
      fontSize: 12,
    }
  }
};
