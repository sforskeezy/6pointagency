import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { LogoMark } from './Logo';
import { MagneticButton } from './MagneticButton';

/* ─────────────────────────── Decorative pieces ─────────────────────────── */

/* Slowly rotating + bobbing brand asterisk used as wallpaper on the
   dark right panel. Same primitive used in the hero so the login
   feels visually continuous with the rest of the site. */
const FloatingMark = ({
  size, top, left, right, bottom,
  color = 'var(--brand)',
  spin = 36, drift = 14, driftDuration = 11,
  opacity = 0.16, delay = 0,
}) => (
  <motion.span
    aria-hidden
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{ opacity, scale: 1 }}
    transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
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
        duration: driftDuration, ease: 'easeInOut', repeat: Infinity,
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

/* Rotating "Welcome back." badge — mirror of the FullscreenMenu's
   talk badge but with login-specific copy and a softer scale. */
const WelcomeBadge = ({ size = 260 }) => {
  const r = size / 2 - 18;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative',
        width: size, height: size,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.svg
        width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
        style={{ position: 'absolute', inset: 0, willChange: 'transform' }}
      >
        <defs>
          <path
            id="welcome-circle"
            d={`M ${size / 2}, ${size / 2 - r}
               a ${r},${r} 0 1,1 -0.001,0`}
          />
        </defs>
        <text
          fill="rgba(255,255,255,0.85)"
          fontFamily="Instrument Serif, serif"
          fontStyle="italic"
          fontSize={size * 0.105}
          letterSpacing="2"
        >
          <textPath href="#welcome-circle" startOffset="0">
            Welcome back. · Welcome back. · Welcome back. ·
          </textPath>
        </text>
      </motion.svg>

      {/* Rotating brand mark in the center of the badge */}
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 18, ease: 'linear', repeat: Infinity }}
        style={{
          position: 'relative', display: 'inline-flex',
          width: size * 0.34, height: size * 0.34,
          color: 'var(--brand-2)', lineHeight: 0,
        }}
      >
        <LogoMark size="100%" color="currentColor" />
      </motion.span>
    </motion.div>
  );
};

/* Status dot — slowly cross-fades its color between the brand sage
   and brand amber so the "Client Portal" eyebrow has a living,
   breathing accent instead of a single static hue. The outward pulse
   ring tracks the same color as the core. */
const StatusDot = ({ size = 8 }) => {
  const SAGE  = '#748E75';
  const AMBER = '#D9B26A';
  return (
    <span style={{
      position: 'relative', display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center',
      width: size, height: size, flexShrink: 0,
    }}>
      <motion.span
        aria-hidden
        animate={{
          scale:      [1, 2.6],
          opacity:    [0.55, 0],
          background: [SAGE, AMBER],
        }}
        transition={{
          scale:      { duration: 1.8, ease: 'easeOut', repeat: Infinity },
          opacity:    { duration: 1.8, ease: 'easeOut', repeat: Infinity },
          background: { duration: 3.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' },
        }}
        style={{ position: 'absolute', inset: 0, borderRadius: '50%' }}
      />
      <motion.span
        animate={{
          background:  [SAGE, AMBER],
          boxShadow: [
            '0 0 8px rgba(116,142,117,0.6)',
            '0 0 10px rgba(217,178,106,0.65)',
          ],
        }}
        transition={{ duration: 3.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
        style={{
          position: 'relative', width: size, height: size, borderRadius: '50%',
        }}
      />
    </span>
  );
};

/* ─────────────────────────── Main page ─────────────────────────── */

export const ClientLogin = () => {
  const loginWithPassword = useMutation(api.users.loginWithPassword);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [focus, setFocus] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('checking');
    setErrorMsg('');

    const email = form.email.trim();
    const pw = form.password;

    if (!/\S+@\S+\.\S+/.test(email) || pw.length < 4) {
      setStatus('error');
      setErrorMsg('Hmm, that doesn\u2019t look right. Double-check your email and password.');
      return;
    }

    try {
      /* Real auth call — the Convex mutation seeds the bootstrap
         admin if needed, validates the password against the stored
         PBKDF2 hash, and on success returns a signed session token
         we store locally. The token (NOT the email) is what the
         dashboards use to identify and authorise the user. */
      const result = await loginWithPassword({ email, password: pw });
      if (!result?.ok) {
        setStatus('error');
        setErrorMsg(result?.error || 'Invalid email or password.');
        return;
      }
      try {
        window.localStorage.setItem('sessionToken', result.token);
        window.localStorage.setItem('clientEmail', result.user.email);
        window.localStorage.setItem('clientRole', result.user.role);
        // Dashboards still read clientEmail from sessionStorage for
        // personalisation; mirror it there for backwards compat.
        window.sessionStorage.setItem('clientEmail', result.user.email);
      } catch { /* storage may be blocked — dashboards handle fallback */ }

      setStatus('success');
      window.location.hash =
        result.user.role === 'admin' ? '#admin-dash' : '#client-dash';
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err?.message ||
          'Something went wrong signing you in. Please try again in a moment.',
      );
    }
  };

  return (
    <div className="login-page" style={styles.container}>
      {/* ── LEFT — form column ── */}
      <div style={styles.leftCol}>
        {/* Soft dot grid that fades up from the bottom — same pattern
            as the hero so the brand language carries through. */}
        <div aria-hidden style={styles.dotGrid} />

        {/* Top bar — back to home + status pill */}
        <div style={styles.topBar}>
          <motion.a
            href="#top"
            onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.scrollTo(0, 0); }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ x: -3 }}
            style={styles.backLink}
          >
            <ArrowLeft size={14} />
            <span>Back to site</span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={styles.brandPill}
            aria-label="6point.designs"
          >
            <span style={{ display: 'inline-flex', color: 'var(--brand)', lineHeight: 0 }}>
              <LogoMark size={16} color="currentColor" />
            </span>
          </motion.div>
        </div>

        {/* Centered form */}
        <div className="login-form-wrap" style={styles.formWrap}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={styles.formInner}
          >
            <div style={styles.eyebrow}>
              <StatusDot />
              <span>Client Portal</span>
            </div>

            <h1 style={styles.heading}>
              Welcome <span style={styles.headingItalic}>back.</span>
            </h1>

            <p style={styles.sub}>
              Sign in to view your project files, timelines, and updates from
              the 6POINT team.
            </p>

            <form onSubmit={onSubmit} style={styles.form}>
              {/* Email */}
              <label style={styles.fieldLabel}>
                <span style={styles.fieldLabelText}>Email</span>
                <div style={styles.fieldRow}>
                  <span style={{
                    ...styles.fieldIcon,
                    color: focus === 'email' ? 'var(--ink)' : 'var(--ink-3)',
                  }}>
                    <Mail size={16} strokeWidth={2.2} />
                  </span>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@studio.com"
                    value={form.email}
                    onChange={update('email')}
                    onFocus={() => setFocus('email')}
                    onBlur={() => setFocus(null)}
                    style={{
                      ...styles.input,
                      borderColor: focus === 'email' ? 'var(--ink)' : 'var(--line)',
                      boxShadow: focus === 'email' ? '0 0 0 3px rgba(116,142,117,0.18)' : 'none',
                    }}
                  />
                </div>
              </label>

              {/* Password */}
              <label style={styles.fieldLabel}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={styles.fieldLabelText}>Password</span>
                  <a
                    href="mailto:hello@6pointdesigns.com?subject=Password%20reset"
                    style={styles.forgotLink}
                  >
                    Forgot?
                  </a>
                </span>
                <div style={styles.fieldRow}>
                  <span style={{
                    ...styles.fieldIcon,
                    color: focus === 'pw' ? 'var(--ink)' : 'var(--ink-3)',
                  }}>
                    <Lock size={16} strokeWidth={2.2} />
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={update('password')}
                    onFocus={() => setFocus('pw')}
                    onBlur={() => setFocus(null)}
                    style={{
                      ...styles.input,
                      paddingRight: 44,
                      borderColor: focus === 'pw' ? 'var(--ink)' : 'var(--line)',
                      boxShadow: focus === 'pw' ? '0 0 0 3px rgba(116,142,117,0.18)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPw((v) => !v)}
                    style={styles.showPwBtn}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              {/* Error / status banner */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div
                    key="err"
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    style={styles.errorBanner}
                  >
                    {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <MagneticButton
                as="button"
                type="submit"
                variant="primary"
                size="lg"
                strength={12}
                icon={<ArrowRight size={16} />}
                disabled={status === 'checking'}
                style={{ width: '100%', justifyContent: 'center', borderRadius: 6 }}
              >
                {status === 'checking' ? 'Signing you in…' : 'Sign in'}
              </MagneticButton>
            </form>

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine} />
            </div>

            <a
              href="#contact"
              onClick={(e) => { e.preventDefault(); window.location.hash = '#contact'; }}
              style={styles.startProjectLink}
            >
              <span>New here? Start a project</span>
              <ArrowUpRight size={16} />
            </a>
          </motion.div>
        </div>

        {/* Bottom legal row */}
        <div style={styles.legalRow}>
          <span>© {new Date().getFullYear()} 6POINT Designs LLC.</span>
          <div style={{ display: 'inline-flex', gap: 14 }}>
            <a href="#privacy" style={styles.legalLink}>Privacy</a>
            <a href="#terms" style={styles.legalLink}>Terms</a>
          </div>
        </div>
      </div>

      {/* ── RIGHT — atmospheric brand panel ── */}
      <div className="login-right" style={styles.rightCol}>
        {/* Soft sage glow top-right */}
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.12, 1], opacity: [0.32, 0.55, 0.32] }}
          transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity }}
          style={styles.sageGlow}
        />
        {/* Warm amber glow bottom-left */}
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.18, 1], opacity: [0.30, 0.5, 0.30] }}
          transition={{ duration: 11, ease: 'easeInOut', repeat: Infinity, delay: 1.6 }}
          style={styles.amberGlow}
        />

        {/* Drifting brand asterisks scattered through the panel */}
        <FloatingMark
          size="clamp(120px, 16vw, 220px)" top="8%" left="-4%"
          color="var(--brand)" spin={48} drift={20} driftDuration={14}
          opacity={0.10} delay={0.4}
        />
        <FloatingMark
          size="clamp(38px, 4vw, 58px)" top="22%" right="14%"
          color="var(--brand-2)" spin={24} drift={14} driftDuration={9}
          opacity={0.55} delay={0.7}
        />
        <FloatingMark
          size="clamp(60px, 7vw, 110px)" bottom="18%" right="-3%"
          color="var(--brand)" spin={38} drift={18} driftDuration={12}
          opacity={0.18} delay={0.55}
        />
        <FloatingMark
          size="clamp(22px, 2.4vw, 32px)" bottom="36%" left="22%"
          color="var(--brand-2)" spin={20} drift={10} driftDuration={8}
          opacity={0.45} delay={0.9}
        />

        {/* Massive italic "6" watermark — sits at very low opacity
            and frames the layout from behind. */}
        <motion.span
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          transition={{ duration: 1.4, delay: 0.3 }}
          style={styles.watermark}
        >
          6
        </motion.span>

        {/* Centered welcome badge */}
        <div style={styles.badgeWrap}>
          <WelcomeBadge size={300} />
        </div>

      </div>

      {/* Inline responsive + tiny utility CSS scoped to this page */}
      <style>{`
        .login-page input::placeholder { color: var(--ink-4); }
        .login-page a:focus-visible,
        .login-page button:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
          border-radius: 4px;
        }

        @media (max-width: 880px) {
          .login-page { flex-direction: column !important; height: auto !important; min-height: 100vh; }
          .login-page > div { width: 100% !important; }
          .login-right {
            min-height: 280px !important;
            order: -1;
          }
          /* Give the form room to breathe under the top bar — without
             this the "Client Portal" eyebrow sits right beneath the
             "Back to site" pill on phones. */
          .login-page .login-form-wrap {
            padding-top: 48px !important;
            padding-bottom: 32px !important;
          }
        }
      `}</style>
    </div>
  );
};

/* ─────────────────────────── Styles ─────────────────────────── */

const styles = {
  container: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg)',
    color: 'var(--ink)',
    fontFamily: 'var(--font-sans)',
  },

  /* LEFT */
  leftCol: {
    position: 'relative',
    width: '52%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
    padding: 'clamp(24px, 3vw, 44px)',
    overflow: 'hidden',
  },
  dotGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'radial-gradient(circle, rgba(40,38,32,0.45) 1.2px, transparent 1.6px)',
    backgroundSize: '24px 24px',
    maskImage:
      'linear-gradient(to bottom, transparent 0%, transparent 55%, rgba(0,0,0,0.4) 80%, black 100%)',
    WebkitMaskImage:
      'linear-gradient(to bottom, transparent 0%, transparent 55%, rgba(0,0,0,0.4) 80%, black 100%)',
    pointerEvents: 'none',
  },
  topBar: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  backLink: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '8px 12px',
    fontSize: 13, fontWeight: 600, color: 'var(--ink-2)',
    background: 'var(--bg-elev)',
    border: '1px solid var(--line)',
    borderRadius: 999,
    textDecoration: 'none',
    transition: 'background .2s ease, color .2s ease',
  },
  brandPill: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36,
    background: 'var(--bg-elev)',
    border: '1px solid var(--line)',
    borderRadius: 999,
    color: 'var(--ink)',
  },

  formWrap: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formInner: {
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
  },
  eyebrow: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
    textTransform: 'uppercase', color: 'var(--ink-3)',
    marginBottom: 18,
  },
  heading: {
    margin: 0,
    fontFamily: 'var(--font-display)',
    fontWeight: 400,
    fontSize: 'clamp(40px, 5vw, 56px)',
    lineHeight: 1.0,
    letterSpacing: '-0.02em',
    color: 'var(--ink)',
  },
  headingItalic: {
    fontStyle: 'italic',
    color: 'var(--brand)',
  },
  sub: {
    margin: '14px 0 32px',
    fontSize: 15,
    lineHeight: 1.55,
    color: 'var(--ink-3)',
    maxWidth: 360,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  fieldLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  fieldLabelText: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--ink-2)',
    letterSpacing: '0.005em',
  },
  fieldRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  fieldIcon: {
    position: 'absolute',
    left: 14,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    transition: 'color .2s ease',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 40px',
    background: 'var(--bg-elev)',
    border: '1px solid var(--line)',
    borderRadius: 8,
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    color: 'var(--ink)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .2s ease, box-shadow .2s ease',
  },
  showPwBtn: {
    position: 'absolute',
    right: 10,
    width: 32, height: 32,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: 'var(--ink-3)',
    cursor: 'pointer',
    borderRadius: 4,
    transition: 'color .2s ease, background .2s ease',
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--ink-3)',
    textDecoration: 'none',
    transition: 'color .2s ease',
  },
  errorBanner: {
    overflow: 'hidden',
    background: 'rgba(154,48,48,0.06)',
    border: '1px solid rgba(154,48,48,0.18)',
    color: '#9a3030',
    fontSize: 13,
    lineHeight: 1.45,
    padding: '10px 12px',
    borderRadius: 8,
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '26px 0 18px',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'var(--line)',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--ink-4)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  startProjectLink: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 10,
    padding: '14px 16px',
    background: 'var(--bg-elev)',
    border: '1px solid var(--line)',
    borderRadius: 8,
    color: 'var(--ink)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    transition: 'background .2s ease, transform .2s ease, border-color .2s ease',
  },

  legalRow: {
    position: 'relative', zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
    color: 'var(--ink-4)',
    paddingTop: 16,
  },
  legalLink: {
    color: 'var(--ink-3)',
    textDecoration: 'none',
  },

  /* RIGHT */
  rightCol: {
    position: 'relative',
    width: '48%',
    height: '100%',
    overflow: 'hidden',
    background: 'var(--ink)',
    color: '#fff',
  },
  sageGlow: {
    position: 'absolute',
    top: '-15%', right: '-15%',
    width: 'clamp(380px, 60%, 700px)',
    height: 'clamp(380px, 60%, 700px)',
    borderRadius: '50%',
    background:
      'radial-gradient(circle at 50% 50%, rgba(116,142,117,0.55) 0%, rgba(116,142,117,0.18) 40%, rgba(116,142,117,0) 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  amberGlow: {
    position: 'absolute',
    bottom: '-20%', left: '-10%',
    width: 'clamp(360px, 55%, 640px)',
    height: 'clamp(360px, 55%, 640px)',
    borderRadius: '50%',
    background:
      'radial-gradient(circle at 50% 50%, rgba(217,178,106,0.45) 0%, rgba(217,178,106,0.16) 38%, rgba(217,178,106,0) 70%)',
    filter: 'blur(70px)',
    pointerEvents: 'none',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontWeight: 400,
    fontSize: 'clamp(420px, 60vw, 820px)',
    lineHeight: 0.8,
    color: '#fff',
    pointerEvents: 'none',
    zIndex: 1,
  },
  badgeWrap: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  rightFooter: {
    position: 'absolute',
    bottom: 'clamp(20px, 3vw, 36px)',
    left: 'clamp(20px, 3vw, 36px)',
    right: 'clamp(20px, 3vw, 36px)',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  rightFooterCopy: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.5,
    color: 'rgba(255,255,255,0.55)',
    maxWidth: 280,
  },
};
