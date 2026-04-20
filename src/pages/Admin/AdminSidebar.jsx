// src/pages/Admin/AdminSidebar.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, LogOut, 
  Menu, X, ShieldCheck, Zap, Globe, ChevronLeft, ChevronRight, Calendar, ShieldAlert, CreditCard, Radio, Coins 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';

const AdminSidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); 
  const [showExitModal, setShowExitModal] = useState(false);
  const [dateTime, setDateTime] = useState({
    time: new Date().toLocaleTimeString('en-IN', { hour12: true }),
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    day: new Date().toLocaleDateString('en-IN', { weekday: 'long' }).toUpperCase()
  });

  // Real-time Clock, Date and Day (Indian Format - IST)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setDateTime({
        time: now.toLocaleTimeString('en-IN', { hour12: true }),
        date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        day: now.toLocaleDateString('en-IN', { weekday: 'long' }).toUpperCase()
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Updated menuItems with Referral Terminal Integration
  const menuItems = [
    { id: 'overview', label: 'SYSTEM OVERVIEW', icon: <LayoutDashboard size={18} /> },
    { id: 'users', label: 'OPERATIVE DATABASE', icon: <Users size={18} /> },
    { id: 'breaches', label: 'BREACH PROTOCOL', icon: <ShieldAlert size={18} /> },
    { id: 'transactions', label: 'TRANSACTION TERMINAL', icon: <CreditCard size={18} /> },
    { id: 'referral_terminal', label: 'REFERRAL TERMINAL', icon: <Coins size={18} /> }, // ✅ Naya Tab Add Kiya
    { id: 'broadcast', label: 'BROADCAST HUB', icon: <Radio size={18} /> },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setIsOpen(false); 
  };

  return (
    <>
      {/* --- MOBILE TOP BAR --- */}
      <div className="d-lg-none w-100 p-3 d-flex justify-content-between align-items-center position-fixed top-0 start-0 shadow-lg" 
           style={{ background: 'rgba(5, 5, 5, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--gold-solid)', zIndex: 1100 }}>
        <div className="d-flex align-items-center gap-2">
          <Zap size={18} color="var(--gold-solid)" />
          <span className="heading-tracking text-white" style={{fontSize: '0.8rem', fontWeight: 700}}>AEGIS <span className="text-luxury-gold">CMD</span></span>
        </div>
        <button className="btn p-0 text-white shadow-none" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MOBILE BOTTOM DRAWER MENU --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="position-fixed top-0 start-0 w-100 h-100 d-lg-none"
              style={{ background: 'rgba(0,0,0,0.7)', zIndex: 1050, backdropFilter: 'blur(4px)' }}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="position-fixed bottom-0 start-0 w-100 p-4 d-lg-none"
              style={{ background: '#050505', borderTop: '2px solid var(--gold-solid)', borderTopLeftRadius: '25px', borderTopRightRadius: '25px', zIndex: 1060 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="heading-tracking text-white" style={{fontSize: '0.9rem'}}>COMMAND MENU</span>
                <X size={20} className="text-muted" onClick={() => setIsOpen(false)} />
              </div>
              <div className="d-flex flex-column gap-2 mb-4">
                {menuItems.map((item) => (
                  <div key={item.id} onClick={() => handleNavClick(item.id)} 
                       className={`nav-item-admin ${activeTab === item.id ? 'active' : ''}`}>
                    <div className="icon-box">{item.icon}</div>
                    <span className="label heading-tracking">{item.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowExitModal(true)} className="btn-exit-terminal w-100 py-3 d-flex align-items-center justify-content-center gap-2">
                <LogOut size={16} /> TERMINATE CONSOLE
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- DESKTOP SIDEBAR --- */}
      <div className={`admin-sidebar-wrapper d-none d-lg-flex ${isCollapsed ? 'collapsed' : ''}`} style={{ 
        width: isCollapsed ? '80px' : '280px', height: '100vh', background: '#050505', 
        borderRight: '1px solid var(--gold-solid)', position: 'fixed',
        left: 0, top: 0, zIndex: 1050, flexDirection: 'column',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        
        {/* Sidebar Header */}
        <div className="p-4 mb-2 position-relative">
          <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-white-thin overflow-hidden">
            <div className="p-2 rounded bg-gold-faded border-gold flex-shrink-0">
               <ShieldCheck size={22} color="var(--gold-solid)" />
            </div>
            {!isCollapsed && <h5 className="heading-tracking text-white m-0" style={{fontSize: '0.8rem'}}>FOUNDIT <span className="text-luxury-gold">OS</span></h5>}
          </div>

          <button onClick={() => setIsCollapsed(!isCollapsed)} className="collapse-btn">
             {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-grow-1 px-3 d-flex flex-column gap-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <div key={item.id} onClick={() => handleNavClick(item.id)} 
                 className={`nav-item-admin ${activeTab === item.id ? 'active' : ''}`}>
              <div className="icon-box">{item.icon}</div>
              {!isCollapsed && <span className="label heading-tracking">{item.label}</span>}
            </div>
          ))}
        </div>

        {/* Bottom Section: Time & Terminate (Logout at bottom) */}
        <div className="p-3 bg-black-depth mt-auto border-top border-white-thin">
           <div className={`d-flex flex-column ${isCollapsed ? 'align-items-center' : 'align-items-start'} mb-3 px-2`}>
             <div className="d-flex align-items-center gap-2 mb-1">
               <Globe size={12} color={isCollapsed ? "var(--gold-solid)" : "#10b981"} />
               {!isCollapsed && <span className="text-white opacity-70" style={{fontSize: '0.6rem', fontWeight: 700}}>{dateTime.day}</span>}
             </div>
             {!isCollapsed && <span className="subtext-tracking text-muted" style={{fontSize: '0.55rem', letterSpacing: '1px'}}>{dateTime.date}</span>}
             <span className="subtext-tracking text-luxury-gold fw-bold mt-1" style={{fontSize: isCollapsed ? '0.5rem' : '0.7rem'}}>{dateTime.time}</span>
           </div>

           <button 
             onClick={() => setShowExitModal(true)} 
             className={`btn-exit-terminal w-100 py-3 d-flex align-items-center justify-content-center gap-2 transition-smooth ${isCollapsed ? 'collapsed-exit' : ''}`}
             title={isCollapsed ? "Terminate Session" : ""}
           >
            <LogOut size={16} /> {!isCollapsed && <span>TERMINATE</span>}
           </button>
        </div>
      </div>

      <Modal show={showExitModal} onHide={() => setShowExitModal(false)} centered contentClassName="bg-transparent border-0 shadow-none">
        <div className="card-premium-dark p-4 text-center border-gold">
          <h5 className="heading-tracking text-white mb-3">EXIT TERMINAL?</h5>
          <div className="d-flex gap-2">
            <button className="btn-dark-outline flex-fill py-2" onClick={() => setShowExitModal(false)}>STAY</button>
            <button className="btn-gold-solid flex-fill py-2" onClick={() => navigate('/profile')}>EXIT</button>
          </div>
        </div>
      </Modal>

      <style>{`
        .collapse-btn {
          position: absolute;
          right: -12px;
          top: 35px;
          background: var(--gold-solid);
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: black;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
          z-index: 10;
        }

        .nav-item-admin {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px 18px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          position: relative;
          margin-bottom: 4px;
        }

        .nav-item-admin.active {
          background: linear-gradient(90deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
          border-color: rgba(212, 175, 55, 0.2);
          color: var(--gold-solid) !important;
        }

        .nav-item-admin.active .icon-box { color: var(--gold-solid); }

        .nav-item-admin .label {
          font-size: 0.7rem;
          letter-spacing: 1.5px;
          color: #888;
        }

        .btn-exit-terminal {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          border-radius: 8px;
          transition: 0.3s;
        }

        .btn-exit-terminal:hover {
          background: #ef4444;
          color: white;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
        }

        .collapsed-exit {
          padding: 0 !important;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-gold-faded { background: rgba(212, 175, 55, 0.05); }
        .border-gold { border: 1px solid rgba(212, 175, 55, 0.3); }

        .admin-sidebar-wrapper.collapsed .nav-item-admin {
          justify-content: center;
          padding: 14px 0;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--gold-solid);
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;