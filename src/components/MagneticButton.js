import React, { forwardRef, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const MagneticButton = forwardRef(function MagneticButton(
  {
    as = 'a',
    href,
    onClick,
    type,
    variant = 'primary',
    size = 'md',
    icon,
    children,
    style,
    disabled,
    strength = 14,
    fullWidth = false,
    ...rest
  },
  forwardedRef
) {
  const localRef = useRef(null);
  const ref = forwardedRef || localRef;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const ix = useTransform(sx, (v) => v * 0.45);
  const iy = useTransform(sy, (v) => v * 0.45);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el || disabled) return;
    const r = el.getBoundingClientRect();
    const relX = e.clientX - (r.left + r.width / 2);
    const relY = e.clientY - (r.top + r.height / 2);
    const max = strength;
    const clamp = (n) => Math.max(-max, Math.min(max, n));
    x.set(clamp(relX * 0.35));
    y.set(clamp(relY * 0.35));
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  const palette = (() => {
    switch (variant) {
      case 'light':       return { bg: '#FFFFFF', fg: 'var(--ink)', sweep: 'var(--ink)', sweepFg: '#FFFFFF', border: 'transparent' };
      case 'outline':     return { bg: 'transparent', fg: 'var(--ink)', sweep: 'var(--ink)', sweepFg: '#FFFFFF', border: 'var(--line-strong)' };
      case 'ghostLight':  return { bg: 'transparent', fg: '#FFFFFF', sweep: '#FFFFFF', sweepFg: 'var(--ink)', border: 'rgba(255,255,255,0.3)' };
      case 'ghost':       return { bg: 'transparent', fg: 'var(--ink)', sweep: 'var(--bg-soft)', sweepFg: 'var(--ink)', border: 'transparent' };
      case 'primary':
      default:            return { bg: 'var(--ink)', fg: '#FFFFFF', sweep: 'var(--brand)', sweepFg: '#FFFFFF', border: 'transparent' };
    }
  })();

  const sizing = (() => {
    switch (size) {
      case 'sm': return { padY: '9px', padX: '14px', fs: 13, gap: 8 };
      case 'lg': return { padY: '16px', padX: '24px', fs: 15, gap: 10 };
      case 'md':
      default:   return { padY: '13px', padX: '20px', fs: 14, gap: 10 };
    }
  })();

  const Comp = motion[as] || motion.a;

  const commonProps = {
    ref,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    onClick,
    disabled,
    style: {
      position: 'relative',
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : undefined,
      alignItems: 'center',
      justifyContent: 'center',
      gap: sizing.gap,
      padding: `${sizing.padY} ${sizing.padX}`,
      fontFamily: 'var(--font-sans)',
      fontSize: sizing.fs,
      fontWeight: 600,
      letterSpacing: '0.005em',
      color: palette.fg,
      background: palette.bg,
      border: `1px solid ${palette.border}`,
      borderRadius: 999,
      cursor: disabled ? 'not-allowed' : 'pointer',
      overflow: 'hidden',
      isolation: 'isolate',
      whiteSpace: 'nowrap',
      x: sx,
      y: sy,
      WebkitTapHighlightColor: 'transparent',
      ...style,
    },
    whileTap: disabled ? undefined : { scale: 0.97 },
    initial: 'rest',
    animate: 'rest',
    whileHover: disabled ? undefined : 'hover',
    ...rest,
  };

  const inner = (
    <>
      <motion.span
        aria-hidden
        variants={{ rest: { y: '105%' }, hover: { y: '0%' } }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, background: palette.sweep, zIndex: 0, borderRadius: 'inherit' }}
      />
      <motion.span
        style={{
          position: 'relative', zIndex: 1, display: 'inline-flex',
          alignItems: 'center', gap: sizing.gap, x: ix, y: iy, color: 'inherit',
        }}
      >
        <motion.span
          variants={{ rest: { color: palette.fg }, hover: { color: palette.sweepFg } }}
          transition={{ duration: 0.3 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: sizing.gap }}
        >
          <span>{children}</span>
          {icon && (
            <motion.span
              aria-hidden
              variants={{ rest: { x: 0 }, hover: { x: 4 } }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {icon}
            </motion.span>
          )}
        </motion.span>
      </motion.span>
    </>
  );

  if (as === 'a') return <Comp href={href} {...commonProps}>{inner}</Comp>;
  return <Comp type={type} {...commonProps}>{inner}</Comp>;
});
