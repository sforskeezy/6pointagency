import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowUp } from 'lucide-react';

const HoverLink = ({ href, children }) => (
  <motion.a 
    href={href}
    style={styles.link}
    whileHover={{ color: '#FFFFFF' }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.a>
);

export const Footer = () => {
  return (
    <footer style={styles.footer}>
      {/* Editorial Heading Array */}
      <div style={styles.topSection}>
        <h2 style={styles.heading}>
          Ready to <span style={styles.italicSerif}>grow?</span>
        </h2>
        <p style={styles.subText}>Strategy, branding, and web design — all under one roof.</p>
      </div>

      {/* 4-Column Navigation Matrix */}
      <div style={styles.grid}>
        <div style={styles.column}>
          <h4 style={styles.colHeader}>NAVIGATE</h4>
          <HoverLink href="#services">Services</HoverLink>
          <HoverLink href="#pricing">Pricing</HoverLink>
          <HoverLink href="#contact">Contact</HoverLink>
        </div>
        <div style={styles.column}>
          <h4 style={styles.colHeader}>SOCIAL</h4>
          <HoverLink href="#instagram">
            Instagram <ArrowUpRight size={14} style={{marginLeft: 4}} />
          </HoverLink>
          <HoverLink href="#linkedin">LinkedIn</HoverLink>
          <HoverLink href="#tiktok">TikTok</HoverLink>
        </div>
        <div style={styles.column}>
          <h4 style={styles.colHeader}>CONTACT</h4>
          <HoverLink href="mailto:hello@6pointsolutions.com">hello@6pointsolutions.com</HoverLink>
        </div>
        <div style={styles.column}>
          <h4 style={styles.colHeader}>LEGAL</h4>
          <HoverLink href="#privacy">Privacy Policy</HoverLink>
          <HoverLink href="#terms">Terms of Service</HoverLink>
        </div>
      </div>

      {/* Monumental Structural Watermark */}
      <div style={styles.watermarkContainer}>
        <h1 style={styles.watermark}>6POINT</h1>
      </div>

      {/* Baseline Utilities */}
      <div style={styles.bottomSection}>
        <p style={styles.bottomText}>© 2026 6POINT Solutions. All rights reserved.</p>
        <motion.button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={styles.backToTop}
          whileHover={{ color: '#FFFFFF' }}
        >
          Back to top <ArrowUp size={14} style={{marginLeft: 4}} />
        </motion.button>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#0A0A0A',
    color: '#FFFFFF',
    padding: '8vh 5vw 2vh 5vw', // Tightened master Y axis logic
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  topSection: {
    marginBottom: '8vh', // Reduced 12 to 8
  },
  heading: {
    fontFamily: '"Outfit", sans-serif',
    fontWeight: 700,
    fontSize: '5vw', // Compressed dramatically from 6.5 down to native 5
    margin: '0 0 1.5vh 0',
    letterSpacing: '-0.03em',
  },
  italicSerif: {
    fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic',
    fontWeight: 400,
  },
  subText: {
    fontFamily: '"Inter", sans-serif',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '1.25vw',
    margin: 0,
    fontWeight: 300,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '4vw',
    paddingBottom: '5vh', // Decreased spacing floor pushing links away from watermark array
    borderBottom: '1px solid rgba(255,255,255,0.06)', 
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2vh',
  },
  colHeader: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.8vw',
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase',
    margin: '0 0 1vh 0',
  },
  link: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '1vw',
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontWeight: 300,
  },
  watermarkContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '4vh 0 0 0',
  },
  watermark: {
    fontFamily: '"Outfit", sans-serif',
    fontSize: '20vw', // Structurally dropped from massive 26vw config
    fontWeight: 900,
    color: 'rgba(255,255,255,0.015)', 
    margin: 0,
    letterSpacing: '-0.04em',
    lineHeight: 0.75,
  },
  bottomSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '-2vh', // Sucks it slightly closer to the typography bounds
    zIndex: 1, // Elevates the final clicks above the phantom string
  },
  bottomText: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.85vw',
    fontWeight: 300,
    color: 'rgba(255,255,255,0.3)',
    margin: 0,
  },
  backToTop: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.85vw',
    fontWeight: 300,
    color: 'rgba(255,255,255,0.3)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    padding: 0,
  }
};
