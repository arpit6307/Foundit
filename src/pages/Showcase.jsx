// src/pages/Showcase.jsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Spinner, Modal, Form, Badge } from 'react-bootstrap';
import { db } from '../firebase-config';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { 
  Search, MapPin, Clock, CheckCircle2, 
  AlertTriangle, Filter, Globe, Boxes, ArrowRight, X, User, Phone, MessageSquare, Send, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Showcase = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('lost'); 
  const [loading, setLoading] = useState(true);

  // --- Modal & Signal States ---
  const [selectedItem, setSelectedItem] = useState(null);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [showSignalForm, setShowSignalForm] = useState(false);
  const [signalLoading, setSignalLoading] = useState(false);
  const [signalData, setSignalData] = useState({
    finderName: '',
    finderContact: '',
    locationFound: '',
    finderMessage: '',
  });

  const categories = ['All', 'Electronics', 'Pets', 'Documents', 'Fashion', 'Others'];

  useEffect(() => {
    const q = query(collection(db, "lostItems"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSendSignal = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSignalLoading(true);
    try {
      await addDoc(collection(db, "notifications"), {
        ...signalData,
        ownerId: selectedItem.userId,
        assetName: selectedItem.title,
        itemImageUrl: selectedItem.imageUrl || '',
        qrId: selectedItem.qrId || 'MANUAL_OVERRIDE',
        timestamp: serverTimestamp(),
        status: 'unread',
        category: 'breach'
      });
      alert("SIGNAL TRANSMITTED TO OWNER SUCCESSFULLY.");
      setSignalData({ finderName: '', finderContact: '', locationFound: '', finderMessage: '' });
      setShowSignalForm(false);
      setShowInspectModal(false);
    } catch (err) {
      console.error(err);
      alert("TRANSMISSION FAILED. CHECK SYSTEM UPLINK.");
    } finally {
      setSignalLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const isStatusMatch = item.status === statusFilter;
    const isSearchMatch = 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const isCategoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
    return isStatusMatch && isSearchMatch && isCategoryMatch;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-root p-2 p-md-4 p-lg-5 bg-black min-vh-100">
      <div className="container-fluid position-relative px-1 px-md-3" style={{ zIndex: 10 }}>
        
        {/* --- HEADER SECTION --- */}
        <header className="mb-4 mb-md-5 border-bottom pb-3 pb-md-4 border-white-thin">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 gap-md-4">
            <div className="text-center text-md-start w-100">
              <motion.div initial={{ x: -20 }} animate={{ x: 0 }} className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 gap-md-3 mb-1 mb-md-2">
                <Globe size={24} color="var(--gold-solid)" className="d-none d-sm-block" />
                <h1 className="m-0 text-white heading-tracking" style={{ fontSize: '1.4rem', fontWeight: 300 }}>
                  GLOBAL <span className="text-luxury-gold" style={{ fontWeight: 800 }}>INTELLIGENCE</span>
                </h1>
              </motion.div>
              <p className="subtext-tracking mb-0 text-muted uppercase" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>Encrypted Monitoring Feed // Live</p>
            </div>

            <div className="d-flex p-1 rounded w-100 w-md-auto bg-black-depth border-white-thin shadow-lg">
               <button 
                 className={`flex-fill px-3 px-md-4 py-2 rounded border-0 subtext-tracking transition-smooth d-flex align-items-center justify-content-center gap-2 ${statusFilter === 'lost' ? 'text-white active-status' : 'text-muted'}`}
                 style={{ fontSize: '0.6rem', fontWeight: 700 }}
                 onClick={() => setStatusFilter('lost')}
               >
                 <AlertTriangle size={14} /> ACTIVE
               </button>
               <button 
                 className={`flex-fill px-3 px-md-4 py-2 rounded border-0 subtext-tracking transition-smooth d-flex align-items-center justify-content-center gap-2 ${statusFilter === 'found' ? 'text-luxury-gold active-status-gold' : 'text-muted'}`}
                 style={{ fontSize: '0.6rem', fontWeight: 700 }}
                 onClick={() => setStatusFilter('found')}
               >
                 <CheckCircle2 size={14} /> RECOVERED
               </button>
            </div>
          </div>
        </header>

        {/* --- FILTERS --- */}
        <div className="mb-4 mb-md-5">
          <Row className="g-2 g-md-3">
            <Col xs={12} lg={4}>
              <div className="search-box-terminal">
                 <Search size={16} color="var(--gold-solid)" />
                 <input type="text" placeholder="SEARCH ENCRYPTED ASSETS..." className="terminal-input" onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </Col>
            <Col xs={12} lg={8}>
              <div className="filter-scroll no-scrollbar border-white-thin">
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} 
                      className={`filter-node ${selectedCategory === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </button>
                  ))}
              </div>
            </Col>
          </Row>
        </div>

        {/* --- GRID (2 COLUMNS MOBILE) --- */}
        {loading ? (
          <div className="text-center py-5 mt-5">
            <Spinner animation="border" style={{ color: 'var(--gold-solid)' }} />
            <p className="mt-4 subtext-tracking text-luxury-gold">Syncing Secure Database...</p>
          </div>
        ) : (
          <Row className="g-2 g-md-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <Col xs={6} md={4} lg={3} key={item.id}>
                  <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-100">
                    <div className="card-premium-dark h-100 d-flex flex-column border-white-thin hover-gold-glow">
                      <div className="card-img-frame">
                        <img src={item.imageUrl || "https://via.placeholder.com/400x300?text=SECURE_ASSET"} className="w-100 h-100 object-fit-cover opacity-80" alt="asset" />
                        <div className={`status-badge-overlay ${statusFilter}`}>{statusFilter.toUpperCase()}</div>
                      </div>
                      <div className="p-2 p-md-3 d-flex flex-column flex-grow-1">
                        <h3 className="asset-title-terminal text-truncate">{item.title}</h3>
                        <div className="subtext-tracking mb-2 text-luxury-gold" style={{ fontSize: '0.55rem' }}><Boxes size={10} /> {item.category}</div>
                        <div className="d-flex flex-column gap-1 mb-3">
                          <div className="intel-row"><MapPin size={10} color="var(--gold-solid)" /><span className="text-truncate text-muted">{item.location}</span></div>
                          <div className="intel-row"><Clock size={10} color="#666" /><span>{item.createdAt?.toDate().toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}</span></div>
                        </div>
                        <button className="btn-dark-outline-small w-100 mt-auto" onClick={() => { setSelectedItem(item); setShowInspectModal(true); }}>
                           {statusFilter === 'lost' ? 'INSPECT' : 'VIEW'} <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </Col>
              ))}
            </AnimatePresence>
          </Row>
        )}
      </div>

      {/* --- INSPECT MODAL (FULLY RESPONSIVE) --- */}
      <Modal show={showInspectModal} onHide={() => { setShowInspectModal(false); setShowSignalForm(false); }} centered size="lg" contentClassName="bg-transparent border-0 shadow-none">
        <div className="card-premium-dark p-0 border-gold-glow overflow-hidden mx-2" style={{ background: '#050505', borderRadius: '20px' }}>
          <div className="p-3 p-md-4 d-flex justify-content-between align-items-center border-bottom border-white-thin bg-black-depth">
            <div>
              <h6 className="heading-tracking text-luxury-gold m-0" style={{fontSize:'0.8rem'}}>DOSSIER_REPORT</h6>
              <span className="subtext-tracking text-muted" style={{ fontSize: '0.5rem' }}>LOG_ID: {selectedItem?.id?.slice(0, 8).toUpperCase()}</span>
            </div>
            <button className="btn-close-cyber" onClick={() => setShowInspectModal(false)}><X size={22} /></button>
          </div>

          <div className="modal-body-scroll custom-scrollbar" style={{maxHeight: '80vh', overflowY: 'auto'}}>
            <Row className="g-0">
              <Col lg={5} className="border-end border-white-thin p-3 p-md-4 bg-black">
                 <div className="dossier-img-frame shadow-2xl">
                   <img src={selectedItem?.imageUrl} className="w-100 h-100 object-fit-cover" alt="dossier" />
                 </div>
                 {statusFilter === 'found' && (
                   <div className="p-3 mt-3 bg-black border-gold-glow-thin rounded text-center">
                      <ShieldCheck size={30} className="text-luxury-gold mb-2" />
                      <p className="heading-tracking text-white m-0" style={{fontSize: '0.7rem'}}>STATUS: RECOVERED</p>
                   </div>
                 )}
              </Col>

              <Col lg={7} className="p-3 p-md-4 bg-black-depth">
                {!showSignalForm ? (
                  <div className="d-flex flex-column h-100">
                    <div className="mb-4">
                      <label className="subtext-tracking text-luxury-gold d-block mb-1" style={{fontSize:'0.55rem'}}>ASSET_IDENTIFICATION</label>
                      <h4 className="heading-tracking text-white mb-2" style={{fontSize:'1.2rem'}}>{selectedItem?.title?.toUpperCase()}</h4>
                      <Badge bg="transparent" className="border-gold-thin text-luxury-gold subtext-tracking" style={{fontSize:'0.5rem'}}>{selectedItem?.category}</Badge>
                    </div>

                    <div className="mb-4 p-3 bg-black rounded border-white-thin shadow-inner">
                      <label className="subtext-tracking text-muted d-block mb-2" style={{fontSize:'0.5rem'}}>DESCRIPTION_DATA</label>
                      <p className="text-white subtext-tracking" style={{fontSize: '0.7rem', textTransform: 'none', lineHeight: '1.5'}}>{selectedItem?.description || 'No descriptive data available.'}</p>
                    </div>

                    <div className="d-flex gap-2 mb-4">
                      <div className="flex-fill bg-black p-2 rounded text-center border-white-thin">
                        <MapPin size={14} className="text-luxury-gold mb-1"/>
                        <div className="text-white subtext-tracking" style={{fontSize:'0.55rem'}}>{selectedItem?.location}</div>
                      </div>
                      <div className="flex-fill bg-black p-2 rounded text-center border-white-thin">
                        <Clock size={14} className="text-luxury-gold mb-1"/>
                        <div className="text-white subtext-tracking" style={{fontSize:'0.55rem'}}>{selectedItem?.createdAt?.toDate().toLocaleDateString('en-IN')}</div>
                      </div>
                    </div>

                    {statusFilter === 'lost' && (
                      <button className="btn-gold-solid w-100 mt-auto py-3 shadow-gold heading-tracking" style={{fontSize:'0.7rem'}} onClick={() => setShowSignalForm(true)}>
                         INITIATE RECOVERY SIGNAL
                      </button>
                    )}
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <label className="heading-tracking text-luxury-gold d-block mb-3" style={{fontSize:'0.7rem'}}>RECOVERY_SIGNAL_COMPOSER</label>
                    <Form onSubmit={handleSendSignal}>
                      <Row className="g-2 mb-2">
                         <Col xs={6}>
                           <Form.Control required placeholder="YOUR NAME" className="terminal-input-v2" onChange={(e) => setSignalData({...signalData, finderName: e.target.value})} />
                         </Col>
                         <Col xs={6}>
                           <Form.Control required placeholder="CONTACT NO" className="terminal-input-v2" onChange={(e) => setSignalData({...signalData, finderContact: e.target.value})} />
                         </Col>
                      </Row>
                      <Form.Control required placeholder="SPECIFIC LOCATION FOUND" className="terminal-input-v2 mb-2" onChange={(e) => setSignalData({...signalData, locationFound: e.target.value})} />
                      <Form.Control as="textarea" rows={3} placeholder="ADDITIONAL MESSAGE FOR OWNER" className="terminal-input-v2 mb-3" style={{resize: 'none'}} onChange={(e) => setSignalData({...signalData, finderMessage: e.target.value})} />
                      
                      <div className="d-flex gap-2">
                        <button type="button" className="btn-dark-outline-small flex-fill py-2" onClick={() => setShowSignalForm(false)}>BACK</button>
                        <button type="submit" disabled={signalLoading} className="btn-gold-solid flex-fill py-2 shadow-gold subtext-tracking" style={{fontSize:'0.65rem'}}>
                          {signalLoading ? <Spinner size="sm" /> : <><Send size={14} className="me-1" /> TRANSMIT</>}
                        </button>
                      </div>
                    </Form>
                  </motion.div>
                )}
              </Col>
            </Row>
          </div>
        </div>
      </Modal>

      <style>{`
        .bg-black-depth { background: #050505; }
        .bg-black { background: #000 !important; }
        .border-white-thin { border: 1px solid rgba(255,255,255,0.05) !important; }
        .active-status { background: rgba(255,255,255,0.05) !important; border-bottom: 2px solid #fff !important; }
        .active-status-gold { background: rgba(212,175,55,0.05) !important; border-bottom: 2px solid var(--gold-solid) !important; }

        .search-box-terminal { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.05); padding: 10px 15px; border-radius: 12px; display: flex; align-items: center; }
        .terminal-input { background: transparent; border: none; color: white; width: 100%; margin-left: 10px; outline: none; font-size: 0.7rem; letter-spacing: 1px; }

        .filter-scroll { display: flex; gap: 8px; overflow-x: auto; padding: 10px 5px; scrollbar-width: none; }
        .filter-scroll::-webkit-scrollbar { display: none; }
        .filter-node { background: #0a0a0a; border: 1px solid rgba(255,255,255,0.05); color: #666; padding: 6px 16px; border-radius: 8px; font-size: 0.6rem; font-weight: 700; transition: 0.3s; white-space: nowrap; }
        .filter-node.active { background: rgba(212, 175, 55, 0.1); border-color: var(--gold-solid); color: var(--gold-solid); box-shadow: 0 0 10px rgba(212,175,55,0.1); }

        .card-img-frame { height: 110px; background: #000; position: relative; overflow: hidden; }
        .status-badge-overlay { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.8); padding: 2px 6px; border-radius: 4px; font-size: 0.45rem; color: #fff; border: 1px solid rgba(255,255,255,0.1); font-weight: bold; letter-spacing: 1px; }
        .status-badge-overlay.found { color: var(--gold-solid); border-color: var(--gold-solid); }
        
        .asset-title-terminal { color: #fff; font-size: 0.75rem; font-weight: 800; margin-bottom: 2px; }
        .intel-row { display: flex; align-items: center; gap: 5px; color: #555; font-size: 0.5rem; }

        .btn-dark-outline-small { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #888; font-size: 0.55rem; font-weight: 800; padding: 6px; border-radius: 6px; transition: 0.3s; letter-spacing: 1px; }
        .btn-dark-outline-small:hover { border-color: #fff; color: #fff; }

        .dossier-img-frame { height: 250px; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.2); background: #000; overflow: hidden; }
        .terminal-input-v2 { background: #0a0a0a !important; border: 1px solid rgba(255,255,255,0.08) !important; color: white !important; font-size: 0.7rem !important; padding: 10px !important; border-radius: 8px !important; transition: 0.3s; }
        .terminal-input-v2:focus { border-color: var(--gold-solid) !important; box-shadow: 0 0 10px rgba(212,175,55,0.1) !important; }

        .btn-close-cyber { background: transparent; border: none; color: #444; transition: 0.3s; }
        .btn-close-cyber:hover { color: #fff; transform: rotate(90deg); }
        .extra-small { font-size: 0.5rem; letter-spacing: 1px; text-transform: uppercase; }
        .shadow-inner { box-shadow: inset 0 0 15px rgba(0,0,0,0.8); }
        .modal-body-scroll::-webkit-scrollbar { display: none; }

        @media (min-width: 768px) {
          .card-img-frame { height: 160px; }
          .asset-title-terminal { font-size: 0.9rem; }
          .dossier-img-frame { height: 350px; }
        }
      `}</style>
    </motion.div>
  );
};

export default Showcase;
