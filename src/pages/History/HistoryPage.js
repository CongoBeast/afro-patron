/**
 * HistoryPage.js — Supporter's pledge history.
 * Loads getTransactions({ supporterId }) + getCreators() to resolve creator info.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, CheckCircle2 } from 'lucide-react';
import { useAuth }      from '../../context/AuthContext';
import { getTransactions, getCreators } from '../../services/mockApi';

const AVATAR_COLOR = {
  'Art & Illustration': '#4B5694',
  'Music & Podcasts':   '#2D9B6F',
};
function avatarBg(cat) { return AVATAR_COLOR[cat] ?? '#4B5694'; }
function initials(name) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const METHOD_LABEL = { ecocash: 'EcoCash', card: 'Card', bank_transfer: 'Bank Transfer' };

export default function HistoryPage() {
  const { user } = useAuth();
  const [txns,     setTxns]     = useState([]);
  const [cMap,     setCMap]     = useState({});   // creatorId → CreatorProfile
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      getTransactions({ supporterId: user.id }),
      getCreators(),
    ]).then(([t, cs]) => {
      setTxns(t);
      const map = {};
      cs.forEach(c => { map[c.userId] = c; });
      setCMap(map);
    }).finally(() => setLoading(false));
  }, [user.id]);

  const totalGiven = txns.reduce((s, t) => s + t.amount, 0);

  if (loading) return (
    <div>
      <div className="page-header"><h1>My Support History</h1></div>
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-slate-blue)' }}>Loading…</div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>My Support History</h1>
        <p>Every pledge you've made — all your contributions in one place.</p>
      </div>

      {/* Total stat */}
      <div className="history-stat-card mb-4">
        <div className="history-stat-label">Total contributed</div>
        <div className="history-stat-amount">${totalGiven.toLocaleString()}</div>
        <div className="history-stat-meta">{txns.length} pledge{txns.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Pledge list */}
      {txns.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><History size={28} strokeWidth={1.5} /></div>
          <h3>No pledges yet</h3>
          <p>Support a creator from the Discover page to see your history here.</p>
        </div>
      ) : (
        <div className="chart-card">
          <div className="chart-card-header">All pledges</div>
          {txns.map(t => {
            const c = cMap[t.creatorId];
            return (
              <div key={t.id} className="history-pledge-row">
                {/* Creator */}
                <div className="history-creator-col">
                  {c ? (
                    <Link to={`/creator/${c.uniqueSlug}`} className="history-creator-link">
                      <div className="history-avatar" style={{ background: avatarBg(c.category) }}>
                        {initials(c.displayName)}
                      </div>
                      <div>
                        <div className="history-creator-name">{c.displayName}</div>
                        <div className="history-creator-cat">{c.category}</div>
                      </div>
                    </Link>
                  ) : (
                    <div className="d-flex align-items-center gap-2">
                      <div className="history-avatar" style={{ background: 'var(--color-slate-blue)' }}>?</div>
                      <div className="history-creator-name">Unknown creator</div>
                    </div>
                  )}
                </div>

                {/* Campaign */}
                <div className="history-campaign-col">
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-blue)' }}>
                    {t.campaignId ? '📋 Campaign pledge' : '💛 General support'}
                  </span>
                </div>

                {/* Amount */}
                <div className="history-amount-col">
                  <span className="history-amount">${t.amount.toLocaleString()}</span>
                  <span className="history-method">{METHOD_LABEL[t.paymentMethod] ?? t.paymentMethod}</span>
                </div>

                {/* Date + status */}
                <div className="history-meta-col">
                  <span className="history-date">{fmtDate(t.createdAt)}</span>
                  <span className="badge-ap badge-success" style={{ fontSize: '0.68rem' }}>
                    <CheckCircle2 size={9} strokeWidth={2.5} />
                    {t.status ?? 'Completed'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}