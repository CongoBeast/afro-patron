# AfroPatron

Creator funding built for Zimbabwe's payment reality — EcoCash, OneMoney, ZimSwitch, and international card support out of the box.

---

## Quick start

### 1. Scaffold a fresh CRA app

```bash
npx create-react-app afropatron
cd afropatron
```

### 2. Install dependencies

```bash
npm install \
  bootstrap \
  react-bootstrap \
  react-router-dom \
  lucide-react \
  recharts \
  sass
```

> **`sass`** is required for SCSS compilation. CRA 5 picks it up automatically
> once it's installed — no extra webpack config needed.

### 3. Replace `src/` and `public/index.html`

Copy the contents of this folder into your CRA project:

```
afropatron/
  public/
    index.html          ← replace CRA's default
  src/
    index.js            ← replace CRA's default
    App.js
    theme/
      theme.scss        ← Bootstrap variable overrides
      theme.css         ← CSS custom properties + component styles
    mockData/
      users.js
      creators.js
      campaigns.js
      posts.js
      transactions.js
      notifications.js
    services/
      mockApi.js
    context/
      AuthContext.js
    components/
      ProtectedRoute.js
      AppShell/
        AppShell.js
        Sidebar.js
        Topbar.js
    pages/
      Landing/LandingPage.js
      Login/LoginPage.js
      Dashboard/DashboardPage.js
      Campaigns/CampaignsPage.js
      Feed/FeedPage.js
      Analytics/AnalyticsPage.js
      Payouts/PayoutsPage.js
      Profile/ProfilePage.js
      Discover/DiscoverPage.js
      Following/FollowingPage.js
      History/HistoryPage.js
```

### 4. Run the dev server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo accounts

There is no backend. Clicking a role card on `/login` auto-logs you in as a
seeded demo account. Data is persisted to `localStorage`.

| Role      | Name           | ID                 |
|-----------|----------------|--------------------|
| Creator   | Tendai Moyo    | `user-creator-1`   |
| Supporter | Chipo Ndlovu   | `user-supporter-1` |

To reset all demo data to seed state, open the browser console and run:

```js
import { resetDemoData } from './src/services/mockApi';
resetDemoData();
location.reload();
```

Or call it from any component via `mockApi.resetDemoData()`.

---

## Design system

| Token                 | Value       | Usage                                |
|-----------------------|-------------|--------------------------------------|
| `--color-navy`        | `#111844`   | Primary brand, text, buttons         |
| `--color-indigo`      | `#4B5694`   | Accent, active nav, links            |
| `--color-slate-blue`  | `#7288AE`   | Muted text, borders                  |
| `--color-cream`       | `#EAE0CF`   | Page background, sidebar light areas |

Bootstrap 5 `$primary` is overridden to `#111844` (navy), so all
`variant="primary"` components inherit the brand colour automatically.

---

## File responsibilities

| File                           | What it does                                                      |
|--------------------------------|-------------------------------------------------------------------|
| `theme/theme.scss`             | Bootstrap variable overrides — compiled at build time             |
| `theme/theme.css`              | `:root` custom properties + all component CSS                     |
| `mockData/*.js`                | Seed arrays — read-only source-of-truth for `mockApi.js`          |
| `services/mockApi.js`          | localStorage CRUD layer; all functions return Promises            |
| `context/AuthContext.js`       | Global auth state; `loginAs(role)` and `logout()`                 |
| `components/ProtectedRoute.js` | Redirects to `/login` if `AuthContext.user` is null               |
| `components/AppShell/`         | Layout: sidebar + topbar + `<Outlet>`                             |
| `pages/Landing/`               | Public marketing page (10 sections)                               |
| `pages/Login/`                 | Role-selection card UI → auto-login                               |
| `pages/*`                      | Platform pages (Dashboard, Campaigns, etc.) — stubs ready to fill |

---

## What's ready (Tasks 1–4)

- [x] CRA scaffold with all deps configured
- [x] Bootstrap Sass variable overrides (`theme.scss`)
- [x] Full CSS design system with custom properties (`theme.css`)
- [x] Mock data seed files (2 creators, 2 supporters, campaigns, posts, transactions)
- [x] `mockApi.js` — localStorage-backed CRUD for all entities + analytics
- [x] `AuthContext` — `loginAs()` / `logout()` / localStorage persistence
- [x] `react-router-dom` v6 routes — public + protected under `/app`
- [x] `AppShell` — collapsible sidebar (240px ↔ 72px), off-canvas mobile drawer, sticky topbar
- [x] `Sidebar` — role-aware nav items, active state, lucide icons, collapse animation
- [x] `Topbar` — page title, notifications bell with dot badge, user dropdown
- [x] Landing page — sticky navbar, 10 sections, SVG illustration, footer
- [x] Login page — dual role cards, loading state, auto-login
- [x] All `/app/*` placeholder pages (styled, ready to fill in)

## What's next (Tasks 5+)

- [ ] Dashboard — KPI cards + Recharts sparklines
- [ ] Campaigns — list + create/edit modal
- [ ] Feed — post composer + card timeline
- [ ] Analytics — full chart dashboard
- [ ] Payouts — balance + request flow
- [ ] Profile — edit form
- [ ] Discover — creator grid + follow/unfollow
- [ ] Following — chronological supporter feed
- [ ] History — pledge ledger table

---

## Notes for the founder bio

In `src/pages/Landing/LandingPage.js`, search for the comment:

```
── PLACEHOLDER — Replace with your real photo/info ──────────────
```

Replace the avatar placeholder with your real photo (`<img>` tag) and fill in
`[Founder Name]` and the bio paragraph with your real details, links, and story.
The pricing `%5` in the pricing section is also a placeholder — update to your
confirmed fee once decided.
