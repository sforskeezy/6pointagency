import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

/* Only construct the Convex client if a deployment URL was provided at
   build time. Without this guard, `new ConvexReactClient(undefined)`
   throws synchronously in production environments where the env var
   isn't set (e.g. a fresh Netlify deploy), which prevents React from
   ever mounting and leaves the page blank.
   To enable Convex on the live site, set REACT_APP_CONVEX_URL in your
   Netlify project's Build & Deploy → Environment settings. */
const convexUrl = process.env.REACT_APP_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

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
    {convex ? (
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
