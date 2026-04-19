import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Logo, LogoMark } from './Logo';
import { MagneticButton } from './MagneticButton';
import { FullscreenMenu } from './FullscreenMenu';

const SCROLL_THRESHOLD = 80;

/* Typewriter — characters reveal one at a time with a blinking caret.
   Re-runs each time the component mounts (i.e. each scroll-down). */
const Typewriter = ({ text, delay = 0, speed = 70, style }) => {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setCount(0);
    setDone(false);
    let interval;
    const start = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i++;
        setCount(i);
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [text, delay, speed]);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--font-sans)',
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: '0.16em',
        color: 'var(--logo-green)',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span>{text.slice(0, count)}</span>
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
          style={{
            display: 'inline-block',
            width: 2,
            height: '0.95em',
            marginLeft: 2,
            background: 'currentColor',
            verticalAlign: 'middle',
          }}
        />
      )}
    </span>
  );
};

/* The dot after DESIGNS — cycles through a few brand-friendly hues. */
const ColorDot = () => (
  <motion.span
    animate={{
      color: [
        'var(--brand)',
        'var(--brand-2)',
        '#A35E1F',
        '#2563EB',
        '#9A3030',
        'var(--brand)',
      ],
    }}
    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
    style={{
      display: 'inline-block',
      marginLeft: 1,
      fontFamily: 'var(--font-sans)',
      fontWeight: 900,
      fontSize: 18,
      lineHeight: 0.6,
    }}
  >
    .
  </motion.span>
);

/* The Menu trigger button — same look in both states (top nav and floating). */
const MenuButton = ({ onClick, dark = false }) => (
  <motion.button
    type="button"
    onClick={onClick}
    aria-label="Open menu"
    whileHover={{ scale: 1.06 }}
    whileTap={{ scale: 0.94 }}
    style={{
      width: 44,
      height: 44,
      border: '1.5px solid var(--brand-2)',
      background: dark ? 'rgba(11,11,12,0.55)' : 'transparent',
      color: 'var(--brand-2)',
      borderRadius: 4,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: dark ? 'saturate(220%) blur(16px)' : 'none',
      WebkitBackdropFilter: dark ? 'saturate(220%) blur(16px)' : 'none',
      boxShadow: dark
        ? 'inset 0 1px 0 0 rgba(255,255,255,0.5), 0 12px 30px rgba(11,11,12,0.10)'
        : 'none',
    }}
  >
    <Menu size={20} strokeWidth={2.2} />
  </motion.button>
);

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Scroll to the top of the current page. Smooth-scrolls when the user
     is already on a section of the home page. */
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /* Navigate back to the marketing home view. If the user is currently
     on a sub-view (service page, login, terms, etc.) we have to clear
     the URL hash so the App router re-renders the home page; merely
     scrolling would leave them stranded on the same sub-view. */
  const goHome = (e) => {
    e.preventDefault();
    const h = window.location.hash;
    const onSubView =
      h === '#client-login' ||
      h === '#client-dash' ||
      h === '#admin-dash' ||
      h === '#terms' ||
      h === '#privacy' ||
      h.startsWith('#service-');

    if (!onSubView) {
      scrollToTop();
      return;
    }

    /* Strip the hash entirely so we land at the very top of the URL,
       then synthesize a hashchange so App's listener re-renders into
       the home view. Direct `window.location.hash = ''` keeps a stray
       `#` in the address bar in some browsers. */
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
  };

  return (
    <>
      {/* ───────────────────── FULL NAV (top of page) ───────────────────── */}
      <AnimatePresence>
        {!scrolled && (
          <motion.header
            key="full-nav"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              padding: '14px clamp(20px, 3vw, 40px)',
              background: 'transparent',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                pointerEvents: 'auto',
                margin: '0 auto',
                maxWidth: 1320,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
              }}
            >
              {/* Brand (vertical lockup) — clicking always returns to the
                  marketing home, even if we're currently inside a service
                  page or other sub-view. */}
              <a
                href="#top"
                aria-label="6POINT home"
                onClick={goHome}
                style={{ display: 'inline-flex', textDecoration: 'none' }}
              >
                <Logo markSize={26} textSize={11} />
              </a>

              {/* Right cluster — Book a Call + Menu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="hide-sm">
                  <MagneticButton href="#contact" variant="primary" size="sm" strength={10}>
                    Book a Call
                  </MagneticButton>
                </span>
                <MenuButton onClick={() => setMenuOpen(true)} />
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ─────────── SCROLLED: full liquid-glass nav bar ─────────── */}
      <AnimatePresence>
        {scrolled && (
          <motion.header
            key="glass-bar"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: 12,
              left: 'clamp(12px, 2vw, 24px)',
              right: 'clamp(12px, 2vw, 24px)',
              zIndex: 100,
              height: 64,
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.7)',
              background: 'rgba(255, 255, 255, 0.42)',
              backdropFilter: 'saturate(220%) blur(28px)',
              WebkitBackdropFilter: 'saturate(220%) blur(28px)',
              boxShadow: `
                inset 0 1px 0 0 rgba(255,255,255,0.95),
                inset 0 -1px 0 0 rgba(11,11,12,0.05),
                0 16px 40px rgba(11,11,12,0.10),
                0 2px 6px rgba(11,11,12,0.05)
              `,
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              padding: '0 clamp(16px, 2.4vw, 28px)',
              overflow: 'hidden',
            }}
          >
            {/* LEFT — typewriter: 6POINT */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ justifySelf: 'start', minWidth: 0 }}
            >
              <Typewriter text="6POINT" delay={120} speed={70} />
            </motion.div>

            {/* CENTER — asterisk mark, doubles as back-to-top */}
            <motion.button
              type="button"
              onClick={goHome}
              aria-label="Back to top"
              initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              style={{
                justifySelf: 'center',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{
                  duration: 1.1,
                  ease: [0.65, 0, 0.35, 1],
                  repeat: Infinity,
                  repeatDelay: 2.4,
                }}
                style={{ display: 'inline-flex', transformOrigin: '50% 50%' }}
              >
                <LogoMark size={32} color="var(--logo-green)" />
              </motion.span>
            </motion.button>

            {/* RIGHT — typewriter: DESIGNS + color-changing dot + menu */}
            <div
              style={{
                justifySelf: 'end',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                minWidth: 0,
              }}
            >
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <Typewriter text="DESIGNS" delay={520} speed={70} />
                <ColorDot />
              </motion.span>
              <span className="hide-sm" style={{ display: 'inline-flex' }}>
                <MenuButton onClick={() => setMenuOpen(true)} />
              </span>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Mobile-only: menu button below the bar so DESIGNS stays clean */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            key="floating-menu-btn-sm"
            className="show-sm"
            initial={{ y: -60, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            style={{
              position: 'fixed',
              top: 88,
              right: 'clamp(12px, 3vw, 24px)',
              zIndex: 100,
            }}
          >
            <MenuButton onClick={() => setMenuOpen(true)} dark />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────── Fullscreen menu overlay ───────────────────── */}
      <FullscreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};
