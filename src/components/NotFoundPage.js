import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Home, Mail, Search } from 'lucide-react';
import { Logo, LogoMark } from './Logo';
import { MagneticButton } from './MagneticButton';

const quickLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Services', href: '/#services', icon: Search },
  { label: 'Work', href: '/#work', icon: ArrowRight },
  { label: 'Contact', href: '/#contact', icon: Mail },
];

export const NotFoundPage = () => (
  <div
    className="not-found-page"
    style={{
      minHeight: '100svh',
      background:
        'radial-gradient(circle at 18% 24%, rgba(217,178,106,0.16), transparent 28rem), radial-gradient(circle at 82% 22%, rgba(116,142,117,0.16), transparent 30rem), var(--bg)',
      color: 'var(--ink)',
      overflow: 'hidden',
      position: 'relative',
    }}
  >
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: '42% 0 0',
        backgroundImage: 'radial-gradient(rgba(11,11,12,0.22) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        maskImage: 'linear-gradient(to bottom, transparent, #000 18%, #000 70%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 18%, #000 70%, transparent)',
        pointerEvents: 'none',
      }}
    />

    <header
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 18,
        padding: '18px clamp(20px, 4vw, 44px)',
      }}
    >
      <a href="/" aria-label="6POINT Designs home" style={{ display: 'inline-flex' }}>
        <Logo markSize={28} textSize={11} />
      </a>
      <a
        href="/#contact"
        className="not-found-contact"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          minHeight: 40,
          padding: '0 14px',
          border: '1px solid var(--line-strong)',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 700,
          background: 'rgba(250,250,248,0.68)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        <span>Contact</span>
        <ArrowRight size={14} />
      </a>
    </header>

    <main
      className="not-found-shell"
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        minHeight: 'calc(100svh - 76px)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.82fr)',
        gap: 'clamp(34px, 6vw, 84px)',
        alignItems: 'center',
        padding: 'clamp(56px, 8vw, 104px) clamp(20px, 4vw, 44px) clamp(42px, 7vw, 78px)',
      }}
    >
      <section style={{ maxWidth: 720, minWidth: 0, width: '100%' }}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow"
          style={{ margin: '0 0 18px', color: 'var(--brand)' }}
        >
          404 / Page not found
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="not-found-title"
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: '7rem',
            lineHeight: 0.95,
            letterSpacing: 0,
            maxWidth: 680,
            overflowWrap: 'normal',
          }}
        >
          This page slipped out of frame.
        </motion.h1>

        <motion.p
          className="not-found-copy"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          style={{
            margin: '24px 0 0',
            maxWidth: 560,
            color: 'var(--ink-2)',
            fontSize: 18,
            lineHeight: 1.65,
          }}
        >
          The address may have moved, but the studio is still open. Head back
          to the homepage, browse the work, or start a conversation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 34 }}
        >
          <MagneticButton href="/" variant="primary" size="lg" icon={<Home size={16} />}>
            Back home
          </MagneticButton>
          <MagneticButton href="/#contact" variant="outline" size="lg" icon={<ArrowRight size={16} />}>
            Start a project
          </MagneticButton>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Helpful pages"
          className="not-found-links"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 10,
            marginTop: 46,
            maxWidth: 640,
          }}
        >
          {quickLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              style={{
                minHeight: 86,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                padding: 16,
                border: '1px solid rgba(11,11,12,0.12)',
                background: 'rgba(255,255,255,0.76)',
                color: 'var(--ink)',
                fontWeight: 700,
                fontSize: 14,
                boxShadow: '0 10px 30px rgba(11,11,12,0.05)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <Icon size={17} style={{ color: 'var(--brand)' }} />
              <span style={{ color: 'var(--ink)' }}>{label}</span>
            </a>
          ))}
        </motion.nav>
      </section>

      <motion.aside
        aria-hidden
        initial={{ opacity: 0, scale: 0.96, rotate: 2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="not-found-art"
        style={{
          position: 'relative',
          minHeight: 520,
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 420,
            maxWidth: '100%',
            aspectRatio: '1',
            border: '1px solid rgba(11,11,12,0.10)',
            borderRadius: '50%',
          }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 36, ease: 'linear', repeat: Infinity }}
          style={{
            position: 'absolute',
            width: 330,
            maxWidth: '82%',
            aspectRatio: '1',
            border: '1px dashed rgba(116,142,117,0.46)',
            borderRadius: '50%',
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, ease: 'linear', repeat: Infinity }}
          style={{
            position: 'absolute',
            width: 560,
            maxWidth: '126%',
            aspectRatio: '1',
            color: 'rgba(116,142,117,0.09)',
          }}
        >
          <LogoMark size="100%" color="currentColor" />
        </motion.div>
        <div
          style={{
            position: 'relative',
            display: 'grid',
            placeItems: 'center',
            width: 250,
            aspectRatio: '1',
            background: 'var(--ink)',
            color: '#fff',
            boxShadow: '0 30px 80px rgba(11,11,12,0.18)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, 60, 0] }}
            transition={{ duration: 3.6, ease: 'easeInOut', repeat: Infinity }}
            style={{ position: 'absolute', top: 24, color: 'var(--brand-2)' }}
          >
            <LogoMark size={46} color="currentColor" />
          </motion.div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 92,
              lineHeight: 1,
              letterSpacing: 0,
              marginTop: 42,
            }}
          >
            404
          </span>
        </div>
      </motion.aside>
    </main>

    <style>{`
      @media (max-width: 980px) {
        .not-found-shell {
          grid-template-columns: 1fr !important;
          padding-top: 42px !important;
        }

        .not-found-art {
          min-height: 340px !important;
          order: -1;
        }

        .not-found-title {
          font-size: 5.2rem !important;
        }
      }

      @media (max-width: 620px) {
        .not-found-page {
          overflow-x: hidden !important;
        }

        .not-found-contact {
          display: none !important;
        }

        .not-found-title {
          font-size: 2.65rem !important;
          line-height: 1 !important;
          max-width: 330px !important;
        }

        .not-found-copy {
          max-width: 330px !important;
        }

        .not-found-links {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
      }
    `}</style>
  </div>
);
