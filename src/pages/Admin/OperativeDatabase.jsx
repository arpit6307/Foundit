// src/pages/Admin/OperativeDatabase.jsx
import React from 'react';
import { Badge, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Shield, User, Fingerprint, Zap, Activity, Cpu, ShieldAlert } from 'lucide-react';

const OperativeDatabase = ({ users, searchTerm, setSearchTerm, setUpgradeTarget, setShowUpgradeModal }) => {
  
  // Search logic covering name and email
  const filteredOperatives = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm) || 
    u.fullName?.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="operative-database-root">
      {/* --- TERMINAL SEARCH HEADER --- */}
      <div className="card-premium-dark p-4 mb-5 border-gold-glow bg-black shadow-lg">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div>
            <h6 className="heading-tracking m-0 text-luxury-gold d-flex align-items-center gap-2">
              <Cpu size={20} className="animate-pulse" /> OPERATIVE REGISTRY
            </h6>
            <p className="subtext-tracking text-muted m-0 mt-1" style={{fontSize: '0.6rem'}}>
              ENCRYPTED DATABASE // ACTIVE_NODES: {filteredOperatives.length}
            </p>
          </div>
          
          <div className="terminal-search-wrapper">
            <Search size={16} className="search-icon" />
            <input 
              placeholder="SCAN OPERATIVE IDENTITY..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              className="terminal-search-input"
            />
            <div className="input-scanner-line"></div>
          </div>
        </div>
      </div>

      {/* --- OPERATIVE IDENTITY GRID --- */}
      <Row className="g-4">
        <AnimatePresence>
          {filteredOperatives.length > 0 ? filteredOperatives.map((u, index) => (
            <Col xl={4} lg={6} md={12} key={u.id}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`operative-identity-card ${u.plan?.toLowerCase() || 'bronze'}`}
              >
                {/* Scanner Decorative Element */}
                <div className="card-scanner-bar"></div>

                {/* ID Header Section */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="avatar-section">
                    <div className="avatar-circle-glow">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt="OP" className="avatar-img-circle" />
                      ) : (
                        <div className="avatar-initials-circle">
                          {u.fullName ? u.fullName.charAt(0).toUpperCase() : u.email?.charAt(0).toUpperCase() || <User size={20}/>}
                        </div>
                      )}
                    </div>
                    <div className={`status-node ${u.accountStatus === 'suspended' ? 'red' : 'green'}`}></div>
                  </div>
                  
                  <div className="text-end">
                    <Badge className={`protocol-pill-v2 ${u.plan?.toLowerCase() || 'bronze'}`}>
                       {u.plan?.toUpperCase() || 'BRONZE'}
                    </Badge>
                    <div className="mt-1 text-muted opacity-30" style={{fontSize: '0.5rem', fontFamily: 'monospace'}}>
                      AUTH_LVL_{u.plan === 'Unlimited' ? 'MAX' : u.plan === 'Silver' ? '02' : '01'}
                    </div>
                  </div>
                </div>

                {/* Main Intel Section */}
                <div className="operative-intel-body">
                   <h5 className="operative-display-name">
                     {u.fullName || u.email?.split('@')[0].toUpperCase() || 'REDACTED ID'}
                   </h5>
                   <div className="operative-meta-links mt-2">
                      <div className="meta-link">
                        <Mail size={12} />
                        <span>{u.email}</span>
                      </div>
                      <div className="meta-link">
                        <Fingerprint size={12} />
                        <span>UID_{u.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                   </div>
                </div>

                {/* Capability Matrix */}
                <div className="capability-section mt-4">
                   <div className="d-flex justify-content-between mb-2">
                      <span className="matrix-label">CORE_INTEGRITY</span>
                      <span className="matrix-val">99.9%</span>
                   </div>
                   <div className="matrix-track">
                      <div className="track-fill"></div>
                   </div>
                </div>

                {/* Action Interface - FIXED: Triggers Modal for Free Upgrade/Cancel */}
                <button 
                  onClick={() => { setUpgradeTarget(u); setShowUpgradeModal(true); }}
                  className="btn-aegis-upgrade mt-4"
                >
                  <Zap size={14} fill="currentColor" />
                  <span>MANAGE PROTOCOL</span>
                </button>
              </motion.div>
            </Col>
          )) : (
            <Col xs={12}>
               <div className="text-center py-5 opacity-30">
                  <Activity size={50} className="mb-3 animate-spin-slow text-luxury-gold" />
                  <p className="heading-tracking">NO MATCH FOUND IN AEGIS REGISTRY</p>
               </div>
            </Col>
          )}
        </AnimatePresence>
      </Row>

      <style>{`
        /* --- AEGIS TERMINAL THEME --- */
        .operative-database-root { padding-bottom: 50px; }

        .terminal-search-wrapper { position: relative; min-width: 320px; }
        .terminal-search-input {
          width: 100%; background: rgba(5,5,5,0.8); border: 1px solid rgba(212, 175, 55, 0.2);
          padding: 12px 15px 12px 45px; color: white; border-radius: 6px;
          font-size: 0.8rem; letter-spacing: 1px; outline: none; transition: 0.3s;
        }
        .terminal-search-input:focus { border-color: var(--gold-solid); box-shadow: 0 0 15px rgba(212, 175, 55, 0.1); }
        .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--gold-solid); }

        .operative-identity-card {
          background: #080808; border: 1px solid rgba(255,255,255,0.05);
          padding: 24px; border-radius: 12px; position: relative; overflow: hidden;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .operative-identity-card:hover { transform: translateY(-8px); border-color: rgba(212, 175, 55, 0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }

        /* Protocol Specific Highlights - No Blue */
        .operative-identity-card.unlimited { border-top: 3px solid var(--gold-solid); }
        .operative-identity-card.silver { border-top: 3px solid #C0C0C0; }
        .operative-identity-card.bronze { border-top: 3px solid #CD7F32; }

        .avatar-section { position: relative; width: 60px; height: 60px; }
        .avatar-circle-glow {
          width: 100%; height: 100%; border-radius: 50%; border: 2px solid rgba(212, 175, 55, 0.2);
          padding: 3px; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center;
        }
        .avatar-img-circle { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .avatar-initials-circle { color: var(--gold-solid); font-weight: 800; font-size: 1.2rem; }
        
        .status-node {
          position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px;
          border-radius: 50%; border: 2px solid #000;
        }
        .status-node.green { background: #10b981; box-shadow: 0 0 10px #10b981; }
        .status-node.red { background: #ef4444; box-shadow: 0 0 10px #ef4444; }

        .protocol-pill-v2 { font-size: 0.55rem; padding: 4px 12px; letter-spacing: 1.5px; border-radius: 3px; }
        .protocol-pill-v2.unlimited { background: var(--gold-metallic) !important; color: black; font-weight: 900; }
        .protocol-pill-v2.silver { background: #C0C0C0 !important; color: black; }
        .protocol-pill-v2.bronze { background: #CD7F32 !important; color: white; }

        .operative-display-name { color: #fff; font-size: 1rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin: 0; }
        .meta-link { display: flex; align-items: center; gap: 10px; color: #666; font-size: 0.65rem; }
        .meta-link svg { color: var(--gold-solid); width: 12px; }

        .matrix-track { width: 100%; height: 2px; background: rgba(255,255,255,0.05); border-radius: 10px; }
        .track-fill { width: 100%; height: 100%; background: var(--gold-solid); box-shadow: 0 0 10px var(--gold-solid); }

        .btn-aegis-upgrade {
          width: 100%; background: transparent; border: 1px solid rgba(212, 175, 55, 0.2);
          color: var(--gold-solid); padding: 12px; border-radius: 8px; font-weight: 800;
          font-size: 0.7rem; letter-spacing: 2px; display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: 0.3s;
        }
        .btn-aegis-upgrade:hover { background: var(--gold-solid); color: #000; box-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }

        .card-scanner-bar {
          position: absolute; top: -100%; left: 0; width: 100%; height: 100px;
          background: linear-gradient(180deg, transparent, rgba(212, 175, 55, 0.05), transparent);
          animation: scanV2 6s infinite linear; pointer-events: none;
        }
        @keyframes scanV2 { 0% { top: -100%; } 100% { top: 100%; } }

        @media (max-width: 768px) { .terminal-search-wrapper { min-width: 100%; } }
      `}</style>
    </div>
  );
};

export default OperativeDatabase;