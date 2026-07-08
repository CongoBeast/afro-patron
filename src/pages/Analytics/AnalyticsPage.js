/**
 * AnalyticsPage.js — Creator analytics dashboard.
 * Charts: AreaChart (daily), PieChart (payment method), BarChart (campaign).
 * Table: top supporters. All computed from getTransactions client-side.
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth }   from '../../context/AuthContext';
import { getTransactions, getCampaigns } from '../../services/mockApi';

const RANGES = [
  { key: '7d',  label: 'Last 7 days',  days: 7   },
  { key: '30d', label: 'Last 30 days', days: 30   },
  { key: 'all', label: 'All time',     days: 365  },
];

const METHOD_LABEL = { ecocash: 'EcoCash', card: 'Card', bank_transfer: 'Bank Transfer' };

const C = { indigo: '#4B5694', success: '#2D9B6F', warning: '#E89A2B', danger: '#D94F4F', slate: '#7288AE' };
const PIE_COLORS = [C.indigo, C.success, C.warning, C.danger, C.slate];

function buildDailyData(txns, days) {
  const now = Date.now();
  const map = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    map[d.toISOString().slice(0, 10)] = 0;
  }
  txns.forEach(t => { const k = t.createdAt.slice(0, 10); if (k in map) map[k] += t.amount; });
  return Object.entries(map).map(([iso, amount]) => ({
    date: new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    amount,
  }));
}

function buildMethodData(txns) {
  const map = {};
  txns.forEach(t => { const n = METHOD_LABEL[t.paymentMethod] ?? t.paymentMethod; map[n] = (map[n] ?? 0) + t.amount; });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function buildCampaignData(txns, campaigns) {
  const map = {};
  txns.forEach(t => { const k = t.campaignId ?? '__g'; map[k] = (map[k] ?? 0) + t.amount; });
  return Object.entries(map).map(([id, amount]) => {
    if (id === '__g') return { name: 'General support', amount };
    const c = campaigns.find(c => c.id === id);
    const raw = c?.title ?? id;
    return { name: raw.length > 24 ? raw.slice(0, 24) + '…' : raw, amount };
  }).sort((a, b) => b.amount - a.amount);
}

function buildTopSupporters(txns) {
  const map = {};
  txns.forEach(t => {
    const k = t.supporterId ?? `__${t.supporterName}`;
    if (!map[k]) map[k] = { name: t.supporterName ?? 'Anonymous', total: 0, lastDate: t.createdAt };
    map[k].total += t.amount;
    if (t.createdAt > map[k].lastDate) map[k].lastDate = t.createdAt;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days > 30) return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (days > 0) return `${days}d ago`;
  const h = Math.floor(diff / 3_600_000);
  return h > 0 ? `${h}h ago` : 'recently';
}

function TTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(114,136,174,0.22)', borderRadius: 8, padding: '0.5rem 0.875rem', boxShadow: '0 4px 12px rgba(17,24,68,0.1)', fontSize: 12 }}>
      {label && <div style={{ color: C.slate, fontSize: 11, marginBottom: 2 }}>{label}</div>}
      <div style={{ fontWeight: 700, color: '#111844' }}>${payload[0]?.value?.toLocaleString()}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [allTxns,   setAllTxns]   = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [range,     setRange]     = useState('30d');

  useEffect(() => {
    Promise.all([getTransactions({ creatorId: user.id }), getCampaigns(user.id)])
      .then(([t, c]) => { setAllTxns(t); setCampaigns(c); })
      .finally(() => setLoading(false));
  }, [user.id]);

  const rc = RANGES.find(r => r.key === range) ?? RANGES[1];
  const txns = useMemo(() => {
    if (range === 'all') return allTxns;
    const cut = Date.now() - rc.days * 86_400_000;
    return allTxns.filter(t => new Date(t.createdAt).getTime() >= cut);
  }, [allTxns, range, rc]);

  const dailyData     = useMemo(() => buildDailyData(txns, rc.days),           [txns, rc]);
  const methodData    = useMemo(() => buildMethodData(txns),                    [txns]);
  const campaignData  = useMemo(() => buildCampaignData(txns, campaigns),       [txns, campaigns]);
  const topSupporters = useMemo(() => buildTopSupporters(txns),                 [txns]);

  const totalRaised = txns.reduce((s, t) => s + t.amount, 0);
  const avgPledge   = txns.length ? totalRaised / txns.length : 0;
  const uniqueCount = new Set(txns.filter(t => t.supporterId).map(t => t.supporterId)).size;

  if (loading) return (
    <div><div className="page-header"><h1>Analytics</h1></div>
      <div style={{ textAlign: 'center', padding: '5rem', color: C.slate }}>Loading analytics…</div>
    </div>
  );

  const noData = txns.length === 0;

  return (
    <div>
      {/* Header + range */}
      <div className="page-header d-flex align-items-start justify-content-between flex-wrap gap-3">
        <div>
          <h1>Analytics</h1>
          <p>Earnings, payment methods, and supporter breakdown.</p>
        </div>
        <div className="analytics-range-tabs">
          {RANGES.map(r => (
            <button key={r.key} className={`analytics-range-btn${range === r.key ? ' active' : ''}`} onClick={() => setRange(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div className="analytics-summary-strip mb-4">
        <div className="analytics-summary-stat">
          <span className="analytics-summary-value">${totalRaised.toLocaleString()}</span>
          <span className="analytics-summary-label">Total raised</span>
        </div>
        <div className="analytics-summary-divider" />
        <div className="analytics-summary-stat">
          <span className="analytics-summary-value">{txns.length}</span>
          <span className="analytics-summary-label">Transactions</span>
        </div>
        <div className="analytics-summary-divider" />
        <div className="analytics-summary-stat">
          <span className="analytics-summary-value">${avgPledge.toFixed(0)}</span>
          <span className="analytics-summary-label">Avg pledge</span>
        </div>
        <div className="analytics-summary-divider" />
        <div className="analytics-summary-stat">
          <span className="analytics-summary-value">{uniqueCount}</span>
          <span className="analytics-summary-label">Unique supporters</span>
        </div>
      </div>

      {/* Area chart */}
      <div className="chart-card mb-4">
        <div className="chart-card-header">Funds raised over time</div>
        <div className="chart-body">
          {noData ? <div className="chart-empty">No transactions in this period</div> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.indigo} stopOpacity={0.13} />
                    <stop offset="95%" stopColor={C.indigo} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(114,136,174,0.13)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.slate }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: C.slate }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={46} />
                <Tooltip content={<TTip />} />
                <Area type="monotone" dataKey="amount" stroke={C.indigo} strokeWidth={2} fill="url(#aGrad)" dot={false} activeDot={{ r: 4, fill: C.indigo, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pie + Bar */}
      <div className="row g-4 mb-4">
        <div className="col-md-5">
          <div className="chart-card h-100">
            <div className="chart-card-header">By payment method</div>
            <div className="chart-body">
              {methodData.length === 0 ? <div className="chart-empty">No data</div> : (
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={methodData} cx="50%" cy="45%" innerRadius={52} outerRadius={82} paddingAngle={3} dataKey="value">
                      {methodData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`$${v.toLocaleString()}`, n]} contentStyle={{ borderRadius: 8, border: '1px solid rgba(114,136,174,0.22)', fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-7">
          <div className="chart-card h-100">
            <div className="chart-card-header">By campaign</div>
            <div className="chart-body">
              {campaignData.length === 0 ? <div className="chart-empty">No data</div> : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={campaignData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(114,136,174,0.12)" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: C.slate }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: C.slate }} tickLine={false} axisLine={false} width={112} />
                    <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Raised']} contentStyle={{ borderRadius: 8, border: '1px solid rgba(114,136,174,0.22)', fontSize: 12 }} />
                    <Bar dataKey="amount" fill={C.indigo} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top supporters */}
      <div className="chart-card">
        <div className="chart-card-header">Top supporters</div>
        {topSupporters.length === 0 ? (
          <div className="chart-empty">No supporters yet for this period</div>
        ) : (
          <>
            <div className="analytics-table-head">
              <span>Supporter</span>
              <span>Total pledged</span>
              <span>Last pledge</span>
            </div>
            {topSupporters.map((s, i) => (
              <div key={i} className="analytics-table-row">
                <div className="d-flex align-items-center gap-2">
                  <div className="analytics-supporter-av">{s.name.slice(0, 1).toUpperCase()}</div>
                  <span className="analytics-supporter-name">{s.name}</span>
                  {i === 0 && <span className="badge-ap badge-warning" style={{ fontSize: '0.65rem' }}>Top supporter</span>}
                </div>
                <span className="analytics-table-amount">${s.total.toLocaleString()}</span>
                <span className="analytics-table-date">{timeAgo(s.lastDate)}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}