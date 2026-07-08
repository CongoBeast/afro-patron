import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { useAuth }      from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';
import AppShell         from './components/AppShell/AppShell';

import LandingPage        from './pages/Landing/LandingPage';
import LoginPage          from './pages/Login/LoginPage';
import CreatorProfilePage from './pages/CreatorProfile/CreatorProfilePage';

// Platform pages
import DashboardPage  from './pages/Dashboard/DashboardPage';
import CampaignsPage  from './pages/Campaigns/CampaignsPage';
import FeedPage       from './pages/Feed/FeedPage';
import AnalyticsPage  from './pages/Analytics/AnalyticsPage';
import PayoutsPage    from './pages/Payouts/PayoutsPage';
import ProfilePage    from './pages/Profile/ProfilePage';
import DiscoverPage   from './pages/Discover/DiscoverPage';
import FollowingPage  from './pages/Following/FollowingPage';
import HistoryPage    from './pages/History/HistoryPage';

/**
 * RoleAwareIndex
 * Redirects /app (index) to the right landing page for the current role.
 * Creators → /app/dashboard   Supporters → /app/discover
 */
function RoleAwareIndex() {
  const { role } = useAuth();
  return (
    <Navigate
      to={role === 'supporter' ? '/app/discover' : '/app/dashboard'}
      replace
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public routes ───────────────────────────────────────── */}
          <Route path="/"               element={<LandingPage />}        />
          <Route path="/login"          element={<LoginPage />}          />
          {/* Public creator profile — standalone, no AppShell */}
          <Route path="/creator/:slug"  element={<CreatorProfilePage />} />

          {/* ── Protected platform ─────────────────────────────────── */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            {/* Index — redirect to role-appropriate home */}
            <Route index element={<RoleAwareIndex />} />

            {/* Creator routes */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="feed"      element={<FeedPage />}      />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="payouts"   element={<PayoutsPage />}   />

            {/* Shared */}
            <Route path="profile" element={<ProfilePage />} />

            {/* Supporter routes */}
            <Route path="discover"  element={<DiscoverPage />}  />
            <Route path="following" element={<FollowingPage />} />
            <Route path="history"   element={<HistoryPage />}   />
          </Route>

          {/* ── Catch-all ───────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
