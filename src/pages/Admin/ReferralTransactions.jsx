// src/pages/Admin/ReferralTransactions.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, CheckCircle, XCircle, Clock, Search, 
  Coins, User, ArrowUpRight, ShieldCheck, Send,
  ChevronDown, X, UserCheck, AlertOctagon, Copy, ExternalLink, Zap
} from 'lucide-react';
import { db } from '../../firebase-config';
import { 
  collection, query, onSnapshot, doc, 
  updateDoc, increment, getDoc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { useConfirm } from '../../context/ConfirmContext';

const ReferralTransactions = () => {
  const { askConfirm } = useConfirm();
  const [requests, setRequests] = useState([]);
  const [usersList, setUsersList] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftData, setGiftData] = useState({ userId: '', amount: '', userEmail: '' });
  const [giftLoading, setGiftLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); 
  const [userSearch, setUserSearch] = useState(''); 

  useEffect(() => {
    const q = query(collection(db, "transactions"));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRequests(docs.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      setLoading(false);
    });

    const userUnsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsersList(list);
    });

    return () => { unsub(); userUnsub(); };
  }, []);

  const updateStatus = async (id, newStatus) => {
    askConfirm(
      "SECURITY OVERRIDE", 
      `Confirm status update to: ${newStatus.toUpperCase()}?`,
      async () => {
        try {
          const txRef = doc(db, "transactions", id);
          await updateDoc(txRef, { status: newStatus });
        } catch (err) { console.error(err); }
      },
      newStatus === 'Success' ? 'success' : 'danger'
    );
  };

  const handleGiftCoins = async () => {
    if (!giftData.userId || !giftData.amount) {
        askConfirm("FIELD ERROR", "Please select an operative and enter amount.", () => {}, 'warning');
        return;
    }
    
    setGiftLoading(true);
    try {
      const userRef = doc(db, "users", giftData.userId);
      await updateDoc(userRef, {
        cyberCoins: increment(Number(giftData.amount))
      });

      await addDoc(collection(db, "transactions"), {
        userId: giftData.userId,
        amount: giftData.amount / 10,
        coinsSpent: giftData.amount,
        type: "System Reward",
        status: "Success",
        createdAt: serverTimestamp()
      });

      askConfirm("PROTOCOL COMPLETE", "Credits have been dispatched successfully.", () => {
        setShowGiftModal(false);
        setGiftData({ userId: '', amount: '', userEmail: '' });
      }, 'success');

    } catch (err) {
      console.error(err);
      askConfirm("SYSTEM BREACH", "Failed to dispatch credits.", () => {}, 'danger');
    } finally {
      setGiftLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUPIClick = (upiId, amount) => {
    if(!upiId) return;
    const upiLink = `upi://pay?pa=${upiId}&pn=FoundIt_Operative&am=${amount}&cu=INR`;
    window.location.href = upiLink;
  };

  const filteredRequests = requests.filter(r => 
    r.userId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.upiId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.fullName?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 mt-5 mt-md-0">
        <div>
          <h2 className="heading-tracking text-white m-0" style={{fontSize: '1.4rem'}}>REVENUE <span className="text-luxury-gold">TERMINAL</span></h2>
          <p className="text-muted extra-small subtext-tracking">FINANCIAL MONITORING // NODAL DISTRIBUTIONS</p>
        </div>
        <button className="btn-gold-solid py-2 px-4 extra-small fw-bold" onClick={() => setShowGiftModal(true)}>
          <Zap size={14} className="me-2" /> DISPATCH CREDITS
        </button>
      </div>

      <div className="card-premium-dark p-2 mb-4 border-gold-thin">
        <div className="d-flex align-items-center gap-3 bg-black rounded px-3">
          <Search size={18} className="text-luxury-gold opacity-50" />
          <input 
            type="text" 
            className="bg-transparent border-0 text-white w-100 py-3 shadow-none extra-small" 
            placeholder="SEARCH BY OPERATIVE ID, EMAIL OR UPI..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table - Optimized for Visibility */}
      <div className="card-premium-dark p-0 overflow-hidden d-none d-md-block border-gold-thin">
        <div className="table-responsive">
          <Table variant="dark" hover className="m-0 custom-cyber-table">
            <thead>
              <tr>
                <th className="subtext-tracking">OPERATIVE</th>
                <th className="subtext-tracking">UPI TARGET</th>
                <th className="subtext-tracking text-center">AMOUNT</th>
                <th className="subtext-tracking text-center">STATUS</th>
                <th className="subtext-tracking text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id} className="align-middle">
                  <td>
                    <div className="d-flex align-items-center gap-2">
                        <div className="status-node in"></div>
                        <div>
                            <div className="text-white extra-small fw-bold">ID: {req.userId?.slice(0, 8)}...</div>
                            <div className="text-muted" style={{fontSize: '0.6rem'}}>{req.userEmail || 'REDACTED'}</div>
                        </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                        <span className="text-info extra-small fw-bold">{req.upiId || 'SYSTEM_INTERNAL'}</span>
                        {req.upiId && (
                            <div className="d-flex gap-2">
                                <button className="btn-copy-mini" onClick={() => copyToClipboard(req.upiId, req.id)}>
                                    {copiedId === req.id ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} />}
                                </button>
                                <button className="btn-copy-mini text-luxury-gold" onClick={() => handleUPIClick(req.upiId, req.amount)}>
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="text-luxury-gold heading-tracking fw-bold" style={{fontSize: '1rem'}}>₹{req.amount}</span>
                  </td>
                  <td className="text-center">
                    <Badge className="badge-vault shadow-sm" bg={req.status === 'Success' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'}>
                      {req.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="text-end">
                    {req.status === 'Pending' ? (
                      <div className="d-flex gap-2 justify-content-end">
                        <button className="btn-action success" onClick={() => updateStatus(req.id, 'Success')}><CheckCircle size={18} /></button>
                        <button className="btn-action danger" onClick={() => updateStatus(req.id, 'Rejected')}><XCircle size={18} /></button>
                      </div>
                    ) : (
                        <ShieldCheck size={18} className="text-muted opacity-25 me-3" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Mobile Optimized View - Pure Cyber Look */}
      <div className="d-md-none d-flex flex-column gap-3 mb-5">
        {filteredRequests.map((req) => (
            <div key={req.id} className="card-premium-dark p-3 border-gold-thin vault-mobile-card shadow-lg">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom border-white-faint pb-2">
                    <div className="d-flex align-items-center gap-2">
                        <div className="status-node in"></div>
                        <span className="text-white extra-small fw-bold">ID: {req.userId?.slice(0,10)}...</span>
                    </div>
                    <Badge className="badge-vault" bg={req.status === 'Success' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'}>
                        {req.status.toUpperCase()}
                    </Badge>
                </div>

                <div className="p-3 bg-black rounded border-gold-faint mb-3" onClick={() => req.upiId && handleUPIClick(req.upiId, req.amount)}>
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="overflow-hidden">
                            <p className="m-0 text-muted extra-small subtext-tracking mb-1">UPI TARGET (TAP TO PAY)</p>
                            <p className="m-0 text-info fw-bold text-truncate" style={{fontSize: '0.85rem'}}>{req.upiId || 'SYSTEM_INTERNAL'}</p>
                        </div>
                        <div className="d-flex gap-3 text-luxury-gold ms-2">
                            <Copy size={16} onClick={(e) => { e.stopPropagation(); copyToClipboard(req.upiId, req.id); }} className={copiedId === req.id ? "text-success" : ""} />
                            <ExternalLink size={16} />
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                    <span className="text-muted extra-small fw-bold">DISPATCH AMOUNT</span>
                    <span className="text-luxury-gold heading-tracking fw-bold" style={{fontSize: '1.25rem'}}>₹{req.amount}</span>
                </div>

                {req.status === 'Pending' && (
                    <div className="d-flex gap-2 pt-3 border-top border-white-faint">
                        <button className="btn-gold-solid flex-fill py-2 extra-small fw-bold" onClick={() => updateStatus(req.id, 'Success')}>APPROVE</button>
                        <button className="btn-dark-outline flex-fill py-2 extra-small text-danger fw-bold" onClick={() => updateStatus(req.id, 'Rejected')}>REJECT</button>
                    </div>
                )}
            </div>
        ))}
      </div>

      {loading && <div className="text-center py-5"><Spinner animation="border" variant="warning" /></div>}

      {/* Dispatch Credits Modal */}
      <Modal show={showGiftModal} onHide={() => setShowGiftModal(false)} centered contentClassName="bg-transparent border-0 px-3">
        <div className="card-premium-dark p-4 border-gold-glow position-relative overflow-hidden">
          <div className="modal-glow-bg"></div>
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-white-faint pb-3">
              <div className="d-flex align-items-center gap-2">
                <Zap size={20} className="text-luxury-gold" />
                <h6 className="text-white m-0 heading-tracking">DISPATCH CREDITS</h6>
              </div>
              <X size={20} className="text-muted cursor-pointer hover-gold" onClick={() => setShowGiftModal(false)} />
          </div>

          <div className="mb-4 position-relative">
            <Form.Label className="extra-small text-muted mb-2">TARGET OPERATIVE</Form.Label>
            <div className="cyber-dropdown-trigger" onClick={() => setShowDropdown(!showDropdown)}>
              <span className="extra-small text-white">{giftData.userEmail || "SELECT OPERATIVE..."}</span>
              <ChevronDown size={18} className={`text-luxury-gold transition-smooth ${showDropdown ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
              {showDropdown && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="custom-dropdown-list shadow-lg">
                  <div className="p-2 border-bottom border-white-faint">
                    <input type="text" className="dropdown-search" placeholder="Search email..." onChange={(e) => setUserSearch(e.target.value)} autoFocus />
                  </div>
                  <div className="dropdown-items-scroll">
                    {filteredUsers.map(u => (
                      <div key={u.id} className="dropdown-item-cyber" onClick={() => { setGiftData({ ...giftData, userId: u.id, userEmail: u.email }); setShowDropdown(false); }}>
                        <p className="m-0 extra-small fw-bold text-white">{u.fullName || 'NO_NAME'}</p>
                        <p className="m-0 extra-small text-muted">{u.email}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Form.Group className="mb-4">
            <Form.Label className="extra-small text-muted mb-2">CREDIT AMOUNT (CC)</Form.Label>
            <div className="position-relative">
                <Form.Control type="number" className="cyber-input-field ps-5" placeholder="e.g. 1000" value={giftData.amount} onChange={(e) => setGiftData({...giftData, amount: e.target.value})} />
                <Coins size={18} className="position-absolute text-luxury-gold" style={{left: '15px', top: '50%', transform: 'translateY(-50%)'}} />
            </div>
          </Form.Group>

          <button className="btn-gold-solid w-100 py-3 extra-small fw-bold" onClick={handleGiftCoins} disabled={giftLoading}>
            {giftLoading ? <Spinner size="sm" /> : "EXECUTE DISPATCH PROTOCOL"}
          </button>
        </div>
      </Modal>

      <style>{`
        .custom-cyber-table { margin: 0; }
        .custom-cyber-table th { background: rgba(255,255,255,0.02) !important; color: var(--gold-solid) !important; font-size: 0.7rem; letter-spacing: 2px; border-bottom: 1px solid var(--gold-solid) !important; padding: 20px !important; }
        .custom-cyber-table td { background: transparent !important; padding: 20px !important; border-bottom: 1px solid rgba(255,255,255,0.03) !important; }
        
        .btn-action { border: none; background: rgba(255,255,255,0.03); color: #666; padding: 10px; border-radius: 8px; transition: 0.3s; }
        .btn-action:hover { transform: scale(1.1); }
        .btn-action.success:hover { color: #10b981; background: rgba(16, 185, 129, 0.1); }
        .btn-action.danger:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

        .btn-copy-mini { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 6px; border-radius: 6px; color: #888; transition: 0.2s; }
        .btn-copy-mini:hover { color: #fff; border-color: var(--gold-solid); background: rgba(212, 175, 55, 0.1); }

        .status-node { width: 8px; height: 8px; border-radius: 50%; }
        .status-node.in { background: #10b981; box-shadow: 0 0 10px #10b981; }

        .badge-vault { padding: 8px 12px; border-radius: 6px; font-weight: 700; font-size: 0.65rem; letter-spacing: 1px; }
        
        .cyber-dropdown-trigger { background: #000; border: 1px solid rgba(212, 175, 55, 0.2); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
        .custom-dropdown-list { position: absolute; top: 100%; left: 0; width: 100%; background: #080808; border: 1px solid var(--gold-solid); border-radius: 12px; z-index: 1000; margin-top: 5px; box-shadow: 0 20px 50px rgba(0,0,0,1); }
        .dropdown-search { background: #000; border: none; color: white; width: 100%; padding: 12px; font-size: 0.8rem; border-radius: 8px; outline: none; }
        .dropdown-item-cyber { padding: 15px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.02); transition: 0.2s; }
        .dropdown-item-cyber:hover { background: rgba(212, 175, 55, 0.08); }

        .cyber-input-field { background: #000 !important; border: 1px solid rgba(212, 175, 55, 0.2) !important; color: #fff !important; padding: 15px !important; font-size: 0.9rem !important; border-radius: 12px !important; }
        
        .vault-mobile-card { background: rgba(10,10,10,0.9); }
        .modal-glow-bg { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%); pointer-events: none; }
        .border-gold-glow { border: 1px solid rgba(212, 175, 55, 0.4); }
        .border-gold-faint { border: 1px solid rgba(212, 175, 55, 0.1) !important; }

        @media (max-width: 767px) {
          .heading-tracking { font-size: 1.1rem !important; }
          .subtext-tracking { font-size: 0.55rem !important; }
          .card-premium-dark { padding: 15px !important; }
        }
      `}</style>
    </motion.div>
  );
};

export default ReferralTransactions;