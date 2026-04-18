import React from 'react';
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
  { label: 'Branding',         href: '#services' },
  { label: 'Web Design',       href: '#services' },
  { label: 'Growth Strategy',  href: '#services' },
  { label: 'Social Media',     href: '#services' },
  { label: 'Start a project',  href: '#contact' },
];

const footerLinkStyle = { fontSize: 15, color: 'rgba(255,255,255,0.78)', textDecoration: 'none' };
const bottomLinkStyle = { color: 'rgba(255,255,255,0.55)' };

const FooterCol = ({ items, delay = 0 }) => (
  <motion.ul
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-10%' }}
    transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}
  >
    {items.map((it, i) => (
      <motion.li
        key={it.label}
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.4, delay: delay + 0.05 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
      >
        <a href={it.href} className="footer-link" style={footerLinkStyle}>{it.label}</a>
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

/* Animate the wordmark with a per-letter staggered reveal so the headline
   reads as deliberate motion when the user scrolls in. */
const AnimatedWordmark = ({ text }) => {
  const letters = Array.from(text);
  return (
    <motion.span
      style={{ display: 'inline-flex', overflow: 'hidden', paddingBottom: 4 }}
      initial="rest"
      whileInView="show"
      viewport={{ once: true, margin: '-15%' }}
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

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: '#0B0B0C', color: 'rgba(255,255,255,0.85)', paddingTop: 'clamp(56px, 8vw, 96px)', paddingBottom: 28 }}>
      <div className="container">
        <div
          className="footer-top"
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.35fr)', gap: 56, alignItems: 'flex-start' }}
        >
          <div>
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
              <a href="#contact" className="open-sign" style={{
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
          </div>

          <div
            className="footer-card"
            style={{
              background: '#161618', borderRadius: 16, padding: 'clamp(28px, 3vw, 40px)',
              display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 40,
            }}
          >
            <FooterCol items={NAV_LINKS} delay={0.1} />
            <FooterCol items={SERVICE_LINKS} delay={0.18} />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.55, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
            >
              <h4 style={{
                margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontWeight: 400, fontSize: 28, color: '#fff', lineHeight: 1, letterSpacing: '-0.01em',
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
            <a href="#top" style={{ ...bottomLinkStyle, color: 'rgba(255,255,255,0.4)' }} className="footer-bottom-link">site by 6point</a>
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
        }
        @media (max-width: 540px) {
          .footer-card { grid-template-columns: 1fr !important; gap: 28px !important; }
          .footer-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </footer>
  );
};
