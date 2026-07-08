/**
 * FollowingPage.js — Supporter's "following" view.
 * Derives followed creators from transaction history (no separate follow table).
 */

import React, { useEffect, useState } from 'react';
import { Link }     from 'react-router-dom';
import Button       from 'react-bootstrap/Button';
import { Heart, ShieldCheck } from 'lucide-react';
import { useAuth }  from '../../context/AuthContext';
import { getTransactions, getCreators, getCampaigns } from '../../services/mockApi';

const AVATAR_COLOR = {
  'Art & Illustration': '#4B5694',
  'Music & Podcasts':   '#2D9B6F',
};
function avatarBg(cat) { return AVATAR_COLOR[cat] ?? '#4B5694'; }
function getInitials(name) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }
function pct(c, g) { return Math.min(100, Math.round((c / g) * 100)); }

export default function FollowingPage() {
  const { user } = useAuth();
  const [creators,    setCreators]    = useState([]);
  const [campaignMap, setCampaignMap] = useState({});
  const [totalGiven,  setTotalGiven]  = useState(0);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const [txns, allCreators] = await Promise.all([
        getTransactions({ supporterId: user.id }),
        getCreators(),
      ]);

      setTotalGiven(txns.reduce((s, t) => s + t.amount, 0));

      // Derive unique creator IDs from transaction history
      const pledgedIds = [...new Set(txns.map(t => t.creatorId))];
      const followed   = allCreators.filter(c => pledgedIds.includes(c.userId));
      setCreators(followed);

      // Active campaigns for each followed creator
      const map = {};
      await Promise.all(followed.map(async c => {
        const camps = await getCampaigns(c.userId, 'active');
        map[c.userId] = camps;
      }));
      setCampaignMap(map);
    }
    load().finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return (
    <div>
      <div className="page-header"><h1>Following</h1></div>
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-slate-blue)' }}>Loading…</div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Following</h1>
        <p>
          {creators.length === 0
            ? 'Pledge to a creator to see them here.'
            : `You've supported ${creators.length} creator${creators.length !== 1 ? 's' : ''} · $${totalGiven.toLocaleString()} total given`}
        </p>
      </div>

      {creators.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Heart size={28} strokeWidth={1.5} /></div>
          <h3>No creators followed yet</h3>
          <p>Once you pledge to a creator, they'll appear here.</p>
          <Button as={Link} to="/app/discover" variant="primary" className="mt-3">Discover creators</Button>
        </div>
      ) : (
        <div className="disc-grid">
          {creators.map(creator => {
            const campaign = (campaignMap[creator.userId] ?? [])[0] ?? null;
            const progress = campaign ? pct(campaign.currentAmount, campaign.goalAmount) : null;

            return (
              <div key={creator.userId} className="disc-card">
                <div className="disc-card-avatar" style={{ background: avatarBg(creator.category) }}>
                  {getInitials(creator.displayName)}
                </div>
                <div className="disc-card-name">{creator.displayName}</div>
                <div className="d-flex align-items-center justify-content-center gap-2 mb-2 flex-wrap">
                  <span className="badge-ap badge-slate">{creator.category}</span>
                  {creator.kycStatus === 'verified' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-indigo)' }}>
                      <ShieldCheck size={12} strokeWidth={2.25} />Verified
                    </span>
                  )}
                </div>
                <p className="disc-card-bio">
                  {creator.bio.length > 110 ? `${creator.bio.slice(0, 110)}…` : creator.bio}
                </p>
                {campaign && (
                  <div className="disc-mini-campaign">
                    <div className="disc-mini-title">
                      {campaign.title.length > 42 ? `${campaign.title.slice(0, 42)}…` : campaign.title}
                    </div>
                    <div className="ap-bar mt-1" style={{ height: 5 }}>
                      <div className="ap-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-blue)', marginTop: '0.25rem' }}>
                      {progress}% funded
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                  <Button as={Link} to={`/creator/${creator.uniqueSlug}`}
                    variant="outline-primary" size="sm" className="w-100">
                    View profile →
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}