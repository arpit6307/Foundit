// src/pages/ReferEarn.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Form, Badge, Table, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, Share2, Users, ArrowUpRight, History, 
  Wallet, CheckCircle2, Copy, Info, X, Check, ShieldCheck, Zap, Ticket
} from 'lucide-react';
import { db, auth } from '../firebase-config';
import { 
  doc, collection, addDoc, 
  query, where, onSnapshot, serverTimestamp, updateDoc 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext'; 
import { useNavigate } from 'react-router-dom';

const ReferEarn = () => {
  const { user } = useAuth();
  const { askConfirm } = useConfirm(); 
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ cyberCoins: 0, referralsCount: 0, totalEarned: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState(''); 
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // ✅ 6-Character Referral Code Generator (First 6 chars of UID)
  const referralCode = auth.currentUser?.uid?.substring(0, 6).toUpperCase() || "N/A";

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch User Data
    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    });

    // Fetch Transaction History
    const q = query(collection(db, "transactions"), where("userId", "==", auth.currentUser.uid));
    const unsubHistory = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistory(docs.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      setLoading(false);
    });

    return () => { unsubUser(); unsubHistory(); };
  }, []);

  const handleWithdrawSubmission = async () => {
    const amountNum = Number(withdrawAmount);

    if (!withdrawAmount || amountNum < 50) {
        askConfirm("INSUFFICIENT CREDITS", "Minimum 50 CC (₹5) withdrawal required.", () => {}, 'warning');
        return;
    }

    if (amountNum > userData.cyberCoins) {
        askConfirm("INSUFFICIENT BALANCE", "Aapke paas itne coins nahi hain!", () => {}, 'danger');
        return;
    }
    
    if (!upiId.includes('@')) {
        askConfirm("INVALID PROTOCOL", "Please enter a valid UPI ID to proceed.", () => {}, 'danger');
        return;
    }

    askConfirm("INITIATE TRANSFER", `Confirm transfer of ${amountNum} CC (₹${amountNum / 10})?`, async () => {
        setWithdrawLoading(true);
        try {
          await addDoc(collection(db, "transactions"), {
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email,
            amount: amountNum / 10,
            coinsSpent: amountNum,
            upiId: upiId,
            status: "Pending",
            type: "Withdrawal",
            createdAt: serverTimestamp()
          });

          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, { 
            cyberCoins: (userData.cyberCoins || 0) - amountNum 
          });

          setMessage(`SUCCESS! ₹${amountNum / 10} 30 min ke andar mil jayenge. ⚡`);
          setTimeout(() => {
            setShowWithdrawModal(false);
            setMessage('');
            setUpiId('');
            setWithdrawAmount('');
          }, 3000);
        } catch (err) {
          console.error(err);
        } finally {
          setWithdrawLoading(false);
        }
    });
  };

  const copyLink = () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="refer-earn-wrapper">
      <div className="refer-earn-backdrop d-md-none" onClick={() => navigate(-1)}></div>

      <motion.div 
        initial={{ y: "100%", opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="refer-earn-main-container"
      >
        <div className="sheet-header d-md-none">
            <div className="drag-handle"></div>
            <button className="close-sheet-btn" onClick={() => navigate(-1)}>
                <X size={24} />
            </button>
        </div>

        <div className="container p-4 p-md-5">
          <div className="text-center mb-5">
            <motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Coins size={60} color="var(--gold-solid)" className="mb-2" />
            </motion.div>
            <h1 className="heading-tracking text-white m-0">CYBER <span className="text-luxury-gold">COINS</span></h1>
            <p className="text-muted small subtext-tracking">Secure the network, earn real rewards.</p>
          </div>

          <Row className="g-4 mb-5">
            <Col lg={4} md={12}>
              <div className="card-premium-dark p-4 text-center border-gold-glow h-100 vault-card">
                <div className="vault-glow"></div>
                <span className="subtext-tracking text-muted extra-small">AVAILABLE BALANCE</span>
                <h1 className="text-white my-3 heading-tracking balance-text">
                  {userData.cyberCoins || 0} <small className="text-luxury-gold">CC</small>
                </h1>
                <div className="value-badge mb-4">₹{(userData.cyberCoins || 0) / 10} REAL CASH</div>
                
                <button 
                  className="btn-gold-solid w-100 py-3 d-flex align-items-center justify-content-center gap-2" 
                  onClick={() => setShowWithdrawModal(true)}
                >
                  <Wallet size={18} /> INITIATE WITHDRAWAL
                </button>
              </div>
            </Col>

            <Col lg={8} md={12}>
              <div className="card-premium-dark p-4 h-100">
                <Row className="g-3 mb-4">
                  <Col xs={6}>
                    <div className="stats-box">
                        <Users size={20} className="text-luxury-gold mb-2" />
                        <h4 className="m-0 text-white">{userData.referralsCount || 0}</h4>
                        <span className="extra-small text-muted subtext-tracking">TOTAL REFERS</span>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="stats-box">
                        <ArrowUpRight size={20} className="text-success mb-2" />
                        <h4 className="m-0 text-white">₹{(userData.totalEarned || 0)}</h4>
                        <span className="extra-small text-muted subtext-tracking">TOTAL EARNED</span>
                    </div>
                  </Col>
                </Row>

                <div className="d-flex flex-column gap-3">
                  {/* Referral Link Box */}
                  <div className="referral-box p-3 bg-black rounded border-dashed">
                    <span className="extra-small text-muted d-block mb-2 subtext-tracking">SECURE REFERRAL LINK</span>
                    <div className="d-flex align-items-center gap-2">
                      <div className="link-display flex-grow-1 overflow-hidden">
                        <code className="text-luxury-gold small text-truncate d-block">
                          {`${window.location.origin}/auth?ref=${referralCode}`}
                        </code>
                      </div>
                      <button className={`btn-copy-advanced ${copied ? 'copied' : ''}`} onClick={copyLink}>
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        <span className="ms-2 d-none d-sm-inline">{copied ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Referral Code Box */}
                  <div className="referral-box p-3 bg-black rounded border-dashed border-gold-faint">
                    <span className="extra-small text-muted d-block mb-2 subtext-tracking">UNIQUE REFERRAL CODE</span>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <Ticket size={18} className="text-luxury-gold" />
                        <h4 className="m-0 heading-tracking text-white" style={{ letterSpacing: '4px' }}>{referralCode}</h4>
                      </div>
                      <button className={`btn-copy-advanced ${codeCopied ? 'copied' : ''}`} onClick={copyCode}>
                        {codeCopied ? <Check size={18} /> : <Copy size={18} />}
                        <span className="ms-2 d-none d-sm-inline">{codeCopied ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <div className="card-premium-dark p-4 mb-4 border-info-faint">
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom border-white-faint">
              <ShieldCheck size={18} className="text-luxury-gold" />
              <span className="m-0 text-white heading-tracking">VAULT PROTOCOLS</span>
            </div>
            <div className="rules-grid">
                <div className="rule-item">
                    <Zap size={14} className="text-luxury-gold" />
                    <span><strong>Activation:</strong> Successful signup par <b className="text-white">100 CC (₹10)</b> milenge.</span>
                </div>
                <div className="rule-item">
                    <Zap size={14} className="text-luxury-gold" />
                    <span><strong>Conversion:</strong> <b className="text-white">10 Cyber Coins = ₹1 INR</b>.</span>
                </div>
                <div className="rule-item">
                    <Zap size={14} className="text-luxury-gold" />
                    <span><strong>Limit:</strong> Minimum withdrawal limit sirf <b className="text-white">50 CC (₹5)</b>.</span>
                </div>
                <div className="rule-item">
                    <Zap size={14} className="text-luxury-gold" />
                    <span><strong>Settlement:</strong> Payouts <b className="text-white">30 Minutes</b> ke andar UPI par.</span>
                </div>
            </div>
          </div>

          <div className="card-premium-dark p-0 overflow-hidden">
            <div className="d-flex align-items-center gap-2 p-4 border-bottom border-white-faint">
              <History size={20} className="text-luxury-gold" />
              <h5 className="m-0 text-white heading-tracking" style={{ fontSize: '1rem' }}>TRANSACTION LOGS</h5>
            </div>
            
            <div className="table-responsive custom-scroll-area">
              <Table variant="dark" className="custom-cyber-table mb-0">
                <thead>
                  <tr>
                    <th className="text-uppercase text-muted fw-bold">Type</th>
                    <th className="text-uppercase text-muted fw-bold">Credits</th>
                    <th className="text-uppercase text-muted fw-bold">Status</th>
                    <th className="text-uppercase text-muted fw-bold text-end d-none d-md-table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx) => {
                    const displayCredits = tx.coinsSpent || (Number(tx.amount) * 10) || 0;
                    
                    return (
                      <tr key={tx.id} className="align-middle">
                        <td>
                          <div className="d-flex align-items-center gap-2">
                             <div className={`status-node ${tx.type === 'Withdrawal' ? 'out' : 'in'}`}></div>
                             <span className="text-white fw-medium small-tracking">{tx.type}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                             <Coins size={14} className="text-luxury-gold" />
                             <span className="text-luxury-gold fw-bold">{displayCredits} CC</span>
                          </div>
                        </td>
                        <td>
                          <Badge bg={tx.status === 'Success' ? 'success' : tx.status === 'Pending' ? 'warning' : 'danger'} className="badge-vault shadow-sm">
                            {tx.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="text-end d-none d-md-table-cell">
                          <span className="text-muted extra-small">
                            {tx.createdAt ? new Date(tx.createdAt.seconds * 1000).toLocaleDateString('en-GB') : '...'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && history.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <div className="opacity-25 mb-2"><History size={40} /></div>
                        <p className="text-muted small m-0">No encrypted logs found in the vault.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </motion.div>

      <Modal 
        show={showWithdrawModal} 
        onHide={() => setShowWithdrawModal(false)} 
        centered 
        contentClassName="bg-transparent border-0"
        className="vault-modal"
      >
        <div className="modal-vault-content p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-gold-faint pb-3">
            <div className="d-flex align-items-center gap-2">
                <Wallet size={20} className="text-luxury-gold" />
                <h6 className="text-white m-0 heading-tracking">VAULT WITHDRAWAL</h6>
            </div>
            <X size={20} className="text-muted cursor-pointer hover-gold" onClick={() => setShowWithdrawModal(false)} />
          </div>

          <AnimatePresence mode="wait">
            {message ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-5">
                <div className="success-pulse mb-3">
                    <CheckCircle2 size={50} className="text-success" />
                </div>
                <p className="text-white heading-tracking mb-0" style={{fontSize: '0.8rem'}}>{message}</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="info-strip mb-4">
                    <div className="d-flex justify-content-between mb-1">
                        <span className="extra-small text-muted">CURRENT BALANCE</span>
                        <span className="extra-small text-white">{userData.cyberCoins || 0} CC</span>
                    </div>
                    <div className="progress-mini">
                        <div className="progress-bar-gold" style={{width: `${Math.min(((userData.cyberCoins || 0)/50)*100, 100)}%`}}></div>
                    </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="extra-small text-muted mb-2 subtext-tracking">CREDITS TO CONVERT</Form.Label>
                  <div className="input-with-icon">
                    <Coins size={16} className="icon-left" />
                    <Form.Control 
                        type="number"
                        className="cyber-input" 
                        placeholder="Min 50 CC"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  {withdrawAmount && (
                    <div className="text-center mt-3 p-2 rounded bg-gold-glow">
                        <span className="text-luxury-gold heading-tracking" style={{fontSize: '0.7rem'}}>
                            ESTIMATED PAYOUT: ₹{Number(withdrawAmount) / 10}
                        </span>
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="extra-small text-muted mb-2 subtext-tracking">TARGET UPI ADDRESS</Form.Label>
                  <div className="input-with-icon">
                    <Zap size={16} className="icon-left" />
                    <Form.Control 
                        className="cyber-input" 
                        placeholder="username@bank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                </Form.Group>

                <button 
                    className="btn-gold-solid w-100 py-3 mt-2" 
                    onClick={handleWithdrawSubmission} 
                    disabled={withdrawLoading || !withdrawAmount || !upiId}
                >
                  {withdrawLoading ? <Spinner size="sm" /> : "AUTHORIZE TRANSFER"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      <style>{`
        .refer-earn-wrapper { min-height: 100vh; background: #000; position: relative; }
        .vault-card { position: relative; overflow: hidden; background: rgba(15,15,15,0.8); }
        .vault-glow { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%); pointer-events: none; }
        .balance-text { font-size: clamp(2.5rem, 5vw, 4rem); }
        .value-badge { display: inline-block; padding: 5px 15px; background: rgba(16,185,129,0.1); color: #10b981; border-radius: 100px; font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; }
        .stats-box { padding: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(212,175,55,0.1); border-radius: 12px; text-align: center; }
        .rules-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 768px) { .rules-grid { grid-template-columns: 1fr 1fr; } }
        .rule-item { display: flex; align-items: flex-start; gap: 10px; font-size: 0.75rem; color: #888; line-height: 1.5; }
        .referral-box { border: 1px dashed rgba(212,175,55,0.3); }

        .custom-cyber-table { margin: 0; border-collapse: separate; border-spacing: 0; width: 100%; }
        .custom-cyber-table th { 
          background: rgba(255,255,255,0.02) !important; 
          color: rgba(212, 175, 55, 0.8) !important; 
          font-size: 0.7rem; 
          letter-spacing: 2px; 
          padding: 18px 20px; 
          border: none !important;
        }
        .custom-cyber-table td { 
          background: transparent !important; 
          padding: 18px 20px; 
          border-bottom: 1px solid rgba(255,255,255,0.03) !important; 
          font-size: 0.85rem;
        }
        .custom-cyber-table tr:last-child td { border-bottom: none !important; }
        .badge-vault { 
          padding: 6px 12px; 
          font-size: 0.65rem; 
          border-radius: 6px; 
          letter-spacing: 1px; 
          font-weight: 700;
        }
        .status-node { width: 8px; height: 8px; border-radius: 50%; }
        .status-node.out { background: #ef4444; box-shadow: 0 0 10px #ef4444; }
        .status-node.in { background: #10b981; box-shadow: 0 0 10px #10b981; }
        .small-tracking { letter-spacing: 0.5px; }

        .modal-vault-content { background: #080808; border: 1px solid var(--gold-solid); border-radius: 20px; position: relative; overflow: hidden; }
        .modal-vault-content::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--gold-metallic); opacity: 0.5; }
        .info-strip { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; }
        .progress-mini { height: 4px; background: #1a1a1a; border-radius: 10px; overflow: hidden; }
        .progress-bar-gold { height: 100%; background: var(--gold-solid); box-shadow: 0 0 10px var(--gold-solid); transition: 0.5s; }
        .cyber-input { background: #000 !important; border: 1px solid rgba(212,175,55,0.2) !important; color: #fff !important; padding: 12px 12px 12px 40px !important; font-size: 0.8rem !important; border-radius: 10px !important; }
        .cyber-input:focus { border-color: var(--gold-solid) !important; box-shadow: 0 0 15px rgba(212,175,55,0.1) !important; }
        .input-with-icon { position: relative; }
        .icon-left { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--gold-solid); opacity: 0.6; z-index: 5; }
        .bg-gold-glow { background: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.1); }
        .hover-gold:hover { color: var(--gold-solid) !important; transform: rotate(90deg); transition: 0.3s; }

        @media (max-width: 767px) {
            .refer-earn-wrapper { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2000; }
            .refer-earn-backdrop { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); }
            .refer-earn-main-container { 
                position: absolute; bottom: 0; left: 0; width: 100%; height: 92vh; 
                background: #050505; border-top: 2px solid var(--gold-solid); 
                border-top-left-radius: 30px; border-top-right-radius: 30px; 
                overflow-y: auto; z-index: 2001; padding-bottom: 40px;
            }
            .sheet-header { position: sticky; top: 0; background: #050505; padding: 15px; display: flex; justify-content: center; align-items: center; z-index: 100; border-bottom: 1px solid rgba(255,255,255,0.05); }
            .drag-handle { width: 40px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 10px; }
            .close-sheet-btn { position: absolute; right: 20px; background: none; border: none; color: #666; }
            .balance-text { font-size: 3rem; }
            .custom-cyber-table th, .custom-cyber-table td { padding: 15px 15px; font-size: 0.8rem; }
        }
        .success-pulse { width: 80px; height: 80px; background: rgba(16,185,129,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 70% { box-shadow: 0 0 0 20px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
      `}</style>
    </div>
  );
};

export default ReferEarn;