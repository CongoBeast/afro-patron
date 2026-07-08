/**
 * CreatorProfilePage.js
 *
 * Public-facing creator page — standalone (no AppShell), always clean/full-width
 * so the shareable link looks great for both logged-in and logged-out visitors.
 *
 * Route: /creator/:slug
 *
 * Data flow:
 *   getCreatorBySlug(slug) → creator profile
 *   getCampaigns(userId, 'active') → active campaigns
 *   getPosts([userId]) → reverse-chron feed
 *
 * Pledge modal is wired (state + open/close handlers) but content is a
 * placeholder — built out in Task 6.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row       from 'react-bootstrap/Row';
import Col       from 'react-bootstrap/Col';
import Button    from 'react-bootstrap/Button';
import {
  ShieldCheck,
  Copy,
  Check,
  ArrowLeft,
  Calendar,
  Users,
  Megaphone,
  RefreshCw,
  Heart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { getCreatorBySlug, getCampaigns, getPosts } from '../../services/mockApi';
import PledgeModal from '../../components/PledgeModal/PledgeModal';

// ─── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  const mins  = Math.floor(diff / 60_000);
  if (days > 60)  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (days > 0)   return `${days}d ago`;
  if (hours > 0)  return `${hours}h ago`;
  if (mins > 0)   return `${mins}m ago`;
  return 'just now';
}

function daysLeft(deadline) {
  return Math.max(0, Math.ceil((new Date(deadline) - Date.now()) / 86_400_000));
}

function pct(current, goal) {
  return Math.min(100, Math.round((current / goal) * 100));
}

function fmt(amount) {
  return `$${Number(amount).toLocaleString()}`;
}

function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Category → avatar background color mapping
const CATEGORY_COLOR = {
  'Art & Illustration': 'var(--color-indigo)',
  'Music & Podcasts':   'var(--color-success)',
  'Writing & Publishing': '#C17D3C',
  'Photography':        '#8B5CF6',
};
function avatarBg(category) {
  return CATEGORY_COLOR[category] ?? 'var(--color-indigo)';
}

// Post type config
const POST_META = {
  update:       { label: 'Update',       Icon: RefreshCw, badgeClass: 'badge-indigo' },
  announcement: { label: 'Announcement', Icon: Megaphone,  badgeClass: 'badge-slate'  },
};

// ─── Sub-components ────────────────────────────────────────────────────────

/** Skeleton shown while data loads */
function LoadingSkeleton() {
  const shimmer = {
    background: 'rgba(114,136,174,0.12)',
    borderRadius: 8,
    animation: 'none',
  };
  return (
    <div className="cp-page">
      <div style={{ height: 64, borderBottom: '1px solid rgba(114,136,174,0.15)' }} />
      <div style={{ height: 220, background: 'var(--color-navy)' }} />
      <Container className="mt-4">
        <div className="d-flex align-items-flex-end gap-3" style={{ marginTop: -52, alignItems: 'flex-end' }}>
          <div style={{ ...shimmer, width: 96, height: 96, borderRadius: '50%', flexShrink: 0, border: '4px solid var(--color-cream)' }} />
          <div style={{ paddingBottom: 4 }}>
            <div style={{ ...shimmer, height: 28, width: 200, marginBottom: 10 }} />
            <div style={{ ...shimmer, height: 16, width: 140 }} />
          </div>
        </div>
        <div style={{ ...shimmer, height: 80, marginTop: 28, borderRadius: 12 }} />
        <div style={{ ...shimmer, height: 160, marginTop: 16, borderRadius: 16 }} />
      </Container>
    </div>
  );
}

/** Individual campaign funding card */
function CampaignCard({ campaign, onSupport }) {
  const progress = pct(campaign.currentAmount, campaign.goalAmount);
  const left     = daysLeft(campaign.deadline);
  const firstPara = campaign.description.split('\n\n')[0];

  return (
    <div className="cp-campaign-card">
      {/* Title + teaser */}
      <div>
        <h3 className="cp-campaign-title">{campaign.title}</h3>
        <p className="cp-campaign-desc">{firstPara}</p>
      </div>

      {/* Progress */}
      <div>
        <div className="cp-amounts-row">
          <span className="cp-raised">{fmt(campaign.currentAmount)}</span>
          <span className="cp-goal">raised of {fmt(campaign.goalAmount)} goal</span>
          <span className="badge-ap badge-indigo ms-auto">{progress}%</span>
        </div>
        <div className="ap-bar mt-2" style={{ height: 10 }}>
          <div
            className={`ap-bar-fill${progress >= 100 ? ' success' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer: stats + CTA */}
      <div className="cp-campaign-footer">
        <div className="cp-campaign-stats">
          <Users size={13} strokeWidth={1.75} className="me-1" />
          {campaign.backerCount} backer{campaign.backerCount !== 1 ? 's' : ''}
          <span className="mx-2" aria-hidden="true">·</span>
          <Calendar size={13} strokeWidth={1.75} className="me-1" />
          {left > 0 ? `${left} day${left !== 1 ? 's' : ''} left` : 'Ended'}
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSupport(campaign)}
        >
          Support this campaign
        </Button>
      </div>
    </div>
  );
}

/** Individual post card with expand/collapse for long bodies */
function PostCard({ post }) {
  const [expanded, setExpanded] = useState(false);
  const meta      = POST_META[post.type] ?? POST_META.announcement;
  const { Icon }  = meta;
  const paragraphs = post.body.split('\n\n').filter(Boolean);
  const showToggle = paragraphs.length > 2;
  const displayed  = !expanded && showToggle ? paragraphs.slice(0, 2) : paragraphs;

  return (
    <article className="cp-post-card">
      {/* Type + timestamp */}
      <div className="cp-post-meta">
        <span className={`badge-ap ${meta.badgeClass}`}>
          <Icon size={11} strokeWidth={2} />
          {meta.label}
        </span>
        <time className="cp-post-timestamp" dateTime={post.createdAt}>
          {timeAgo(post.createdAt)}
        </time>
      </div>

      <h4 className="cp-post-title">{post.title}</h4>

      <div className="cp-post-body">
        {displayed.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {showToggle && (
        <button
          className="cp-read-more"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
        >
          {expanded
            ? <><ChevronUp size={13} strokeWidth={2.5} /> Show less</>
            : <><ChevronDown size={13} strokeWidth={2.5} /> Read more</>}
        </button>
      )}
    </article>
  );
}


// ─── Main page ────────────────────────────────────────────────────────────

export default function CreatorProfilePage() {
  const { slug } = useParams();

  const [loading,      setLoading]      = useState(true);
  const [creator,      setCreator]      = useState(null);
  const [campaigns,    setCampaigns]    = useState([]);
  const [posts,        setPosts]        = useState([]);
  const [error,        setError]        = useState(null);
  const [pledgeTarget, setPledgeTarget] = useState(null);
  const [copied,       setCopied]       = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      try {
        const c = await getCreatorBySlug(slug);
        if (!c) {
          if (!cancelled) setError('Creator not found');
          return;
        }
        if (cancelled) return;
        setCreator(c);

        const [camps, ps] = await Promise.all([
          getCampaigns(c.userId, 'active'),
          getPosts([c.userId]),
        ]);
        if (!cancelled) {
          setCampaigns(camps);
          setPosts(ps);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [slug]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCopyLink = useCallback(() => {
    if (!creator) return;
    const text = creator.fundingLink;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [creator]);

  const openCampaignPledge = useCallback(campaign => {
    setPledgeTarget({ campaign });
  }, []);

  const openDirectPledge = useCallback(() => {
    setPledgeTarget({ direct: true });
  }, []);

  const closePledge = useCallback(() => setPledgeTarget(null), []);

  // ── States ───────────────────────────────────────────────────────────────
  if (loading) return <LoadingSkeleton />;

  if (error || !creator) {
    return (
      <div className="cp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="text-center p-4">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--r-md)',
              background: 'var(--color-danger-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '1.75rem',
            }}
          >
            🫤
          </div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Creator not found
          </h2>
          <p style={{ color: 'var(--color-slate-blue)', marginBottom: '1.75rem', fontSize: '0.9375rem' }}>
            We couldn't find anyone at <strong>/creator/{slug}</strong>
          </p>
          <Button as={Link} to="/" variant="primary">
            Back to AfroPatron
          </Button>
        </div>
      </div>
    );
  }

  const avatarColor = avatarBg(creator.category);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="cp-page">

      {/* ════════════════════════════════════════════════════════════════
          Nav bar
      ════════════════════════════════════════════════════════════════ */}
      <nav className="cp-nav" aria-label="Profile navigation">
        <Link to="/" className="cp-nav-brand">AfroPatron</Link>
        <Link to="/" className="cp-nav-back">
          <ArrowLeft size={14} strokeWidth={2.25} />
          Explore creators
        </Link>
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          Cover banner
      ════════════════════════════════════════════════════════════════ */}
      <div
        className="cp-cover"
        aria-hidden="true"
        style={
          creator.coverImageUrl
            ? { backgroundImage: `url(${creator.coverImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}
        }
      >
        {!creator.coverImageUrl && <div className="cp-cover-pattern" />}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          Identity bar
      ════════════════════════════════════════════════════════════════ */}
      <div className="cp-identity-wrap">
        <Container>
          <div className="cp-identity-bar">
            {/* Avatar */}
            <div
              className="cp-avatar-lg"
              aria-label={`${creator.displayName} avatar`}
              style={{ background: avatarColor }}
            >
              {getInitials(creator.displayName)}
            </div>

            {/* Name + meta */}
            <div className="cp-info">
              <h1 className="cp-name">{creator.displayName}</h1>
              <div className="cp-meta-row">
                <span className="badge-ap badge-slate">{creator.category}</span>

                {creator.kycStatus === 'verified' && (
                  <span className="cp-verified-badge">
                    <ShieldCheck size={13} strokeWidth={2.25} />
                    Verified
                  </span>
                )}

                <span className="cp-supporter-count">
                  {creator.supporterCount.toLocaleString()} supporters
                </span>
              </div>
            </div>

            {/* Copy link action */}
            <div className="cp-actions ms-auto">
              <button
                className="cp-copy-btn"
                onClick={handleCopyLink}
                aria-label="Copy funding link"
                title="Copy funding link"
              >
                {copied
                  ? <><Check size={13} strokeWidth={2.5} /> Copied!</>
                  : <><Copy size={13} strokeWidth={1.75} /> Copy link</>}
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          Body — two-column layout
      ════════════════════════════════════════════════════════════════ */}
      <div className="cp-body">
        <Container>
          <Row className="g-4 g-lg-5 align-items-start">

            {/* ── Left column — bio, campaigns, feed ─────────────────── */}
            <Col lg={8}>

              {/* Bio */}
              <section className="cp-section" aria-label="About">
                <p className="cp-bio">{creator.bio}</p>
              </section>

              {/* Active campaigns */}
              {campaigns.length > 0 && (
                <section className="cp-section" aria-label="Active campaigns">
                  <h2 className="cp-section-title">Active campaigns</h2>
                  <div className="d-flex flex-column gap-3">
                    {campaigns.map(campaign => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        onSupport={openCampaignPledge}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Posts / feed */}
              {posts.length > 0 && (
                <section className="cp-section" aria-label="Recent updates">
                  <h2 className="cp-section-title">Recent updates</h2>
                  <div className="d-flex flex-column gap-3">
                    {posts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty state if no campaigns and no posts */}
              {campaigns.length === 0 && posts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Megaphone size={28} strokeWidth={1.5} />
                  </div>
                  <h3>Nothing here yet</h3>
                  <p>
                    {creator.displayName.split(' ')[0]} hasn't posted any updates yet.
                    Follow to be notified when they do.
                  </p>
                </div>
              )}
            </Col>

            {/* ── Right column — sidebar (sticky) ────────────────────── */}
            <Col lg={4}>
              <div className="cp-sidebar-sticky">

                {/* Support directly */}
                <div className="cp-support-direct mb-3">
                  <div>
                    <h3>Support {creator.displayName.split(' ')[0]} directly</h3>
                    <p>
                      Fund the work — not just a single campaign. Your pledge
                      goes straight to the creator.
                    </p>
                  </div>
                  <Button
                    variant="light"
                    size="sm"
                    className="cp-support-direct-btn"
                    onClick={openDirectPledge}
                  >
                    <Heart size={13} strokeWidth={2} />
                    Support now
                  </Button>
                </div>

                {/* Stats */}
                <div className="card-ap p-4 mb-3">
                  <div className="cp-stat-row">
                    <span className="cp-stat-label">Total raised</span>
                    <span className="cp-stat-value">{fmt(creator.totalEarned)}</span>
                  </div>
                  <div className="cp-stat-row">
                    <span className="cp-stat-label">Supporters</span>
                    <span className="cp-stat-value">
                      {creator.supporterCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="cp-stat-row">
                    <span className="cp-stat-label">Member since</span>
                    <span className="cp-stat-value">
                      {new Date(creator.joinedAt).toLocaleDateString('en-GB', {
                        month: 'long',
                        year:  'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Funding link */}
                <div className="card-ap p-4">
                  <div className="cp-link-label">Funding link</div>
                  <div className="cp-link-display">
                    {creator.fundingLink.replace('https://', '')}
                  </div>
                  <button
                    className="cp-copy-link-full"
                    onClick={handleCopyLink}
                    aria-live="polite"
                  >
                    {copied
                      ? <><Check size={13} strokeWidth={2.5} /> Copied to clipboard!</>
                      : <><Copy size={13} strokeWidth={1.75} /> Copy link</>}
                  </button>
                </div>

              </div>
            </Col>

          </Row>
        </Container>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          Footer
      ════════════════════════════════════════════════════════════════ */}
      <footer className="cp-footer">
        <Container>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <Link to="/" className="cp-footer-brand">AfroPatron</Link>
            <p className="cp-footer-copy">
              Creator funding built for Zimbabwe 🇿🇼
            </p>
          </div>
        </Container>
      </footer>

      {/* ════════════════════════════════════════════════════════════════
          Pledge modal — wired, placeholder content (Task 6)
      ════════════════════════════════════════════════════════════════ */}
      {pledgeTarget && (
        <PledgeModal
          target={pledgeTarget}
          creator={creator}
          onClose={closePledge}
        />
      )}

    </div>
  );
}