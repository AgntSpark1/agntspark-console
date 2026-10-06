import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Agents from './pages/Agents';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Upgrade from './pages/Upgrade';
import { hasStoredToken } from './hooks/useAuth';

function RequireAuth() {
  const location = useLocation();
  if (!hasStoredToken()) {
    // Come back here after signing in (e.g. /upgrade from the website's pricing section).
    const next = location.pathname + location.search;
    const to = next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`;
    return <Navigate to={to} replace />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
