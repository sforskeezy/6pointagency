import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { MagneticButton } from './MagneticButton';

export const ClientLogin = () => {
  const loginWithPassword = useMutation(api.users.loginWithPassword);
  const [form, setForm] = useState({ email: '', password: '' });
  const [focus, setFocus] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const goHome = (event) => {
    event.preventDefault();
    if (window.history && window.history.replaceState) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
      window.dispatchEvent(new Event('hashchange'));
    } else {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const goContact = (event) => {
    event.preventDefault();
    window.location.hash = '#contact';
    setTimeout(() => {
      document.querySelector('#contact')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus('checking');
    setErrorMsg('');

    const email = form.email.trim();
    const password = form.password;

    if (!/\S+@\S+\.\S+/.test(email) || password.length < 4) {
      setStatus('error');
      setErrorMsg("Double-check your email and password, then try again.");
      return;
    }

    try {
      const result = await loginWithPassword({ email, password });
      if (!result?.ok) {
        setStatus('error');
        setErrorMsg(result?.error || 'Invalid email or password.');
        return;
      }

      try {
        window.localStorage.setItem('sessionToken', result.token);
        window.localStorage.setItem('clientEmail', result.user.email);
        window.localStorage.setItem('clientRole', result.user.role);
        window.sessionStorage.setItem('clientEmail', result.user.email);
      } catch {
        /* Dashboards handle missing browser storage gracefully. */
      }

      setStatus('success');
      window.location.hash =
        result.user.role === 'admin' ? '#admin-dash' : '#client-dash';
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err?.message ||
          'Something went wrong signing you in. Please try again in a moment.'
      );
    }
  };

  return (
    <main className="login-page" style={styles.page}>
      <div aria-hidden style={styles.coolGlow} />
      <div aria-hidden style={styles.warmGlow} />

      <header style={styles.topbar}>
        <a href="#top" onClick={goHome} style={styles.topLink}>
          Back to site
        </a>
        <a href="#contact" onClick={goContact} style={styles.topLink}>
          Need access?
        </a>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={styles.card}
      >
        <p style={styles.eyebrow}>6POINT Designs</p>
        <h1 style={styles.title}>Sign in.</h1>
        <p style={styles.copy}>Use your client email and password to continue.</p>

        <form onSubmit={onSubmit} style={styles.form}>
          <label style={styles.fieldLabel}>
            <span style={styles.fieldLabelText}>Email</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={update('email')}
              onFocus={() => setFocus('email')}
              onBlur={() => setFocus(null)}
              style={{
                ...styles.input,
                borderColor: focus === 'email' ? 'var(--ink)' : 'var(--line)',
                boxShadow: focus === 'email' ? '0 0 0 4px rgba(116,142,117,0.13)' : 'none',
              }}
            />
          </label>

          <label style={styles.fieldLabel}>
            <span style={styles.passwordRow}>
              <span style={styles.fieldLabelText}>Password</span>
              <a
                href="mailto:hello@6pointdesigns.com?subject=Password%20reset"
                style={styles.forgotLink}
              >
                Forgot?
              </a>
            </span>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={form.password}
              onChange={update('password')}
              onFocus={() => setFocus('password')}
              onBlur={() => setFocus(null)}
              style={{
                ...styles.input,
                borderColor: focus === 'password' ? 'var(--ink)' : 'var(--line)',
                boxShadow: focus === 'password' ? '0 0 0 4px rgba(116,142,117,0.13)' : 'none',
              }}
            />
          </label>

          <AnimatePresence>
            {status === 'error' && (
              <motion.div
                key="err"
                role="alert"
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
            strength={10}
            fullWidth
            disabled={status === 'checking'}
            style={{
              borderRadius: 10,
              opacity: status === 'checking' ? 0.72 : 1,
            }}
          >
            {status === 'checking' ? 'Signing in...' : 'Sign in'}
          </MagneticButton>
        </form>

        <p style={styles.footerNote}>
          New client?{' '}
          <a href="#contact" onClick={goContact} style={styles.inlineLink}>
            Start a project
          </a>
        </p>
      </motion.section>

      <footer style={styles.legalRow}>
        <span>© {new Date().getFullYear()} 6POINT Designs LLC.</span>
        <span style={styles.legalLinks}>
          <a href="#privacy" style={styles.legalLink}>Privacy</a>
          <a href="#terms" style={styles.legalLink}>Terms</a>
        </span>
      </footer>

      <style>{`
        .login-page input::placeholder { color: var(--ink-4); }
        .login-page a:focus-visible,
        .login-page button:focus-visible,
        .login-page input:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 3px;
        }
        @media (max-width: 640px) {
          .login-page {
            padding: 96px 20px 28px !important;
            align-items: stretch !important;
          }
          .login-page > section {
            padding: 28px !important;
          }
          .login-page header,
          .login-page footer {
            left: 20px !important;
            right: 20px !important;
          }
          .login-page footer {
            position: relative !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
            margin-top: 28px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </main>
  );
};

const styles = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '96px 24px',
    overflow: 'hidden',
    color: 'var(--ink)',
    fontFamily: 'var(--font-sans)',
    background:
      'linear-gradient(115deg, rgba(var(--glow-cool),0.28), rgba(var(--glow-cream),0.64) 48%, rgba(var(--glow-amber),0.18)), var(--bg)',
  },
  coolGlow: {
    position: 'absolute',
    top: '-22%',
    left: '-14%',
    width: 'clamp(360px, 42vw, 680px)',
    height: 'clamp(360px, 42vw, 680px)',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(var(--glow-cool),0.58), rgba(var(--glow-cool),0.16) 44%, transparent 72%)',
    filter: 'blur(56px)',
    pointerEvents: 'none',
  },
  warmGlow: {
    position: 'absolute',
    right: '-18%',
    bottom: '-26%',
    width: 'clamp(400px, 48vw, 760px)',
    height: 'clamp(400px, 48vw, 760px)',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(var(--glow-warm),0.32), rgba(var(--glow-peach),0.14) 44%, transparent 74%)',
    filter: 'blur(68px)',
    pointerEvents: 'none',
  },
  topbar: {
    position: 'fixed',
    top: 22,
    left: 'clamp(20px, 3vw, 40px)',
    right: 'clamp(20px, 3vw, 40px)',
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  topLink: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 13px',
    borderRadius: 999,
    color: 'var(--ink-2)',
    background: 'rgba(255,255,255,0.58)',
    border: '1px solid rgba(11,11,12,0.08)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    fontSize: 13,
    fontWeight: 700,
    textDecoration: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    width: 'min(100%, 430px)',
    padding: 'clamp(30px, 4vw, 44px)',
    borderRadius: 24,
    background: 'rgba(255,255,255,0.82)',
    border: '1px solid rgba(255,255,255,0.78)',
    boxShadow:
      '0 28px 80px rgba(11,11,12,0.11), inset 0 1px 0 rgba(255,255,255,0.86)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
  },
  eyebrow: {
    margin: '0 0 18px',
    color: 'var(--ink-3)',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontWeight: 400,
    fontSize: 'clamp(42px, 5vw, 58px)',
    lineHeight: 1,
    letterSpacing: '-0.02em',
    color: 'var(--ink)',
  },
  copy: {
    margin: '12px 0 30px',
    color: 'var(--ink-3)',
    fontSize: 15,
    lineHeight: 1.55,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 17,
  },
  fieldLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  passwordRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 16,
  },
  fieldLabelText: {
    fontSize: 12,
    fontWeight: 800,
    color: 'var(--ink-2)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '15px 16px',
    background: 'rgba(255,255,255,0.88)',
    border: '1px solid var(--line)',
    borderRadius: 10,
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    color: 'var(--ink)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .2s ease, box-shadow .2s ease, background .2s ease',
  },
  forgotLink: {
    color: 'var(--ink-3)',
    fontSize: 12,
    fontWeight: 700,
    textDecoration: 'none',
  },
  errorBanner: {
    overflow: 'hidden',
    padding: '11px 13px',
    borderRadius: 10,
    background: 'rgba(154,48,48,0.07)',
    border: '1px solid rgba(154,48,48,0.18)',
    color: '#9a3030',
    fontSize: 13,
    lineHeight: 1.45,
  },
  footerNote: {
    margin: '22px 0 0',
    color: 'var(--ink-3)',
    fontSize: 13,
    textAlign: 'center',
  },
  inlineLink: {
    color: 'var(--ink)',
    fontWeight: 800,
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
  legalRow: {
    position: 'fixed',
    left: 'clamp(20px, 3vw, 40px)',
    right: 'clamp(20px, 3vw, 40px)',
    bottom: 20,
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    color: 'var(--ink-4)',
    fontSize: 12,
  },
  legalLinks: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 14,
  },
  legalLink: {
    color: 'var(--ink-3)',
    textDecoration: 'none',
  },
};
