import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, ArrowUpRight, Heart, Paintbrush, TrendingUp, Camera } from 'lucide-react';
import { LogoMark } from './Logo';

/* SparkleMark — same custom asterisk the on-page Services section uses for
   the Branding tile. Kept inline so this menu stays standalone. */
const SparkleMark = ({ size = 18 }) => (
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

/* ─────────────────────────── Inline brand icons ─────────────────────────── */

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.49 6S0 4.88 0 3.5 1.11 1 2.49 1s2.49 1.12 2.49 2.5zM.22 8h4.54v14H.22V8zm7.66 0h4.36v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v7.44h-4.55v-6.6c0-1.57-.03-3.59-2.19-3.59-2.2 0-2.54 1.71-2.54 3.48V22H7.88V8z" />
  </svg>
);
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.54V9.84c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.75 8.43-4.91 8.43-9.93Z" />
  </svg>
);

/* ─────────────────────────── Data ─────────────────────────── */

const NAV_ITEMS = [
  { label: 'Home',     href: '#top' },
  { label: 'Services', href: '#services' },
  { label: 'Work',     href: '#work' },
  { label: 'FAQ',      href: '#faq' },
  { label: 'Contact',  href: '#contact' },
  { label: 'Login',    href: '#client-login' },
];

/* Mirrors the icons + tile colors from `src/components/Services.js` 1:1
   (Branding → SparkleMark, Web Design → Paintbrush, Growth → TrendingUp,
   Social → Camera). Labels come from the screenshot reference, but the
   icon + color treatment is the same as the on-page section so the brand
   reads consistently. */
const SERVICES = [
  {
    label: 'Branding',
    slug: 'branding',
    sub: 'Make lasting impressions',
    bg: 'var(--ink)',
    fg: '#fff',
    Icon: ({ size }) => <SparkleMark size={size} />,
  },
  {
    label: 'Web Design',
    slug: 'web-design',
    sub: 'Sites that convert',
    bg: '#2563EB',
    fg: '#fff',
    Icon: ({ size }) => <Paintbrush size={size} strokeWidth={1.8} />,
  },
  {
    label: 'Growth Strategy',
    slug: 'growth-strategy',
    sub: 'Ship more, faster',
    bg: 'var(--brand)',
    fg: '#fff',
    Icon: ({ size }) => <TrendingUp size={size} strokeWidth={2} />,
  },
  {
    label: 'Social Media',
    slug: 'social-media',
    sub: 'Show up everywhere',
    bg: 'var(--brand-2)',
    fg: '#1A1500',
    Icon: ({ size }) => <Camera size={size} strokeWidth={1.8} />,
  },
];

/* ─────────────────────────── Menu item with hover ─────────────────────────── */

const MenuItem = ({ label, href, index, onNav }) => {
  const [hover, setHover] = useState(false);
  return (
    <motion.a
      href={href}
      onClick={(e) => onNav(e, href)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{
        duration: 0.55,
        delay: 0.18 + index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 28,
        textDecoration: 'none',
        position: 'relative',
        padding: '4px 0',
        color: '#fff',
        width: 'fit-content',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <AnimatePresence>
        {hover && (
          <motion.span
            key="indicator"
            initial={{ opacity: 0, x: -24, scale: 0.4 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24, scale: 0.4 }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 22,
            }}
            style={{ display: 'inline-flex', flexShrink: 0 }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
              style={{ display: 'inline-flex' }}
            >
              <LogoMark size={42} color="var(--brand-2)" />
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>

      <motion.span
        animate={{
          x: hover ? 6 : 0,
          color: hover ? 'var(--brand-2)' : '#ffffff',
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(40px, 5.6vw, 76px)',
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
          display: 'inline-block',
        }}
      >
        {label}
      </motion.span>
    </motion.a>
  );
};

/* ─────────────────────────── Rotating "Let's talk." badge ─────────────────────────── */

const RotatingTalkBadge = ({ size = 220, onClick }) => {
  const r = size / 2 - 18; // padding from edge
  return (
    <motion.a
      href="#contact"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
      transition={{
        duration: 0.7,
        delay: 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        color: '#fff',
        cursor: 'pointer',
      }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
        style={{ position: 'absolute', inset: 0, willChange: 'transform' }}
      >
        <defs>
          <path
            id={`talk-circle-${size}`}
            d={`M ${size / 2}, ${size / 2 - r}
               a ${r},${r} 0 1,1 -0.001,0`}
          />
        </defs>
        <text
          fill="#fff"
          fontFamily="Instrument Serif, serif"
          fontStyle="italic"
          fontSize={size * 0.108}
          letterSpacing="2"
        >
          <textPath href={`#talk-circle-${size}`} startOffset="0">
            Let's talk. · Let's talk. · Let's talk. · Let's talk. ·
          </textPath>
        </text>
      </motion.svg>

      <motion.span
        whileHover={{
          background: 'var(--brand-2)',
          color: 'var(--ink)',
          borderColor: 'var(--brand-2)',
        }}
        transition={{ duration: 0.25 }}
        style={{
          width: size * 0.30,
          height: size * 0.30,
          borderRadius: 6,
          transform: 'rotate(45deg)',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.18)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <span style={{ transform: 'rotate(-45deg)', display: 'inline-flex' }}>
          <ArrowUpRight size={size * 0.13} strokeWidth={1.8} />
        </span>
      </motion.span>
    </motion.a>
  );
};

/* ─────────────────────────── Main component ─────────────────────────── */

export const FullscreenMenu = ({ open, onClose }) => {
  // Lock page scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Esc to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* All hashes that map to a *top-level view* (not a section anchor on
     the home page). Routing to one of these means swapping the page,
     not scrolling to a section. */
  const isViewHash = (href) =>
    href === '#client-login' ||
    href === '#agent-dash' ||
    href === '#terms' ||
    href === '#privacy' ||
    href.startsWith('#service-');

  /* Navigate to a target href. Three cases:
       1. Target is a sub-view (e.g. #service-branding, #client-login):
          set the hash, App re-renders into that view, scroll to top.
       2. Target is on the home page and we're already on home:
          scroll smoothly to the section / top.
       3. Target is on the home page but we're currently on a sub-view:
          we must first send the user back to the home view (clear or
          rewrite the hash, dispatch hashchange so App remounts), then
          wait for the section element to appear in the DOM before
          scrolling — otherwise `querySelector` finds nothing because
          the home page isn't mounted yet. */
  const handleNav = (e, href) => {
    e.preventDefault();
    onClose();

    setTimeout(() => {
      if (isViewHash(href)) {
        window.location.hash = href;
        window.scrollTo(0, 0);
        return;
      }

      const currentHash = window.location.hash;
      const onSubView = isViewHash(currentHash);

      if (!onSubView) {
        if (href === '#top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const el = document.querySelector(href);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      /* Coming from a sub-view → home. Switch the route first. */
      if (href === '#top') {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search
          );
        } else {
          window.location.hash = '';
        }
        window.dispatchEvent(new Event('hashchange'));
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        return;
      }

      /* Section anchor (#services, #work, #faq, #contact, …). Setting
         the hash both fires hashchange (App re-renders to home) and
         records the section in the URL. Then poll briefly for the
         element so we scroll once React has actually mounted it. */
      window.location.hash = href;
      const tryScroll = (attempts) => {
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (attempts < 20) {
          setTimeout(() => tryScroll(attempts + 1), 30);
        }
      };
      setTimeout(() => tryScroll(0), 60);
    }, 380);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu-overlay"
          initial={{ clipPath: 'circle(0% at calc(100% - 46px) 46px)' }}
          animate={{ clipPath: 'circle(160% at calc(100% - 46px) 46px)' }}
          exit={{ clipPath: 'circle(0% at calc(100% - 46px) 46px)' }}
          transition={{ duration: 0.7, ease: [0.83, 0, 0.17, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'var(--ink)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            padding: 'clamp(20px, 2.5vw, 28px)',
            overflow: 'auto',
          }}
        >
          {/* TOP BAR */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexShrink: 0,
            }}
          >
            <motion.a
              href="#top"
              onClick={(e) => handleNav(e, '#top')}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none',
                color: '#fff',
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  background: '#fff',
                  borderRadius: 6,
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 22,
                  lineHeight: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBottom: 2,
                }}
              >
                6
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: '0.02em',
                }}
              >
                6point.designs
              </span>
            </motion.a>

            <motion.button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
              transition={{
                duration: 0.4,
                delay: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              style={{
                width: 44,
                height: 44,
                border: '1.5px solid var(--brand-2)',
                background: 'transparent',
                color: 'var(--brand-2)',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Minus size={22} strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* MAIN CONTENT — nav items + rotating badge.
              Sized so the bottom services + made-with row stays above the fold
              on most laptop heights (~720px+). */}
          <div
            className="menu-main"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
              gap: 'clamp(32px, 5vw, 64px)',
              alignItems: 'flex-start',
              paddingTop: 'clamp(20px, 3.5vh, 40px)',
              paddingBottom: 'clamp(16px, 2.5vh, 28px)',
            }}
          >
            <div
              className="menu-nav"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 4,
              }}
            >
              {NAV_ITEMS.map((item, i) => (
                <MenuItem
                  key={item.label}
                  label={item.label}
                  href={item.href}
                  index={i}
                  onNav={handleNav}
                />
              ))}
            </div>

            <div
              className="menu-badge-wrap"
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'flex-start',
              }}
            >
              <RotatingTalkBadge
                size={190}
                onClick={(e) => handleNav(e, '#contact')}
              />
            </div>
          </div>

          {/* BOTTOM-RIGHT — Compact Services grid + Made-with card.
              Pinned to the right via `marginLeft: auto` and capped to a sensible
              max-width so it reads as a tidy info block tucked in the corner
              rather than a full-width strip.  Tiles + card stagger in after the
              menu's clip-path reveal completes. */}
          <motion.div
            className="menu-bottom"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.07, delayChildren: 0.45 },
              },
            }}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            style={{
              display: 'flex',
              gap: 18,
              alignItems: 'stretch',
              flexShrink: 0,
              marginLeft: 'auto',
              marginTop: 'clamp(-300px, -25vh, -140px)',
              maxWidth: 880,
              width: '100%',
            }}
          >
            {/* Services tiles (2×2) */}
            <motion.div
              style={{ flex: '1 1 auto', minWidth: 0 }}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              <p
                style={{
                  margin: '0 0 14px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '-0.005em',
                }}
              >
                Services
              </p>
              <motion.div
                className="menu-services"
                variants={{
                  hidden: {},
                  show:   { transition: { staggerChildren: 0.06 } },
                }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 1,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                {SERVICES.map((s) => {
                  const Icon = s.Icon;
                  const serviceHref = `#service-${s.slug}`;
                  return (
                    <motion.a
                      key={s.label}
                      href={serviceHref}
                      onClick={(e) => handleNav(e, serviceHref)}
                      className="menu-service-card"
                      variants={{
                        hidden: { opacity: 0, y: 14, scale: 0.96 },
                        show:   {
                          opacity: 1, y: 0, scale: 1,
                          transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                        },
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: 18,
                        background: 'var(--ink)',
                        color: '#fff',
                        textDecoration: 'none',
                        transition: 'background .25s ease, transform .25s ease',
                      }}
                    >
                      <span
                        style={{
                          width: 56,
                          height: 56,
                          background: s.bg,
                          color: s.fg,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={28} />
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                        <span style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.2 }}>{s.label}</span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>{s.sub}</span>
                      </span>
                    </motion.a>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Made-with card — narrow, sits flush with the bottom of the tiles */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14, scale: 0.97 },
                show:   {
                  opacity: 1, y: 0, scale: 1,
                  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              style={{
                flex: '0 0 240px',
                alignSelf: 'flex-end',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 22,
                  lineHeight: 1,
                  color: '#fff',
                }}
              >
                <span>Made with</span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
                  style={{ display: 'inline-flex' }}
                >
                  <Heart size={18} fill="var(--brand-2)" stroke="var(--brand-2)" />
                </motion.span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.45,
                }}
              >
                Working remotely in South Carolina.
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {[
                  { name: 'Facebook',  href: 'https://facebook.com',  Icon: FacebookIcon },
                  { name: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
                  { name: 'LinkedIn',  href: 'https://linkedin.com',  Icon: LinkedinIcon },
                ].map(({ name, href, Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background .2s ease, transform .2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <style>{`
            .menu-service-card:hover {
              background: rgba(255,255,255,0.06) !important;
            }

            @media (max-width: 880px) {
              .menu-main {
                grid-template-columns: 1fr !important;
                gap: 24px !important;
                padding-top: clamp(24px, 4vh, 40px) !important;
              }
              .menu-badge-wrap {
                justify-content: center !important;
              }
              .menu-bottom {
                max-width: 100% !important;
                margin-left: 0 !important;
                margin-top: 24px !important;
                flex-direction: column !important;
              }
              .menu-bottom > div:last-child {
                flex: 0 0 auto !important;
                align-self: stretch !important;
              }
            }
            @media (max-width: 540px) {
              .menu-services {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
