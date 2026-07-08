/**
 * FeedPage.js — Creator post composer + reverse-chron post list.
 * Supports creating, editing (pre-fills composer), and deleting posts.
 * Linked to mockApi: createPost, updatePost, deletePost, getPosts.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Rss, RefreshCw, Megaphone, Edit3, Trash2, X, UploadCloud } from 'lucide-react';
import Button from 'react-bootstrap/Button';
import { useAuth } from '../../context/AuthContext';
import {
  getPosts, createPost, updatePost, deletePost, getCampaigns,
} from '../../services/mockApi';

// ─── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86_400_000);
  const hours = Math.floor(diff / 3_600_000);
  const mins  = Math.floor(diff / 60_000);
  if (days > 30) return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return 'just now';
}

const POST_TYPES = [
  { key: 'update',       label: 'Update',       Icon: RefreshCw, badgeClass: 'badge-indigo' },
  { key: 'announcement', label: 'Announcement', Icon: Megaphone,  badgeClass: 'badge-slate'  },
];

// ─── Main component ────────────────────────────────────────────────────────

export default function FeedPage() {
  const { user } = useAuth();

  // Composer state
  const [editingPost, setEditingPost] = useState(null);
  const [type,        setType]        = useState('update');
  const [title,       setTitle]       = useState('');
  const [body,        setBody]         = useState('');
  const [campaignId,  setCampaignId]  = useState('');
  const [imageUrl,    setImageUrl]    = useState('');
  const [previewUrl,  setPreviewUrl]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [titleErr,    setTitleErr]    = useState('');
  const [bodyErr,     setBodyErr]     = useState('');

  // Data state
  const [posts,     setPosts]     = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const composerRef = useRef(null);
  const fileRef     = useRef(null);

  // ── Load ────────────────────────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    const ps = await getPosts([user.id]);
    setPosts(ps);
  }, [user.id]);

  useEffect(() => {
    Promise.all([
      loadPosts(),
      getCampaigns(user.id, 'active').then(setCampaigns),
    ]).finally(() => setLoading(false));
  }, [user.id, loadPosts]);

  // ── Composer helpers ─────────────────────────────────────────────────────
  function resetComposer() {
    setEditingPost(null);
    setType('update');
    setTitle('');
    setBody('');
    setCampaignId('');
    setImageUrl('');
    setPreviewUrl('');
    setTitleErr('');
    setBodyErr('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleEditClick(post) {
    setEditingPost(post);
    setType(post.type);
    setTitle(post.title);
    setBody(post.body);
    setCampaignId(post.campaignId ?? '');
    setImageUrl(post.images?.[0] ?? '');
    setPreviewUrl(post.images?.[0] ?? '');
    setTitleErr('');
    setBodyErr('');
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleImageUrl(v) {
    setImageUrl(v);
    setPreviewUrl(v);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImageUrl(ev.target.result);
      setPreviewUrl(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageUrl('');
    setPreviewUrl('');
    if (fileRef.current) fileRef.current.value = '';
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    let valid = true;
    if (!title.trim()) { setTitleErr('Title is required.');   valid = false; }
    if (!body.trim())  { setBodyErr('Body is required.');     valid = false; }
    if (!valid) return;

    setSubmitting(true);
    const payload = {
      type,
      title:      title.trim(),
      body:       body.trim(),
      campaignId: campaignId || null,
      images:     imageUrl ? [imageUrl] : [],
    };

    try {
      if (editingPost) {
        await updatePost(editingPost.id, payload);
      } else {
        await createPost({ ...payload, creatorId: user.id });
      }
      resetComposer();
      await loadPosts();
    } finally {
      setSubmitting(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function handleDelete(post) {
    if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    await deletePost(post.id);
    loadPosts();
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <h1>Feed</h1>
        <p>Share updates and announcements with your supporters.</p>
      </div>

      {/* ── Composer ──────────────────────────────────────────────────── */}
      <div className="feed-composer card-ap mb-4" ref={composerRef}>
        {/* Header row — type toggle + cancel */}
        <div className="feed-composer-head">
          <div className="feed-type-toggle">
            {POST_TYPES.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                className={`feed-type-btn${type === key ? ' active' : ''}`}
                onClick={() => setType(key)}
              >
                <Icon size={13} strokeWidth={2} />
                {label}
              </button>
            ))}
          </div>
          {editingPost && (
            <button
              type="button"
              className="btn-reset d-flex align-items-center gap-1"
              onClick={resetComposer}
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-slate-blue)' }}
            >
              <X size={14} /> Cancel editing
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-3">
            <input
              type="text"
              className={`form-control${titleErr ? ' is-invalid' : ''}`}
              placeholder="Post title…"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleErr(''); }}
              style={{ fontWeight: 600, fontSize: '1rem' }}
              maxLength={120}
            />
            {titleErr && <div className="invalid-feedback">{titleErr}</div>}
          </div>

          {/* Body */}
          <div className="mb-3">
            <textarea
              className={`form-control${bodyErr ? ' is-invalid' : ''}`}
              rows={4}
              placeholder="Write your update here — your supporters will be notified…"
              value={body}
              onChange={e => { setBody(e.target.value); setBodyErr(''); }}
              style={{ resize: 'vertical', fontSize: '0.9375rem', lineHeight: 1.65 }}
            />
            {bodyErr && <div className="invalid-feedback">{bodyErr}</div>}
          </div>

          {/* Optional row — campaign + image */}
          <div className="feed-optional-row">
            {/* Campaign association */}
            <select
              className="form-select"
              value={campaignId}
              onChange={e => setCampaignId(e.target.value)}
              style={{ fontSize: '0.875rem', flex: '0 0 auto', maxWidth: 260 }}
            >
              <option value="">General (no campaign)</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            {/* Image */}
            {previewUrl ? (
              <div className="feed-img-preview-row">
                <img
                  src={previewUrl}
                  alt="Post image preview"
                  className="feed-img-thumb"
                  onError={() => setPreviewUrl('')}
                />
                <button type="button" className="feed-img-clear" onClick={clearImage} aria-label="Remove image">
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                <input
                  type="url"
                  className="form-control"
                  placeholder="Image URL (optional)"
                  value={typeof imageUrl === 'string' && !imageUrl.startsWith('data:') ? imageUrl : ''}
                  onChange={e => handleImageUrl(e.target.value)}
                  style={{ fontSize: '0.8125rem' }}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                  onClick={() => fileRef.current?.click()}
                  title="Upload image file"
                >
                  <UploadCloud size={13} strokeWidth={1.75} />
                  Upload
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFile}
                />
              </div>
            )}
          </div>

          {/* Submit row */}
          <div className="feed-submit-row">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="d-inline-flex align-items-center gap-2"
            >
              {submitting
                ? 'Posting…'
                : editingPost ? 'Update post' : 'Post'}
            </Button>
          </div>
        </form>
      </div>

      {/* ── Post list ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="d-flex flex-column gap-3">
          {[0, 1].map(i => (
            <div key={i} className="card-ap p-4" style={{ opacity: 0.4 }}>
              <div style={{ height: 14, width: '40%', background: 'rgba(114,136,174,0.15)', borderRadius: 5, marginBottom: 12 }} />
              <div style={{ height: 18, width: '70%', background: 'rgba(114,136,174,0.12)', borderRadius: 5 }} />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Rss size={28} strokeWidth={1.5} /></div>
          <h3>No posts yet</h3>
          <p>Write your first update or announcement above — supporters who follow you will be notified.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {posts.map(post => {
            const postType        = POST_TYPES.find(t => t.key === post.type);
            const linkedCampaign  = campaigns.find(c => c.id === post.campaignId);
            const isCurrentlyEditing = editingPost?.id === post.id;

            return (
              <article
                key={post.id}
                className={`feed-post-card card-ap${isCurrentlyEditing ? ' feed-post-card--editing' : ''}`}
              >
                {/* Meta row */}
                <div className="feed-post-head">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {postType && (
                      <span className={`badge-ap ${postType.badgeClass}`}>
                        <postType.Icon size={11} strokeWidth={2} />
                        {postType.label}
                      </span>
                    )}
                    {linkedCampaign && (
                      <span className="badge-ap badge-slate" style={{ fontSize: '0.7rem', opacity: 0.85 }}>
                        {linkedCampaign.title.length > 32
                          ? `${linkedCampaign.title.slice(0, 32)}…`
                          : linkedCampaign.title}
                      </span>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-1">
                    <span className="feed-post-time">{timeAgo(post.createdAt)}</span>
                    <button
                      className="topbar-icon-btn"
                      style={{ width: 30, height: 30, borderRadius: 6 }}
                      onClick={() => handleEditClick(post)}
                      aria-label="Edit post"
                    >
                      <Edit3 size={13} strokeWidth={1.75} />
                    </button>
                    <button
                      className="topbar-icon-btn"
                      style={{ width: 30, height: 30, borderRadius: 6, color: 'var(--color-danger)' }}
                      onClick={() => handleDelete(post)}
                      aria-label="Delete post"
                    >
                      <Trash2 size={13} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>

                <h3 className="feed-post-title">{post.title}</h3>

                <div className="feed-post-body">
                  {post.body.split('\n\n').filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {post.images?.[0] && (
                  <img
                    src={post.images[0]}
                    alt=""
                    className="feed-post-img"
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}