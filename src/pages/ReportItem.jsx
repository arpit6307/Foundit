// src/pages/ReportItem.jsx
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Spinner, Container, Alert } from 'react-bootstrap';
import { 
  Tag, MapPin, AlignLeft, Send, Upload, X, CheckCircle, 
  ShieldCheck, ArrowRight, Target, Scan, Fingerprint, 
  Image as ImageIcon, Laptop, Dog, FileText, Shirt, HelpCircle, ChevronDown, Lock
} from 'lucide-react';
import { db } from '../firebase-config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { uploadImageToCloudinary } from '../utils/uploadImage';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ReportItem = () => {
  const [formData, setFormData] = useState({ 
    title: '', 
    category: '', 
    otherCategory: '',
    location: '', 
    description: '',
    selectedTagId: '' // Tag link karne ke liye
  });
  
  const [userTags, setUserTags] = useState([]); // Database se tags yahan aayenge
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTags, setFetchingTags] = useState(true);
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- STEP 1: FETCH USER TAGS & CHECK USAGE ---
  useEffect(() => {
    const fetchTags = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "userQRs"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const tags = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserTags(tags);
      } catch (err) {
        console.error("Tag Fetch Error:", err);
      } finally {
        setFetchingTags(false);
      }
    };
    fetchTags();
  }, [user]);

  const categories = [
    { id: 'Electronics', label: 'ELECTRONICS', icon: <Laptop size={14} />, info: 'Phones, Laptops, Gadgets' },
    { id: 'Pets', label: 'BIOLOGICALS', icon: <Dog size={14} />, info: 'Pets, Animals' },
    { id: 'Documents', label: 'DOCUMENTS', icon: <FileText size={14} />, info: 'ID Cards, Passports, Files' },
    { id: 'Fashion', label: 'GEAR', icon: <Shirt size={14} />, info: 'Bags, Watches, Clothing' },
    { id: 'Others', label: 'OTHERS', icon: <HelpCircle size={14} />, info: 'Unclassified Items' },
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("File exceeds 5MB limit.");
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !formData.selectedTagId) {
      alert("Please select an available Secure Tag to proceed.");
      return;
    }
    setLoading(true);

    try {
      let finalImageUrl = ""; 
      if (image) {
        const uploadedUrl = await uploadImageToCloudinary(image);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const finalCategory = formData.category === 'Others' ? formData.otherCategory : formData.category;

      // 1. Add Report to 'lostItems'
      await addDoc(collection(db, "lostItems"), {
        title: formData.title.trim(),
        category: finalCategory,
        location: formData.location.trim(),
        description: formData.description.trim(),
        imageUrl: finalImageUrl, 
        userId: user.uid,
        qrId: formData.selectedTagId, // Connection established
        status: "lost",
        createdAt: serverTimestamp(),
      });

      // 2. Mark Tag as 'used' in 'userQRs' so it can't be reused
      const tagRef = doc(db, "userQRs", formData.selectedTagId);
      await updateDoc(tagRef, { isReported: true });

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (error) {
      console.error("System Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="dashboard-root d-flex justify-content-center align-items-center min-vh-100 p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-premium-dark p-5 text-center">
          <CheckCircle size={50} color="var(--gold-solid)" className="mx-auto mb-4" />
          <h2 className="heading-tracking text-white mb-2">PROTOCOL DEPLOYED</h2>
          <p className="subtext-tracking text-muted mt-2">Tag {formData.selectedTagId} is now live on the recovery network.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-root p-3 p-md-4 p-lg-5 min-vh-100">
      <Container>
        <div className="mb-4 mb-md-5 border-bottom pb-4" style={{ borderColor: 'var(--border-white-thin) !important' }}>
          <div className="d-flex align-items-center gap-3">
            <Scan size={28} color="var(--gold-solid)" />
            <div>
              <h1 className="m-0 text-white heading-tracking">INITIATE <span className="text-luxury-gold">RECOVERY</span></h1>
              <p className="subtext-tracking mb-0 text-muted mt-1">Bind a secure tag to your lost asset report.</p>
            </div>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            <Col lg={7}>
              <div className="card-premium-dark p-4 p-md-5">
                
                {/* --- NEW: SECURE TAG SELECTION DROPDOWN --- */}
                <div className="mb-4">
                  <Form.Label className="subtext-tracking text-white mb-2 ms-1">Link Secure Tag (Mandatory)</Form.Label>
                  <div className="position-relative">
                    <div 
                      onClick={() => !fetchingTags && setIsTagDropdownOpen(!isTagDropdownOpen)}
                      className="d-flex align-items-center justify-content-between px-3 rounded cursor-pointer" 
                      style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid var(--border-white-thin)', minHeight: '50px' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <Fingerprint size={16} color={formData.selectedTagId ? "var(--gold-solid)" : "var(--text-muted)"} />
                        <span className="subtext-tracking text-white" style={{ fontSize: '0.75rem' }}>
                          {fetchingTags ? 'SYNCING VAULT...' : formData.selectedTagId ? `TAG ID: ${formData.selectedTagId.toUpperCase()}` : 'SELECT AN AVAILABLE TAG'}
                        </span>
                      </div>
                      <ChevronDown size={16} color="var(--text-muted)" />
                    </div>

                    <AnimatePresence>
                      {isTagDropdownOpen && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 5 }} exit={{ opacity: 0, y: 5 }}
                          className="position-absolute w-100 rounded shadow-lg overflow-hidden mt-1"
                          style={{ background: '#0a0a0a', border: '1px solid var(--border-white-thin)', zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                          {userTags.length > 0 ? userTags.map((tag) => {
                            const isUsed = tag.isReported === true;
                            return (
                              <div 
                                key={tag.id}
                                onClick={() => !isUsed && setFormData({ ...formData, selectedTagId: tag.id }) || setIsTagDropdownOpen(false)}
                                className="d-flex align-items-center justify-content-between px-3 py-3"
                                style={{ 
                                  cursor: isUsed ? 'not-allowed' : 'pointer', 
                                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                                  background: isUsed ? 'rgba(255,0,0,0.02)' : 'transparent',
                                  opacity: isUsed ? 0.5 : 1
                                }}
                              >
                                <div>
                                  <div className="subtext-tracking text-white" style={{ fontSize: '0.7rem' }}>{tag.assetName || 'Unnamed Tag'} - {tag.id.toUpperCase()}</div>
                                  {isUsed && <div className="text-danger" style={{ fontSize: '0.6rem' }}>● ALREADY REPORTED (NOT AVAILABLE)</div>}
                                </div>
                                {isUsed ? <Lock size={12} color="#ef4444" /> : formData.selectedTagId === tag.id && <ShieldCheck size={14} color="var(--gold-solid)" />}
                              </div>
                            );
                          }) : (
                            <div className="p-3 text-center text-muted subtext-tracking" style={{ fontSize: '0.7rem' }}>NO TAGS FOUND. GENERATE ONE FIRST.</div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* --- EXISTING FIELDS --- */}
                <div className="mb-4">
                  <Form.Label className="subtext-tracking text-white mb-2 ms-1">Item Title</Form.Label>
                  <div className="d-flex align-items-center px-3 rounded" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid var(--border-white-thin)', minHeight: '50px' }}>
                    <Tag size={16} color="var(--text-muted)" />
                    <Form.Control required placeholder="E.G. BLACK LEATHER WALLET" className="bg-transparent border-0 text-white subtext-tracking ms-3 shadow-none" style={{ fontSize: '0.75rem' }} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                </div>

                <Row className="g-3 mb-4">
                  <Col md={12}>
                    <Form.Label className="subtext-tracking text-white mb-2 ms-1">Sector Category</Form.Label>
                    <div className="position-relative">
                      <div onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)} className="d-flex align-items-center justify-content-between px-3 rounded cursor-pointer" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid var(--border-white-thin)', minHeight: '50px' }}>
                        <div className="d-flex align-items-center gap-3">
                          <Target size={16} color="var(--gold-solid)" />
                          <span className="subtext-tracking text-white" style={{ fontSize: '0.75rem' }}>{formData.category ? formData.category.toUpperCase() : 'SELECT SECTOR'}</span>
                        </div>
                        <ChevronDown size={16} />
                      </div>
                      <AnimatePresence>
                        {isCatDropdownOpen && (
                          <motion.div className="position-absolute w-100 rounded mt-1 shadow-lg overflow-hidden" style={{ background: '#0a0a0a', border: '1px solid var(--border-white-thin)', zIndex: 100 }}>
                            {categories.map((cat) => (
                              <div key={cat.id} onClick={() => { setFormData({ ...formData, category: cat.id }); setIsCatDropdownOpen(false); }} className="px-3 py-3 d-flex justify-content-between align-items-center cursor-pointer" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <div className="d-flex align-items-center gap-3"><span style={{ color: 'var(--gold-solid)' }}>{cat.icon}</span><div className="subtext-tracking text-white" style={{ fontSize: '0.7rem' }}>{cat.label}</div></div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Col>

                  {formData.category === 'Others' && (
                    <Col md={12}>
                      <div className="d-flex align-items-center px-3 rounded" style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--gold-solid)', minHeight: '50px' }}>
                        <Form.Control required placeholder="SPECIFY CATEGORY" className="bg-transparent border-0 text-white subtext-tracking" style={{ fontSize: '0.75rem' }} onChange={(e) => setFormData({...formData, otherCategory: e.target.value})} />
                      </div>
                    </Col>
                  )}

                  <Col md={12}>
                    <Form.Label className="subtext-tracking text-white mb-2 ms-1">Last Signal Spot</Form.Label>
                    <div className="d-flex align-items-center px-3 rounded" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid var(--border-white-thin)', minHeight: '50px' }}>
                      <MapPin size={16} color="var(--text-muted)" />
                      <Form.Control required placeholder="CITY / AREA" className="bg-transparent border-0 text-white subtext-tracking ms-3 shadow-none" style={{ fontSize: '0.75rem' }} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                    </div>
                  </Col>
                </Row>

                <div className="flex-grow-1 d-flex flex-column">
                  <Form.Label className="subtext-tracking text-white mb-2 ms-1">Intel Description</Form.Label>
                  <div className="d-flex align-items-start px-3 py-3 rounded" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid var(--border-white-thin)' }}>
                    <Form.Control as="textarea" rows={3} required placeholder="UNIQUE MARKS..." className="bg-transparent border-0 text-white subtext-tracking shadow-none" style={{ fontSize: '0.75rem', resize: 'none' }} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={5}>
              <div className="card-premium-dark p-4 p-md-5 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border-white-thin) !important' }}>
                    <ImageIcon size={20} color="var(--gold-solid)" />
                    <span className="text-white heading-tracking" style={{ fontSize: '0.9rem' }}>Visual Intel</span>
                  </div>
                  {!preview ? (
                    <label className="w-100 rounded d-flex flex-column align-items-center justify-content-center" style={{ height: '220px', border: '1px dashed var(--border-white-thin)', background: 'rgba(15,15,15,0.5)', cursor: 'pointer' }}>
                      <Upload size={30} color="var(--text-muted)" className="mb-2" />
                      <span className="subtext-tracking text-muted" style={{ fontSize: '0.65rem' }}>PNG/JPG MAX 5MB</span>
                      <input type="file" className="d-none" accept="image/*" onChange={handleImageChange} />
                    </label>
                  ) : (
                    <div className="position-relative rounded overflow-hidden" style={{ height: '220px', border: '1px solid var(--border-white-thin)' }}>
                      <img src={preview} className="w-100 h-100 object-fit-cover" alt="preview" />
                      <button onClick={() => {setPreview(null); setImage(null);}} className="position-absolute top-0 end-0 m-2 btn btn-dark btn-sm"><X size={14}/></button>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-top" style={{ borderColor: 'var(--border-white-thin) !important' }}>
                  <button type="submit" disabled={loading} className="btn-gold-solid w-100 py-3 d-flex align-items-center justify-content-center gap-2">
                    {loading ? <Spinner animation="border" size="sm" style={{color:'#000'}} /> : <><Send size={18} /><span className="heading-tracking">DEPLOY PROTOCOL</span></>}
                  </button>
                  {!formData.selectedTagId && <p className="text-danger text-center mt-2" style={{fontSize: '0.6rem'}}>● SELECT A TAG TO INITIALIZE RECOVERY</p>}
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Container>
    </motion.div>
  );
};

export default ReportItem;