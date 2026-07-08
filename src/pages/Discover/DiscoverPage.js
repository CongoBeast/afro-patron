/**
 * DiscoverPage.js — Supporter view: search + category filter + creator grid.
 * Data comes from getCreators() + getCampaigns() per creator.
 * All filtering is client-side.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button   from 'react-bootstrap/Button';
import { Search, Compass, ShieldCheck } from 'lucide-react';
import { getCreators, getCampaigns } from '../../services/mockApi';

// ─── Helpers ───────────────────────────────────────────────────────────────

function pct(current, goal) {
  return Math.min(100, Math.round((current / goal) * 100));
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLOR = {
  'Art & Illustration':  '#4B5694',
  'Music & Podcasts':    '#2D9B6F',
  'Writing & Publishing':'#C17D3C',
  'Photography':         '#8B5CF6',
};
function avatarBg(cat) { return AVATAR_COLOR[cat] ?? '#4B5694'; }

// ─── Creator card ──────────────────────────────────────────────────────────

function CreatorCard({ creator, featuredCampaign }) {
  const progress = featuredCampaign
    ? pct(featuredCampaign.currentAmount, featuredCampaign.goalAmount)
    : null;

  const bioExcerpt = creator.bio.length > 110
    ? `${creator.bio.slice(0, 110)}…`
    : creator.bio;

  return (
    <div className="disc-card">
      {/* Avatar */}
      <div
        className="disc-card-avatar"
        style={{ background: avatarBg(creator.category) }}
        aria-hidden="true"
      >
        {getInitials(creator.displayName)}
      </div>

      {/* Name + badges */}
      <div className="disc-card-name">{creator.displayName}</div>
      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
        <span className="badge-ap badge-slate">{creator.category}</span>
        {creator.kycStatus === 'verified' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-indigo)' }}>
            <ShieldCheck size={12} strokeWidth={2.25} />
            Verified
          </span>
        )}
      </div>

      {/* Bio excerpt */}
      <p className="disc-card-bio">{bioExcerpt}</p>

      {/* Featured active campaign */}
      {featuredCampaign && (
        <div className="disc-mini-campaign">
          <div className="disc-mini-title">
            {featuredCampaign.title.length > 42
              ? `${featuredCampaign.title.slice(0, 42)}…`
              : featuredCampaign.title}
          </div>
          <div className="ap-bar mt-1" style={{ height: 5 }}>
            <div className="ap-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-blue)', marginTop: '0.25rem' }}>
            {progress}% funded · {creator.supporterCount} supporters
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <Button
          as={Link}
          to={`/creator/${creator.uniqueSlug}`}
          variant="outline-primary"
          size="sm"
          className="w-100"
        >
          View profile →
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [creators,    setCreators]    = useState([]);
  const [campaignMap, setCampaignMap] = useState({});  // userId → Campaign[]
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  // Load creators + their active campaigns in parallel
  useEffect(() => {
    async function load() {
      const cs = await getCreators();
      setCreators(cs);

      // Fetch active campaigns for every creator simultaneously
      const results = await Promise.all(
        cs.map(c => getCampaigns(c.userId, 'active').then(camps => [c.userId, camps])),
      );
      setCampaignMap(Object.fromEntries(results));
    }
    load().finally(() => setLoading(false));
  }, []);

  // Derive category list from loaded creators
  const categories = useMemo(
    () => [...new Set(creators.map(c => c.category))],
    [creators],
  );

  // Client-side filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return creators.filter(c => {
      const matchSearch =
        !q ||
        c.displayName.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      const matchCat = !selectedCat || c.category === selectedCat;
      return matchSearch && matchCat;
    });
  }, [creators, search, selectedCat]);

  return (
    <div>
      <div className="page-header">
        <h1>Discover Creators</h1>
        <p>Find Zimbabwean creators doing meaningful work and fund the projects you love.</p>
      </div>

      {/* ── Search + category filters ──────────────────────────────────── */}
      <div className="disc-controls mb-4">
        {/* Search bar */}
        <div className="disc-search-wrap">
          <Search size={15} className="disc-search-icon" strokeWidth={1.75} />
          <input
            type="search"
            className="form-control disc-search-input"
            placeholder="Search by name, category, or keyword…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search creators"
          />
        </div>

        {/* Category pills */}
        {!loading && categories.length > 0 && (
          <div className="cat-pills">
            <button
              className={`cat-pill${!selectedCat ? ' active' : ''}`}
              onClick={() => setSelectedCat('')}
            >
              All creators
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`cat-pill${selectedCat === cat ? ' active' : ''}`}
                onClick={() => setSelectedCat(c => c === cat ? '' : cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-slate-blue)', marginBottom: '1rem' }}>
          {filtered.length} creator{filtered.length !== 1 ? 's' : ''}
          {selectedCat && ` in ${selectedCat}`}
          {search && ` matching "${search}"`}
        </p>
      )}

      {/* ── Creator grid ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="disc-grid">
          {[0, 1].map(i => (
            <div key={i} className="disc-card" style={{ opacity: 0.4 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(114,136,174,0.18)', margin: '0 auto 1rem' }} />
              <div style={{ height: 18, width: '60%', background: 'rgba(114,136,174,0.12)', borderRadius: 6, margin: '0 auto 8px' }} />
              <div style={{ height: 13, width: '40%', background: 'rgba(114,136,174,0.10)', borderRadius: 5, margin: '0 auto' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Compass size={28} strokeWidth={1.5} /></div>
          <h3>No creators found</h3>
          <p>Try a different search term or clear the category filter.</p>
        </div>
      ) : (
        <div className="disc-grid">
          {filtered.map(creator => (
            <CreatorCard
              key={creator.userId}
              creator={creator}
              featuredCampaign={(campaignMap[creator.userId] ?? [])[0] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}