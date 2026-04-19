import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, User, Building2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { MagneticButton } from './MagneticButton';

const INTENTS = [
  { id: 'project', label: 'Start a project' },
  { id: 'pricing', label: 'Get pricing' },
  { id: 'hello',   label: 'Say hello' },
];

const SERVICE_OPTIONS = [
  'Branding',
  'Web Design',
  'Growth Strategy',
  'Social Media',
  'SEO',
  'Ongoing Support',
  'Something else',
];
const BUDGET_OPTIONS = ['Under $2k', '$2k – $5k', '$5k – $10k', '$10k – $25k', '$25k+', 'Monthly retainer'];
const STEP_LABELS = [
  { title: 'First, tell us a little about yourself.' },
  { title: 'Thanks! Now, how can we help? *', sub: '(Choose all that apply)' },
  { title: 'Tell us more about the project.' },
];

export const Contact = () => {
  const createSubmission = useMutation(api.submissions.create);
  const [intent, setIntent] = useState('project');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', company: '', email: '',
    services: [], budget: BUDGET_OPTIONS[1], message: '',
  });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleService = (svc) =>
    setForm((f) => ({
      ...f,
      services: f.services.includes(svc)
        ? f.services.filter((s) => s !== svc)
        : [...f.services, svc],
    }));

  const canAdvance = (() => {
    if (step === 0) return form.name.trim() && form.company.trim();
    if (step === 1) return form.services.length > 0;
    if (step === 2)
      return (
        form.email.trim() &&
        /\S+@\S+\.\S+/.test(form.email) &&
        form.message.trim().length > 4
      );
    return false;
  })();

  const totalSteps = 3;
  const progress = (step + 1) / totalSteps;

  const next = () => {
    if (!canAdvance) return;
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else submit();
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    setStatus('sending');
    setErrorMsg('');

    try {
      /* Persist to Convex so the admin dashboard can show real
         submissions. The legacy `/api/send-email` Express endpoint
         is intentionally retired here — admins read everything from
         the Convex `submissions` table going forward. */
      await createSubmission({
        name:      form.name,
        company:   form.company,
        email:     form.email,
        services:  form.services,
        budget:    form.budget,
        message:   form.message,
        intent,
        source:    'home_contact',
        referrer:  typeof document !== 'undefined' ? document.referrer || undefined : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      });
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err?.message ||
          'Something went wrong. Please try again or email us directly.',
      );
    }
  };

  return (
    <section id="contact" className="section" style={{ background: 'var(--bg)' }}>
      <div className="container">
        <div
          className="contact-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.25fr)',
            gap: 56,
            alignItems: 'flex-start',
          }}
        >
          <div className="contact-left">
            <h2 className="h2 contact-heading" style={{ margin: 0 }}>
              Ready to go? <span className="italic-display">Let us know.</span>
            </h2>

            <div role="tablist" style={{ display: 'flex', gap: 8, marginTop: 28, flexWrap: 'wrap' }}>
              {INTENTS.map((opt) => {
                const active = intent === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setIntent(opt.id)}
                    layout
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic',
                      fontSize: 16, padding: '6px 14px', borderRadius: 4,
                      border: '1px solid var(--line)',
                      background: active ? 'var(--ink)' : 'var(--bg-elev)',
                      color: active ? '#fff' : 'var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>

            <p className="contact-blurb" style={{ marginTop: 22, fontSize: 16, lineHeight: 1.65, color: 'var(--ink-2)', maxWidth: 420 }}>
              Send us some information about your project using the form to start a
              conversation, inquire about pricing, or just to say hello.
            </p>

            <div className="contact-cta-row" style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <MagneticButton href="mailto:hello@6pointdesigns.com" variant="primary" size="md" strength={10} icon={<ArrowRight size={14} />} style={{ borderRadius: 4 }}>
                <span className="contact-cta-full">hello@6pointdesigns.com</span>
                <span className="contact-cta-short">Email us</span>
              </MagneticButton>
              <MagneticButton href="tel:+18036695425" variant="outline" size="md" strength={10} icon={<ArrowRight size={14} />} style={{ borderRadius: 4 }}>
                <span className="contact-cta-full">(803) 669-5425</span>
                <span className="contact-cta-short">Call us</span>
              </MagneticButton>
            </div>
          </div>

          <div>
            <div
              style={{
                position: 'relative', background: 'var(--bg-elev)',
                border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)',
                padding: 36, boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
              }}
            >
              <div aria-hidden style={{
                position: 'absolute', top: 0, left: 0, height: 3,
                width: `${progress * 100}%`, background: 'var(--accent)', transition: 'width .35s ease',
              }} />

              {status === 'sent' ? (
                <SuccessBlock name={form.name} />
              ) : (
                <>
                  <div style={{ minHeight: 220 }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <h3 style={{
                          fontFamily: 'var(--font-display)', fontWeight: 400,
                          fontSize: 'clamp(24px, 2.4vw, 32px)', letterSpacing: '-0.01em',
                          margin: 0, color: 'var(--ink)',
                        }}>
                          {STEP_LABELS[step].title}
                        </h3>
                        <p style={{ margin: '6px 0 22px', fontSize: 14, color: 'var(--ink-3)' }}>
                          {STEP_LABELS[step].sub
                            ? STEP_LABELS[step].sub
                            : `Step ${step + 1} of ${totalSteps}`}
                        </p>

                        {step === 0 && (
                          <div className="step-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <IconInput
                              icon={<User size={16} strokeWidth={2.2} />}
                              placeholder="First & Last Name *"
                              value={form.name}
                              onChange={update('name')}
                              autoComplete="name"
                            />
                            <IconInput
                              icon={<Building2 size={16} strokeWidth={2.2} />}
                              placeholder="Company *"
                              value={form.company}
                              onChange={update('company')}
                              autoComplete="organization"
                            />
                          </div>
                        )}
                        {step === 1 && (
                          <ServiceGrid
                            options={SERVICE_OPTIONS}
                            selected={form.services}
                            onToggle={toggleService}
                          />
                        )}
                        {step === 2 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div className="step-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <input className="input" type="email" placeholder="Email *" value={form.email} onChange={update('email')} autoComplete="email" />
                              <select className="select" value={form.budget} onChange={update('budget')}>
                                {BUDGET_OPTIONS.map((o) => (<option key={o}>{o}</option>))}
                              </select>
                            </div>
                            <textarea className="textarea" placeholder="A few sentences about your project, timeline, and goals…" value={form.message} onChange={update('message')} />
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div style={{ marginTop: 24, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    {step > 0 && (
                      <MagneticButton as="button" type="button" onClick={back} variant="outline" size="md" strength={8} style={{ borderRadius: 4 }}>
                        <ArrowLeft size={14} style={{ marginRight: 4 }} /> Back
                      </MagneticButton>
                    )}
                    <MagneticButton
                      as="button" type="button" onClick={next}
                      disabled={!canAdvance || status === 'sending'}
                      variant="primary" size="md" strength={canAdvance ? 12 : 0}
                      icon={<ArrowRight size={14} />}
                      style={{ borderRadius: 4, opacity: canAdvance ? 1 : 0.5 }}
                    >
                      {status === 'sending' ? 'Sending…' : step < totalSteps - 1 ? 'Next' : 'Send inquiry'}
                    </MagneticButton>

                    {status === 'error' && (
                      <span role="alert" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#9a3030', fontSize: 13 }}>
                        <AlertCircle size={14} /> {errorMsg}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            <p style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-4)', textAlign: 'right' }}>
              We reply within one business day. We never share your info.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 540px) {
          .step-grid { grid-template-columns: 1fr !important; }
          .service-grid { grid-template-columns: 1fr !important; }
        }

        /* Compact the left column on mobile so the headline + paragraph +
           email/phone CTAs don't feel like a wall of text. */
        .contact-cta-short { display: none; }
        .contact-cta-full  { display: inline; }
        @media (max-width: 640px) {
          .contact-heading {
            font-size: clamp(34px, 9vw, 48px) !important;
            line-height: 1.05 !important;
          }
          .contact-blurb { display: none; }
          .contact-cta-row { margin-top: 20px !important; gap: 8px !important; }
          .contact-cta-row > * { flex: 1 1 0; min-width: 0; }
          .contact-cta-full  { display: none; }
          .contact-cta-short { display: inline; }
        }

        /* Bring the icon to full ink color when its sibling input is focused
           so the field reads as "active" without any extra JS. */
        .icon-input:focus + span,
        div:has(.icon-input:focus) > span:first-child { color: var(--ink); }
      `}</style>
    </section>
  );
};

/* Pull the speaker's first name out of whatever they typed and tidy
   the casing so "jane DOE" still shows as "Jane". Falls back to the
   raw value (or "you" if empty) so the headline never reads weirdly. */
const firstName = (full) => {
  const raw = (full || '').trim();
  if (!raw) return 'you';
  const first = raw.split(/\s+/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
};

const SuccessBlock = ({ name }) => {
  const display = firstName(name);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, padding: '8px 0' }}>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        style={{
          width: 44, height: 44, borderRadius: 999, background: 'rgba(47,93,58,0.12)',
          color: 'var(--brand)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <CheckCircle2 size={22} />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(28px, 3vw, 40px)', lineHeight: 1.1, margin: 0, color: 'var(--ink)',
        }}
      >
        Nice to meet you, <span style={{ color: 'var(--brand)' }}>{display}</span>.
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.6, margin: 0, maxWidth: 460 }}
      >
        You'll hear from a real human at 6POINT within one business day. While you wait, take a look at our{' '}
        <a href="#work" style={{ textDecoration: 'underline' }}>recent work</a>.
      </motion.p>
    </div>
  );
};

/* Multi-select service grid. Renders the options in a 2-column layout
   with the last odd item (e.g. "Something else") spanning both
   columns to mirror the reference screenshot. Selected pills flip to
   the dark ink fill so they read as confidently chosen. */
const ServiceGrid = ({ options, selected, onToggle }) => (
  <div
    className="service-grid"
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
    }}
  >
    {options.map((opt, i) => {
      const isSelected = selected.includes(opt);
      const isLastOdd = i === options.length - 1 && options.length % 2 === 1;
      return (
        <motion.button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          aria-pressed={isSelected}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          style={{
            gridColumn: isLastOdd ? '1 / -1' : 'auto',
            padding: '14px 18px',
            borderRadius: 8,
            border: `1px solid ${isSelected ? 'var(--ink)' : 'var(--line)'}`,
            background: isSelected ? 'var(--ink)' : 'var(--bg)',
            color: isSelected ? '#fff' : 'var(--ink)',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            fontWeight: 500,
            textAlign: 'center',
            cursor: 'pointer',
            transition:
              'background .2s ease, color .2s ease, border-color .2s ease',
          }}
        >
          {opt}
        </motion.button>
      );
    })}
  </div>
);

/* Text input with a leading icon — visually matches the screenshot
   reference (icon flush left inside the field, text aligned to the
   icon's right). The icon stays neutral until focus, where it picks
   up the active ink color so the field feels tactile. */
const IconInput = ({ icon, ...inputProps }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ink-3)',
        pointerEvents: 'none',
        transition: 'color .2s ease',
      }}
    >
      {icon}
    </span>
    <input
      {...inputProps}
      className="input icon-input"
      style={{ paddingLeft: 40, ...(inputProps.style || {}) }}
    />
  </div>
);
