import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// Primary spinning 6-point origamic star
const CustomBrandIcon = ({ size = 32, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" {...props}>
    <g transform="translate(50, 50)">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <g key={deg} transform={`rotate(${deg})`}>
          <path d="M 2,-12 L 14,-26 L 8,-44 L 2,-44 Z" fill="#748E75" />
          <path d="M -2,-44 L -8,-44 L -14,-26 L -2,-12" stroke="#748E75" strokeWidth="1.5" />
        </g>
      ))}
      <circle cx="20" cy="30" r="1.5" fill="#FF4B4B" />
    </g>
  </svg>
);

// Secondary floating 3D triple cubes
const CustomCubeIcon = ({ size = 32, ...props }) => {
  const Hex = () => (
    <>
      <path d="M-17.32,-10 L0,-20 L17.32,-10 L17.32,10 L0,20 L-17.32,10 Z" />
      <path d="M0,0 L0,20 M0,0 L-17.32,-10 M0,0 L17.32,-10" />
    </>
  );
  return (
    <svg width={size} height={size} viewBox="-40 -45 80 80" fill="none" {...props}>
      <g stroke="#748E75" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        <g transform="translate(0, -20)"><Hex /></g>
        <g transform="translate(-17.32, 10)"><Hex /></g>
        <g transform="translate(17.32, 10)"><Hex /></g>
      </g>
    </svg>
  );
};

// Newly added third node: A 3D plexus network globe!
const CustomNetworkIcon = ({ size = 32, ...props }) => {
  // Plotted extreme precision points to emulate the network globe structural reference
  const outer = [[0, -25], [18, -16], [25, 4], [15, 22], [-6, 26], [-22, 14], [-26, -5], [-15, -21]];
  const innerFront = [[2, -12], [12, 6], [-4, 12], [-12, -4]];
  const innerBack = [[10, -10], [5, 16], [-15, 5], [-8, -18]];
  const center = [0, 0];

  const drawLine = (p1, p2) => <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} />;

  return (
    <svg width={size} height={size} viewBox="-30 -30 60 60" fill="none" {...props}>
      <g stroke="#748E75" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        
        {/* Back lines - Dotted/Dashed for depth simulation */}
        <g strokeDasharray="1 2.5">
          {outer.map((p, i) => drawLine(p, innerBack[i % 4]))}
          {innerBack.map((p, i) => drawLine(p, center))}
          {innerBack.map((p, i) => drawLine(p, innerBack[(i+1)%4]))}
        </g>
        
        {/* Front lines - Solid connecting mesh */}
        <g>
          {outer.map((p, i) => drawLine(p, outer[(i+1)%outer.length]))}
          {outer.map((p, i) => drawLine(p, innerFront[Math.floor(i/2)]))}
          {innerFront.map((p, i) => drawLine(p, center))}
          {innerFront.map((p, i) => drawLine(p, innerFront[(i+1)%innerFront.length]))}
        </g>
      </g>

      {/* Connection Nodes */}
      <g fill="#748E75">
        {[...outer, ...innerFront, ...innerBack, center].map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="2.5" />
        ))}
      </g>
    </svg>
  );
};

const CONTENT = [
  { type: 'text', value: "We" },
  { type: 'text', value: "are" },
  { type: 'text', value: "6POINT." },
  { type: 'icon', icon: CustomBrandIcon, aspect: '7vw', animationType: 'spin' }, // Dropped aggressively from 11vw
  { type: 'text', value: "A" },
  { type: 'text', value: "digital" },
  { type: 'text', value: "design" },
  { type: 'text', value: "agency" },
  { type: 'text', value: "engineering" },
  { type: 'icon', icon: CustomCubeIcon, aspect: '8vw', animationType: 'float' }, // Dropped aggressively from 13vw
  { type: 'text', value: "fluid," },
  { type: 'text', value: "dynamic," },
  { type: 'text', value: "and" },
  { type: 'text', value: "perfectly" },
  { type: 'text', value: "optimized" },
  { type: 'icon', icon: CustomNetworkIcon, aspect: '7vw', animationType: 'pulse' }, // Dropped aggressively from 11vw
  { type: 'text', value: "modern" },
  { type: 'text', value: "experiences." }
];

export const ScrollRevealText = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 50%"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <section ref={containerRef} style={styles.container}>
      <h2 style={styles.text}>
        {CONTENT.map((item, i) => {
          const start = i / CONTENT.length;
          const end = start + (1 / CONTENT.length);
          
          if (item.type === 'text') {
            return (
              <Word key={i} progress={smoothProgress} start={start} end={end}>
                {item.value}
              </Word>
            );
          } else {
            return (
              <InlineIcon 
                key={i} 
                Icon={item.icon} 
                progress={smoothProgress} 
                start={start} 
                end={end} 
                width={item.aspect} 
                animationType={item.animationType} 
              />
            )
          }
        })}
      </h2>
    </section>
  );
};

const Word = ({ children, progress, start, end }) => {
  const opacity = useTransform(progress, [start, end], [0.15, 1]);
  const color = useTransform(progress, [start, end], ["rgba(5, 5, 5, 0.15)", "rgba(5, 5, 5, 1)"]);
  
  return (
    <span style={styles.wordSpan}>
      <span style={{ opacity: 0 }}>{children}</span>
      <motion.span style={{ position: 'absolute', left: 0, top: 0, opacity, color }}>
        {children}
      </motion.span>
    </span>
  );
};

const InlineIcon = ({ Icon, progress, start, end, width, animationType }) => {
  // Fade in animation matching text natively
  const opacity = useTransform(progress, [start, end], [0.3, 1]);
  const scale = useTransform(progress, [start, end], [0.85, 1]);

  // Unique ambient animations based on icon config parameter
  let loopAnimation = {};
  let loopTransition = {};

  if (animationType === 'spin') {
    loopAnimation = { rotate: [0, 360] };
    loopTransition = { repeat: Infinity, duration: 12, ease: "linear" };
  } else if (animationType === 'float') {
    loopAnimation = { y: [-6, 6, -6] };
    loopTransition = { repeat: Infinity, duration: 4, ease: "easeInOut" };
  } else if (animationType === 'pulse') {
    loopAnimation = { scale: [0.95, 1.05, 0.95] };
    loopTransition = { repeat: Infinity, duration: 3, ease: "easeInOut" };
  }

  return (
    <motion.span 
      style={{
        ...styles.iconContainer,
        width: width,
        scale,
        opacity,
      }}
    >
      <motion.div
        animate={loopAnimation}
        transition={loopTransition}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
      >
        {/* Pass 100% to inherit true responsive vector math! */}
        <Icon size="100%" strokeWidth={2} />
      </motion.div>
    </motion.span>
  );
};

const styles = {
  container: {
    padding: '8vh 5vw', // Compressed vertical boundary constraints
    minHeight: '60vh', // Shallowed the required scroll presence 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F2',
  },
  text: {
    fontSize: '3.6vw', // Shrunk base type natively from 5.0vw down to 3.6
    lineHeight: 1.4, // Tightened tracking bounds
    fontWeight: 500,
    letterSpacing: '-0.02em',
    maxWidth: '1200px',
    textAlign: 'center',
    margin: 0,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.8vw 1.2vw',
    alignItems: 'center',
  },
  wordSpan: {
    display: 'inline-block',
    position: 'relative',
  },
  iconContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '5vw', // Aggressively scaled container mappings structurally
    margin: '0 0.5vw',
    overflow: 'visible', // Allows continuous floating mechanical animations to levitate dynamically outside their geometric container
  }
};
