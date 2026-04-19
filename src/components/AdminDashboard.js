import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import {
  Inbox, Users, ShieldCheck, LogOut, Mail, Building2, Phone,
  Search, Filter, Trash2, ExternalLink, ChevronRight, Plus,
  Check, X, Clock4, Archive, MailCheck, CircleAlert, Copy,
  AtSign, KeyRound, BadgeCheck, UserPlus, Globe, MessageSquare,
} from 'lucide-react';
import { api } from '../convex/_generated/api';
import { LogoMark } from './Logo';

/* ──────────────────────────────────────────────────────────────────
   AdminDashboard
   The studio-side view at #admin-dash. Shows every submission that
   came through the homepage contact form, lets the admin update
   status / archive / delete, and provides a "create user" form so
   the team can mint new client logins without touching the database.

   All data is live Convex — no mocks, no seed data. Every action is
   gated server-side by the `requireAdmin` helper that validates the
   session token, so there's no client-side trust involved.
   ──────────────────────────────────────────────────────────────── */

const C = {
  bg:        'var(--bg)',
  bgSoft:    'var(--bg-soft)',
  card:      'var(--bg-elev)',
  ink:       'var(--ink)',
  ink2:      'var(--ink-2)',
  ink3:      'var(--ink-3)',
  ink4:      'var(--ink-4)',
  line:      'var(--line)',
  brand:     'var(--brand)',
  brand2:    'var(--brand-2)',
  display:   'var(--font-display)',
};

const STATUSES = [
  { key: 'new',       label: 'New',        color: '#2563EB', icon: <Inbox size={12} /> },
  { key: 'in_review', label: 'In review',  color: '#A35E1F', icon: <Clock4 size={12} /> },
  { key: 'replied',   label: 'Replied',    color: '#3F6541', icon: <MailCheck size={12} /> },
  { key: 'archived',  label: 'Archived',   color: '#7B7E7C', icon: <Archive size={12} /> },
];
const STATUS_BY_KEY = Object.fromEntries(STATUSES.map((s) => [s.key, s]));

const fmtDateTime = (ms) => {
  const d = new Date(ms);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
};

const fmtAgo = (ms) => {
  const diff = Date.now() - ms;
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const initialsOf = (name) =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/* ─────────────────────────── Small primitives ─────────────────────────── */

const Card = ({ children, style, ...rest }) => (
  <div
    style={{
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 16,
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

const SectionTitle = ({ icon, label, hint, right }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14, gap: 10, flexWrap: 'wrap',
  }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 8,
        background: 'rgba(116,142,117,0.12)', color: C.brand,
      }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.02em', color: C.ink }}>
        {label}
      </span>
      {hint && (
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: C.ink4 }}>
          {hint}
        </span>
      )}
    </div>
    {right}
  </div>
);

const StatusChip = ({ status }) => {
  const s = STATUS_BY_KEY[status] || STATUS_BY_KEY.new;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      background: `${s.color}14`,
      color: s.color,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {s.icon}
      {s.label}
    </span>
  );
};

const RolePill = ({ role }) => {
  const isAdmin = role === 'admin';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      background: isAdmin ? 'rgba(217,178,106,0.16)' : 'rgba(116,142,117,0.16)',
      color: isAdmin ? '#A35E1F' : '#3F6541',
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {isAdmin ? <ShieldCheck size={11} /> : <BadgeCheck size={11} />} {role}
    </span>
  );
};

/* ─────────────────────────── Sidebar ─────────────────────────── */

const NavItem = ({ icon, label, active, badge, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
      padding: '10px 12px',
      background: active ? C.bgSoft : 'transparent',
      border: 'none', borderRadius: 10,
      color: active ? C.ink : C.ink3,
      fontSize: 13, fontWeight: 600, textAlign: 'left', cursor: 'pointer',
      transition: 'background .2s ease, color .2s ease',
    }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(11,11,12,0.03)'; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >
    <span style={{ display: 'inline-flex', color: active ? C.brand : C.ink4 }}>{icon}</span>
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

const Sidebar = ({ active, setActive, counts, onSignOut, isMobile, adminEmail }) => (
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
          6POINT · ADMIN
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600, color: C.ink3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {adminEmail || 'studio'}
        </div>
      </div>
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
      overflowX: isMobile ? 'auto' : 'visible',
      gap: isMobile ? 6 : 4,
      paddingBottom: isMobile ? 4 : 0,
    }}>
      <NavItem icon={<Inbox size={16} />} label="Submissions" badge={counts?.new || undefined}
        active={active === 'submissions'} onClick={() => setActive('submissions')} />
      <NavItem icon={<Users size={16} />} label="Users"
        active={active === 'users'} onClick={() => setActive('users')} />
      <NavItem icon={<ShieldCheck size={16} />} label="Account"
        active={active === 'account'} onClick={() => setActive('account')} />
    </nav>

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
            <Globe size={12} /> Live data
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.4, color: C.ink2 }}>
            Submissions stream straight from Convex. New ones appear here within a second of being sent.
          </p>
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

/* ─────────────────────────── Submissions list ─────────────────────────── */

const SubmissionsView = ({ submissions, counts, token, isMobile }) => {
  const setStatus = useMutation(api.submissions.setStatus);
  const remove    = useMutation(api.submissions.remove);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (submissions || []).filter((s) => {
      if (filter !== 'all' && s.status !== filter) return false;
      if (!q) return true;
      const hay = [s.name, s.email, s.company, s.message, ...(s.services || [])]
        .join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [submissions, query, filter]);

  const open = filtered.find((s) => s._id === openId) || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
        gap: 12,
      }}>
        <KpiTile label="Total" value={counts?.total ?? '—'} accent={C.ink} icon={<Inbox size={14} />} />
        <KpiTile label="New" value={counts?.new ?? '—'} accent="#2563EB" icon={<CircleAlert size={14} />} />
        <KpiTile label="Last 24h" value={counts?.today ?? '—'} accent={C.brand}  icon={<Clock4 size={14} />} />
        <KpiTile label="Last 7d"  value={counts?.week  ?? '—'} accent={C.brand2} icon={<MessageSquare size={14} />} />
      </div>

      <Card style={{ padding: 0 }}>
        {/* Search + filter bar */}
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
          padding: 18, borderBottom: `1px solid ${C.line}`,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', background: C.bg,
            border: `1px solid ${C.line}`, borderRadius: 999,
            color: C.ink3, fontSize: 13, flex: 1, minWidth: 220,
          }}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by name, email, company, message…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1, border: 'none', background: 'transparent',
                outline: 'none', fontFamily: 'inherit', fontSize: 13, color: C.ink,
              }}
            />
          </div>
          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 700, color: C.ink3,
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              <Filter size={12} /> Filter
            </span>
            {[{ key: 'all', label: 'All' }, ...STATUSES].map((opt) => {
              const active = filter === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setFilter(opt.key)}
                  style={{
                    padding: '6px 11px', borderRadius: 999, cursor: 'pointer',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                    background: active ? C.ink : 'transparent',
                    color: active ? '#fff' : C.ink3,
                    border: `1px solid ${active ? C.ink : C.line}`,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        {submissions === undefined ? (
          <EmptyState label="Loading submissions…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            label={
              query || filter !== 'all'
                ? 'No submissions match those filters.'
                : 'No submissions yet — when someone fills the contact form, it lands here.'
            }
          />
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {filtered.map((s, i) => (
              <li key={s._id}
                onClick={() => setOpenId(s._id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '40px 1fr auto' : '40px 1.5fr 1.5fr 1fr 100px 28px',
                  gap: 12, alignItems: 'center', cursor: 'pointer',
                  padding: '14px 18px',
                  borderBottom: i === filtered.length - 1 ? 'none' : `1px solid ${C.line}`,
                  transition: 'background .15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(11,11,12,0.025)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: 'rgba(116,142,117,0.16)', color: C.brand,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                  fontFamily: C.display, fontStyle: 'italic',
                }}>
                  {initialsOf(s.name)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.ink,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 12, color: C.ink3, marginTop: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.company || '—'} · {s.email}
                  </div>
                </div>
                {!isMobile && (
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: C.ink2,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {s.message}
                    </div>
                    <div style={{ fontSize: 11, color: C.ink4, marginTop: 4 }}>
                      {(s.services || []).slice(0, 3).join(' · ') || '—'}
                    </div>
                  </div>
                )}
                {!isMobile && (
                  <div><StatusChip status={s.status} /></div>
                )}
                {!isMobile && (
                  <div style={{ fontSize: 12, color: C.ink4, fontWeight: 600, textAlign: 'right' }}>
                    {fmtAgo(s._creationTime)}
                  </div>
                )}
                <ChevronRight size={16} color={C.ink4} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AnimatePresence>
        {open && (
          <SubmissionDrawer
            submission={open}
            onClose={() => setOpenId(null)}
            onStatus={(status) => setStatus({ token, id: open._id, status })}
            onDelete={async () => {
              await remove({ token, id: open._id });
              setOpenId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const KpiTile = ({ label, value, accent, icon }) => (
  <Card style={{ padding: 16 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 8,
        background: 'rgba(11,11,12,0.04)', color: accent,
      }}>{icon}</span>
    </div>
    <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
      textTransform: 'uppercase', color: C.ink3 }}>
      {label}
    </div>
    <div style={{ marginTop: 4, fontFamily: C.display, fontSize: 32, lineHeight: 1.05,
      letterSpacing: '-0.01em', color: C.ink }}>
      {value}
    </div>
  </Card>
);

const EmptyState = ({ label }) => (
  <div style={{
    padding: '48px 22px', textAlign: 'center', color: C.ink3, fontSize: 14,
  }}>
    {label}
  </div>
);

/* ─────────────────────────── Submission detail drawer ─────────────────────────── */

const SubmissionDrawer = ({ submission, onClose, onStatus, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const copy = (t) => {
    try {
      navigator.clipboard.writeText(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { /* noop */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgba(11,11,12,0.32)', backdropFilter: 'blur(2px)',
        display: 'flex', justifyContent: 'flex-end',
      }}
    >
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(540px, 100%)', height: '100%',
          background: C.card, borderLeft: `1px solid ${C.line}`,
          display: 'flex', flexDirection: 'column',
        }}
      >
        <header style={{
          padding: '18px 22px', borderBottom: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 999,
              background: 'rgba(116,142,117,0.16)', color: C.brand,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800,
              fontFamily: C.display, fontStyle: 'italic',
            }}>
              {initialsOf(submission.name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.ink,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {submission.name}
              </div>
              <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>
                Submitted {fmtDateTime(submission._creationTime)}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            aria-label="Close"
            style={{
              width: 34, height: 34, borderRadius: 999,
              background: 'transparent', border: `1px solid ${C.line}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: C.ink2, cursor: 'pointer',
            }}>
            <X size={16} />
          </button>
        </header>

        <div style={{ padding: 22, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <StatusChip status={submission.status} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              padding: '3px 9px', borderRadius: 999, background: 'rgba(11,11,12,0.05)', color: C.ink3 }}>
              {submission.intent || 'inquiry'}
            </span>
            {submission.source && (
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                padding: '3px 9px', borderRadius: 999, background: 'rgba(11,11,12,0.05)', color: C.ink3 }}>
                via {submission.source}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <DetailRow icon={<Mail size={14} />} label="Email" value={submission.email}
              action={
                <button onClick={() => copy(submission.email)}
                  style={iconBtnStyle} title="Copy">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              } />
            {submission.phone && (
              <DetailRow icon={<Phone size={14} />} label="Phone" value={submission.phone} />
            )}
            <DetailRow icon={<Building2 size={14} />} label="Company" value={submission.company || '—'} />
            <DetailRow icon={<Clock4 size={14} />} label="Budget" value={submission.budget || '—'} />
          </div>

          {(submission.services || []).length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: C.ink3, marginBottom: 8 }}>
                Services of interest
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {submission.services.map((svc) => (
                  <span key={svc} style={{
                    fontSize: 12, fontWeight: 600,
                    padding: '5px 10px', borderRadius: 999,
                    background: C.bgSoft, color: C.ink,
                    border: `1px solid ${C.line}`,
                  }}>
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: C.ink3, marginBottom: 8 }}>
              Message
            </div>
            <div style={{
              padding: 14, borderRadius: 12, background: C.bg,
              border: `1px solid ${C.line}`,
              fontSize: 14, color: C.ink2, lineHeight: 1.55, whiteSpace: 'pre-wrap',
            }}>
              {submission.message}
            </div>
          </div>

          {submission.referrer || submission.userAgent ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: C.ink3, marginBottom: 8 }}>
                Context
              </div>
              <div style={{ fontSize: 12, color: C.ink3, lineHeight: 1.55 }}>
                {submission.referrer && (<div><strong style={{ color: C.ink2 }}>Referrer:</strong> {submission.referrer}</div>)}
                {submission.userAgent && (<div><strong style={{ color: C.ink2 }}>User agent:</strong> {submission.userAgent}</div>)}
              </div>
            </div>
          ) : null}

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: C.ink3, marginBottom: 8 }}>
              Update status
            </div>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6 }}>
              {STATUSES.map((s) => {
                const active = submission.status === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => onStatus(s.key)}
                    style={{
                      padding: '6px 11px', borderRadius: 999, cursor: 'pointer',
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                      background: active ? s.color : 'transparent',
                      color: active ? '#fff' : s.color,
                      border: `1px solid ${active ? s.color : s.color + '55'}`,
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    {s.icon}{s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <footer style={{
          padding: 16, borderTop: `1px solid ${C.line}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
        }}>
          <button onClick={onDelete}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 700, color: '#9A3030',
              padding: '8px 12px', borderRadius: 999,
              background: 'transparent', border: `1px solid rgba(154,48,48,0.25)`,
              cursor: 'pointer',
            }}>
            <Trash2 size={12} /> Delete
          </button>
          <a href={`mailto:${submission.email}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 14px', borderRadius: 999,
              background: C.ink, color: '#fff',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}>
            Reply via email <ExternalLink size={12} />
          </a>
        </footer>
      </motion.div>
    </motion.div>
  );
};

const iconBtnStyle = {
  width: 26, height: 26, borderRadius: 999,
  background: 'transparent', border: `1px solid ${C.line}`,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  color: C.ink3, cursor: 'pointer',
};

const DetailRow = ({ icon, label, value, action }) => (
  <div style={{
    padding: 12, borderRadius: 12, background: C.bg, border: `1px solid ${C.line}`,
    display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0,
  }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 700, color: C.ink3, letterSpacing: '0.04em',
      textTransform: 'uppercase' }}>
      {icon} {label}
    </span>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 13, color: C.ink, fontWeight: 600,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </span>
      {action}
    </div>
  </div>
);

/* ─────────────────────────── Users view ─────────────────────────── */

const UsersView = ({ users, token, currentUserId, isMobile }) => {
  const createUser = useMutation(api.users.createUser);
  const deleteUser = useMutation(api.users.deleteUser);

  const [form, setForm] = useState({
    email: '', password: '', name: '', company: '', role: 'client',
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { kind: 'ok' | 'err', text }

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await createUser({
        token,
        email: form.email,
        password: form.password,
        name: form.name || undefined,
        company: form.company || undefined,
        role: form.role,
      });
      setMsg({ kind: 'ok', text: `Created ${form.email}.` });
      setForm({ email: '', password: '', name: '', company: '', role: 'client' });
    } catch (err) {
      setMsg({ kind: 'err', text: err?.message || 'Could not create user.' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id, email) => {
    if (!window.confirm(`Delete ${email}? They'll lose access immediately.`)) return;
    try {
      await deleteUser({ token, userId: id });
    } catch (err) {
      alert(err?.message || 'Could not delete that user.');
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr',
      gap: 16,
    }}>
      <Card style={{ padding: 0 }}>
        <div style={{ padding: 18, borderBottom: `1px solid ${C.line}` }}>
          <SectionTitle
            icon={<Users size={14} />}
            label="All users"
            hint={`${users?.length ?? '—'} total`}
          />
        </div>
        {users === undefined ? (
          <EmptyState label="Loading users…" />
        ) : users.length === 0 ? (
          <EmptyState label="No users yet." />
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {users.map((u, i) => (
              <li key={u._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '40px 1fr auto' : '40px 1fr 100px 80px 28px',
                  gap: 12, alignItems: 'center',
                  padding: '14px 18px',
                  borderBottom: i === users.length - 1 ? 'none' : `1px solid ${C.line}`,
                }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: 'rgba(11,11,12,0.06)', color: C.ink2,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                  fontFamily: C.display, fontStyle: 'italic',
                }}>
                  {initialsOf(u.name || u.email)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.ink,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.name || u.email}
                  </div>
                  <div style={{ fontSize: 12, color: C.ink3, marginTop: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.email}{u.company ? ` · ${u.company}` : ''}
                  </div>
                </div>
                {!isMobile && <RolePill role={u.role} />}
                {!isMobile && (
                  <div style={{ fontSize: 11, color: C.ink4, fontWeight: 600, textAlign: 'right' }}>
                    {u.lastLoginAt ? fmtAgo(u.lastLoginAt) : 'never'}
                  </div>
                )}
                {u._id === currentUserId ? (
                  <span style={{ fontSize: 10, fontWeight: 800, color: C.brand,
                    letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    you
                  </span>
                ) : (
                  <button onClick={() => remove(u._id, u.email)}
                    aria-label={`Delete ${u.email}`}
                    style={{
                      width: 28, height: 28, borderRadius: 999,
                      background: 'transparent', border: `1px solid ${C.line}`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      color: '#9A3030', cursor: 'pointer',
                    }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card style={{ padding: 22 }}>
        <SectionTitle icon={<UserPlus size={14} />} label="Create user" hint="admin only" />
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field icon={<AtSign size={14} />} label="Email">
            <input type="email" required value={form.email} onChange={update('email')}
              placeholder="client@studio.com" style={inputStyle} />
          </Field>
          <Field icon={<KeyRound size={14} />} label="Temporary password">
            <input type="text" required minLength={6} value={form.password} onChange={update('password')}
              placeholder="At least 6 characters" style={inputStyle} />
          </Field>
          <Field icon={<Users size={14} />} label="Display name (optional)">
            <input type="text" value={form.name} onChange={update('name')}
              placeholder="Avery Mitchell" style={inputStyle} />
          </Field>
          <Field icon={<Building2 size={14} />} label="Company (optional)">
            <input type="text" value={form.company} onChange={update('company')}
              placeholder="Mint Co." style={inputStyle} />
          </Field>
          <Field icon={<ShieldCheck size={14} />} label="Role">
            <div style={{ display: 'inline-flex', gap: 6 }}>
              {[
                { key: 'client', label: 'Client' },
                { key: 'admin',  label: 'Admin'  },
              ].map((r) => {
                const active = form.role === r.key;
                return (
                  <button key={r.key} type="button" onClick={() => setForm((f) => ({ ...f, role: r.key }))}
                    style={{
                      padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                      background: active ? C.ink : 'transparent',
                      color: active ? '#fff' : C.ink3,
                      border: `1px solid ${active ? C.ink : C.line}`,
                    }}>
                    {r.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <button type="submit" disabled={busy}
            style={{
              marginTop: 4, padding: '11px 14px', borderRadius: 999,
              background: C.ink, color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: busy ? 0.6 : 1,
            }}>
            <Plus size={14} /> {busy ? 'Creating…' : 'Create user'}
          </button>

          {msg && (
            <div style={{
              fontSize: 12, fontWeight: 600,
              padding: '8px 10px', borderRadius: 8,
              background: msg.kind === 'ok' ? 'rgba(63,101,65,0.1)' : 'rgba(154,48,48,0.08)',
              color: msg.kind === 'ok' ? '#3F6541' : '#9A3030',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {msg.kind === 'ok' ? <Check size={12} /> : <CircleAlert size={12} />}
              {msg.text}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};

const Field = ({ icon, label, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
      textTransform: 'uppercase', color: C.ink3,
    }}>
      {icon} {label}
    </span>
    {children}
  </label>
);

const inputStyle = {
  padding: '10px 12px', borderRadius: 10,
  border: `1px solid ${C.line}`, background: C.bg, color: C.ink,
  fontSize: 14, fontFamily: 'inherit', outline: 'none',
};

/* ─────────────────────────── Account view ─────────────────────────── */

const AccountView = ({ me, onSignOut }) => (
  <Card style={{ padding: 22, maxWidth: 540 }}>
    <SectionTitle icon={<ShieldCheck size={14} />} label="Signed-in admin" />
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 999,
        background: 'rgba(116,142,117,0.16)', color: C.brand,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 800, fontFamily: C.display, fontStyle: 'italic',
      }}>
        {initialsOf(me?.name || me?.email)}
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>
          {me?.name || me?.email}
        </div>
        <div style={{ fontSize: 13, color: C.ink3 }}>{me?.email}</div>
        <div style={{ marginTop: 6 }}><RolePill role={me?.role || 'admin'} /></div>
      </div>
    </div>
    <div style={{ marginTop: 18, fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>
      You're signed in to the studio admin. Sessions stay valid for 7 days.
      To rotate the bootstrap admin password, open the Convex dashboard and
      run <code>users:_resetAdminPassword</code> with the new value.
    </div>
    <div style={{ marginTop: 18 }}>
      <button onClick={onSignOut}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '9px 14px', borderRadius: 999,
          background: 'transparent', border: `1px solid ${C.line}`,
          color: C.ink2, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
          textTransform: 'uppercase', cursor: 'pointer',
        }}>
        <LogOut size={12} /> Sign out
      </button>
    </div>
  </Card>
);

/* ─────────────────────────── Main view ─────────────────────────── */

export const AdminDashboard = () => {
  const [token] = useState(() =>
    typeof window === 'undefined' ? null : window.localStorage.getItem('sessionToken'),
  );
  const [active, setActive] = useState('submissions');

  /* All hooks must run unconditionally so React's hook ordering stays
     stable. We call the queries with the token (or skip them if no
     token is present) and then branch on the results below. */
  const me = useQuery(api.users.me, token ? { token } : 'skip');
  const submissions = useQuery(
    api.submissions.listAll,
    token ? { token } : 'skip',
  );
  const counts = useQuery(
    api.submissions.getCounts,
    token ? { token } : 'skip',
  );
  const users = useQuery(api.users.listUsers, token ? { token } : 'skip');

  /* Viewport tracker — same pattern as ClientDashboard. CSS @media
     keeps losing the cascade fight against Framer Motion's inline
     styles, so layout breakpoints come from JS state instead. */
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => setVw(window.innerWidth);
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
    };
  }, []);
  const isMobile = vw <= 880;

  const logoutMutation = useMutation(api.users.logout);
  const signOut = async () => {
    try { if (token) await logoutMutation({ token }); } catch { /* noop */ }
    try {
      window.localStorage.removeItem('sessionToken');
      window.localStorage.removeItem('clientEmail');
      window.localStorage.removeItem('clientRole');
      window.sessionStorage.removeItem('clientEmail');
    } catch { /* noop */ }
    window.location.hash = '#client-login';
  };

  /* Auth gate. We render a small landing screen instead of redirecting
     so the user sees a clear message rather than a flash of the dash
     before the redirect happens. */
  useEffect(() => {
    if (!token) {
      window.location.hash = '#client-login';
      return;
    }
    if (me === null) {
      // Token resolved but session is invalid (expired / unknown).
      try {
        window.localStorage.removeItem('sessionToken');
      } catch { /* noop */ }
      window.location.hash = '#client-login';
    }
  }, [token, me]);

  if (!token || me === null) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.bg, color: C.ink3, fontFamily: 'var(--font-sans)', fontSize: 14,
      }}>
        Redirecting to sign in…
      </div>
    );
  }
  if (me === undefined) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.bg, color: C.ink3, fontFamily: 'var(--font-sans)', fontSize: 14,
      }}>
        Loading admin workspace…
      </div>
    );
  }
  if (me.role !== 'admin') {
    /* A signed-in client somehow hit /#admin-dash — bounce them to
       their own dashboard rather than refusing to render. */
    if (typeof window !== 'undefined') window.location.hash = '#client-dash';
    return null;
  }

  return (
    <div style={{
      display: 'flex', flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh', background: C.bg, color: C.ink,
      fontFamily: 'var(--font-sans)',
    }}>
      <Sidebar
        active={active}
        setActive={setActive}
        counts={counts}
        onSignOut={signOut}
        isMobile={isMobile}
        adminEmail={me.email}
      />

      <main style={{ flex: 1, minWidth: 0, padding: 'clamp(20px, 3vw, 36px)' }}>
        <header style={{
          display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between', flexWrap: 'wrap',
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
              Studio admin
            </div>
            <h1 style={{
              margin: '8px 0 6px',
              fontFamily: C.display, fontWeight: 400,
              fontSize: 'clamp(28px, 3.4vw, 40px)',
              lineHeight: 1.05, letterSpacing: '-0.015em',
            }}>
              {active === 'submissions' && (<>Inbox <span style={{ fontStyle: 'italic', color: C.brand }}>everything</span> the site sends in.</>)}
              {active === 'users'       && (<>Manage <span style={{ fontStyle: 'italic', color: C.brand }}>who can sign in</span>.</>)}
              {active === 'account'     && (<>Your <span style={{ fontStyle: 'italic', color: C.brand }}>admin</span> account.</>)}
            </h1>
            <p style={{ margin: 0, color: C.ink3, fontSize: 14 }}>
              Live Convex data · {counts?.total ?? '—'} total submissions
              {counts?.today ? ` · ${counts.today} in the last 24h` : ''}
            </p>
          </div>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
              window.dispatchEvent(new Event('hashchange'));
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
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
        </header>

        {active === 'submissions' && (
          <SubmissionsView
            submissions={submissions}
            counts={counts}
            token={token}
            isMobile={isMobile}
          />
        )}
        {active === 'users' && (
          <UsersView
            users={users}
            token={token}
            currentUserId={me._id}
            isMobile={isMobile}
          />
        )}
        {active === 'account' && (
          <AccountView me={me} onSignOut={signOut} />
        )}

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 12, color: C.ink4, padding: '32px 0 24px',
        }}>
          <span>© {new Date().getFullYear()} 6POINT Designs · Admin</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              background: C.brand,
            }} />
            Convex realtime
          </span>
        </div>
      </main>

      <style>{`
        .admin-dash input::placeholder { color: var(--ink-4); }
      `}</style>
    </div>
  );
};
