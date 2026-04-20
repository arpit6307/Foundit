// src/pages/Profile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spinner, Modal, Form, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase-config'; 
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { updatePassword, updateProfile, deleteUser } from 'firebase/auth';
import { uploadImageToCloudinary } from '../utils/uploadImage';
import Cropper from 'react-easy-crop';
import { 
  Settings, ShieldCheck, Package, LogOut, Edit3, 
  ExternalLink, UserCheck, Camera, Key, X, CheckCircle2,
  Zap, Calendar, Crown, Check, Share2, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
import SubscriptionModal from '../components/SubscriptionModal';

const Profile = () => {
  const { user, logout } = useAuth();
  const { askConfirm } = useConfirm(); 
  const navigate = useNavigate();
  
  const [counts, setCounts] = useState({ items: 0, tags: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [userPlan, setUserPlan] = useState({ plan: 'Bronze', expiryDate: null, role: 'user' });
  const [showSubModal, setShowSubModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);

  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');
  
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fetchUserData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      let formattedExpiry = null;
      if (data.expiryDate && typeof data.expiryDate.toDate === 'function') {
        formattedExpiry = data.expiryDate.toDate();
      }

      setUserPlan({ 
        plan: data.plan || 'Bronze', 
        role: data.role || 'user',
        expiryDate: formattedExpiry 
      });
      setNewName(data.fullName || currentUser.displayName || '');
    }

    const itemsQuery = query(collection(db, "lostItems"), where("userId", "==", currentUser.uid));
    const unsubItems = onSnapshot(itemsQuery, (snapshot) => setCounts(prev => ({ ...prev, items: snapshot.size })));

    const tagsQuery = query(collection(db, "userQRs"), where("userId", "==", currentUser.uid));
    const unsubTags = onSnapshot(tagsQuery, (snapshot) => {
      setCounts(prev => ({ ...prev, tags: snapshot.size }));
      setLoading(false);
    });

    return () => { unsubItems(); unsubTags(); };
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleUpgradePayment = () => {
    const options = {
      key: "rzp_live_SWbNZBmdp2OrIZ", 
      amount: 9900,
      currency: "INR",
      name: "FoundIt Security",
      description: "Activate Silver Vault Identity",
      handler: async function (response) {
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30);
          await updateDoc(userRef, {
            plan: 'Silver',
            expiryDate: Timestamp.fromDate(expiry),
            lastPaymentId: response.razorpay_payment_id,
            upgradedAt: serverTimestamp()
          });
          setShowSubModal(false);
          fetchUserData(); 
          alert("VAULT UPGRADED TO PREMIUM STATUS. 💎");
        } catch (err) { console.error(err); }
      },
      prefill: { name: auth.currentUser?.displayName, email: auth.currentUser?.email },
      theme: { color: "#D4AF37" }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleUploadProfile = async () => {
    if (!imageSrc) return;
    setUpdating(true);
    try {
      const url = await uploadImageToCloudinary(imageSrc); 
      if (url) {
        await updateProfile(auth.currentUser, { photoURL: url });
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { photoURL: url });
        await fetchUserData(); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
      setShowCropModal(false);
    }
  };

  const handleUpdateNameRequest = () => {
    if (!newName.trim()) return;
    askConfirm(
      "UPDATING PROTOCOL IDENTITY",
      `System confirmation: Change operative name to "${newName}"?`,
      async () => {
        setUpdating(true);
        try {
          await updateProfile(auth.currentUser, { displayName: newName });
          const userRef = doc(db, "users", auth.currentUser.uid);
          await updateDoc(userRef, { fullName: newName });
          setShowEditModal(false);
          await fetchUserData();
        } catch (err) {
          console.error(err);
        } finally {
          setUpdating(false);
        }
      }
    );
  };

  const handleUpdatePassword = async () => {
    if (newPass.length < 6) return alert("Minimum 6 characters required!");
    setUpdating(true);
    try {
      await updatePassword(auth.currentUser, newPass);
      setShowPassModal(false);
      alert("Passkey successfully updated. 🔐");
    } catch (err) { alert("Security timeout. Please re-login."); }
    setUpdating(false);
  };

  const handleDeleteAccount = () => {
    askConfirm(
      "TERMINATE PROTOCOL", 
      "WARNING: Kya aap pakka account delete karna chahte hain?",
      async () => {
        try {
          await deleteUser(auth.currentUser);
          navigate('/');
        } catch (err) { alert("Re-login required for deletion."); }
      },
      'danger'
    );
  };

  const handleReferClick = () => {
      navigate('/refer-earn');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="dashboard-root p-2 p-md-4 p-lg-5 min-vh-100"
    >
      <div className="container-fluid position-relative px-0 px-md-3" style={{ zIndex: 10 }}>
        
        <div className="mb-4 mb-md-5 border-bottom pb-3 pb-md-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <Settings size={24} color="var(--gold-solid)" strokeWidth={1.5} className="d-none d-sm-block" />
              <div>
                <h1 className="m-0 text-white heading-tracking" style={{ fontSize: '1.2rem', fontWeight: 300 }}>
                  VAULT <span className="text-luxury-gold" style={{ fontWeight: 800 }}>IDENTITY</span>
                </h1>
                <p className="subtext-tracking mb-0 text-muted" style={{ fontSize: '0.6rem' }}>Identity and security protocols.</p>
              </div>
            </div>
            {userPlan.plan === 'Bronze' && (
              <button className="btn-gold-solid py-2 px-3 d-flex align-items-center gap-2" style={{fontSize: '0.65rem'}} onClick={() => setShowSubModal(true)}>
                <Zap size={14} fill="currentColor" /> <span className="d-none d-sm-inline">UPGRADE</span>
              </button>
            )}
          </div>
        </div>

        <Row className="g-4">
          <Col lg={4} xs={12}>
            <div className="d-flex flex-column gap-4 h-100">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <div className="card-premium-dark p-4 py-5 text-center d-flex flex-column align-items-center">
                  
                  <div className="position-relative mb-4" style={{ width: '140px', height: '140px' }}>
                    
                    {userPlan.plan === 'Unlimited' && (
                       <div className="crown-container-royal">
                         <Crown size={45} className="text-luxury-gold" fill="var(--gold-solid)" />
                       </div>
                    )}

                    {userPlan.plan !== 'Bronze' && <div className="premium-royal-ring"></div>}

                    <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center h-100 w-100 position-relative avatar-main-frame">
                      {auth.currentUser?.photoURL ? (
                        <img src={auth.currentUser.photoURL} alt="User" className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <h1 className="text-luxury-gold m-0 heading-tracking" style={{ fontSize: '3.5rem' }}>{auth.currentUser?.email?.charAt(0).toUpperCase()}</h1>
                      )}
                    </div>

                    {userPlan.plan !== 'Bronze' && (
                      <div className="premium-verified-badge-gold">
                        <Check size={14} color="black" strokeWidth={4} />
                      </div>
                    )}

                    <label className="camera-btn-circle-perfect">
                      <Camera size={16} className="text-luxury-gold" />
                      <input type="file" className="d-none" accept="image/*" onChange={onFileChange} />
                    </label>
                  </div>

                  <div className="text-center w-100 px-2">
                    <h3 className="heading-tracking text-white m-0 text-truncate" style={{ fontSize: '1.3rem' }}>{newName || 'OPERATIVE'}</h3>
                    {userPlan.plan !== 'Bronze' && (
                      <div className="mt-2">
                        <Badge bg="transparent" className="border-gold-thin text-luxury-gold px-3 py-1" style={{fontSize: '0.5rem', letterSpacing: '2px'}}>
                          {userPlan.plan === 'Unlimited' ? 'LEGENDARY ID' : 'PREMIUM ID'}
                        </Badge>
                      </div>
                    )}
                    <p className="subtext-tracking text-muted mt-3 mb-4 small text-truncate" style={{ textTransform: 'none' }}>{auth.currentUser?.email}</p>
                  </div>

                  <div className="w-100 d-flex flex-column gap-2 mt-auto px-2 px-md-3">
                    <button className="btn-gold-solid w-100 py-2 d-flex align-items-center justify-content-center gap-2" style={{ fontSize: '0.75rem' }} onClick={() => setShowEditModal(true)}>
                      <Edit3 size={14} /> EDIT IDENTITY
                    </button>
                    {userPlan.role === 'admin' && (
                      <button className="btn-gold-outline w-100 py-2 d-flex align-items-center justify-content-center gap-2" 
                        style={{ fontSize: '0.75rem' }} 
                        onClick={() => navigate('/admin-vault-access-main')}
                      >
                        <ShieldCheck size={14} /> ADMIN CONSOLE
                      </button>
                    )}
                    <button className="btn-dark-outline w-100 py-2 text-danger border-danger-faint" style={{ fontSize: '0.75rem' }} onClick={logout}>
                      <LogOut size={14} className="me-2" /> DISCONNECT
                    </button>
                  </div>
                </div>
              </motion.div>

              <div className="card-premium-dark p-4">
                <div className="d-flex align-items-center gap-2 mb-4 pb-2 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <Package size={16} color="var(--gold-solid)" />
                    <span className="text-white heading-tracking m-0" style={{ fontSize: '0.8rem' }}>Live Statistics</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="subtext-tracking text-muted small">ACTIVE BREACHES</span>
                  <span className="heading-tracking text-white" style={{ fontSize: '1.2rem' }}>{counts.items < 10 ? `0${counts.items}` : counts.items}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="subtext-tracking text-muted small">SECURE TAGS</span>
                  <span className="heading-tracking text-luxury-gold" style={{ fontSize: '1.2rem' }}>{counts.tags < 10 ? `0${counts.tags}` : counts.tags}</span>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={8} xs={12}>
            <div className="h-100 d-flex flex-column gap-4">
              <div className="card-premium-dark p-4 p-md-5 flex-grow-1">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <ShieldCheck size={22} color="var(--gold-solid)" />
                    <span className="text-white heading-tracking m-0" style={{ fontSize: '1rem' }}>Security Protocols</span>
                </div>
                
                <div className="protocol-container">
                  <div className="protocol-row">
                    <div className="protocol-info">
                      <h6 className="heading-tracking text-white m-0">Vault Tier</h6>
                      <p className="subtext-tracking text-muted mb-0 small">Current: {userPlan.plan.toUpperCase()}</p>
                    </div>
                    {userPlan.plan === 'Bronze' ? (
                      <button className="btn-gold-solid py-2 px-3 small" style={{ fontSize: '0.6rem' }} onClick={() => setShowSubModal(true)}>ACTIVATE SILVER</button>
                    ) : (
                      <Badge bg="transparent" className="border-gold-glow-thin text-luxury-gold py-2">PREMIUM ACTIVE</Badge>
                    )}
                  </div>
                  <div className="protocol-row">
                    <div className="protocol-info">
                      <h6 className="heading-tracking text-white m-0">Identity Link</h6>
                      <p className="subtext-tracking text-muted mb-0 small text-truncate" style={{maxWidth: '200px'}}>{auth.currentUser?.email}</p>
                    </div>
                    <Badge bg="transparent" className="border-success text-success py-2">VERIFIED</Badge>
                  </div>
                  <div className="protocol-row">
                    <div className="protocol-info">
                      <h6 className="heading-tracking text-white m-0">Vault Passkey</h6>
                      <p className="subtext-tracking text-muted mb-0 small">Secured with AES encryption.</p>
                    </div>
                    <button className="btn-dark-outline py-2 px-3 small" style={{ fontSize: '0.6rem' }} onClick={() => setShowPassModal(true)}>UPDATE KEY</button>
                  </div>
                  <div className="protocol-row">
                    <div className="protocol-info">
                      <h6 className="heading-tracking text-danger m-0">Terminate Protocol</h6>
                      <p className="subtext-tracking text-muted mb-0 small">Wipe all secure data.</p>
                    </div>
                    <button className="btn btn-link text-danger p-0 small text-decoration-underline" onClick={handleDeleteAccount}>INITIATE</button>
                  </div>
                  
                  {/* --- REFER & EARN BUTTON --- */}
                  <div className="protocol-row no-border">
                    <div className="protocol-info">
                      <h6 className="heading-tracking text-luxury-gold m-0">Refer & Earn</h6>
                      <p className="subtext-tracking text-muted mb-0 small">Earn Cyber Coins by inviting operatives.</p>
                    </div>
                    <button 
                      className="btn-gold-glow py-2 px-3 d-flex align-items-center gap-2" 
                      style={{ fontSize: '0.65rem' }}
                      onClick={handleReferClick}
                    >
                      <Share2 size={14} /> <span>ACCESS DASHBOARD</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="trust-shield-banner">
                  <ShieldCheck size={100} className="shield-bg-icon" />
                  <div className="d-flex align-items-center gap-3 position-relative">
                    <div className="p-2 bg-gold-faded border-gold rounded">
                        <UserCheck size={24} color="var(--gold-solid)" />
                    </div>
                    <div>
                      <h5 className="heading-tracking text-luxury-gold mb-1" style={{ fontSize: '0.8rem' }}>FoundIt Trust Shield</h5>
                      <p className="subtext-tracking text-muted mb-0 extra-small">End-to-end identity encryption active.</p>
                    </div>
                  </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <SubscriptionModal show={showSubModal} onHide={() => setShowSubModal(false)} onUpgrade={handleUpgradePayment} />

      {/* --- MODALS --- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered contentClassName="bg-transparent border-0">
        <div className="card-premium-dark p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2" style={{borderColor: 'rgba(255,255,255,0.05)'}}>
            <h4 className="heading-tracking text-white m-0" style={{ fontSize: '0.9rem' }}>Edit Identity</h4>
            <X size={18} className="text-muted cursor-pointer" onClick={() => setShowEditModal(false)} />
          </div>
          <Form.Group className="mb-4">
            <Form.Label className="subtext-tracking text-muted small mb-2">New Operative Name</Form.Label>
            <Form.Control className="bg-black text-white border-gold-thin p-3 shadow-none" style={{ fontSize: '0.8rem' }} value={newName} onChange={(e) => setNewName(e.target.value)} />
          </Form.Group>
          <button className="btn-gold-solid w-100 py-3" onClick={handleUpdateNameRequest} disabled={updating}>
            {updating ? <Spinner size="sm" /> : <span className="heading-tracking" style={{ fontSize: '0.8rem' }}>CONFIRM CHANGE</span>}
          </button>
        </div>
      </Modal>

      <Modal show={showPassModal} onHide={() => setShowPassModal(false)} centered contentClassName="bg-transparent border-0">
        <div className="card-premium-dark p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2" style={{borderColor: 'rgba(255,255,255,0.05)'}}>
            <h4 className="heading-tracking text-white m-0" style={{ fontSize: '0.9rem' }}>Vault Key</h4>
            <X size={18} className="text-muted cursor-pointer" onClick={() => setShowPassModal(false)} />
          </div>
          <Form.Group className="mb-4">
            <Form.Label className="subtext-tracking text-muted small mb-2">New Passkey</Form.Label>
            <Form.Control type="password" placeholder="Min 6 chars" className="bg-black text-white border-gold-thin p-3 shadow-none" style={{ fontSize: '0.8rem' }} onChange={(e) => setNewPass(e.target.value)} />
          </Form.Group>
          <button className="btn-gold-solid w-100 py-3 d-flex align-items-center justify-content-center gap-2" onClick={handleUpdatePassword} disabled={updating}>
            {updating ? <Spinner size="sm" /> : <><Key size={16} /><span className="heading-tracking" style={{ fontSize: '0.8rem' }}>APPLY KEY</span></>}
          </button>
        </div>
      </Modal>

      <Modal show={showCropModal} onHide={() => setShowCropModal(false)} size="lg" centered contentClassName="bg-transparent border-0">
        <div className="card-premium-dark p-3">
          <div className="position-relative rounded overflow-hidden mb-3" style={{ height: '350px', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
          </div>
          <div className="d-flex justify-content-between align-items-center gap-3">
             <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="w-50" />
             <div className="d-flex gap-2">
               <button className="btn-dark-outline py-2 px-3 small" onClick={() => setShowCropModal(false)}>CANCEL</button>
               <button className="btn-gold-solid py-2 px-3 small" onClick={handleUploadProfile} disabled={updating}>
                  {updating ? <Spinner size="sm" /> : 'APPLY SCAN'}
               </button>
             </div>
          </div>
        </div>
      </Modal>

      <style>{`
        .avatar-main-frame { background: #000; border: 2px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .crown-container-royal {
          position: absolute; top: -35px; left: 50%; transform: translateX(-50%);
          z-index: 50; filter: drop-shadow(0 0 10px rgba(212,175,55,0.8));
          animation: crownFloat 3s ease-in-out infinite;
        }
        @keyframes crownFloat { 
           0%, 100% { transform: translateX(-50%) translateY(0) rotate(-5deg); } 
           50% { transform: translateX(-50%) translateY(-8px) rotate(5deg); } 
        }
        .premium-royal-ring {
          position: absolute; top: -10px; left: -10px; right: -10px; bottom: -10px;
          border-radius: 50%; border: 2px solid transparent;
          border-top-color: var(--gold-solid); border-bottom-color: var(--gold-solid);
          animation: spinRing 4s linear infinite; z-index: 5;
          filter: blur(1px); opacity: 0.8;
        }
        @keyframes spinRing { 100% { transform: rotate(360deg); } }
        .camera-btn-circle-perfect {
          position: absolute; bottom: 0; right: 0; width: 38px; height: 38px;
          background: #000; border: 1px solid var(--gold-solid); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 30; transition: 0.3s;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }
        .camera-btn-circle-perfect:hover { transform: scale(1.1); background: rgba(212, 175, 55, 0.1); }
        .premium-verified-badge-gold {
          position: absolute; bottom: 8px; left: 8px; width: 28px; height: 28px;
          background: var(--gold-solid); border-radius: 50%; border: 3px solid #000;
          display: flex; align-items: center; justify-content: center; z-index: 40;
        }
        
        /* Updated Mobile Protocol Row */
        .protocol-row { 
          padding: 20px 0; 
          border-bottom: 1px solid rgba(255,255,255,0.05); 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          gap: 15px; 
          flex-wrap: nowrap;
        }
        
        .no-border { border: none !important; }
        .trust-shield-banner { background: rgba(212, 175, 55, 0.03); border: 1px solid rgba(212, 175, 55, 0.1); border-radius: 15px; padding: 25px; position: relative; overflow: hidden; }
        .shield-bg-icon { position: absolute; top: -20px; right: -20px; color: var(--gold-solid); opacity: 0.05; transform: rotate(15deg); }
        
        .btn-gold-glow {
          background: rgba(212, 175, 55, 0.1);
          color: var(--gold-solid);
          border: 1px solid var(--gold-solid);
          border-radius: 4px;
          transition: 0.3s all ease;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
          white-space: nowrap;
        }
        .btn-gold-glow:hover {
          background: var(--gold-solid);
          color: black;
          box-shadow: 0 0 25px rgba(212, 175, 55, 0.5);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .dashboard-root { padding: 15px !important; }
          .protocol-row { 
            flex-direction: row; 
            text-align: left; 
            padding: 15px 0;
            justify-content: space-between;
          }
          .protocol-info { flex: 1; min-width: 0; }
          .protocol-info h6 { font-size: 0.85rem !important; }
          .protocol-info p { font-size: 0.7rem !important; }
          .heading-tracking { font-size: 1rem !important; }
          .btn-gold-glow, .btn-gold-solid, .btn-dark-outline {
            padding: 8px 12px !important;
            font-size: 0.6rem !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default Profile;