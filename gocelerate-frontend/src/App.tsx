import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import CookieBanner from './components/ui/CookieBanner';

import LandingPage      from './pages/LandingPage';
import BrowseProjects  from './pages/BrowseProjects';
import PublicProject   from './pages/PublicProject';
import Login         from './pages/auth/Login';
import Register      from './pages/auth/Register';
import Dashboard     from './pages/Dashboard';
import Projects      from './pages/Projects';
import NewProject    from './pages/NewProject';
import ProjectDetail from './pages/ProjectDetail';
import Milestones    from './pages/Milestones';
import Expenses      from './pages/Expenses';
import Reports       from './pages/Reports';
import Settings      from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CookieBanner />
        <Routes>
          {/* Public pages — no auth required */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<BrowseProjects />} />
          <Route path="/p/:id" element={<PublicProject />} />

          {/* Auth routes — redirect to /dashboard when already logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* App routes — redirect to /login when not logged in */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard"        element={<Dashboard />} />
              <Route path="/projects"         element={<Projects />} />
              <Route path="/projects/new"     element={<NewProject />} />
              <Route path="/projects/:id"     element={<ProjectDetail />} />
              <Route path="/milestones"       element={<Milestones />} />
              <Route path="/expenses"         element={<Expenses />} />
              <Route path="/reports"          element={<Reports />} />
              <Route path="/settings"         element={<Settings />} />
            </Route>
          </Route>

          {/* Catch-all → landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
