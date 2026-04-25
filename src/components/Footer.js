import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.49 6S0 4.88 0 3.5 1.11 1 2.49 1s2.49 1.12 2.49 2.5zM.22 8h4.54v14H.22V8zm7.66 0h4.36v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v7.44h-4.55v-6.6c0-1.57-.03-3.59-2.19-3.59-2.2 0-2.54 1.71-2.54 3.48V22H7.88V8z" />
  </svg>
);
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.54V9.84c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.75 8.43-4.91 8.43-9.93Z" />
  </svg>
);

const NAV_LINKS = [
  { label: 'Home',         href: '#top' },
  { label: 'Services',     href: '#services' },
  { label: 'Work',         href: '#work' },
  { label: 'FAQ',          href: '#faq' },
  { label: 'Contact',      href: '#contact' },
  { label: 'Client Login', href: '#client-login' },
];

const SERVICE_LINKS = [
  { label: 'Branding',         href: '#service-branding' },
  { label: 'Web Design',       href: '#service-web-design' },
  { label: 'Growth Strategy',  href: '#service-growth-strategy' },
  { label: 'Social Media',     href: '#service-social-media' },
  { label: 'Start a project',  href: '#contact' },
  { label: 'Play the snake game', href: '#snake-game', game: true },
];

const footerLinkStyle = { fontSize: 15, color: 'rgba(255,255,255,0.78)', textDecoration: 'none' };
const bottomLinkStyle = { color: 'rgba(255,255,255,0.55)' };

const SnakeIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 15c0-2.2 1.8-4 4-4h8a3 3 0 0 0 0-6h-3" />
    <path d="M13 5l2-2 2 2" />
    <path d="M20 9c0 2.2-1.8 4-4 4H8a3 3 0 0 0 0 6h6" />
    <circle cx="18.5" cy="6.5" r=".7" fill="currentColor" stroke="none" />
  </svg>
);

/* Hashes that route to a dedicated view rather than a section on the home page. */
const isViewHash = (href) =>
  href === '#client-login' ||
  href === '#client-dash' ||
  href === '#admin-dash' ||
  href === '#terms' ||
  href === '#privacy' ||
  href.startsWith('#service-');

/* Handle a footer link click. Mirrors the routing logic in `Navbar.js` /
   `FullscreenMenu.js` so that links work whether the user is currently
   on the marketing home page or inside a sub-view (a service page,
   login, terms, etc.). Without this, `<a href="#services">` from a
   service page would set the hash but the browser's auto-scroll-to-id
   would fire before React mounts the home page, leaving the user
   stranded at the top of the freshly-mounted home view. */
const navigateTo = (e, href) => {
  e.preventDefault();

  if (isViewHash(href)) {
    window.location.hash = href;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
};

const FooterCol = ({ items, delay = 0, onSnakeOpen, clearing = false }) => (
  <motion.ul
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}
  >
    {items.map((it, i) => (
      <motion.li
        key={it.label}
        initial={{ opacity: 0, x: -10 }}
        animate={clearing ? { opacity: 0, x: -22, filter: 'blur(5px)' } : { opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{
          duration: clearing ? 0.24 : 0.4,
          delay: clearing ? i * 0.045 : delay + 0.05 + i * 0.04,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <a
          href={it.href}
          onClick={(e) => {
            if (it.game) {
              e.preventDefault();
              onSnakeOpen?.();
              return;
            }
            navigateTo(e, it.href);
          }}
          className={`footer-link${it.game ? ' footer-link--snake' : ''}`}
          style={footerLinkStyle}
        >
          {it.game && <SnakeIcon />}
          <span>{it.label}</span>
        </a>
      </motion.li>
    ))}
  </motion.ul>
);

const SocialIcon = ({ href, label, children }) => (
  <a
    href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
    style={{
      width: 40, height: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: '#fff',
      transition: 'background .2s ease, transform .2s ease',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    {children}
  </a>
);

/* Animate the wordmark with a per-letter staggered reveal. Uses
   `animate` (not `whileInView`) so it always plays on mount — the
   `whileInView` variant could fail to fire when the footer was already
   in the viewport at page load (or when the smooth-scroll engine
   intercepted the IntersectionObserver), leaving the wordmark stuck
   at opacity 0 and invisible against the black footer. */
const AnimatedWordmark = ({ text }) => {
  const letters = Array.from(text);
  return (
    <motion.span
      style={{ display: 'inline-flex', overflow: 'hidden', paddingBottom: 4 }}
      initial="rest"
      animate="show"
      transition={{ staggerChildren: 0.05, delayChildren: 0.05 }}
    >
      {letters.map((char, i) => (
        <motion.span
          key={i}
          variants={{
            rest: { y: '110%', opacity: 0 },
            show: { y: '0%', opacity: 1 },
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const GRID_SIZE = 15;
const CENTER = Math.floor(GRID_SIZE / 2);
const START_SNAKE = [
  { x: CENTER, y: CENTER },
  { x: CENTER - 1, y: CENTER },
  { x: CENTER - 2, y: CENTER },
];
const START_FOOD = { x: CENTER + 3, y: CENTER };

const nextFood = (snake) => {
  for (let y = 1; y < GRID_SIZE - 1; y++) {
    for (let x = 1; x < GRID_SIZE - 1; x++) {
      if (!snake.some((part) => part.x === x && part.y === y)) return { x, y };
    }
  }
  return START_FOOD;
};

const SnakeGame = ({ active }) => {
  const [snake, setSnake] = useState(START_SNAKE);
  const [food, setFood] = useState(START_FOOD);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const directionRef = useRef(direction);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const reset = useCallback(() => {
    setSnake(START_SNAKE);
    setFood(START_FOOD);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setRunning(true);
  }, []);

  const turn = useCallback((next) => {
    const current = directionRef.current;
    if (current.x + next.x === 0 && current.y + next.y === 0) return;
    setDirection(next);
    directionRef.current = next;
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (event) => {
      const keys = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      if (!keys[event.key]) return;
      event.preventDefault();
      turn(keys[event.key]);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, turn]);

  useEffect(() => {
    if (!active || !running || gameOver) return undefined;
    const timer = setInterval(() => {
      setSnake((current) => {
        const head = current[0];
        const move = directionRef.current;
        const nextHead = { x: head.x + move.x, y: head.y + move.y };
        const hitWall =
          nextHead.x < 0 || nextHead.x >= GRID_SIZE || nextHead.y < 0 || nextHead.y >= GRID_SIZE;
        const hitSelf = current.some((part) => part.x === nextHead.x && part.y === nextHead.y);

        if (hitWall || hitSelf) {
          setGameOver(true);
          setRunning(false);
          return current;
        }

        const ate = nextHead.x === food.x && nextHead.y === food.y;
        const updated = [nextHead, ...current];
        if (!ate) updated.pop();
        if (ate) {
          setScore((s) => s + 1);
          setFood(nextFood(updated));
        }
        return updated;
      });
    }, 135);
    return () => clearInterval(timer);
  }, [active, food, gameOver, running]);

  return (
    <motion.div
      id="snake-game"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="snake-game"
    >
      <div className="snake-game__intro">
        <div className="snake-game__eyebrow"><SnakeIcon /> Tiny footer break</div>
        <h3>Play snake.</h3>
        <p>Use arrow keys on desktop or the buttons on mobile. Eat the gold dot. Don’t hit the wall.</p>
        <div className="snake-game__actions">
          <button type="button" onClick={reset}>{gameOver ? 'Play again' : running ? 'Restart' : 'Start'}</button>
          <span>Score: {score}</span>
        </div>
      </div>

      <div className="snake-game__board-wrap">
        <div
          className="snake-game__board"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          }}
          aria-label="Snake game board"
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const segmentIndex = snake.findIndex((part) => part.x === x && part.y === y);
            const isFood = food.x === x && food.y === y;
            return (
              <span
                key={`${x}-${y}`}
                className={[
                  'snake-game__cell',
                  segmentIndex === 0 ? 'is-head' : '',
                  segmentIndex > 0 ? 'is-snake' : '',
                  isFood ? 'is-food' : '',
                ].join(' ')}
              />
            );
          })}
        </div>
        {gameOver && <div className="snake-game__overlay">Game over</div>}
      </div>

      <div className="snake-game__controls" aria-label="Snake mobile controls">
        <button type="button" onClick={() => turn({ x: 0, y: -1 })}>↑</button>
        <div>
          <button type="button" onClick={() => turn({ x: -1, y: 0 })}>←</button>
          <button type="button" onClick={() => turn({ x: 1, y: 0 })}>→</button>
        </div>
        <button type="button" onClick={() => turn({ x: 0, y: 1 })}>↓</button>
      </div>
    </motion.div>
  );
};

export const Footer = () => {
  const year = new Date().getFullYear();
  const [snakeMode, setSnakeMode] = useState('idle');
  const footerCardRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const openSnake = () => {
    if (snakeMode !== 'idle') return;
    setSnakeMode('clearing');
    setTimeout(() => {
      setSnakeMode('playing');
      footerCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 520);
  };

  useEffect(() => {
    if (snakeMode !== 'playing') return undefined;
    lastScrollYRef.current = window.scrollY;
    const activatedAt = Date.now();
    const onScroll = () => {
      const current = window.scrollY;
      if (Date.now() - activatedAt > 700 && current < lastScrollYRef.current - 12) {
        setSnakeMode('idle');
      }
      lastScrollYRef.current = current;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [snakeMode]);

  const snakeClearing = snakeMode === 'clearing';
  const snakePlaying = snakeMode === 'playing';

  return (
    <footer style={{ background: '#0B0B0C', color: 'rgba(255,255,255,0.85)', paddingTop: 'clamp(56px, 8vw, 96px)', paddingBottom: 28 }}>
      <div className="container">
        <div
          className={`footer-top${snakePlaying ? ' footer-top--snake' : ''}`}
          style={{
            display: 'grid',
            gridTemplateColumns: snakePlaying ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.35fr)',
            gap: snakePlaying ? 28 : 56,
            alignItems: 'flex-start',
          }}
        >
          {!snakePlaying && <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 0.95, letterSpacing: '-0.02em', color: '#fff',
              display: 'inline-flex', alignItems: 'baseline',
            }}>
              <AnimatedWordmark text="6point" />
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-15%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.45 }}
                style={{ color: 'var(--brand-2)', display: 'inline-block', marginLeft: 2 }}
              >
                .
              </motion.span>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{ duration: 0.55, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginTop: 18, maxWidth: 360, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.65)' }}
            >
              Building brands &amp; websites that actually grow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{ duration: 0.55, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginTop: 32 }}
            >
              <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
                Currently booking projects for {year}:
              </p>
              <a href="#contact" onClick={(e) => navigateTo(e, '#contact')} className="open-sign" style={{
                display: 'inline-flex', alignItems: 'stretch', borderRadius: 10, overflow: 'hidden',
                background: '#fff', color: 'var(--ink)', textDecoration: 'none',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 16px', fontSize: 14, fontWeight: 700 }}>
                  6POINT Studio
                </span>
                <span className="neon-open" aria-label="Open">
                  <svg className="neon-open__arcs" viewBox="0 0 120 44" preserveAspectRatio="none" aria-hidden="true">
                    <ellipse cx="60" cy="22" rx="55" ry="17" fill="none" />
                  </svg>
                  <span className="neon-open__text">OPEN</span>
                </span>
              </a>
            </motion.div>
          </div>}

          <div
            ref={footerCardRef}
            className={`footer-card${snakePlaying ? ' footer-card--snake' : ''}`}
            style={{
              background: '#161618', borderRadius: 16, padding: 'clamp(28px, 3vw, 40px)',
              display: 'grid', gridTemplateColumns: snakePlaying ? '1fr' : '1fr 1.2fr 1fr', gap: 40,
              width: '100%',
            }}
          >
            {snakePlaying ? (
              <SnakeGame active={snakePlaying} />
            ) : (
              <>
                <FooterCol items={NAV_LINKS} delay={0.1} clearing={snakeClearing} />
                <FooterCol items={SERVICE_LINKS} delay={0.18} onSnakeOpen={openSnake} clearing={snakeClearing} />

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={snakeClearing ? { opacity: 0, x: -22, filter: 'blur(5px)' } : { opacity: 1, x: 0, filter: 'blur(0px)' }}
                  transition={{ duration: snakeClearing ? 0.26 : 0.55, delay: snakeClearing ? 0.22 : 0.26, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                >
                  <h4 className="say-hey-wave" style={{
                    margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontWeight: 400, fontSize: 28, lineHeight: 1, letterSpacing: '-0.01em',
                  }}>
                    Say hey!
                  </h4>
                  <a href="tel:+18036695425" className="footer-link" style={footerLinkStyle}>(803) 669-5425</a>
                  <a href="mailto:hello@6pointdesigns.com" className="footer-link" style={footerLinkStyle}>hello@6pointdesigns.com</a>

                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <SocialIcon href="https://facebook.com" label="Facebook"><FacebookIcon /></SocialIcon>
                    <SocialIcon href="https://instagram.com" label="Instagram"><InstagramIcon /></SocialIcon>
                    <SocialIcon href="https://linkedin.com" label="LinkedIn"><LinkedinIcon /></SocialIcon>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>

        <div
          className="footer-bottom"
          style={{
            marginTop: 'clamp(48px, 6vw, 80px)', paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.55)',
          }}
        >
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 10,
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: '#fff',
            }}
          >
            <span>Made with</span>
            <motion.span
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
              style={{ display: 'inline-flex' }}
            >
              <Heart size={16} fill="var(--brand-2)" stroke="var(--brand-2)" />
            </motion.span>
            <span style={{ fontStyle: 'normal', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              Made remotely in South Carolina.
            </span>
          </div>

          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
            <span>© {year} 6POINT Designs LLC. All rights reserved.</span>
            <a href="#privacy" style={bottomLinkStyle} className="footer-bottom-link">Privacy</a>
            <a href="#terms" style={bottomLinkStyle} className="footer-bottom-link">Terms &amp; Conditions</a>
            <a href="#top" onClick={(e) => navigateTo(e, '#top')} style={{ ...bottomLinkStyle, color: 'rgba(255,255,255,0.4)' }} className="footer-bottom-link">site by 6point</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link {
          position: relative;
          font-size: 15px;
          color: rgba(255,255,255,0.78);
          text-decoration: none;
          display: inline-block;
          padding-left: 0;
          transition: color .25s ease, padding-left .35s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: padding-left;
        }
        .footer-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 14px;
          height: 1.5px;
          background: var(--brand-2);
          transform: translate(-14px, -50%) scaleX(0);
          transform-origin: left center;
          opacity: 0;
          transition: transform .35s cubic-bezier(0.16, 1, 0.3, 1), opacity .25s ease;
        }
        .footer-link:hover { color: #fff; padding-left: 22px; }
        .footer-link:hover::before {
          opacity: 1;
          transform: translate(0, -50%) scaleX(1);
        }
        .footer-bottom-link {
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color .2s ease;
        }
        .footer-bottom-link:hover { color: #fff; }
        .footer-link--snake {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--brand-2) !important;
          font-weight: 800;
        }
        .footer-link--snake:hover { padding-left: 22px; color: #fff !important; }

        .say-hey-wave {
          position: relative;
          display: inline-block;
          width: fit-content;
          color: #fff;
          overflow: hidden;
          cursor: default;
        }
        .say-hey-wave::before {
          content: 'Say hey!';
          position: absolute;
          inset: 0;
          color: var(--brand-2);
          transform: translateY(110%);
          clip-path: polygon(
            0% 52%, 8% 44%, 16% 51%, 24% 42%, 32% 50%, 40% 44%,
            48% 53%, 56% 45%, 64% 51%, 72% 43%, 80% 50%, 88% 45%,
            100% 52%, 100% 100%, 0% 100%
          );
          transition: transform .75s cubic-bezier(0.16, 1, 0.3, 1);
          animation: yellowWaveDrift 1.9s linear infinite;
        }
        .say-hey-wave:hover::before {
          transform: translateY(0%);
        }
        @keyframes yellowWaveDrift {
          0% {
            clip-path: polygon(
              0% 54%, 8% 44%, 16% 51%, 24% 42%, 32% 50%, 40% 44%,
              48% 53%, 56% 45%, 64% 51%, 72% 43%, 80% 50%, 88% 45%,
              100% 52%, 100% 100%, 0% 100%
            );
          }
          50% {
            clip-path: polygon(
              0% 45%, 8% 53%, 16% 43%, 24% 51%, 32% 44%, 40% 52%,
              48% 45%, 56% 54%, 64% 43%, 72% 51%, 80% 44%, 88% 53%,
              100% 45%, 100% 100%, 0% 100%
            );
          }
          100% {
            clip-path: polygon(
              0% 54%, 8% 44%, 16% 51%, 24% 42%, 32% 50%, 40% 44%,
              48% 53%, 56% 45%, 64% 51%, 72% 43%, 80% 50%, 88% 45%,
              100% 52%, 100% 100%, 0% 100%
            );
          }
        }

        .snake-game {
          grid-column: 1 / -1;
          width: 100%;
          min-height: clamp(430px, 44vw, 560px);
          display: grid;
          grid-template-columns: minmax(230px, 0.32fr) minmax(560px, 1fr) minmax(120px, 0.18fr);
          gap: clamp(24px, 4vw, 56px);
          align-items: stretch;
          padding: clamp(26px, 4vw, 48px);
          border-radius: 24px;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 40px rgba(0,0,0,0.18);
        }
        .snake-game__intro {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .snake-game__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--brand-2);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .snake-game h3 {
          margin: 16px 0 0;
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 400;
          font-size: clamp(40px, 5vw, 72px);
          line-height: 0.95;
          letter-spacing: -0.03em;
          color: #fff;
        }
        .snake-game p {
          margin: 16px 0 0;
          max-width: 390px;
          color: rgba(255,255,255,0.64);
          font-size: 14px;
          line-height: 1.55;
        }
        .snake-game__actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 22px;
        }
        .snake-game__actions button,
        .snake-game__controls button {
          border: 1px solid rgba(255,255,255,0.16);
          background: #fff;
          color: var(--ink);
          border-radius: 999px;
          font-weight: 800;
          cursor: pointer;
          transition: transform .18s ease, background .18s ease;
        }
        .snake-game__actions button {
          padding: 11px 18px;
          font-size: 13px;
        }
        .snake-game__actions span {
          color: rgba(255,255,255,0.65);
          font-size: 13px;
          font-weight: 800;
        }
        .snake-game__actions button:hover,
        .snake-game__controls button:hover { transform: translateY(-1px); background: var(--brand-2); }
        .snake-game__board-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 360px;
          border-radius: 20px;
          padding: 12px;
          background: #0B0B0C;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .snake-game__board {
          width: 100%;
          height: 100%;
          display: grid;
          gap: 3px;
        }
        .snake-game__cell {
          border-radius: 4px;
          background: rgba(255,255,255,0.06);
        }
        .snake-game__cell.is-snake,
        .snake-game__cell.is-head {
          background: var(--brand);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.22);
        }
        .snake-game__cell.is-head {
          background: #fff;
          border-radius: 8px;
        }
        .snake-game__cell.is-food {
          background: var(--brand-2);
          border-radius: 999px;
          box-shadow: 0 0 14px rgba(217,178,106,0.55);
        }
        .snake-game__overlay {
          position: absolute;
          inset: 12px;
          border-radius: 16px;
          background: rgba(11,11,12,0.72);
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .snake-game__controls {
          display: grid;
          align-content: center;
          justify-items: center;
          gap: 10px;
        }
        .snake-game__controls div { display: flex; gap: 18px; }
        .snake-game__controls button {
          width: 58px;
          height: 58px;
          font-size: 24px;
          touch-action: manipulation;
        }

        /* ── Neon "OPEN" sign — hand-built CSS replica of the storefront LED look.
              Bright orange-red text with stacked text-shadow for the gas-tube glow,
              an SVG-drawn blue ellipse outline behind it for the classic neon halo,
              and a subtle flicker keyframe so it feels alive without being annoying. */
        .open-sign { transition: transform .25s ease; }
        .open-sign:hover { transform: translateY(-2px); }
        .open-sign:hover .neon-open__text { animation-duration: 0.9s; }

        .neon-open {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 26px;
          min-width: 118px;
          background: #07070A;
          overflow: hidden;
        }
        .neon-open__arcs {
          position: absolute;
          inset: 4px;
          width: calc(100% - 8px);
          height: calc(100% - 8px);
          pointer-events: none;
        }
        .neon-open__arcs ellipse {
          stroke: #2EA8FF;
          stroke-width: 1.6;
          filter:
            drop-shadow(0 0 1.5px #2EA8FF)
            drop-shadow(0 0 3px #2EA8FF)
            drop-shadow(0 0 6px rgba(46,168,255,0.8));
        }
        .neon-open__text {
          position: relative;
          z-index: 1;
          font-family: var(--font-sans);
          font-weight: 900;
          font-size: 16px;
          letter-spacing: 0.14em;
          color: #FF4A1F;
          text-shadow:
            0 0 2px #FFB199,
            0 0 4px #FF6A3F,
            0 0 9px #FF4A1F,
            0 0 18px #FF4A1F,
            0 0 32px rgba(255,74,31,0.65);
          animation: neonFlicker 4.6s infinite;
        }
        @keyframes neonFlicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
            opacity: 1;
            text-shadow:
              0 0 2px #FFB199,
              0 0 4px #FF6A3F,
              0 0 9px #FF4A1F,
              0 0 18px #FF4A1F,
              0 0 32px rgba(255,74,31,0.65);
          }
          20%, 24%, 55% {
            opacity: 0.55;
            text-shadow: 0 0 2px #FF6A3F, 0 0 4px #FF4A1F;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .neon-open__text { animation: none; }
        }

        @media (max-width: 880px) {
          .footer-top { grid-template-columns: 1fr !important; gap: 32px !important; }
          .footer-card { grid-template-columns: 1fr 1fr !important; }
          .footer-card--snake { grid-template-columns: 1fr !important; }
          .snake-game {
            grid-template-columns: 1fr;
            justify-items: stretch;
            min-height: auto;
          }
          .snake-game__board-wrap {
            margin: 0 auto;
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            max-width: 560px;
            min-height: 0;
          }
        }
        @media (max-width: 540px) {
          .footer-card { grid-template-columns: 1fr !important; gap: 28px !important; }
          .footer-bottom { flex-direction: column; align-items: flex-start; }
          .snake-game { padding: 20px; border-radius: 18px; }
          .snake-game__controls button { width: 52px; height: 52px; }
        }
      `}</style>
    </footer>
  );
};
