import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock, User } from 'lucide-react';

const WORK_DATA = [
  {
    tag: "Food/Hospitality/Drink",
    author: "Carrie Rose",
    time: "2 mins",
    title: "Rise at Seven Appointed by Langtins to drive demand and retail growth for Noomz",
    image: "/nanobanana_sportswear.png"
  },
  {
    tag: "News",
    author: "Carrie Rose",
    time: "5 mins",
    title: "The Agency Model Is Resetting - why I am hiring more client side leaders",
    image: "/nanobanana_ecosystem.png"
  },
  {
    tag: "B2B Marketing",
    author: "Ray Saddiq",
    time: "6 mins",
    title: "10 B2B Campaigns Marketers Keep Talking About (And Why)",
    image: "/6point_graphic_mint.png" 
  }
];

const CaseCard = ({ data, index }) => {
  return (
    <motion.div 
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-5%" }}
      variants={{
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] } }
      }}
      style={{ ...styles.card, cursor: 'pointer' }}
      whileHover="hover"
    >
      <div style={styles.imageWrapper}>
        {/* Isolated Scaling Image Engine */}
        <motion.img 
          src={data.image} 
          style={styles.cardImage} 
          variants={{
            initial: { scale: 1 },
            animate: { scale: 1 },
            hover: { scale: 1.05 }
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
        
        {/* Dedicated Hardware-Accelerated Blur Frame (Webkit Safe) */}
        <motion.div
           variants={{
             initial: { opacity: 0 },
             animate: { opacity: 0 },
             hover: { opacity: 1 }
           }}
           transition={{ duration: 0.4, ease: "easeOut" }}
           style={{
             position: 'absolute',
             top: 0, left: 0, right: 0, bottom: 0,
             backdropFilter: 'blur(12px)',
             WebkitBackdropFilter: 'blur(12px)',
             backgroundColor: 'rgba(255,255,255,0.05)',
             zIndex: 1,
             pointerEvents: 'none'
           }}
        />
        
        {/* Massive Center-Targeted Reference Arrow */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 2 }}>
           <motion.div
             variants={{
               initial: { scale: 0.5, opacity: 0 },
               animate: { scale: 0.5, opacity: 0 },
               hover: { scale: 1, opacity: 1 }
             }}
             transition={{ type: 'spring', stiffness: 400, damping: 20 }}
             style={{
               width: '8vw', // Imposing cinematic sizing for the macro overlay
               height: '8vw',
               borderRadius: '50%',
               backgroundColor: '#748E75', // Custom Sage Green User Requirement Override!
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
             }}
           >
              <ArrowUpRight size={44} color="#050505" strokeWidth={2} />
           </motion.div>
        </div>

        {/* Floating Category Tag mapped structurally over the blur field automatically via native DOM flow */}
        <div style={{ ...styles.tagWrapper, zIndex: 3 }}>
          <span style={styles.tag}>{data.tag}</span>
        </div>
      </div>
      
      {/* Structural Metadata Rows */}
      <div style={styles.metaRow}>
        <span style={styles.metaPill}>
          <User size={12} style={{ marginRight: 6 }} /> {data.author}
        </span>
        <span style={styles.metaPill}>
          <Clock size={12} style={{ marginRight: 6 }} /> {data.time}
        </span>
      </div>

      <h3 style={styles.cardTitle}>{data.title}</h3>
    </motion.div>
  );
};

export const OurWorkSection = () => {
  return (
    <div style={styles.sectionWrapper}>
      <section style={styles.container}>
        
        {/* Directly mirroring the robust "What's [Image] New" header structure */}
        <div style={styles.headerRow}>
          <h2 style={styles.title}>
            Case 
            <motion.div 
              style={{ width: '8vw', height: '6vw', borderRadius: '2vw', overflow: 'hidden', display: 'flex', flexShrink: 0 }}
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              viewport={{ once: true }}
            >
              <img src="https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=400&h=400&fit=crop" alt="Case Graphic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
            Studies
          </h2>

          <motion.button 
            style={styles.exploreButton}
            whileHover={{ scale: 1.05, opacity: 0.9 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All Work <ArrowUpRight size={16} style={{ marginLeft: 6 }} />
          </motion.button>
        </div>

        <div style={styles.grid}>
          {WORK_DATA.map((item, idx) => (
            <CaseCard key={idx} data={item} index={idx} />
          ))}
        </div>

      </section>
    </div>
  );
};

const styles = {
  sectionWrapper: {
    padding: '24px',
    backgroundColor: '#F2F2F2', // Re-mapped natively to Premium Off-White!
  },
  container: {
    padding: '8vh 5vw 15vh 5vw',
    backgroundColor: '#F2F2F2', 
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center', 
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    paddingBottom: '4vh',
    marginBottom: '8vh',
  },
  title: {
    fontFamily: '"Outfit", sans-serif',
    fontSize: '6vw', // Matching massive reference graphic header presence
    fontWeight: 900,
    color: '#050505',
    margin: 0,
    letterSpacing: '-0.04em',
    display: 'flex', 
    alignItems: 'center', 
    gap: '1.5vw' 
  },
  exploreButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.2vw 2vw',
    borderRadius: '100px',
    border: 'none',
    backgroundColor: '#050505',
    color: '#FFFFFF',
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.9vw',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '3vw',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: '1 / 1.1', // Structurally locks the tall editorial 3-column crop from reference
    borderRadius: '24px',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '3vh',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  tagWrapper: {
    position: 'absolute',
    top: '1.5vw',
    left: '1.5vw',
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    color: '#050505',
    padding: '0.6vw 1.2vw',
    borderRadius: '100px',
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.85vw',
    fontWeight: 600,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1vw',
    marginBottom: '2vh',
  },
  metaPill: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.6vw 1.2vw',
    borderRadius: '100px',
    border: '1px solid rgba(0,0,0,0.1)',
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.85vw',
    fontWeight: 500,
    color: '#050505',
  },
  cardTitle: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '1.6vw',
    fontWeight: 600,
    color: '#050505',
    margin: 0,
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
  }
};
