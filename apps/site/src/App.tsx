import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SessionCreator } from './pages/session-creator';
import UserProvider from './contexts/user';
import _404Page from './pages/404';
import SessionPage from './pages/session';
import { TooltipProvider } from '@radix-ui/react-tooltip';

const router = createBrowserRouter([
  { path: '/', element: <SessionCreator /> },
  { path: '/session/:id', element: <SessionPage /> },
  { path: '*', element: <_404Page /> },
]);

function App() {
  return (
    <UserProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </UserProvider>
  );
}

export default App;
