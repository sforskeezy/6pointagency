import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MagneticButton } from './MagneticButton';
import { LogoMark } from './Logo';

/* Inline brand mark — renders the asterisk as if it were a letter in the
   headline, sized to cap-height in sage green. No tile, no shadow.
   Sits naturally on the text baseline like a glyph, with a slow
   continuous spin so it feels alive without being distracting. */
const HeroInlineMark = () => (
  <motion.span
    initial={{ opacity: 0, scale: 0.4, rotate: -180 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{
      duration: 1.0,
      delay: 1.2,
      ease: [0.16, 1, 0.3, 1],
    }}
    whileHover={{ scale: 1.15 }}
    style={{
      display: 'inline-block',
      /* Sized to the cap-height of Instrument Serif (~0.7em), with a tiny
         negative vertical-align so it sits centered with the capital
         letters rather than on the baseline. */
      width: '0.72em',
      height: '0.72em',
      verticalAlign: '0.14em',
      /* The previous word already adds margin-right: 0.28em, so we use a
         small negative left margin to even out the visible whitespace on
         both sides of the asterisk. */
      margin: '0 0.18em 0 -0.10em',
      color: 'var(--brand)',
      lineHeight: 0,
      cursor: 'default',
      willChange: 'transform',
    }}
  >
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
      style={{ display: 'inline-block', lineHeight: 0 }}
    >
      <LogoMark size="100%" color="currentColor" />
    </motion.span>
  </motion.span>
);

/* Dot grid that lives in the negative space around the headline. The
   mask combines a radial cutout (so the dots stay clear of the
   headline) with a top→bottom linear gradient so the field reads as a
   pronounced "floor" of texture beneath the hero copy and CTA buttons. */
const HeroDotGrid = () => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage:
        'radial-gradient(circle, rgba(40,38,32,0.55) 1.3px, transparent 1.7px)',
      backgroundSize: '24px 24px',
      maskImage:
        'linear-gradient(to bottom, transparent 0%, transparent 58%, rgba(0,0,0,0.35) 78%, black 100%)',
      WebkitMaskImage:
        'linear-gradient(to bottom, transparent 0%, transparent 58%, rgba(0,0,0,0.35) 78%, black 100%)',
      opacity: 1,
      pointerEvents: 'none',
    }}
  />
);

/* Slow-drifting brand asterisk used purely as decoration. Each instance
   spins on its own clock and orbits a small bobbing path so the field
   feels alive but not busy. Sizes/positions are passed in so the
   layout can scatter them deliberately. */
const FloatingMark = ({
  size,
  top,
  left,
  right,
  bottom,
  color = 'var(--brand)',
  spin = 30,
  drift = 14,
  driftDuration = 9,
  opacity = 0.18,
  delay = 0,
}) => (
  <motion.span
    aria-hidden
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{ opacity, scale: 1 }}
    transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
    style={{
      position: 'absolute',
      top, left, right, bottom,
      width: size,
      height: size,
      color,
      pointerEvents: 'none',
      lineHeight: 0,
      willChange: 'transform, opacity',
    }}
  >
    <motion.span
      animate={{
        y: [0, -drift, 0, drift * 0.6, 0],
        x: [0, drift * 0.5, 0, -drift * 0.4, 0],
      }}
      transition={{
        duration: driftDuration,
        ease: 'easeInOut',
        repeat: Infinity,
        delay: delay * 0.3,
      }}
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: spin, ease: 'linear', repeat: Infinity }}
        style={{ display: 'block', width: '100%', height: '100%', lineHeight: 0 }}
      >
        <LogoMark size="100%" color="currentColor" />
      </motion.span>
    </motion.span>
  </motion.span>
);

/* Soft, breathing glows that sit behind the hero — big saturated sage on
   the right, smaller warm amber on the lower left, plus a tiny bright
   accent. Out of phase so it never feels mechanical. */
const HeroGlow = () => (
  <>
    {/* Soft sage wash — top right */}
    <motion.div
      aria-hidden
      animate={{ scale: [1, 1.1, 1], opacity: [0.32, 0.5, 0.32] }}
      transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
      style={{
        position: 'absolute',
        top: '-12%',
        right: '-8%',
        width: 'clamp(420px, 58vw, 880px)',
        height: 'clamp(420px, 58vw, 880px)',
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 50% 50%, rgba(150,178,150,0.55) 0%, rgba(150,178,150,0.22) 35%, rgba(150,178,150,0) 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    />

    {/* Warm amber glow — bottom left, slightly more present */}
    <motion.div
      aria-hidden
      animate={{ scale: [1, 1.18, 1], opacity: [0.40, 0.62, 0.40] }}
      transition={{ duration: 9.5, ease: 'easeInOut', repeat: Infinity, delay: 2.2 }}
      style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-8%',
        width: 'clamp(360px, 46vw, 720px)',
        height: 'clamp(360px, 46vw, 720px)',
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 50% 50%, rgba(217,178,106,0.55) 0%, rgba(217,178,106,0.20) 38%, rgba(217,178,106,0) 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    />
  </>
);

/* Live "we're open" status dot — pulsing sage ring around a solid core.
   Replaces the Sparkles icon (felt too AI / cliché). */
const StatusDot = ({ size = 9, color = 'var(--brand)' }) => (
  <span
    style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      flexShrink: 0,
    }}
  >
    <motion.span
      aria-hidden
      animate={{ scale: [1, 2.6], opacity: [0.55, 0] }}
      transition={{ duration: 1.8, ease: 'easeOut', repeat: Infinity }}
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: color,
      }}
    />
    <span
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: '0 0 8px rgba(116,142,117,0.55)',
      }}
    />
  </span>
);

/* Each line can be:
   - a string ("Building brands &"), OR
   - an array of segments mixing strings and React elements
     (["websites that", <HeroInlineImage />, "actually grow."])
   This lets us drop an image between any two words. */
const SplitHeadline = ({ lines, italicWord, italicColor }) => {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.018, delayChildren: 0.05 } },
  };
  const child = {
    hidden: { y: '110%', opacity: 0 },
    show: { y: '0%', opacity: 1, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
  };

  const renderWord = (word, key) => {
    const isItalic =
      italicWord &&
      word.toLowerCase().replace(/[^a-z]/g, '') === italicWord.toLowerCase();
    return (
      <span
        key={key}
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          marginRight: '0.28em',
          overflow: 'hidden',
          paddingBottom: '0.08em',
          verticalAlign: 'baseline',
        }}
      >
        {Array.from(word).map((ch, ci) => (
          <motion.span
            key={`${key}-${ci}`}
            variants={child}
            style={{
              display: 'inline-block',
              fontFamily: isItalic ? 'var(--font-display)' : undefined,
              fontStyle: isItalic ? 'italic' : undefined,
              fontWeight: isItalic ? 400 : undefined,
              color: isItalic ? italicColor : undefined,
            }}
          >
            {ch}
          </motion.span>
        ))}
      </span>
    );
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="show"
      style={{ display: 'block' }}
    >
      {lines.map((line, li) => {
        const segments = Array.isArray(line) ? line : [line];
        return (
          <span
            key={li}
            style={{ display: 'block', paddingBottom: '0.06em' }}
          >
            {segments.map((seg, si) => {
              if (typeof seg === 'string') {
                return seg
                  .split(' ')
                  .filter(Boolean)
                  .map((word, wi) => renderWord(word, `${li}-${si}-${wi}`));
              }
              // React element (e.g. inline image) — render as-is
              return (
                <React.Fragment key={`${li}-${si}-el`}>{seg}</React.Fragment>
              );
            })}
          </span>
        );
      })}
    </motion.span>
  );
};

export const HeroHeader = () => {
  return (
    <section
      id="top"
      style={{
        position: 'relative',
        background: 'var(--bg)',
        color: 'var(--ink)',
        paddingTop: 'calc(var(--nav-h) + 80px)',
        paddingBottom: 'clamp(64px, 8vw, 120px)',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      {/* Background layers — order matters: glow → dot grid → drifting marks.
          All sit below the content via z-index on the .container wrapper. */}
      <HeroGlow />
      <HeroDotGrid />

      {/* Floating brand asterisks scattered through the negative space.
          Sizes, opacities, and orbit timings are deliberately desynced so
          the field never reads as a pattern. */}
      <FloatingMark
        size="clamp(120px, 14vw, 220px)"
        top="6%" right="6%"
        color="var(--brand)"
        spin={42} drift={22} driftDuration={13}
        opacity={0.10} delay={0.4}
      />
      <FloatingMark
        size="clamp(34px, 3.5vw, 56px)"
        top="18%" right="22%"
        color="var(--brand-2)"
        spin={28} drift={14} driftDuration={9}
        opacity={0.42} delay={0.7}
      />
      <FloatingMark
        size="clamp(60px, 7vw, 110px)"
        bottom="14%" right="12%"
        color="var(--brand)"
        spin={36} drift={18} driftDuration={11}
        opacity={0.18} delay={0.55}
      />
      <FloatingMark
        size="clamp(22px, 2.4vw, 34px)"
        bottom="32%" left="46%"
        color="var(--brand-2)"
        spin={20} drift={10} driftDuration={7.5}
        opacity={0.55} delay={0.9}
      />
      <FloatingMark
        size="clamp(80px, 9vw, 150px)"
        top="58%" left="-3%"
        color="var(--brand)"
        spin={50} drift={20} driftDuration={14}
        opacity={0.08} delay={0.5}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(40px, 6.6vw, 112px)',
            lineHeight: 0.98,
            letterSpacing: '-0.025em',
            color: 'var(--ink)',
            maxWidth: 1240,
          }}
        >
          <SplitHeadline
            lines={[
              ['Building', <HeroInlineMark key="hero-mark" />, 'brands &'],
              'websites that actually grow.',
            ]}
            italicWord="actually"
            italicColor="var(--brand)"
          />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            marginTop: 32,
            fontSize: 'clamp(15px, 1.2vw, 17px)',
            lineHeight: 1.55,
            color: 'var(--ink-2)',
            maxWidth: 460,
          }}
        >
          6POINT Designs is a small studio helping businesses build their brands &amp; websites — designed in-house, launched fast.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
        >
          <MagneticButton
            href="#contact"
            variant="primary"
            size="lg"
            icon={<ArrowRight size={16} />}
            strength={16}
          >
            Let's work together
          </MagneticButton>

          <motion.a
            href="#work"
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            style={{
              display: 'inline-flex', alignItems: 'stretch', borderRadius: 8, overflow: 'hidden',
              border: '1px solid var(--line)', background: 'var(--bg-elev)', boxShadow: 'var(--shadow-sm)',
              textDecoration: 'none',
            }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              fontSize: 13, fontWeight: 600, color: 'var(--ink)',
            }}>
              <StatusDot size={9} />
              Booking projects
              <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>for {new Date().getFullYear()}</span>
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', padding: '0 12px', background: 'var(--ink)',
              color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Open</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};
