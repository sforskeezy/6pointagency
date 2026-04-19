import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

/* The site now leans on Convex for the contact form, login, and
   admin dashboard, so the provider has to wrap every render. We
   still tolerate a missing URL (we substitute an obviously bogus
   one and log a warning) so the page mounts cleanly on a misconfigured
   deploy — the Convex calls will just fail individually, which the
   forms surface as inline errors instead of a white screen.
   To wire this up on Netlify, set REACT_APP_CONVEX_URL in
   Build & Deploy → Environment. */
const convexUrl =
  process.env.REACT_APP_CONVEX_URL || 'https://missing-convex-url.invalid';
if (!process.env.REACT_APP_CONVEX_URL && typeof console !== 'undefined') {
  // eslint-disable-next-line no-console
  console.warn(
    '[6point] REACT_APP_CONVEX_URL is not set. Convex-backed features ' +
      '(contact form, login, admin dashboard) will not work until the ' +
      'env var is configured at build time.',
  );
}
const convex = new ConvexReactClient(convexUrl);

/* Disable the browser's automatic scroll restoration. This SPA decides
   the scroll position itself (e.g. service pages snap to the top on
   mount) — without this, Chrome/Safari will sometimes restore the
   previous scroll Y across hash navigations, which makes the new page
   land mid-scroll instead of at the top. */
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
