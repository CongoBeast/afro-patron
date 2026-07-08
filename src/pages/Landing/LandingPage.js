import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import {
  Pencil,
  Mic2,
  Camera,
  Headphones,
  Link2,
  BarChart3,
  Wallet,
  Shield,
  Smartphone,
  Globe,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
  Rss,
  Users,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
} from 'lucide-react';

// ─── Hero SVG illustration ─────────────────────────────────────────────────
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 460 400"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', maxHeight: 420 }}
      aria-hidden="true"
    >
      {/* Background blobs */}
      <ellipse cx="230" cy="210" rx="200" ry="175" fill="rgba(75,86,148,0.06)" />
      <circle cx="380" cy="80"  r="48" fill="rgba(45,155,111,0.08)" />
      <circle cx="60"  cy="300" r="36" fill="rgba(75,86,148,0.07)" />

      {/* Phone frame */}
      <rect x="140" y="28" width="160" height="310" rx="24" fill="#111844" />
      {/* Screen */}
      <rect x="153" y="46" width="134" height="274" rx="16" fill="#EAE0CF" />
      {/* Notch */}
      <rect x="192" y="46" width="56" height="18" rx="9" fill="#111844" />

      {/* App header on screen */}
      <rect x="167" y="74"  width="56" height="10" rx="4" fill="#111844" />
      <rect x="167" y="90"  width="38" height="7"  rx="3" fill="rgba(114,136,174,0.45)" />

      {/* Primary campaign card */}
      <rect x="165" y="108" width="110" height="100" rx="10" fill="white" />

      {/* Category label */}
      <rect x="175" y="118" width="40" height="7"  rx="3.5" fill="rgba(75,86,148,0.15)" />
      {/* Title lines */}
      <rect x="175" y="132" width="78"  height="9"  rx="3" fill="#111844" />
      <rect x="175" y="146" width="58"  height="7"  rx="3" fill="rgba(114,136,174,0.4)" />
      {/* Progress track */}
      <rect x="175" y="164" width="90" height="6" rx="3" fill="#EAE0CF" />
      {/* Progress fill — 75% */}
      <rect x="175" y="164" width="67" height="6" rx="3" fill="#4B5694" />
      {/* Amounts row */}
      <rect x="175" y="178" width="48" height="9"  rx="3" fill="#111844" />
      <rect x="233" y="180" width="28" height="6"  rx="3" fill="rgba(114,136,174,0.35)" />
      {/* Goal pct */}
      <rect x="247" y="196" width="20" height="7"  rx="3" fill="rgba(75,86,148,0.5)" />

      {/* Support CTA button */}
      <rect x="165" y="220" width="110" height="30" rx="8" fill="#111844" />
      <rect x="197" y="230" width="46"  height="10" rx="4" fill="rgba(255,255,255,0.9)" />

      {/* Second campaign card (partial, scrolled) */}
      <rect x="165" y="264" width="110" height="52" rx="10" fill="white" opacity="0.7" />
      <rect x="175" y="274" width="66"  height="8"  rx="3" fill="#111844" />
      <rect x="175" y="288" width="90"  height="5"  rx="2.5" fill="#EAE0CF" />
      <rect x="175" y="288" width="42"  height="5"  rx="2.5" fill="#4B5694" />
      <rect x="175" y="300" width="34"  height="7"  rx="3" fill="#111844" />

      {/* ── Floating payment badges ──────────────────────────────────── */}
      {/* EcoCash */}
      <rect x="300" y="88"  width="120" height="40" rx="20" fill="#2D9B6F" />
      <circle cx="320" cy="108" r="12" fill="rgba(255,255,255,0.18)" />
      <rect x="338" y="101" width="60" height="9"  rx="4" fill="rgba(255,255,255,0.92)" />
      <rect x="338" y="114" width="42" height="7"  rx="3" fill="rgba(255,255,255,0.55)" />

      {/* Visa / Card */}
      <rect x="300" y="168" width="120" height="40" rx="20" fill="#111844" />
      <rect x="314" y="182" width="18"  height="12" rx="3" fill="rgba(255,255,255,0.22)" />
      <rect x="340" y="175" width="60"  height="9"  rx="4" fill="rgba(255,255,255,0.92)" />
      <rect x="340" y="188" width="42"  height="7"  rx="3" fill="rgba(255,255,255,0.45)" />

      {/* Bank Transfer */}
      <rect x="300" y="248" width="120" height="40" rx="20" fill="#4B5694" />
      <rect x="314" y="262" width="18"  height="12" rx="3" fill="rgba(255,255,255,0.22)" />
      <rect x="340" y="255" width="60"  height="9"  rx="4" fill="rgba(255,255,255,0.92)" />
      <rect x="340" y="268" width="42"  height="7"  rx="3" fill="rgba(255,255,255,0.45)" />

      {/* ── Left floating elements ───────────────────────────────────── */}
      {/* Success pledge chip */}
      <rect x="20"  y="120" width="100" height="42" rx="21" fill="white"
            stroke="rgba(114,136,174,0.25)" strokeWidth="1" />
      <circle cx="42" cy="141" r="10" fill="rgba(45,155,111,0.15)" />
      <rect   cx="42" cy="141" x="31" y="135" width="22" height="12" rx="6"
              fill="rgba(45,155,111,0.15)" />
      <text x="38" y="144" fontSize="11" fill="#2D9B6F" fontWeight="800" fontFamily="Inter, sans-serif">✓</text>
      <rect x="58" y="134" width="48" height="9"  rx="3" fill="#111844" />
      <rect x="58" y="147" width="36" height="7"  rx="3" fill="rgba(114,136,174,0.4)" />

      {/* Supporters count chip */}
      <rect x="24"  y="220" width="90"  height="38" rx="19" fill="white"
            stroke="rgba(114,136,174,0.22)" strokeWidth="1" />
      <rect x="36"  y="233" width="66" height="8"  rx="3" fill="#111844" />
      <rect x="36"  y="245" width="44" height="7"  rx="3" fill="rgba(114,136,174,0.4)" />

      {/* Decorative circles */}
      <circle cx="36"  cy="340" r="12" fill="rgba(75,86,148,0.12)"  />
      <circle cx="14"  cy="180" r="7"  fill="rgba(75,86,148,0.10)"  />
      <circle cx="430" cy="60"  r="10" fill="rgba(45,155,111,0.15)" />
      <circle cx="444" cy="330" r="8"  fill="rgba(75,86,148,0.12)"  />
      <circle cx="110" cy="370" r="6"  fill="rgba(75,86,148,0.10)"  />
    </svg>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    Icon: Pencil,
    title: 'Create your page',
    desc: 'Set up your AfroPatron profile in minutes — add your story, what you create, and how you want to be paid.',
  },
  {
    step: '02',
    Icon: Target,
    title: 'Launch a campaign',
    desc: 'Define a goal and deadline. Your supporters see exactly what their contribution makes possible.',
  },
  {
    step: '03',
    Icon: Zap,
    title: 'Share your link',
    desc: 'One shareable URL works for WhatsApp, Twitter/X, Instagram — anywhere your audience is.',
  },
  {
    step: '04',
    Icon: Wallet,
    title: 'Get paid directly',
    desc: 'Once verified, request payouts straight to your EcoCash wallet, bank account, or OneMoney number.',
  },
];

const PAYMENT_RAILS = [
  {
    name: 'EcoCash',
    color: '#2D9B6F',
    bg: 'rgba(45,155,111,0.09)',
    desc: 'The most widely used mobile money platform in Zimbabwe — supporters send from their phones in seconds.',
  },
  {
    name: 'OneMoney',
    color: '#E89A2B',
    bg: 'rgba(232,154,43,0.09)',
    desc: 'NetOnes mobile wallet, popular across urban and peri-urban communities nationwide.',
  },
  {
    name: 'ZimSwitch',
    color: '#4B5694',
    bg: 'rgba(75,86,148,0.09)',
    desc: 'Direct interbank transfers via Zimbabwes national switch — for supporters with a local bank account.',
  },
  {
    name: 'Visa / Mastercard',
    color: '#111844',
    bg: 'rgba(17,24,68,0.07)',
    desc: 'International cards accepted — perfect for diaspora supporters sending from abroad.',
  },
];

const FEATURES = [
  { Icon: Target,  title: 'Campaigns with goals',        desc: 'Set a funding target and deadline. A live progress bar shows backers exactly how close you are.' },
  { Icon: Rss,     title: 'Progress feed & updates',     desc: 'Post updates tied to each campaign. Backers get notified and stay invested in your journey.' },
  { Icon: Link2,   title: 'One shareable funding link',  desc: 'A clean /support/your-name URL — paste it anywhere, works on every device.' },
  { Icon: BarChart3, title: 'Supporter analytics',       desc: 'See whos pledging, which campaigns are performing, and how your revenue trends over time.' },
  { Icon: Wallet,  title: 'Multiple payout methods',     desc: 'EcoCash, OneMoney, ZimSwitch, or bank transfer — choose what works best for you.' },
  { Icon: Shield,  title: 'KYC-verified payouts',        desc: 'A quick one-time identity check protects creators and supporters alike, and keeps payouts compliant.' },
];

const CREATOR_CARDS = [
  {
    initials: 'TM',
    name: '— Tendai M., Visual Artist · Harare',
    quote: '"I\'ve raised for two projects now. The fact that my fans can pay via EcoCash without any setup is what makes this work here."',
    category: 'Art & Illustration',
    color: '#4B5694',
  },
  {
    initials: 'RC',
    name: '— Rudo C., Musician & Podcaster · Bulawayo',
    quote: '"I was sceptical at first — I\'d been burned by platforms that don\'t actually support Zimbabwe. AfroPatron just works."',
    category: 'Music & Podcasts',
    color: '#2D9B6F',
  },
  {
    initials: 'NK',
    name: '— Nyasha K., Writer · Diaspora',
    quote: '"My readers are split between Zimbabwe and the diaspora. Finally a platform where both can support me without friction."',
    category: 'Writing & Publishing',
    color: '#E89A2B',
  },
];

const PRICING_INCLUDES = [
  'Unlimited campaigns',
  'All payment methods',
  'Real-time analytics dashboard',
  'Progress feed & supporter updates',
  'KYC-verified creator accounts',
  'No monthly subscription',
];

const SOCIAL_ICONS = [
  { Icon: Twitter,   href: '#', label: 'Twitter / X' },
  { Icon: Instagram, href: '#', label: 'Instagram'   },
  { Icon: Youtube,   href: '#', label: 'YouTube'     },
  { Icon: Linkedin,  href: '#', label: 'LinkedIn'    },
];

const FOOTER_LINKS = {
  Platform:  ['How it Works', 'For Creators', 'For Supporters', 'Pricing'],
  Company:   ['About', 'Blog', 'Careers', 'Press'],
  Support:   ['Help Centre', 'Contact Us', 'Creator Guidelines', 'Fees & Payouts'],
  Legal:     ['Terms of Service', 'Privacy Policy', 'Cookie Policy'],
};

// ─── Landing page ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* ════════════════════════════════════════════════════════════════
          1. Navbar
      ════════════════════════════════════════════════════════════════ */}
      <nav className={`lp-nav${scrolled ? ' is-scrolled' : ''}`}>
        <Container>
          <div
            className="d-flex align-items-center justify-content-between"
            style={{ height: 72 }}
          >
            {/* Brand */}
            <Link to="/" className="lp-nav-brand">AfroPatron</Link>

            {/* Nav links — hidden on mobile */}
            <div className="d-none d-md-flex align-items-center gap-4">
              <a href="#how-it-works" className="lp-nav-link">How it works</a>
              <a href="#creators"     className="lp-nav-link">For Creators</a>
              <a href="#pricing"      className="lp-nav-link">Pricing</a>
              <a href="#about"        className="lp-nav-link">About</a>
            </div>

            {/* CTAs */}
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="lp-nav-link me-1 d-none d-sm-inline">
                Log in
              </Link>
              <Button
                as={Link}
                to="/login"
                variant="primary"
                size="sm"
                className="px-3"
              >
                Get started
              </Button>
            </div>
          </div>
        </Container>
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          2. Hero
      ════════════════════════════════════════════════════════════════ */}
      <section className="lp-hero">
        <Container>
          <Row className="align-items-center g-5">
            {/* Text */}
            <Col lg={6} className="order-2 order-lg-1">
              <div className="lp-hero-eyebrow">
                <span>🇿🇼</span>
                Built for Zimbabwean creators
              </div>
              <h1>
                Get paid for your work —{' '}
                <em>by the people who love it</em>
              </h1>
              <p className="lp-hero-sub">
                AfroPatron connects Zimbabwean creators with patrons who fund
                their work directly via EcoCash, OneMoney, ZimSwitch, or
                international card. No barriers. No middlemen. No excuses.
              </p>
              <div className="lp-hero-ctas">
                <Button
                  as={Link}
                  to="/login"
                  variant="primary"
                  size="lg"
                  className="d-inline-flex align-items-center gap-2"
                >
                  Start a campaign
                  <ArrowRight size={18} />
                </Button>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  size="lg"
                >
                  Support a creator
                </Button>
              </div>

              {/* Social proof strip */}
              <div
                className="d-flex align-items-center gap-3 mt-4"
                style={{ color: 'var(--color-slate-blue)', fontSize: '0.8125rem' }}
              >
                <span className="d-flex align-items-center gap-1">
                  <CheckCircle2 size={14} color="var(--color-success)" />
                  EcoCash supported
                </span>
                <span className="d-flex align-items-center gap-1">
                  <CheckCircle2 size={14} color="var(--color-success)" />
                  No monthly fees
                </span>
                <span className="d-flex align-items-center gap-1">
                  <CheckCircle2 size={14} color="var(--color-success)" />
                  KYC-verified payouts
                </span>
              </div>
            </Col>

            {/* Illustration */}
            <Col lg={6} className="order-1 order-lg-2">
              <HeroIllustration />
            </Col>
          </Row>
        </Container>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          3. How it works
      ════════════════════════════════════════════════════════════════ */}
      <section className="lp-section alt" id="how-it-works">
        <Container>
          <div className="text-center mb-5">
            <p className="lp-section-eyebrow">Simple by design</p>
            <h2 className="lp-section-heading">From idea to funded — in four steps</h2>
            <p className="lp-section-sub mx-auto">
              We stripped out everything that wasn't essential. No complicated
              tiers, no opaque approval processes.
            </p>
          </div>
          <Row className="g-4">
            {HOW_IT_WORKS.map(({ step, Icon, title, desc }) => (
              <Col key={step} sm={6} lg={3}>
                <div className="lp-step-card">
                  <div className="lp-step-num">Step {step}</div>
                  <div className="lp-step-icon">
                    <Icon size={24} strokeWidth={1.75} />
                  </div>
                  <h4
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {title}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-slate-blue)',
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          4. Built for Zimbabwe — payment rails
      ════════════════════════════════════════════════════════════════ */}
      <section className="lp-section" id="zimbabwe">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={5}>
              <p className="lp-section-eyebrow">No global-platform nonsense</p>
              <h2 className="lp-section-heading">Built for Zimbabwe's payment reality</h2>
              <p
                style={{
                  color: 'var(--color-slate-blue)',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem',
                }}
              >
                Patreon, Ko-fi, and similar platforms don't support EcoCash
                payouts — or any Zimbabwean payout rails. That means creators
                who earn in USD locally or ZWG are effectively locked out of the
                global creator economy.
              </p>
              <p
                style={{
                  color: 'var(--color-slate-blue)',
                  lineHeight: 1.7,
                  marginBottom: 0,
                }}
              >
                AfroPatron integrates the payment methods your supporters
                already use every day — and pays out the same way.
              </p>
            </Col>
            <Col lg={7}>
              <div className="d-flex flex-column gap-3">
                {PAYMENT_RAILS.map(({ name, color, bg, desc }) => (
                  <div key={name} className="lp-rail-card">
                    <div
                      className="lp-rail-icon"
                      style={{ background: bg, color }}
                    >
                      <Smartphone size={20} strokeWidth={1.75} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: 'var(--color-navy)',
                          marginBottom: '0.2rem',
                        }}
                      >
                        {name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--color-slate-blue)',
                          lineHeight: 1.55,
                        }}
                      >
                        {desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          5. Feature highlights grid
      ════════════════════════════════════════════════════════════════ */}
      <section className="lp-section alt">
        <Container>
          <div className="text-center mb-5">
            <p className="lp-section-eyebrow">Everything you need</p>
            <h2 className="lp-section-heading">A full toolkit for funded creators</h2>
          </div>
          <Row className="g-3">
            {FEATURES.map(({ Icon, title, desc }) => (
              <Col key={title} sm={6} lg={4}>
                <div className="lp-feat-card">
                  <div className="lp-feat-icon">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        marginBottom: '0.25rem',
                        color: 'var(--color-navy)',
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--color-slate-blue)',
                        lineHeight: 1.55,
                      }}
                    >
                      {desc}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          6. For Creators — placeholder testimonial cards
      ════════════════════════════════════════════════════════════════ */}
      <section className="lp-section" id="creators">
        <Container>
          <div className="text-center mb-5">
            <p className="lp-section-eyebrow">Real creators, real work</p>
            <h2 className="lp-section-heading">
              For artists, musicians, writers,{' '}
              <br className="d-none d-md-block" />
              podcasters & more
            </h2>
          </div>
          <Row className="g-4">
            {CREATOR_CARDS.map(({ initials, name, quote, category, color }) => (
              <Col key={name} md={4}>
                <div className="lp-creator-card h-100">
                  {/* Placeholder note */}
                  <div
                    className="badge-ap badge-slate mb-3"
                    style={{ fontSize: '0.68rem' }}
                  >
                    Placeholder · {category}
                  </div>
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--color-navy)',
                      fontStyle: 'italic',
                      lineHeight: 1.65,
                      marginBottom: '1.25rem',
                    }}
                  >
                    {quote}
                  </p>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="lp-creator-avatar"
                      style={{ background: color }}
                    >
                      {initials}
                    </div>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-slate-blue)',
                        fontStyle: 'italic',
                      }}
                    >
                      {name}
                    </span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-4">
            <Button
              as={Link}
              to="/login"
              variant="primary"
              size="lg"
              className="d-inline-flex align-items-center gap-2"
            >
              Start your page
              <ArrowRight size={18} />
            </Button>
          </div>
        </Container>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          7. Pricing
      ════════════════════════════════════════════════════════════════ */}
      <section className="lp-section alt" id="pricing">
        <Container>
          <div className="text-center mb-5">
            <p className="lp-section-eyebrow">Transparent fees</p>
            <h2 className="lp-section-heading">No surprises. No subscriptions.</h2>
          </div>
          <div className="lp-pricing-card">
            <div className="lp-pricing-rate">
              <span className="lp-pricing-sup">%</span>5
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: 'var(--color-slate-blue)',
                  marginLeft: '0.5rem',
                  verticalAlign: 'middle',
                }}
              >
                platform fee per pledge
              </span>
            </div>
            <p
              style={{
                color: 'var(--color-slate-blue)',
                fontSize: '0.875rem',
                marginTop: '0.5rem',
                marginBottom: '1.75rem',
              }}
            >
              Plus standard payment processing fees (2–3% depending on method).
              {' '}
              <strong style={{ color: 'var(--color-navy)' }}>
                No monthly fee. No listing fee.
              </strong>
              {' '}
              <em style={{ color: 'var(--color-warning)', fontSize: '0.8rem' }}>
                Rate is placeholder — final fees to be confirmed.
              </em>
            </p>
            <hr style={{ borderColor: 'var(--color-slate-15)', margin: '1.5rem 0' }} />
            <div className="text-start">
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--color-slate-blue)',
                  marginBottom: '1rem',
                }}
              >
                Included for every creator
              </div>
              <div className="d-flex flex-column gap-2">
                {PRICING_INCLUDES.map(item => (
                  <div
                    key={item}
                    className="d-flex align-items-center gap-2"
                    style={{ fontSize: '0.9rem', color: 'var(--color-navy)' }}
                  >
                    <CheckCircle2
                      size={16}
                      color="var(--color-success)"
                      strokeWidth={2.5}
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-4">
              <Button
                as={Link}
                to="/login"
                variant="primary"
                size="lg"
                className="px-4"
              >
                Start for free
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          8. Founders / About
      ════════════════════════════════════════════════════════════════ */}
      <section className="lp-section" id="about">
        <Container>
          <div className="text-center mb-5">
            <p className="lp-section-eyebrow">Who built this</p>
            <h2 className="lp-section-heading">Made by someone who gets it</h2>
          </div>
          <div className="lp-founder-card">
            {/*
              ── PLACEHOLDER — Replace with your real photo/info ──────────────
              To update: replace the avatar div below with an <img> tag,
              and fill in the name, bio, and social links with your real details.
            */}
            <div className="lp-founder-avatar">
              {/* Replace with: <img src="/your-photo.jpg" alt="Founder" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} /> */}
              <Users size={36} strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                className="badge-ap badge-warning mb-2"
                style={{ fontSize: '0.68rem' }}
              >
                Placeholder — update with your real info
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  marginBottom: '0.25rem',
                }}
              >
                [Founder Name]
              </h3>
              <p
                style={{
                  color: 'var(--color-slate-blue)',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                }}
              >
                Founder & CEO · AfroPatron
              </p>
              <p
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  color: 'var(--color-navy)',
                  marginBottom: '1.25rem',
                }}
              >
                [Replace this paragraph with your real bio — who you are, why you
                built AfroPatron, your background, and your connection to the
                Zimbabwean creator community. Keep it honest and personal — this
                is what converts visitors into believers.]
              </p>
              <div className="d-flex gap-3 flex-wrap">
                {SOCIAL_ICONS.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    style={{ color: 'var(--color-slate-blue)' }}
                    className="d-flex align-items-center gap-1"
                  >
                    <Icon size={18} strokeWidth={1.75} />
                    <span
                      style={{ fontSize: '0.8125rem', fontWeight: 500 }}
                    >
                      {label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          9. Final CTA band
      ════════════════════════════════════════════════════════════════ */}
      <section className="lp-cta-band">
        <Container>
          <h2>Ready to get paid for your work?</h2>
          <p>
            Join Zimbabwean creators already using AfroPatron to fund projects,
            grow their audience, and earn directly from their supporters.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button
              as={Link}
              to="/login"
              size="lg"
              style={{
                background: '#fff',
                color: 'var(--color-navy)',
                border: 'none',
                fontWeight: 700,
              }}
              className="d-inline-flex align-items-center gap-2"
            >
              Get started — it's free
              <ArrowRight size={18} />
            </Button>
            <Button
              as={Link}
              to="/login"
              size="lg"
              variant="outline-light"
            >
              Browse creators
            </Button>
          </div>
        </Container>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          10. Footer
      ════════════════════════════════════════════════════════════════ */}
      <footer className="lp-footer">
        <Container>
          <Row className="g-4">
            {/* Brand column */}
            <Col md={4} lg={4}>
              <span className="lp-footer-brand">AfroPatron</span>
              <p className="lp-footer-tagline">
                Creator funding built for Zimbabwe's payment reality.
              </p>
              <div className="d-flex gap-3 mt-3">
                {SOCIAL_ICONS.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    style={{
                      color: 'rgba(255,255,255,0.45)',
                      transition: 'color 200ms',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            </Col>

            {/* Nav columns */}
            {Object.entries(FOOTER_LINKS).map(([group, links]) => (
              <Col key={group} xs={6} sm={3} md={2} lg={2}>
                <div className="lp-footer-heading">{group}</div>
                {links.map(link => (
                  <a key={link} href="#" className="lp-footer-link">
                    {link}
                  </a>
                ))}
              </Col>
            ))}
          </Row>

          <hr className="lp-footer-divider" />

          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <p className="lp-footer-copy mb-0">
              © {new Date().getFullYear()} AfroPatron. All rights reserved.
            </p>
            <p
              className="mb-0"
              style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}
            >
              Harare, Zimbabwe 🇿🇼
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
