// hoc/withThemeProvider.js
import React from 'react'
import { ThemeProvider } from '../components/ContextApi/ThemeContext'

// HOC to wrap components with the ThemeProvider
const withThemeProvider = (WrappedComponent) => {
  return function EnhancedComponent(props) {
    return (
      <ThemeProvider>
        <WrappedComponent {...props} />
      </ThemeProvider>
    )
  }
}

export default withThemeProvider
