import { lazy, Suspense, useSyncExternalStore } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import { AuthProvider } from './features/auth/AuthProvider';
import ProductPages from './pages/ProductPages';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

type AppRoute = 'home' | 'dashboard' | 'admin';

function getRoute(): AppRoute {
  const route = window.location.hash.slice(1).split('?')[0];
  if (route === '/dashboard') return 'dashboard';
  if (route === '/admin') return 'admin';
  return 'home';
}

function subscribeToRoute(onRouteChange: () => void) {
  window.addEventListener('hashchange', onRouteChange);
  window.addEventListener('popstate', onRouteChange);
  return () => { window.removeEventListener('hashchange', onRouteChange); window.removeEventListener('popstate', onRouteChange); };
}

function AppContent() {
  const route = useSyncExternalStore(subscribeToRoute, getRoute, () => 'home');
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const productPath = ['/search', '/plans', '/membership', '/standby', '/how-it-works', '/faq', '/contact', '/privacy', '/terms', '/login', '/signup'].includes(path);
  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <Header />
    <Suspense fallback={<main className="container route-loading" id="main-content" role="status"><div className="skeleton-stack"><span /><span /><span /></div><p>Loading your SEATS space…</p></main>}>
      {productPath ? <ProductPages path={path} /> : route === 'admin' ? <AdminDashboard /> : route === 'dashboard' ? <DashboardPage /> : <HomePage />}
    </Suspense>
  </>;
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}
