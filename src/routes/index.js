import { Suspense, lazy } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
// layouts
import DashboardLayout from '../layouts/dashboard';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout';
// components
import LoadingScreen from '../components/LoadingScreen';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  return (
    <Suspense fallback={<LoadingScreen isDashboard={pathname.includes('/dashboard')} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to="/tools" replace />,
    },
    {
      path: '/assets',
      element: <DashboardLayout />,
      children: [{ path: '/assets', element: <Assets /> }],
    },
    {
      path: '/tools',
      element: <DashboardLayout />,
      children: [{ path: '/tools', element: <Tools /> }],
    },
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// Dashboard
const Assets = Loadable(lazy(() => import('../pages/MyTokens')));
const Tools = Loadable(lazy(() => import('../pages/Tools')));

const NotFound = Loadable(lazy(() => import('../pages/Page404')));
