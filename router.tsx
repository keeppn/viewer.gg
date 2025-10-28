import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Overview from './pages/Overview';
import Tournaments from './pages/Tournaments';
import Analytics from './pages/Analytics';
import Applications from './pages/Applications';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Live from './pages/Live';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Overview />,
      },
      {
        path: 'tournaments',
        element: <Tournaments />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'applications',
        element: <Applications />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'live',
        element: <Live />,
      },
    ],
  },
]);
