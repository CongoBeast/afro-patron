/**
 * DashboardPage.js — Creator home: stat cards, activity feed,
 * funding link copy/share, quick actions.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Row    from 'react-bootstrap/Row';
import Col    from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import {
  TrendingUp, Users, Rocket, Wallet,
  Bell, Copy, Check, Share2,
  Plus, FileText, ArrowDownLeft, ShieldCheck, Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getCreatorByUserId,
  getAnalytics,
  getCampaigns,
  getNotifications,
  getPayoutRequests,
} from '../../services/mockApi';

// ─── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  const mins  = Math.floor(diff / 60_000);
  if (days  > 30) return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  if (days  > 0)  return `${days}d ago`;
  if (hours > 0)  return `${hours}h ago`;
  if (mins  > 0)  return `${mins}m ago`;
  return 'just now';
}

const NOTIF_ICON = {
  pledge:    { Icon: ArrowDownLeft, color: 'var(--color-success)' },
  milestone: { Icon: Star,          color: 'var(--color-warning)' },
  kyc:       { Icon: ShieldCheck,   color: 'var(--color-indigo)'  },
  post:      { Icon: FileText,      color: 'var(--color-slate-blue)' },
};

const QUICK_ACTIONS = [
  { label: 'New campaign', Icon: Plus,     to: '/app/campaigns', color: 'indigo'  },
  { label: 'New post',     Icon: FileText, to: '/app/feed',      color: 'success' },
  { label: 'Payouts',      Icon: Wallet,   to: '/app/payouts',   color: 'navy'    },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function StatCard({ label, value, Icon, colorClass }) {
  return (
    <div className="dash-stat-card">
      <div className={`dash-stat-icon dash-stat-icon--${colorClass}`}>
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="dash-stat-value">{value}</div>
      <div className="dash-stat-label">{label}</div>
    </div>
  );
}

function ActivityItem({ notif }) {
  const cfg = NOTIF_ICON[notif.type] ?? NOTIF_ICON.post;
  return (
    <div className={`dash-activity-item${!notif.isRead ? ' is-unread' : ''}`}>
      <div className="dash-activity-icon" style={{ color: cfg.color }}>
        <cfg.Icon size={15} strokeWidth={1.75} />
      </div>
      <div className="dash-activity-text">{notif.message}</div>
      <div className="dash-activity-time">{timeAgo(notif.createdAt)}</div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading,  setLoading]  = useState(true);
  const [creator,  setCreator]  = useState(null);
  const [analytics,setAnalytics]= useState(null);
  const [campaigns,setCampaigns]= useState([]);
  const [notifs,   setNotifs]   = useState([]);
  const [payouts,  setPayouts]  = useState([]);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getCreatorByUserId(user.id),
      getAnalytics(user.id, '30d'),
      getCampaigns(user.id, 'active'),
      getNotifications(user.id),
      getPayoutRequests(user.id),
    ]).then(([c, a, camps, ns, pays]) => {
      setCreator(c);
      setAnalytics(a);
      setCampaigns(camps);
      setNotifs(ns);
      setPayouts(pays);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  const paidOut = payouts
    .filter(p => p.status === 'completed')
    .reduce((s, p) => s + p.amount, 0);

  const availableBalance = Math.max(0, (analytics?.totalEarned ?? 0) - paidOut);

  const handleCopy = useCallback(() => {
    if (!creator) return;
    navigator.clipboard?.writeText(creator.fundingLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [creator]);

  const handleShare = useCallback(async () => {
    if (!creator) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Support ${creator.displayName} on AfroPatron`,
          url:   creator.fundingLink,
        });
      } catch {}
    } else {
      handleCopy();
    }
  }, [creator, handleCopy]);

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div style={{ height: 28, width: 220, background: 'rgba(114,136,174,0.12)', borderRadius: 8, marginBottom: 8 }} />
          <div style={{ height: 16, width: 280, background: 'rgba(114,136,174,0.10)', borderRadius: 6 }} />
        </div>
        <div className="dash-stat-grid mb-4">
          {[0,1,2,3].map(i => (
            <div key={i} className="dash-stat-card" style={{ opacity: 0.5 }}>
              <div style={{ height: 40, background: 'rgba(114,136,174,0.1)', borderRadius: 8, marginBottom: 12 }} />
              <div style={{ height: 32, width: '60%', background: 'rgba(114,136,174,0.12)', borderRadius: 6, marginBottom: 8 }} />
              <div style={{ height: 14, width: '80%', background: 'rgba(114,136,174,0.08)', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Stats ───────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Total raised',      value: `$${(analytics?.totalEarned ?? 0).toLocaleString()}`, Icon: TrendingUp, colorClass: 'indigo'  },
    { label: 'Supporters',        value: analytics?.totalSupporters ?? 0,                        Icon: Users,      colorClass: 'success' },
    { label: 'Active campaigns',  value: campaigns.length,                                        Icon: Rocket,     colorClass: 'warning' },
    { label: 'Available balance', value: `$${availableBalance.toLocaleString()}`,                  Icon: Wallet,     colorClass: 'navy'   },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>
          Welcome back, {user.name.split(' ')[0]}.
          {analytics?.periodEarned > 0 && (
            <> You've raised <strong>${analytics.periodEarned.toLocaleString()}</strong> in the last 30 days.</>
          )}
        </p>
      </div>

      {/* Stat cards */}
      <div className="dash-stat-grid mb-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Two-column body */}
      <Row className="g-4 align-items-start">

        {/* ── Activity feed ─────────────────────────────────────────── */}
        <Col lg={8}>
          <div className="card-ap overflow-hidden">
            <div className="dash-section-head">
              <span className="dash-section-title">Recent activity</span>
              <Link to="/app/analytics" className="dash-see-all">View analytics →</Link>
            </div>

            {notifs.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem 2rem' }}>
                <div className="empty-state-icon"><Bell size={24} strokeWidth={1.5} /></div>
                <h3>No activity yet</h3>
                <p>Pledges, milestones, and campaign events will appear here.</p>
              </div>
            ) : (
              <div className="dash-activity-list">
                {notifs.slice(0, 8).map(n => <ActivityItem key={n.id} notif={n} />)}
              </div>
            )}
          </div>
        </Col>

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <Col lg={4}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

            {/* Funding link card */}
            {creator && (
              <div className="card-ap p-4">
                <div className="dash-link-eyebrow">Your funding link</div>
                <div className="dash-link-url">
                  {creator.fundingLink.replace('https://', '')}
                </div>
                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleCopy}
                    className="d-inline-flex align-items-center gap-1"
                    style={{ flex: 1 }}
                  >
                    {copied
                      ? <><Check size={13} strokeWidth={2.5} /> Copied!</>
                      : <><Copy size={13} strokeWidth={1.75} /> Copy</>}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleShare}
                    className="d-inline-flex align-items-center gap-1"
                    style={{ flex: 1 }}
                  >
                    <Share2 size={13} strokeWidth={1.75} /> Share
                  </Button>
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: 'var(--border-divider)' }}>
                  <Link
                    to={`/creator/${creator.uniqueSlug}`}
                    target="_blank"
                    style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-indigo)' }}
                  >
                    Preview public page →
                  </Link>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="card-ap p-4">
              <div className="dash-section-title mb-3">Quick actions</div>
              <div className="d-flex flex-column gap-2">
                {QUICK_ACTIONS.map(({ label, Icon, to, color }) => (
                  <button
                    key={to}
                    className="dash-quick-btn"
                    onClick={() => navigate(to)}
                  >
                    <div className={`dash-quick-icon dash-quick-icon--${color}`}>
                      <Icon size={18} strokeWidth={1.75} />
                    </div>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </Col>

      </Row>
    </div>
  );
}