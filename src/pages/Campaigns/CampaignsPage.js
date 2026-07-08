/**
 * CampaignsPage.js — Campaign management for creators.
 * Lists all campaigns (sorted active→draft→completed), lets creator
 * create, edit, publish, complete, and delete campaigns.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Button   from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import {
  Plus, Edit3, MoreHorizontal, Rocket,
  Calendar, Users, CheckCircle2, Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getCampaigns,
  updateCampaign,
  deleteCampaign,
  getCreatorByUserId,
} from '../../services/mockApi';
import CampaignFormModal from '../../components/CampaignFormModal/CampaignFormModal';

function pct(current, goal) { return Math.min(100, Math.round((current / goal) * 100)); }
function daysLeft(deadline)  { return Math.max(0, Math.ceil((new Date(deadline) - Date.now()) / 86_400_000)); }
function fmt(amount)         { return `$${Number(amount).toLocaleString()}`; }
function fmtDate(dateStr)    { return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }

const STATUS = {
  active:    { label: 'Active',   badgeClass: 'badge-success' },
  draft:     { label: 'Draft',    badgeClass: 'badge-slate'   },
  completed: { label: 'Complete', badgeClass: 'badge-indigo'  },
};
const STATUS_ORDER = { active: 0, draft: 1, completed: 2 };

const MoreToggle = React.forwardRef(function MoreToggle({ onClick }, ref) {
  return (
    <button
      ref={ref}
      className="topbar-icon-btn"
      style={{ width: 32, height: 32, borderRadius: 6 }}
      onClick={e => { e.preventDefault(); onClick(e); }}
      aria-label="More actions"
    >
      <MoreHorizontal size={16} strokeWidth={1.75} />
    </button>
  );
});

function CampaignCard({ campaign, creatorSlug, onEdit, onStatusChange, onDelete }) {
  const progress = pct(campaign.currentAmount, campaign.goalAmount);
  const left     = daysLeft(campaign.deadline);
  const cfg      = STATUS[campaign.status] ?? STATUS.draft;

  return (
    <div className="camp-card">
      <div className="camp-card-head">
        <span className={`badge-ap ${cfg.badgeClass}`}>{cfg.label}</span>
        <h3 className="camp-card-title">{campaign.title}</h3>
        <div className="camp-card-actions">
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-inline-flex align-items-center gap-1"
            onClick={() => onEdit(campaign)}
          >
            <Edit3 size={13} strokeWidth={1.75} /> Edit
          </Button>
          <Dropdown align="end">
            <Dropdown.Toggle as={MoreToggle} />
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to={`/creator/${creatorSlug}`} target="_blank" rel="noopener noreferrer">
                View public page
              </Dropdown.Item>
              {campaign.status === 'draft'     && <Dropdown.Item onClick={() => onStatusChange(campaign, 'active')}>Publish campaign</Dropdown.Item>}
              {campaign.status === 'active'    && <Dropdown.Item onClick={() => onStatusChange(campaign, 'completed')}>Mark as complete</Dropdown.Item>}
              {campaign.status === 'completed' && <Dropdown.Item onClick={() => onStatusChange(campaign, 'active')}>Re-open campaign</Dropdown.Item>}
              <Dropdown.Divider />
              <Dropdown.Item className="text-danger" onClick={() => onDelete(campaign)}>Delete campaign</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      <div className="camp-card-progress">
        <div className="ap-bar" style={{ height: 8 }}>
          <div className={`ap-bar-fill${progress >= 100 ? ' success' : ''}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="camp-card-meta">
        <span className="camp-meta-raised">{fmt(campaign.currentAmount)}</span>
        <span className="camp-meta-muted">of {fmt(campaign.goalAmount)}</span>
        <span className="camp-meta-sep">·</span>
        <span className="camp-meta-muted"><Users size={12} className="me-1" />{campaign.backerCount} backers</span>
        <span className="camp-meta-sep">·</span>
        <span className="camp-meta-muted">
          <Calendar size={12} className="me-1" />
          {campaign.status === 'completed'
            ? `Ended ${fmtDate(campaign.deadline)}`
            : left > 0 ? `${left}d left` : `Deadline passed`}
        </span>
        <span className="camp-meta-pct ms-auto">{progress}%</span>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const { user } = useAuth();

  const [campaigns,  setCampaigns]  = useState([]);
  const [creator,    setCreator]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [formTarget, setFormTarget] = useState(null);

  const loadAll = useCallback(async () => {
    const [camps, c] = await Promise.all([
      getCampaigns(user.id),
      getCreatorByUserId(user.id),
    ]);
    setCampaigns([...camps].sort((a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3)));
    setCreator(c);
  }, [user?.id]);

  useEffect(() => { loadAll().finally(() => setLoading(false)); }, [loadAll]);

  const openNew  = ()         => setFormTarget({});
  const openEdit = (campaign) => setFormTarget({ campaign });
  const closeForm= ()         => setFormTarget(null);
  const afterSave= ()         => { closeForm(); loadAll(); };

  const handleStatusChange = async (campaign, newStatus) => {
    await updateCampaign(campaign.id, { status: newStatus });
    loadAll();
  };

  const handleDelete = async (campaign) => {
    if (!window.confirm(`Delete "${campaign.title}"? This cannot be undone.`)) return;
    await deleteCampaign(campaign.id);
    loadAll();
  };

  const active    = campaigns.filter(c => c.status === 'active').length;
  const draft     = campaigns.filter(c => c.status === 'draft').length;
  const completed = campaigns.filter(c => c.status === 'completed').length;

  if (loading) {
    return (
      <div>
        <div className="page-header"><h1>Campaigns</h1></div>
        <div className="d-flex flex-column gap-3">
          {[0,1].map(i => (
            <div key={i} className="camp-card" style={{ opacity: 0.45 }}>
              <div style={{ height: 16, width: '55%', background: 'rgba(114,136,174,0.12)', borderRadius: 5 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header d-flex align-items-start justify-content-between flex-wrap gap-3">
        <div>
          <h1>Campaigns</h1>
          <p>
            {campaigns.length === 0
              ? 'Create your first campaign to start receiving pledges.'
              : `${active} active · ${draft} draft · ${completed} complete`}
          </p>
        </div>
        <Button variant="primary" className="d-inline-flex align-items-center gap-2" onClick={openNew}>
          <Plus size={16} strokeWidth={2.5} /> New campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Rocket size={28} strokeWidth={1.5} /></div>
          <h3>No campaigns yet</h3>
          <p>Launch your first campaign to start raising funds and sharing progress with supporters.</p>
          <Button variant="primary" className="mt-3 d-inline-flex align-items-center gap-2" onClick={openNew}>
            <Plus size={16} strokeWidth={2.5} /> Create first campaign
          </Button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {campaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              creatorSlug={creator?.uniqueSlug ?? ''}
              onEdit={openEdit}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {formTarget !== null && (
        <CampaignFormModal
          campaign={formTarget.campaign ?? null}
          creatorId={user.id}
          onClose={closeForm}
          onSaved={afterSave}
        />
      )}
    </div>
  );
}