import React, { useState, useCallback, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';

/** Map pathname → page title shown in topbar */
const ROUTE_TITLES = {
  '/app/dashboard': 'Dashboard',
  '/app/campaigns': 'Campaigns',
  '/app/feed':      'Feed',
  '/app/analytics': 'Analytics',
  '/app/payouts':   'Payouts',
  '/app/profile':   'Profile',
  '/app/discover':  'Discover Creators',
  '/app/following': 'Following',
  '/app/history':   'My Support History',
};

export default function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen,       setMobileOpen]       = useState(false);

  const location  = useLocation();
  const pageTitle = ROUTE_TITLES[location.pathname] ?? 'AfroPatron';

  const toggleSidebar  = useCallback(() => setSidebarCollapsed(p => !p), []);
  const openMobile     = useCallback(() => setMobileOpen(true),  []);
  const closeMobile    = useCallback(() => setMobileOpen(false), []);

  const mainWrapClass = useMemo(
    () => ['main-wrap', sidebarCollapsed && 'is-collapsed'].filter(Boolean).join(' '),
    [sidebarCollapsed],
  );

  return (
    <div className="app-shell">
      {/* Mobile backdrop */}
      <div
        className={`sb-overlay${mobileOpen ? ' is-active' : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onNavClick={closeMobile}
        onToggle={toggleSidebar}
      />

      <div className={mainWrapClass}>
        <Topbar
          title={pageTitle}
          onHamburgerClick={openMobile}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
