// src/components/SidebarLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase-config';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; 
import { 
  LayoutDashboard, Globe, Scan, Boxes, AlertTriangle, 
  User, LogOut, Menu, X, ShieldCheck, ChevronLeft, ChevronRight,
  SearchCode, Bell 
} from 'lucide-react';
import Footer from './Footer'; 

const SidebarLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [signalCount, setSignalCount] = useState(0); 
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  // --- ⚡ REAL-TIME NOTIFICATION COUNTER (SMART RED DOT) ⚡ ---
  useEffect(() => {
    if (!user) return;
    
    // ✅ UPDATE: Sirf wahi signals gino jo is user ke hain aur "unread" hain
    const q = query(
      collection(db, "notifications"), 
      where("ownerId", "==", user.uid),
      where("status", "==", "unread") 
    );

    const unsub = onSnapshot(q, (snap) => {
      setSignalCount(snap.size); 
    });

    return () => unsub();
  }, [user]);

  // Navigation Links Data
  const navItems = [
    { path: '/dashboard', name: 'COMMAND CENTER', icon: <LayoutDashboard size={20} /> },
    { path: '/showcase', name: 'GLOBAL INTEL', icon: <Globe size={20} /> },
    { path: '/generate-qr', name: 'MINT SECURE TAG', icon: <Scan size={20} /> },
    { path: '/my-tags', name: 'ASSET INVENTORY', icon: <Boxes size={20} /> },
    { path: '/report-lost', name: 'REPORT BREACH', icon: <AlertTriangle size={20} /> },
    { path: '/found-report/manual', name: 'FOUND AN ASSET', icon: <SearchCode size={20} /> },
    
    // ✅ SIGNALS LINK WITH DYNAMIC RED DOT
    { 
      path: '/notifications', 
      name: 'SIGNALS', 
      icon: (
        <div className="position-relative">
          <Bell size={20} />
          {signalCount > 0 && (
            <span 
              className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" 
              style={{ boxShadow: '0 0 10px #ef4444', marginTop: '-2px', marginLeft: '-2px' }}
            ></span>
          )}
        </div>
      ) 
    },

    { path: '/profile', name: 'VAULT IDENTITY', icon: <User size={20} /> },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); 
  };

  const handleDisconnect = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  // --- REUSABLE NAV CONTENT WITH SCROLLING ---
  const NavContent = ({ isCollapsed = false }) => (
    <div className="d-flex flex-column h-100 w-100 pb-3">
      
      <div 
        className={`flex-grow-1 d-flex flex-column gap-2 overflow-y-auto custom-sidebar-scroll ${isCollapsed ? 'px-2 align-items-center' : ''}`}
        style={{ maxHeight: 'calc(100vh - 250px)' }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              title={isCollapsed ? item.name : ''}
              className={`btn d-flex align-items-center transition-smooth border-0 ${isCollapsed ? 'justify-content-center p-2 rounded-circle' : 'text-start gap-3 px-3 py-3 w-100'}`}
              style={{
                background: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                color: isActive ? 'var(--gold-solid)' : 'var(--text-muted)',
                borderRight: isActive && !isCollapsed ? '2px solid var(--gold-solid)' : '2px solid transparent',
                borderRadius: isCollapsed ? '12px' : '4px',
                width: isCollapsed ? '45px' : '100%',
                height: isCollapsed ? '45px' : 'auto',
                flexShrink: 0 
              }}
              onMouseOver={(e) => {
                if(!isActive) {
                  e.currentTarget.style.color = 'var(--text-pure)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }
              }}
              onMouseOut={(e) => {
                if(!isActive) {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <span className="subtext-tracking text-nowrap overflow-hidden" style={{ fontSize: '0.75rem', letterSpacing: '1.5px' }}>{item.name}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className={`mt-auto pt-4 border-top d-flex flex-column gap-3 ${isCollapsed ? 'align-items-center' : 'px-3'}`} style={{ borderColor: 'var(--border-white-thin) !important' }}>
        <div className={`d-flex align-items-center w-100 ${isCollapsed ? 'justify-content-center' : 'gap-3'}`}>
          <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '38px', height: '38px', border: '1px solid var(--gold-solid)', background: '#000' }}>
             {user?.photoURL ? (
               <img src={user.photoURL} alt="User" className="w-100 h-100 object-fit-cover" />
             ) : (
               <span className="heading-tracking text-luxury-gold m-0" style={{ fontSize: '1rem' }}>
                 {user?.email?.charAt(0).toUpperCase()}
               </span>
             )}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden flex-grow-1">
              <div className="heading-tracking text-white text-truncate m-0" style={{ fontSize: '0.75rem' }}>{user?.displayName || 'OPERATIVE'}</div>
              <div className="subtext-tracking text-muted text-truncate m-0" style={{ fontSize: '0.6rem', textTransform: 'none' }}>{user?.email}</div>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleDisconnect}
          title={isCollapsed ? 'System Disconnect' : ''}
          className="btn-dark-outline d-flex align-items-center justify-content-center gap-2 transition-smooth"
          style={{ 
            fontSize: '0.7rem', color: '#ef4444 !important', borderColor: 'rgba(239, 68, 68, 0.2) !important',
            width: isCollapsed ? '45px' : '100%', height: isCollapsed ? '45px' : 'auto',
            padding: isCollapsed ? '0' : '10px 15px', borderRadius: isCollapsed ? '12px' : '6px'
          }}
        >
          <LogOut size={16} className="flex-shrink-0" /> 
          {!isCollapsed && <span className="text-nowrap">SYSTEM DISCONNECT</span>}
        </button>
      </div>

      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .custom-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 10px; }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: var(--gold-solid); }
      `}</style>
    </div>
  );

  return (
    <div className="d-flex w-100 overflow-hidden" style={{ height: '100vh', background: '#050505' }}>
      
      {/* DESKTOP SIDEBAR */}
      <motion.div 
        initial={false}
        animate={{ width: isDesktopCollapsed ? 90 : 280 }}
        transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
        className="d-none d-lg-flex flex-column h-100 py-4 border-end position-relative" 
        style={{ background: '#050505', borderColor: 'var(--border-white-thin) !important', zIndex: 100 }}
      >
        <button 
          onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
          className="btn p-0 d-flex align-items-center justify-content-center transition-smooth position-absolute shadow-lg"
          style={{ 
            background: '#0a0a0a', border: '1px solid var(--border-white-thin)', borderRadius: '50%',
            width: '28px', height: '28px', color: 'var(--text-muted)',
            right: '-14px', top: '50%', transform: 'translateY(-50%)', zIndex: 105
          }}
        >
          {isDesktopCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`d-flex align-items-center ${isDesktopCollapsed ? 'justify-content-center' : 'px-3'} mb-5`}>
          <div className="d-flex align-items-center gap-2 cursor-pointer overflow-hidden" onClick={() => navigate('/dashboard')}>
            <ShieldCheck size={32} color="var(--gold-solid)" strokeWidth={1.5} className="flex-shrink-0" />
            <AnimatePresence>
              {!isDesktopCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="m-0 text-white heading-tracking text-nowrap" style={{ fontSize: '1.4rem' }}>
                  FOUND<span className="text-luxury-gold" style={{ fontWeight: 800 }}>IT</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        <NavContent isCollapsed={isDesktopCollapsed} />
      </motion.div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow-1 d-flex flex-column h-100 overflow-hidden position-relative">
        <div className="d-flex d-lg-none align-items-center justify-content-between p-3 border-bottom w-100" style={{ background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(10px)', borderColor: 'var(--border-white-thin) !important', zIndex: 50 }}>
          <div className="d-flex align-items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <ShieldCheck size={26} color="var(--gold-solid)" strokeWidth={1.5} />
            <span className="m-0 text-white heading-tracking" style={{ fontSize: '1.2rem' }}>FOUND<span className="text-luxury-gold">IT</span></span>
          </div>
          
          <div className="d-flex align-items-center gap-3">
             {signalCount > 0 && (
               <div onClick={() => navigate('/notifications')} className="position-relative cursor-pointer">
                  <Bell size={22} color="var(--gold-solid)" />
                  <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger rounded-circle"></span>
               </div>
             )}
             <button className="btn p-1 text-white shadow-none" onClick={() => setIsMobileMenuOpen(true)}>
               <Menu size={28} color="var(--gold-solid)" />
             </button>
          </div>
        </div>

        <div className="flex-grow-1 overflow-auto w-100 position-relative custom-scrollbar d-flex flex-column" id="main-scroll-area">
          <div className="flex-grow-1">
             <Outlet />
          </div>
          <Footer />
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div className="position-fixed top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.8)', zIndex: 1040, backdropFilter: 'blur(5px)' }} onClick={() => setIsMobileMenuOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div className="position-fixed bottom-0 start-0 w-100 p-4 d-flex flex-column" style={{ background: '#0a0a0a', borderTop: '2px solid var(--gold-solid)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', zIndex: 1050, maxHeight: '85vh' }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border-white-thin) !important' }}>
                <span className="heading-tracking text-white m-0 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>SYSTEM NAVIGATION</span>
                <button className="btn p-1 text-muted" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
              </div>
              <div className="flex-grow-1 overflow-auto no-scrollbar pb-2">
                 <NavContent isCollapsed={false} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SidebarLayout;