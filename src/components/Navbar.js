import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle nav mode when scrolled past the 24px top padding
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = ['Our Work', 'Studio', 'Services', 'Pricing'];

  return (
    <motion.header 
      style={{
        ...styles.header,
        background: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
        boxShadow: scrolled ? '0 10px 40px rgba(0,0,0,0.05)' : 'none',
        padding: scrolled ? '20px 0' : '40px 0', // Compacts seamlessly on scroll
      }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={styles.navContainer}>
        
        {/* Left Side: Logo */}
        <div style={styles.logoGroup}>
          <Logo size={24} color={scrolled ? '#050505' : '#FFF'} />
        </div>

        {/* Center: Links */}
        <nav style={styles.linksBlock}>
          {links.map((link, idx) => (
            <motion.a 
              key={idx} 
              href={`#${link.toLowerCase().replace(' ', '-')}`} 
              style={{ ...styles.link, color: scrolled ? '#050505' : '#FFF' }}
              whileHover={{ opacity: 0.6 }}
            >
              {link}
            </motion.a>
          ))}
        </nav>

        {/* Right Side: CTA Button and Login */}
        <div style={styles.ctaWrapper}>
          <motion.a 
            href="#client-login"
            style={{
              ...styles.loginLink,
              color: scrolled ? '#050505' : '#FFF'
            }}
            whileHover={{ opacity: 0.5 }}
          >
            Client Login
          </motion.a>

          <motion.button 
            style={{
              ...styles.ctaButton,
              background: scrolled ? '#748E75' : '#FFF',
              color: scrolled ? '#FFF' : '#050505'
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(116,142,117,0.5)', backgroundColor: '#748E75', color: '#FFF' }}
            whileTap={{ scale: 0.95 }}
          >
            Get in Touch
          </motion.button>
        </div>

      </div>
    </motion.header>
  );
};

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 999,
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  navContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0 4vw', 
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    flex: 1, 
    justifyContent: 'flex-start',
  },
  linksBlock: {
    display: 'flex',
    gap: '3vw',
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    transition: 'opacity 0.2s ease',
    textDecoration: 'none',
  },
  ctaWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center', // Aligns the text strictly to the button center
    justifyContent: 'flex-end',
    gap: '2.5vw', // Clean spacing separating ghost link from solid CTA
  },
  loginLink: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  ctaButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 28px',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s ease',
  }
};
