import { useEffect } from 'react';

/* ─── Brand colors (mirrored from index.css for SVG generation) ─── */
const BRAND      = '#748E75'; // sage
const BRAND_2    = '#D9B26A'; // amber
const INK        = '#0B0B0C';

/* Builds a tiny SVG of the 6POINT asterisk in the requested color and
   returns it as a data: URI suitable for <link rel="icon">. We URL-encode
   the SVG (rather than base64) so it stays human-readable in DevTools and
   is the smallest possible payload. */
const faviconHref = (color) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='${color}'>` +
    [0, 60, 120, 180, 240, 300]
      .map(
        (deg) =>
          `<rect x='27.5' y='6' width='9' height='26' rx='4.5' transform='rotate(${deg} 32 32)'/>`
      )
      .join('') +
    `<circle cx='32' cy='32' r='6'/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/* Per-route metadata for top-level views (anything that's not the long
   marketing scroll). Each entry sets the document.title and the favicon
   tint so the browser tab visibly reflects where the user is. */
const VIEW_META = {
  login:        { title: 'Client Login · 6POINT Designs',       color: INK },
  'agent-dash': { title: 'Agent Dashboard · 6POINT Designs',    color: BRAND },
  terms:        { title: 'Terms & Conditions · 6POINT Designs', color: INK },
  privacy:      { title: 'Privacy Policy · 6POINT Designs',     color: INK },
  'service:branding':        { title: 'Branding · 6POINT Designs',        color: INK },
  'service:web-design':      { title: 'Web Design · 6POINT Designs',      color: '#2563EB' },
  'service:growth-strategy': { title: 'Growth Strategy · 6POINT Designs', color: BRAND },
  'service:social-media':    { title: 'Social Media · 6POINT Designs',    color: BRAND_2 },
};

/* Per-section metadata for the home page. Keys match the actual element
   IDs of each major <section> on the marketing page so an
   IntersectionObserver can map directly from the DOM. */
const SECTION_META = {
  top:      { title: '6POINT Designs — Building brands & websites that actually grow.', color: BRAND },
  services: { title: 'Services · 6POINT Designs',                                       color: BRAND_2 },
  work:     { title: 'Our Work · 6POINT Designs',                                       color: BRAND },
  faq:      { title: 'FAQ · 6POINT Designs',                                            color: BRAND_2 },
  contact:  { title: 'Get in touch · 6POINT Designs',                                   color: BRAND },
};

const HOME_DEFAULT = SECTION_META.top;

/* Apply title + favicon together. We mutate the existing <link id="favicon">
   tag so we never end up with stale entries; the SVG data URI swap is
   instant in every modern browser. */
const apply = (meta) => {
  if (!meta) return;
  if (typeof document === 'undefined') return;
  document.title = meta.title;
  const link = document.getElementById('favicon');
  if (link) link.setAttribute('href', faviconHref(meta.color));
};

/* Hook: keeps the document title + favicon in sync with the current view.
   For the home view it additionally observes the major sections and
   updates as the user scrolls past each one (debounced via the observer). */
export const usePageMeta = (view) => {
  useEffect(() => {
    if (view !== 'home') {
      apply(VIEW_META[view] || HOME_DEFAULT);
      return;
    }

    apply(HOME_DEFAULT);

    const ids = Object.keys(SECTION_META);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!els.length) return;

    /* Track which sections are currently intersecting so we can pick the
       top-most visible one as "the page the user is on". This avoids the
       flicker you'd get from naively reacting to every entry. */
    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        const ordered = ids.filter((id) => visible.has(id));
        const current = ordered[0] || 'top';
        apply(SECTION_META[current] || HOME_DEFAULT);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [view]);
};
