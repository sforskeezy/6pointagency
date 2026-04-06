import React, { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { LogoCarousel } from './components/LogoCarousel';
import { ScrollRevealText } from './components/ScrollRevealText';
import { AccordionSection } from './components/AccordionSection';
import { OurWorkSection } from './components/OurWorkSection';
import { Footer } from './components/Footer'; // Imports the new dark-mode Footer
import './index.css';
import { motion, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';

function App() {
  const { scrollYProgress } = useScroll();
  const globalGlow = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Premium Momentum Scrolling Architecture
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4, // Luxuriously slow inertia
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="App" style={{ position: 'relative' }}>
      {/* High-End Ambient Scrolling Sage Green Glow */}
      <motion.div 
        style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'radial-gradient(circle at 10% 90%, rgba(116,142,117,0.12) 0%, transparent 50%), radial-gradient(circle at 90% 10%, rgba(116,142,117,0.12) 0%, transparent 50%)',
          opacity: globalGlow,
          pointerEvents: 'none',
          zIndex: 50 // Ensures glow overlays background but not crucial nav/interactions
        }}
      />
      
      <Navbar />
      
      <HeroHeader />

      {/* Brands Ribbon - Distinct architectural cool-fade to break from #F2F2F2 visually without clashing */}
      <div style={{ backgroundColor: '#EAECEA', position: 'relative', zIndex: 2 }}>
        <LogoCarousel />
      </div>

      <div style={{ backgroundColor: '#F2F2F2', position: 'relative', zIndex: 1 }}>
        <ScrollRevealText text="We are 6POINT. A digital design agency engineering fluid, dynamic, and perfectly optimized modern experiences." />
        <AccordionSection />
      </div>

      <OurWorkSection />
      
      <Footer />
    </div>
  );
}

export default App;
