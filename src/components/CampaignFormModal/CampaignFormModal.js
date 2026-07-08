/**
 * CampaignFormModal.js
 *
 * Shared create / edit form for campaigns.
 * Props:
 *   campaign  — null (new) | existing campaign object (edit)
 *   creatorId — logged-in creator's userId
 *   onClose   — () => void
 *   onSaved   — () => void  (triggers list refresh in parent)
 */

import React, { useState, useRef } from 'react';
import Modal  from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { createCampaign, updateCampaign } from '../../services/mockApi';

// Minimum goal amount
const MIN_GOAL = 10;

// Today's date as YYYY-MM-DD (for the date input min attribute)
const todayStr = new Date().toISOString().slice(0, 10);

export default function CampaignFormModal({ campaign, creatorId, onClose, onSaved }) {
  const isEdit = Boolean(campaign);

  // ── Form state ──────────────────────────────────────────────────────────
  const [title,       setTitle]       = useState(campaign?.title       ?? '');
  const [description, setDescription] = useState(campaign?.description ?? '');
  const [goalAmount,  setGoalAmount]  = useState(campaign?.goalAmount  ?? '');
  const [deadline,    setDeadline]    = useState(
    campaign?.deadline ? campaign.deadline.slice(0, 10) : '',
  );
  const [status,      setStatus]      = useState(campaign?.status ?? 'draft');
  const [imageUrl,    setImageUrl]    = useState(campaign?.coverImageUrl ?? '');
  const [imagePreview, setImagePreview] = useState(campaign?.coverImageUrl ?? '');

  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);

  const fileRef = useRef(null);

  // ── Image handling ──────────────────────────────────────────────────────
  function handleUrlInput(v) {
    setImageUrl(v);
    setImagePreview(v); // Shows immediately; broken URLs just show nothing
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      setImageUrl(dataUrl);
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageUrl('');
    setImagePreview('');
    if (fileRef.current) fileRef.current.value = '';
  }

  // ── Validation ──────────────────────────────────────────────────────────
  function validate() {
    const e = {};
    if (!title.trim())                               e.title       = 'Title is required.';
    if (title.trim().length > 100)                   e.title       = 'Keep it under 100 characters.';
    if (!description.trim())                         e.description = 'Description is required.';
    if (!goalAmount || parseFloat(goalAmount) < MIN_GOAL)
                                                     e.goalAmount  = `Goal must be at least $${MIN_GOAL}.`;
    if (!deadline)                                   e.deadline    = 'Set a deadline.';
    else if (!isEdit && deadline < todayStr)         e.deadline    = 'Deadline must be in the future.';
    return e;
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    const payload = {
      title:         title.trim(),
      description:   description.trim(),
      goalAmount:    parseFloat(goalAmount),
      currency:      'USD',
      deadline:      new Date(deadline).toISOString(),
      status,
      coverImageUrl: imageUrl || null,
    };

    try {
      if (isEdit) {
        await updateCampaign(campaign.id, payload);
      } else {
        await createCampaign({ ...payload, creatorId });
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  // ── Field helpers ───────────────────────────────────────────────────────
  function FieldLabel({ htmlFor, children, hint }) {
    return (
      <label
        htmlFor={htmlFor}
        className="form-label"
        style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-navy)', marginBottom: '0.3rem' }}
      >
        {children}
        {hint && (
          <span style={{ fontWeight: 400, color: 'var(--color-slate-blue)', marginLeft: '0.35rem' }}>
            {hint}
          </span>
        )}
      </label>
    );
  }

  function FieldError({ name }) {
    return errors[name]
      ? <div className="invalid-feedback d-block" style={{ fontSize: '0.8rem' }}>{errors[name]}</div>
      : null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Modal show onHide={submitting ? undefined : onClose} centered size="lg">
      <form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton={!submitting} style={{ borderColor: 'var(--color-slate-15)' }}>
          <Modal.Title style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
            {isEdit ? 'Edit campaign' : 'New campaign'}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ padding: '1.5rem' }}>
          <div className="d-flex flex-column gap-4">

            {/* Title */}
            <div>
              <FieldLabel htmlFor="cf-title">Campaign title</FieldLabel>
              <input
                id="cf-title"
                type="text"
                className={`form-control${errors.title ? ' is-invalid' : ''}`}
                placeholder="e.g. Children's Book — Mwana WaMambo"
                value={title}
                onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })); }}
                maxLength={100}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--color-slate-blue)', textAlign: 'right', marginTop: '0.2rem' }}>
                {title.length}/100
              </div>
              <FieldError name="title" />
            </div>

            {/* Description */}
            <div>
              <FieldLabel htmlFor="cf-desc">Description</FieldLabel>
              <textarea
                id="cf-desc"
                className={`form-control${errors.description ? ' is-invalid' : ''}`}
                rows={5}
                placeholder="Tell backers what this campaign is for, what you'll create, and what their support makes possible."
                value={description}
                onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: undefined })); }}
                style={{ resize: 'vertical', fontSize: '0.9rem', lineHeight: 1.65 }}
              />
              <FieldError name="description" />
            </div>

            {/* Goal + Deadline (2 cols) */}
            <div className="row g-3">
              <div className="col-sm-6">
                <FieldLabel htmlFor="cf-goal">Funding goal (USD)</FieldLabel>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: 'var(--color-cream)', border: 'var(--border-input)', borderRight: 'none', fontWeight: 600 }}>
                    $
                  </span>
                  <input
                    id="cf-goal"
                    type="number"
                    min={MIN_GOAL}
                    step="1"
                    className={`form-control${errors.goalAmount ? ' is-invalid' : ''}`}
                    placeholder={`e.g. 1500`}
                    value={goalAmount}
                    onChange={e => { setGoalAmount(e.target.value); setErrors(p => ({ ...p, goalAmount: undefined })); }}
                    style={{ borderLeft: 'none' }}
                  />
                </div>
                <FieldError name="goalAmount" />
              </div>

              <div className="col-sm-6">
                <FieldLabel htmlFor="cf-deadline">Deadline</FieldLabel>
                <input
                  id="cf-deadline"
                  type="date"
                  className={`form-control${errors.deadline ? ' is-invalid' : ''}`}
                  value={deadline}
                  min={!isEdit ? todayStr : undefined}
                  onChange={e => { setDeadline(e.target.value); setErrors(p => ({ ...p, deadline: undefined })); }}
                />
                <FieldError name="deadline" />
              </div>
            </div>

            {/* Status */}
            <div>
              <FieldLabel htmlFor="cf-status">Status</FieldLabel>
              <select
                id="cf-status"
                className="form-select"
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{ fontSize: '0.9rem' }}
              >
                <option value="draft">Draft — not visible to the public yet</option>
                <option value="active">Active — published, accepting pledges</option>
              </select>
            </div>

            {/* Cover image */}
            <div>
              <FieldLabel htmlFor="cf-image-url" hint="(optional)">Cover image</FieldLabel>

              {/* Preview */}
              {imagePreview && (
                <div className="cf-img-preview-wrap">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="cf-img-preview"
                    onError={() => setImagePreview('')}
                  />
                  <button type="button" className="cf-img-clear" onClick={clearImage} aria-label="Remove image">
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              )}

              {/* URL input */}
              <input
                id="cf-image-url"
                type="url"
                className="form-control mb-2"
                placeholder="https://example.com/cover.jpg"
                value={typeof imageUrl === 'string' && !imageUrl.startsWith('data:') ? imageUrl : ''}
                onChange={e => handleUrlInput(e.target.value)}
              />

              {/* File upload */}
              <div
                className="cf-file-drop"
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
                aria-label="Upload cover image"
              >
                <UploadCloud size={18} strokeWidth={1.75} style={{ color: 'var(--color-slate-blue)' }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-slate-blue)' }}>
                  Click to upload a file (JPG, PNG, WebP)
                </span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFile}
              />
            </div>

          </div>
        </Modal.Body>

        <Modal.Footer style={{ borderColor: 'var(--color-slate-15)', padding: '1rem 1.5rem', justifyContent: 'space-between' }}>
          <Button variant="outline-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            className="d-inline-flex align-items-center gap-2"
          >
            {submitting && <Loader2 size={14} strokeWidth={2} style={{ animation: 'pm-spin 0.85s linear infinite' }} />}
            {isEdit ? 'Save changes' : (status === 'active' ? 'Publish campaign' : 'Save as draft')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}