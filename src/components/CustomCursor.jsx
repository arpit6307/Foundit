// src/components/CustomCursor.jsx
import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Springs for smooth trailing effect
  const sprOptions = { stiffness: 250, damping: 30 };
  const trail1 = { x: useSpring(0, sprOptions), y: useSpring(0, sprOptions) };
  const trail2 = { x: useSpring(0, { stiffness: 150, damping: 25 }), y: useSpring(0, { stiffness: 150, damping: 25 }) };
  const trail3 = { x: useSpring(0, { stiffness: 80, damping: 20 }), y: useSpring(0, { stiffness: 80, damping: 20 }) };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      setMousePosition({ x: clientX, y: clientY });
      
      trail1.x.set(clientX); trail1.y.set(clientY);
      trail2.x.set(clientX); trail2.y.set(clientY);
      trail3.x.set(clientX); trail3.y.set(clientY);
    };

    const handleHover = (e) => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.card-premium-dark')) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleHover);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleHover);
    };
  }, []);

  return (
    <div className="cursor-system d-none d-lg-block">
      {/* 1. Main Core Crosshair */}
      <motion.div
        className="main-dot"
        style={{ left: mousePosition.x, top: mousePosition.y }}
        animate={{ scale: isHovered ? 0.5 : 1 }}
      />

      {/* 2. Geometric Target Brackets */}
      {[0, 90, 180, 270].map((rotation, i) => (
        <motion.div
          key={i}
          className="cursor-bracket"
          style={{ left: mousePosition.x, top: mousePosition.y }}
          animate={{
            rotate: rotation,
            x: isHovered ? (rotation === 0 || rotation === 270 ? -20 : 20) : (rotation === 0 || rotation === 270 ? -12 : 12),
            y: isHovered ? (rotation === 0 || rotation === 90 ? -20 : 20) : (rotation === 0 || rotation === 90 ? -12 : 12),
            opacity: 1,
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      ))}

      {/* 3. Neural Trails (The Tail) */}
      <motion.div className="trail-dot t1" style={{ left: trail1.x, top: trail1.y, opacity: isHovered ? 0 : 0.6 }} />
      <motion.div className="trail-dot t2" style={{ left: trail2.x, top: trail2.y, opacity: isHovered ? 0 : 0.4 }} />
      <motion.div className="trail-dot t3" style={{ left: trail3.x, top: trail3.y, opacity: isHovered ? 0 : 0.2 }} />

      <style>{`
        .cursor-system {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 10000;
        }

        .main-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: var(--gold-solid);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 15px var(--gold-solid);
        }

        .cursor-bracket {
          position: absolute;
          width: 8px;
          height: 8px;
          border-top: 2px solid var(--gold-solid);
          border-left: 2px solid var(--gold-solid);
          transform-origin: center;
          margin-top: -4px;
          margin-left: -4px;
        }

        .trail-dot {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--gold-solid);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        @media (min-width: 992px) {
          body, button, a, .card-premium-dark {
            cursor: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomCursor;