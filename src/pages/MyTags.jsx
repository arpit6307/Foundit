// src/pages/MyTags.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase-config';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import { Row, Col, Spinner, Modal } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';
import { Trash2, Download, QrCode, Calendar, Plus, ShieldAlert, X, Info, User, Phone, MapPin, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MyTags = () => {
  const { user } = useAuth();
  const { askConfirm } = useConfirm();
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "userQRs"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tagsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const sortedData = tagsData.sort((a, b) => {
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });
      
      setTags(sortedData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const initiateDelete = (id) => {
    askConfirm(
      "TERMINATE TAG", 
      "Are you sure you want to permanently delete this secure tag? All scanning capabilities will be disabled.",
      async () => {
        setTags(prev => prev.filter(tag => tag.id !== id));
        try {
          await deleteDoc(doc(db, "userQRs", id));
        } catch (err) {
          console.error("Delete Error:", err);
        }
      },
      'danger'
    );
  };

  const handleShowDetails = (tag) => {
    setSelectedTag(tag);
    setShowDetails(true);
  };

  const downloadQR = (tag) => {
    const canvas = document.getElementById(`qr-${tag.id}`);
    if (!canvas) return;
    
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    tempCanvas.width = 400;
    tempCanvas.height = 500; 
    
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, tempCanvas.width - 20, tempCanvas.height - 20);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SECURE ASSET TAG', tempCanvas.width / 2, 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(50, 75, 300, 300);
    ctx.drawImage(canvas, 50, 75, 300, 300);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 24px monospace';
    // ✅ Numeric 6-digit ID used here
    ctx.fillText(`VAULT ID: ${tag.qrId || tag.id.substring(0,6)}`, tempCanvas.width / 2, 430);

    ctx.fillStyle = '#666666';
    ctx.font = '10px sans-serif';
    ctx.fillText('FOUNDIT SECURITY NETWORK', tempCanvas.width / 2, 475);

    const pngUrl = tempCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `FoundIt_Tag_${tag.qrId || tag.id.substring(0,6)}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-root p-2 p-md-4 p-lg-5 min-vh-100">
      <div className="container-fluid position-relative px-1 px-md-3" style={{ zIndex: 10 }}>
        
        <div className="mb-4 mb-md-5 border-bottom pb-3 pb-md-4" style={{ borderColor: 'var(--border-white-thin) !important' }}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
            <motion.div initial={{ x: -20 }} animate={{ x: 0 }} className="d-flex align-items-center gap-2 gap-md-3">
              <QrCode size={28} color="var(--gold-solid)" strokeWidth={1.5} className="d-none d-sm-block" />
              <div>
                <h1 className="m-0 text-white heading-tracking" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.6rem)', fontWeight: 300 }}>
                  ASSET <span className="text-luxury-gold" style={{ fontWeight: 800 }}>INVENTORY</span>
                </h1>
                <p className="subtext-tracking mb-0 text-muted mt-1" style={{ fontSize: '0.6rem' }}>Manage your active recovery tags.</p>
              </div>
            </motion.div>
            
            {!loading && (
              <button className="btn-dark-outline d-flex align-items-center justify-content-center gap-2 py-2 px-3 px-md-4" onClick={() => navigate('/generate-qr')} style={{ fontSize: '0.7rem' }}>
                <Plus size={14} /> MINT NEW TAG
              </button>
            )}
          </div>
        </div>

        <Row className="g-2 g-md-4">
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <Col lg={4} md={6} xs={6} key={i}>
                 <div className="card-premium-dark p-3 d-flex flex-column align-items-center justify-content-center" style={{ height: '250px' }}>
                    <Spinner animation="grow" size="sm" style={{ color: 'var(--gold-solid)', opacity: 0.5 }} />
                 </div>
              </Col>
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <Col lg={4} md={6} xs={6} key={tag.id}>
                    <motion.div layout initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="h-100">
                      <div className="card-premium-dark h-100 d-flex flex-column p-2 p-md-4">
                        
                        <div className="d-flex justify-content-between align-items-start mb-2 mb-md-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-white-thin) !important' }}>
                          <div className="min-w-0">
                            <h4 className="heading-tracking text-white m-0 text-truncate" style={{ fontSize: 'clamp(0.65rem, 3vw, 0.8rem)' }}>
                              {tag.assetName || "UNTITLED"}
                            </h4>
                            <div className="subtext-tracking mt-1 d-flex align-items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.55rem' }}>
                              <span className="text-luxury-gold fw-bold">ID: {tag.qrId || tag.id.substring(0,6)}</span>
                            </div>
                          </div>
                          <button className="btn p-1 rounded" style={{ color: 'var(--text-muted)' }} onClick={() => initiateDelete(tag.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <div className="text-center p-1 p-md-3 rounded mb-2 mb-md-4 mx-auto bg-white" style={{ border: '1.5px solid var(--gold-solid)', width: 'fit-content' }}>
                           <QRCodeCanvas 
                             id={`qr-${tag.id}`} 
                             value={`${window.location.origin}/found-report/${tag.qrId || tag.id}`} 
                             size={window.innerWidth < 768 ? 100 : 150} 
                             level={"H"} 
                             fgColor="#000000"
                             bgColor="#FFFFFF"
                           />
                        </div>

                        <div className="mt-auto d-flex flex-column gap-1 gap-md-2">
                          <button className="btn-gold-solid py-1 py-md-2 d-flex align-items-center justify-content-center gap-2" style={{ fontSize: '0.65rem' }} onClick={() => downloadQR(tag)}>
                            <Download size={14} /> EXPORT
                          </button>
                          <button className="btn-dark-outline py-1 py-md-2 d-flex align-items-center justify-content-center gap-2" style={{ fontSize: '0.65rem' }} onClick={() => handleShowDetails(tag)}>
                            <Info size={14} /> DETAILS
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  </Col>
                ))
              ) : (
                <Col xs={12} className="text-center py-5">
                  <ShieldAlert size={50} color="var(--text-muted)" className="mb-4 opacity-50" />
                  <h4 className="heading-tracking text-white" style={{ fontSize: '1rem' }}>Vault is Empty</h4>
                  <button className="btn-gold-solid px-4 py-2 mt-3" onClick={() => navigate('/generate-qr')} style={{ fontSize: '0.75rem' }}>MINT TAG</button>
                </Col>
              )}
            </AnimatePresence>
          )}
        </Row>
      </div>

      {/* --- TAG DETAILS MODAL --- */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} centered contentClassName="bg-transparent border-0 shadow-none">
        <div className="card-premium-dark p-4 border-gold-glow">
          <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-white-thin">
             <div className="d-flex align-items-center gap-2">
                <Box size={18} className="text-luxury-gold" />
                <h5 className="heading-tracking text-white m-0" style={{fontSize:'0.9rem'}}>TAG SPECIFICATIONS</h5>
             </div>
             <X size={20} className="text-muted cursor-pointer hover-white" onClick={() => setShowDetails(false)} />
          </div>

          <div className="d-flex flex-column gap-3">
             {[
               { label: 'ASSET NAME', val: selectedTag?.assetName, icon: <Box size={14}/> },
               { label: 'VAULT ID', val: selectedTag?.qrId || selectedTag?.id, icon: <QrCode size={14}/> },
               { label: 'OWNER', val: selectedTag?.ownerName, icon: <User size={14}/> },
               { label: 'CONTACT', val: selectedTag?.phone, icon: <Phone size={14}/> },
               { label: 'AREA', val: selectedTag?.address, icon: <MapPin size={14}/> },
               { label: 'MINTED ON', val: selectedTag?.createdAt ? new Date(selectedTag.createdAt.seconds * 1000).toLocaleDateString() : '...', icon: <Calendar size={14}/> },
             ].map((item, i) => (
               <div key={i} className="d-flex align-items-center justify-content-between p-2 rounded bg-black-depth">
                  <span className="subtext-tracking text-muted d-flex align-items-center gap-2" style={{fontSize:'0.6rem'}}>
                    {item.icon} {item.label}
                  </span>
                  <span className="heading-tracking text-white" style={{fontSize:'0.7rem'}}>{item.val || 'N/A'}</span>
               </div>
             ))}
          </div>

          <button className="btn-gold-solid w-100 py-3 mt-4 heading-tracking" style={{fontSize:'0.7rem'}} onClick={() => setShowDetails(false)}>CLOSE TERMINAL</button>
        </div>
      </Modal>

      <style>{`
        .hover-white:hover { color: white !important; }
        .bg-black-depth { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); }
        .border-gold-glow { border: 1px solid var(--gold-solid); box-shadow: 0 0 20px rgba(212,175,55,0.1); }
      `}</style>
    </motion.div>
  );
};

export default MyTags;