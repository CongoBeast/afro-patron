/**
 * ProfilePage.js
 * Creator: profile editing + KYC verification flow + payout method management.
 * Supporter: simple display.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import {
  ShieldCheck, ShieldAlert, Clock, CheckCircle2, Smartphone, Landmark,
  CreditCard, Plus, Trash2, User, Globe, Instagram, Twitter, Loader2,
} from 'lucide-react';
import { useAuth }  from '../../context/AuthContext';
import {
  getCreatorByUserId, updateCreatorProfile,
  updateKycStatus, addPayoutMethod, verifyPayoutMethod,
  removePayoutMethod, addNotification,
} from '../../services/mockApi';

// ─── Helpers ───────────────────────────────────────────────────────────────

const KYC_CFG = {
  unverified: { label: 'Not verified',    Icon: ShieldAlert,  cls: 'kyc-unverified' },
  pending:    { label: 'Under review',    Icon: Clock,        cls: 'kyc-pending'    },
  verified:   { label: 'Verified',        Icon: ShieldCheck,  cls: 'kyc-verified'   },
};

const METHOD_TYPES = [
  { key: 'ecocash', label: 'EcoCash',       Icon: Smartphone },
  { key: 'bank',    label: 'Bank Transfer', Icon: Landmark   },
  { key: 'card',    label: 'Card',          Icon: CreditCard },
];

function methodDescription(m) {
  if (m.type === 'ecocash') return m.details?.phone ?? '';
  if (m.type === 'bank')    return `${m.details?.bank ?? ''} · ${m.details?.account ?? ''}`;
  if (m.type === 'card')    return m.details?.number ?? '';
  return '';
}

// ─── Profile Info Section ──────────────────────────────────────────────────

function ProfileInfoSection({ creator, userId }) {
  const [displayName, setDisplayName] = useState(creator.displayName);
  const [bio,         setBio]         = useState(creator.bio);
  const [instagram,   setInstagram]   = useState(creator.socialLinks?.instagram ?? '');
  const [twitter,     setTwitter]     = useState(creator.socialLinks?.twitter ?? '');
  const [website,     setWebsite]     = useState(creator.socialLinks?.website ?? '');
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCreatorProfile(userId, {
        displayName,
        bio,
        socialLinks: { instagram, twitter, website },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  return (
    <div className="profile-section mb-3">
      <div className="profile-section-header">
        <span className="profile-section-title">Profile</span>
      </div>
      <div className="profile-section-body">
        <form onSubmit={handleSave}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8125rem' }}>Display name</label>
              <input className="form-control" value={displayName}
                onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8125rem' }}>Bio</label>
              <textarea className="form-control" rows={3} value={bio}
                onChange={e => setBio(e.target.value)}
                style={{ resize: 'vertical', fontSize: '0.9rem', lineHeight: 1.6 }} />
            </div>
            <div className="col-sm-6">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8125rem' }}>Instagram</label>
              <div className="input-group">
                <span className="input-group-text" style={{ fontSize: '0.8rem' }}><Instagram size={13} /></span>
                <input className="form-control" placeholder="https://instagram.com/…" value={instagram}
                  onChange={e => setInstagram(e.target.value)} style={{ fontSize: '0.875rem' }} />
              </div>
            </div>
            <div className="col-sm-6">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8125rem' }}>Twitter / X</label>
              <div className="input-group">
                <span className="input-group-text" style={{ fontSize: '0.8rem' }}><Twitter size={13} /></span>
                <input className="form-control" placeholder="https://twitter.com/…" value={twitter}
                  onChange={e => setTwitter(e.target.value)} style={{ fontSize: '0.875rem' }} />
              </div>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8125rem' }}>Website</label>
              <div className="input-group">
                <span className="input-group-text" style={{ fontSize: '0.8rem' }}><Globe size={13} /></span>
                <input className="form-control" placeholder="https://yoursite.com" value={website}
                  onChange={e => setWebsite(e.target.value)} style={{ fontSize: '0.875rem' }} />
              </div>
            </div>
            <div className="col-12 d-flex align-items-center gap-3">
              <Button type="submit" variant="primary" size="sm" disabled={saving}
                className="d-inline-flex align-items-center gap-2">
                {saving && <Loader2 size={13} style={{ animation: 'pm-spin .85s linear infinite' }} />}
                Save changes
              </Button>
              {saved && <span style={{ fontSize: '0.8125rem', color: 'var(--color-success)', fontWeight: 600 }}>
                <CheckCircle2 size={13} className="me-1" />Saved!
              </span>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── KYC Section ──────────────────────────────────────────────────────────

function KycSection({ creator, userId, onCreatorUpdate }) {
  const [idFile,      setIdFile]      = useState(null);
  const [addrFile,    setAddrFile]    = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const idRef   = useRef(null);
  const addrRef = useRef(null);

  const cfg = KYC_CFG[creator.kycStatus] ?? KYC_CFG.unverified;

  async function handleSubmitKyc() {
    setSubmitting(true);
    try {
      const updated = await updateKycStatus(userId, 'pending');
      onCreatorUpdate(updated);
    } finally { setSubmitting(false); }
  }

  async function handleSimulateApproval() {
    const updated = await updateKycStatus(userId, 'verified');
    onCreatorUpdate(updated);
    await addNotification({
      userId,
      type:    'kyc',
      message: 'Your KYC verification is complete. You can now request payouts.',
      linkTo:  '/app/payouts',
    });
  }

  async function handleReset() {
    const updated = await updateKycStatus(userId, 'unverified');
    onCreatorUpdate(updated);
    setIdFile(null); setAddrFile(null);
  }

  return (
    <div className="profile-section mb-3">
      <div className="profile-section-header">
        <span className="profile-section-title">Identity Verification (KYC)</span>
        <span className={`badge-ap ${creator.kycStatus === 'verified' ? 'badge-success' : creator.kycStatus === 'pending' ? 'badge-indigo' : 'badge-warning'}`}>
          <cfg.Icon size={11} strokeWidth={2} />
          {cfg.label}
        </span>
      </div>
      <div className="profile-section-body">

        {/* Status description */}
        <div className={`kyc-status-banner kyc-${creator.kycStatus ?? 'unverified'} mb-4`}>
          <cfg.Icon size={18} strokeWidth={1.75} />
          <div>
            {creator.kycStatus === 'unverified' && 'Verify your identity to unlock payouts. This is a one-time process.'}
            {creator.kycStatus === 'pending'    && 'Your documents are under review. This typically takes 1–2 business days.'}
            {creator.kycStatus === 'verified'   && 'Your identity is verified. You can now request payouts.'}
          </div>
        </div>

        {/* Upload form — only when unverified */}
        {creator.kycStatus === 'unverified' && (
          <div className="d-flex flex-column gap-3 mb-4">
            <div>
              <div className="kyc-upload-label">National ID or Passport</div>
              <div className="kyc-upload-row">
                <button type="button" className="btn btn-outline-secondary btn-sm"
                  onClick={() => idRef.current?.click()}>Choose file</button>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-blue)' }}>
                  {idFile ? idFile.name : 'No file chosen'}
                </span>
                <input ref={idRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                  onChange={e => setIdFile(e.target.files[0] ?? null)} />
              </div>
            </div>
            <div>
              <div className="kyc-upload-label">Proof of address <span style={{ fontWeight: 400, color: 'var(--color-slate-blue)' }}>(utility bill, bank statement)</span></div>
              <div className="kyc-upload-row">
                <button type="button" className="btn btn-outline-secondary btn-sm"
                  onClick={() => addrRef.current?.click()}>Choose file</button>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-blue)' }}>
                  {addrFile ? addrFile.name : 'No file chosen'}
                </span>
                <input ref={addrRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                  onChange={e => setAddrFile(e.target.files[0] ?? null)} />
              </div>
            </div>
            <div>
              <Button variant="primary" size="sm" onClick={handleSubmitKyc} disabled={submitting}
                className="d-inline-flex align-items-center gap-2">
                {submitting && <Loader2 size={13} style={{ animation: 'pm-spin .85s linear infinite' }} />}
                Submit for review
              </Button>
            </div>
          </div>
        )}

        {/* Demo-only controls */}
        <div className="kyc-demo-row">
          <span className="kyc-demo-label">Demo controls</span>
          <div className="d-flex gap-2 flex-wrap">
            {creator.kycStatus !== 'verified' && (
              <Button variant="outline-secondary" size="sm" onClick={handleSimulateApproval}>
                Simulate approval ▸
              </Button>
            )}
            {creator.kycStatus !== 'unverified' && (
              <Button variant="outline-secondary" size="sm" onClick={handleReset}>
                Reset to unverified
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Payout Methods Section ────────────────────────────────────────────────

function PayoutMethodsSection({ creator, userId, onCreatorUpdate }) {
  const [addType,   setAddType]   = useState('ecocash');
  const [phone,     setPhone]     = useState('');
  const [bankName,  setBankName]  = useState('');
  const [acctName,  setAcctName]  = useState('');
  const [acctNum,   setAcctNum]   = useState('');
  const [branch,    setBranch]    = useState('');
  const [cardNum,   setCardNum]   = useState('');
  const [saving,    setSaving]    = useState(false);

  const methods = creator.payoutMethods ?? [];

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    let method;
    if (addType === 'ecocash') {
      method = { type: 'ecocash', details: { phone, name: creator.displayName }, verified: false };
    } else if (addType === 'bank') {
      method = { type: 'bank', details: { bank: bankName, accountName: acctName, account: acctNum, branch }, verified: false };
    } else {
      method = { type: 'card', details: { number: `****${cardNum.slice(-4)}` }, verified: false };
    }
    try {
      const updated = await addPayoutMethod(userId, method);
      onCreatorUpdate(updated);
      setPhone(''); setBankName(''); setAcctName(''); setAcctNum(''); setBranch(''); setCardNum('');
    } finally { setSaving(false); }
  }

  async function handleVerify(idx) {
    const updated = await verifyPayoutMethod(userId, idx);
    onCreatorUpdate(updated);
  }

  async function handleRemove(idx) {
    if (!window.confirm('Remove this payout method?')) return;
    const updated = await removePayoutMethod(userId, idx);
    onCreatorUpdate(updated);
  }

  return (
    <div className="profile-section mb-3">
      <div className="profile-section-header">
        <span className="profile-section-title">Payout Methods</span>
      </div>
      <div className="profile-section-body">

        {/* Existing methods */}
        {methods.length === 0 ? (
          <p style={{ color: 'var(--color-slate-blue)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            No payout methods added yet.
          </p>
        ) : (
          <div className="payout-methods-list mb-4">
            {methods.map((m, i) => {
              const mt = METHOD_TYPES.find(t => t.key === m.type);
              return (
                <div key={i} className="payout-method-item">
                  <div className={`payout-method-icon pm-type-${m.type}`}>
                    {mt && <mt.Icon size={15} strokeWidth={1.75} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                      {mt?.label ?? m.type}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-blue)' }}>
                      {methodDescription(m)}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {m.verified
                      ? <span className="badge-ap badge-success"><CheckCircle2 size={10} strokeWidth={2} />Verified</span>
                      : <>
                          <span className="badge-ap badge-warning"><Clock size={10} strokeWidth={2} />Unverified</span>
                          <button className="btn btn-outline-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                            onClick={() => handleVerify(i)}>Simulate verify ▸</button>
                        </>
                    }
                    <button className="topbar-icon-btn" style={{ width: 28, height: 28, borderRadius: 6, color: 'var(--color-danger)' }}
                      onClick={() => handleRemove(i)} aria-label="Remove method">
                      <Trash2 size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add method form */}
        <div style={{ borderTop: 'var(--border-divider)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.875rem' }}>
            Add payout method
          </div>
          <div className="payout-method-tabs mb-3">
            {METHOD_TYPES.map(({ key, label, Icon }) => (
              <button key={key} type="button"
                className={`payout-method-tab${addType === key ? ' active' : ''}`}
                onClick={() => setAddType(key)}>
                <Icon size={14} strokeWidth={1.75} />{label}
              </button>
            ))}
          </div>

          <form onSubmit={handleAdd}>
            {addType === 'ecocash' && (
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Phone number</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ fontSize: '0.875rem', fontWeight: 600 }}>+263</span>
                  <input className="form-control" placeholder="77 123 4567" value={phone}
                    onChange={e => setPhone(e.target.value)} required style={{ fontSize: '0.875rem' }} />
                </div>
              </div>
            )}

            {addType === 'bank' && (
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Bank name</label>
                  <input className="form-control" placeholder="e.g. CBZ Bank" value={bankName}
                    onChange={e => setBankName(e.target.value)} required style={{ fontSize: '0.875rem' }} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Account holder name</label>
                  <input className="form-control" placeholder="Full name" value={acctName}
                    onChange={e => setAcctName(e.target.value)} style={{ fontSize: '0.875rem' }} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Account number</label>
                  <input className="form-control" placeholder="0123456789" value={acctNum}
                    onChange={e => setAcctNum(e.target.value)} required style={{ fontSize: '0.875rem' }} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Branch code <span style={{ fontWeight: 400, color: 'var(--color-slate-blue)' }}>(optional)</span></label>
                  <input className="form-control" placeholder="e.g. 00123" value={branch}
                    onChange={e => setBranch(e.target.value)} style={{ fontSize: '0.875rem' }} />
                </div>
              </div>
            )}

            {addType === 'card' && (
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Card number</label>
                <input className="form-control" placeholder="0000 0000 0000 0000" value={cardNum}
                  onChange={e => setCardNum(e.target.value)} required maxLength={19} style={{ fontSize: '0.875rem' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-blue)', marginTop: '0.25rem' }}>
                  Only the last 4 digits are stored.
                </div>
              </div>
            )}

            <Button type="submit" variant="outline-primary" size="sm" disabled={saving}
              className="d-inline-flex align-items-center gap-2">
              {saving
                ? <><Loader2 size={13} style={{ animation: 'pm-spin .85s linear infinite' }} /> Adding…</>
                : <><Plus size={14} strokeWidth={2.5} /> Add method</>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Supporter profile (simple) ────────────────────────────────────────────

function SupporterProfile({ user }) {
  return (
    <div>
      <div className="page-header">
        <h1>Profile</h1>
        <p>Your supporter account details.</p>
      </div>
      <div className="profile-section">
        <div className="profile-section-header">
          <span className="profile-section-title">Account</span>
        </div>
        <div className="profile-section-body">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-indigo)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem', fontWeight: 900 }}>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-navy)' }}>{user.name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-slate-blue)' }}>{user.email}</div>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-blue)', margin: 0 }}>
            Profile editing for supporters coming in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, role } = useAuth();
  const [creator,  setCreator]  = useState(null);
  const [loading,  setLoading]  = useState(role === 'creator');

  useEffect(() => {
    if (role !== 'creator') return;
    getCreatorByUserId(user.id)
      .then(setCreator)
      .finally(() => setLoading(false));
  }, [user.id, role]);

  if (role !== 'creator') return <SupporterProfile user={user} />;

  if (loading) return (
    <div>
      <div className="page-header"><h1>Profile</h1></div>
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--color-slate-blue)' }}>Loading…</div>
    </div>
  );

  if (!creator) return (
    <div className="page-header">
      <h1>Profile</h1>
      <p>Creator profile not found.</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your public page, identity verification, and payout methods.</p>
      </div>

      <ProfileInfoSection     creator={creator} userId={user.id} />
      <KycSection             creator={creator} userId={user.id} onCreatorUpdate={setCreator} />
      <PayoutMethodsSection   creator={creator} userId={user.id} onCreatorUpdate={setCreator} />
    </div>
  );
}