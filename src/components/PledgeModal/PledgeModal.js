/**
 * PledgeModal.js
 * 4-step funding flow:
 *   (1) Amount    — preset pills + custom input + message
 *   (2) Payment   — EcoCash / Card / Bank Transfer fields
 *   (3) Processing — 1.5 s simulated gateway delay
 *   (4) Receipt   — transaction confirmation
 *
 * Props:
 *   target   — { campaign: CampaignObject } | { direct: true }
 *   creator  — full CreatorProfile object
 *   onClose  — () => void
 *   onSuccess — (txn) => void  (optional)
 */

import React, { useState } from 'react';
import Modal  from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {
  ArrowLeft, ArrowRight,
  CheckCircle2, Loader2,
  CreditCard, Smartphone, Landmark,
} from 'lucide-react';
import { useAuth }                       from '../../context/AuthContext';
import { createPledge, addNotification } from '../../services/mockApi';

// ─── Constants ─────────────────────────────────────────────────────────────

const STEP = {
  AMOUNT:     'amount',
  PAYMENT:    'payment',
  PROCESSING: 'processing',
  RECEIPT:    'receipt',
};

const PRESETS = [5, 10, 25, 50];

const METHODS = [
  { key: 'ecocash',       label: 'EcoCash',       Icon: Smartphone },
  { key: 'card',          label: 'Card',           Icon: CreditCard },
  { key: 'bank_transfer', label: 'Bank Transfer',  Icon: Landmark   },
];

const ZIM_BANKS = [
  'CBZ Bank', 'Stanbic Bank', 'Standard Chartered', 'FBC Bank',
  'ZB Bank', 'NMB Bank', 'Ecobank', 'Steward Bank', 'Nedbank Zimbabwe',
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtCard(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}
function fmtExpiry(v) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

// ─── Main component ────────────────────────────────────────────────────────

export default function PledgeModal({ target, creator, onClose, onSuccess }) {
  const { user } = useAuth();

  const isCampaign = Boolean(target?.campaign);
  const campaign   = target?.campaign ?? null;

  // ── Step / global state ─────────────────────────────────────────────────
  const [step,    setStep]    = useState(STEP.AMOUNT);
  const [preset,  setPreset]  = useState(null);   // number | null
  const [custom,  setCustom]  = useState('');
  const [message, setMessage] = useState('');
  const [method,  setMethod]  = useState('ecocash');
  const [receipt, setReceipt] = useState(null);
  const [amtErr,  setAmtErr]  = useState('');

  // ── Payment field state ─────────────────────────────────────────────────
  const [phone,      setPhone]      = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry,     setExpiry]     = useState('');
  const [cvv,        setCvv]        = useState('');
  const [cardName,   setCardName]   = useState(user?.name ?? '');
  const [bank,       setBank]       = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [branch,     setBranch]     = useState('');

  // ── Derived ─────────────────────────────────────────────────────────────
  const finalAmount = preset ?? (custom ? parseFloat(custom) : 0);

  const paymentReady = (() => {
    if (method === 'ecocash')       return phone.replace(/\D/g, '').length >= 9;
    if (method === 'card')          return cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length >= 3;
    if (method === 'bank_transfer') return Boolean(bank) && accountNum.length >= 6;
    return false;
  })();

  // ── Step 1 handlers ─────────────────────────────────────────────────────
  function pickPreset(v)  { setPreset(v); setCustom(''); setAmtErr(''); }
  function pickCustom(v)  { setCustom(v); setPreset(null); setAmtErr(''); }

  function goToPayment() {
    if (!finalAmount || finalAmount < 1) {
      setAmtErr('Please enter an amount of at least $1.');
      return;
    }
    setStep(STEP.PAYMENT);
  }

  // ── Step 2 → confirm ────────────────────────────────────────────────────
  async function handleConfirm() {
    setStep(STEP.PROCESSING);

    const pledgeData = {
      supporterId:   user?.id ?? null,
      creatorId:     creator.userId,
      campaignId:    campaign?.id ?? null,
      amount:        finalAmount,
      currency:      'USD',
      paymentMethod: method,
      supporterName: user?.name ?? 'Anonymous',
      message:       message.trim() || null,
    };

    try {
      // Run the pledge API call and a minimum 1.5 s display together
      const [txn] = await Promise.all([
        createPledge(pledgeData),
        new Promise(res => setTimeout(res, 1500)),
      ]);

      // Notify the creator
      const who          = user?.name ?? 'Someone';
      const campaignNote = campaign ? ` to "${campaign.title}"` : '';
      await addNotification({
        userId:  creator.userId,
        type:    'pledge',
        message: `${who} pledged $${finalAmount}${campaignNote}`,
        isRead:  false,
        linkTo:  '/app/campaigns',
      });

      setReceipt(txn);
      setStep(STEP.RECEIPT);
      onSuccess?.(txn);
    } catch {
      // Fallback receipt so the UI never breaks
      setReceipt({
        id:            `txn-fallback-${Date.now()}`,
        amount:        finalAmount,
        paymentMethod: method,
        createdAt:     new Date().toISOString(),
      });
      setStep(STEP.RECEIPT);
    }
  }

  // ── Field label ─────────────────────────────────────────────────────────
  function FieldLabel({ children, optional }) {
    return (
      <div className="pledge-field-label">
        {children}
        {optional && (
          <span style={{ fontWeight: 400, color: 'var(--color-slate-blue)', marginLeft: '0.3rem' }}>
            (optional)
          </span>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 — AMOUNT
  // ─────────────────────────────────────────────────────────────────────────
  function renderAmount() {
    return (
      <>
        <Modal.Header closeButton style={{ borderColor: 'var(--color-slate-15)' }}>
          <Modal.Title style={{ fontSize: '1rem', fontWeight: 700 }}>
            {isCampaign
              ? 'Support this campaign'
              : `Support ${creator.displayName.split(' ')[0]}`}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: '1.5rem' }}>
          {/* Campaign context strip */}
          {isCampaign && (
            <div className="pledge-context-strip">
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-navy)' }}>
                {campaign.title}
              </span>
              <span className="badge-ap badge-indigo">
                {Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}% funded
              </span>
            </div>
          )}

          {/* Preset amounts */}
          <FieldLabel>Choose an amount</FieldLabel>
          <div className="pledge-preset-grid">
            {PRESETS.map(v => (
              <button
                key={v}
                type="button"
                className={`pledge-preset-btn${preset === v ? ' active' : ''}`}
                onClick={() => pickPreset(v)}
              >
                ${v}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="pledge-custom-wrap">
            <span className="pledge-custom-prefix">$</span>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Custom amount"
              value={custom}
              onChange={e => pickCustom(e.target.value)}
              className={`pledge-custom-input form-control${amtErr ? ' is-invalid' : ''}`}
            />
          </div>
          {amtErr && (
            <div className="invalid-feedback d-block" style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>
              {amtErr}
            </div>
          )}

          {/* Message */}
          <FieldLabel optional>
            Message to {creator.displayName.split(' ')[0]}
          </FieldLabel>
          <textarea
            className="form-control"
            rows={2}
            maxLength={280}
            placeholder="Say something kind…"
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ resize: 'none', fontSize: '0.875rem' }}
          />
          <div style={{ fontSize: '0.7rem', color: 'var(--color-slate-blue)', textAlign: 'right', marginTop: '0.2rem' }}>
            {message.length}/280
          </div>

          {/* Supporter identity */}
          {user ? (
            <div className="pledge-supporter-row">
              <div className="pledge-supporter-avatar">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-navy)' }}>
                Pledging as <strong>{user.name}</strong>
              </span>
            </div>
          ) : (
            <div className="pledge-anon-notice">
              You're pledging anonymously — your name won't be attached to this pledge.
            </div>
          )}
        </Modal.Body>

        <Modal.Footer style={{ borderColor: 'var(--color-slate-15)', padding: '1rem 1.5rem' }}>
          <div className="pledge-footer-row">
            {finalAmount >= 1
              ? <span className="pledge-footer-amount">${finalAmount}</span>
              : <span style={{ color: 'var(--color-slate-blue)', fontSize: '0.875rem' }}>Select an amount</span>
            }
            <Button
              variant="primary"
              onClick={goToPayment}
              disabled={!finalAmount || finalAmount < 1}
              className="d-inline-flex align-items-center gap-2"
            >
              Continue <ArrowRight size={14} />
            </Button>
          </div>
        </Modal.Footer>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2 — PAYMENT METHOD
  // ─────────────────────────────────────────────────────────────────────────
  function renderPayment() {
    const campaignShort = campaign
      ? `"${campaign.title.length > 30 ? campaign.title.slice(0, 30) + '…' : campaign.title}"`
      : `${creator.displayName.split(' ')[0]} directly`;

    return (
      <>
        <Modal.Header closeButton style={{ borderColor: 'var(--color-slate-15)' }}>
          <Modal.Title
            style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <button
              type="button"
              onClick={() => setStep(STEP.AMOUNT)}
              className="btn-reset"
              aria-label="Back"
              style={{ color: 'var(--color-slate-blue)' }}
            >
              <ArrowLeft size={16} strokeWidth={2} />
            </button>
            Payment method
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: '1.5rem' }}>
          {/* Method tabs */}
          <div className="pm-tabs">
            {METHODS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                className={`pm-tab${method === key ? ' active' : ''}`}
                onClick={() => setMethod(key)}
              >
                <Icon size={14} strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>

          {/* EcoCash */}
          {method === 'ecocash' && (
            <div>
              <FieldLabel>EcoCash phone number</FieldLabel>
              <div className="pm-phone-wrap">
                <span className="pm-phone-prefix">+263</span>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="77 123 4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^\d\s]/g, '').slice(0, 12))}
                  style={{ paddingLeft: '3.5rem' }}
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-slate-blue)', marginTop: '0.5rem', marginBottom: 0 }}>
                You'll receive an EcoCash USSD prompt to confirm this payment.
              </p>
            </div>
          )}

          {/* Card */}
          {method === 'card' && (
            <div className="d-flex flex-column gap-3">
              <div>
                <FieldLabel>Card number</FieldLabel>
                <input
                  type="text"
                  className="form-control"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={e => setCardNumber(fmtCard(e.target.value))}
                  maxLength={19}
                  inputMode="numeric"
                />
              </div>
              <div className="d-flex gap-3">
                <div style={{ flex: 1 }}>
                  <FieldLabel>Expiry</FieldLabel>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={e => setExpiry(fmtExpiry(e.target.value))}
                    maxLength={5}
                    inputMode="numeric"
                  />
                </div>
                <div style={{ width: 90 }}>
                  <FieldLabel>CVV</FieldLabel>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="•••"
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Name on card</FieldLabel>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Full name"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Bank Transfer */}
          {method === 'bank_transfer' && (
            <div className="d-flex flex-column gap-3">
              <div>
                <FieldLabel>Bank</FieldLabel>
                <select
                  className="form-select"
                  value={bank}
                  onChange={e => setBank(e.target.value)}
                  style={{ fontSize: '0.9rem' }}
                >
                  <option value="">Select your bank</option>
                  {ZIM_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>Account number</FieldLabel>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 0123456789"
                  value={accountNum}
                  onChange={e => setAccountNum(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  inputMode="numeric"
                />
              </div>
              <div>
                <FieldLabel optional>Branch</FieldLabel>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Harare Main"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                />
              </div>
              <div className="pledge-anon-notice">
                Bank transfers take 1–3 business days to reflect on the creator's balance.
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer style={{ borderColor: 'var(--color-slate-15)', padding: '1rem 1.5rem' }}>
          <div className="pledge-footer-row">
            <div>
              <div className="pledge-footer-amount">${finalAmount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-blue)' }}>
                for {campaignShort}
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={!paymentReady}
              className="d-inline-flex align-items-center gap-2"
            >
              Confirm pledge <ArrowRight size={14} />
            </Button>
          </div>
        </Modal.Footer>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3 — PROCESSING
  // ─────────────────────────────────────────────────────────────────────────
  function renderProcessing() {
    const methodLabel = METHODS.find(m => m.key === method)?.label ?? 'payment';
    return (
      <Modal.Body style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
        <div className="pledge-processing-icon">
          <Loader2 size={34} strokeWidth={1.75} />
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-navy)', marginBottom: '0.375rem' }}>
          Processing your pledge…
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-slate-blue)' }}>
          Connecting to {methodLabel}
        </div>
        <style>{`
          @keyframes pm-spin { to { transform: rotate(360deg); } }
          .pledge-processing-icon svg { animation: pm-spin 0.85s linear infinite; }
        `}</style>
      </Modal.Body>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4 — RECEIPT
  // ─────────────────────────────────────────────────────────────────────────
  function renderReceipt() {
    const methodLabel = METHODS.find(m => m.key === method)?.label ?? method;
    const dateStr = receipt?.createdAt
      ? new Date(receipt.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const txnId = receipt?.id ? `#${receipt.id.slice(-8)}` : '—';

    return (
      <>
        <Modal.Body style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div className="pledge-receipt-check">
            <CheckCircle2 size={40} strokeWidth={1.5} color="var(--color-success)" />
          </div>

          <h3 style={{
            fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-navy)',
            marginBottom: '0.25rem', letterSpacing: '-0.02em',
          }}>
            Pledge confirmed!
          </h3>

          <div style={{
            fontSize: '2.75rem', fontWeight: 900, color: 'var(--color-navy)',
            lineHeight: 1, letterSpacing: '-0.05em', margin: '0.875rem 0',
          }}>
            ${finalAmount}
          </div>

          <p style={{ fontSize: '0.9375rem', color: 'var(--color-slate-blue)', marginBottom: '1.5rem' }}>
            {isCampaign
              ? <>for <strong style={{ color: 'var(--color-navy)' }}>"{campaign.title}"</strong></>
              : <>direct support to <strong style={{ color: 'var(--color-navy)' }}>{creator.displayName}</strong></>}
          </p>

          {/* Receipt detail rows */}
          <div className="pledge-receipt-details">
            <div className="pledge-receipt-row">
              <span>Payment via</span>
              <span>{methodLabel}</span>
            </div>
            <div className="pledge-receipt-row">
              <span>Transaction</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{txnId}</span>
            </div>
            <div className="pledge-receipt-row">
              <span>Date</span>
              <span>{dateStr}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-blue)', marginTop: '1.25rem', marginBottom: 0 }}>
            Thank you for supporting {creator.displayName.split(' ')[0]}! 🎉
          </p>
        </Modal.Body>

        <Modal.Footer style={{ borderColor: 'var(--color-slate-15)', justifyContent: 'center', padding: '1rem 1.5rem' }}>
          <Button variant="primary" onClick={onClose} style={{ minWidth: 120 }}>
            Done
          </Button>
        </Modal.Footer>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Modal
      show
      onHide={step === STEP.PROCESSING ? undefined : onClose}
      backdrop={step === STEP.PROCESSING ? 'static' : true}
      keyboard={step !== STEP.PROCESSING}
      centered
      size="sm"
    >
      {step === STEP.AMOUNT     && renderAmount()}
      {step === STEP.PAYMENT    && renderPayment()}
      {step === STEP.PROCESSING && renderProcessing()}
      {step === STEP.RECEIPT    && renderReceipt()}
    </Modal>
  );
}