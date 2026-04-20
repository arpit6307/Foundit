// src/components/Footer.jsx
import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Social Links (Yahan aap apne real profile URLs daal sakte hain)
  const socialLinks = {
    github: "https://github.com/arpit6307", 
    linkedin: "https://linkedin.com/",
    instagram: "https://instagram.com/"
  };

  return (
    <footer 
      className="py-4 mt-auto border-top w-100 position-relative" 
      style={{ 
        background: '#050505', 
        borderColor: 'var(--border-white-thin) !important', 
        zIndex: 1100 
      }}
    >
      <Container>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
          
          {/* Copyright Section (Vault Style) */}
          <div className="subtext-tracking text-muted order-2 order-md-1 text-center text-md-start" style={{ fontSize: '0.65rem' }}>
            © {currentYear} <span className="heading-tracking text-luxury-gold mx-1" style={{ fontSize: '0.75rem' }}>FOUNDIT</span> NETWORK. ALL RIGHTS RESERVED.
          </div>

          {/* Premium Branding Section */}
          <div className="subtext-tracking text-muted order-1 order-md-2 text-center" style={{ fontSize: '0.7rem' }}>
            DEVELOPED WITH <span className="text-danger mx-1" style={{ fontSize: '1.2rem' }}>❤️</span>
            <span className="heading-tracking text-white ms-2 pb-1" style={{ borderBottom: '1px solid var(--gold-solid)', letterSpacing: '2px' }}>
              ARPIT SINGH YADAV
            </span>
          </div>

          {/* Custom Icons8 Social Links Section */}
          <div className="d-flex align-items-center gap-4 order-3">
            {/* Github */}
            <a 
              href={socialLinks.github} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="transition-all hover-scale"
              style={{ filter: 'invert(1)', opacity: 0.7 }} // Makes the black icon white for dark theme
              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              <img src="https://img.icons8.com/material-outlined/24/github.png" alt="github" width="22" height="22" />
            </a>
            
            {/* Linkedin */}
            <a 
              href={socialLinks.linkedin} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="transition-all hover-scale"
              style={{ filter: 'invert(1)', opacity: 0.7 }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              <img src="https://img.icons8.com/ios-glyphs/30/linkedin.png" alt="linkedin" width="24" height="24" />
            </a>

            {/* Instagram */}
            <a 
              href={socialLinks.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="transition-all hover-scale"
              style={{ filter: 'invert(1)', opacity: 0.7 }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              <img src="https://img.icons8.com/ios-glyphs/30/instagram-new.png" alt="instagram" width="24" height="24" />
            </a>
          </div>

        </div>
      </Container>
    </footer>
  );
};

export default Footer;