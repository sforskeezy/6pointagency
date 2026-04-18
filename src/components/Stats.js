import React, { useEffect, useRef } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';

/* Counts from 0 → value once the stat scrolls into view. Locale-formats so
   2563 reads as "2,563". Triggers once via useInView. */
const Counter = ({ value, suffix = '', prefix = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) => {
    return prefix + Math.floor(v).toLocaleString() + suffix;
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, value, {
      duration: 2.1,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, value, motionVal]);

  return (
    <motion.span ref={ref} style={{ display: 'inline-block' }}>
      {display}
    </motion.span>
  );
};

const STATS = [
  { value: 98,   suffix: '%', label: 'Client success rate' },
  { value: 2563, suffix: '',  label: 'Cups of coffee chugged' },
  { value: 5,    suffix: '',  label: 'Projects crushed', flourish: '(and counting!)' },
];

const StatItem = ({ stat, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-15%' }}
    transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '0 clamp(16px, 2vw, 32px)',
    }}
  >
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.05 + index * 0.12 }}
      whileHover={{ scale: 1.03 }}
      style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 900,
        fontSize: 'clamp(64px, 9vw, 144px)',
        lineHeight: 0.95,
        letterSpacing: '-0.045em',
        color: 'var(--brand)',
        cursor: 'default',
      }}
    >
      <Counter value={stat.value} suffix={stat.suffix} />
    </motion.div>

    <motion.p
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.55, delay: 0.45 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{
        margin: '18px 0 0',
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: 'clamp(11px, 0.85vw, 13px)',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--ink-2)',
        lineHeight: 1.4,
      }}
    >
      {stat.label}
      {stat.flourish && (
        <>
          {' '}
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '1.25em',
              letterSpacing: '-0.005em',
              textTransform: 'none',
              color: 'var(--brand-2)',
              marginLeft: 2,
            }}
          >
            {stat.flourish}
          </span>
        </>
      )}
    </motion.p>
  </motion.div>
);

const Divider = ({ index }) => (
  <motion.span
    aria-hidden
    initial={{ scaleY: 0, opacity: 0 }}
    whileInView={{ scaleY: 1, opacity: 1 }}
    viewport={{ once: true, margin: '-15%' }}
    transition={{ duration: 0.55, delay: 0.2 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    style={{
      width: 1,
      alignSelf: 'stretch',
      background: 'var(--line-strong)',
      transformOrigin: 'center',
      flexShrink: 0,
    }}
    className="stat-divider"
  />
);

export const Stats = () => {
  return (
    <section
      aria-label="Studio numbers"
      style={{
        background: 'var(--bg)',
        padding: 'clamp(72px, 10vw, 128px) 0',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div className="container">
        <div
          className="stats-row"
          style={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: 'clamp(8px, 1vw, 16px)',
          }}
        >
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              <StatItem stat={s} index={i} />
              {i < STATS.length - 1 && <Divider index={i} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .stats-row {
            flex-direction: column !important;
            gap: 0 !important;
          }
          .stat-divider {
            width: 100% !important;
            height: 1px !important;
            margin: 32px 0 !important;
          }
        }
      `}</style>
    </section>
  );
};
