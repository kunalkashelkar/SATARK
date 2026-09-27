import React from 'react';
import { AppRouter } from './app/router';
import { SupervisoryProvider } from './context/SupervisoryContext';

export function App() {
  return (
    <SupervisoryProvider>
      <AppRouter />
    </SupervisoryProvider>
  );
}

export default App;
