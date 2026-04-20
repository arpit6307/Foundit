// src/components/SubscriptionModal.jsx
import React from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Zap, QrCode, Image as ImageIcon, 
  Radio, ArrowRight, Lock, CheckCircle2, X 
} from 'lucide-react';

const SubscriptionModal = ({ show, onHide, onUpgrade }) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="lg" 
      contentClassName="bg-transparent border-0"
      backdrop="static" // Taki user bahar click karke na bhage
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card-premium-dark p-4 p-md-5 position-relative overflow-hidden shadow-lg"
        style={{ 
          border: '1px solid rgba(212, 175, 55, 0.3)',
          background: 'rgba(5, 5, 5, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px'
        }}
      >
        {/* Decorative elements */}
        <div className="position-absolute top-0 end-0 p-4 opacity-10">
            <ShieldCheck size={150} color="var(--gold-solid)" strokeWidth={1} />
        </div>
        
        {/* Close Button */}
        <button 
          onClick={onHide} 
          className="position-absolute top-0 end-0 m-4 btn p-1 text-muted hover-white transition-smooth"
          style={{ zIndex: 10 }}
        >
          <X size={20} />
        </button>

        <div className="text-center mb-5">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
              className="d-inline-block mb-3"
            >
              <Zap size={32} color="var(--gold-solid)" fill="var(--gold-solid)" />
            </motion.div>
            <h6 className="subtext-tracking text-luxury-gold mb-2" style={{ letterSpacing: '4px' }}>LIMIT REACHED</h6>
            <h2 className="heading-tracking text-white mb-3" style={{ fontSize: '2rem' }}>EVOLVE YOUR <span className="text-luxury-gold">SECURITY</span></h2>
            <p className="subtext-tracking text-muted mx-auto" style={{ textTransform: 'none', maxWidth: '500px', fontSize: '0.85rem' }}>
              Your current identity level is restricted. Upgrade to Silver Vault for full tactical recovery capabilities.
            </p>
        </div>

        <Row className="g-4 position-relative">
          {/* Plan 1: Bronze (Current) */}
          <Col md={6}>
            <div 
              className="p-4 rounded-4 h-100 transition-smooth" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.05)' 
              }}
            >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="heading-tracking text-muted m-0" style={{ fontSize: '0.75rem' }}>BRONZE TIER</h5>
                  <span className="px-2 py-1 rounded bg-dark text-muted subtext-tracking" style={{ fontSize: '0.5rem' }}>ACTIVE</span>
                </div>
                
                <div className="mb-4">
                    <h2 className="heading-tracking text-white m-0">FREE</h2>
                    <p className="subtext-tracking text-muted" style={{ fontSize: '0.6rem' }}>Entry Level Protocol</p>
                </div>

                <div className="d-flex flex-column gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <CheckCircle2 size={16} color="var(--gold-solid)" />
                        <span className="subtext-tracking text-white" style={{ fontSize: '0.75rem' }}>1 Secure Asset Tag</span>
                    </div>
                    <div className="d-flex align-items-center gap-3 opacity-50">
                        <Lock size={16} color="var(--text-muted)" />
                        <span className="subtext-tracking text-muted" style={{ fontSize: '0.75rem' }}>Visual Evidence Locked</span>
                    </div>
                    <div className="d-flex align-items-center gap-3 opacity-50">
                        <Lock size={16} color="var(--text-muted)" />
                        <span className="subtext-tracking text-muted" style={{ fontSize: '0.75rem' }}>Advanced Radar Locked</span>
                    </div>
                </div>
            </div>
          </Col>

          {/* Plan 2: Silver (Premium Upgrade) */}
          <Col md={6}>
            <motion.div 
                whileHover={{ y: -5, boxShadow: '0 10px 40px rgba(212, 175, 55, 0.15)' }}
                className="p-4 rounded-4 h-100 position-relative overflow-hidden" 
                style={{ 
                    background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.15), rgba(5, 5, 5, 1))',
                    border: '1px solid var(--gold-solid)',
                }}
            >
                {/* Visual Flare */}
                <div className="position-absolute top-0 start-0 w-100 h-1 px-5 bg-gold-solid opacity-50"></div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="heading-tracking text-luxury-gold m-0" style={{ fontSize: '0.75rem' }}>SILVER VAULT</h5>
                    <div className="px-2 py-1 rounded bg-gold-solid text-black fw-bold subtext-tracking" style={{ fontSize: '0.5rem' }}>RECOMMENDED</div>
                </div>

                <div className="mb-4">
                    <div className="d-flex align-items-baseline gap-2">
                      <h2 className="heading-tracking text-white m-0" style={{ fontSize: '2.5rem' }}>₹99</h2>
                      <span className="subtext-tracking text-muted" style={{ fontSize: '0.75rem' }}>/ 30 DAYS</span>
                    </div>
                    <p className="subtext-tracking text-luxury-gold" style={{ fontSize: '0.6rem' }}>Full Tactical Unlocked</p>
                </div>

                <div className="d-flex flex-column gap-3 mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <QrCode size={18} color="var(--gold-solid)" />
                        <span className="subtext-tracking text-white" style={{ fontSize: '0.75rem' }}>5 Premium Active Tags</span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <ImageIcon size={18} color="var(--gold-solid)" />
                        <span className="subtext-tracking text-white" style={{ fontSize: '0.75rem' }}>Finder Image Uploads</span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <Radio size={18} color="var(--gold-solid)" />
                        <span className="subtext-tracking text-white" style={{ fontSize: '0.75rem' }}>Priority Signal Radar</span>
                    </div>
                </div>

                <button 
                    onClick={onUpgrade}
                    className="btn-gold-solid w-100 py-3 d-flex align-items-center justify-content-center gap-2 border-0 transition-smooth"
                    style={{ fontSize: '0.85rem', fontWeight: 'bold' }}
                >
                    UPGRADE IDENTITY <ArrowRight size={18} />
                </button>
            </motion.div>
          </Col>
        </Row>

        <div className="text-center mt-5">
            <button 
              onClick={onHide} 
              className="btn p-0 text-muted subtext-tracking hover-white transition-smooth" 
              style={{ fontSize: '0.65rem', textDecoration: 'underline', textUnderlineOffset: '4px' }}
            >
              NOT NOW, I PREFER BASIC SECURITY
            </button>
        </div>
      </motion.div>

      <style>{`
        .modal-backdrop.show {
          backdrop-filter: blur(8px);
          background-color: rgba(0, 0, 0, 0.8) !important;
        }
      `}</style>
    </Modal>
  );
};

export default SubscriptionModal;