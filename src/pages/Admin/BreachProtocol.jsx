// src/pages/Admin/BreachProtocol.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Row, Col, Badge, Spinner, Modal, Table } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, MapPin, Calendar, Eye, 
  Trash2, CheckCircle, Package, User, X, Phone, MessageSquare, Fingerprint
} from 'lucide-react';

const BreachProtocol = () => {
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBreach, setSelectedBreach] = useState(null);
  const [showIntel, setShowIntel] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setBreaches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "notifications", id), { status: newStatus });
    } catch (err) { console.error(err); }
  };

  const deleteLog = async (id) => {
    if(window.confirm("TERMINATE THIS INTELLIGENCE LOG PERMANENTLY?")) {
      try { await deleteDoc(doc(db, "notifications", id)); } catch (err) { console.error(err); }
    }
  };

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <Spinner animation="border" style={{color: 'var(--gold-solid)'}} />
      <p className="mt-3 heading-tracking text-luxury-gold animate-pulse uppercase" style={{fontSize: '0.7rem'}}>Synchronizing Matrix...</p>
    </div>
  );

  return (
    <div className="breach-protocol-root">
      {/* --- COMMAND HEADER --- */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="card-premium-dark p-4 mb-4 border-gold-glow bg-black">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h6 className="heading-tracking m-0 text-luxury-gold d-flex align-items-center gap-2">
              <ShieldAlert size={22} className="animate-pulse" /> BREACH_ACTIVITY_LOGS
            </h6>
            <p className="subtext-tracking text-muted m-0 mt-2" style={{fontSize: '0.65rem'}}>
              INTERCEPTED_PROTOCOLS: <span className="text-white fw-bold">{breaches.length}</span> // STATUS: SECURE
            </p>
          </div>
          <Badge bg="transparent" className="border-gold-thin text-luxury-gold px-3 py-2 subtext-tracking d-none d-md-block" style={{fontSize: '0.5rem'}}>ACCESS_LEVEL: ADMIN</Badge>
        </div>
      </motion.div>

      {/* --- CONTENT AREA --- */}
      <div className="content-scroll-container">
        <AnimatePresence mode="wait">
          {breaches.length > 0 ? (
            <>
              {/* DESKTOP VIEW: MASTER TERMINAL TABLE */}
              <div className="d-none d-md-block">
                <div className="card-premium-dark p-0 overflow-hidden border-white-thin">
                  <Table borderless responsive className="admin-table-custom m-0">
                    <thead>
                      <tr>
                        <th className="subtext-tracking">LOG_ID</th>
                        <th className="subtext-tracking">ASSET_IDENTITY</th>
                        <th className="subtext-tracking">LOCATION_FOUND</th>
                        <th className="subtext-tracking">TIMESTAMP</th>
                        <th className="subtext-tracking text-center">STATUS</th>
                        <th className="subtext-tracking text-end">COMMANDS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breaches.map((b, index) => (
                        <tr key={b.id} className={b.status === 'unread' ? 'row-alert' : ''}>
                          <td className="log-id">#{breaches.length - index}</td>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div className={`status-dot-table ${b.status}`}></div>
                              <div>
                                <div className="heading-tracking text-white" style={{fontSize: '0.75rem'}}>{b.assetName || 'UNIDENTIFIED'}</div>
                                <div className="subtext-tracking text-muted" style={{fontSize: '0.55rem'}}>VAULT_{b.qrId}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2 text-muted">
                              <MapPin size={12} className="text-luxury-gold" />
                              <span className="subtext-tracking" style={{fontSize: '0.65rem'}}>{b.locationFound || 'REDACTED'}</span>
                            </div>
                          </td>
                          <td className="subtext-tracking text-muted" style={{fontSize: '0.65rem'}}>
                            {b.timestamp?.toDate().toLocaleString('en-IN', {dateStyle: 'medium', timeStyle: 'short'})}
                          </td>
                          <td className="text-center">
                            <Badge className={`status-pill-premium ${b.status}`}>{b.status?.toUpperCase()}</Badge>
                          </td>
                          <td>
                            <div className="d-flex justify-content-end gap-2">
                              <button className="cyber-btn-premium" onClick={() => { setSelectedBreach(b); setShowIntel(true); }}><Eye size={16} /></button>
                              {b.status === 'unread' && (
                                <button className="cyber-btn-premium success" onClick={() => updateStatus(b.id, 'resolved')}><CheckCircle size={16} /></button>
                              )}
                              <button className="cyber-btn-premium danger" onClick={() => deleteLog(b.id)}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>

              {/* MOBILE VIEW: ELITE DUAL GRID */}
              <div className="d-md-none">
                <Row className="g-2">
                  {breaches.map((b, index) => (
                    <Col xs={6} key={b.id}>
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`elite-mobile-card ${b.status === 'unread' ? 'active-breach' : ''}`}>
                        <div className="mobile-card-header mb-2">
                          <span className="id-tag">#{breaches.length - index}</span>
                          <Fingerprint size={12} className={b.status === 'unread' ? 'text-danger' : 'text-luxury-gold'} />
                        </div>
                        <h6 className="mobile-asset-title text-truncate">{b.assetName || 'UNKNOWN'}</h6>
                        <p className="mobile-vault-id">ID: {b.qrId}</p>
                        
                        <div className="mobile-location-row mb-3">
                           <MapPin size={10} className="text-luxury-gold" />
                           <span className="text-truncate">{b.locationFound || 'REDACTED'}</span>
                        </div>

                        <div className="d-flex gap-1">
                          <button className="mobile-action-btn" onClick={() => { setSelectedBreach(b); setShowIntel(true); }}><Eye size={14} /></button>
                          {b.status === 'unread' ? (
                            <button className="mobile-action-btn gold" onClick={() => updateStatus(b.id, 'resolved')}><CheckCircle size={14} /></button>
                          ) : (
                            <button className="mobile-action-btn danger" onClick={() => deleteLog(b.id)}><Trash2 size={14} /></button>
                          )}
                        </div>
                      </motion.div>
                    </Col>
                  ))}
                </Row>
              </div>
            </>
          ) : (
            <div className="text-center py-5 opacity-40 border-white-thin rounded-4 bg-black">
              <ShieldAlert size={40} className="mb-3 text-muted" />
              <p className="heading-tracking uppercase" style={{fontSize: '0.7rem', letterSpacing: '2px'}}>Operational Grid Clear</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* --- MASTER DOSSIER MODAL --- */}
      <Modal show={showIntel} onHide={() => setShowIntel(false)} centered size="lg" contentClassName="bg-transparent border-0 shadow-none">
         <div className="card-premium-dark p-0 border-gold-glow overflow-hidden" style={{background: '#050505', borderRadius: '24px'}}>
            <div className="modal-cyber-header p-4 d-flex justify-content-between align-items-center border-bottom border-white-thin bg-black-depth">
               <div>
                  <h6 className="heading-tracking text-luxury-gold m-0">DOSSIER_CORE_ACCESS</h6>
                  <span className="subtext-tracking text-muted" style={{fontSize: '0.55rem'}}>VAULT_REF: {selectedBreach?.qrId} // LOG_STATE: {selectedBreach?.status?.toUpperCase()}</span>
               </div>
               <button className="btn-close-cyber" onClick={() => setShowIntel(false)}><X size={22} /></button>
            </div>
            
            <div className="modal-scroll-area custom-scrollbar" style={{maxHeight: '75vh', overflowY: 'auto'}}>
              <Row className="g-0">
                {/* Visual Evidence Section */}
                <Col lg={5} className="border-end border-white-thin p-4">
                   <label className="subtext-tracking text-luxury-gold d-block mb-3" style={{fontSize: '0.6rem'}}>VISUAL_INTERCEPT_DATA</label>
                   <div className="evidence-frame-premium">
                      {selectedBreach?.itemImageUrl ? (
                        <img src={selectedBreach.itemImageUrl} className="w-100 h-100 object-fit-cover" alt="intel" />
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 opacity-20">
                           <ShieldAlert size={50} className="mb-2" />
                           <span className="subtext-tracking">NO_VISUAL_CAPTURE</span>
                        </div>
                      )}
                   </div>
                </Col>

                {/* Intelligence Data Section */}
                <Col lg={7} className="p-4 bg-black-depth">
                   <div className="d-flex flex-column gap-4">
                      {/* Finder Section */}
                      <div className="intel-section">
                        <label className="subtext-tracking text-luxury-gold d-block mb-2" style={{fontSize: '0.6rem'}}>FINDER_IDENTIFICATION</label>
                        <div className="intel-data-grid">
                          <div className="intel-cell"><User size={14}/><span className="text-white">{selectedBreach?.finderName || 'Anonymous'}</span></div>
                          <div className="intel-cell"><Phone size={14}/><span className="text-white">{selectedBreach?.finderContact || 'ENCRYPTED'}</span></div>
                        </div>
                        <div className="mt-2 bg-black p-3 rounded border-white-thin">
                           <p className="subtext-tracking text-muted m-0 italic" style={{fontSize: '0.65rem'}}>
                              "{selectedBreach?.finderMessage || 'No descriptive signal broadcasted.'}"
                           </p>
                        </div>
                      </div>

                      {/* Asset Section */}
                      <div className="intel-section">
                        <label className="subtext-tracking text-luxury-gold d-block mb-2" style={{fontSize: '0.6rem'}}>ASSET_INTEL</label>
                        <div className="intel-data-grid">
                          <div className="intel-cell"><Package size={14}/><span className="text-white uppercase fw-bold">{selectedBreach?.assetName || 'UNIDENTIFIED'}</span></div>
                          <div className="intel-cell"><MapPin size={14}/><span className="text-white">{selectedBreach?.locationFound || 'LOC_UNKNOWN'}</span></div>
                        </div>
                      </div>

                      {/* Log Timestamp */}
                      <div className="p-3 bg-black border-gold-thin rounded-3 d-flex justify-content-between align-items-center">
                        <div>
                           <span className="text-muted extra-small d-block uppercase">Log_Created:</span>
                           <span className="text-white extra-small">{selectedBreach?.timestamp?.toDate().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-end">
                           <span className="text-muted extra-small d-block uppercase">Signature:</span>
                           <span className="text-luxury-gold extra-small fw-bold">AES_256_SECURED</span>
                        </div>
                      </div>
                   </div>
                   <button className="btn-gold-solid w-100 mt-4 py-3 heading-tracking shadow-gold" onClick={() => setShowIntel(false)}>TERMINATE_VIEW</button>
                </Col>
              </Row>
            </div>
         </div>
      </Modal>

      <style>{`
        /* Hide Scrollbars */
        .content-scroll-container, .modal-scroll-area {
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .content-scroll-container::-webkit-scrollbar, .modal-scroll-area::-webkit-scrollbar {
          display: none;
        }

        /* Desktop Table Design */
        .admin-table-custom thead th { 
          background: rgba(212, 175, 55, 0.03); color: #666; 
          font-size: 0.6rem; padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .admin-table-custom tbody td { 
          padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.02); 
          vertical-align: middle; background: transparent; transition: 0.2s;
        }
        .row-alert td { background: linear-gradient(90deg, rgba(239, 68, 68, 0.02) 0%, transparent 100%); }
        .status-dot-table { width: 6px; height: 6px; border-radius: 50%; }
        .status-dot-table.unread { background: #ef4444; box-shadow: 0 0 10px #ef4444; }
        .status-dot-table.resolved { background: var(--gold-solid); }

        .status-pill-premium { font-size: 0.5rem; letter-spacing: 1.5px; padding: 6px 12px; border-radius: 4px; font-weight: 900; }
        .status-pill-premium.unread { background: #ef4444 !important; color: white; }
        .status-pill-premium.resolved { background: var(--gold-solid) !important; color: black; }

        .cyber-btn-premium {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
          color: #888; padding: 8px; border-radius: 8px; transition: 0.2s;
        }
        .cyber-btn-premium:hover { border-color: var(--gold-solid); color: var(--gold-solid); background: rgba(212, 175, 55, 0.05); }
        .cyber-btn-premium.success:hover { background: var(--gold-solid); color: black; border-color: var(--gold-solid); }
        .cyber-btn-premium.danger:hover { background: #ef4444; color: white; border-color: #ef4444; }

        /* --- ADVANCED MOBILE CARDS --- */
        .elite-mobile-card {
          background: linear-gradient(145deg, #0a0a0a, #050505);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px; padding: 12px; height: 100%;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        }
        .active-breach { border-color: rgba(239, 68, 68, 0.3) !important; }
        .mobile-card-header { display: flex; justify-content: space-between; align-items: center; }
        .id-tag { font-family: monospace; font-size: 0.6rem; color: #666; font-weight: 800; }
        .mobile-asset-title { color: white; font-size: 0.7rem; font-weight: 800; margin: 5px 0 0 0; }
        .mobile-vault-id { font-size: 0.5rem; color: var(--gold-solid); font-family: monospace; opacity: 0.7; margin-bottom: 8px; }
        .mobile-location-row { display: flex; align-items: center; gap: 4px; font-size: 0.55rem; color: #888; }
        .mobile-action-btn {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          color: #fff; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
        }
        .mobile-action-btn.gold { background: var(--gold-solid); color: #000; border-color: var(--gold-solid); }
        .mobile-action-btn.danger { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); color: #ef4444; }

        /* Modal Elements */
        .evidence-frame-premium { height: 350px; border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.2); background: #000; overflow: hidden; box-shadow: 0 0 30px rgba(0,0,0,1); }
        .intel-data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .intel-cell { background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 8px; font-size: 0.7rem; }
        .bg-black-depth { background: #020202; }
        .btn-close-cyber { background: transparent; border: none; color: #666; transition: 0.3s; }
        .btn-close-cyber:hover { color: #fff; transform: rotate(90deg); }
        .extra-small { font-size: 0.6rem; letter-spacing: 1px; font-family: monospace; }
        .shadow-gold { box-shadow: 0 10px 20px rgba(212, 175, 55, 0.15); }
      `}</style>
    </div>
  );
};

export default BreachProtocol;