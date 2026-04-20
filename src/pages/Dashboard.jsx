// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import { db } from '../firebase-config';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, Sparkles, ShieldCheck, 
  ArrowRight, CheckCircle2, MapPin, 
  Fingerprint, Target, AlertTriangle, Scan, Boxes,
  Lock, Eye, Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const { askConfirm } = useConfirm();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ lostCount: 0, foundCount: 0, tagsCount: 0 });
  const [recentReports, setRecentReports] = useState([]);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => setShowSkeleton(false), 2000); 

    const lostQ = query(collection(db, "lostItems"), where("userId", "==", user.uid), where("status", "==", "lost"));
    const tagsQ = query(collection(db, "userQRs"), where("userId", "==", user.uid));
    const foundQ = query(collection(db, "lostItems"), where("userId", "==", user.uid), where("status", "==", "found"));
    
    const recentQ = query(
      collection(db, "lostItems"), 
      where("userId", "==", user.uid), 
      where("status", "==", "lost"), 
      orderBy("createdAt", "desc"), 
      limit(3)
    );

    const unsubLost = onSnapshot(lostQ, (snap) => setStats(prev => ({ ...prev, lostCount: snap.size })));
    const unsubTags = onSnapshot(tagsQ, (snap) => setStats(prev => ({ ...prev, tagsCount: snap.size })));
    const unsubFound = onSnapshot(foundQ, (snap) => setStats(prev => ({ ...prev, foundCount: snap.size })));
    const unsubRecent = onSnapshot(recentQ, (snap) => {
      setRecentReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { clearTimeout(timer); unsubLost(); unsubTags(); unsubFound(); unsubRecent(); };
  }, [user]);

  const handleMarkAsFound = (itemId, itemTitle) => {
    askConfirm("CONFIRM RECOVERY", `Securely mark "${itemTitle}" as found and recovered?`, async () => {
      try { 
        await updateDoc(doc(db, "lostItems", itemId), { status: "found" }); 
      } catch (err) { console.error(err); }
    }, 'success');
  };

  if (showSkeleton) return (
    <div className="dashboard-root d-flex flex-column justify-content-center align-items-center vh-100">
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        <Lock size={50} color="var(--gold-solid)" strokeWidth={1} />
      </motion.div>
      <h3 className="text-luxury-gold mt-4 heading-tracking" style={{ fontSize: '1rem' }}>Accessing Secure Vault</h3>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-root pb-5 pt-5">
      <div className="container-fluid px-4 px-lg-5 position-relative">
        
        {/* --- HEADER: ULTRA MINIMAL --- */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-5 border-bottom pb-4" style={{ borderColor: 'var(--border-white-thin) !important' }}>
          <div>
            <h1 className="m-0 text-white heading-tracking" style={{ fontSize: '2rem', fontWeight: 300 }}>
              COMMAND <span className="text-luxury-gold" style={{ fontWeight: 800 }}>CENTER</span>
            </h1>
            <p className="subtext-tracking mt-2 mb-0">Identity: {user?.uid.substring(0,10).toUpperCase()}</p>
          </div>

          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0 px-3 py-2" style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--border-gold-thin)', borderRadius: '4px' }}>
            <div style={{ width: '6px', height: '6px', background: 'var(--gold-solid)', borderRadius: '50%', boxShadow: '0 0 10px var(--gold-solid)' }}></div>
            <span className="text-luxury-gold subtext-tracking" style={{ fontSize: '0.65rem' }}>Encrypted Link Active</span>
          </div>
        </div>

        {/* --- STATS GRID: CLEAN & DARK --- */}
        <Row className="g-4 mb-5">
          {[
            { title: 'Active Breaches', val: stats.lostCount, icon: <AlertTriangle size={20} strokeWidth={1.5} />, color: '#fff' },
            { title: 'Secure Tags', val: stats.tagsCount, icon: <Fingerprint size={20} strokeWidth={1.5} />, color: 'var(--gold-solid)' },
            { title: 'Recovered Assets', val: stats.foundCount, icon: <ShieldCheck size={20} strokeWidth={1.5} />, color: '#fff' }
          ].map((s, i) => (
            <Col lg={4} key={i}>
              <motion.div whileHover={{ y: -4 }} className="card-premium-dark h-100 p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="subtext-tracking" style={{ color: s.color === 'var(--gold-solid)' ? 'var(--gold-solid)' : 'var(--text-muted)' }}>{s.title}</span>
                  <div style={{ color: s.color, opacity: 0.8 }}>{s.icon}</div>
                </div>
                <h2 className="m-0 mt-3" style={{ fontSize: '3rem', fontWeight: 200, color: s.color === 'var(--gold-solid)' ? 'var(--gold-solid)' : '#fff' }}>
                  {s.val < 10 ? `0${s.val}` : s.val}
                </h2>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* --- MAIN OPERATIONS --- */}
        <Row className="g-4 mb-5 align-items-stretch">
          
          {/* LEFT: ACTIONS */}
          <Col lg={7}>
            <div className="card-premium-dark h-100 p-4 p-lg-5">
              <h4 className="heading-tracking text-white mb-4" style={{ fontSize: '1rem' }}>Vault Operations</h4>
              
              <div className="d-flex flex-column gap-3">
                <div className="p-4 border rounded d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-white-thin) !important', cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => navigate('/generate-qr')} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--gold-solid)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-white-thin)'}>
                  <div className="d-flex align-items-center gap-4">
                    <Scan size={30} color="var(--gold-solid)" strokeWidth={1} />
                    <div>
                      <h5 className="heading-tracking text-white m-0" style={{ fontSize: '0.9rem' }}>Mint New Tag</h5>
                      <span className="subtext-tracking" style={{ textTransform: 'none' }}>Generate a secure QR identity for a new asset.</span>
                    </div>
                  </div>
                  <ArrowRight size={20} color="var(--text-muted)" />
                </div>

                <div className="p-4 border rounded d-flex justify-content-between align-items-center mt-2" style={{ borderColor: 'var(--border-white-thin) !important', cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => navigate('/report-lost')} onMouseOver={(e) => e.currentTarget.style.borderColor = '#fff'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-white-thin)'}>
                  <div className="d-flex align-items-center gap-4">
                    <AlertTriangle size={30} color="#fff" strokeWidth={1} />
                    <div>
                      <h5 className="heading-tracking text-white m-0" style={{ fontSize: '0.9rem' }}>Report Asset Loss</h5>
                      <span className="subtext-tracking" style={{ textTransform: 'none' }}>Broadcast a lost signal to the global network.</span>
                    </div>
                  </div>
                  <ArrowRight size={20} color="var(--text-muted)" />
                </div>
              </div>
            </div>
          </Col>

          {/* RIGHT: LIVE RADAR */}
          <Col lg={5}>
            <div className="card-premium-dark h-100 d-flex flex-column p-4 p-lg-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="heading-tracking text-white m-0 d-flex align-items-center gap-2" style={{ fontSize: '1rem' }}>
                  <Target size={18} color="var(--gold-solid)" strokeWidth={1.5} /> Active Radar
                </h4>
              </div>

              <div className="flex-grow-1 overflow-auto no-scrollbar">
                <AnimatePresence mode='popLayout'>
                  {recentReports.length > 0 ? (
                    recentReports.map((r) => (
                      <motion.div 
                        key={r.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="d-flex align-items-center gap-3 p-3 mb-3 border-bottom"
                        style={{ borderColor: 'var(--border-white-thin) !important' }}
                      >
                        <div style={{ width: '45px', height: '45px', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
                            {r.image ? (
                              <img src={r.image} alt={r.title} className="w-100 h-100 object-fit-cover opacity-75" />
                            ) : (
                              <div className="w-100 h-100 d-flex justify-content-center align-items-center"><Boxes size={18} color="var(--text-muted)" /></div>
                            )}
                        </div>

                        <div className="flex-grow-1 min-w-0">
                            <div className="text-white heading-tracking text-truncate" style={{ fontSize: '0.75rem' }}>{r.title}</div>
                            <div className="subtext-tracking text-truncate mt-1 d-flex align-items-center gap-1">
                                <MapPin size={10} color="var(--gold-solid)" /> {r.location}
                            </div>
                        </div>

                        <button 
                          onClick={() => handleMarkAsFound(r.id, r.title)}
                          className="btn p-2"
                          style={{ color: 'var(--text-muted)', transition: '0.3s' }}
                          title="Mark Recovered"
                          onMouseOver={(e) => e.currentTarget.style.color = 'var(--gold-solid)'}
                          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                            <CheckCircle2 size={20} strokeWidth={1.5} />
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-100 d-flex flex-column justify-content-center align-items-center text-center opacity-50 py-4">
                      <ShieldCheck size={35} color="var(--gold-solid)" strokeWidth={1} className="mb-3" />
                      <p className="subtext-tracking">Network Clear.<br/>All assets are secure.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-3 border-top" style={{ borderColor: 'var(--border-white-thin) !important' }}>
                <button className="btn-dark-outline w-100 d-flex justify-content-center align-items-center gap-2" style={{ fontSize: '0.7rem' }} onClick={() => navigate('/showcase')}>
                  <Globe size={14} /> Open Global Feed
                </button>
              </div>
            </div>
          </Col>
        </Row>

      </div>
    </motion.div>
  );
};

export default Dashboard;