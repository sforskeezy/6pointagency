import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { Stats } from './components/Stats';
import { Services } from './components/Services';
import { OurWorkSection } from './components/OurWorkSection';
import { FAQ } from './components/FAQ';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ClientLogin } from './components/ClientLogin';
import { ClientDashboard } from './components/ClientDashboard';
import { AgentDashboard } from './components/AgentDashboard';
import { LegalPage } from './components/LegalPage';
import { ServicePage } from './components/ServicePage';
import { usePageMeta } from './usePageMeta';
import './index.css';

const SERVICE_SLUGS = new Set(['branding', 'web-design', 'growth-strategy', 'social-media']);

/* Map the URL hash to a top-level view. Anything else falls through to the
   marketing home page (where the hash is just a section anchor like #services). */
const viewFromHash = (h) => {
  if (h === '#client-login') return 'login';
  if (h === '#client-dash')  return 'client-dash';
  if (h === '#agent-dash')   return 'agent-dash';
  if (h === '#terms')        return 'terms';
  if (h === '#privacy')      return 'privacy';
  if (h && h.startsWith('#service-')) {
    const slug = h.slice('#service-'.length);
    if (SERVICE_SLUGS.has(slug)) return `service:${slug}`;
  }
  return 'home';
};

function App() {
  const [view, setView] = useState(viewFromHash(window.location.hash));

  useEffect(() => {
    const onHash = () => setView(viewFromHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  /* Keep the browser tab title + favicon in sync with the active view
     (and, on the home page, with whichever section is currently in view). */
  usePageMeta(view);

  // Smooth momentum scroll — disabled for touch / reduced motion
  useEffect(() => {
    if (view !== 'home') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = 'ontouchstart' in window;
    if (reduce || isTouch) return;

    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    let raf;
    const tick = (t) => { lenis.raf(t); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, [view]);

  if (view === 'login') return <ClientLogin />;
  if (view === 'client-dash') return <ClientDashboard />;
  if (view === 'agent-dash') return <AgentDashboard />;
  if (view === 'terms') return <LegalPage kind="terms" />;
  if (view === 'privacy') return <LegalPage kind="privacy" />;
  if (view.startsWith('service:')) {
    return <ServicePage slug={view.slice('service:'.length)} />;
  }

  return (
    <div className="App">
      <Navbar />
      <main>
        <HeroHeader />
        <Stats />
        <Services />
        <OurWorkSection />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
