/**
 * PayoutsPage.js
 * Creators only. Shows available balance, payout request modal,
 * and full payout history table.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Modal  from 'react-bootstrap/Modal';
import {
  Wallet, ShieldAlert, Plus, Clock,
  CheckCircle2, XCircle, AlertTriangle, Smartphone, Landmark, CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getCreatorByUserId, getTransactions,
  getPayoutRequests, requestPayout,
} from '../../services/mockApi';

const METHOD_LABEL = {
  ecocash:  'EcoCash',
  bank:     'Bank Transfer',
  card:     'Card',
};

const METHOD_ICON = {
  ecocash: { Icon: Smartphone, color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  bank:    { Icon: Landmark,   color: 'var(--color-indigo)',  bg: 'var(--color-indigo-08)'   },
  card:    { Icon: CreditCard, color: 'var(--color-navy)',    bg: 'var(--color-navy-10)'     },
};

const STATUS_CFG = {
  pending:   { label: 'Pending',   badge: 'badge-warning', Icon: Clock         },
  completed: { label: 'Completed', badge: 'badge-success', Icon: CheckCircle2  },
  failed:    { label: 'Failed',    badge: 'badge-danger',  Icon: XCircle       },
};

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function methodLabel(m) {
  if (!m) return '—';
  if (m.type === 'ecocash') return `EcoCash · ${m.details?.phone ?? ''}`;
  if (m.type === 'bank')    return `${m.details?.bank ?? 'Bank'} · ${m.details?.account ?? ''}`;
  if (m.type === 'card')    return `Card · ${m.details?.number ?? ''}`;
  return m.type;
}

export default function PayoutsPage() {
  const { user } = useAuth();

  const [loading,    setLoading]    = useState(true);
  const [creator,    setCreator]    = useState(null);
  const [txns,       setTxns]       = useState([]);
  const [payouts,    setPayouts]    = useState([]);
  const [modalOpen,  setModalOpen]  = useState(false);

  // Request-payout form
  const [amount,    setAmount]    = useState('');
  const [methodKey, setMethodKey] = useState('');
  const [amtErr,    setAmtErr]    = useState('');
  const [submitting,setSubmitting]= useState(false);
  const [done,      setDone]      = useState(false);

  const loadAll = useCallback(async () => {
    const [c, t, p] = await Promise.all([
      getCreatorByUserId(user.id),
      getTransactions({ creatorId: user.id }),
      getPayoutRequests(user.id),
    ]);
    setCreator(c);
    setTxns(t);
    setPayouts(p);
  }, [user.id]);

  useEffect(() => { loadAll().finally(() => setLoading(false)); }, [loadAll]);

  // ── Derived balances ────────────────────────────────────────────────────
  const totalRaised   = txns.reduce((s, t) => s + t.amount, 0);
  const paidOut       = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const pendingOut    = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const available     = Math.max(0, totalRaised - paidOut - pendingOut);

  const isKycVerified    = creator?.kycStatus === 'verified';
  const verifiedMethods  = (creator?.payoutMethods ?? []).filter(m => m.verified);

  // ── Modal helpers ───────────────────────────────────────────────────────
  function openModal() {
    setAmount('');
    setMethodKey(verifiedMethods[0]?.type ?? '');
    setAmtErr('');
    setDone(false);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setDone(false);
  }

  async function handleRequestPayout(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0)    { setAmtErr('Enter a valid amount.'); return; }
    if (amt > available)     { setAmtErr(`Max available is $${available.toFixed(2)}.`); return; }
    if (!methodKey)          { setAmtErr('Select a payout method.'); return; }
    setSubmitting(true);
    try {
      const p = await requestPayout({ creatorId: user.id, amount: amt, destinationMethod: methodKey });
      setPayouts(prev => [p, ...prev]);
      setDone(true);
    } finally { setSubmitting(false); }
  }

  if (loading) return (
    <div><div className="page-header"><h1>Payouts</h1></div>
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-slate-blue)' }}>Loading…</div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Payouts</h1>
        <p>Request withdrawals to your EcoCash wallet, bank account, or card.</p>
      </div>

      {/* ── KYC warning ──────────────────────────────────────────────── */}
      {!isKycVerified && (
        <div className="payout-warning-banner mb-4">
          <ShieldAlert size={18} strokeWidth={1.75} />
          <span>
            Your identity isn't verified yet.{' '}
            <Link to="/app/profile" style={{ fontWeight: 700, color: 'inherit' }}>
              Complete KYC in Profile →
            </Link>{' '}
            to unlock payouts.
          </span>
        </div>
      )}

      {/* ── Balance card ─────────────────────────────────────────────── */}
      <div className="payout-balance-card mb-4">
        <div className="payout-balance-eyebrow">Available balance</div>
        <div className="payout-balance-amount">${available.toLocaleString()}</div>
        <div className="payout-balance-breakdown">
          <span>Raised&nbsp;<strong>${totalRaised.toLocaleString()}</strong></span>
          <span className="payout-sep">·</span>
          <span>Paid out&nbsp;<strong>${paidOut.toLocaleString()}</strong></span>
          {pendingOut > 0 && (
            <>
              <span className="payout-sep">·</span>
              <span>Pending&nbsp;<strong>${pendingOut.toLocaleString()}</strong></span>
            </>
          )}
        </div>
        <div className="mt-3">
          <Button
            variant="light"
            size="sm"
            className="d-inline-flex align-items-center gap-2"
            onClick={openModal}
            disabled={!isKycVerified || available <= 0}
          >
            <Plus size={14} strokeWidth={2.5} />
            Request payout
          </Button>
          {!isKycVerified && (
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginLeft: '0.75rem' }}>
              Requires KYC
            </span>
          )}
        </div>
      </div>

      {/* ── Payout history ───────────────────────────────────────────── */}
      <div className="chart-card">
        <div className="chart-card-header">Payout history</div>
        {payouts.length === 0 ? (
          <div className="chart-empty">No payouts requested yet.</div>
        ) : (
          <>
            <div className="payout-table-head">
              <span>Amount</span>
              <span>Method</span>
              <span>Status</span>
              <span>Requested</span>
              <span>Completed</span>
            </div>
            {payouts.map(p => {
              const cfg    = STATUS_CFG[p.status] ?? STATUS_CFG.pending;
              const mi     = METHOD_ICON[p.destinationMethod] ?? METHOD_ICON.bank;
              return (
                <div key={p.id} className="payout-table-row">
                  <span className="payout-table-amount">${p.amount.toLocaleString()}</span>
                  <span className="d-flex align-items-center gap-2">
                    <div className="payout-method-chip" style={{ background: mi.bg, color: mi.color }}>
                      <mi.Icon size={12} strokeWidth={1.75} />
                    </div>
                    {METHOD_LABEL[p.destinationMethod] ?? p.destinationMethod}
                  </span>
                  <span>
                    <span className={`badge-ap ${cfg.badge}`}>
                      <cfg.Icon size={10} strokeWidth={2} />
                      {cfg.label}
                    </span>
                  </span>
                  <span className="payout-table-date">{fmtDate(p.requestedAt)}</span>
                  <span className="payout-table-date">{p.completedAt ? fmtDate(p.completedAt) : '—'}</span>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* ── Request payout modal ─────────────────────────────────────── */}
      <Modal show={modalOpen} onHide={closeModal} centered size="sm">
        <Modal.Header closeButton style={{ borderColor: 'var(--color-slate-15)' }}>
          <Modal.Title style={{ fontSize: '1rem', fontWeight: 700 }}>Request payout</Modal.Title>
        </Modal.Header>

        {done ? (
          <>
            <Modal.Body style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle2 size={28} color="var(--color-success)" strokeWidth={1.75} />
              </div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, marginBottom: '0.25rem' }}>Payout requested!</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-blue)', margin: 0 }}>
                ${parseFloat(amount).toFixed(2)} to {METHOD_LABEL[methodKey]} — typically 1–3 business days.
              </p>
            </Modal.Body>
            <Modal.Footer style={{ borderColor: 'var(--color-slate-15)', justifyContent: 'center' }}>
              <Button variant="primary" onClick={closeModal} style={{ minWidth: 100 }}>Done</Button>
            </Modal.Footer>
          </>
        ) : verifiedMethods.length === 0 ? (
          <>
            <Modal.Body style={{ padding: '1.5rem', textAlign: 'center' }}>
              <AlertTriangle size={28} color="var(--color-warning)" strokeWidth={1.75} style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--color-navy)', marginBottom: '0' }}>
                No verified payout methods yet.{' '}
                <Link to="/app/profile" onClick={closeModal} style={{ fontWeight: 700 }}>
                  Add one in Profile →
                </Link>
              </p>
            </Modal.Body>
            <Modal.Footer style={{ borderColor: 'var(--color-slate-15)', justifyContent: 'center' }}>
              <Button variant="outline-secondary" size="sm" onClick={closeModal}>Close</Button>
            </Modal.Footer>
          </>
        ) : (
          <form onSubmit={handleRequestPayout}>
            <Modal.Body style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                  Amount (USD)
                </label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: 'var(--color-cream)', fontWeight: 700 }}>$</span>
                  <input
                    type="number"
                    className={`form-control${amtErr ? ' is-invalid' : ''}`}
                    placeholder="0.00"
                    min="1"
                    max={available}
                    step="0.01"
                    value={amount}
                    onChange={e => { setAmount(e.target.value); setAmtErr(''); }}
                  />
                </div>
                {amtErr && <div className="invalid-feedback d-block" style={{ fontSize: '0.8rem' }}>{amtErr}</div>}
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-blue)', marginTop: '0.25rem' }}>
                  Available: ${available.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                  Payout to
                </label>
                <select
                  className="form-select"
                  value={methodKey}
                  onChange={e => setMethodKey(e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                >
                  {verifiedMethods.map((m, i) => (
                    <option key={i} value={m.type}>{methodLabel(m)}</option>
                  ))}
                </select>
              </div>
            </Modal.Body>
            <Modal.Footer style={{ borderColor: 'var(--color-slate-15)', justifyContent: 'space-between' }}>
              <Button variant="outline-secondary" size="sm" onClick={closeModal} disabled={submitting}>Cancel</Button>
              <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Request payout'}
              </Button>
            </Modal.Footer>
          </form>
        )}
      </Modal>
    </div>
  );
}