import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const CATEGORIES = [
  { 
    title: "BRANDING", 
    text: "Forging absolute market dominance through precision-crafted brand identities that command instant authority and define cultural trends.", 
  },
  { 
    title: "WEB DESIGN", 
    text: "Engineering incredibly fluid, mathematically optimized optical experiences that blur the line between digital product and interactive art.", 
  },
  { 
    title: "SOCIAL MEDIA", 
    text: "Building algorithmic social ecosystems that actively convert passive attention into hyper-engaged community ecosystems.", 
  },
  { 
    title: "CONTENT", 
    text: "Deploying cinematic-grade production resources to physically manifest your brand's digital narrative with uncompromised quality.", 
  },
  { 
    title: "SO MUCH MORE", 
    text: "From enterprise headless architectures to spatial reality modeling, we operate entirely at the absolute bleeding edge of modern digital deployment.", 
  }
];

const CategoryItem = ({ data, index, activeIndex, setActiveIndex }) => {
  const ref = useRef(null);
  const isActive = activeIndex === index;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveIndex(index);
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index, setActiveIndex]);

  return (
    <div 
      ref={ref} 
      style={{ 
        position: 'relative',
        padding: '4vh 3vw', // More luxurious, wider inner padding for hover block!
        borderBottom: '1px solid rgba(255,255,255,0.06)', 
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: '24px',
        backgroundColor: isActive ? '#FFFFFF' : 'transparent', 
        transition: 'background-color 0.4s ease'
      }}
      onMouseEnter={() => setActiveIndex(index)}
      onClick={() => setActiveIndex(index)}
    >
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Left Side: Index & Title Typography Upgrade */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '1vw', 
            fontWeight: 500, 
            fontFamily: '"Inter", sans-serif',
            marginRight: '3vw', 
            color: isActive ? 'rgba(5,5,5,0.4)' : 'rgba(255,255,255,0.2)', 
            transition: 'all 0.5s ease' 
          }}>
            (0{index + 1})
          </span>
          <h3 style={{ 
            fontSize: '4vw', // Enhanced typographic weight!
            fontWeight: 600, 
            fontFamily: '"Outfit", sans-serif',
            color: isActive ? '#050505' : 'rgba(255,255,255,0.6)', // Brighter initial idle text state
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '-0.03em',
            transform: isActive ? 'translateX(1vw)' : 'translateX(0)', 
          }}>
            {data.title}
          </h3>
        </div>

        {/* Right Side: Enhanced 'Explore' Mechanism Button Array */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2vw' }}>
           <motion.span
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -10 }}
             style={{ 
                fontFamily: '"Inter", sans-serif', 
                fontSize: '0.9vw', 
                fontWeight: 700, 
                letterSpacing: '0.1em', 
                color: '#050505',
                textTransform: 'uppercase'
             }}
           >
             Explore
           </motion.span>
           
           <motion.div
             style={{ 
               color: isActive ? '#050505' : 'rgba(255,255,255,0.2)', 
               flexShrink: 0,
               background: isActive ? 'rgba(5,5,5,0.05)' : 'transparent', // Interactive button-ring boundary when white
               padding: '1vw',
               borderRadius: '100px'
             }}
             animate={{ rotate: isActive ? 45 : 0 }} 
             transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <ArrowUpRight size={28} strokeWidth={2} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden', position: 'relative', zIndex: 1 }}
          >
            <div style={{ paddingLeft: '5.5vw' }}> {/* Indents paragraph directly underneath text letters natively */}
              <p style={{ 
                fontSize: '1.25vw', 
                lineHeight: 1.8, 
                color: 'rgba(5,5,5,0.7)', 
                marginTop: '1.5vh', 
                maxWidth: '75%', // Tighter line lengths reading beautifully
                fontFamily: '"Inter", sans-serif', 
                fontWeight: 300,
              }}>
                {data.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AccordionSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div style={styles.sectionWrapper}>
      <section style={styles.container}>
        
        <div style={styles.header}>
          <h2 style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '1.2vw', 
            fontWeight: 500,
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.8vw'
          }}>
            WHAT 
            <motion.div 
              style={{ width: '3vw', height: '1.6vw', borderRadius: '100px', overflow: 'hidden', display: 'flex', flexShrink: 0 }}
              initial={{ scale: 0, y: 20, opacity: 0 }}
              whileInView={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 17,
                delay: 0.1 
              }}
              viewport={{ once: true, margin: "-10%" }}
            >
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop" alt="Agency Graphic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
            WE OFFER
          </h2>
          
          {/* Secondary Header Label anchored to the far right layout edge manually inserted per user spec! */}
          <p style={styles.secondaryLabel}>
            [ Capabilities Array ]
          </p>
        </div>

        <div style={styles.listLayout}>
          {CATEGORIES.map((cat, idx) => (
            <CategoryItem 
              key={idx} 
              data={cat} 
              index={idx} 
              activeIndex={activeIndex} 
              setActiveIndex={setActiveIndex} 
            />
          ))}
        </div>

      </section>
    </div>
  );
};

const styles = {
  sectionWrapper: {
    padding: '24px',
    paddingTop: '20px',
    backgroundColor: '#F2F2F2', // Exact shade reference mapped structurally 
  },
  container: {
    padding: '4vh 5vw',
    backgroundColor: '#050505', // Converted immediately to Pitch Black while preserving the white padded framework border uniformly!
    borderRadius: '32px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: '8vh',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '3vh',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Aligns base of main title exactly perfectly structurally to secondary string!
  },
  secondaryLabel: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.85vw',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
    margin: 0,
    paddingBottom: '0.5vh', // Tiny visual baseline tweak!
  },
  title: {
    fontFamily: '"Inter", sans-serif', // Dropped inline image and reverted to elegant Featured Work formatting!
    fontWeight: 500,
    fontSize: '1.2vw',
    letterSpacing: '-0.02em',
    color: '#FFFFFF',
    margin: 0,
  },
  listLayout: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '1200px', 
    margin: '0 auto', 
    paddingBottom: '10vh',
  }
};
