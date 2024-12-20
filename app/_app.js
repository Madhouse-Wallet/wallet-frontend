import React from 'react';
import withThemeProvider from '../hoc/withThemeProvider';
import {store} from '../lib/redux/store';
import { Provider } from 'react-redux';

// Wrap the entire app with the theme provider and redux provider
function MyApp({ Component, pageProps }) {
  // Apply HOC to wrap each page with ThemeProvider
  const EnhancedComponent = withThemeProvider(Component);

  return (
    <Provider store={store}>
      <EnhancedComponent {...pageProps} />
    </Provider>
  );
}

export default MyApp;
