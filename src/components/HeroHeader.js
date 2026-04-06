import React from 'react';
import { motion } from 'framer-motion';

export const HeroHeader = () => {
  return (
    <div style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
      <section style={styles.container}>
      {/* YouTube Background Video */}
      <iframe
        src="https://www.youtube.com/embed/LQuLAbG62vY?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=LQuLAbG62vY&modestbranding=1&playsinline=1"
        title="Hero Background"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{ ...styles.bgVideo, transform: 'scale(1.35)', pointerEvents: 'none' }}
      />
      {/* Dark Overlay to make white text pop flawlessly */}
      <div style={styles.overlay} />

      {/* Main Content */}
      <div style={styles.content}>
        
        {/* Awards Block completely removed per user request */}
        
        {/* Giant Main Title */}
        <motion.h1 
          style={styles.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          We Create <br />
          <span style={styles.flexLine}>
            Category 
            <motion.span 
              style={styles.pillBox}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1541873676-a18131494184?w=300&h=300&fit=crop" 
                alt="Astronaut Space" 
                style={styles.pillImage} 
              />
            </motion.span>
            Leaders
          </span>
        </motion.h1>

        {/* Updated Subtitle - Pure Sans-Serif and NOT italic */}
        <motion.p 
          style={styles.bottomText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          on every searchable platform
        </motion.p>
        
      </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    height: 'calc(100vh - 48px)',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: '32px',
    color: '#FFF',
    fontFamily: '"Outfit", sans-serif',
  },
  bgVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(10, 10, 15, 0.45)', // Sleek dark overlay
    backdropFilter: 'contrast(1.1) brightness(0.8)',
    WebkitBackdropFilter: 'contrast(1.1) brightness(0.8)',
    zIndex: 1,
  },
  content: {
    position: 'relative',
    zIndex: 2,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  awardsBlock: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  awardText: {
    fontSize: '9px',
    letterSpacing: '0.08em',
    lineHeight: 1.5,
    margin: '0 0 12px 0',
    color: 'rgba(255,255,255,0.9)',
  },
  awardIcons: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    opacity: 0.8,
  },
  title: {
    fontSize: '10.5vw',
    lineHeight: 0.95,
    letterSpacing: '-0.04em',
    fontWeight: 500,
    margin: '0 0 20px 0',
    color: '#FFF',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  flexLine: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2vw',
  },
  pillBox: {
    width: '8vw',
    height: '8vw',
    borderRadius: '24px',
    overflow: 'hidden',
    display: 'inline-block',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  },
  pillImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  bottomText: {
    fontSize: '28px',
    fontWeight: 400,
    color: '#FFF',
    margin: '0 0 60px 0',
    letterSpacing: '-0.02em',
  }
};
