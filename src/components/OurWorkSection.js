import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const WORK = [
  {
    tag: 'Latest drop',
    title: 'Live build — site launch in motion',
    video: '/work/recent-launch.mp4',
    poster: '/work/recent-launch-poster.jpg',
    href: '#contact',
  },
  {
    tag: 'In-house',
    title: '6POINT — our own site, built from scratch',
    video: '/work/ecosystem.mp4',
    poster: '/work/ecosystem-poster.jpg',
    href: '#contact',
  },
  {
    tag: 'Wellness',
    title: 'Mint — full brand & ecommerce launch',
    image: '/work/mint-reference.webp',
    href: '#contact',
  },
];

const Card = ({ w, i }) => {
  const videoRef = useRef(null);

  /* Pause/resume the silent autoplay video on hover so it feels deliberate
     rather than constantly looping in the background. */
  const handleEnter = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  };
  const handleLeave = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  return (
    <motion.a
      href={w.href}
      className="hover-lift"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={w.video ? handleEnter : undefined}
      onMouseLeave={w.video ? handleLeave : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: 'var(--bg-elev)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '4 / 3',
          background: 'var(--bg-soft)',
          overflow: 'hidden',
        }}
      >
        {w.video ? (
          <motion.video
            ref={videoRef}
            src={w.video}
            poster={w.poster}
            muted
            loop
            playsInline
            preload="metadata"
            autoPlay
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <motion.img
            src={w.image}
            alt={w.title}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        <span
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            background: 'rgba(11,11,12,0.85)',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {w.tag}
        </span>
      </div>

      <div
        style={{
          padding: '4px 22px 22px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(20px, 1.7vw, 24px)',
            lineHeight: 1.25,
            letterSpacing: '-0.005em',
            fontWeight: 400,
            color: 'var(--ink)',
            maxWidth: '85%',
          }}
        >
          {w.title}
        </h3>
        <ArrowUpRight size={20} style={{ flexShrink: 0, marginTop: 4 }} />
      </div>
    </motion.a>
  );
};

export const OurWorkSection = () => {
  return (
    <section id="work" className="section" style={{ background: 'var(--bg-soft)' }}>
      <div className="container">
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div>
            <p className="eyebrow" style={{ marginBottom: 16 }}>Selected work</p>
            <h2 className="h2" style={{ margin: 0 }}>
              Recent <span className="italic-display">launches.</span>
            </h2>
          </div>
          <a
            href="#contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--ink)',
            }}
            className="anim-underline"
          >
            See more <ArrowUpRight size={14} />
          </a>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 22,
          }}
        >
          {WORK.map((w, i) => (
            <Card key={w.title} w={w} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
