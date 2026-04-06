import React, { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoPlay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';

const partnerLogos = [
  { src: "https://cdn.worldvectorlogo.com/logos/react-2.svg", alt: "React" },
  { src: "https://cdn.worldvectorlogo.com/logos/next-js.svg", alt: "Next.js" },
  { src: "https://cdn.worldvectorlogo.com/logos/vercel.svg", alt: "Vercel" },
  { src: "https://cdn.worldvectorlogo.com/logos/typescript.svg", alt: "TypeScript" },
  { src: "https://cdn.worldvectorlogo.com/logos/tailwindcss.svg", alt: "Tailwind CSS" },
  { src: "https://cdn.worldvectorlogo.com/logos/stripe-4.svg", alt: "Stripe" },
  { src: "https://cdn.worldvectorlogo.com/logos/notion-2.svg", alt: "Notion" },
  { src: "https://cdn.worldvectorlogo.com/logos/github-icon-1.svg", alt: "GitHub" },
  { src: "https://cdn.worldvectorlogo.com/logos/figma-icon-one-color.svg", alt: "Figma" },
  { src: "https://cdn.worldvectorlogo.com/logos/framer-motion.svg", alt: "Framer Motion" },
  { src: "https://cdn.worldvectorlogo.com/logos/storybook-1.svg", alt: "Storybook" },
  { src: "https://cdn.worldvectorlogo.com/logos/sanity.svg", alt: "Sanity" },
];

export const TextRoll = ({ children }) => {
  const letters = children.split('');
  
  const getEnterDelay = (i) => i * 0.1;
  const getExitDelay = (i) => i * 0.1 + 0.2;
  const duration = 0.5;

  return (
    <span style={{ display: 'inline-flex' }}>
      {letters.map((letter, i) => (
        <span
          key={i}
          style={{ position: 'relative', display: 'inline-block', perspective: '10000px', transformStyle: 'preserve-3d', width: 'auto' }}
          aria-hidden='true'
        >
          {/* Front falling back */}
          <motion.span
            style={{ position: 'absolute', display: 'inline-block', backfaceVisibility: 'hidden', transformOrigin: '50% 25%' }}
            initial={{ rotateX: 0 }}
            whileInView={{ rotateX: 90 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ ease: 'easeIn', duration, delay: getEnterDelay(i) }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
          
          {/* Back standing up */}
          <motion.span
            style={{ position: 'absolute', display: 'inline-block', backfaceVisibility: 'hidden', transformOrigin: '50% 100%' }}
            initial={{ rotateX: 90 }}
            whileInView={{ rotateX: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ ease: 'easeIn', duration, delay: getExitDelay(i) }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
          
          <span style={{ visibility: 'hidden' }}>
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        </span>
      ))}
      <span className="sr-only" style={{ display: 'none' }}>{children}</span>
    </span>
  );
};

export const LogoCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center', slidesToScroll: 1 },
    [AutoPlay({ delay: 3000, stopOnInteraction: false })]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    emblaApi.emit('select'); // Trigger immediately on mount once API is ready
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <h3 style={styles.title}>
          <TextRoll>Using the best to power your site.</TextRoll>
        </h3>
        
        <div style={styles.embla} ref={emblaRef}>
          <div style={styles.emblaContainer}>
            {partnerLogos.map((logo, idx) => {
              const isActive = selectedIndex === idx;
              return (
                <div style={styles.emblaSlide} key={idx}>
                  <motion.div 
                    style={styles.logoWrapper}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.img 
                      src={logo.src} 
                      alt={logo.alt} 
                      style={{
                        ...styles.logoImage,
                        filter: isActive ? 'grayscale(0%) opacity(1)' : 'grayscale(100%) opacity(0.35)',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)'
                      }}
                      whileHover={{ filter: 'grayscale(0%) opacity(1)' }}
                    />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '4vh 5vw',
    overflow: 'hidden',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  title: {
    fontSize: '36px',
    fontWeight: 600,
    color: '#050505',
    marginBottom: '80px',
    letterSpacing: '-0.02em',
    fontFamily: '"Outfit", sans-serif',
  },
  embla: {
    overflow: 'hidden',
    width: '100%',
    cursor: 'grab',
  },
  emblaContainer: {
    display: 'flex',
    gap: '30px',
  },
  emblaSlide: {
    flex: '0 0 auto',
    minWidth: 0,
    width: '220px', 
    display: 'flex',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: '180px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: '12px',
  },
  logoImage: {
    maxWidth: '100%',
    maxHeight: '45px',
    objectFit: 'contain',
    filter: 'grayscale(100%) opacity(0.6)',
    transition: 'filter 0.3s ease',
  }
};
