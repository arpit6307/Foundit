// src/components/ScrollToTopButton.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after 300px
      const scrolled = window.scrollY;
      setIsVisible(scrolled > 300);

      // Calculate progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SVG Circle Logic for Progress
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="scroll-to-top-wrap"
        >
          {/* Progress Ring */}
          <svg className="progress-ring" width="56" height="56">
            <circle
              className="progress-ring-bg"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
              fill="transparent"
              r={radius}
              cx="28"
              cy="28"
            />
            <motion.circle
              className="progress-ring-bar"
              stroke="var(--gold-solid)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="28"
              cy="28"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>

          {/* Icon Core */}
          <div className="scroll-icon-box">
            <ChevronUp size={24} color="var(--gold-solid)" />
          </div>

          <style>{`
            .scroll-to-top-wrap {
              position: fixed;
              bottom: 30px;
              right: 30px;
              width: 56px;
              height: 56px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              z-index: 999;
            }
            .progress-ring {
              position: absolute;
              transform: rotate(-90deg);
            }
            .scroll-icon-box {
              width: 44px;
              height: 44px;
              background: rgba(10, 10, 10, 0.8);
              backdrop-filter: blur(10px);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid rgba(212, 175, 55, 0.2);
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
              transition: all 0.3s ease;
            }
            .scroll-to-top-wrap:hover .scroll-icon-box {
              background: #000;
              border-color: var(--gold-solid);
              box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;