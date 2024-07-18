 import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import Home from './views/Home';
import NotFound from './views/NotFound';
import Theme from './utils/theme';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

/* The app starts here. The routes control which url path renders which page. To create a new route, copy the format below and add the path that you wish to add to the url and the component which you wish to render */

export function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

/*The Raect app exists inside two wrappers. MantineProvider allows the app to use Mantine as a component library. BrowserRouter helps control the Routng in the application.*/

export function WrappedApp() {
  return (
    <BrowserRouter>
      <MantineProvider>
        <App />
      </MantineProvider>
    </BrowserRouter>
  );
}
