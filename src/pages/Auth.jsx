// src/pages/Auth.jsx
import React, { useState, useEffect } from 'react'; // Added useEffect for auto-fill logic
import { Container, Card, Form, Button, Alert, InputGroup, Spinner, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  ShieldCheck,
  Info,
  Zap,
  LogIn,
  Award // Added for Referral Icon
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // ✅ NEW: Referral States
  const [referralCode, setReferralCode] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const { login, signup, googleLogin } = useAuth(); 
  const navigate = useNavigate();

  // ✅ NEW: Check for stored referral code on load
  useEffect(() => {
    const storedCode = localStorage.getItem('pendingReferralCode');
    if (storedCode) {
      setReferralCode(storedCode);
      setIsAutoFilled(true); // User cannot change it if came via link
    }
  }, []);

  // --- Premium Mouse Tracking for Particles ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } }
  };

  // ✅ Main Form Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        // ✅ Passed referralCode to signup function
        await signup(email, password, fullName, phoneNumber, referralCode);
      }
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.code === 'auth/user-not-found' ? 'User not found in vault.' :
                           err.code === 'auth/wrong-password' ? 'Invalid passkey provided.' :
                           err.code === 'auth/email-already-in-use' ? 'Identity already registered.' :
                           err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Authentication Handler
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await googleLogin();
      navigate('/dashboard');
    } catch (err) {
      setError("Secure link via Google failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="position-relative overflow-hidden w-100 d-flex align-items-center justify-content-center" 
      style={{ minHeight: '100vh', background: '#050505' }}
      onMouseMove={handleMouseMove}
    >
      
      {/* --- Cyber Background Particles --- */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0, pointerEvents: 'none' }}>
        <motion.div 
          style={{
            position: 'absolute',
            left: springX,
            top: springY,
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="position-absolute rounded-circle"
            animate={{
              x: [Math.random() * 30, -Math.random() * 30, Math.random() * 30],
              y: [Math.random() * 30, -Math.random() * 30, Math.random() * 30],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, ease: "linear" }}
            style={{
              width: '3px',
              height: '3px',
              background: 'var(--gold-solid)',
              boxShadow: '0 0 10px var(--gold-solid)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      
      <Container className="position-relative" style={{ zIndex: 1 }}>
        <div className="d-flex justify-content-center">
          <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              width: isLogin ? '400px' : '720px' 
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <Card className="card-premium-dark border-0 p-2 p-md-3">
              <Card.Body className="p-3 p-md-4">
                
                <div className="text-center mb-4">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="d-inline-flex p-3 rounded mb-3" 
                    style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--border-gold-thin)' }}
                  >
                    <ShieldCheck size={28} color="var(--gold-solid)" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="heading-tracking text-white mb-1" style={{ fontSize: '1.1rem' }}>
                    {isLogin ? 'AUTHENTICATE VAULT' : 'ENROLL NEW IDENTITY'}
                  </h3>
                  <p className="subtext-tracking text-muted mb-0" style={{ fontSize: '0.6rem' }}>PROTECTED BY MILITARY-GRADE ENCRYPTION</p>
                </div>

                <AnimatePresence mode='wait'>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert variant="danger" className="py-2 rounded border-0 text-center mb-4 text-danger d-flex align-items-center justify-content-center gap-2" style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)' }}>
                        <Info size={14} /> {error}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Form onSubmit={handleSubmit}>
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <Row className="gx-3 gy-3">
                      <AnimatePresence mode='wait'>
                        {!isLogin && (
                          <>
                            <Col md={6}>
                              <motion.div variants={itemVariants}>
                                <Form.Label className="subtext-tracking text-muted mb-2 ms-1">Legal Name</Form.Label>
                                <InputGroup className="input-group-premium">
                                  <InputGroup.Text><User size={14}/></InputGroup.Text>
                                  <Form.Control 
                                    placeholder="OPERATIVE NAME" 
                                    className="bg-transparent border-0 text-white shadow-none"
                                    onChange={(e) => setFullName(e.target.value)}
                                    required={!isLogin} 
                                  />
                                </InputGroup>
                              </motion.div>
                            </Col>
                            <Col md={6}>
                              <motion.div variants={itemVariants}>
                                <Form.Label className="subtext-tracking text-muted mb-2 ms-1">Mobile</Form.Label>
                                <InputGroup className="input-group-premium">
                                  <InputGroup.Text><Phone size={14}/></InputGroup.Text>
                                  <Form.Control 
                                    type="tel" 
                                    placeholder="+91-XXXXX-XXXXX" 
                                    className="bg-transparent border-0 text-white shadow-none"
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required={!isLogin} 
                                  />
                                </InputGroup>
                              </motion.div>
                            </Col>
                            
                            {/* ✅ NEW: Referral Code Input (Always present in Signup) */}
                            <Col md={12}>
                              <motion.div variants={itemVariants}>
                                <Form.Label className="subtext-tracking text-muted mb-2 ms-1">Referral Code (Optional)</Form.Label>
                                <InputGroup className="input-group-premium">
                                  <InputGroup.Text><Award size={14}/></InputGroup.Text>
                                  <Form.Control 
                                    placeholder="ENTER 6-DIGIT CODE" 
                                    className="bg-transparent border-0 text-white shadow-none"
                                    value={referralCode}
                                    readOnly={isAutoFilled} // Locks if came via link
                                    onChange={(e) => !isAutoFilled && setReferralCode(e.target.value.toUpperCase())}
                                    style={{ 
                                      letterSpacing: '2px', 
                                      color: isAutoFilled ? 'var(--gold-solid)' : 'white' 
                                    }}
                                  />
                                </InputGroup>
                              </motion.div>
                            </Col>
                          </>
                        )}
                      </AnimatePresence>

                      <Col md={isLogin ? 12 : 6}>
                        <motion.div variants={itemVariants}>
                          <Form.Label className="subtext-tracking text-muted mb-2 ms-1">Email Interface</Form.Label>
                          <InputGroup className="input-group-premium">
                            <InputGroup.Text><Mail size={14}/></InputGroup.Text>
                            <Form.Control 
                              type="email" 
                              placeholder="ID@STATION.COM" 
                              className="bg-transparent border-0 text-white shadow-none"
                              style={{ textTransform: 'lowercase' }}
                              onChange={(e) => setEmail(e.target.value)}
                              required 
                            />
                          </InputGroup>
                        </motion.div>
                      </Col>

                      <Col md={isLogin ? 12 : 6}>
                        <motion.div variants={itemVariants}>
                          <Form.Label className="subtext-tracking text-muted mb-2 ms-1">Access Passkey</Form.Label>
                          <InputGroup className="input-group-premium">
                            <InputGroup.Text><Lock size={14}/></InputGroup.Text>
                            <Form.Control 
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••" 
                              className="bg-transparent border-0 text-white shadow-none"
                              onChange={(e) => setPassword(e.target.value)}
                              required 
                            />
                            <Button 
                              variant="link" 
                              className="border-0 p-0 me-3 text-muted"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
                            </Button>
                          </InputGroup>
                        </motion.div>
                      </Col>
                    </Row>

                    <motion.div variants={itemVariants} className="mt-4">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-gold-solid w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                      >
                        {loading ? <Spinner animation="border" size="sm" /> : (
                          <>
                            <span className="heading-tracking" style={{ fontSize: '0.8rem' }}>
                              {isLogin ? 'INITIALIZE LOGIN' : 'CONFIRM ENROLLMENT'}
                            </span>
                            <Zap size={16} />
                          </>
                        )}
                      </button>
                    </motion.div>

                  </motion.div>
                </Form>

                <div className="text-center mt-4 pt-3 border-top" style={{ borderColor: 'var(--border-white-thin) !important' }}>
                  <p className="mb-0 subtext-tracking text-muted" style={{ fontSize: '0.65rem' }}>
                    {isLogin ? "NEW OPERATIVE?" : "ALREADY REGISTERED?"} 
                    <Button 
                      variant="link" 
                      className="heading-tracking text-decoration-none ms-2 p-0"
                      style={{ color: 'var(--gold-solid)', fontSize: '0.7rem' }}
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                      }}
                    >
                      {isLogin ? 'ENROLL' : 'ACCESS'}
                    </Button>
                  </p>
                </div>

              </Card.Body>
            </Card>
          </motion.div>
        </div>
      </Container>
      
      {/* Footer Branding */}
      <div className="position-absolute bottom-0 w-100 p-4 text-center opacity-30">
        <p className="subtext-tracking mb-0" style={{ fontSize: '0.5rem' }}>FOUNDIT CORE OS V2.0 // ALL SYSTEMS OPERATIONAL</p>
      </div>

      <style>{`
        .input-group-premium {
          background: rgba(15,15,15,0.8);
          border: 1px solid var(--border-white-thin);
          border-radius: 6px;
          transition: var(--transition-smooth);
        }
        .input-group-premium:focus-within {
          border-color: var(--gold-solid);
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.1);
        }
        .input-group-premium .input-group-text {
          background: transparent;
          border: 0;
          padding-left: 15px;
          color: var(--text-muted);
        }
        .input-group-premium input::placeholder {
          color: #444;
          letter-spacing: 1px;
          font-size: 0.7rem;
        }
      `}</style>
    </div>
  );
};

export default Auth;