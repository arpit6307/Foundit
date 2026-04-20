// src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Modal } from 'react-bootstrap';
import { db } from '../firebase-config';
import { useAuth } from '../context/AuthContext';
import { 
  collection, query, where, onSnapshot, doc, 
  deleteDoc, updateDoc, getDocs, orderBy 
} from 'firebase/firestore';
import { 
  Bell, Phone, MapPin, User, MessageSquare, 
  Trash2, ShieldCheck, Radio, X, Copy, Check, Zap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const { user } = useAuth();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState('');
  const [copied, setCopied] = useState(false);

  // ✅ FIXED: Added missing copyToClipboard function
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(selectedPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    // --- 📡 MULTI-COLLECTION SYNC LOGIC ---
    const signalsMap = new Map();

    // 1. Breach Notifications
    const qNotifications = query(
      collection(db, "notifications"),
      where("ownerId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    // 2. Admin Broadcasts
    const qAlerts = query(
      collection(db, "system_alerts"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const updateUnifiedSignals = () => {
      const unified = Array.from(signalsMap.values()).sort((a, b) => {
        const timeA = a.timestamp?.toMillis() || 0;
        const timeB = b.timestamp?.toMillis() || 0;
        return timeB - timeA;
      });
      setSignals(unified);
      setLoading(false);
    };

    const unsubNotifications = onSnapshot(qNotifications, (snap) => {
      snap.docs.forEach(doc => signalsMap.set(doc.id, { id: doc.id, ...doc.data(), category: 'breach' }));
      updateUnifiedSignals();
    }, (err) => {
      console.error("Breach Sync Error:", err);
      setLoading(false);
    });

    const unsubAlerts = onSnapshot(qAlerts, (snap) => {
      snap.docs.forEach(doc => signalsMap.set(doc.id, { id: doc.id, ...doc.data(), category: 'admin' }));
      updateUnifiedSignals();
    }, (err) => {
      console.error("Alert Sync Error:", err);
    });

    return () => {
      unsubNotifications();
      unsubAlerts();
    };
  }, [user]);

  const handleContactFinder = async (signal) => {
    try {
      const colName = signal.category === 'admin' ? "system_alerts" : "notifications";
      const signalRef = doc(db, colName, signal.id);
      await updateDoc(signalRef, { status: "read", read: true });

      if (signal.category === 'breach' && signal.qrId) {
        const lostItemQuery = query(
          collection(db, "lostItems"),
          where("qrId", "==", signal.qrId),
          where("status", "==", "lost")
        );
        const querySnapshot = await getDocs(lostItemQuery);
        querySnapshot.docs.map(itemDoc => 
          updateDoc(doc(db, "lostItems", itemDoc.id), { status: "found" })
        );
      }

      if (signal.finderContact) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = `tel:${signal.finderContact}`;
        } else {
          setSelectedPhone(signal.finderContact);
          setShowPhoneModal(true);
        }
      }
    } catch (err) {
      console.error("Protocol Override Error:", err);
    }
  };

  const deleteSignal = async (signal) => {
    if(!window.confirm("TERMINATE THIS SIGNAL PERMANENTLY?")) return;
    try {
      const colName = signal.category === 'admin' ? "system_alerts" : "notifications";
      await deleteDoc(doc(db, colName, signal.id));
      setSignals(prev => prev.filter(s => s.id !== signal.id));
    } catch (err) {
      console.error("Erase Error:", err);
    }
  };

  if (loading) return (
    <div className="dashboard-root d-flex flex-column justify-content-center align-items-center vh-100 bg-black">
      <Spinner animation="border" variant="warning" />
      <p className="mt-3 heading-tracking text-luxury-gold animate-pulse">DECRYPTING SIGNALS...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-root p-3 p-md-5 min-vh-100 bg-black">
      <Container>
        <div className="mb-5 border-bottom pb-4 border-white-thin">
          <div className="d-flex align-items-center gap-3">
            <div className="admin-avatar-glow"><Bell size={28} color="var(--gold-solid)" /></div>
            <div>
              <h1 className="heading-tracking text-white m-0">SIGNAL <span className="text-luxury-gold">CENTER</span></h1>
              <p className="subtext-tracking text-muted mt-1 uppercase" style={{fontSize: '0.6rem'}}>Encrypted Data Reception Node // Status: Secure</p>
            </div>
          </div>
        </div>

        <Row className="g-4">
          <AnimatePresence mode="popLayout">
            {signals.length > 0 ? (
              signals.map((sig) => (
                <Col md={6} lg={4} key={sig.id}>
                  <motion.div 
                    layout 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.8, opacity: 0 }}
                    className={`card-premium-dark p-4 h-100 position-relative ${sig.category === 'admin' ? 'border-gold-glow-thin' : ''}`} 
                    style={{ 
                      border: sig.category === 'admin' ? '1px solid var(--gold-solid)' : (sig.status === 'unread' || !sig.read ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.05)'),
                      background: sig.category === 'admin' ? 'rgba(212, 175, 55, 0.05)' : '#080808'
                    }}
                  >
                    
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        {sig.category === 'admin' ? (
                          <><Zap size={14} className="text-luxury-gold" /> <span className="subtext-tracking text-luxury-gold uppercase" style={{fontSize: '0.6rem'}}>Command Link</span></>
                        ) : (
                          <><Radio size={14} className="text-danger animate-pulse" /> <span className="subtext-tracking text-danger uppercase" style={{fontSize: '0.6rem'}}>Breach Alert</span></>
                        )}
                      </div>
                      <button onClick={() => deleteSignal(sig)} className="btn-erase" title="Delete Signal"><Trash2 size={16} /></button>
                    </div>

                    <h4 className="heading-tracking text-white mb-3" style={{ fontSize: '1rem', letterSpacing: '1.5px' }}>
                       {(sig.title || sig.assetName || "UNKNOWN_ASSET").toUpperCase()}
                    </h4>
                    
                    <div className="p-3 rounded mb-4 bg-black-depth border-white-thin shadow-inner">
                       <p className="m-0 subtext-tracking text-white" style={{ textTransform: 'none', fontSize: '0.75rem', lineHeight: '1.6' }}>
                          {sig.category === 'breach' && <MapPin size={12} className="me-2 text-luxury-gold" />}
                          {sig.body || sig.finderMessage || "No descriptive data provided."}
                       </p>
                    </div>

                    <div className="mt-auto d-flex justify-content-between align-items-center">
                       <div className="d-flex flex-column">
                          <span className="subtext-tracking text-muted" style={{fontSize: '0.55rem'}}>{sig.category === 'admin' ? 'SOURCE: AEGIS_OS' : `FINDER: ${sig.finderName || 'Anonymous'}`}</span>
                          <span className="subtext-tracking text-muted" style={{fontSize: '0.5rem'}}>{sig.timestamp?.toDate().toLocaleString('en-IN', {dateStyle:'medium'})}</span>
                       </div>
                       
                       {sig.category === 'breach' ? (
                         <button onClick={() => handleContactFinder(sig)} className="btn-gold-solid px-3 py-2 shadow-glow">
                           <Phone size={14} />
                         </button>
                       ) : (
                         <div className="text-luxury-gold opacity-50"><ShieldCheck size={20} /></div>
                       )}
                    </div>
                  </motion.div>
                </Col>
              ))
            ) : (
              <Col xs={12} className="text-center py-5 opacity-40">
                  <ShieldCheck size={60} color="var(--gold-solid)" className="mb-3 mx-auto" />
                  <p className="heading-tracking text-white uppercase" style={{fontSize:'0.8rem'}}>Operational Grid Clear</p>
              </Col>
            )}
          </AnimatePresence>
        </Row>
      </Container>

      {/* --- PHONE MODAL (SECURE) --- */}
      <Modal show={showPhoneModal} onHide={() => setShowPhoneModal(false)} centered contentClassName="bg-transparent border-0 shadow-none">
        <div className="card-premium-dark p-4 p-md-5 text-center border-gold-glow" style={{background:'#050505'}}>
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-white-thin">
             <span className="heading-tracking text-luxury-gold" style={{fontSize: '0.8rem'}}>SIGNAL_DATA_INTERCEPT</span>
             <button className="btn p-0 text-muted hover-white" onClick={() => setShowPhoneModal(false)}><X size={22}/></button>
          </div>
          <div className="d-flex align-items-center justify-content-between p-3 rounded mb-4 bg-black border-gold-thin shadow-glow">
             <h2 className="m-0 text-white heading-tracking" style={{letterSpacing: '4px', fontSize: '1.5rem'}}>{selectedPhone}</h2>
             <button onClick={copyToClipboard} className="btn-copy-action transition-smooth">
                {copied ? <Check size={20} color="#10b981" /> : <Copy size={20} color="var(--gold-solid)" />}
             </button>
          </div>
          <button className="btn-dark-outline w-100 py-3 heading-tracking" style={{fontSize:'0.65rem'}} onClick={() => setShowPhoneModal(false)}>ABORT_VIEW</button>
        </div>
      </Modal>

      <style>{`
        .bg-black-depth { background: rgba(255,255,255,0.02); }
        .border-white-thin { border: 1px solid rgba(255,255,255,0.05); }
        .border-gold-glow-thin { border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 0 20px rgba(212, 175, 55, 0.05); }
        .shadow-glow { box-shadow: 0 0 15px rgba(212, 175, 55, 0.2); }
        .shadow-inner { box-shadow: inset 0 0 10px rgba(0,0,0,0.5); }
        
        .btn-erase { background: transparent; border: none; color: #444; transition: 0.3s; }
        .btn-erase:hover { color: #ef4444; transform: scale(1.1); }
        
        .btn-copy-action { background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,25,0.2); border-radius: 8px; padding: 10px; }
        .btn-copy-action:hover { background: rgba(255,255,255,0.08); }

        .hover-white:hover { color: #fff !important; }
      `}</style>
    </motion.div>
  );
};

export default Notifications;