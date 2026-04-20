// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Spinner, Modal, Row, Col, Badge } from 'react-bootstrap';
import { db } from '../../firebase-config';
import { collection, updateDoc, doc, onSnapshot, query, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Zap, Calendar, Infinity as InfinityIcon, AlertTriangle, ShieldCheck, Lock, Wifi, X, ShieldAlert, ChevronRight, Cpu } from 'lucide-react';

import AdminSidebar from './AdminSidebar';
import SystemOverview from './SystemOverview';
import OperativeDatabase from './OperativeDatabase';
import BreachProtocol from './BreachProtocol'; 
import TransactionTerminal from './TransactionTerminal';
import BroadcastHub from './BroadcastHub';
import ReferralTransactions from './ReferralTransactions'; // ✅ Naya Referral Terminal Import

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [users, setUsers] = useState([]);
  const [breaches, setBreaches] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, premiumUsers: 0, activeBreaches: 0, totalAssets: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('1');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUserAction, setPendingUserAction] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(list);
      const prem = list.filter(u => u.plan === 'Silver' || u.plan === 'Unlimited').length;
      setStats(prev => ({ ...prev, premiumUsers: prem, totalRevenue: prem * 99 }));
      setLoading(false);
    });
    const unsubBreaches = onSnapshot(query(collection(db, "lostItems"), orderBy("createdAt", "desc"), limit(10)), (snap) => {
      setBreaches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStats(prev => ({ ...prev, activeBreaches: snap.size }));
    });
    const unsubTags = onSnapshot(collection(db, "userQRs"), (snap) => {
      setStats(prev => ({ ...prev, totalAssets: snap.size }));
    });
    return () => { unsubUsers(); unsubBreaches(); unsubTags(); };
  }, [user]);

  const handleUpgradeExecute = async (durationType) => {
    if (!upgradeTarget) return;
    setActionLoading(true);
    try {
      const userRef = doc(db, "users", upgradeTarget.id);
      let updateData = {};

      if (durationType === 'cancel') {
        updateData = {
          plan: 'Bronze',
          qrLimit: 5, 
          expiryDate: null,
          upgradedAt: null
        };
      } else if (durationType === 'unlimited') {
        updateData = {
          plan: 'Unlimited',
          qrLimit: 999999,
          expiryDate: 'NEVER',
          upgradedAt: serverTimestamp()
        };
      } else {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + parseInt(selectedDuration));
        updateData = {
          plan: 'Silver',
          qrLimit: 20,
          expiryDate: Timestamp.fromDate(expiry),
          upgradedAt: serverTimestamp()
        };
      }

      await updateDoc(userRef, updateData);
      setShowUpgradeModal(false);
      alert(`PROTOCOL UPDATED: ${upgradeTarget.email} STATUS MODIFIED.`);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserStatusOverride = async () => {
    if (!pendingUserAction) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, "users", pendingUserAction.uid), {
        accountStatus: pendingUserAction.action === 'disable' ? 'suspended' : 'active',
        statusUpdatedAt: serverTimestamp()
      });
      setShowConfirmModal(false);
      setSelectedUserEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirmation = (action) => {
    const target = users.find(u => u.email === selectedUserEmail);
    if (target) { setPendingUserAction({ uid: target.id, action, email: target.email }); setShowConfirmModal(true); }
  };

  // ✅ New Logic: Content Switching Hub (Updated Case)
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SystemOverview 
                  stats={stats} users={users} breaches={breaches} 
                  selectedUserEmail={selectedUserEmail} setSelectedUserEmail={setSelectedUserEmail}
                  isDropdownOpen={isDropdownOpen} setIsDropdownOpen={setIsDropdownOpen}
                  openConfirmation={openConfirmation}
                />;
      case 'users':
        return <OperativeDatabase 
                  users={users} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                  setUpgradeTarget={setUpgradeTarget} setShowUpgradeModal={setShowUpgradeModal}
                />;
      case 'breaches':
        return <BreachProtocol />;
      case 'transactions':
        return <TransactionTerminal />;
      case 'referral_terminal': // ✅ Admin Referral Terminal Case Added
        return <ReferralTransactions />;
      case 'broadcast':
        return <BroadcastHub />;
      default:
        return <SystemOverview stats={stats} users={users} breaches={breaches} />;
    }
  };

  if (loading) return (
    <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-black">
      <div className="admin-loader-ring mb-4">
        <div className="ring-inner"></div>
        <Zap color="var(--gold-solid)" size={30} className="pulse-fast" />
      </div>
      <h6 className="heading-tracking text-luxury-gold m-0">ESTABLISHING ENCRYPTED UPLINK...</h6>
    </div>
  );

  return (
    <div className="admin-root bg-black min-vh-100 text-white d-flex overflow-hidden">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className="admin-content-main flex-grow-1 custom-scrollbar d-flex flex-column" 
           style={{ 
             marginLeft: windowWidth < 992 ? '0' : (isCollapsed ? '80px' : '280px'), 
             height: '100vh', 
             overflowY: 'auto', 
             padding: windowWidth < 768 ? '100px 20px 0' : '30px 40px 0', 
             transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
             width: '100%' 
           }}>
        
        <div className="flex-grow-1">
          <header className="mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
             <div className="d-flex align-items-center gap-3">
                <div className="admin-avatar-glow"><ShieldCheck size={24} color="var(--gold-solid)" /></div>
                <div>
                  <h2 className="heading-tracking m-0 text-white" style={{fontSize: '1.4rem', fontWeight: 800}}>AEGIS <span className="text-luxury-gold">TERMINAL</span></h2>
                  <div className="d-flex align-items-center gap-2 mt-1">
                     <div className="status-dot-green"></div>
                     <span className="subtext-tracking opacity-50" style={{fontSize: '0.55rem'}}>ADMIN_SESSION_ACTIVE // NODAL_SYNC: OK</span>
                  </div>
                </div>
             </div>
             <div className="header-intel-box d-none d-lg-flex">
                <div className="intel-item"><Wifi size={12} className="text-luxury-gold" /><span>ENCRYPTED_NODE</span></div>
                <div className="intel-divider"></div>
                <div className="intel-item"><RefreshCcw size={12} className="animate-spin-slow" /><span>SYNCING...</span></div>
             </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={activeTab}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- NEW PREMIUM ADMIN FOOTER --- */}
        <footer className="admin-footer-terminal py-4 mt-5 border-top border-white-thin">
           <Row className="align-items-center opacity-50">
              <Col md={6} className="text-center text-md-start">
                 <p className="subtext-tracking m-0" style={{fontSize: '0.55rem', letterSpacing: '2px'}}>
                    © 2026 <span className="text-luxury-gold fw-bold">FOUNDIT SECURE NETWORK</span>. ALL RIGHTS RESERVED.
                 </p>
              </Col>
              <Col md={6} className="text-center text-md-end mt-2 mt-md-0">
                 <div className="d-flex align-items-center justify-content-center justify-content-md-end gap-3">
                    <div className="d-flex align-items-center gap-1">
                       <Cpu size={10} className="text-luxury-gold" />
                       <span className="subtext-tracking" style={{fontSize: '0.5rem'}}>v4.0.2_STABLE</span>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                       <ShieldCheck size={10} color="#10b981" />
                       <span className="subtext-tracking" style={{fontSize: '0.5rem'}}>AEGIS_CORE_ACTIVE</span>
                    </div>
                 </div>
              </Col>
           </Row>
        </footer>

      </div>

      {/* --- Upgrade Modal --- */}
      <Modal show={showUpgradeModal} onHide={() => setShowUpgradeModal(false)} centered contentClassName="bg-transparent border-0 shadow-none">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="aegis-protocol-modal">
           <div className="modal-scanner-line"></div>
           <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-gold-faint">
              <div className="d-flex align-items-center gap-2">
                 <ShieldAlert size={20} className="text-luxury-gold" />
                 <span className="heading-tracking text-white" style={{fontSize: '0.9rem'}}>PROTOCOL_UPGRADE_INTERFACE</span>
              </div>
              <X size={20} className="text-muted cursor-pointer hover-gold" onClick={() => setShowUpgradeModal(false)} />
           </div>
           <div className="target-operative-card mb-4">
              <div className="d-flex align-items-center gap-3">
                 <div className="target-avatar-mini">
                    {upgradeTarget?.photoURL ? <img src={upgradeTarget.photoURL} alt="T" /> : upgradeTarget?.fullName?.charAt(0) || 'U'}
                 </div>
                 <div className="d-flex flex-column">
                    <span className="target-name">{upgradeTarget?.fullName || 'REDACTED OPERATIVE'}</span>
                    <span className="target-email">{upgradeTarget?.email}</span>
                 </div>
              </div>
              <div className="current-protocol-badge">{upgradeTarget?.plan?.toUpperCase() || 'BRONZE'}</div>
           </div>
           <div className="duration-selector-area mb-4">
              <label className="subtext-tracking text-muted small d-block mb-3">SELECT TEMPORAL AUTHORIZATION</label>
              <Row className="g-2">
                 {['1', '6', '12'].map(m => (
                   <Col key={m} xs={4}>
                      <div onClick={() => setSelectedDuration(m)} className={`temporal-node ${selectedDuration === m ? 'active' : ''}`}>
                         <div className="node-check"></div>
                         <span className="node-val">{m} MONTH</span>
                      </div>
                   </Col>
                 ))}
              </Row>
           </div>
           <div className="action-hub-terminal">
              <button onClick={() => handleUpgradeExecute('monthly')} className="btn-aegis-primary-terminal mb-3">
                 <div className="d-flex align-items-center gap-2"><Calendar size={18} /><span>AUTHORIZE {selectedDuration} MONTH ACCESS</span></div>
                 <ChevronRight size={18} />
              </button>
              <div className="terminal-divider"><span>OR</span></div>
              <button onClick={() => handleUpgradeExecute('unlimited')} className="btn-unlimited-cyber">
                 <InfinityIcon size={22} /><div className="d-flex flex-column align-items-start"><span className="main-txt">ENABLE UNLIMITED PROTOCOL</span><span className="sub-txt">BYPASS ALL SYSTEM LIMITS</span></div>
              </button>
              <button onClick={() => handleUpgradeExecute('cancel')} className="btn-dark-outline w-100 py-3 mt-3 text-danger border-danger" style={{ fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '10px' }}>TERMINATE PREMIUM PROTOCOL (CANCEL)</button>
           </div>
           <div className="mt-4 pt-3 border-top border-gold-faint text-center">
              <span className="subtext-tracking text-muted" style={{fontSize:'0.5rem'}}>SYSTEM LOG: AUTH_INITIATED // BY_ADMIN_001</span>
           </div>
        </motion.div>
      </Modal>

      {/* --- Critical Override Modal --- */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered contentClassName="bg-transparent border-0 shadow-none">
        <div className="aegis-modal-card border-danger-glow text-center">
           <div className="alert-icon-box mb-3"><AlertTriangle size={48} color="#ef4444" className="animate-pulse" /></div>
           <h5 className="heading-tracking text-white mb-2">CRITICAL OVERRIDE</h5>
           <p className="subtext-tracking text-muted mb-4" style={{fontSize: '0.65rem'}}>OPERATIVE STATUS MODIFICATION IS A LOGGED EVENT.</p>
           <div className="d-flex gap-3">
              <button className="btn-dark-outline flex-fill py-3" onClick={() => setShowConfirmModal(false)}>ABORT</button>
              <button className="aegis-btn-danger flex-fill py-3" onClick={handleUserStatusOverride} disabled={actionLoading}>{actionLoading ? <Spinner size="sm"/> : "CONFIRM EXECUTION"}</button>
           </div>
        </div>
      </Modal>

      <style>{`
        .admin-footer-terminal { background: linear-gradient(180deg, transparent, rgba(212, 175, 55, 0.02)); }
        .aegis-protocol-modal { background: #050505; border: 1px solid var(--gold-solid); border-radius: 20px; padding: 30px; position: relative; overflow: hidden; box-shadow: 0 0 50px rgba(0,0,0,1); }
        .modal-scanner-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--gold-solid), transparent); opacity: 0.3; animation: modalScan 4s infinite linear; }
        @keyframes modalScan { 0% { top: 0%; } 100% { top: 100%; } }
        .border-gold-faint { border-color: rgba(212, 175, 55, 0.1) !important; }
        .target-operative-card { background: rgba(212, 175, 55, 0.05); border: 1px solid rgba(212, 175, 55, 0.1); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
        .target-avatar-mini { width: 45px; height: 45px; border-radius: 50%; border: 1px solid var(--gold-solid); background: #000; color: var(--gold-solid); font-weight: 800; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .target-avatar-mini img { width: 100%; height: 100%; object-fit: cover; }
        .target-name { color: #fff; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
        .target-email { color: #666; font-size: 0.65rem; }
        .current-protocol-badge { font-size: 0.55rem; color: var(--gold-solid); border: 1px solid var(--gold-solid); padding: 4px 10px; border-radius: 100px; font-weight: 700; }
        .temporal-node { background: #000; border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; text-align: center; cursor: pointer; transition: 0.3s; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .node-check { width: 10px; height: 10px; border-radius: 50%; border: 1px solid #333; transition: 0.3s; }
        .node-val { font-size: 0.65rem; color: #666; font-weight: 700; }
        .temporal-node.active { border-color: var(--gold-solid); background: rgba(212, 175, 55, 0.05); }
        .temporal-node.active .node-check { background: var(--gold-solid); box-shadow: 0 0 10px var(--gold-solid); border-color: var(--gold-solid); }
        .temporal-node.active .node-val { color: var(--gold-solid); }
        .btn-aegis-primary-terminal { width: 100%; background: var(--gold-metallic); border: none; color: #000; padding: 15px 20px; border-radius: 10px; font-weight: 800; font-size: 0.75rem; display: flex; justify-content: space-between; align-items: center; transition: 0.3s; }
        .btn-aegis-primary-terminal:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(212, 175, 55, 0.4); }
        .btn-unlimited-cyber { width: 100%; background: #000; border: 1px solid var(--gold-solid); color: var(--gold-solid); padding: 15px 20px; border-radius: 10px; display: flex; align-items: center; gap: 15px; transition: 0.3s; text-align: left; }
        .btn-unlimited-cyber .main-txt { font-weight: 800; font-size: 0.8rem; letter-spacing: 1px; }
        .btn-unlimited-cyber .sub-txt { font-size: 0.55rem; opacity: 0.5; font-weight: 600; }
        .btn-unlimited-cyber:hover { background: var(--gold-solid); color: #000; box-shadow: 0 5px 20px rgba(212, 175, 55, 0.2); }
        .terminal-divider { display: flex; align-items: center; gap: 15px; color: #333; font-size: 0.6rem; font-weight: 900; margin: 15px 0; }
        .terminal-divider::before, .terminal-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
        .hover-gold:hover { color: var(--gold-solid) !important; transform: rotate(90deg); }
      `}</style>
    </div>
  );
};

export default AdminDashboard;