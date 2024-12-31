import { ThemeProvider, useMediaQuery, type Theme } from '@mui/material'
import { createTheme, Shadows } from '@mui/material/styles'
import { TypographyOptions } from '@mui/material/styles/createTypography'

import { FC, useState, useEffect } from 'react'

// This component is necessary to make the theme available in the library components
// Is not enough wrapping the client app with the regular ThemeProvider as the library components
// are not aware of the theme context:
// https://github.com/mui/material-ui/issues/32806
// https://stackoverflow.com/questions/69072004/material-ui-theme-not-working-in-shared-component
type SafeThemeProviderProps = {
  children: (safeTheme: Theme) => JSX.Element
}

const SafeThemeProvider: FC<SafeThemeProviderProps> = ({ children }) => {
  // Get system preference for dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  // Add state to allow manual theme toggle
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(
    prefersDarkMode ? 'dark' : 'light'
  )

  // Update themeMode based on system preference change (optional)
  useEffect(() => {
    setThemeMode(prefersDarkMode ? 'dark' : 'light')
  }, [prefersDarkMode])

  const theme = createSafeTheme(themeMode)

  return <ThemeProvider theme={theme}>{children(theme)}</ThemeProvider>
}

export default SafeThemeProvider

const createSafeTheme = (mode: 'dark' | 'light'): Theme => {
  const colors = mode === 'dark' ? darkPalette : lightPalette
  const shadowColor = colors.primary.light

  return createTheme({
    palette: {
      mode: mode,
      ...colors
    },
    shape: {
      borderRadius: 6
    },
    shadows: createShadows(mode, shadowColor),
    typography,
    components: {
      MuiButton: {
        styleOverrides: {
          sizeMedium: {
            fontSize: '16px',
            padding: '12px 24px'
          },
          root: ({ theme }) => ({
            borderRadius: theme.shape.borderRadius,
            fontWeight: 'bold',
            lineHeight: 1.25,
            borderColor: theme.palette.primary.main,
            textTransform: 'none',
            '&:hover': {
              boxShadow: 'none'
            }
          }),
          outlined: {
            border: '2px solid',
            '&:hover': {
              border: '2px solid'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? 'background.default' : '#eeeeee'
          }
        }
      }
    }
  })
}

const createShadows = (
  mode: 'dark' | 'light',
  shadowColor: string
): Shadows => {
  // Create the shadow array explicitly with exactly 25 elements
  const shadows: Shadows = [
    'none', // 0
    mode === 'dark'
      ? `0 0 2px ${shadowColor}`
      : `0 1px 4px ${shadowColor}0a, 0 4px 10px ${shadowColor}14`, // 1
    mode === 'dark'
      ? `0 0 2px ${shadowColor}`
      : `0 1px 4px ${shadowColor}0a, 0 4px 10px ${shadowColor}14`, // 2
    mode === 'dark'
      ? `0 0 2px ${shadowColor}`
      : `0 2px 20px ${shadowColor}0a, 0 8px 32px ${shadowColor}14`, // 3
    mode === 'dark'
      ? `0 0 2px ${shadowColor}`
      : `0 8px 32px ${shadowColor}0a, 0 24px 60px ${shadowColor}14`, // 4
    // Add remaining shadows as 'none'
    'none', // 5
    'none', // 6
    'none', // 7
    'none', // 8
    'none', // 9
    'none', // 10
    'none', // 11
    'none', // 12
    'none', // 13
    'none', // 14
    'none', // 15
    'none', // 16
    'none', // 17
    'none', // 18
    'none', // 19
    'none', // 20
    'none', // 21
    'none', // 22
    'none', // 23
    'none' // 24
  ]

  return shadows
}

const typography: TypographyOptions = {
  fontFamily: 'DM Sans, sans-serif',
  h1: {
    fontSize: '32px',
    lineHeight: '36px',
    fontWeight: 700
  },
  h4: {
    fontSize: '20px',
    lineHeight: '26px'
  }
}

const darkPalette = {
  text: {
    primary: '#FFFFFF',
    secondary: '#636669',
    disabled: '#636669'
  },
  primary: {
    dark: '#0cb259',
    main: '#12FF80',
    light: '#A1A3A7'
  }
}

const lightPalette = {
  text: {
    primary: '#000000',
    secondary: '#636669',
    disabled: '#636669'
  },
  primary: {
    dark: '#0cb259',
    main: '#12FF80',
    light: '#A1A3A7'
  }
}
