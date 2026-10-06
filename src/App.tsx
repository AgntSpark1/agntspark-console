import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import StudioLayout from './components/studio/StudioLayout';
import Agents from './pages/Agents';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import AssistantEditor from './pages/studio/AssistantEditor';
import NewAssistant from './pages/studio/NewAssistant';
import PublicChat from './pages/studio/PublicChat';
import StudioHome from './pages/studio/StudioHome';
import Upgrade from './pages/Upgrade';
import { hasStoredToken } from './hooks/useAuth';

// Come back here after signing in (e.g. /upgrade from the website's pricing section).
function LoginRedirect() {
  const location = useLocation();
  const next = location.pathname + location.search;
  const to = next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`;
  return <Navigate to={to} replace />;
}

function RequireAuth() {
  if (!hasStoredToken()) return <LoginRedirect />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function RequireAuthStudio() {
  if (!hasStoredToken()) return <LoginRedirect />;
  return (
    <StudioLayout>
      <Outlet />
    </StudioLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* A published assistant's chat page: no account needed. */}
      <Route path="/c/:slug" element={<PublicChat />} />
      <Route element={<RequireAuthStudio />}>
        <Route path="/studio" element={<StudioHome />} />
        <Route path="/studio/new" element={<NewAssistant />} />
        <Route path="/studio/a/:id" element={<AssistantEditor />} />
      </Route>
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
