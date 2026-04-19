import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BarChart3, FileText, Inbox, Settings, LogOut,
  ArrowUpRight, ArrowDownRight, Globe, Clock, Activity,
  Users, Eye, MousePointer2, Send, Search, Bell,
  Smartphone, Monitor, TabletSmartphone, ExternalLink, Megaphone, Hammer,
} from 'lucide-react';
import { LogoMark } from './Logo';

/* ──────────────────────────────────────────────────────────────────
   ClientDashboard
   Real-feeling analytics dashboard the client lands on after sign-in.
   Mirrors what we promise on the Web Design "Track" step:
     · traffic, top pages, conversions, form submissions, weekly trends
   No backend yet — we generate believable, deterministic mock data
   keyed off the email captured at login so two clients see two
   different (but consistent across reloads) numbers.
   ────────────────────────────────────────────────────────────────── */

/* Theme tokens — pulled to constants so the inline styles read clean. */
const C = {
  bg:        'var(--bg)',
  bgSoft:    'var(--bg-soft)',
  card:      'var(--bg-elev)',
  ink:       'var(--ink)',
  ink2:      'var(--ink-2)',
  ink3:      'var(--ink-3)',
  ink4:      'var(--ink-4)',
  line:      'var(--line)',
  lineHard:  'var(--line-strong)',
  brand:     'var(--brand)',     // sage
  brand2:    'var(--brand-2)',   // amber
  display:   'var(--font-display)',
};

/* Tiny seedable PRNG so every reload of the same client shows the
   same dashboard. Mulberry32 — good enough for sparkline data. */
const seedFromString = (s) => {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
};

const fmt = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return String(n);
};

const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

const titleCase = (s) =>
  s.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/* Pull a friendly first name out of whatever the user typed at login. */
const greetingFromEmail = (email) => {
  if (!email) return 'there';
  const local = email.split('@')[0] || '';
  const first = local.split(/[._-]/)[0];
  if (!first) return 'there';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
};

/* Domain from email, used as the "project" name in the sidebar. */
const projectFromEmail = (email) => {
  if (!email) return 'Demo Project';
  const dom = (email.split('@')[1] || '').split('.')[0];
  if (!dom) return 'Demo Project';
  return titleCase(dom);
};

/* ───────────────────────── Mock data factory ───────────────────────── */

const buildData = (email) => {
  const rand = seedFromString(email || 'demo@6pointdesigns.com');

  /* 8 weeks of traffic, gently trending up with random noise */
  const weeks = 8;
  const baseStart = 1800 + Math.floor(rand() * 900);
  const traffic = Array.from({ length: weeks }, (_, i) => {
    const trend = baseStart + i * (140 + rand() * 80);
    const wobble = (rand() - 0.5) * 280;
    return Math.max(800, Math.round(trend + wobble));
  });

  /* KPI snapshot — last week vs week before */
  const visitorsThis  = traffic[weeks - 1];
  const visitorsPrev  = traffic[weeks - 2];
  const visitorsDelta = ((visitorsThis - visitorsPrev) / visitorsPrev) * 100;

  const pageViewsThis  = Math.round(visitorsThis * (2.6 + rand() * 0.6));
  const pageViewsPrev  = Math.round(visitorsPrev * (2.5 + rand() * 0.6));
  const pageViewsDelta = ((pageViewsThis - pageViewsPrev) / pageViewsPrev) * 100;

  const conversionsThis  = Math.round(visitorsThis * (0.034 + rand() * 0.018));
  const conversionsPrev  = Math.round(visitorsPrev * (0.030 + rand() * 0.016));
  const conversionsDelta = ((conversionsThis - conversionsPrev) / conversionsPrev) * 100;

  const sessionMin = 1 + rand() * 1.4;       // minutes
  const sessionPrev = sessionMin - (rand() - 0.4) * 0.4;
  const sessionDelta = ((sessionMin - sessionPrev) / sessionPrev) * 100;

  /* Top pages */
  const pagePool = [
    { path: '/',                 label: 'Home' },
    { path: '/services',         label: 'Services' },
    { path: '/work',             label: 'Our Work' },
    { path: '/services/branding',label: 'Branding' },
    { path: '/services/web',     label: 'Web Design' },
    { path: '/contact',          label: 'Contact' },
    { path: '/about',            label: 'About' },
    { path: '/case/mint',        label: 'Mint case study' },
  ];
  const topPages = pagePool.slice(0, 6).map((p) => {
    const v = Math.round(visitorsThis * (0.08 + rand() * 0.32));
    const d = (rand() - 0.35) * 28;
    return { ...p, views: v, delta: d };
  }).sort((a, b) => b.views - a.views);

  /* Traffic sources */
  let s1 = 30 + rand() * 18;
  let s2 = 22 + rand() * 14;
  let s3 = 14 + rand() * 10;
  let s4 = 100 - s1 - s2 - s3;
  if (s4 < 4) s4 = 4;
  const sources = [
    { label: 'Organic search', pct: s1, color: C.brand },
    { label: 'Direct',         pct: s2, color: C.ink },
    { label: 'Social',         pct: s3, color: C.brand2 },
    { label: 'Referral',       pct: s4, color: '#A1A6A1' },
  ];

  /* Devices breakdown */
  const mobilePct  = Math.round(58 + (rand() - 0.5) * 12);
  const desktopPct = Math.round(34 + (rand() - 0.5) * 10);
  const tabletPct  = Math.max(2, 100 - mobilePct - desktopPct);

  /* Recent form submissions */
  const firstNames = ['Avery','Jordan','Sam','Riley','Cameron','Taylor','Morgan','Quinn','Hayden','Parker'];
  const lastNames  = ['Mitchell','Bennett','Carter','Reyes','Patel','Brooks','Holloway','Nguyen','Walsh','Diaz'];
  const sourcesL   = ['Contact form','Project brief','Newsletter','Demo request','Quote'];
  const projectsL  = ['Brand refresh','New website','Growth audit','Social retainer','Logo & identity','E-comm rebuild'];

  const leads = Array.from({ length: 6 }, (_, i) => {
    const first = firstNames[Math.floor(rand() * firstNames.length)];
    const last  = lastNames [Math.floor(rand() * lastNames.length)];
    const minutesAgo = Math.round(8 + i * 47 + rand() * 40);
    return {
      id: `L${i}`,
      name:    `${first} ${last}`,
      email:   `${first.toLowerCase()}.${last.toLowerCase()}@${['gmail.com','outlook.com','studio.co','workmail.io'][i % 4]}`,
      source:  sourcesL[Math.floor(rand() * sourcesL.length)],
      project: projectsL[Math.floor(rand() * projectsL.length)],
      minutesAgo,
    };
  });

  /* Site health */
  const lighthouse = Math.round(91 + rand() * 8);
  const uptime     = (99.84 + rand() * 0.15);
  const ttfb       = Math.round(180 + rand() * 90);

  return {
    traffic,
    kpis: {
      visitors:    { value: visitorsThis,    delta: visitorsDelta },
      pageViews:   { value: pageViewsThis,   delta: pageViewsDelta },
      conversions: { value: conversionsThis, delta: conversionsDelta },
      session:     { value: sessionMin,      delta: sessionDelta },
    },
    topPages,
    sources,
    devices: { mobile: mobilePct, desktop: desktopPct, tablet: tabletPct },
    leads,
    health: { lighthouse, uptime, ttfb },
  };
};

/* ─────────────────────────── UI primitives ─────────────────────────── */

const Card = ({ children, style, ...rest }) => (
  <div
    style={{
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 16,
      boxShadow: 'var(--shadow-sm)',
      padding: 22,
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

const SectionTitle = ({ icon, label, hint }) => (
  <div style={{
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
    marginBottom: 14,
  }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 26, height: 26, borderRadius: 8,
        background: 'rgba(116,142,117,0.12)', color: C.brand,
      }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.02em', color: C.ink }}>
        {label}
      </span>
    </div>
    {hint && (
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: C.ink4 }}>
        {hint}
      </span>
    )}
  </div>
);

const DeltaPill = ({ value, suffix = '%' }) => {
  const positive = value >= 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 999,
      background: positive ? 'rgba(116,142,117,0.10)' : 'rgba(154,48,48,0.08)',
      color:      positive ? '#3F6541'                 : '#9A3030',
      fontSize: 11, fontWeight: 700,
    }}>
      {positive ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}
      {`${positive ? '+' : ''}${value.toFixed(1)}${suffix}`}
    </span>
  );
};

/* ─────────────────────────── Sparkline ─────────────────────────── */

const Sparkline = ({ data, color = C.brand, w = 120, h = 40 }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePath = `M ${pts.join(' L ')}`;
  const areaPath = `${linePath} L ${w},${h} L 0,${h} Z`;
  const id = `spark-${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${id})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─────────────────────── Big traffic chart ─────────────────────── */

const TrafficChart = ({ data }) => {
  const w = 720;
  const h = 220;
  const padX = 28;
  const padY = 22;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const step = innerW / (data.length - 1);

  const pts = data.map((v, i) => {
    const x = padX + i * step;
    const y = padY + innerH - ((v - min) / range) * innerH;
    return [x, y];
  });

  /* Smooth curve: cardinal-like using midpoint Bézier */
  const smooth = (() => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    return d;
  })();
  const smoothArea = `${smooth} L ${pts[pts.length - 1][0]} ${padY + innerH} L ${pts[0][0]} ${padY + innerH} Z`;

  /* Y-axis grid lines (4 bands) */
  const grid = [0, 0.25, 0.5, 0.75, 1].map((t) => padY + innerH * t);

  /* Week labels — relative “8w / 7w / … / now” */
  const labels = data.map((_, i) => {
    const back = data.length - 1 - i;
    if (back === 0) return 'now';
    return `${back}w`;
  });

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${w} ${h + 24}`} preserveAspectRatio="none"
        style={{ width: '100%', height: 260, display: 'block' }}>
        <defs>
          <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={C.brand} stopOpacity="0.28" />
            <stop offset="100%" stopColor={C.brand} stopOpacity="0" />
          </linearGradient>
        </defs>
        {grid.map((y, i) => (
          <line key={i} x1={padX} x2={w - padX} y1={y} y2={y}
            stroke="rgba(11,11,12,0.06)" strokeDasharray="3 5" />
        ))}
        <motion.path
          d={smoothArea}
          fill="url(#trafficFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.path
          d={smooth}
          fill="none"
          stroke={C.brand}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        {pts.map(([x, y], i) => (
          <motion.circle
            key={i} cx={x} cy={y} r={i === pts.length - 1 ? 5 : 3}
            fill={i === pts.length - 1 ? C.brand2 : '#fff'}
            stroke={C.brand} strokeWidth="2"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
          />
        ))}
        {labels.map((lbl, i) => (
          <text key={i}
            x={padX + i * step}
            y={h + 16}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-sans)"
            fontWeight="600"
            fill="rgba(11,11,12,0.42)"
          >
            {lbl}
          </text>
        ))}
      </svg>
    </div>
  );
};

/* ─────────────────────── Site-health gauge ─────────────────────── */

/* Gauge — `score` (0-100) drives both the ring fill and the status
   word. Decoupling that from the displayed `value/suffix` lets us
   reuse this for "lower is better" metrics (TTFB) by mapping their
   raw value into a 0-100 score before passing it in. */
const Gauge = ({ score, value, label, suffix = '' }) => {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / 100));
  const dash = circ * pct;
  const ringColor = score >= 85 ? C.brand : score >= 65 ? C.brand2 : '#9A3030';
  const status    = score >= 85 ? 'Excellent' : score >= 65 ? 'Healthy' : 'Needs attention';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 0', borderTop: `1px solid ${C.line}`,
    }}>
      <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
        <svg width="76" height="76" viewBox="0 0 76 76">
          <circle cx="38" cy="38" r={r}
            fill="none" stroke="rgba(11,11,12,0.08)" strokeWidth="6" />
          <motion.circle
            cx="38" cy="38" r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${circ} ${circ}`}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            transform="rotate(-90 38 38)"
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: C.display, fontSize: 20, fontStyle: 'italic',
          color: C.ink,
        }}>
          {value}{suffix}
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{label}</div>
        <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>{status}</div>
      </div>
    </div>
  );
};

/* ─────────────────────────── Sidebar ─────────────────────────── */

const NavItem = ({ icon, label, active, badge, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      width: '100%', padding: '10px 12px',
      background: active ? C.bgSoft : 'transparent',
      border: 'none', borderRadius: 10,
      color: active ? C.ink : C.ink3,
      fontSize: 13, fontWeight: 600,
      textAlign: 'left', cursor: 'pointer',
      transition: 'background .2s ease, color .2s ease',
    }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(11,11,12,0.03)'; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >
    <span style={{ display: 'inline-flex', color: active ? C.brand : C.ink4 }}>
      {icon}
    </span>
    <span style={{ flex: 1 }}>{label}</span>
    {badge != null && (
      <span style={{
        fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
        padding: '2px 7px', borderRadius: 999,
        background: active ? C.brand : 'rgba(11,11,12,0.08)',
        color: active ? '#fff' : C.ink2,
      }}>{badge}</span>
    )}
  </button>
);

const Sidebar = ({ active, setActive, projectName, leadsCount, onSignOut, isMobile }) => (
  <aside style={{
    width: isMobile ? '100%' : 260,
    flexShrink: 0,
    background: C.card,
    borderRight: isMobile ? 'none' : `1px solid ${C.line}`,
    borderBottom: isMobile ? `1px solid ${C.line}` : 'none',
    padding: isMobile ? '14px 16px' : 18,
    display: 'flex', flexDirection: 'column',
    gap: isMobile ? 12 : 18,
    height: isMobile ? 'auto' : '100vh',
    position: isMobile ? 'static' : 'sticky', top: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px 12px' }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 36, height: 36, borderRadius: 10,
        background: C.ink, color: '#fff',
      }}>
        <LogoMark size={18} color="#fff" />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', color: C.ink }}>
          6POINT
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600, color: C.ink3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {projectName}
        </div>
      </div>
      {/* Sign-out moved into the header on mobile so it stays in reach */}
      {isMobile && (
        <button
          onClick={onSignOut}
          aria-label="Sign out"
          style={{
            marginLeft: 'auto',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: `1px solid ${C.line}`,
            cursor: 'pointer', padding: '6px 10px', borderRadius: 999,
            color: C.ink3, fontSize: 11, fontWeight: 700,
          }}
        >
          <LogOut size={12} /> Sign out
        </button>
      )}
    </div>

    <nav style={{
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      flexWrap: isMobile ? 'nowrap' : 'nowrap',
      overflowX: isMobile ? 'auto' : 'visible',
      gap: isMobile ? 6 : 4,
      paddingBottom: isMobile ? 4 : 0,
    }}>
      <NavItem icon={<LayoutDashboard size={16} />} label="Overview"        active={active === 'overview'}    onClick={() => setActive('overview')} />
      <NavItem icon={<BarChart3       size={16} />} label="Traffic"         active={active === 'traffic'}     onClick={() => setActive('traffic')} />
      <NavItem icon={<Inbox           size={16} />} label="Leads"           active={active === 'leads'}       badge={leadsCount} onClick={() => setActive('leads')} />
      <NavItem icon={<FileText        size={16} />} label="Reports"         active={active === 'reports'}     onClick={() => setActive('reports')} />
      <NavItem icon={<Settings        size={16} />} label="Project"         active={active === 'project'}     onClick={() => setActive('project')} />
    </nav>

    {/* Studio card + sign-out are sidebar-only on desktop. On mobile
        the whole header row collapses to logo + nav + sign-out. */}
    {!isMobile && (
      <>
        <div style={{ flex: 1 }} />
        <div style={{
          background: C.bgSoft, borderRadius: 14, padding: 14,
          border: `1px solid ${C.line}`,
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: C.brand,
          }}>
            <Hammer size={12} /> Studio
          </div>
          <p style={{ margin: '8px 0 12px', fontSize: 13, lineHeight: 1.4, color: C.ink2 }}>
            Need a tweak or a new page? Drop the team a note.
          </p>
          <a
            href="mailto:hello@6pointdesigns.com"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 700, color: C.ink,
              background: '#fff', borderRadius: 999,
              border: `1px solid ${C.line}`,
              padding: '7px 12px', textDecoration: 'none',
            }}
          >
            Message studio <ArrowUpRight size={12} />
          </a>
        </div>
        <button
          onClick={onSignOut}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '6px 4px', color: C.ink3, fontSize: 12, fontWeight: 600,
          }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </>
    )}
  </aside>
);

/* ─────────────────────────── Main view ─────────────────────────── */

export const ClientDashboard = () => {
  const [email] = useState(() => {
    if (typeof window === 'undefined') return 'demo@6pointdesigns.com';
    return window.sessionStorage.getItem('clientEmail') || 'demo@6pointdesigns.com';
  });
  const [active, setActive] = useState('overview');
  const [range, setRange] = useState('30d');
  const [now, setNow] = useState(() => new Date());

  /* Viewport tracker — Framer Motion's inline styles consistently beat
     CSS @media rules in this codebase, so we drive the major layout
     breakpoints from React state instead. We layer three signals
     (resize, orientationchange, matchMedia) because a couple of
     environments (HMR + headless browsers) miss one or another. */
  const [vw, setVw] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => setVw(window.innerWidth);
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    const mqs = [
      window.matchMedia('(max-width: 520px)'),
      window.matchMedia('(max-width: 880px)'),
      window.matchMedia('(max-width: 1100px)'),
    ];
    mqs.forEach((m) => m.addEventListener?.('change', sync));
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
      mqs.forEach((m) => m.removeEventListener?.('change', sync));
    };
  }, []);
  const isMobile  = vw <= 880;
  const isTablet  = vw <= 1100;
  const isPhone   = vw <= 520;

  const data    = useMemo(() => buildData(email),     [email]);
  const greeting = useMemo(() => greetingFromEmail(email), [email]);
  const projectName = useMemo(() => projectFromEmail(email), [email]);

  /* Reset scroll + tick the live clock so the "Last updated" badge
     stays believable while the page is open. */
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const signOut = () => {
    window.sessionStorage.removeItem('clientEmail');
    window.location.hash = '#client-login';
  };

  const goHome = (e) => {
    e?.preventDefault();
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    window.dispatchEvent(new Event('hashchange'));
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const kpiCards = [
    {
      key: 'visitors', label: 'Visitors',
      value: fmt(data.kpis.visitors.value),
      delta: data.kpis.visitors.delta,
      icon: <Users size={16} />, accent: C.brand,
      spark: data.traffic,
    },
    {
      key: 'pageViews', label: 'Page views',
      value: fmt(data.kpis.pageViews.value),
      delta: data.kpis.pageViews.delta,
      icon: <Eye size={16} />, accent: C.ink,
      spark: data.traffic.map((v, i) => v * (2.4 + (i % 3) * 0.2)),
    },
    {
      key: 'conversions', label: 'Conversions',
      value: String(data.kpis.conversions.value),
      delta: data.kpis.conversions.delta,
      icon: <MousePointer2 size={16} />, accent: C.brand2,
      spark: data.traffic.map((v) => v * 0.04),
    },
    {
      key: 'session', label: 'Avg. session',
      value: `${data.kpis.session.value.toFixed(1)}m`,
      delta: data.kpis.session.delta,
      icon: <Clock size={16} />, accent: '#7C5CFF',
      spark: data.traffic.map((v, i) => v * (0.0006 + (i % 2) * 0.00012)),
    },
  ];

  return (
    <div className="client-dash" style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      background: C.bg,
      color: C.ink,
      fontFamily: 'var(--font-sans)',
    }}>
      <Sidebar
        active={active}
        setActive={setActive}
        projectName={projectName}
        leadsCount={data.leads.length}
        onSignOut={signOut}
        isMobile={isMobile}
      />

      <main style={{ flex: 1, minWidth: 0, padding: 'clamp(20px, 3vw, 36px)' }}>
        {/* ── Top bar ── */}
        <header className="dash-topbar" style={{
          display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: 16, marginBottom: 24,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: C.ink3,
            }}>
              <span style={{
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                background: C.brand, boxShadow: `0 0 0 4px rgba(116,142,117,0.18)`,
              }} />
              Client portal
            </div>
            <h1 style={{
              margin: '8px 0 6px',
              fontFamily: C.display, fontWeight: 400,
              fontSize: 'clamp(28px, 3.4vw, 40px)',
              lineHeight: 1.05, letterSpacing: '-0.015em',
            }}>
              Hey {greeting}, here's how <span style={{ fontStyle: 'italic', color: C.brand }}>your site</span> is doing.
            </h1>
            <p style={{ margin: 0, color: C.ink3, fontSize: 14 }}>
              Live data from your project · last updated {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {!isMobile && (
              <div className="dash-search" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', background: C.card,
                border: `1px solid ${C.line}`, borderRadius: 999,
                color: C.ink3, fontSize: 13, minWidth: 220,
              }}>
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search pages, leads…"
                  style={{
                    flex: 1, border: 'none', background: 'transparent',
                    outline: 'none', fontFamily: 'inherit', fontSize: 13,
                    color: C.ink,
                  }}
                />
              </div>
            )}
            <button
              type="button"
              aria-label="Notifications"
              style={{
                width: 40, height: 40, borderRadius: 999,
                background: C.card, border: `1px solid ${C.line}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: C.ink, cursor: 'pointer', position: 'relative',
              }}
            >
              <Bell size={16} />
              <span style={{
                position: 'absolute', top: 8, right: 9,
                width: 7, height: 7, borderRadius: '50%',
                background: C.brand2, border: '2px solid #fff',
              }} />
            </button>
            <a
              href="#top"
              onClick={goHome}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 14px', borderRadius: 999,
                background: C.ink, color: '#fff',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                textTransform: 'uppercase', textDecoration: 'none',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              View site <ExternalLink size={12} />
            </a>
          </div>
        </header>

        {/* ── KPI row ── */}
        <div className="kpi-grid" style={{
          display: 'grid',
          gridTemplateColumns: isPhone
            ? 'repeat(2, minmax(0, 1fr))'
            : isMobile
              ? 'repeat(2, minmax(0, 1fr))'
              : 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16, marginBottom: 18,
        }}>
          {kpiCards.map((k, i) => (
            <motion.div
              key={k.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 10,
                    background: 'rgba(11,11,12,0.04)', color: k.accent,
                  }}>{k.icon}</span>
                  <DeltaPill value={k.delta} />
                </div>
                <div style={{
                  marginTop: 14,
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: C.ink3,
                }}>
                  {k.label}
                </div>
                <div style={{
                  marginTop: 4,
                  fontFamily: C.display,
                  fontSize: 38, lineHeight: 1.05, letterSpacing: '-0.01em',
                  color: C.ink,
                }}>
                  {k.value}
                </div>
                <div style={{ marginTop: 10 }}>
                  <Sparkline data={k.spark} color={k.accent} w={160} h={36} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── Main grid: chart (wide) + sources (narrow) ── */}
        <div className="dash-row dash-row-2-1" style={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '2fr 1fr',
          gap: 16, marginBottom: 18,
        }}>
          <Card>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 12, marginBottom: 14,
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 26, height: 26, borderRadius: 8,
                  background: 'rgba(116,142,117,0.12)', color: C.brand,
                }}><Activity size={14} /></span>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.02em', color: C.ink }}>
                  Weekly traffic
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: C.ink4, marginLeft: 4,
                }}>
                  last 8 weeks
                </span>
              </div>
              <div style={{ display: 'inline-flex', gap: 6, flexShrink: 0 }}>
                {['7d', '30d', '90d'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    style={{
                      padding: '6px 10px', borderRadius: 999,
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                      textTransform: 'uppercase', cursor: 'pointer',
                      background: range === r ? C.ink : 'transparent',
                      color:      range === r ? '#fff'  : C.ink3,
                      border:     `1px solid ${range === r ? C.ink : C.line}`,
                    }}
                  >{r}</button>
                ))}
              </div>
            </div>
            <TrafficChart data={data.traffic} />
          </Card>

          <Card>
            <SectionTitle
              icon={<Globe size={14} />}
              label="Traffic sources"
              hint="this month"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 6 }}>
              {data.sources.map((s, i) => (
                <div key={s.label}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline', marginBottom: 6,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.ink2 }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, fontFamily: C.display }}>
                      {s.pct.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{
                    height: 8, borderRadius: 999, background: 'rgba(11,11,12,0.06)',
                    overflow: 'hidden', position: 'relative',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        height: '100%',
                        background: s.color,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Devices */}
            <div style={{ marginTop: 22 }}>
              <SectionTitle icon={<Smartphone size={14} />} label="Devices" />
              <div style={{ display: 'flex', gap: 8 }}>
                <DeviceTile icon={<Smartphone size={14} />} label="Mobile"  pct={data.devices.mobile}  />
                <DeviceTile icon={<Monitor    size={14} />} label="Desktop" pct={data.devices.desktop} />
                <DeviceTile icon={<TabletSmartphone size={14} />} label="Tablet" pct={data.devices.tablet} />
              </div>
            </div>
          </Card>
        </div>

        {/* ── Top pages + recent leads ── */}
        <div className="dash-row dash-row-3-2" style={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '3fr 2fr',
          gap: 16, marginBottom: 18,
        }}>
          <Card style={{ padding: 0 }}>
            <div style={{ padding: '22px 22px 0' }}>
              <SectionTitle
                icon={<FileText size={14} />}
                label="Top pages"
                hint={`${data.topPages.length} of ${data.topPages.length}`}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.topPages.map((p, i) => {
                const max = data.topPages[0].views;
                const pct = (p.views / max) * 100;
                return (
                  <div key={p.path}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isPhone
                        ? '1fr 70px 70px'
                        : '1.4fr 1fr 100px 90px',
                      gap: 12, alignItems: 'center',
                      padding: '14px 22px',
                      borderTop: i === 0 ? `1px solid ${C.line}` : 'none',
                      borderBottom: `1px solid ${C.line}`,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize: 11, color: C.ink4, marginTop: 2,
                        fontFamily: 'ui-monospace, "SFMono-Regular", monospace' }}>
                        {p.path}
                      </div>
                    </div>
                    {!isPhone && (
                      <div style={{
                        height: 6, borderRadius: 999,
                        background: 'rgba(11,11,12,0.06)', overflow: 'hidden',
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                          style={{
                            height: '100%', background: C.brand, borderRadius: 999,
                          }}
                        />
                      </div>
                    )}
                    <div style={{
                      fontFamily: C.display,
                      fontSize: 18, fontStyle: 'italic',
                      color: C.ink, textAlign: 'right',
                    }}>
                      {fmt(p.views)}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <DeltaPill value={p.delta} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card style={{ padding: 0 }}>
            <div style={{ padding: '22px 22px 0' }}>
              <SectionTitle
                icon={<Inbox size={14} />}
                label="Recent leads"
                hint="form submissions"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.leads.map((l, i) => (
                <div key={l.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 22px',
                    borderTop: i === 0 ? `1px solid ${C.line}` : 'none',
                    borderBottom: `1px solid ${C.line}`,
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 999,
                    background: 'rgba(116,142,117,0.16)', color: C.brand,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800,
                    fontFamily: C.display, fontStyle: 'italic',
                  }}>
                    {l.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.ink,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.name}
                    </div>
                    <div style={{ fontSize: 11, color: C.ink3, marginTop: 2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.project} · {l.source}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.ink4, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {l.minutesAgo < 60
                      ? `${l.minutesAgo}m ago`
                      : `${Math.round(l.minutesAgo / 60)}h ago`}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 22px' }}>
              <button style={{
                width: '100%', padding: '10px 12px',
                background: 'transparent', border: `1px solid ${C.line}`,
                borderRadius: 10, color: C.ink2,
                fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                textTransform: 'uppercase', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Send size={12} /> Export to CSV
              </button>
            </div>
          </Card>
        </div>

        {/* ── Site health + studio updates ── */}
        <div className="dash-row dash-row-1-1" style={{
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr',
          gap: 16, marginBottom: 32,
        }}>
          <Card>
            <SectionTitle
              icon={<Activity size={14} />}
              label="Site health"
              hint="last 24h"
            />
            <Gauge
              score={data.health.lighthouse}
              value={data.health.lighthouse}
              label="Lighthouse score"
            />
            <Gauge
              score={Math.round((data.health.uptime - 99) * 100)}
              value={data.health.uptime.toFixed(2)}
              suffix="%"
              label="Uptime"
            />
            <Gauge
              /* lower is better — sub-200ms is excellent, ≥600ms is bad */
              score={Math.max(0, Math.min(100, Math.round(((600 - data.health.ttfb) / 400) * 100)))}
              value={data.health.ttfb}
              suffix="ms"
              label="Time to first byte"
            />
          </Card>

          <Card>
            <SectionTitle
              icon={<Megaphone size={14} />}
              label="From the studio"
              hint="this week"
            />
            <ul style={{
              listStyle: 'none', margin: 0, padding: 0,
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <StudioUpdate
                eyebrow="Shipped"
                color={C.brand}
                title="New case study layout pushed to /work"
                copy="Cleaner image grid, stronger metrics block. Live now."
                ago="2 days ago"
              />
              <StudioUpdate
                eyebrow="Optimised"
                color={C.brand2}
                title="Hero image weight reduced by 38%"
                copy="Should bump LCP another ~120ms on mobile."
                ago="4 days ago"
              />
              <StudioUpdate
                eyebrow="Scheduled"
                color={C.ink}
                title="Quarterly performance review"
                copy="We'll walk the data live with you on Apr 28."
                ago="next week"
              />
            </ul>
          </Card>
        </div>

        {/* Footer note */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 12, color: C.ink4, padding: '12px 0 24px',
        }}>
          <span>© {new Date().getFullYear()} 6POINT Designs. Numbers refresh hourly.</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              background: C.brand,
            }} />
            All systems normal
          </span>
        </div>
      </main>

      {/* Tiny scoped overrides — placeholder colour + native scrollbar
          tweaks for the mobile horizontal nav. Layout itself is driven
          from React state above so nothing relies on @media winning the
          inline-style cascade. */}
      <style>{`
        .client-dash input::placeholder { color: var(--ink-4); }
        .client-dash aside > nav::-webkit-scrollbar { display: none; }
        .client-dash aside > nav { scrollbar-width: none; }
      `}</style>
    </div>
  );
};

/* ─────────────────────── Subcomponents ─────────────────────── */

const DeviceTile = ({ icon, label, pct }) => (
  <div style={{
    flex: 1, padding: '12px 10px',
    background: 'rgba(11,11,12,0.03)',
    border: `1px solid ${C.line}`,
    borderRadius: 12,
  }}>
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 700, color: C.ink3,
      letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>
      {icon} {label}
    </div>
    <div style={{
      marginTop: 6,
      fontFamily: C.display, fontSize: 22, lineHeight: 1, color: C.ink,
    }}>
      {pct}%
    </div>
  </div>
);

const StudioUpdate = ({ eyebrow, color, title, copy, ago }) => (
  <li style={{
    display: 'grid', gridTemplateColumns: '8px 1fr',
    gap: 14, alignItems: 'flex-start',
  }}>
    <span style={{
      width: 8, height: 8, borderRadius: '50%', background: color,
      marginTop: 6,
      boxShadow: `0 0 0 4px ${color}1F`,
    }} />
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 10,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color,
        }}>{eyebrow}</span>
        <span style={{ fontSize: 11, color: C.ink4, fontWeight: 600 }}>{ago}</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: C.ink, lineHeight: 1.35 }}>
        {title}
      </div>
      <div style={{ marginTop: 4, fontSize: 13, color: C.ink3, lineHeight: 1.45 }}>
        {copy}
      </div>
    </div>
  </li>
);
