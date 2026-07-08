import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Rocket,
  Rss,
  BarChart3,
  Wallet,
  User,
  Compass,
  Heart,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Nav item definitions ──────────────────────────────────────────────────
const CREATOR_NAV = [
  { to: '/app/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/app/campaigns', label: 'Campaigns',  Icon: Rocket         },
  { to: '/app/feed',      label: 'Feed',        Icon: Rss            },
  { to: '/app/analytics', label: 'Analytics',   Icon: BarChart3      },
  { to: '/app/payouts',   label: 'Payouts',     Icon: Wallet         },
  { to: '/app/profile',   label: 'Profile',     Icon: User           },
];

const SUPPORTER_NAV = [
  { to: '/app/discover',  label: 'Discover',          Icon: Compass },
  { to: '/app/following', label: 'Following',          Icon: Heart   },
  { to: '/app/history',   label: 'My Support History', Icon: History },
  { to: '/app/profile',   label: 'Profile',            Icon: User    },
];

// ─── Component ─────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, mobileOpen, onNavClick, onToggle }) {
  const { role } = useAuth();
  const navItems  = role === 'supporter' ? SUPPORTER_NAV : CREATOR_NAV;

  const sidebarClass = [
    'ap-sidebar',
    collapsed   && 'is-collapsed',
    mobileOpen  && 'is-mobile-open',
  ].filter(Boolean).join(' ');

  return (
    <aside className={sidebarClass} aria-label="Main navigation">
      {/* ── Logo row ─────────────────────────────────────────────────── */}
      <div className="sb-logo">
        <div className="sb-monogram" aria-hidden="true">A</div>
        <span className="sb-wordmark">AfroPatron</span>
      </div>

      {/* ── Nav items ────────────────────────────────────────────────── */}
      <nav className="sb-nav">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sb-nav-item${isActive ? ' active' : ''}`
            }
            onClick={onNavClick}
            title={collapsed ? label : undefined}
            aria-label={label}
          >
            <Icon size={20} className="sb-icon" strokeWidth={1.75} />
            <span className="sb-nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Collapse toggle (desktop) ─────────────────────────────────── */}
      <div className="sb-toggle-row">
        <button
          className="sb-toggle-btn"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed
            ? <ChevronRight size={18} strokeWidth={2} />
            : <ChevronLeft  size={18} strokeWidth={2} />}
        </button>
      </div>
    </aside>
  );
}
