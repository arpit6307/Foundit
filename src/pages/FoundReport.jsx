// src/pages/FoundReport.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase-config';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import { 
  ShieldCheck, MapPin, User, Phone, MessageSquare, 
  Send, Package, Search, ArrowRight, CheckCircle2,
  Lock, Image as ImageIcon, Info, HelpCircle, X, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { uploadImageToCloudinary } from '../utils/uploadImage';

const FoundReport = () => {
  const { qrId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tagData, setTagData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualId, setManualId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanError, setScanError] = useState('');
  const [finderInfo, setFinderInfo] = useState({ name: '', contact: '', message: '', locationFound: '' });

  const extractId = (input) => {
    if (!input) return "";
    let clean = input.trim();
    if (clean.includes('/')) return clean.split('/').pop().trim();
    return clean;
  };

  useEffect(() => {
    if (qrId && qrId !== 'manual') {
      verifyVaultId(qrId);
    }
  }, [qrId]);

  const verifyVaultId = async (inputId) => {
    const finalId = extractId(inputId);
    if (!finalId) return;
    
    setLoading(true);
    setScanError('');
    try {
      const q = query(collection(db, "userQRs"), where("qrId", "==", finalId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        const docId = querySnapshot.docs[0].id;
        setTagData({ ...docData, firestoreDocId: docId });
      } else {
        setScanError("VAULT ID NOT RECOGNIZED. PLEASE CHECK AGAIN.");
      }
    } catch (err) {
      setScanError("CONNECTION ERROR. PLEASE TRY LATER.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!user || !tagData) return;
    setSubmitting(true);
    try {
      let finalImageUrl = "";
      if (image) finalImageUrl = await uploadImageToCloudinary(image);
      
      await addDoc(collection(db, "notifications"), {
        qrId: tagData.qrId, 
        ownerId: tagData.userId,
        assetName: tagData.assetName,
        finderName: finderInfo.name,
        finderContact: finderInfo.contact,
        finderMessage: finderInfo.message,
        locationFound: finderInfo.locationFound,
        finderUid: user.uid,
        itemImageUrl: finalImageUrl,
        timestamp: serverTimestamp(),
        status: 'unread'
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3500);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  if (success) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-premium-dark p-5 text-center" style={{ maxWidth: '480px' }}>
        <div className="mb-4 d-inline-flex p-3 rounded-circle" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--gold-solid)' }}>
            <CheckCircle2 size={50} color="var(--gold-solid)" strokeWidth={1.5} />
        </div>
        <h2 className="heading-tracking text-white mb-3">THANK YOU, OPERATIVE</h2>
        <p className="subtext-tracking text-muted mb-4">Report broadcasted. Owner has been alerted.</p>
        <div className="d-flex align-items-center justify-content-center gap-2">
            <Spinner animation="grow" size="sm" style={{color: 'var(--gold-solid)'}} />
            <span className="subtext-tracking" style={{fontSize: '0.65rem'}}>RETURNING TO HUB...</span>
        </div>
      </motion.div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 p-md-4 p-lg-5 min-vh-100">
      <Container>
        {!tagData ? (
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
            <motion.div layout className="card-premium-dark p-4 p-md-5 w-100 position-relative" style={{ maxWidth: '550px' }}>
              {loading && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center rounded-4" style={{ background: 'rgba(0,0,0,0.9)', zIndex: 10 }}>
                   <Spinner animation="border" style={{ color: 'var(--gold-solid)' }} />
                   <p className="mt-3 subtext-tracking text-luxury-gold" style={{ fontSize: '0.7rem' }}>DECRYPTING VAULT...</p>
                </div>
              )}
              
              <div className="text-center mb-4">
                <Search size={40} color="var(--gold-solid)" className="mb-3" />
                <h2 className="heading-tracking text-white">VAULT <span className="text-luxury-gold">UNLOCK</span></h2>
              </div>

              <Form onSubmit={(e) => { e.preventDefault(); verifyVaultId(manualId); }}>
                <div className="d-flex align-items-center px-3 rounded mb-4 shadow-inner" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid rgba(255,255,255,0.1)', minHeight: '65px' }}>
                  <Lock size={20} color="var(--gold-solid)" />
                  <Form.Control 
                    placeholder="ENTER 6-DIGIT VAULT ID" 
                    className="bg-transparent border-0 text-white heading-tracking ms-3 shadow-none" 
                    style={{letterSpacing: '4px', fontSize: '1.2rem'}}
                    value={manualId} 
                    onChange={(e) => setManualId(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
                    required 
                  />
                </div>
                {scanError && <p className="text-danger small text-center mb-3 fw-bold">{scanError}</p>}
                <button type="submit" className="btn-gold-solid w-100 py-3 d-flex align-items-center justify-content-center gap-2 mb-4">
                  ACCESS VAULT <ArrowRight size={18} />
                </button>
              </Form>

              {/* --- NEW INSTRUCTIONS SECTION --- */}
              <div className="mt-2 p-3 rounded border-white-thin bg-black-depth">
                <div className="d-flex align-items-center gap-2 mb-3 border-bottom border-white-thin pb-2">
                  <HelpCircle size={16} className="text-luxury-gold" />
                  <span className="heading-tracking text-white" style={{fontSize: '0.7rem'}}>USER INSTRUCTIONS</span>
                </div>
                
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex gap-3">
                    <div className="step-num">01</div>
                    <p className="subtext-tracking text-muted m-0" style={{fontSize: '0.65rem'}}>
                      Find the 6-digit <span className="text-white">Vault ID</span> printed on the physical secure tag attached to the item.
                    </p>
                  </div>
                  
                  <div className="d-flex gap-3">
                    <div className="step-num">02</div>
                    <p className="subtext-tracking text-muted m-0" style={{fontSize: '0.65rem'}}>
                      Input the numeric code in the field above and click <span className="text-luxury-gold">ACCESS VAULT</span> to verify ownership.
                    </p>
                  </div>

                  <div className="d-flex gap-3">
                    <div className="step-num">03</div>
                    <p className="subtext-tracking text-muted m-0" style={{fontSize: '0.65rem'}}>
                      Once verified, you can directly message the owner to coordinate a safe return protocol.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        ) : (
          <Row className="g-4 justify-content-center">
            <Col lg={12}>
              <div className="mb-5 border-bottom pb-4" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                <h1 className="heading-tracking text-white m-0">FOUND <span className="text-luxury-gold">IDENTIFIED</span></h1>
                <p className="subtext-tracking text-muted">Verification Complete for Vault ID: {tagData.qrId}</p>
              </div>

              <Row className="g-4">
                <Col lg={5}>
                  <div className="d-flex flex-column gap-4">
                    <div className="card-premium-dark p-4 shadow-lg">
                      <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                         <ShieldCheck size={20} color="var(--gold-solid)" /><span className="heading-tracking text-white" style={{ fontSize: '0.8rem' }}>OWNER INTEL</span>
                      </div>
                      <label className="subtext-tracking text-muted d-block mb-1">ASSET</label>
                      <h4 className="heading-tracking text-white mb-4" style={{ fontSize: '1.1rem' }}>{tagData.assetName?.toUpperCase()}</h4>
                      <label className="subtext-tracking text-muted d-block mb-1">OWNER</label>
                      <div className="d-flex align-items-center gap-2 text-white mb-4"><User size={16} color="var(--gold-solid)" /><span className="heading-tracking">{tagData.ownerName}</span></div>
                      <div className="p-3 rounded bg-gold-faded border-gold-glow-thin"><p className="subtext-tracking text-luxury-gold m-0" style={{ fontSize: '0.65rem' }}>{tagData.returnMessage}</p></div>
                    </div>

                    <div className="card-premium-dark p-4">
                      <div className="d-flex align-items-center gap-3 mb-3 pb-2 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
                         <ImageIcon size={20} color="var(--gold-solid)" /><span className="heading-tracking text-white" style={{ fontSize: '0.8rem' }}>VISUAL EVIDENCE</span>
                      </div>
                      {!preview ? (
                        <label className="w-100 rounded d-flex flex-column align-items-center justify-content-center py-5 cursor-pointer transition-smooth" style={{ border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(15,15,15,0.5)' }}>
                           <Upload size={30} color="var(--text-muted)" className="mb-2" />
                           <span className="subtext-tracking text-muted" style={{ fontSize: '0.65rem' }}>UPLOAD PHOTO</span>
                           <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                        </label>
                      ) : (
                        <div className="position-relative rounded overflow-hidden" style={{ height: '200px', border: '1px solid var(--gold-solid)' }}>
                          <img src={preview} className="w-100 h-100 object-fit-cover" alt="Item" />
                          <button onClick={() => {setPreview(null); setImage(null);}} className="position-absolute top-0 end-0 m-2 btn btn-dark btn-sm rounded-circle"><X size={14}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>

                <Col lg={7}>
                  <div className="card-premium-dark p-4 p-md-5 h-100 shadow-lg">
                    <Form onSubmit={handleSubmitReport}>
                      <div className="d-flex align-items-center gap-3 mb-4"><MessageSquare size={20} color="var(--gold-solid)" /><span className="heading-tracking text-white">FINDER INTEL</span></div>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Label className="subtext-tracking text-muted ms-1">Name</Form.Label>
                          <div className="d-flex align-items-center px-3 rounded" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid rgba(255,255,255,0.1)', minHeight: '50px' }}>
                            <Form.Control required className="bg-transparent border-0 text-white subtext-tracking shadow-none" style={{ fontSize: '0.75rem' }} onChange={(e) => setFinderInfo({...finderInfo, name: e.target.value})} />
                          </div>
                        </Col>
                        <Col md={6}>
                          <Form.Label className="subtext-tracking text-muted ms-1">Contact</Form.Label>
                          <div className="d-flex align-items-center px-3 rounded" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid rgba(255,255,255,0.1)', minHeight: '50px' }}>
                            <Form.Control required className="bg-transparent border-0 text-white subtext-tracking shadow-none" style={{ fontSize: '0.75rem' }} onChange={(e) => setFinderInfo({...finderInfo, contact: e.target.value})} />
                          </div>
                        </Col>
                        <Col md={12}>
                          <Form.Label className="subtext-tracking text-muted ms-1">Location Details</Form.Label>
                          <div className="d-flex align-items-center px-3 rounded" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid rgba(255,255,255,0.1)', minHeight: '50px' }}>
                            <Form.Control required className="bg-transparent border-0 text-white subtext-tracking shadow-none" style={{ fontSize: '0.75rem' }} onChange={(e) => setFinderInfo({...finderInfo, locationFound: e.target.value})} />
                          </div>
                        </Col>
                        <Col md={12}>
                          <Form.Label className="subtext-tracking text-muted ms-1">Brief Signal</Form.Label>
                          <div className="d-flex align-items-start px-3 py-3 rounded" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Form.Control as="textarea" rows={3} className="bg-transparent border-0 text-white subtext-tracking shadow-none" style={{ fontSize: '0.75rem', resize: 'none' }} onChange={(e) => setFinderInfo({...finderInfo, message: e.target.value})} />
                          </div>
                        </Col>
                      </Row>
                      <button type="submit" disabled={submitting || !user} className="btn-gold-solid w-100 mt-4 py-3 d-flex align-items-center justify-content-center gap-2">
                        {submitting ? <Spinner size="sm" /> : (!user ? <><Lock size={18} /> LOGIN TO BROADCAST</> : <><Send size={18} /> BROADCAST SIGNAL</>)}
                      </button>
                    </Form>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
      </Container>

      <style>{`
        .bg-black-depth { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); }
        .bg-gold-faded { background: rgba(212, 175, 55, 0.05); }
        .border-gold-glow-thin { border: 1px solid rgba(212, 175, 55, 0.2); }
        .step-num { 
          background: var(--gold-solid); color: #000; 
          font-family: monospace; font-weight: 800; font-size: 0.6rem;
          min-width: 20px; height: 20px; border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
        }
        .extra-small { font-size: 0.55rem; }
      `}</style>
    </motion.div>
  );
};

export default FoundReport;