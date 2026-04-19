import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ArrowUpRight } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

const FAQS = [
  {
    q: 'Why should I choose 6POINT Designs?',
    a: (
      <>
        <p>
          The world is full of great designers and developers, but we lead with
          one principle: <strong>real businesses, not portfolios</strong>. Every
          project is run by a senior team that has shipped real work for real
          companies — not juniors learning on your dime.
        </p>
        <p>
          You get a fixed-price quote after our discovery call, a 2-week launch
          window for most sites, and a real human reply within 24 hours, every
          time. If that sounds like the kind of partner you've been looking for,{' '}
          <a href="#contact" style={{ color: 'var(--ink)', fontWeight: 600 }}>
            let's talk
          </a>.
        </p>
      </>
    ),
  },
  {
    q: 'How long does a typical project take?',
    a: (
      <p>
        Most websites go live within <strong>2–4 weeks</strong> of kickoff. Full
        brand identity systems take 3–5 weeks. Growth strategy and social media
        engagements run on monthly cycles. We give you a real timeline before
        you sign anything — no vague "6–12 weeks" promises.
      </p>
    ),
  },
  {
    q: 'How much does a project cost?',
    a: (
      <p>
        Websites start around <strong>$3,500</strong>. Full brand identity
        starts at <strong>$2,800</strong>. Growth and social retainers run
        monthly based on scope. After a 20-minute discovery call we send back
        one fixed-price number — locked, no surprises, no hourly creep.
      </p>
    ),
  },
  {
    q: 'Do I own the work after it\'s delivered?',
    a: (
      <p>
        Yes. <strong>You own everything we create for you</strong> — files,
        logos, fonts (where licensed), source code, the whole thing. We hand
        over organized source files at the end of every engagement so nothing
        is locked behind us.
      </p>
    ),
  },
  {
    q: 'Do you offer ongoing support after launch?',
    a: (
      <p>
        Absolutely. After launch you can either book ad-hoc work as you need
        it, or pick up a <strong>monthly care plan</strong> that covers
        updates, hosting health, content tweaks, and a guaranteed 24-hour reply
        on anything urgent.
      </p>
    ),
  },
  {
    q: 'Can you redesign an existing brand or site?',
    a: (
      <p>
        Yes — most of our work is rebuilds. We start with an audit of what's
        working, what isn't, and what your customers are actually responding
        to, then design forward from there. You don't have to throw everything
        out to upgrade.
      </p>
    ),
  },
];

const FAQItem = ({ item, index, isOpen, onToggle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-8%' }}
    transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    style={{
      background: 'var(--bg-soft)',
      border: '1px solid var(--line)',
      borderRadius: 14,
      overflow: 'hidden',
    }}
  >
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      style={{
        all: 'unset',
        boxSizing: 'border-box',
        cursor: 'pointer',
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        padding: '22px 22px 22px 26px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 'clamp(15px, 1.15vw, 17px)',
          color: 'var(--ink)',
          lineHeight: 1.4,
          flex: 1,
        }}
      >
        {item.q}
      </span>

      <motion.span
        animate={{ rotate: isOpen ? 0 : 0, scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 8,
          background: 'var(--ink)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -2,
        }}
        aria-hidden
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'inline-flex' }}
            >
              <X size={16} strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'inline-flex' }}
            >
              <Plus size={16} strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <div
            style={{
              padding: '0 26px 26px',
              fontSize: 15,
              lineHeight: 1.65,
              color: 'var(--ink-2)',
              maxWidth: 640,
            }}
            className="faq-answer"
          >
            {item.a}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <style>{`
      .faq-answer p { margin: 0 0 12px; }
      .faq-answer p:last-child { margin-bottom: 0; }
    `}</style>
  </motion.div>
);

export const FAQ = () => {
  const [open, setOpen] = useState(-1);

  return (
    <section
      id="faq"
      style={{
        background: 'var(--bg)',
        padding: 'clamp(72px, 10vw, 140px) 0',
      }}
    >
      <div className="container">
        <div
          className="faq-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: 'clamp(32px, 5vw, 80px)',
            alignItems: 'flex-start',
          }}
        >
          {/* LEFT: accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((item, i) => (
              <FAQItem
                key={item.q}
                item={item}
                index={i}
                isOpen={open === i}
                onToggle={() => setOpen(open === i ? -1 : i)}
              />
            ))}
          </div>

          {/* RIGHT: heading + ctas (sticky on desktop) */}
          <div className="faq-side">
            <p className="eyebrow" style={{ marginBottom: 16 }}>FAQs</p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'clamp(40px, 5vw, 68px)',
                lineHeight: 1.0,
                letterSpacing: '-0.02em',
                color: 'var(--ink)',
              }}
            >
              Frequently asked{' '}
              <span className="italic-display" style={{ color: 'var(--brand)' }}>
                questions.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                marginTop: 22,
                marginBottom: 0,
                fontSize: 16,
                lineHeight: 1.6,
                color: 'var(--ink-2)',
                maxWidth: 420,
              }}
            >
              The most common questions we get from the businesses we work
              with. Don't see yours? Drop us a line and we'll answer same-day.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginTop: 28, display: 'inline-flex', flexWrap: 'wrap', gap: 10 }}
            >
              <MagneticButton
                href="#contact"
                variant="primary"
                size="md"
                strength={10}
                icon={<ArrowUpRight size={16} strokeWidth={2.5} />}
              >
                Contact us
              </MagneticButton>
              <MagneticButton
                href="mailto:hello@6pointdesigns.com"
                variant="outline"
                size="md"
                strength={10}
                icon={<ArrowUpRight size={16} strokeWidth={2.5} />}
              >
                Email us directly
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 961px) {
          .faq-side {
            position: sticky;
            top: 110px;
          }
        }
        @media (max-width: 960px) {
          .faq-grid {
            grid-template-columns: 1fr !important;
          }
          .faq-side {
            order: -1;
            margin-bottom: 8px;
          }
        }
      `}</style>
    </section>
  );
};
