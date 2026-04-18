import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight,
  Paintbrush, TrendingUp, Camera,
} from 'lucide-react';
import { LogoMark } from './Logo';
import { MagneticButton } from './MagneticButton';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/* Custom asterisk used as the Branding tile icon (mirrors Services.js) */
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

/* Per-service content. Each entry mirrors the tile's brand color so the
   detail page reads as the same product, not a generic template. */
const SERVICE_CONTENT = {
  branding: {
    title: 'Branding',
    eyebrow: 'Identity & Brand Systems',
    bg: 'var(--ink)',
    fg: '#fff',
    accent: '#D9B26A',
    Icon: SparkleMark,
    spin: true,
    lede: 'Brands that earn trust on the first scroll.',
    intro:
      "We shape how your business looks, sounds, and feels — from a single mark to a full identity system. Every choice is made on purpose, so your brand stays consistent everywhere it shows up: the website, the deck, the receipt, the packaging, the inbox.",
    deliverables: [
      'Logo & wordmark',
      'Color & typography systems',
      'Brand voice & messaging',
      'Brand guidelines (PDF + Figma)',
      'Stationery & social templates',
      'Asset library handoff',
    ],
    process: [
      { step: 'Discovery',  copy: 'We dig into your audience, market, and goals so the brand has somewhere to stand. Stakeholder interviews, competitive teardown, positioning statement.' },
      { step: 'Concept',    copy: '2–3 distinct directions, each with a real point of view — not safe variations of the same idea. Mood, voice, type, and color come together as one proposal.' },
      { step: 'Refine',     copy: 'Pick a direction, then we sharpen color, type, motion, and voice into a cohesive system. Every component documented, every edge case considered.' },
      { step: 'Deliver',    copy: 'You get a documented system + every file you need to roll it out across every channel. PDF guidelines, Figma library, exported asset pack.' },
    ],
    timeline: '4–6 weeks',
    starting: 'Contact Sales',
    nextLabel: 'Web Design',
    nextSlug: 'web-design',
  },

  'web-design': {
    title: 'Web Design',
    eyebrow: 'Web Design & Build',
    bg: '#2563EB',
    fg: '#fff',
    accent: '#FFE08A',
    Icon: ({ size }) => <Paintbrush size={size} strokeWidth={1.8} />,
    lede: "Sites that don\u2019t just look good — they earn revenue.",
    intro:
      'Beautiful, fast, conversion-focused websites — designed and built end-to-end. Every page earns its place. We design in the browser, not in static mockups, so what you see in the demo is what your customers actually get.',
    deliverables: [
      'UX research & sitemap',
      'Custom UI design in Figma',
      'Responsive build (Webflow, Next.js, or React)',
      'CMS integration & training',
      'Performance & SEO baseline',
      'Analytics + heatmap setup',
    ],
    process: [
      { step: 'Discovery', copy: 'Audience, goals, KPIs, content audit. We figure out what the site actually has to do before we touch a pixel.' },
      { step: 'Design',    copy: 'Wireframes → high-fidelity comps → motion. Reviewed in real browser frames, not flat artboards, so feedback is tied to reality.' },
      { step: 'Build',     copy: 'Hand-coded or Webflow — your call. Component-based, accessible, lightning fast. Every page hits Lighthouse green.' },
      { step: 'Launch',    copy: 'QA, content load, redirects, analytics. We push it live with you, not at you, and stay on for the first two weeks of monitoring.' },
      { step: 'Track',     copy: 'You get your own client dashboard to watch the site work in real time — traffic, top pages, conversions, form submissions, and weekly performance trends, all in one place. No digging through GA4 tabs, no waiting on a monthly report.' },
    ],
    timeline: '4–10 weeks',
    starting: 'Contact Sales',
    nextLabel: 'Growth Strategy',
    nextSlug: 'growth-strategy',
  },

  'growth-strategy': {
    title: 'Growth Strategy',
    eyebrow: 'Growth & Performance',
    bg: 'var(--brand)',
    fg: '#fff',
    accent: '#FFE08A',
    Icon: ({ size }) => <TrendingUp size={size} strokeWidth={2} />,
    lede: 'Shipping more, getting paid more.',
    intro:
      'Marketing systems, funnel design, and growth playbooks that turn traffic into customers. We treat growth like product — measurable, iterative, and tied to revenue, not vanity metrics.',
    deliverables: [
      'Funnel & conversion audit',
      'High-converting landing pages',
      'Email & SMS automation flows',
      'Paid ads strategy (Meta, Google, TikTok)',
      'Lifecycle messaging & retention',
      'Reporting dashboards',
    ],
    process: [
      { step: 'Audit',     copy: 'Where the leaks are, where the upside is. Data first, opinions second. We benchmark every step of the funnel.' },
      { step: 'Strategy',  copy: 'A 90-day plan with bets ranked by impact and effort. No 50-page decks — just the moves that matter, in order.' },
      { step: 'Implement', copy: 'We build the assets, ship the campaigns, and wire the tracking. End-to-end execution, not just slide consulting.' },
      { step: 'Optimize',  copy: 'Weekly review, monthly recalibration. Keep what\u2019s working, kill what isn\u2019t, and double down where the math says.' },
    ],
    timeline: 'Ongoing or 90-day sprints',
    starting: 'Contact Sales',
    nextLabel: 'Social Media',
    nextSlug: 'social-media',
  },

  'social-media': {
    title: 'Social Media',
    eyebrow: 'Content & Community',
    bg: 'var(--brand-2)',
    fg: '#1A1500',
    accent: '#0B0B0C',
    Icon: ({ size }) => <Camera size={size} strokeWidth={1.8} />,
    lede: 'Show up everywhere your customers already are.',
    intro:
      'Content systems and campaigns that build community and drive sales — across every platform that matters. We make work that earns the scroll, not just fills the feed.',
    deliverables: [
      'Content strategy & pillars',
      'Monthly content calendar',
      'Reels, shorts & long-form video',
      'Static + carousel design',
      'Community management',
      'Performance reporting',
    ],
    process: [
      { step: 'Audit',     copy: 'What\u2019s working, what isn\u2019t, what your audience actually wants to see. Honest read of every channel.' },
      { step: 'Plan',      copy: 'Content pillars, voice, visual system, monthly calendar. Built around your business goals, not trends for trends\u2019 sake.' },
      { step: 'Create',    copy: 'In-house production. Photo, video, copy, editing — we ship the assets and own the quality bar.' },
      { step: 'Measure',   copy: 'Reach, engagement, conversion. Adjust the mix every month based on what the data is telling us.' },
    ],
    timeline: 'Monthly retainer',
    starting: 'Contact Sales',
    nextLabel: 'Branding',
    nextSlug: 'branding',
  },
};

/* ─────────────────────────── Scroll-reveal copy ───────────────────────────
   Splits a paragraph into words and ties each word's opacity + tiny lift
   to the section's scroll progress. As you scroll past the paragraph, the
   text "fills in" word by word — same trick as Apple's product pages. */
const Word = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0.18, 1]);
  const y = useTransform(progress, range, [6, 0]);
  return (
    <motion.span
      style={{
        opacity,
        y,
        display: 'inline-block',
        marginRight: '0.28em',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </motion.span>
  );
};

const ScrollRevealText = ({ text, style }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 85%', 'end 55%'],
  });
  const words = text.split(' ');
  return (
    <p ref={ref} style={style}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = Math.min(1, start + 1.6 / words.length);
        return (
          <Word key={`${word}-${i}`} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
};

/* ─────────────────────────────── Hero ──────────────────────────────────── */

const ServiceHero = ({ s }) => {
  const Icon = s.Icon;
  /* Watermark always tinted in the service's brand color — for Branding
     this resolves to ink (black), giving a smoky charcoal asterisk on
     the cream page; for the others it picks up the service hue. */
  const watermarkColor = s.bg;

  return (
    <header
      className="service-hero"
      style={{
        position: 'relative',
        padding: 'clamp(96px, 11vw, 180px) 0 clamp(56px, 7vw, 96px)',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      {/* ── The single background logo — large, faint, slowly rotating,
            anchored to the top-right of the page. This is the only
            decorative brand mark on the page; everything else is content.
            Opacity is tuned per-page: black (Branding) needs a much lower
            alpha than the lighter brand colors to read as a subtle wash
            instead of a solid silhouette. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: 'clamp(-160px, -10vw, -80px)',
          right: 'clamp(-200px, -12vw, -100px)',
          width: 'clamp(440px, 60vw, 820px)',
          height: 'clamp(440px, 60vw, 820px)',
          color: watermarkColor,
          opacity: s.bg === 'var(--ink)' ? 0.05 : 0.09,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 90, ease: 'linear', repeat: Infinity }}
          style={{ width: '100%', height: '100%' }}
        >
          <LogoMark size="100%" color="currentColor" />
        </motion.div>
      </motion.div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow"
          style={{ marginBottom: 28 }}
        >
          {s.eyebrow}
        </motion.p>

        <div
          className="service-hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, 1fr)',
            gap: 'clamp(24px, 4vw, 56px)',
            alignItems: 'center',
          }}
        >
          {/* Brand-colored swatch with the service icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18, mass: 0.7, delay: 0.05 }}
            style={{
              width: 'clamp(120px, 14vw, 200px)',
              height: 'clamp(120px, 14vw, 200px)',
              background: s.bg,
              color: s.fg,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 22px 50px rgba(11,11,12,0.18)',
            }}
          >
            {s.spin ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 7, ease: 'linear', repeat: Infinity }}
                style={{ display: 'inline-flex', width: '50%', height: '50%' }}
              >
                <Icon size="100%" />
              </motion.span>
            ) : (
              <Icon size={64} />
            )}
          </motion.div>

          <div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'clamp(48px, 7.4vw, 104px)',
                lineHeight: 0.98,
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
              }}
            >
              {s.title}
              <span style={{ color: s.bg === 'var(--ink)' ? 'var(--brand-2)' : s.bg }}>.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                margin: '20px 0 0',
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 'clamp(20px, 2.2vw, 30px)',
                lineHeight: 1.3,
                color: 'var(--ink-2)',
                maxWidth: 640,
              }}
            >
              {s.lede}
            </motion.p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .service-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </header>
  );
};

/* ─────────────────────────────── Body ──────────────────────────────────── */

const ServiceBody = ({ s }) => {
  const accent = s.bg === 'var(--ink)' ? 'var(--brand-2)' : s.bg;
  return (
    <section
      style={{
        background: 'var(--bg)',
        padding: 'clamp(40px, 6vw, 88px) 0 clamp(80px, 10vw, 140px)',
      }}
    >
      <div className="container">
        {/* ── What it is — large editorial paragraph that fills in on scroll ── */}
        <div
          style={{
            maxWidth: 940,
            marginBottom: 'clamp(72px, 9vw, 120px)',
          }}
        >
          <p className="eyebrow" style={{ marginBottom: 22 }}>What it is</p>
          <ScrollRevealText
            text={s.intro}
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'clamp(24px, 2.6vw, 40px)',
              lineHeight: 1.32,
              letterSpacing: '-0.005em',
              color: 'var(--ink)',
            }}
          />
        </div>

        {/* ── What's included ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2.6fr)',
            gap: 'clamp(24px, 4vw, 64px)',
            alignItems: 'flex-start',
            marginBottom: 'clamp(48px, 6vw, 80px)',
          }}
          className="included-grid"
        >
          <div>
            <p className="eyebrow" style={{ marginBottom: 14 }}>What's included</p>
            <h3
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(28px, 3.2vw, 44px)',
                lineHeight: 1.05,
                color: 'var(--ink)',
              }}
            >
              Inside the engagement.
            </h3>
          </div>

          <div
            className="deliverables-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 14,
            }}
          >
            {s.deliverables.map((d, i) => (
              <motion.div
                key={d}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-12%' }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -3 }}
                className="deliverable-card"
                style={{
                  position: 'relative',
                  background: 'var(--bg-elev)',
                  border: '1px solid var(--line)',
                  borderRadius: 14,
                  padding: '24px 26px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  overflow: 'hidden',
                  cursor: 'default',
                  transition: 'box-shadow .25s ease, border-color .25s ease',
                }}
              >
                {/* Top hairline tab in the service color */}
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: 56, height: 3,
                    background: accent,
                  }}
                />
                <span
                  style={{
                    flexShrink: 0,
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontSize: 30,
                    lineHeight: 1,
                    color: accent,
                    width: 38,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    lineHeight: 1.4,
                  }}
                >
                  {d}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Engagement facts strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="facts-strip"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 0,
            background: 'var(--bg-soft)',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid var(--line)',
          }}
        >
          {[
            { label: 'Discipline', value: s.eyebrow },
            { label: 'Timeline',   value: s.timeline },
            { label: 'Investment', value: s.starting },
          ].map((row, i) => (
            <div
              key={row.label}
              style={{
                padding: 'clamp(22px, 3vw, 32px)',
                borderRight: i < 2 ? '1px solid var(--line)' : 'none',
              }}
            >
              <p className="eyebrow" style={{ margin: '0 0 10px' }}>{row.label}</p>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 'clamp(22px, 2.2vw, 32px)',
                  lineHeight: 1.15,
                  color: 'var(--ink)',
                }}
              >
                {row.value}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .included-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .deliverables-grid { grid-template-columns: 1fr !important; }
          .facts-strip { grid-template-columns: 1fr !important; }
          .facts-strip > div { border-right: none !important; border-bottom: 1px solid var(--line); }
          .facts-strip > div:last-child { border-bottom: none; }
        }
        .deliverable-card:hover {
          border-color: rgba(11,11,12,0.18) !important;
          box-shadow: 0 18px 40px rgba(11,11,12,0.06);
        }
      `}</style>
    </section>
  );
};

/* ─────────────────────────── Process strip ───────────────────────────────
   Compact, refined four-step rundown. Replaces an earlier "giant italic
   numbers + vertical timeline" treatment that read as obnoxious next to
   the rest of the page. Now: a quiet editorial table of stages — small
   numeral, italic step name, one-paragraph description, hairline rules
   between rows. Reveals subtly on scroll. */

const ProcessRow = ({ index, step, copy, accent, isLast }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-12%' }}
    transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    className="process-row"
    style={{
      display: 'grid',
      gridTemplateColumns: 'clamp(56px, 6vw, 88px) clamp(140px, 18vw, 220px) minmax(0, 1fr)',
      gap: 'clamp(20px, 3vw, 40px)',
      alignItems: 'baseline',
      padding: 'clamp(22px, 3vw, 32px) 0',
      borderBottom: isLast ? 'none' : '1px solid var(--line)',
    }}
  >
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 'clamp(22px, 2vw, 30px)',
        lineHeight: 1,
        color: accent,
        letterSpacing: '-0.02em',
      }}
    >
      {String(index + 1).padStart(2, '0')}
    </span>
    <h3
      style={{
        margin: 0,
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 'clamp(22px, 2vw, 30px)',
        lineHeight: 1.1,
        letterSpacing: '-0.012em',
        color: 'var(--ink)',
      }}
    >
      {step}
    </h3>
    <p
      style={{
        margin: 0,
        fontSize: 15,
        lineHeight: 1.6,
        color: 'var(--ink-2)',
        maxWidth: 620,
      }}
    >
      {copy}
    </p>

    <style>{`
      @media (max-width: 720px) {
        .process-row {
          grid-template-columns: clamp(40px, 8vw, 56px) minmax(0, 1fr) !important;
          gap: 8px 18px !important;
        }
        .process-row > p {
          grid-column: 2 !important;
          margin-top: 6px !important;
        }
      }
    `}</style>
  </motion.div>
);

const ServiceProcess = ({ s }) => {
  const accent = s.bg === 'var(--ink)' ? 'var(--brand-2)' : s.bg;
  return (
    <section
      style={{
        background: 'var(--bg)',
        padding: 'clamp(56px, 7vw, 96px) 0 clamp(72px, 9vw, 120px)',
      }}
    >
      <div className="container">
        <div
          className="process-header"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 'clamp(24px, 4vw, 64px)',
            alignItems: 'flex-end',
            marginBottom: 'clamp(28px, 4vw, 48px)',
          }}
        >
          <div>
            <p className="eyebrow" style={{ marginBottom: 14 }}>The process</p>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'clamp(34px, 4.4vw, 56px)',
                lineHeight: 1.02,
                letterSpacing: '-0.015em',
                color: 'var(--ink)',
              }}
            >
              How we <span style={{ fontStyle: 'italic' }}>work.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.6,
              color: 'var(--ink-3)',
              maxWidth: 440,
            }}
          >
            Four stages, no surprises — the rhythm we use on every{' '}
            {s.title.toLowerCase()} engagement.
          </motion.p>
        </div>

        <div style={{ borderTop: '1px solid var(--line)' }}>
          {s.process.map((p, i) => (
            <ProcessRow
              key={p.step}
              index={i}
              step={p.step}
              copy={p.copy}
              accent={accent}
              isLast={i === s.process.length - 1}
            />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .process-header { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

/* ─────────────────────────── CTA + cross-link ───────────────────────────
   Lightweight, light-themed close to the page. Replaces the earlier
   heavy black panel that competed with the (also dark) site footer.
   Now: a calm cream section with a centered editorial headline, a
   single primary action, and a discreet "Continue to next service"
   row. The transition into the dark site Footer below now reads as a
   deliberate descent rather than two adjacent dark blocks. */

const ServiceCTA = ({ s }) => {
  const accent = s.bg === 'var(--ink)' ? 'var(--brand-2)' : s.bg;
  const goNext = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.location.hash = `#service-${s.nextSlug}`;
  };
  const goContact = (e) => {
    e.preventDefault();
    window.location.hash = '#contact';
  };
  return (
    <section
      style={{
        background: 'var(--bg-soft)',
        padding: 'clamp(80px, 10vw, 140px) 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Single brand asterisk anchored bottom-right, matching the hero
          watermark — gives the page bookend symmetry without adding any
          additional logos. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          bottom: 'clamp(-180px, -12vw, -100px)',
          right: 'clamp(-200px, -12vw, -100px)',
          width: 'clamp(360px, 46vw, 620px)',
          height: 'clamp(360px, 46vw, 620px)',
          color: s.bg,
          opacity: s.bg === 'var(--ink)' ? 0.035 : 0.06,
          pointerEvents: 'none',
        }}
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 110, ease: 'linear', repeat: Infinity }}
          style={{ width: '100%', height: '100%' }}
        >
          <LogoMark size="100%" color="currentColor" />
        </motion.div>
      </motion.div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: 760 }}
        >
          <p className="eyebrow" style={{ marginBottom: 18 }}>Let's begin</p>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'clamp(42px, 5.6vw, 80px)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
            }}
          >
            Let's build your{' '}
            <span style={{ fontStyle: 'italic', color: accent }}>
              {s.title.toLowerCase()}
            </span>
            .
          </h2>
          <p
            style={{
              margin: '22px 0 36px',
              maxWidth: 560,
              color: 'var(--ink-2)',
              fontSize: 'clamp(16px, 1.25vw, 19px)',
              lineHeight: 1.6,
            }}
          >
            Tell us a little about your project and we'll respond within one
            business day with a fixed-price scope and a kickoff date.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
            <MagneticButton
              href="#contact"
              onClick={goContact}
              variant="primary"
              size="lg"
              strength={14}
              icon={<ArrowRight size={16} />}
            >
              Start a {s.title.toLowerCase()} project
            </MagneticButton>
            <a
              href="mailto:hello@6pointdesigns.com"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'var(--ink-2)', textDecoration: 'none',
                fontSize: 14, fontWeight: 600,
                padding: '12px 14px',
              }}
            >
              or email hello@6pointdesigns.com
              <ArrowUpRight size={14} />
            </a>
          </div>
        </motion.div>

        {/* Quiet next-service handoff at the bottom — single inline row,
            no big card. The cross-link is still there for browsing but
            doesn't compete with the primary CTA above. */}
        <motion.a
          href={`#service-${s.nextSlug}`}
          onClick={goNext}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ x: 4 }}
          style={{
            marginTop: 'clamp(56px, 7vw, 88px)',
            paddingTop: 'clamp(28px, 3vw, 36px)',
            borderTop: '1px solid var(--line)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 18,
            color: 'var(--ink)',
            textDecoration: 'none',
          }}
          aria-label={`Continue to ${s.nextLabel}`}
        >
          <span
            style={{
              fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: 'var(--ink-3)',
            }}
          >
            Up next
          </span>
          <span style={{ color: 'var(--ink-3)' }}>—</span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(22px, 2.2vw, 32px)',
              lineHeight: 1,
              color: 'var(--ink)',
            }}
          >
            {s.nextLabel}
          </span>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center',
              color: accent,
            }}
          >
            <ArrowUpRight size={20} strokeWidth={2.2} />
          </span>
        </motion.a>
      </div>
    </section>
  );
};

/* ─────────────────────────── Top-level page ─────────────────────────── */

export const ServicePage = ({ slug }) => {
  const s = SERVICE_CONTENT[slug];

  /* Snap to the top of the new page BEFORE the first paint so the user
     never sees the previous scroll position bleeding into the new view.
     Belt + suspenders against the home page's smooth-scroll engine. */
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [slug]);

  /* Defensive second pass after mount in case any layout effect or
     intersection observer nudged the position back. */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  if (!s) {
    return (
      <div style={{ padding: 80, textAlign: 'center' }}>
        <h1>Service not found</h1>
        <a
          href="#services"
          onClick={(e) => { e.preventDefault(); window.location.hash = '#services'; }}
        >
          ← Back to services
        </a>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <Navbar />
      <main>
        <ServiceHero    s={s} />
        <ServiceBody    s={s} />
        <ServiceProcess s={s} />
        <ServiceCTA     s={s} />
      </main>
      <Footer />
    </div>
  );
};
