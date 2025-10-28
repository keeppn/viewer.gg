import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Overview from './pages/Overview';
import Tournaments from './pages/Tournaments';
import Analytics from './pages/Analytics';
import Applications from './pages/Applications';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Live from './pages/Live';
import NewTournament from './pages/NewTournament';
import Apply from './pages/Apply'; // Import the new component
import Login from './pages/Login'; // Import Login component

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/dashboard',
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
        path: 'tournaments/new',
        element: <NewTournament />,
      },
      {
        path: 'tournaments/:tournamentId/apply', // New route for applying to a tournament
        element: <Apply />,
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
