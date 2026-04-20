// src/pages/Admin/TransactionTerminal.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Row, Col, Spinner, Table, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, TrendingUp, Users, DollarSign, Search, Calendar, ArrowUpRight, Activity } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';

const TransactionTerminal = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, count: 0 });

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("upgradedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.plan !== 'Bronze' && u.upgradedAt);
      
      setTransactions(list);
      const totalRev = list.length * 99; 
      setStats({ total: totalRev, count: list.length });
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const chartData = transactions.reduce((acc, curr) => {
    try {
      const date = curr.upgradedAt?.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (date) {
        const existing = acc.find(item => item.name === date);
        if (existing) { existing.sales += 99; }
        else { acc.push({ name: date, sales: 99 }); }
      }
    } catch (e) { console.log("Chart parsing logic..."); }
    return acc;
  }, []).reverse().slice(-7);

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <Spinner animation="border" style={{color: 'var(--gold-solid)'}} />
      <p className="mt-2 heading-tracking text-luxury-gold uppercase" style={{fontSize:'0.7rem'}}>Decrypting Financial Matrix...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="transaction-root">
      
      {/* --- STATS OVERVIEW --- */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <div className="card-premium-dark p-4 border-gold-glow h-100 shadow-lg">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="subtext-tracking text-muted mb-1" style={{fontSize: '0.6rem'}}>TOTAL REVENUE</p>
                <h3 className="heading-tracking text-white m-0">₹{stats.total.toLocaleString()}</h3>
              </div>
              <div className="stat-icon-box-premium gold"><DollarSign size={22} /></div>
            </div>
            <div className="mt-3 d-flex align-items-center gap-2 text-success" style={{fontSize: '0.65rem'}}>
              <Activity size={12}/> <span className="subtext-tracking fw-bold">NODE_STREAM_ACTIVE</span>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="card-premium-dark p-4 border-white-thin h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="subtext-tracking text-muted mb-1" style={{fontSize: '0.6rem'}}>PREMIUM OPERATIVES</p>
                <h3 className="heading-tracking text-white m-0">{stats.count}</h3>
              </div>
              <div className="stat-icon-box-premium white"><Users size={22}/></div>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="card-premium-dark p-4 border-white-thin h-100 bg-black-depth">
            <p className="subtext-tracking text-muted mb-2" style={{fontSize: '0.6rem', letterSpacing: '1px'}}>REVENUE STREAM (7D)</p>
            <div style={{ width: '100%', height: '80px' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={80}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" hide={false} axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 8}} dy={5} />
                  <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'var(--gold-solid)' : 'rgba(212, 175, 55, 0.3)'} />
                    ))}
                  </Bar>
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{display:'none'}} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>
      </Row>

      {/* --- MASTER DATA TERMINAL --- */}
      <div className="card-premium-dark p-0 overflow-hidden border-white-thin shadow-2xl">
        <div className="p-4 border-bottom border-white-thin d-flex flex-column flex-md-row justify-content-between align-items-md-center bg-black-depth gap-3">
           <div className="d-flex align-items-center gap-3">
              <div className="terminal-dot"></div>
              <h6 className="heading-tracking m-0 text-white" style={{fontSize: '0.85rem'}}>FINANCIAL_LOGS_SYNCED</h6>
           </div>
           <div className="d-flex gap-2 align-items-center px-3 py-2 rounded bg-black border-white-thin">
              <Search size={14} className="text-muted" />
              <input type="text" placeholder="FILTER_RECORDS..." className="bg-transparent border-0 text-white subtext-tracking" style={{fontSize: '0.65rem', outline: 'none', width: '150px'}} />
           </div>
        </div>
        
        <div className="terminal-content-scroll custom-scrollbar" style={{maxHeight: '600px', overflowY: 'auto'}}>
          <AnimatePresence mode="wait">
            {transactions.length > 0 ? (
              <>
                {/* DESKTOP VIEW: MASTER TERMINAL TABLE */}
                <div className="d-none d-md-block">
                  <Table borderless className="admin-table-custom-v2 m-0">
                    <thead>
                      <tr>
                        <th className="subtext-tracking">OPERATIVE</th>
                        <th className="subtext-tracking">PLAN_TYPE</th>
                        <th className="subtext-tracking">PAYMENT_REFERENCE</th>
                        <th className="subtext-tracking">TIMESTAMP</th>
                        <th className="subtext-tracking text-end">GROSS_AMT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="tx-row-v2">
                          <td>
                            <div className="d-flex align-items-center gap-3">
                               <div className="tx-avatar-v2">{tx.fullName?.charAt(0) || 'U'}</div>
                               <div className="d-flex flex-column">
                                  <span className="heading-tracking text-white" style={{fontSize: '0.75rem'}}>{tx.fullName}</span>
                                  <span className="subtext-tracking text-muted" style={{fontSize: '0.6rem'}}>{tx.email}</span>
                               </div>
                            </div>
                          </td>
                          <td>
                            <Badge className={`plan-pill-premium ${tx.plan?.toLowerCase()}`}>{tx.plan?.toUpperCase()}</Badge>
                          </td>
                          <td className="text-muted monospace" style={{fontSize: '0.6rem', letterSpacing: '1px'}}>
                            {tx.lastPaymentId || 'AUTH_NODAL_GEN'}
                          </td>
                          <td className="subtext-tracking text-muted" style={{fontSize: '0.65rem'}}>
                            {tx.upgradedAt?.toDate().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="text-end">
                            <span className="text-luxury-gold fw-bold" style={{fontSize: '0.8rem'}}>₹99.00</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* MOBILE VIEW: DUAL GRID CARDS (1 line mein 2) */}
                <div className="d-md-none p-3 bg-black">
                  <Row className="g-2">
                    {transactions.map((tx) => (
                      <Col xs={6} key={tx.id}>
                        <motion.div initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} className="elite-receipt-card">
                          <div className="receipt-top mb-2">
                            <div className="m-tx-avatar-v2">{tx.fullName?.charAt(0)}</div>
                            <Badge bg="transparent" className={`m-plan-tag ${tx.plan?.toLowerCase()}`}>{tx.plan?.charAt(0)}</Badge>
                          </div>
                          
                          <h6 className="m-tx-name-v2 text-truncate">{tx.fullName}</h6>
                          <div className="m-tx-id-mono text-truncate mb-2">{tx.lastPaymentId?.slice(-8) || 'SYSTEM'}</div>
                          
                          <div className="receipt-footer mt-auto pt-2 border-top border-white-thin">
                            <div className="d-flex justify-content-between align-items-center">
                               <span className="m-date">{tx.upgradedAt?.toDate().toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}</span>
                               <span className="m-amount text-luxury-gold fw-bold">₹99</span>
                            </div>
                          </div>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </>
            ) : (
              <div className="text-center py-5 text-muted subtext-tracking opacity-50">
                 <CreditCard size={40} className="mb-3" />
                 <p>ZERO_TRANSACTIONS_LOGGED</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .bg-black-depth { background: rgba(255,255,255,0.01); }
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }

        .stat-icon-box-premium { 
          width: 45px; height: 45px; border-radius: 12px; 
          display: flex; align-items: center; justify-content: center; 
        }
        .stat-icon-box-premium.gold { background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); color: var(--gold-solid); }
        .stat-icon-box-premium.white { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; }

        .terminal-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold-solid); box-shadow: 0 0 10px var(--gold-solid); }

        /* --- DESKTOP TABLE UPGRADE --- */
        .admin-table-custom-v2 thead th { 
          background: rgba(15, 15, 15, 0.8); color: #888; 
          font-size: 0.65rem; padding: 22px; border-bottom: 1px solid rgba(212, 175, 55, 0.1);
          text-transform: uppercase; letter-spacing: 1px;
        }
        .admin-table-custom-v2 tbody td { 
          padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.03); 
          vertical-align: middle; background: transparent; transition: 0.3s;
        }
        .tx-row-v2:hover td { background: rgba(212, 175, 55, 0.02); }
        
        .tx-avatar-v2 { 
          width: 38px; height: 38px; border-radius: 10px; background: #000; 
          border: 1px solid rgba(212, 175, 55, 0.4); display: flex; 
          align-items: center; justify-content: center; font-size: 0.8rem; 
          color: var(--gold-solid); font-weight: 800; font-family: 'Inter', sans-serif;
        }

        .plan-pill-premium { font-size: 0.55rem; letter-spacing: 1.5px; padding: 6px 12px; border-radius: 4px; font-weight: 900; }
        .plan-pill-premium.silver { background: var(--gold-solid) !important; color: #000; }
        .plan-pill-premium.unlimited { background: #fff !important; color: #000; }

        /* --- ELITE MOBILE GRID --- */
        .elite-receipt-card {
          background: #0d0d0d; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 14px; height: 100%; transition: 0.3s;
          display: flex; flex-direction: column; position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .receipt-top { display: flex; justify-content: space-between; align-items: center; }
        .m-tx-avatar-v2 { width: 28px; height: 28px; border-radius: 8px; background: rgba(212, 175, 55, 0.1); color: var(--gold-solid); font-size: 0.7rem; font-weight: 900; display: flex; align-items: center; justify-content: center; }
        .m-plan-tag { font-size: 0.5rem; border: 1px solid rgba(212, 175, 55, 0.4); color: var(--gold-solid); padding: 2px 6px; }
        .m-tx-name-v2 { color: #fff; font-size: 0.75rem; font-weight: 800; margin: 8px 0 2px 0; }
        .m-tx-id-mono { font-size: 0.5rem; font-family: monospace; color: #444; letter-spacing: 1px; }
        .m-date { font-size: 0.55rem; color: #666; font-weight: 600; }
        .m-amount { font-size: 0.75rem; }

        .monospace { font-family: monospace; }
        .border-gold-glow { border: 1px solid var(--gold-solid); box-shadow: 0 0 20px rgba(212, 175, 55, 0.15); }
      `}</style>
    </motion.div>
  );
};

export default TransactionTerminal;