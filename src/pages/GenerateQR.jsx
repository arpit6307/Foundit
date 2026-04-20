// src/pages/GenerateQR.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Spinner, Form } from 'react-bootstrap';
import { 
  QrCode, ShieldCheck, Download, Sparkles, 
  Scan, Fingerprint, Palette, Lock, User, Phone, MapPin, Box, Image as ImageIcon,
  Upload, X, ChevronDown
} from 'lucide-react';
import { db } from '../firebase-config';
import { collection, doc, setDoc, serverTimestamp, getDocs, query, where, getDoc, updateDoc, Timestamp } from 'firebase/firestore'; 
import { useAuth } from '../context/AuthContext';
import QRCodeStyling from 'qr-code-styling';
import { motion, AnimatePresence } from 'framer-motion';
import SubscriptionModal from '../components/SubscriptionModal';

const SHIELD_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRDRBRjM3IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDIycyA4LTQuNSA4LTExLjVWNWwtOC0zLTggM3Y2LjVjMCA3IDggMTEuNSA4IDExLjV6Ii8+PC9zdmc+";

const GenerateQR = () => {
  const { user } = useAuth();
  const qrDivRef = useRef(null); 
  const qrCodeStylingRef = useRef(null); 
  
  const [loading, setLoading] = useState(false);
  const [qrId, setQrId] = useState(null); // This will now store the 6-digit numeric ID
  const [qrUrl, setQrUrl] = useState('');
  
  const [showSubModal, setShowSubModal] = useState(false);
  const [userPlanData, setUserPlanData] = useState({ plan: 'Bronze', tagsCount: 0 });

  const [assetInfo, setAssetInfo] = useState({
    assetName: '',
    ownerName: user?.displayName || '',
    phone: '',
    address: '',
    returnMessage: 'If found, please scan and return. Reward guaranteed.'
  });
  
  const [qrConfig, setQrConfig] = useState({
    fgColor: '#D4AF37', 
    bgColor: '#FFFFFF', 
    frameColor: '#050505', 
    themeName: 'Royal Gold',
    dotType: 'classy', 
    cornerType: 'extra-rounded', 
    showLogo: true,
    customLogo: null 
  });

  const colorPalettes = [
    { name: 'Royal Gold', fg: '#D4AF37', frame: '#050505' },
    { name: 'Pure Dark', fg: '#000000', frame: '#000000' },
    { name: 'Deep Navy', fg: '#1E3A8A', frame: '#0F172A' },
    { name: 'Cyber Cyan', fg: '#0891B2', frame: '#050505' },
  ];

  // ✅ NEW: Function to generate Unique 6-Digit Vault ID
  const generateNumericVaultID = async () => {
    let isUnique = false;
    let newID = "";
    
    while (!isUnique) {
      newID = Math.floor(100000 + Math.random() * 900000).toString();
      const q = query(collection(db, "userQRs"), where("qrId", "==", newID));
      const snap = await getDocs(q);
      if (snap.empty) isUnique = true;
    }
    return newID;
  };

  const fetchSecurityStatus = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "userQRs"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const count = snap.size;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.plan === 'Silver' && data.expiryDate) {
          const now = new Date();
          if (now > data.expiryDate.toDate()) {
            await updateDoc(userRef, { plan: 'Bronze' });
            setUserPlanData({ plan: 'Bronze', tagsCount: count });
            return;
          }
        }
        setUserPlanData({ plan: data.plan || 'Bronze', tagsCount: count });
      } else {
        setUserPlanData({ plan: 'Bronze', tagsCount: count });
      }
    } catch (err) {
      console.error("Plan Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchSecurityStatus();
  }, [user]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB for QR Logo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setQrConfig(prev => ({ ...prev, customLogo: event.target.result, showLogo: true }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!qrId || !qrUrl) return;

    if (!qrCodeStylingRef.current) {
      qrCodeStylingRef.current = new QRCodeStyling({
        width: 250,
        height: 250,
        type: "canvas",
        margin: 5,
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 5, crossOrigin: "anonymous" }
      });
    }

    let finalLogo = "";
    if (qrConfig.showLogo) {
      finalLogo = qrConfig.customLogo ? qrConfig.customLogo : SHIELD_LOGO;
    }

    qrCodeStylingRef.current.update({
      data: qrUrl,
      image: finalLogo,
      dotsOptions: { color: qrConfig.fgColor, type: qrConfig.dotType },
      backgroundOptions: { color: qrConfig.bgColor },
      cornersSquareOptions: { color: qrConfig.fgColor, type: qrConfig.cornerType },
      cornersDotOptions: { color: qrConfig.fgColor, type: qrConfig.dotType === 'dots' ? 'dot' : 'square' }
    });

    if (qrDivRef.current) {
      qrDivRef.current.innerHTML = ''; 
      qrCodeStylingRef.current.append(qrDivRef.current);
    }
  }, [qrId, qrUrl, qrConfig]);

  const handleUpgradePayment = () => {
    const options = {
      key: "rzp_live_SWbNZBmdp2OrIZ", 
      amount: 9900, 
      currency: "INR",
      name: "FoundIt Security",
      description: "Upgrade to Silver Vault (5 Tags + Visuals)",
      image: SHIELD_LOGO,
      handler: async function (response) {
        try {
          const userRef = doc(db, "users", user.uid);
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + 30); 

          await updateDoc(userRef, {
            plan: 'Silver',
            expiryDate: Timestamp.fromDate(expiry),
            lastPaymentId: response.razorpay_payment_id,
            upgradedAt: serverTimestamp()
          });

          setShowSubModal(false);
          await fetchSecurityStatus(); 
          alert("VAULT UPGRADED TO SILVER. CAPABILITIES UNLOCKED.");
        } catch (err) {
          console.error("Database Update Failed:", err);
        }
      },
      prefill: {
        name: user?.displayName || "",
        email: user?.email || "",
        contact: assetInfo.phone
      },
      theme: { color: "#D4AF37" }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (userPlanData.plan === 'Bronze' && userPlanData.tagsCount >= 1) {
      setShowSubModal(true);
      return;
    }
    if (userPlanData.plan === 'Silver' && userPlanData.tagsCount >= 5) {
      alert("Silver Plan reached its 5-tag limit.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Use Numeric 6-Digit ID instead of Firebase Auto-ID
      const numericID = await generateNumericVaultID();
      const newQrRef = doc(db, "userQRs", numericID); // Document Name is now the 6-digit ID

      await setDoc(newQrRef, {
        qrId: numericID,
        userId: user.uid,
        userEmail: user.email,
        assetName: assetInfo.assetName,
        ownerName: assetInfo.ownerName,
        phone: assetInfo.phone,
        address: assetInfo.address,
        returnMessage: assetInfo.returnMessage,
        status: 'active',
        createdAt: serverTimestamp()
      });

      // ✅ Redirect URL will now contain the numeric ID
      const generatedUrl = `${window.location.origin}/found-report/${numericID}`;
      setQrUrl(generatedUrl);
      setQrId(numericID);
      setUserPlanData(prev => ({ ...prev, tagsCount: prev.tagsCount + 1 }));

    } catch (error) {
      console.error("Tag Generation Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!qrCodeStylingRef.current || !qrId) return;
    try {
      const blob = await qrCodeStylingRef.current.getRawData("png");
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 500;
        canvas.height = 750;
        ctx.fillStyle = qrConfig.frameColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = qrConfig.fgColor;
        ctx.lineWidth = 6;
        ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
        ctx.fillStyle = qrConfig.fgColor;
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SECURE ASSET TAG', canvas.width / 2, 75);
        ctx.font = 'bold 28px monospace'; // Numeric ID font
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`VAULT ID: ${qrId}`, canvas.width / 2, 125);
        const qrSize = 340;
        const x = (canvas.width - qrSize) / 2;
        const y = 165;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - 5, y - 5, qrSize + 10, qrSize + 10);
        ctx.drawImage(img, x, y, qrSize, qrSize);
        ctx.fillStyle = qrConfig.fgColor;
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('SCAN TO REPORT FOUND', canvas.width / 2, y + qrSize + 65);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('POWERED BY FOUNDIT SECURITY NETWORK', canvas.width / 2, y + qrSize + 100);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `FOUNDIT_VAULT_${qrId}.png`;
        downloadLink.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-root p-3 p-md-4 p-lg-5 min-vh-100">
      <Container>
        <div className="mb-4 border-bottom pb-3" style={{ borderColor: 'var(--border-white-thin) !important' }}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
                <QrCode size={28} color="var(--gold-solid)" />
                <h1 className="m-0 text-white heading-tracking">MINT <span className="text-luxury-gold">SECURE TAG</span></h1>
            </div>
            <div className="d-none d-md-flex align-items-center gap-2 px-3 py-1 rounded border-white-thin bg-black">
                <ShieldCheck size={14} color="var(--gold-solid)" />
                <span className="subtext-tracking" style={{fontSize: '0.6rem'}}>{userPlanData.plan.toUpperCase()} VAULT</span>
            </div>
          </div>
        </div>

        <Row className="g-4">
          <Col lg={7}>
            <div className="card-premium-dark p-4 h-100 d-flex flex-column">
              {!qrId ? (
                <Form onSubmit={handleGenerate} className="d-flex flex-column h-100">
                  <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border-white-thin) !important' }}>
                    <Fingerprint size={20} color="var(--gold-solid)" />
                    <span className="text-white heading-tracking">LINK IDENTITY</span>
                  </div>
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Label className="subtext-tracking text-white ms-1">Asset Name</Form.Label>
                      <div className="d-flex align-items-center px-3 rounded" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid var(--border-white-thin)' }}>
                        <Box size={14} color="var(--text-muted)" />
                        <Form.Control required placeholder="E.g. Macbook Air" className="bg-transparent border-0 text-white subtext-tracking ms-2 py-3 shadow-none" value={assetInfo.assetName} onChange={(e) => setAssetInfo({...assetInfo, assetName: e.target.value})} />
                      </div>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="subtext-tracking text-white ms-1">Owner Name</Form.Label>
                      <div className="d-flex align-items-center px-3 rounded" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid var(--border-white-thin)' }}>
                        <User size={14} color="var(--text-muted)" />
                        <Form.Control required placeholder="Full Name" className="bg-transparent border-0 text-white subtext-tracking ms-2 py-3 shadow-none" value={assetInfo.ownerName} onChange={(e) => setAssetInfo({...assetInfo, ownerName: e.target.value})} />
                      </div>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="subtext-tracking text-white ms-1">Contact Number</Form.Label>
                      <div className="d-flex align-items-center px-3 rounded" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid var(--border-white-thin)' }}>
                        <Phone size={14} color="var(--text-muted)" />
                        <Form.Control required type="tel" placeholder="+91..." className="bg-transparent border-0 text-white subtext-tracking ms-2 py-3 shadow-none" value={assetInfo.phone} onChange={(e) => setAssetInfo({...assetInfo, phone: e.target.value})} />
                      </div>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="subtext-tracking text-white ms-1">Return Area</Form.Label>
                      <div className="d-flex align-items-center px-3 rounded" style={{ background: 'rgba(15,15,15,0.8)', border: '1px solid var(--border-white-thin)' }}>
                        <MapPin size={14} color="var(--text-muted)" />
                        <Form.Control placeholder="City" className="bg-transparent border-0 text-white subtext-tracking ms-2 py-3 shadow-none" value={assetInfo.address} onChange={(e) => setAssetInfo({...assetInfo, address: e.target.value})} />
                      </div>
                    </Col>
                  </Row>
                  <div className="mt-auto">
                    <button type="submit" disabled={loading} className="btn-gold-solid w-100 py-3">
                      {loading ? <Spinner size="sm" style={{color:'#000'}} /> : <><Sparkles size={18} className="me-2" /> GENERATE VAULT TAG</>}
                    </button>
                  </div>
                </Form>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="d-flex flex-column h-100">
                    <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border-white-thin) !important' }}>
                      <Palette size={20} color="var(--gold-solid)" />
                      <span className="text-white heading-tracking">CUSTOMIZE TAG PROTOCOL</span>
                    </div>
                    <div className="mb-4">
                      <Form.Label className="subtext-tracking text-muted mb-2 d-block">Base Theme</Form.Label>
                      <div className="d-flex flex-wrap gap-2">
                        {colorPalettes.map((palette) => (
                          <button key={palette.name} onClick={() => setQrConfig({ ...qrConfig, fgColor: palette.fg, frameColor: palette.frame, themeName: palette.name })}
                            className="px-3 py-2 rounded border-0 subtext-tracking transition-smooth flex-fill"
                            style={{ 
                              background: qrConfig.themeName === palette.name ? 'rgba(212, 175, 55, 0.1)' : 'rgba(15,15,15,0.8)',
                              color: qrConfig.themeName === palette.name ? 'var(--gold-solid)' : 'var(--text-muted)',
                              border: qrConfig.themeName === palette.name ? '1px solid var(--gold-solid)' : '1px solid var(--border-white-thin)',
                              fontSize: '0.65rem'
                            }}
                          >
                            {palette.name.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4 rounded p-3" style={{ border: '1px solid var(--border-white-thin)', background: 'rgba(15,15,15,0.8)' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="subtext-tracking text-white" style={{fontSize: '0.7rem'}}>CENTRAL VAULT LOGO</span>
                        <div className="d-flex gap-2">
                            <label className="btn-dark-outline p-2 rounded cursor-pointer mb-0" style={{fontSize: '0.6rem'}}>
                              <Upload size={14} /> UPLOAD
                              <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                            </label>
                            <Form.Check type="switch" checked={qrConfig.showLogo} onChange={(e) => setQrConfig({...qrConfig, showLogo: e.target.checked})} className="custom-switch-gold" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <button onClick={handleDownload} className="btn-gold-solid w-100 py-3 d-flex align-items-center justify-content-center gap-2">
                        <Download size={18} /> EXPORT SECURE TAG
                      </button>
                      <p className="text-center mt-3 text-muted subtext-tracking" style={{fontSize: '0.65rem'}}>VAULT ID: <span className="text-white fw-bold">{qrId}</span></p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </Col>

          <Col lg={5}>
            <div className="card-premium-dark p-4 p-md-5 h-100 text-center position-relative d-flex flex-column align-items-center justify-content-center">
              {!qrId ? (
                <div className="opacity-25 text-center">
                  <Lock size={60} color="var(--text-muted)" className="mb-3" />
                  <p className="subtext-tracking text-muted">AWAITING SYSTEM LINK</p>
                </div>
              ) : (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-100">
                  <div className="d-inline-block p-4 rounded-4 position-relative" style={{ background: qrConfig.frameColor, border: `2px solid ${qrConfig.fgColor}` }}>
                    <h5 className="heading-tracking mb-2" style={{ color: qrConfig.fgColor, fontSize: '0.8rem' }}>SECURE ASSET TAG</h5>
                    <div className="py-1 px-3 mb-3 rounded" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span className="text-white" style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '2px' }}>ID: {qrId}</span>
                    </div>
                    <div className="p-2 bg-white rounded mb-3" ref={qrDivRef}></div>
                    <span className="heading-tracking" style={{ color: qrConfig.fgColor, fontSize: '0.6rem' }}>SCAN TO RETURN</span>
                  </div>
                </motion.div>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      <SubscriptionModal 
        show={showSubModal} 
        onHide={() => setShowSubModal(false)} 
        onUpgrade={handleUpgradePayment}
      />
    </motion.div>
  );
};

export default GenerateQR;