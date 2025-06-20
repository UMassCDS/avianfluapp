import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import HomePage from './views/Home';
import About from './views/About';
import FeedbackForm from './views/Feedback';
import NotFound from './views/NotFound';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

/**
 * The main application routes.
 */
export function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

/**
 * WrappedApp configures global providers.
 * - MantineProvider: provides Mantine UI theming
 * - BrowserRouter: enables routing
 * - Notifications: enables popup toasts throughout the app
 */
export function WrappedApp() {
  return (
    <BrowserRouter>
      <MantineProvider>
        <Notifications position="top-right" zIndex={1000} />
        <App />
      </MantineProvider>
    </BrowserRouter>
  );
}
