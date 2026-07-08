import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Pencil, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/** Map role → platform entry route */
const ROLE_ROUTES = {
  creator:   '/app/dashboard',
  supporter: '/app/discover',
};

export default function LoginPage() {
  const { loginAs, user, role } = useAuth();
  const navigate                = useNavigate();
  const location                = useLocation();

  const [selected,  setSelected]  = useState(null); // 'creator' | 'supporter'
  const [loading,   setLoading]   = useState(false);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user && role) {
      const dest = location.state?.from ?? ROLE_ROUTES[role] ?? '/app/dashboard';
      navigate(dest, { replace: true });
    }
  }, [user, role, navigate, location.state]);

  async function handleRoleSelect(r) {
    if (loading) return;
    setSelected(r);
    setLoading(true);

    // Small artificial delay so the UI doesn't flash instantaneously
    await new Promise(res => setTimeout(res, 480));

    loginAs(r);
    const dest = location.state?.from ?? ROLE_ROUTES[r] ?? '/app/dashboard';
    navigate(dest, { replace: true });
  }

  const roles = [
    {
      key:   'creator',
      label: 'I\'m a Creator',
      desc:  'Raise funds for a project, share progress updates, and get paid directly by your audience.',
      Icon:  Pencil,
      color: 'creator',
    },
    {
      key:   'supporter',
      label: 'I\'m a Supporter',
      desc:  'Discover Zimbabwean creators doing meaningful work and fund the projects you love.',
      Icon:  Heart,
      color: 'supporter',
    },
  ];

  return (
    <div className="login-page">
      {/* Logo & brand */}
      <div className="text-center" style={{ marginBottom: '2.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className="login-brand">AfroPatron</div>
          <p className="login-tagline">
            Creator funding built for Zimbabwe
          </p>
        </Link>
      </div>

      {/* Heading */}
      <div style={{ maxWidth: 560, width: '100%' }}>
        <h1 className="login-heading">
          Choose how you want to use AfroPatron
        </h1>
        <p className="login-sub">
          You can switch at any time from the user menu.
        </p>

        {/* Role cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {roles.map(({ key, label, desc, Icon, color }) => {
            const isSelected   = selected === key;
            const isLoadingThis = loading && isSelected;

            return (
              <button
                key={key}
                className={`role-card${isSelected ? ' is-selected' : ''}`}
                onClick={() => handleRoleSelect(key)}
                disabled={loading}
                aria-pressed={isSelected}
                type="button"
              >
                {/* Arrow indicator */}
                <ArrowRight
                  size={16}
                  className="role-card-arrow"
                  strokeWidth={2}
                />

                {/* Icon */}
                <div className={`role-icon-wrap role-icon-${color}`}>
                  {isLoadingThis ? (
                    <Loader2
                      size={28}
                      strokeWidth={2}
                      style={{ animation: 'spin 0.8s linear infinite' }}
                    />
                  ) : (
                    <Icon size={28} strokeWidth={1.75} />
                  )}
                </div>

                {/* Label & description */}
                <div className="role-title">{label}</div>
                <p className="role-desc">{desc}</p>
              </button>
            );
          })}
        </div>

        {/* Demo note */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: 'var(--color-slate-blue)',
            margin: 0,
          }}
        >
          <strong>AfroPatron demo</strong> — no sign-up required.
          You'll be logged in as a seed demo account.
        </p>
      </div>

      {/* Spin keyframe — injected inline so no extra CSS file needed */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
