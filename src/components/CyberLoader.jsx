// src/components/CyberLoader.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const CyberLoader = ({ message = "ACCESSING SECURE VAULT..." }) => {
  return (
    <div 
      className="d-flex flex-column justify-content-center align-items-center w-100" 
      style={{ minHeight: '100vh', background: '#050505', zIndex: 9999 }}
    >
      <div className="d-flex flex-column align-items-center">
        {/* Animated Vault Shield */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="position-relative d-flex justify-content-center align-items-center"
          style={{ width: '100px', height: '100px' }}
        >
          {/* Outer Scanner Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: '1px dashed rgba(212, 175, 55, 0.2)',
              borderRadius: '50%',
              borderTop: '2px solid var(--gold-solid)',
            }}
          />
          {/* Inner Reverse Ring */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              width: '75%',
              height: '75%',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
              borderBottom: '2px solid var(--gold-solid)',
            }}
          />
          <ShieldCheck size={35} color="var(--gold-solid)" strokeWidth={1} />
        </motion.div>
        
        {/* Loading Text & Bar */}
        <div className="mt-4 text-center">
          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="heading-tracking text-luxury-gold m-0" 
            style={{ fontSize: '0.8rem', letterSpacing: '3px' }}
          >
            {message}
          </motion.p>
          
          {/* Minimalist Progress Bar */}
          <div 
            className="mx-auto mt-3 overflow-hidden" 
            style={{ width: '120px', height: '2px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px' }}
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, var(--gold-solid), transparent)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberLoader;