// src/pages/Admin/BroadcastHub.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { Row, Col, Form, Spinner, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Send, Users, ShieldAlert, Zap, X, BellRing, ChevronDown, UserCheck, Mail, Search } from 'lucide-react';

const BroadcastHub = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ title: '', body: '', target: 'all' });
  const [status, setStatus] = useState({ show: false, msg: '', type: '' });
  
  // Individual Target States
  const [allUsers, setAllUsers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');

  // Initial Data Fetch - Syncing Operatives
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(query(collection(db, "users"), orderBy("fullName", "asc")));
        setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { 
        console.error("Database Error:", err); 
      }
    };
    fetchUsers();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    
    // Validation Check
    if (!message.title.trim() || !message.body.trim()) {
      return setStatus({ show: true, msg: "SIGNAL CONTENT REQUIRED.", type: 'danger' });
    }
    if (message.target === 'individual' && !selectedUser) {
      return setStatus({ show: true, msg: "SELECT A TARGET OPERATIVE.", type: 'danger' });
    }
    
    setLoading(true);
    try {
      let targetUids = [];
      
      // Target identification logic
      if (message.target === 'individual') {
        targetUids = [selectedUser.id];
      } else {
        // Safe list filtering from current sync
        if (message.target === 'silver') targetUids = allUsers.filter(u => u.plan === 'Silver').map(u => u.id);
        else if (message.target === 'bronze') targetUids = allUsers.filter(u => u.plan === 'Bronze').map(u => u.id);
        else targetUids = allUsers.map(u => u.id);
      }

      if (targetUids.length === 0) {
        throw new Error("NO_NODES_IDENTIFIED");
      }

      // Initialize Mass Transmission
      const broadcastPromises = targetUids.map(uid => {
        return addDoc(collection(db, "system_alerts"), {
          userId: uid,
          title: message.title,
          body: message.body,
          type: 'broadcast',
          timestamp: serverTimestamp(),
          read: false
        });
      });

      await Promise.all(broadcastPromises);
      
      // On SUCCESS: Reset Everything to Blank
      setStatus({ show: true, msg: `SIGNAL TRANSMITTED TO ${targetUids.length} NODE(S) SUCCESSFULLY.`, type: 'success' });
      setMessage({ title: '', body: '', target: 'all' });
      setSelectedUser(null);
      setFilterQuery('');
      setIsDropdownOpen(false);
      
    } catch (err) {
      console.error(err);
      setStatus({ show: true, msg: "TRANSMISSION INTERRUPTED. CHECK DATABASE UPLINK.", type: 'danger' });
    } finally { 
      setLoading(false); 
      // Auto hide status message after 5 seconds
      setTimeout(() => setStatus({show: false, msg: '', type: ''}), 5000);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.email?.toLowerCase().includes(filterQuery.toLowerCase()) || 
    u.fullName?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="broadcast-root pb-5">
      
      {/* --- COMMAND HEADER --- */}
      <div className="card-premium-dark p-4 mb-4 border-gold-glow bg-black shadow-lg">
        <h6 className="heading-tracking m-0 text-luxury-gold d-flex align-items-center gap-2">
          <Radio size={20} className="animate-pulse" /> COMMAND BROADCAST HUB
        </h6>
        <p className="subtext-tracking text-muted m-0 mt-1" style={{fontSize: '0.6rem', letterSpacing: '1px'}}>
          DIRECT_LINK_ESTABLISHED // TARGET_SPECIFICATION_LOCKED
        </p>
      </div>

      <Row className="g-4">
        {/* --- SIGNAL COMPOSER --- */}
        <Col lg={7}>
          <div className="card-premium-dark p-4 p-md-5 border-white-thin h-100">
            <Form onSubmit={handleBroadcast}>
              <div className="mb-4">
                <Form.Label className="subtext-tracking text-muted small ms-1">SELECT_TARGET_PROTOCOL</Form.Label>
                <div className="d-flex gap-2 flex-wrap mt-2">
                  {['all', 'bronze', 'silver', 'individual'].map(t => (
                    <button key={t} type="button" 
                      onClick={() => {setMessage({...message, target: t}); if(t !== 'individual') setSelectedUser(null);}}
                      className={`target-btn ${message.target === t ? 'active' : ''}`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Custom Dropdown Module */}
              <AnimatePresence>
                {message.target === 'individual' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4 overflow-visible">
                    {!selectedUser ? (
                      <div className="custom-dropdown-container">
                        <div className="dropdown-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                           <div className="d-flex align-items-center gap-2">
                              <Mail size={16} className="text-luxury-gold" />
                              <span className="subtext-tracking" style={{fontSize: '0.75rem', color: '#fff'}}>SEARCH OPERATIVE EMAIL</span>
                           </div>
                           <ChevronDown size={16} className={`transition-smooth ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {isDropdownOpen && (
                          <div className="dropdown-panel shadow-2xl">
                             <div className="p-3 border-bottom border-white-thin bg-black-depth d-flex align-items-center gap-2">
                                <Search size={14} className="text-muted" />
                                <input 
                                  type="text" placeholder="Filter by Name/Email..." 
                                  className="dropdown-search-input w-100" 
                                  value={filterQuery} onChange={(e) => setFilterQuery(e.target.value)}
                                  autoFocus
                                />
                             </div>
                             <div className="options-list custom-scrollbar">
                                {filteredUsers.map(u => (
                                  <div key={u.id} className="option-item" onClick={() => { setSelectedUser(u); setIsDropdownOpen(false); }}>
                                     <div className="d-flex flex-column">
                                        <span className="text-white fw-bold" style={{fontSize: '0.75rem'}}>{u.fullName || 'Unnamed'}</span>
                                        <span className="text-luxury-gold monospace" style={{fontSize: '0.6rem'}}>{u.email}</span>
                                     </div>
                                  </div>
                                ))}
                                {filteredUsers.length === 0 && <div className="p-4 text-center text-muted small">NO RECORDS MATCHED</div>}
                             </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <motion.div initial={{scale: 0.9}} animate={{scale: 1}} className="selected-user-card p-3 rounded d-flex align-items-center justify-content-between border-gold-glow">
                         <div className="d-flex align-items-center gap-3">
                            <div className="user-icon-box shadow-glow"><UserCheck size={18} /></div>
                            <div>
                               <div className="heading-tracking text-white" style={{fontSize: '0.8rem'}}>{selectedUser.fullName}</div>
                               <div className="subtext-tracking text-luxury-gold monospace" style={{fontSize: '0.65rem'}}>{selectedUser.email}</div>
                            </div>
                         </div>
                         <button type="button" className="btn-close-link" onClick={() => {setSelectedUser(null); setFilterQuery('');}}>
                            <X size={18} />
                         </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Form.Group className="mb-4">
                <Form.Label className="subtext-tracking text-muted small ms-1">SIGNAL_HEADER</Form.Label>
                <Form.Control required placeholder="Enter Signal Subject..." 
                  className="bg-black-depth border-white-thin text-white p-3 shadow-none terminal-input"
                  value={message.title} onChange={(e) => setMessage({...message, title: e.target.value})} />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="subtext-tracking text-muted small ms-1">SIGNAL_BODY</Form.Label>
                <Form.Control as="textarea" rows={5} required placeholder="Enter transmission data..." 
                  className="bg-black-depth border-white-thin text-white p-3 shadow-none terminal-input"
                  value={message.body} onChange={(e) => setMessage({...message, body: e.target.value})} style={{resize: 'none'}} />
              </Form.Group>

              <button type="submit" disabled={loading} className="btn-gold-solid w-100 py-3 d-flex align-items-center justify-content-center gap-2 shadow-glow">
                {loading ? <Spinner size="sm" variant="dark" /> : <><Send size={18} /> INITIALIZE TRANSMISSION</>}
              </button>
            </Form>
          </div>
        </Col>

        {/* --- LIVE TERMINAL PREVIEW --- */}
        <Col lg={5}>
          <div className="card-premium-dark p-4 h-100 border-white-thin d-flex flex-column bg-black-depth shadow-2xl">
             <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom border-white-thin">
                <BellRing size={16} color="var(--gold-solid)" className="animate-pulse" />
                <span className="heading-tracking text-white" style={{fontSize: '0.7rem'}}>UI_PREVIEW_MODE</span>
             </div>

             <div className="user-notif-preview p-3 rounded">
                <div className="d-flex align-items-center gap-3 mb-2">
                   <div className="notif-dot animate-pulse"></div>
                   <h6 className="heading-tracking text-white m-0 text-truncate" style={{fontSize: '0.8rem'}}>
                     {message.title || 'AWAITING_SIGNAL_SUBJECT'}
                   </h6>
                </div>
                <p className="subtext-tracking text-muted m-0" style={{fontSize: '0.7rem', lineHeight: '1.6', minHeight: '60px'}}>
                   {message.body || 'Transmission data will sync here real-time...'}
                </p>
                <div className="mt-3 pt-2 border-top border-white-thin d-flex justify-content-between align-items-center">
                   <div className="d-flex align-items-center gap-2">
                      <Zap size={10} className="text-luxury-gold"/>
                      <span className="subtext-tracking text-luxury-gold" style={{fontSize: '0.55rem'}}>SYSTEM_MSG</span>
                   </div>
                   <span className="subtext-tracking text-muted uppercase" style={{fontSize: '0.55rem'}}>
                     Target: {selectedUser ? selectedUser.fullName : message.target.toUpperCase()}
                   </span>
                </div>
             </div>

             {status.show && (
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} 
                 className={`mt-auto p-3 rounded bg-${status.type}-faded border-${status.type} d-flex justify-content-between align-items-center`}
               >
                 <span className="subtext-tracking small fw-bold text-white">{status.msg}</span>
                 <X size={16} className="cursor-pointer text-white" onClick={() => setStatus({...status, show: false})} />
               </motion.div>
             )}
          </div>
        </Col>
      </Row>

      <style>{`
        .bg-black-depth { background: #050505; }
        .terminal-input { border-radius: 10px; font-size: 0.85rem; transition: 0.3s; background: #080808 !important; }
        .terminal-input:focus { border-color: var(--gold-solid); box-shadow: 0 0 10px rgba(212, 175, 55, 0.1) !important; }
        
        .target-btn {
          background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1); color: #666;
          padding: 10px 22px; border-radius: 8px; font-size: 0.65rem; font-weight: 800;
          letter-spacing: 1.5px; transition: 0.3s;
        }
        .target-btn.active { border-color: var(--gold-solid); color: var(--gold-solid); background: rgba(212, 175, 55, 0.05); box-shadow: 0 0 15px rgba(212, 175, 55, 0.1); }

        /* Dropdown Master Styles */
        .custom-dropdown-container { position: relative; width: 100%; z-index: 1000; }
        .dropdown-trigger {
          background: #080808; border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 16px; border-radius: 12px; display: flex; justify-content: space-between;
          align-items: center; cursor: pointer; transition: 0.3s;
        }
        .dropdown-trigger:hover { border-color: var(--gold-solid); }
        
        .dropdown-panel {
          position: absolute; top: 100%; left: 0; width: 100%; 
          background: #080808; border: 1px solid var(--gold-solid); border-radius: 12px;
          margin-top: 8px; overflow: hidden; z-index: 1001; box-shadow: 0 20px 50px rgba(0,0,0,1);
        }
        .dropdown-search-input {
          background: transparent; border: none; color: white;
          padding: 10px; font-size: 0.8rem; outline: none;
        }
        .options-list { max-height: 250px; overflow-y: auto; }
        .option-item { padding: 14px 18px; cursor: pointer; transition: 0.2s; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .option-item:hover { background: rgba(212, 175, 55, 0.15); color: var(--gold-solid); }

        .selected-user-card { background: rgba(212, 175, 55, 0.05); border: 1px solid var(--gold-solid); }
        .user-icon-box { width: 38px; height: 38px; background: var(--gold-solid); color: black; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        
        .user-notif-preview { border-left: 4px solid var(--gold-solid); background: #0a0a0a; border-radius: 0 12px 12px 0; }
        .notif-dot { width: 10px; height: 10px; background: var(--gold-solid); border-radius: 50%; box-shadow: 0 0 10px var(--gold-solid); }
        
        .bg-success-faded { background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; }
        .bg-danger-faded { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; }
        
        .shadow-glow { box-shadow: 0 0 20px rgba(212, 175, 55, 0.2); }
        .transition-smooth { transition: 0.3s ease; }
        .rotate-180 { transform: rotate(180deg); }
        .monospace { font-family: monospace; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--gold-solid); border-radius: 10px; }
      `}</style>
    </motion.div>
  );
};

export default BroadcastHub;