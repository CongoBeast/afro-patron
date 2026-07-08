/**
 * Topbar.js — Live notification bell + count badge + slide-down panel.
 * Loads getNotifications() on mount and on panel open.
 * Marks all read via markAllNotificationsRead().
 */

import React, { forwardRef, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate }   from 'react-router-dom';
import Dropdown                from 'react-bootstrap/Dropdown';
import {
  Bell, Menu, User, LogOut, RefreshCw,
  ArrowDownLeft, Star, ShieldCheck, Rss, CheckCircle2,
} from 'lucide-react';
import { useAuth }             from '../../context/AuthContext';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/mockApi';

// ─── Notification icon map ─────────────────────────────────────────────────

const NOTIF_ICON = {
  pledge:           { Icon: ArrowDownLeft, color: 'var(--color-success)' },
  pledge_confirmed: { Icon: CheckCircle2,  color: 'var(--color-success)' },
  milestone:        { Icon: Star,          color: 'var(--color-warning)' },
  kyc:              { Icon: ShieldCheck,   color: 'var(--color-indigo)'  },
  post:             { Icon: Rss,           color: 'var(--color-slate-blue)' },
};
const DEFAULT_NOTIF = { Icon: Bell, color: 'var(--color-slate-blue)' };

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  const mins  = Math.floor(diff / 60_000);
  if (days  > 14) return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  if (days  > 0)  return `${days}d ago`;
  if (hours > 0)  return `${hours}h ago`;
  if (mins  > 0)  return `${mins}m ago`;
  return 'just now';
}

// ─── User-menu custom toggle ───────────────────────────────────────────────

const UserToggle = forwardRef(function UserToggle({ onClick, user, initials }, ref) {
  return (
    <button
      ref={ref}
      className="topbar-user-btn"
      onClick={e => { e.preventDefault(); onClick(e); }}
      aria-label="User menu"
    >
      <div className="topbar-avatar" aria-hidden="true">{initials}</div>
      <span className="topbar-user-name d-none d-sm-inline">
        {user.name.split(' ')[0]}
      </span>
    </button>
  );
});

// ─── Topbar ────────────────────────────────────────────────────────────────

export default function Topbar({ title, onHamburgerClick }) {
  const { user, logout }    = useAuth();
  const navigate             = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [panelOpen,     setPanelOpen]     = useState(false);

  const initials = user
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ── Load / refresh ──────────────────────────────────────────────────────
  const loadNotifs = useCallback(async () => {
    if (!user?.id) return;
    try {
      const ns = await getNotifications(user.id);
      setNotifications(ns);
    } catch {}
  }, [user?.id]);

  useEffect(() => { loadNotifs(); }, [loadNotifs]);

  // Re-load when panel opens to catch new notifications
  function togglePanel() {
    setPanelOpen(p => {
      if (!p) loadNotifs(); // refresh on open
      return !p;
    });
  }

  // ── Mark all read ───────────────────────────────────────────────────────
  async function handleMarkAll() {
    if (!user?.id) return;
    await markAllNotificationsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  // ── Notification item click ─────────────────────────────────────────────
  async function handleNotifClick(notif) {
    setPanelOpen(false);
    if (!notif.isRead) {
      markNotificationRead(notif.id).catch(() => {});
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    }
    if (notif.linkTo) navigate(notif.linkTo);
  }

  // ── Auth actions ────────────────────────────────────────────────────────
  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleSwitch = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <header className="ap-topbar">
      {/* Left */}
      <div className="topbar-left">
        <button className="topbar-icon-btn topbar-hamburger" onClick={onHamburgerClick} aria-label="Open navigation">
          <Menu size={20} strokeWidth={2} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      {/* Right */}
      <div className="topbar-right">

        {/* ── Notification bell + panel ─────────────────────────────── */}
        <div style={{ position: 'relative' }}>
          <button
            className="topbar-icon-btn"
            onClick={togglePanel}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            aria-expanded={panelOpen}
          >
            <Bell size={20} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="notif-badge-count" aria-hidden="true">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Backdrop */}
          {panelOpen && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 498 }}
              onClick={() => setPanelOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Panel */}
          {panelOpen && (
            <div className="notif-panel" role="region" aria-label="Notifications">
              <div className="notif-panel-header">
                <span className="notif-panel-title">Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={handleMarkAll}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-panel-body">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications yet</div>
                ) : (
                  notifications.map(n => {
                    const cfg = NOTIF_ICON[n.type] ?? DEFAULT_NOTIF;
                    return (
                      <div
                        key={n.id}
                        className={`notif-item${!n.isRead ? ' is-unread' : ''}`}
                        onClick={() => handleNotifClick(n)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && handleNotifClick(n)}
                      >
                        <div className="notif-item-icon" style={{ color: cfg.color }}>
                          <cfg.Icon size={14} strokeWidth={1.75} />
                        </div>
                        <div className="notif-item-text">{n.message}</div>
                        <div className="notif-item-time">{timeAgo(n.createdAt)}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── User menu ────────────────────────────────────────────── */}
        {user && (
          <Dropdown align="end">
            <Dropdown.Toggle as={UserToggle} user={user} initials={initials} />
            <Dropdown.Menu>
              <div className="px-3 py-2">
                <div className="fw-semibold text-navy" style={{ fontSize: '0.875rem' }}>{user.name}</div>
                <div className="text-slate" style={{ fontSize: '0.75rem', marginTop: 1 }}>{user.email}</div>
              </div>
              <Dropdown.Divider />
              <Dropdown.Item as={Link} to="/app/profile">
                <User size={15} strokeWidth={1.75} className="me-2 text-slate" />Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={handleSwitch}>
                <RefreshCw size={15} strokeWidth={1.75} className="me-2 text-slate" />Switch account
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <LogOut size={15} strokeWidth={1.75} className="me-2" />Log out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>
    </header>
  );
}