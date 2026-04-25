import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Play, ArrowUpRight, RotateCcw } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   AnimationTest — a self-playing cinematic short for 6POINT Designs.

   Pitch-black stage, real CSS 3D perspective, animated camera per scene.
   No audio — pure motion + typography. Six scenes, each timed independently.

   Stage stack (back → front):
     #vignette  (radial darkening)
     #grain     (animated SVG noise)
     <stage perspective: 1800px>
       <cameraRig transform-style: preserve-3d>
         <scene transform-style: preserve-3d>
           layers at varying translateZ
     #letterbox (top + bottom black bars)
     #hud       (progress + replay, inside the letterbox)

   ───────────────────────────────────────────────────────────────────────────── */

const SCENES = [
  { id: 'title',      duration: 4200 },
  { id: 'manifesto',  duration: 5800 },
  { id: 'beams',      duration: 6800 },
  { id: 'process',    duration: 7600 },
  { id: 'principles', duration: 5200 },
  { id: 'finale',     duration: 5800 },
];

const TOTAL_DURATION = SCENES.reduce((sum, s) => sum + s.duration, 0);

/* Brand geometry — six rays at 60° intervals around (32, 32). */
const RAY_DEGS = [0, 60, 120, 180, 240, 300];

/* ─────────────────────────── REUSABLE FILTERS / DEFS ─────────────────────────── */

const SvgDefs = () => (
  <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }} aria-hidden>
    <defs>
      <filter id="bloomSoft" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b2" />
        <feMerge>
          <feMergeNode in="b2" />
          <feMergeNode in="b1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="bloomStrong" x="-150%" y="-150%" width="400%" height="400%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b2" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="b3" />
        <feMerge>
          <feMergeNode in="b3" />
          <feMergeNode in="b2" />
          <feMergeNode in="b1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          seed="3"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </defs>
  </svg>
);

/* ─────────────────────────── BRAND MARK ─────────────────────────── */

const Mark = ({
  size = 220,
  color = '#FAFAF8',
  bloom = 'soft',
  spinDuration = 30,
}) => (
  <motion.div
    style={{ position: 'relative', width: size, height: size, transformStyle: 'preserve-3d' }}
    animate={{ rotate: 360 }}
    transition={{ duration: spinDuration, ease: 'linear', repeat: Infinity }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill={color}
      style={{
        display: 'block',
        overflow: 'visible',
        filter: bloom === 'strong' ? 'url(#bloomStrong)' : 'url(#bloomSoft)',
      }}
    >
      {RAY_DEGS.map((deg) => (
        <polygon
          key={deg}
          points="30.5,28 25,4 39,4 33.5,28"
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
    </svg>
  </motion.div>
);

/* ─────────────────────────── SHARED 3D STAGE PRIMITIVES ─────────────────────────── */

const STAGE_FRAME = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  perspective: 1800,
  perspectiveOrigin: '50% 50%',
  zIndex: 3,
};

const SCENE_3D = {
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transformStyle: 'preserve-3d',
};

const EASE = [0.16, 1, 0.3, 1];

/* ─────────────────────────── SCENE 1 — TITLE CARD ─────────────────────────── */

/* Cold open. Filmic title sequence — kerning, gold rules, no logo assembly,
   no green glow. Just type setting itself with confidence. */
const SceneTitle = () => (
  <motion.div
    initial={{ scale: 1.04, z: -40 }}
    animate={{ scale: 1, z: 0 }}
    transition={{ duration: 4.0, ease: EASE }}
    style={SCENE_3D}
  >
    <div
      style={{
        position: 'relative',
        width: 'min(900px, 86vw)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Tiny eyebrow above */}
      <motion.div
        initial={{ opacity: 0, y: 6, letterSpacing: '0.18em' }}
        animate={{ opacity: 0.65, y: 0, letterSpacing: '0.62em' }}
        transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 10,
          color: '#FAFAF8',
          textTransform: 'uppercase',
          paddingLeft: '0.62em', // visually centre with letter-spacing
        }}
      >
        Est · 2024 · A Studio Reel
      </motion.div>

      {/* Top hairline rule sweeps in */}
      <motion.div
        aria-hidden
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.55 }}
        transition={{ duration: 1.0, delay: 0.45, ease: EASE }}
        style={{
          width: 280,
          height: 1,
          background:
            'linear-gradient(to right, transparent, rgba(217,178,106,0.85), transparent)',
          transformOrigin: '50% 50%',
          filter: 'url(#bloomSoft)',
        }}
      />

      {/* The headline — clip-mask reveal from below, then it sets in space */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '0 0.06em' }}>
        <motion.h1
          initial={{ y: '105%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.55, ease: EASE }}
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(72px, 12vw, 200px)',
            lineHeight: 0.92,
            letterSpacing: '-0.025em',
            color: '#FAFAF8',
            textShadow: '0 0 90px rgba(255,255,255,0.18)',
          }}
        >
          6<span style={{ color: 'var(--brand-2)' }}>·</span>POINT
        </motion.h1>
      </div>

      {/* Bottom hairline rule sweeps in opposite to the top */}
      <motion.div
        aria-hidden
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.45 }}
        transition={{ duration: 1.0, delay: 1.5, ease: EASE }}
        style={{
          width: 360,
          height: 1,
          background:
            'linear-gradient(to right, transparent, rgba(255,255,255,0.7), transparent)',
          transformOrigin: '50% 50%',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 8, letterSpacing: '0.18em' }}
        animate={{ opacity: 0.85, y: 0, letterSpacing: '0.52em' }}
        transition={{ duration: 1.2, delay: 1.7, ease: EASE }}
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: 12,
          color: '#FAFAF8',
          textTransform: 'uppercase',
          paddingLeft: '0.52em',
        }}
      >
        Designs
      </motion.div>
    </div>

    {/* Soft outward exit cue — lift and fade as scene ends */}
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 0.9, 0] }}
      transition={{ duration: 4.2, times: [0, 0.7, 0.92, 1], ease: 'easeOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 55%)',
        mixBlendMode: 'screen',
      }}
    />
  </motion.div>
);

/* ─────────────────────────── SCENE 2 — MANIFESTO ─────────────────────────── */

const MANIFESTO_BEATS = [
  { word: 'WE',          ms: 600,  italic: false, color: '#FAFAF8',                 z: 600, size: 'clamp(80px, 16vw, 260px)' },
  { word: 'DESIGN',      ms: 750,  italic: false, color: '#FAFAF8',                 z: 600, size: 'clamp(80px, 16vw, 260px)' },
  { word: 'BRANDS',      ms: 800,  italic: false, color: '#FAFAF8',                 z: 700, size: 'clamp(80px, 16vw, 260px)' },
  { word: 'that feel…',  ms: 1000, italic: true,  color: 'rgba(255,255,255,0.6)',   z: 200, size: 'clamp(50px, 10vw, 160px)' },
  { word: 'inevitable.', ms: 2400, italic: true,  color: 'var(--brand-2)',          z: 250, size: 'clamp(60px, 12vw, 200px)', hold: true },
];

const SceneManifesto = () => {
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (beat >= MANIFESTO_BEATS.length - 1) return;
    const t = setTimeout(() => setBeat((b) => b + 1), MANIFESTO_BEATS[beat].ms);
    return () => clearTimeout(t);
  }, [beat]);
  const current = MANIFESTO_BEATS[Math.min(beat, MANIFESTO_BEATS.length - 1)];

  return (
    <div style={SCENE_3D}>
      {/* Sigil — small mark anchored top-right, slowly counter-spinning */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 0.4, x: 0 }}
        transition={{ duration: 1.4 }}
        style={{ position: 'absolute', top: 36, right: 36, transformStyle: 'preserve-3d' }}
      >
        <Mark size={32} color="#FAFAF8" bloom="soft" spinDuration={24} />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={beat}
          initial={{ opacity: 0, scale: 0.5, z: -1200, filter: 'blur(20px)' }}
          animate={{ opacity: 1, scale: 1, z: current.z, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.4, z: 800, filter: 'blur(18px)' }}
          transition={{ duration: current.hold ? 0.85 : 0.5, ease: EASE }}
          style={{
            position: 'relative',
            fontFamily: current.italic ? 'var(--font-display)' : 'var(--font-sans)',
            fontStyle: current.italic ? 'italic' : 'normal',
            fontWeight: current.italic ? 400 : 800,
            fontSize: current.size,
            color: current.color,
            letterSpacing: current.italic ? '-0.02em' : '-0.04em',
            lineHeight: 0.92,
            textAlign: 'center',
            textShadow: current.italic
              ? '0 0 80px rgba(217,178,106,0.5)'
              : '0 0 50px rgba(255,255,255,0.22)',
            whiteSpace: 'nowrap',
          }}
        >
          {current.word}
          {current.hold && (
            <motion.span
              aria-hidden
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1.0, ease: EASE }}
              style={{
                display: 'block',
                marginTop: 22,
                height: 5,
                background:
                  'linear-gradient(to right, transparent, var(--brand-2), transparent)',
                transformOrigin: '50% 50%',
                borderRadius: 999,
                filter: 'url(#bloomSoft)',
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────── SCENE 3 — BEAMS / DISCIPLINES ─────────────────────────── */

const DISCIPLINES = [
  { angle: 0,   label: 'Branding',    color: '#FAFAF8' },
  { angle: 90,  label: 'Web Design',  color: '#9DC3FF' },
  { angle: 180, label: 'Growth',      color: '#9DDDA0' },
  { angle: 270, label: 'Social',      color: '#E8C977' },
];

const SceneBeams = () => (
  <motion.div
    initial={{ rotateY: -18, rotateX: 6, z: -100 }}
    animate={{ rotateY: 18, rotateX: -4, z: 60 }}
    transition={{ duration: 6.6, ease: EASE }}
    style={SCENE_3D}
  >
    {/* Soft halo behind everything */}
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '60vmin',
        height: '60vmin',
        translateX: '-50%',
        translateY: '-50%',
        translateZ: -260,
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
        filter: 'blur(50px)',
        mixBlendMode: 'screen',
      }}
    />

    {/* Mark at centre, lifted slightly forward */}
    <motion.div
      initial={{ scale: 0.6, opacity: 0, z: 0 }}
      animate={{ scale: 1, opacity: 1, z: 60 }}
      transition={{ duration: 1.0, ease: EASE }}
      style={{ position: 'absolute', zIndex: 3 }}
    >
      <Mark size={150} color="#FAFAF8" bloom="strong" spinDuration={26} />
    </motion.div>

    {/* Four beams — rotated containers, line/glow only (no text) */}
    {DISCIPLINES.map((d, i) => (
      <BeamLine key={d.label} angle={d.angle} color={d.color} delay={0.55 + i * 0.16} />
    ))}

    {/* Four labels — flat, positioned in 2D so text never gets clipped */}
    {DISCIPLINES.map((d, i) => (
      <BeamLabel
        key={`${d.label}-label`}
        angle={d.angle}
        label={d.label}
        color={d.color}
        delay={0.55 + i * 0.16 + 0.95}
      />
    ))}
  </motion.div>
);

const BeamLine = ({ angle, color, delay }) => (
  <div
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '38vmin',
      height: 0,
      transform: `translateY(-50%) rotate(${angle}deg)`,
      transformOrigin: '0% 50%',
      pointerEvents: 'none',
    }}
  >
    {/* Soft volumetric ellipse */}
    <motion.span
      aria-hidden
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 0.85 }}
      transition={{ delay, duration: 1.2, ease: EASE }}
      style={{
        position: 'absolute',
        top: -28,
        left: 70,
        width: 'calc(100% - 70px)',
        height: 56,
        background: `radial-gradient(ellipse at 0% 50%, ${color} 0%, ${withAlpha(color, 0.18)} 45%, transparent 80%)`,
        filter: 'blur(12px)',
        mixBlendMode: 'screen',
        transformOrigin: '0% 50%',
      }}
    />
    {/* Sharp core */}
    <motion.span
      aria-hidden
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: delay + 0.1, duration: 1.0, ease: EASE }}
      style={{
        position: 'absolute',
        top: -1,
        left: 70,
        width: 'calc(100% - 70px)',
        height: 2,
        background: `linear-gradient(to right, ${color}, transparent)`,
        boxShadow: `0 0 14px ${color}`,
        transformOrigin: '0% 50%',
        filter: 'url(#bloomSoft)',
      }}
    />

    {/* Photon traveller — drifts inward toward the mark */}
    <motion.span
      aria-hidden
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 70, opacity: [0, 1, 1, 0] }}
      transition={{
        delay: delay + 0.6,
        duration: 1.6,
        ease: 'easeIn',
        repeat: Infinity,
        repeatDelay: 0.4,
      }}
      style={{
        position: 'absolute',
        top: -4,
        left: 0,
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 14px ${color}, 0 0 32px ${color}`,
        filter: 'url(#bloomSoft)',
      }}
    />
  </div>
);

/* Labels render flat in 2D over the rotated rig. We position each at the
   computed end-point of its beam and offset its anchor based on direction
   so long words like "Web Design" or "Social" never get clipped or
   obscured by the rotated parent transform.

   Positioning is on an outer wrapper so framer-motion's animated transform
   on the inner element doesn't fight the static placement transform. */
const BeamLabel = ({ angle, label, color, delay }) => {
  const rad = (angle * Math.PI) / 180;
  const sx = Math.sin(rad);
  const sy = -Math.cos(rad);
  // Anchor offsets in element-percent so the label grows *outward* from the tip.
  //   top    (sx 0,  sy -1):  centred above the point   → (-50%, -100%)
  //   right  (sx 1,  sy  0):  to the right of the point → (   0%,  -50%)
  //   bottom (sx 0,  sy  1):  centred below the point   → (-50%,    0%)
  //   left   (sx -1, sy  0):  to the left of the point  → (-100%, -50%)
  const tx = -50 + 50 * sx;
  const ty = -50 + 50 * sy;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(calc(${sx} * (38vmin + 22px) + ${tx}%), calc(${sy} * (38vmin + 22px) + ${ty}%))`,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 4,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.9, ease: EASE }}
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(22px, 2.6vw, 38px)',
          color: '#FAFAF8',
          textShadow: `0 0 24px ${withAlpha(color, 0.7)}`,
          lineHeight: 1,
        }}
      >
        {label}
      </motion.div>
    </div>
  );
};

/* ─────────────────────────── SCENE 4 — PROCESS ─────────────────────────── */

const STEPS = ['Discover', 'Strategy', 'Design', 'Build', 'Launch', 'Grow'];

const SceneProcess = () => {
  const [lit, setLit] = useState(-1);
  useEffect(() => {
    if (lit >= STEPS.length - 1) return;
    const t = setTimeout(() => setLit((n) => n + 1), 950);
    return () => clearTimeout(t);
  }, [lit]);

  return (
    <motion.div
      initial={{ x: 60, rotateY: -14, z: -80 }}
      animate={{ x: -60, rotateY: 14, z: 40 }}
      transition={{ duration: 7.4, ease: EASE }}
      style={SCENE_3D}
    >
      {/* Distant gold haze */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          width: '60vmin',
          height: '40vmin',
          translateX: '-50%',
          translateZ: -380,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(217,178,106,0.32) 0%, transparent 70%)',
          filter: 'blur(60px)',
          mixBlendMode: 'screen',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '78vw',
          maxWidth: 1100,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Track + filling beam */}
        <div style={{ position: 'relative', height: 2, background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 6.4, ease: EASE }}
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to right, var(--brand) 0%, var(--brand-2) 50%, #FAFAF8 100%)',
              transformOrigin: '0% 50%',
              boxShadow: '0 0 22px rgba(217,178,106,0.5)',
              filter: 'url(#bloomSoft)',
            }}
          />
          {/* Travelling head spark */}
          <motion.span
            aria-hidden
            initial={{ left: 0, opacity: 0 }}
            animate={{ left: '100%', opacity: [0, 1, 1, 0.6] }}
            transition={{ duration: 6.4, ease: EASE }}
            style={{
              position: 'absolute',
              top: -10,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#FAFAF8',
              boxShadow:
                '0 0 14px #FAFAF8, 0 0 32px var(--brand-2), 0 0 80px var(--brand-2)',
              translate: '-50% 0',
              filter: 'url(#bloomStrong)',
            }}
          />
        </div>

        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`,
            marginTop: 32,
          }}
        >
          {STEPS.map((label, i) => (
            <ProcessNode key={label} label={label} index={i} active={i <= lit} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const ProcessNode = ({ label, index, active }) => (
  <div
    style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
    }}
  >
    <motion.span
      aria-hidden
      animate={{
        height: active ? 22 : 6,
        background: active ? '#FAFAF8' : 'rgba(255,255,255,0.18)',
      }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        width: 1.5,
        marginTop: -32,
        boxShadow: active ? '0 0 12px rgba(255,255,255,0.65)' : 'none',
      }}
    />
    {active && (
      <motion.span
        aria-hidden
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 1.6, 1], opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{
          position: 'absolute',
          top: -42,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'var(--brand-2)',
          boxShadow: '0 0 18px var(--brand-2), 0 0 40px rgba(217,178,106,0.6)',
          filter: 'url(#bloomSoft)',
        }}
      />
    )}
    <motion.span
      animate={{
        opacity: active ? 1 : 0.18,
        y: active ? 0 : 10,
        color: active ? '#FAFAF8' : 'rgba(255,255,255,0.5)',
      }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 'clamp(22px, 2.4vw, 32px)',
        letterSpacing: '-0.01em',
      }}
    >
      {label}
    </motion.span>
    <motion.span
      animate={{ opacity: active ? 0.45 : 0 }}
      transition={{ duration: 0.6 }}
      style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 10,
        letterSpacing: '0.22em',
        color: 'rgba(255,255,255,0.55)',
        textTransform: 'uppercase',
      }}
    >
      Step 0{index + 1}
    </motion.span>
  </div>
);

/* ─────────────────────────── SCENE 5 — PRINCIPLES ─────────────────────────── */

const PRINCIPLES = [
  { word: 'Honest.',         color: '#FAFAF8',         ms: 1400 },
  { word: 'Fast.',           color: 'var(--brand)',    ms: 1400 },
  { word: 'Made with care.', color: 'var(--brand-2)',  ms: 2400, multiline: true },
];

const ScenePrinciples = () => {
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (beat >= PRINCIPLES.length - 1) return;
    const t = setTimeout(() => setBeat((b) => b + 1), PRINCIPLES[beat].ms);
    return () => clearTimeout(t);
  }, [beat]);
  const current = PRINCIPLES[Math.min(beat, PRINCIPLES.length - 1)];

  return (
    <div style={SCENE_3D}>
      <AnimatePresence>
        <motion.div
          key={`flash-${beat}`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: '#FAFAF8',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={beat}
          initial={{ z: -1600, opacity: 0, filter: 'blur(40px)', rotateX: -8 }}
          animate={{ z: 280, opacity: 1, filter: 'blur(0px)', rotateX: 0 }}
          exit={{ z: 1000, opacity: 0, filter: 'blur(30px)' }}
          transition={{ duration: 0.7, ease: EASE }}
          style={{
            position: 'relative',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: current.multiline
              ? 'clamp(60px, 11vw, 200px)'
              : 'clamp(80px, 16vw, 280px)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            color: current.color,
            textAlign: 'center',
            textShadow: '0 0 90px rgba(255,255,255,0.22)',
            transformStyle: 'preserve-3d',
          }}
        >
          {current.multiline ? (
            <>
              <span style={{ display: 'block' }}>Made</span>
              <span style={{ display: 'block', opacity: 0.85 }}>with</span>
              <span style={{ display: 'block', color: 'var(--brand-2)' }}>care.</span>
            </>
          ) : (
            current.word
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────── SCENE 6 — FINALE ─────────────────────────── */

const SceneFinale = () => (
  <motion.div
    initial={{ z: 220, scale: 1.1 }}
    animate={{ z: 0, scale: 1 }}
    transition={{ duration: 5.6, ease: EASE }}
    style={SCENE_3D}
  >
    {/* Big sage halo at depth */}
    <motion.div
      aria-hidden
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1.5, opacity: 1 }}
      transition={{ duration: 4.4, ease: EASE }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '76vmin',
        height: '76vmin',
        translateX: '-50%',
        translateY: '-50%',
        translateZ: -220,
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(116,142,117,0.6) 0%, rgba(116,142,117,0.16) 45%, transparent 72%)',
        filter: 'blur(46px)',
        mixBlendMode: 'screen',
      }}
    />
    <motion.div
      aria-hidden
      animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
      transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '40vmin',
        height: '40vmin',
        translateX: '-50%',
        translateY: '-50%',
        translateZ: -100,
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(217,178,106,0.6) 0%, transparent 70%)',
        filter: 'blur(36px)',
        mixBlendMode: 'screen',
      }}
    />

    <motion.div
      initial={{ scale: 0.3, opacity: 0, z: -200 }}
      animate={{ scale: 1, opacity: 1, z: 0 }}
      transition={{ duration: 1.6, ease: EASE }}
      style={{ position: 'relative', zIndex: 2, transformStyle: 'preserve-3d' }}
    >
      <Mark size={260} color="#FAFAF8" bloom="strong" spinDuration={28} />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 1.0, ease: EASE }}
      style={{
        position: 'absolute',
        bottom: '14vh',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 3,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'clamp(40px, 6vw, 84px)',
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          color: '#FAFAF8',
          fontStyle: 'italic',
        }}
      >
        Let’s <span style={{ color: 'var(--brand-2)' }}>talk.</span>
      </div>
      <motion.a
        href="/#contact"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 28,
          padding: '13px 16px 13px 24px',
          borderRadius: 999,
          background: '#FAFAF8',
          color: '#0B0B0C',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: '0.005em',
          textDecoration: 'none',
          boxShadow: '0 18px 50px rgba(116,142,117,0.45)',
        }}
      >
        Begin a project
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            background: 'var(--brand-2)',
            color: '#0B0B0C',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowUpRight size={15} strokeWidth={2.4} />
        </span>
      </motion.a>
    </motion.div>
  </motion.div>
);

/* ─────────────────────────── ATMOSPHERIC LAYERS ─────────────────────────── */

const FilmGrain = () => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      mixBlendMode: 'overlay',
      opacity: 0.16,
      zIndex: 7,
    }}
  >
    <svg width="100%" height="100%" style={{ display: 'block' }}>
      <rect width="100%" height="100%" filter="url(#grain)" opacity="0.55" />
    </svg>
  </div>
);

const Vignette = () => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background:
        'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)',
      zIndex: 6,
    }}
  />
);

const Letterbox = () => (
  <>
    <motion.div
      initial={{ y: '-100%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '6vh',
        background: '#000',
        zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    />
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '6vh',
        background: '#000',
        zIndex: 50,
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}
    />
  </>
);

const Cursor = () => {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 320, damping: 30, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 320, damping: 30, mass: 0.4 });

  useEffect(() => {
    if ('ontouchstart' in window) return;
    const move = (e) => { x.set(e.clientX - 14); y.set(e.clientY - 14); };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: 28, height: 28,
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0.15) 70%, transparent 75%)',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        zIndex: 9998,
        x: sx, y: sy,
      }}
    />
  );
};

/* ─────────────────────────── HUD ─────────────────────────── */

const HUD = ({ elapsed, sceneIndex, onReplay, finished }) => (
  <>
    <div
      style={{
        position: 'absolute',
        bottom: 14, left: 22,
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 10,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.55)',
      }}
    >
      <motion.span
        aria-hidden
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
        style={{
          width: 8, height: 8,
          borderRadius: '50%',
          background: 'var(--brand-2)',
          boxShadow: '0 0 10px var(--brand-2)',
        }}
      />
      Reel · 6POINT ’26 · Scene {String(sceneIndex + 1).padStart(2, '0')} of {String(SCENES.length).padStart(2, '0')}
    </div>

    <div
      style={{
        position: 'absolute',
        bottom: 14, right: 22,
        zIndex: 70,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {finished && (
        <HudButton onClick={onReplay} ariaLabel="Replay">
          <RotateCcw size={13} strokeWidth={2.2} /> Replay
        </HudButton>
      )}
      <a
        href="/"
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
          textDecoration: 'none',
          padding: '6px 4px',
        }}
      >
        Exit
      </a>
    </div>

    <div
      style={{
        position: 'absolute',
        bottom: 18,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 70,
        width: 'min(380px, 50vw)',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: 2,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.10)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ width: `${Math.min(100, (elapsed / TOTAL_DURATION) * 100)}%` }}
          transition={{ duration: 0.18, ease: 'linear' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--brand) 0%, var(--brand-2) 100%)',
            borderRadius: 999,
            boxShadow: '0 0 10px var(--brand-2)',
          }}
        />
        {SCENES.slice(0, -1).map((_, i) => {
          const cum = SCENES.slice(0, i + 1).reduce((a, s) => a + s.duration, 0);
          return (
            <span
              key={i}
              aria-hidden
              style={{
                position: 'absolute',
                top: -1,
                left: `${(cum / TOTAL_DURATION) * 100}%`,
                width: 1,
                height: 4,
                background: 'rgba(255,255,255,0.25)',
              }}
            />
          );
        })}
      </div>
    </div>
  </>
);

const HudButton = ({ onClick, children, ariaLabel }) => (
  <motion.button
    onClick={onClick}
    aria-label={ariaLabel}
    whileHover={{ y: -1 }}
    whileTap={{ scale: 0.95 }}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 10px',
      borderRadius: 999,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: 'rgba(255,255,255,0.85)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 10,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    }}
  >
    {children}
  </motion.button>
);

/* ─────────────────────────── CURTAIN ─────────────────────────── */

const Curtain = ({ onPlay }) => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.7 }}
    style={{
      position: 'absolute',
      inset: 0,
      background: '#000',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
    }}
  >
    <motion.div
      aria-hidden
      animate={{ rotate: 360 }}
      transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
      style={{ opacity: 0.08 }}
    >
      <Mark size={520} color="#FAFAF8" bloom="soft" spinDuration={60} />
    </motion.div>

    <div
      style={{
        position: 'absolute',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
      }}
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        style={{
          margin: 0,
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.42em',
          color: 'rgba(255,255,255,0.55)',
          textTransform: 'uppercase',
        }}
      >
        A Reel by 6POINT Designs
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1.0, ease: EASE }}
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontStyle: 'italic',
          fontSize: 'clamp(40px, 6vw, 92px)',
          lineHeight: 1.0,
          color: '#FAFAF8',
          textShadow: '0 0 80px rgba(116,142,117,0.45)',
        }}
      >
        Six points,{' '}
        <span style={{ color: 'var(--brand)' }}>one promise.</span>
      </motion.h1>

      <motion.button
        onClick={onPlay}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        style={{
          marginTop: 16,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 22px 14px 18px',
          borderRadius: 999,
          background: '#FAFAF8',
          color: '#0B0B0C',
          border: 'none',
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: '0 18px 50px rgba(116,142,117,0.45)',
        }}
      >
        <span
          style={{
            width: 28, height: 28,
            borderRadius: 999,
            background: 'var(--brand)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Play size={13} strokeWidth={2.6} />
        </span>
        Press to play
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{
          margin: 0,
          marginTop: 8,
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
        }}
      >
        {(TOTAL_DURATION / 1000).toFixed(0)}s · No sound
      </motion.p>
    </div>
  </motion.div>
);

/* ─────────────────────────── SEQUENCER ─────────────────────────── */

const SCENE_COMPONENTS = [
  SceneTitle,
  SceneManifesto,
  SceneBeams,
  SceneProcess,
  ScenePrinciples,
  SceneFinale,
];

/* Tiny color helper — derive an rgba() with custom alpha from a hex/CSS
   color. Falls back to dark ink for unknown inputs. */
function withAlpha(color, a) {
  if (typeof color !== 'string') return `rgba(11,11,12,${a})`;
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  return color;
}

export const AnimationTest = () => {
  const [started, setStarted] = useState(false);
  const [scene, setScene] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [runId, setRunId] = useState(0);

  /* Lock body scroll while the reel is mounted */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* Scene auto-advance */
  useEffect(() => {
    if (!started) return;
    if (scene >= SCENES.length - 1) return;
    const t = setTimeout(() => setScene((s) => s + 1), SCENES[scene].duration);
    return () => clearTimeout(t);
  }, [scene, started, runId]);

  /* Smooth elapsed counter for the progress bar */
  useEffect(() => {
    if (!started) return;
    const t0 = performance.now();
    const before = SCENES.slice(0, scene).reduce((a, s) => a + s.duration, 0);
    let raf;
    const tick = (now) => {
      const into = Math.min(SCENES[scene].duration, now - t0);
      setElapsed(before + into);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scene, started, runId]);

  const onPlay = useCallback(() => {
    setStarted(true);
    setScene(0);
    setElapsed(0);
  }, []);

  const onReplay = useCallback(() => {
    setScene(0);
    setElapsed(0);
    setRunId((r) => r + 1);
  }, []);

  const SceneNow = SCENE_COMPONENTS[scene];
  const finished = started && scene >= SCENES.length - 1 && elapsed >= TOTAL_DURATION - 200;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        color: '#FAFAF8',
        overflow: 'hidden',
        cursor: 'none',
      }}
    >
      <SvgDefs />
      <Cursor />

      {started && (
        <>
          <Vignette />
          <FilmGrain />
          <Letterbox />
        </>
      )}

      {started && (
        <div style={STAGE_FRAME}>
          <AnimatePresence mode="sync">
            <motion.div
              key={`${scene}-${runId}`}
              initial={{ opacity: 0, filter: 'blur(14px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(12px)' }}
              transition={{ duration: 0.85, ease: EASE }}
              style={{
                position: 'absolute',
                inset: 0,
                transformStyle: 'preserve-3d',
              }}
            >
              <SceneNow />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {started && (
        <HUD
          elapsed={elapsed}
          sceneIndex={scene}
          onReplay={onReplay}
          finished={finished}
        />
      )}

      <AnimatePresence>
        {!started && <Curtain onPlay={onPlay} />}
      </AnimatePresence>
    </div>
  );
};
