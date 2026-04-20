// src/pages/Admin/SystemOverview.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Badge, Modal } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, ShieldCheck, AlertTriangle, Database, 
  Zap, ChevronDown, UserX, UserCheck, Activity, MapPin, RefreshCcw, Search, User, X, Fingerprint
} from 'lucide-react';

const SystemOverview = ({ stats, users, breaches, selectedUserEmail, setSelectedUserEmail, isDropdownOpen, setIsDropdownOpen, openConfirmation }) => {
  const [dropdownSearch, setDropdownSearch] = useState('');

  // Filter users for selection search
  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(dropdownSearch.toLowerCase()));

  return (
    <Container fluid className="p-0">
      {/* --- PREMIUM STATS GRID (EXACTLY SAME AS YOUR OLD CODE) --- */}
      <Row className="g-4 mb-5">
        {[
          { label: 'TOTAL REVENUE', val: `₹${stats.totalRevenue}`, icon: <TrendingUp size={24}/>, color: '#D4AF37', desc: 'Net Protocol Earnings' },
          { label: 'ELITE OPERATIVES', val: stats.premiumUsers, icon: <ShieldCheck size={24}/>, color: '#3b82f6', desc: 'Active Silver+ Plans' },
          { label: 'ACTIVE BREACHES', val: stats.activeBreaches, icon: <AlertTriangle size={24}/>, color: '#ef4444', desc: 'Reported Lost Assets' },
          { label: 'SECURED ASSETS', val: stats.totalAssets, icon: <Database size={24}/>, color: '#10b981', desc: 'Total Minted Tags' }
        ].map((stat, i) => (
          <Col xl={3} md={6} key={i}>
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="card-stats-premium"
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="stats-icon-box" style={{ color: stat.color, background: `${stat.color}15` }}>
                  {stat.icon}
                </div>
                <Badge className="stats-trend-badge">LIVE</Badge>
              </div>
              <div className="stats-data">
                 <span className="label heading-tracking">{stat.label}</span>
                 <h2 className="value my-1" style={{ color: stat.color }}>{stat.val}</h2>
                 <p className="subtext-tracking m-0 opacity-50" style={{fontSize: '0.55rem'}}>{stat.desc}</p>
              </div>
              <div className="stats-glow-line" style={{ background: stat.color }}></div>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* --- IDENTITY OVERRIDE PROTOCOL (REDESIGNED SECTION) --- */}
        <Col lg={7}>
          <div className="card-premium-dark h-100 border-gold-glow p-4 position-relative overflow-hidden">
            <div className="d-flex align-items-center gap-2 mb-4 border-bottom border-white-thin pb-3">
               <div className="pulse-orange mr-2"></div>
               <h6 className="heading-tracking m-0 text-white">IDENTITY OVERRIDE PROTOCOL</h6>
            </div>
            
            <div className="mb-4">
               <label className="subtext-tracking text-muted small mb-2 d-block">TARGET OPERATIVE AUTHENTICATION</label>
               
               {/* Clickable Selection Area (Triggers Popup) */}
               <div 
                 className={`aegis-selector-trigger`} 
                 onClick={() => setIsDropdownOpen(true)}
               >
                  <div className="d-flex align-items-center gap-3">
                    <Fingerprint size={20} className={selectedUserEmail ? "text-luxury-gold" : "text-muted"} />
                    <span className={selectedUserEmail ? "text-white" : "text-muted opacity-50"}>
                      {selectedUserEmail || 'INITIALIZE TARGET SEARCH...'}
                    </span>
                  </div>
                  <div className="selector-arrow-box">
                    <ChevronDown size={16} className="text-luxury-gold" />
                  </div>
               </div>
            </div>

            <Row className="g-3">
              <Col xs={12} sm={6}>
                 <button 
                   onClick={() => openConfirmation('disable')} 
                   disabled={!selectedUserEmail} 
                   className="btn-gold-solid-danger w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                 >
                   <UserX size={18} /> <span>TERMINATE ID</span>
                 </button>
              </Col>
              <Col xs={12} sm={6}>
                 <button 
                   onClick={() => openConfirmation('enable')} 
                   disabled={!selectedUserEmail} 
                   className="btn-gold-solid-standard w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                 >
                   <UserCheck size={18} /> <span>RESTORE ID</span>
                 </button>
              </Col>
            </Row>
          </div>
        </Col>

        {/* --- LIVE FEED RADAR (SAME AS OLD CODE) --- */}
        <Col lg={5}>
          <div className="card-premium-dark h-100 border-white-thin overflow-hidden bg-terminal-grid">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-white-thin p-4">
               <div className="d-flex align-items-center gap-2">
                  <Activity size={18} className="text-luxury-gold animate-pulse" />
                  <h6 className="heading-tracking m-0">LIVE NETWORK RADAR</h6>
               </div>
               <Badge bg="dark" className="border-gold-thin text-luxury-gold">ENCRYPTED</Badge>
            </div>
            
            <div className="activity-feed custom-scrollbar px-4 pb-4">
              {breaches.length > 0 ? breaches.map(b => (
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  key={b.id} 
                  className="radar-item"
                >
                   <div className="radar-ping"></div>
                   <div className="feed-content">
                      <p className="m-0 text-white heading-tracking" style={{fontSize: '0.7rem'}}>{b.title?.toUpperCase()}</p>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <MapPin size={10} className="text-luxury-gold"/>
                        <span className="text-muted" style={{fontSize: '0.6rem'}}>{b.location}</span>
                      </div>
                   </div>
                   <div className="ms-auto text-end">
                      <span className="d-block text-danger mb-1" style={{fontSize: '0.5rem', fontWeight: 800}}>BREACH</span>
                      <span className="text-muted" style={{fontSize: '0.5rem'}}>{b.createdAt?.toDate().toLocaleTimeString()}</span>
                   </div>
                </motion.div>
              )) : (
                <div className="text-center py-5">
                  <RefreshCcw size={40} className="mb-3 animate-spin-slow text-luxury-gold opacity-20" />
                  <p className="subtext-tracking text-muted">SCANNING FREQUENCIES...</p>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* --- ADVANCE OPERATIVE SELECTION MODAL (POPUP) --- */}
      <Modal 
        show={isDropdownOpen} 
        onHide={() => setIsDropdownOpen(false)} 
        centered 
        contentClassName="bg-transparent border-0 shadow-none"
        backdrop="static"
      >
        <div className="operative-popup-card">
           <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-white-thin pb-3">
              <div className="d-flex align-items-center gap-2">
                <Search size={18} className="text-luxury-gold" />
                <span className="heading-tracking text-white" style={{fontSize: '0.9rem'}}>OPERATIVE SEARCH</span>
              </div>
              <button className="btn-close-terminal" onClick={() => setIsDropdownOpen(false)}><X size={20}/></button>
           </div>

           <div className="search-input-wrapper mb-3">
              <input 
                autoFocus
                placeholder="INPUT OPERATIVE EMAIL..." 
                value={dropdownSearch}
                onChange={(e) => setDropdownSearch(e.target.value)}
              />
           </div>

           <div className="operative-scroll-list custom-scrollbar">
              {filteredUsers.length > 0 ? filteredUsers.map(u => (
                <div 
                  key={u.id} 
                  className={`operative-item ${selectedUserEmail === u.email ? 'selected' : ''}`} 
                  onClick={() => { setSelectedUserEmail(u.email); setIsDropdownOpen(false); }}
                >
                   <div className="d-flex align-items-center gap-3">
                      <div className="avatar-mini">{u.fullName?.charAt(0)}</div>
                      <div className="d-flex flex-column">
                         <span className="email-text">{u.email}</span>
                         <span className="status-text-mini">
                            <span className={`dot ${u.accountStatus === 'suspended' ? 'red' : 'green'}`}></span>
                            {u.accountStatus?.toUpperCase() || 'OPERATIONAL'}
                         </span>
                      </div>
                   </div>
                   {selectedUserEmail === u.email && <ShieldCheck size={18} className="text-luxury-gold" />}
                </div>
              )) : (
                <div className="text-center py-4 opacity-30 subtext-tracking">NO DATABASE MATCH</div>
              )}
           </div>
        </div>
      </Modal>

      <style>{`
        /* --- AEGIS SELECTOR & MODAL STYLES --- */
        .aegis-selector-trigger {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--border-white-thin);
          padding: 16px 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .aegis-selector-trigger:hover {
          border-color: var(--gold-solid);
          background: rgba(212, 175, 55, 0.05);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.1);
        }
        .selector-arrow-box {
          background: rgba(212, 175, 55, 0.1);
          padding: 5px;
          border-radius: 4px;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        /* POPUP CARD */
        .operative-popup-card {
          background: #050505;
          border: 1px solid var(--gold-solid);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,1);
        }
        .search-input-wrapper input {
          width: 100%;
          background: #000;
          border: 1px solid var(--border-white-thin);
          padding: 12px 15px;
          color: white;
          border-radius: 8px;
          font-size: 0.8rem;
          outline: none;
        }
        .search-input-wrapper input:focus { border-color: var(--gold-solid); }

        .operative-scroll-list {
          max-height: 300px;
          overflow-y: auto;
          padding-right: 5px;
        }
        .operative-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 8px;
          cursor: pointer;
          background: rgba(255,255,255,0.02);
          border: 1px solid transparent;
          transition: 0.2s;
        }
        .operative-item:hover { background: rgba(212, 175, 55, 0.05); border-color: rgba(212, 175, 55, 0.2); }
        .operative-item.selected { background: rgba(212, 175, 55, 0.1); border-color: var(--gold-solid); }

        .avatar-mini {
          width: 32px; height: 32px;
          background: var(--gold-metallic);
          color: black;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.75rem;
        }
        .status-text-mini { font-size: 0.6rem; color: #888; display: flex; align-items: center; gap: 5px; margin-top: 2px; }
        .status-text-mini .dot { width: 5px; height: 5px; border-radius: 50%; }
        .status-text-mini .dot.green { background: #10b981; box-shadow: 0 0 5px #10b981; }
        .status-text-mini .dot.red { background: #ef4444; box-shadow: 0 0 5px #ef4444; }

        .btn-close-terminal { background: transparent; border: none; color: #666; transition: 0.3s; }
        .btn-close-terminal:hover { color: white; transform: rotate(90deg); }

        /* AEGIS ROYAL GOLD BUTTONS */
        .btn-gold-solid-standard {
          background: var(--gold-metallic) !important;
          color: #000 !important;
          border: none !important;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          border-radius: 6px;
          transition: 0.3s;
        }
        .btn-gold-solid-standard:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.2);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
        }

        .btn-gold-solid-danger {
          background: transparent !important;
          border: 1px solid #ef4444 !important;
          color: #ef4444 !important;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          border-radius: 6px;
          transition: 0.3s;
        }
        .btn-gold-solid-danger:hover:not(:disabled) {
          background: #ef4444 !important;
          color: white !important;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }

        /* --- YOUR OLD CARD STYLES (NO CHANGES) --- */
        .card-stats-premium { background: rgba(10, 10, 10, 0.6); backdrop-filter: blur(15px); border: 1px solid var(--border-white-thin); padding: 24px; border-radius: 12px; position: relative; overflow: hidden; }
        .stats-icon-box { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.05); }
        .stats-trend-badge { font-size: 0.5rem; background: rgba(255,255,255,0.05) !important; color: #aaa; border: 1px solid rgba(255,255,255,0.1); }
        .stats-glow-line { position: absolute; bottom: 0; left: 0; height: 2px; width: 30%; }

        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--gold-solid); border-radius: 10px; }
      `}</style>
    </Container>
  );
};

export default SystemOverview;