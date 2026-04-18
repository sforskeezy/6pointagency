import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';

export const ClientLogin = () => {
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={styles.container}>
      {/* Left Column (Pristine SaaS UI Layout) */}
      <div style={styles.leftCol}>
        
        {/* Navigation & Anchors */}
        <div style={styles.topHeader}>
          <a href="#top" style={styles.backLink}>
             <Logo size={24} color="#0F1419" />
          </a>
          
          <div style={styles.topBadge}>
            <span style={styles.badgeText}>You are signing into <b>6POINT</b></span>
          </div>
        </div>

        {/* Core Logic Gate */}
        <div style={styles.formWrapper}>
          <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             transition={{ duration: 0.4 }}
             style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '320px', margin: '0 auto' }}
          >
            <h1 style={styles.heading}>Log into your account</h1>

            {/* Exclusive Username & Password Native Input Schema */}
            <form style={styles.authForm} onSubmit={(e) => e.preventDefault()}>
              
              <div style={styles.inputGroup}>
                <input 
                  type="text" 
                  placeholder="Username, phone, or email" 
                  style={{ ...styles.input, borderColor: focus === 'email' ? '#1D9BF0' : '#CFD9DE' }} 
                  onFocus={() => setFocus('email')}
                  onBlur={() => setFocus(null)}
                />
              </div>

              <div style={styles.inputGroup}>
                <input 
                  type="password" 
                  placeholder="Password" 
                  style={{ ...styles.input, borderColor: focus === 'pass' ? '#1D9BF0' : '#CFD9DE' }} 
                  onFocus={() => setFocus('pass')}
                  onBlur={() => setFocus(null)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '8px' }}>
                  <a href="mailto:hello@6pointdesigns.com?subject=Password%20reset" style={styles.forgotLink}>Forgot password?</a>
                </div>
              </div>

              <motion.button 
                whileHover={{ backgroundColor: '#272C30' }} 
                whileTap={{ scale: 0.98 }} 
                style={styles.primaryButton}
              >
                Log in
              </motion.button>
              
            </form>

            <p style={styles.footerText}>
              Don't have an account?{' '}
              <a
                href="#contact"
                style={styles.link}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = '#contact';
                }}
              >
                Sign up
              </a>
            </p>
          </motion.div>
        </div>

      </div>

      {/* Right Environment Matrix (Dark Mode Architectural Scale with Animated Lighting) */}
      <div style={styles.rightCol}>
        <div style={styles.overlay} />
        
        {/* Dynamic Volumetric Lighting Array mapped implicitly over the pitch-black backdrop */}
        <motion.div 
          animate={{ 
            x: ['-10%', '30%', '-20%', '-10%'], 
            y: ['-10%', '20%', '40%', '-10%'],
            scale: [1, 1.25, 0.8, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={styles.ambientOrbOne} 
        />

        <motion.div 
          animate={{ 
            x: ['20%', '-30%', '10%', '20%'], 
            y: ['20%', '-40%', '30%', '20%'],
            scale: [0.8, 1.3, 0.9, 0.8],
            opacity: [0.2, 0.45, 0.2]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 2 }}
          style={styles.ambientOrbTwo} 
        />

        {/* Abstract 3D graphic native to 6point deployment mapping */}
        <img src="/nanobanana_ecosystem.png" alt="6POINT Environment" style={styles.bgImage} />
        
        {/* Massive Watermark implicitly balancing the layout gravity */}
        <div style={styles.watermarkContainer}>
          <h1 style={styles.watermark}>6</h1>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  leftCol: {
    width: '50%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    padding: '32px'
  },
  topHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  backLink: {
    textDecoration: 'none',
    display: 'inline-flex'
  },
  topBadge: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 16px',
    border: '1px solid #CFD9DE',
    borderRadius: '9999px',
  },
  badgeText: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#536471',
  },
  formWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  heading: {
    fontFamily: 'inherit',
    fontSize: '31px',
    fontWeight: 700,
    color: '#0F1419',
    margin: '0 0 32px 0',
    letterSpacing: '-0.02em',
  },
  authForm: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '24px' // Highly structural spacing grid
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  forgotLink: {
    fontSize: '13px',
    fontWeight: 400,
    color: '#536471',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
  input: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#FFFFFF', 
    border: '1px solid #CFD9DE',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '15px',
    color: '#0F1419',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    width: '100%',
    padding: '14px 0',
    backgroundColor: '#0F1419',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '9999px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  footerText: {
    marginTop: '40px',
    fontSize: '15px',
    color: '#536471',
    fontWeight: 400
  },
  link: {
    color: '#1D9BF0', // Sleek active product blue mapped identical to structural SaaS requirements
    fontWeight: 400,
    textDecoration: 'none',
  },
  rightCol: {
    width: '50%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#050505',
    overflow: 'hidden'
  },
  ambientOrbOne: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '60vw',
    height: '60vw',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(116,142,117,0.7) 0%, rgba(116,142,117,0) 60%)',
    filter: 'blur(90px)',
    zIndex: 2, 
    pointerEvents: 'none',
    mixBlendMode: 'screen'
  },
  ambientOrbTwo: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '70vw',
    height: '70vw',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(180,195,180,0.6) 0%, rgba(150,170,150,0) 60%)',
    filter: 'blur(110px)',
    zIndex: 2,
    pointerEvents: 'none',
    mixBlendMode: 'screen'
  },
  bgImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    opacity: 0.18
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    background: 'radial-gradient(circle at center, transparent 0%, #050505 100%)', 
    zIndex: 3, 
    pointerEvents: 'none'
  },
  watermarkContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 4,
    pointerEvents: 'none'
  },
  watermark: {
    fontFamily: '"Outfit", sans-serif',
    fontSize: '50vw',
    fontWeight: 900,
    color: '#FFFFFF',
    opacity: 0.02, 
    margin: 0,
    lineHeight: 1
  }
};
