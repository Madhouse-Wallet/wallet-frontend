import React from 'react'
import withThemeProvider from '../hoc/withThemeProvider'

// Wrap the entire app with the theme provider
function MyApp({ Component, pageProps }) {
  // Apply HOC to wrap each page with ThemeProvider
  const EnhancedComponent = withThemeProvider(Component)

  return <EnhancedComponent {...pageProps} />
}

export default MyApp
