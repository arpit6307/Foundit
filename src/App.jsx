// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import { 
  QrCode, ShieldCheck, Zap, Globe, Lock, Activity, Menu, X,
  Layers, Fingerprint, ArrowRight, Cpu, Scan, Search, 
  Bell, Database, ShieldAlert, Smartphone, EyeOff, Radio,
  Server, MessageSquare, MapPin, Share2, Award, Download, 
  Target, ZapOff, Users, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext'; 
import { ConfirmProvider } from './context/ConfirmContext';

// Pages Import
import Auth from './pages/Auth'; 
import Dashboard from './pages/Dashboard';
import ReportItem from './pages/ReportItem';
import GenerateQR from './pages/GenerateQR';
import FoundReport from './pages/FoundReport';
import Showcase from './pages/Showcase';
import Profile from './pages/Profile';
import MyTags from './pages/MyTags';
import Notifications from './pages/Notifications';
import ReferEarn from './pages/ReferEarn';
import ReferralTransactions from './pages/Admin/ReferralTransactions';

// Admin Dashboard Import
import AdminDashboard from './pages/Admin/AdminDashboard'; 

// Components & Layout Import
import SidebarLayout from './components/SidebarLayout';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor'; 
import ScrollToTopButton from './components/ScrollToTopButton'; 

// --- Utility: Scroll To Top (Logic) ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

// ✅ Global Referral Code Tracker
const ReferralTracker = () => {
  const location = useLocation();
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const referralCode = params.get('ref'); 
      if (referralCode) {
        localStorage.setItem('pendingReferralCode', referralCode);
        console.log("SECURE PROTOCOL: Referral Code locked in vault.");
      }
    } catch (err) {
      console.error("VAULT ERROR: Referral tracking failed", err);
    }
  }, [location]);
  return null;
};

// --- ProtectedRoute Component ---
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="dashboard-root d-flex flex-column justify-content-center align-items-center vh-100">
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        <Lock size={50} color="var(--gold-solid)" strokeWidth={1} />
      </motion.div>
      <p className="mt-4 heading-tracking text-luxury-gold" style={{ fontSize: '0.8rem' }}>ACCESSING SECURE VAULT...</p>
    </div>
  );
  if (!user) return <Navigate to="/auth" />;
  return children;
};

// --- Landing Page (Updated with Deep Details & APK Support) ---
const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.8, 0.25, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="dashboard-root text-white overflow-x-hidden">
      {/* Navbar */}
      <Navbar expand="lg" sticky="top" className="py-3 shadow-sm" style={{ background: 'rgba(5, 5, 5, 0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border-white-thin)', zIndex: 1050 }}>
        <Container>
          <Navbar.Brand onClick={() => navigate('/')} className="cursor-pointer d-flex align-items-center gap-2">
            <Scan size={24} color="var(--gold-solid)" strokeWidth={1.5} />
            <span className="m-0 text-white heading-tracking" style={{ fontSize: '1.4rem', fontWeight: 300 }}>
              FOUND<span className="text-luxury-gold" style={{ fontWeight: 800 }}>IT</span>
            </span>
          </Navbar.Brand>
          <div className="d-lg-none" onClick={() => setExpanded(true)}>
             <Menu size={28} className="text-white cursor-pointer" strokeWidth={1.5} />
          </div>
          <Navbar.Collapse id="premium-nav" className="d-none d-lg-block">
            <Nav className="ms-auto align-items-center gap-lg-4">
              <Nav.Link onClick={() => navigate('/showcase')} className="subtext-tracking text-white hover-gold transition-smooth" style={{ fontSize: '0.75rem' }}>LIVE FEED</Nav.Link>
              <Nav.Link href="#features" className="subtext-tracking text-white hover-gold transition-smooth" style={{ fontSize: '0.75rem' }}>ECOSYSTEM</Nav.Link>
              <Nav.Link href="#referral" className="subtext-tracking text-white hover-gold transition-smooth" style={{ fontSize: '0.75rem' }}>EARN REWARDS</Nav.Link>
              {user ? (
                <button className="btn-gold-solid ms-lg-3 py-2 px-4 d-flex align-items-center gap-2" style={{ fontSize: '0.75rem' }} onClick={() => navigate('/dashboard')}>
                  COMMAND CENTER <ArrowRight size={14} />
                </button>
              ) : (
                <div className="d-flex align-items-center gap-3 ms-lg-3">
                  <Nav.Link onClick={() => navigate('/auth')} className="subtext-tracking text-white hover-gold transition-smooth" style={{ fontSize: '0.75rem' }}>LOGIN</Nav.Link>
                  <button className="btn-gold-solid py-2 px-4 d-flex align-items-center gap-2" style={{ fontSize: '0.75rem' }} onClick={() => navigate('/auth')}>GET STARTED</button>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <AnimatePresence>
        {expanded && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setExpanded(false)} className="position-fixed top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000 }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="position-fixed bottom-0 start-0 w-100 p-4" style={{ background: '#050505', borderTop: '1px solid var(--gold-solid)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', zIndex: 2001 }}>
              <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom" style={{ borderColor: 'var(--border-white-thin) !important' }}>
                <span className="heading-tracking text-white" style={{ fontSize: '1rem' }}>SYSTEM NAVIGATION</span>
                <button className="btn p-1 text-muted" onClick={() => setExpanded(false)}><X size={24} /></button>
              </div>
              <div className="d-flex flex-column gap-3">
                <button className="btn-dark-outline py-3 text-start px-4 d-flex align-items-center gap-3" onClick={() => {navigate('/showcase'); setExpanded(false)}}>
                  <Globe size={18} color="var(--gold-solid)" /> LIVE SHOWCASE
                </button>
                {user ? (
                  <button className="btn-gold-solid py-3 d-flex justify-content-center align-items-center gap-2" onClick={() => navigate('/dashboard')}>
                    OPEN DASHBOARD <ArrowRight size={16} />
                  </button>
                ) : (
                  <button className="btn-gold-solid py-3" onClick={() => navigate('/auth')}>INITIALIZE ACCOUNT</button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="hero-section position-relative py-5 py-lg-0 d-flex align-items-center" style={{ minHeight: '90vh' }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={7} className="text-center text-lg-start mb-5 mb-lg-0 pe-lg-5">
              <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                <motion.div variants={fadeInUp} className="mb-4">
                  <span className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded" style={{ border: '1px solid var(--border-white-thin)', background: 'rgba(212, 175, 55, 0.05)' }}>
                    <ShieldCheck size={14} color="var(--gold-solid)" />
                    <span className="subtext-tracking" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>MILITARY-GRADE ASSET PROTECTION</span>
                  </span>
                </motion.div>
                <motion.h1 variants={fadeInUp} className="heading-tracking text-white mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 200, lineHeight: '1.1' }}>
                  LOST IT? <br className="d-none d-lg-block" />
                  <span className="text-luxury-gold" style={{ fontWeight: 800 }}>FOUND IT.</span>
                </motion.h1>
                <motion.p variants={fadeInUp} className="subtext-tracking text-muted mb-5" style={{ maxWidth: '600px', lineHeight: '1.8', textTransform: 'none', fontSize: '0.9rem' }}>
                  Secure your physical valuables with an encrypted digital identity. Our platform ensures that your personal data remains locked in the vault while keeping you reachable for recovery.
                </motion.p>
                <motion.div variants={fadeInUp} className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                  <button className="btn-gold-solid px-5 py-3 d-flex align-items-center justify-content-center gap-2" onClick={() => navigate('/dashboard')}>
                    LAUNCH VAULT <ArrowRight size={16} />
                  </button>
                  {/* ✅ APK Download Button */}
                  <a 
                    href="/apk/foundit.apk" 
                    download="FoundIt_v1.apk"
                    className="btn-dark-outline px-5 py-3 d-flex align-items-center justify-content-center gap-2"
                    style={{ textDecoration: 'none' }}
                  >
                    <Smartphone size={18} color="var(--gold-solid)" /> DOWNLOAD APP
                  </a>
                </motion.div>
              </motion.div>
            </Col>
            <Col lg={5}>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <div className="card-premium-dark p-4 mx-auto" style={{ maxWidth: '400px', transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)', boxShadow: '-20px 20px 50px rgba(0,0,0,0.8)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border-white-thin) !important' }}>
                    <span className="subtext-tracking text-muted" style={{ fontSize: '0.65rem' }}>SECURE MATRIX</span>
                    <div className="animate-pulse" style={{ width: '8px', height: '8px', background: 'var(--gold-solid)', borderRadius: '50%', boxShadow: '0 0 10px var(--gold-solid)' }}></div>
                  </div>
                  <div className="p-4 d-flex flex-column align-items-center justify-content-center rounded mb-4" style={{ background: '#000', border: '1px solid var(--border-white-thin)' }}>
                    <QrCode size={180} color="var(--gold-solid)" strokeWidth={1} />
                    <p className="heading-tracking mt-4 mb-0" style={{ color: 'var(--gold-solid)', fontSize: '0.8rem' }}>ENCRYPTED VAULT ID</p>
                  </div>
                  <div className="d-flex align-items-center gap-3 pt-2">
                     <div className="p-2 rounded" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--gold-solid)' }}>
                       <Fingerprint size={20} color="var(--gold-solid)" />
                     </div>
                     <div>
                       <div className="heading-tracking text-white mb-1" style={{ fontSize: '0.75rem' }}>OWNERSHIP LINK</div>
                       <div className="subtext-tracking" style={{ color: '#10b981', fontSize: '0.65rem' }}>IDENTITY PROTECTED</div>
                     </div>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ✅ NEW: Features & Detailed Module Info */}
      <section id="features" className="py-5" style={{ background: '#020202', borderTop: '1px solid var(--border-white-thin)' }}>
        <Container className="py-5">
          <div className="text-center mb-5 pb-4">
            <h6 className="subtext-tracking mb-3 text-luxury-gold">THE CORE ENGINE</h6>
            <h2 className="heading-tracking text-white mb-4" style={{ fontSize: '2.5rem' }}>ADVANCED <span style={{ fontWeight: 800 }}>MODULES</span></h2>
            <p className="subtext-tracking text-muted mx-auto" style={{ maxWidth: '700px', textTransform: 'none' }}>FoundIt runs on a multi-layered security protocol designed for seamless recovery.</p>
          </div>
          <Row className="g-4">
            {[
              { 
                icon: <Scan />, 
                title: "ENCRYPTED MINTING", 
                detail: "Apne physical items ke liye unique QR Codes 'Mint' karein. Har code ek encrypted bridge hai jo owner aur finder ko bina privacy leak kiye connect karta hai.", 
                path: "/generate-qr" 
              },
              { 
                icon: <Activity />, 
                title: "RADAR TRACKING", 
                detail: "Dashboard par 'Active Radar' feature se aap apne reported items ka status real-time monitor kar sakte hain. Jab bhi koi scan hoga, aapko instant alert milega.", 
                path: "/dashboard" 
              },
              { 
                icon: <Radio />, 
                title: "SIGNAL HANDSHAKE", 
                detail: "Jab finder aapka item scan karta hai, vo ek 'Signal' bhejta hai. Aap secure tarike se finder ke saath handover coordinate kar sakte hain.", 
                path: "/notifications" 
              },
              { 
                icon: <Globe />, 
                title: "GLOBAL INTEL FEED", 
                detail: "Showcase module mein lost items ki details public hoti hain (bina identity disclose kiye) taaki community-driven recovery fast ho sake.", 
                path: "/showcase" 
              },
              { 
                icon: <ShieldAlert />, 
                title: "BREACH PROTOCOL", 
                detail: "Agar item lost ho jaye, toh Report module se breach alert activate karein. Isse recovery network automatic alert ho jayega.", 
                path: "/report-lost" 
              },
              { 
                icon: <Server />, 
                title: "COMMAND CENTER", 
                detail: "Ek centralized Dashboard jahan se aap apne saare tags, personal info, aur coins ko high-security environment mein manage kar sakte hain.", 
                path: "/dashboard" 
              }
            ].map((f, i) => (
              <Col lg={4} md={6} key={i}>
                <motion.div whileHover={{ y: -10 }} className="card-premium-dark h-100 p-4 border-white-thin">
                  <div className="mb-4 d-inline-flex p-3 rounded" style={{ background: 'rgba(212, 175, 55, 0.05)', color: 'var(--gold-solid)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                    {f.icon}
                  </div>
                  <h4 className="heading-tracking text-white mb-3" style={{ fontSize: '1rem' }}>{f.title}</h4>
                  <p className="subtext-tracking text-muted mb-4" style={{ textTransform: 'none', lineHeight: '1.6', fontSize: '0.8rem' }}>{f.detail}</p>
                  <button onClick={() => navigate(f.path)} className="btn p-0 text-luxury-gold subtext-tracking d-flex align-items-center gap-2" style={{ fontSize: '0.7rem' }}>
                    EXPLORE MODULE <ArrowRight size={14} />
                  </button>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ✅ NEW: Referral & Earn System Section */}
      <section id="referral" className="py-5" style={{ background: '#050505', borderTop: '1px solid var(--border-white-thin)' }}>
        <Container className="py-5">
          <Row className="align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
               <div className="p-3 d-inline-flex rounded mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981' }}>
                 <Coins size={24} className="text-success" />
               </div>
               <h2 className="heading-tracking text-white mb-4" style={{ fontSize: '2.5rem' }}>EXPAND THE <br/><span className="text-luxury-gold" style={{ fontWeight: 800 }}>SECURITY NETWORK</span></h2>
               <p className="subtext-tracking text-muted mb-5" style={{ textTransform: 'none' }}>
                 FoundIt ko apne doston ke saath share karein aur har successful signup par **100 Cyber Coins (CC)** earn karein. In coins ko aap real cash mein withdraw kar sakte hain.
               </p>
               <div className="d-flex flex-column gap-3">
                  {[
                    { title: "Share Code", desc: "Apna unique 6-digit referral code doston ko bhein.", icon: <Share2 /> },
                    { title: "Earn CC", desc: "Har naye operative ke join hone par 100 CC aapke vault mein.", icon: <Award /> },
                    { title: "Instant Payout", desc: "Coins ko UPI ke zariye seedha bank account mein withdraw karein.", icon: <Zap /> }
                  ].map((item, index) => (
                    <div className="d-flex align-items-center gap-3" key={index}>
                       <div className="text-luxury-gold">{item.icon}</div>
                       <div>
                         <h6 className="m-0 text-white heading-tracking" style={{ fontSize: '0.8rem' }}>{item.title}</h6>
                         <p className="m-0 text-muted extra-small">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Col>
            <Col lg={6} className="ps-lg-5">
               <div className="card-premium-dark p-5 text-center border-gold-glow">
                  <h3 className="heading-tracking text-white mb-4">REWARD PROTOCOL</h3>
                  <div className="p-4 bg-black rounded border-dashed mb-4">
                    <h1 className="text-luxury-gold heading-tracking m-0" style={{ fontSize: '3rem' }}>100 <small style={{fontSize: '1rem'}}>CC</small></h1>
                    <p className="text-muted small mt-2">PER SUCCESSFUL REFERRAL</p>
                  </div>
                  <button className="btn-gold-solid w-100 py-3" onClick={() => navigate('/refer-earn')}>START EARNING NOW</button>
               </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

// --- App Root Configuration ---
const App = () => {
  return (
    <ConfirmProvider>
      <Router>
        {/* Anti-Crash Global Tracking (Captures 6-char referral codes) */}
        <ReferralTracker />

        <ScrollToTop />
        <CustomCursor />
        <ScrollToTopButton /> 
        <AnimatePresence mode="wait">
          <Routes>
            {/* Landing & Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<div className="dashboard-root"><Auth /><Footer /></div>} />
            
            {/* ADMIN ROUTE */}
            <Route path="/admin-vault-access-main" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

            {/* Main Application Routes with Sidebar */}
            <Route element={<ProtectedRoute><SidebarLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/showcase" element={<Showcase />} />
              <Route path="/report-lost" element={<ReportItem />} />
              <Route path="/generate-qr" element={<GenerateQR />} />
              <Route path="/my-tags" element={<MyTags />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/refer-earn" element={<ReferEarn />} /> 
              <Route path="/admin/referral-terminal" element={<ReferralTransactions />} />
              <Route path="/found-report/:qrId" element={<FoundReport />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </ConfirmProvider>
  );
};

export default App;
