import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paintbrush, TrendingUp, Camera, ArrowUpRight } from 'lucide-react';

/* Custom asterisk mark for the Branding tile */
const SparkleMark = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
    {[0, 60, 120, 180, 240, 300].map((deg) => (
      <rect
        key={deg}
        x="27.5"
        y="6"
        width="9"
        height="26"
        rx="4.5"
        transform={`rotate(${deg} 32 32)`}
      />
    ))}
    <circle cx="32" cy="32" r="6" />
  </svg>
);

const SERVICES = [
  {
    title: 'Branding',
    short: 'Branding',
    slug: 'branding',
    bg: 'var(--ink)',
    fg: '#fff',
    Icon: ({ size }) => <SparkleMark size={size} />,
    spin: true, // rotating asterisk
  },
  {
    title: 'Web Design',
    short: 'Web Design',
    slug: 'web-design',
    bg: '#2563EB', // vivid blue
    fg: '#fff',
    Icon: ({ size }) => <Paintbrush size={size} strokeWidth={1.8} />,
  },
  {
    title: 'Growth Strategy',
    short: 'Growth',
    slug: 'growth-strategy',
    bg: 'var(--brand)', // sage green
    fg: '#fff',
    Icon: ({ size }) => <TrendingUp size={size} strokeWidth={2} />,
  },
  {
    title: 'Social Media',
    short: 'Social',
    slug: 'social-media',
    bg: 'var(--brand-2)', // warm gold
    fg: '#1A1500',
    Icon: ({ size }) => <Camera size={size} strokeWidth={1.8} />,
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   LearnButton — animated CTA with a bouncy entry and a jump-out arrow.
   Uses framer variants so the parent's `whileHover` propagates to children.
   ────────────────────────────────────────────────────────────────────────── */
const LearnButton = ({ label, href = '#contact' }) => (
  <motion.a
    href={href}
    initial="rest"
    animate="rest"
    whileHover="hover"
    whileTap={{ scale: 0.96 }}
    onClick={(e) => {
      e.stopPropagation();
      if (href.startsWith('#service-')) {
        e.preventDefault();
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.location.hash = href;
      }
    }}
    style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '11px 8px 11px 20px',
      background: 'var(--ink)',
      color: '#fff',
      borderRadius: 999,
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 14,
      letterSpacing: '0.005em',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      textDecoration: 'none',
    }}
  >
    <motion.span
      variants={{ rest: { x: 0 }, hover: { x: -2 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      {label}
    </motion.span>

    {/* Entry pop wrapper — independent of the hover variant on the inner span */}
    <motion.span
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 14, delay: 0.18 }}
      style={{ display: 'inline-flex' }}
    >
      <motion.span
        variants={{
          rest:  { x: 0,  scale: 1,    rotate: 0,    backgroundColor: '#FFFFFF' },
          hover: { x: 8,  scale: 1.22, rotate: -25,  backgroundColor: 'var(--brand-2)' },
        }}
        transition={{ type: 'spring', stiffness: 480, damping: 14 }}
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          color: 'var(--ink)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Subtle continuous nudge so the arrow always reads as "interactive" */}
        <motion.span
          animate={{ x: [0, 2, 0] }}
          transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
          style={{ display: 'inline-flex' }}
        >
          <ArrowUpRight size={16} strokeWidth={2.5} />
        </motion.span>
      </motion.span>
    </motion.span>
  </motion.a>
);

/* ────────────────────────────────────────────────────────────────────────── */

const Row = ({ s, index, isActive, isDimmed, onEnter }) => {
  /* Whole-row navigation so the service title itself is the primary
     "click here to read about this service" target — the LearnButton on
     the right is just a visual reinforcement that only shows on hover. */
  const goToService = (e) => {
    e.preventDefault();
    /* Snap to top BEFORE swapping the view so the new page never inherits
       the deep scroll position of the home page (Lenis smooth-scroll can
       otherwise leave a frame of "bottom of page" before the new view
       resets it). */
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.location.hash = `#service-${s.slug}`;
  };
  return (
    <motion.li
      onMouseEnter={onEnter}
      onFocus={onEnter}
      onClick={goToService}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToService(e);
        }
      }}
      role="link"
      aria-label={`Learn about ${s.title}`}
      tabIndex={0}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative',
        listStyle: 'none',
        borderBottom: '1px solid var(--line)',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          padding: '20px 8px 20px 0',
          minHeight: 96,
        }}
      >
        {/* Icon swatch — slides + bounces in when row activates */}
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              key="icon"
              initial={{ width: 0, opacity: 0, marginRight: 0 }}
              animate={{ width: 80, opacity: 1, marginRight: 22 }}
              exit={{ width: 0, opacity: 0, marginRight: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden', flexShrink: 0, display: 'inline-flex' }}
              aria-hidden
            >
              <motion.div
                initial={{ scale: 0.2, rotate: -180, opacity: 0, y: -10 }}
                animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
                exit={{ scale: 0.2, rotate: 180, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 14,
                  mass: 0.7,
                }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 0,
                  background: s.bg,
                  color: s.fg,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 10px 24px rgba(11,11,12,0.18)',
                }}
              >
                {/* If service has a continuous spin (Branding asterisk), apply it */}
                {s.spin ? (
                  <motion.span
                    initial={{ rotate: -90, scale: 0.5 }}
                    animate={{ rotate: 360, scale: 1 }}
                    transition={{
                      rotate: { duration: 7, ease: 'linear', repeat: Infinity },
                      scale: { type: 'spring', stiffness: 260, damping: 18 },
                    }}
                    style={{ display: 'inline-flex' }}
                  >
                    <s.Icon size={42} />
                  </motion.span>
                ) : (
                  <motion.span
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: [1, 1.08, 1], rotate: [0, -6, 0] }}
                    transition={{
                      scale: { duration: 0.6, delay: 0.15, ease: 'easeOut' },
                      rotate: { duration: 0.6, delay: 0.15, ease: 'easeOut' },
                    }}
                    style={{ display: 'inline-flex' }}
                  >
                    <s.Icon size={40} />
                  </motion.span>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h3
          initial={false}
          animate={{ color: isDimmed ? 'rgba(11,11,12,0.22)' : 'rgba(11,11,12,1)' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            margin: 0,
            flex: 1,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(36px, 5.4vw, 72px)',
            lineHeight: 1.04,
            letterSpacing: '-0.01em',
          }}
        >
          {s.title}
        </motion.h3>

        <AnimatePresence initial={false} mode="wait">
          {isActive ? (
            <motion.div
              key="cta"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ flexShrink: 0 }}
            >
              <LearnButton label={`Learn about ${s.short}`} href={`#service-${s.slug}`} />
            </motion.div>
          ) : (
            /* Always-visible affordance — a small "→" so the row reads as
               a link even before the user hovers. Hidden the moment the
               full LearnButton swaps in, to avoid stacking two CTAs. */
            <motion.span
              key="hint"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 999,
                background: 'var(--bg-soft)',
                color: 'var(--ink-2)',
              }}
            >
              <ArrowUpRight size={16} strokeWidth={2.2} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
};

export const Services = () => {
  const [active, setActive] = useState(null);

  return (
    <section id="services" className="section" style={{ background: 'var(--bg)' }}>
      <div className="container">
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
            gap: 48,
            alignItems: 'flex-end',
            marginBottom: 56,
          }}
          className="services-header"
        >
          <div>
            <p className="eyebrow" style={{ marginBottom: 18 }}>What we do</p>
            <motion.h2
              className="h2"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ margin: 0 }}
            >
              Join us at <span className="italic-display">the table.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(16px, 1.3vw, 19px)',
              lineHeight: 1.6,
              color: 'var(--ink-2)',
              maxWidth: 540,
              margin: 0,
            }}
          >
            Four disciplines, one team. Pick what you need or bundle them — we
            keep your brand, site, and growth moving in the same direction.
          </motion.p>
        </header>

        <ul
          onMouseLeave={() => setActive(null)}
          style={{ margin: 0, padding: 0, borderTop: '1px solid var(--line)' }}
        >
          {SERVICES.map((s, i) => (
            <Row
              key={s.title}
              s={s}
              index={i}
              isActive={active === i}
              isDimmed={active !== null && active !== i}
              onEnter={() => setActive(i)}
            />
          ))}
        </ul>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .services-header {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  );
};
