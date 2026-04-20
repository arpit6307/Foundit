// src/context/ConfirmContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger' // danger, warning, success
  });

  const askConfirm = (title, message, onConfirm, type = 'danger') => {
    setConfig({ title, message, onConfirm, type });
    setShow(true);
  };

  const handleConfirm = () => {
    config.onConfirm();
    setShow(false);
  };

  return (
    <ConfirmContext.Provider value={{ askConfirm }}>
      {children}
      
      {/* --- Dark Premium Custom Confirmation Modal --- */}
      <Modal 
        show={show} 
        onHide={() => setShow(false)} 
        centered 
        contentClassName="bg-transparent border-0"
        className="custom-confirm-modal"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-premium-dark p-4 p-md-5 text-center position-relative"
          style={{ border: `1px solid ${config.type === 'danger' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-gold-thin)'} !important` }}
        >
          {/* Close Button */}
          <button 
            className="position-absolute top-0 end-0 m-3 btn p-1 text-muted transition-smooth" 
            onClick={() => setShow(false)}
          >
            <X size={20} />
          </button>

          {/* Dynamic Icon Based on Type */}
          <div className="mb-4 d-inline-flex p-3 rounded-circle" 
               style={{ 
                 background: config.type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                 border: `1px solid ${config.type === 'danger' ? '#ef4444' : 'var(--gold-solid)'}`
               }}>
            {config.type === 'danger' ? (
              <ShieldAlert size={40} color="#ef4444" strokeWidth={1.5} />
            ) : config.type === 'success' ? (
              <CheckCircle2 size={40} color="var(--gold-solid)" strokeWidth={1.5} />
            ) : (
              <AlertTriangle size={40} color="var(--gold-solid)" strokeWidth={1.5} />
            )}
          </div>

          {/* Text Content */}
          <h4 className="heading-tracking text-white mb-2" style={{ fontSize: '1.2rem' }}>
            {config.title}
          </h4>
          <p className="subtext-tracking text-muted mb-5" style={{ textTransform: 'none', fontSize: '0.8rem', lineHeight: '1.6' }}>
            {config.message}
          </p>

          {/* Action Buttons */}
          <div className="d-flex flex-column flex-sm-row gap-3">
            <button 
              className="btn-dark-outline w-100 py-2 subtext-tracking" 
              onClick={() => setShow(false)}
              style={{ fontSize: '0.7rem' }}
            >
              ABORT MISSION
            </button>
            <button 
              className={`w-100 py-2 heading-tracking ${config.type === 'danger' ? 'btn-danger-premium' : 'btn-gold-solid'}`}
              onClick={handleConfirm}
              style={{ 
                fontSize: '0.7rem',
                background: config.type === 'danger' ? '#ef4444' : 'var(--gold-metallic)',
                color: config.type === 'danger' ? '#fff' : '#000',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 800
              }}
            >
              CONFIRM ACTION
            </button>
          </div>
        </motion.div>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);