import React from 'react';
import ReactDOM from 'react-dom/client';

// ── Theme: Bootstrap variable overrides (compiled by sass) ────────────────
import './theme/theme.scss';

// ── Theme: CSS custom properties + all component styles ───────────────────
import './theme/theme.css';

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
