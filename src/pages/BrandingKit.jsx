import { useState } from 'react';
import Header from '../components/Header';

import '../pages/BrandingKit.css';

// Import all logo assets
// AI Files
import ai1 from '../assets/CODEXERO-LOGO2/1-AI/1.ai';
import ai1_1 from '../assets/CODEXERO-LOGO2/1-AI/1-1.ai';
import ai2 from '../assets/CODEXERO-LOGO2/1-AI/2.ai';
import ai2_1 from '../assets/CODEXERO-LOGO2/1-AI/2-1.ai';
import ai3 from '../assets/CODEXERO-LOGO2/1-AI/3.ai';
import ai3_1 from '../assets/CODEXERO-LOGO2/1-AI/3-1.ai';
import ai4 from '../assets/CODEXERO-LOGO2/1-AI/4.ai';
import ai4_1 from '../assets/CODEXERO-LOGO2/1-AI/4-1.ai';
import ai5 from '../assets/CODEXERO-LOGO2/1-AI/5.ai';
import ai5_1 from '../assets/CODEXERO-LOGO2/1-AI/5-1.ai';
import ai6 from '../assets/CODEXERO-LOGO2/1-AI/6.ai';
import ai6_1 from '../assets/CODEXERO-LOGO2/1-AI/6-1.ai';
import ai7 from '../assets/CODEXERO-LOGO2/1-AI/7.ai';
import ai7_1 from '../assets/CODEXERO-LOGO2/1-AI/7-1.ai';
import ai8 from '../assets/CODEXERO-LOGO2/1-AI/8.ai';
import ai8_1 from '../assets/CODEXERO-LOGO2/1-AI/8-1.ai';
import ai9 from '../assets/CODEXERO-LOGO2/1-AI/9.ai';
import ai9_1 from '../assets/CODEXERO-LOGO2/1-AI/9-1.ai';
import ai10 from '../assets/CODEXERO-LOGO2/1-AI/10.ai';
import ai10_1 from '../assets/CODEXERO-LOGO2/1-AI/10-1.ai';
import ai11 from '../assets/CODEXERO-LOGO2/1-AI/11.ai';
import ai11_1 from '../assets/CODEXERO-LOGO2/1-AI/11-1.ai';

// PNG Files
import png1 from '../assets/CODEXERO-LOGO2/3-PNG/1.png';
import png1_1 from '../assets/CODEXERO-LOGO2/3-PNG/1-1.png';
import png2 from '../assets/CODEXERO-LOGO2/3-PNG/2.png';
import png2_1 from '../assets/CODEXERO-LOGO2/3-PNG/2-1.png';
import png3 from '../assets/CODEXERO-LOGO2/3-PNG/3.png';
import png3_1 from '../assets/CODEXERO-LOGO2/3-PNG/3-1.png';
import png4 from '../assets/CODEXERO-LOGO2/3-PNG/4.png';
import png4_1 from '../assets/CODEXERO-LOGO2/3-PNG/4-1.png';
import png5 from '../assets/CODEXERO-LOGO2/3-PNG/5.png';
import png5_1 from '../assets/CODEXERO-LOGO2/3-PNG/5-1.png';
import png6 from '../assets/CODEXERO-LOGO2/3-PNG/6.png';
import png6_1 from '../assets/CODEXERO-LOGO2/3-PNG/6-1.png';
import png7 from '../assets/CODEXERO-LOGO2/3-PNG/7.png';
import png7_1 from '../assets/CODEXERO-LOGO2/3-PNG/7-1.png';
import png8 from '../assets/CODEXERO-LOGO2/3-PNG/8.png';
import png8_1 from '../assets/CODEXERO-LOGO2/3-PNG/8-1.png';
import png9 from '../assets/CODEXERO-LOGO2/3-PNG/9.png';
import png9_1 from '../assets/CODEXERO-LOGO2/3-PNG/9-1.png';
import png10 from '../assets/CODEXERO-LOGO2/3-PNG/10.png';
import png10_1 from '../assets/CODEXERO-LOGO2/3-PNG/10-1.png';
import png11 from '../assets/CODEXERO-LOGO2/3-PNG/11.png';
import png11_1 from '../assets/CODEXERO-LOGO2/3-PNG/11-1.png';

// JPEG Files
import jpg1 from '../assets/CODEXERO-LOGO2/4-JPEG/1.jpg';
import jpg1_1 from '../assets/CODEXERO-LOGO2/4-JPEG/1-1.jpg';
import jpg2 from '../assets/CODEXERO-LOGO2/4-JPEG/2.jpg';
import jpg2_1 from '../assets/CODEXERO-LOGO2/4-JPEG/2-1.jpg';
import jpg3 from '../assets/CODEXERO-LOGO2/4-JPEG/3.jpg';
import jpg3_1 from '../assets/CODEXERO-LOGO2/4-JPEG/3-1.jpg';
import jpg4 from '../assets/CODEXERO-LOGO2/4-JPEG/4.jpg';
import jpg4_1 from '../assets/CODEXERO-LOGO2/4-JPEG/4-1.jpg';
import jpg5 from '../assets/CODEXERO-LOGO2/4-JPEG/5.jpg';
import jpg5_1 from '../assets/CODEXERO-LOGO2/4-JPEG/5-1.jpg';
import jpg6 from '../assets/CODEXERO-LOGO2/4-JPEG/6.jpg';
import jpg6_1 from '../assets/CODEXERO-LOGO2/4-JPEG/6-1.jpg';
import jpg7 from '../assets/CODEXERO-LOGO2/4-JPEG/7.jpg';
import jpg7_1 from '../assets/CODEXERO-LOGO2/4-JPEG/7-1.jpg';
import jpg8 from '../assets/CODEXERO-LOGO2/4-JPEG/8.jpg';
import jpg8_1 from '../assets/CODEXERO-LOGO2/4-JPEG/8-1.jpg';
import jpg9 from '../assets/CODEXERO-LOGO2/4-JPEG/9.jpg';
import jpg9_1 from '../assets/CODEXERO-LOGO2/4-JPEG/9-1.jpg';
import jpg10 from '../assets/CODEXERO-LOGO2/4-JPEG/10.jpg';
import jpg10_1 from '../assets/CODEXERO-LOGO2/4-JPEG/10-1.jpg';
import jpg11 from '../assets/CODEXERO-LOGO2/4-JPEG/11.jpg';
import jpg11_1 from '../assets/CODEXERO-LOGO2/4-JPEG/11-1.jpg';

// SVG Files
import svg1 from '../assets/CODEXERO-LOGO2/5-SVG/LOGO-1.svg';
import svg2 from '../assets/CODEXERO-LOGO2/5-SVG/LOGO-2.svg';
import svg3 from '../assets/CODEXERO-LOGO2/5-SVG/LOGO.svg';

// Pattern Files
import pattern1_ai from '../assets/CODEXERO-LOGO2/7-PATTERNS/P1.ai';
import pattern1_jpg from '../assets/CODEXERO-LOGO2/7-PATTERNS/P1.jpg';
import pattern2_ai from '../assets/CODEXERO-LOGO2/7-PATTERNS/P2.ai';
import pattern2_jpg from '../assets/CODEXERO-LOGO2/7-PATTERNS/P2.jpg';
import pattern3_ai from '../assets/CODEXERO-LOGO2/7-PATTERNS/P3.ai';
import pattern3_jpg from '../assets/CODEXERO-LOGO2/7-PATTERNS/P3.jpg';
import pattern4_ai from '../assets/CODEXERO-LOGO2/7-PATTERNS/P4.ai';
import pattern4_jpg from '../assets/CODEXERO-LOGO2/7-PATTERNS/P4.jpg';
import pattern5_ai from '../assets/CODEXERO-LOGO2/7-PATTERNS/P5.ai';
import pattern5_jpg from '../assets/CODEXERO-LOGO2/7-PATTERNS/P5.jpg';
import pattern6_ai from '../assets/CODEXERO-LOGO2/7-PATTERNS/P6.ai';
import pattern6_jpg from '../assets/CODEXERO-LOGO2/7-PATTERNS/P6.jpg';

// Banner Files
import banner1 from '../assets/CODEXERO-LOGO2/8-BANNER/1128X376.jpg';
import banner2 from '../assets/CODEXERO-LOGO2/8-BANNER/1500X500.jpg';
import banner3 from '../assets/CODEXERO-LOGO2/8-BANNER/820X312.jpg';
import banner4 from '../assets/CODEXERO-LOGO2/8-BANNER/HIGH RESO.jpg';
import { WaitlistModal } from './HomePage';

export default function BrandingKit() {
  const [activeTab, setActiveTab] = useState('logos');
  const [selectedImage, setSelectedImage] = useState(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const logoVariations = [
    { name: 'Logo 1', png: png1, jpg: jpg1, ai: ai1 },
    { name: 'Logo 1-1', png: png1_1, jpg: jpg1_1, ai: ai1_1 },
    { name: 'Logo 2', png: png2, jpg: jpg2, ai: ai2 },
    { name: 'Logo 2-1', png: png2_1, jpg: jpg2_1, ai: ai2_1 },
    { name: 'Logo 3', png: png3, jpg: jpg3, ai: ai3 },
    { name: 'Logo 3-1', png: png3_1, jpg: jpg3_1, ai: ai3_1 },
    { name: 'Logo 4', png: png4, jpg: jpg4, ai: ai4 },
    { name: 'Logo 4-1', png: png4_1, jpg: jpg4_1, ai: ai4_1 },
    { name: 'Logo 5', png: png5, jpg: jpg5, ai: ai5 },
    { name: 'Logo 5-1', png: png5_1, jpg: jpg5_1, ai: ai5_1 },
    { name: 'Logo 6', png: png6, jpg: jpg6, ai: ai6 },
    { name: 'Logo 6-1', png: png6_1, jpg: jpg6_1, ai: ai6_1 },
    { name: 'Logo 7', png: png7, jpg: jpg7, ai: ai7 },
    { name: 'Logo 7-1', png: png7_1, jpg: jpg7_1, ai: ai7_1 },
    { name: 'Logo 8', png: png8, jpg: jpg8, ai: ai8 },
    { name: 'Logo 8-1', png: png8_1, jpg: jpg8_1, ai: ai8_1 },
    { name: 'Logo 9', png: png9, jpg: jpg9, ai: ai9 },
    { name: 'Logo 9-1', png: png9_1, jpg: jpg9_1, ai: ai9_1 },
    { name: 'Logo 10', png: png10, jpg: jpg10, ai: ai10 },
    { name: 'Logo 10-1', png: png10_1, jpg: jpg10_1, ai: ai10_1 },
    { name: 'Logo 11', png: png11, jpg: jpg11, ai: ai11 },
    { name: 'Logo 11-1', png: png11_1, jpg: jpg11_1, ai: ai11_1 },
  ];

  const svgLogos = [
    { name: 'SVG Logo 1', src: svg1 },
    { name: 'SVG Logo 2', src: svg2 },
    { name: 'SVG Logo 3', src: svg3 },
  ];

  const patterns = [
    { name: 'Pattern 1', ai: pattern1_ai, jpg: pattern1_jpg },
    { name: 'Pattern 2', ai: pattern2_ai, jpg: pattern2_jpg },
    { name: 'Pattern 3', ai: pattern3_ai, jpg: pattern3_jpg },
    { name: 'Pattern 4', ai: pattern4_ai, jpg: pattern4_jpg },
    { name: 'Pattern 5', ai: pattern5_ai, jpg: pattern5_jpg },
    { name: 'Pattern 6', ai: pattern6_ai, jpg: pattern6_jpg },
  ];

  const banners = [
    { name: 'Banner 1128x376', src: banner1, dimensions: '1128 × 376' },
    { name: 'Banner 1500x500', src: banner2, dimensions: '1500 × 500' },
    { name: 'Banner 820x312', src: banner3, dimensions: '820 × 312' },
    { name: 'High Resolution Banner', src: banner4, dimensions: 'High Res' },
  ];

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ImageModal = ({ image, onClose }) => {
    if (!image) return null;

    return (
      <div className="image-modal-overlay" onClick={onClose}>
        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={onClose}>×</button>
          <img src={image.src} alt={image.name} className="modal-image" />
          <div className="modal-info">
            <h3>{image.name}</h3>
            <p>Format: {image.format || 'Image'}</p>
            {image.dimensions && <p>Dimensions: {image.dimensions}</p>}
            <button 
              className="download-btn"
              onClick={() => downloadFile(image.src, `${image.name}.${image.format || 'png'}`)}
            >
              Download
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="branding-kit-page">
      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
      <Header onWaitlistOpen={() => setWaitlistOpen(true)} showWaitlistButton={true} />
      
      <div className="branding-kit-container">
        <div className="branding-kit-header">
          <h1 className="branding-kit-title">CodeXero Branding Kit</h1>
          <p className="branding-kit-subtitle">
            Professional logo assets, patterns, and marketing materials for the CodeXero ecosystem
          </p>
        </div>

        <div className="branding-kit-tabs">
          <button 
            className={`tab-btn ${activeTab === 'logos' ? 'active' : ''}`}
            onClick={() => setActiveTab('logos')}
          >
            Logo Variations
          </button>
          <button 
            className={`tab-btn ${activeTab === 'svg' ? 'active' : ''}`}
            onClick={() => setActiveTab('svg')}
          >
            SVG Logos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'patterns' ? 'active' : ''}`}
            onClick={() => setActiveTab('patterns')}
          >
            Patterns
          </button>
          <button 
            className={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            Banners
          </button>
        </div>

        <div className="branding-kit-content">
          {activeTab === 'logos' && (
            <div className="logos-section">
              <h2>Logo Variations</h2>
              <p className="section-description">
                22 unique logo variations available in PNG, JPEG, and AI formats
              </p>
              <div className="logos-grid">
                {logoVariations.map((logo, index) => (
                  <div key={index} className="logo-card">
                    <div className="logo-preview">
                      <img src={logo.png} alt={logo.name} />
                    </div>
                    <div className="logo-info">
                      <h3>{logo.name}</h3>
                      <div className="format-buttons">
                        <button 
                          className="format-btn png"
                          onClick={() => downloadFile(logo.png, `${logo.name}.png`)}
                        >
                          PNG
                        </button>
                        <button 
                          className="format-btn jpg"
                          onClick={() => downloadFile(logo.jpg, `${logo.name}.jpg`)}
                        >
                          JPEG
                        </button>
                        <button 
                          className="format-btn ai"
                          onClick={() => downloadFile(logo.ai, `${logo.name}.ai`)}
                        >
                          AI
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'svg' && (
            <div className="svg-section">
              <h2>SVG Logos</h2>
              <p className="section-description">
                Scalable vector graphics perfect for web and print applications
              </p>
              <div className="svg-grid">
                {svgLogos.map((logo, index) => (
                  <div key={index} className="svg-card">
                    <div className="svg-preview">
                      <img src={logo.src} alt={logo.name} />
                    </div>
                    <div className="svg-info">
                      <h3>{logo.name}</h3>
                      <button 
                        className="download-btn svg"
                        onClick={() => downloadFile(logo.src, `${logo.name}.svg`)}
                      >
                        Download SVG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="patterns-section">
              <h2>Patterns</h2>
              <p className="section-description">
                Background patterns and textures for design applications
              </p>
              <div className="patterns-grid">
                {patterns.map((pattern, index) => (
                  <div key={index} className="pattern-card">
                    <div className="pattern-preview">
                      <img src={pattern.jpg} alt={pattern.name} />
                    </div>
                    <div className="pattern-info">
                      <h3>{pattern.name}</h3>
                      <div className="format-buttons">
                        <button 
                          className="format-btn jpg"
                          onClick={() => downloadFile(pattern.jpg, `${pattern.name}.jpg`)}
                        >
                          JPEG
                        </button>
                        <button 
                          className="format-btn ai"
                          onClick={() => downloadFile(pattern.ai, `${pattern.name}.ai`)}
                        >
                          AI
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="banners-section">
              <h2>Marketing Banners</h2>
              <p className="section-description">
                Ready-to-use banners for social media and marketing campaigns
              </p>
              <div className="banners-grid">
                {banners.map((banner, index) => (
                  <div key={index} className="banner-card">
                    <div className="banner-preview">
                      <img 
                        src={banner.src} 
                        alt={banner.name}
                        onClick={() => setSelectedImage({...banner, format: 'jpg'})}
                      />
                    </div>
                    <div className="banner-info">
                      <h3>{banner.name}</h3>
                      <p className="banner-dimensions">{banner.dimensions}</p>
                      <button 
                        className="download-btn banner"
                        onClick={() => downloadFile(banner.src, `${banner.name}.jpg`)}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="branding-guidelines">
          <h2>Brand Guidelines</h2>
          <div className="guidelines-grid">
            <div className="guideline-card">
              <h3>Usage Rights</h3>
              <p>These assets are provided for official CodeXero marketing and promotional use only.</p>
            </div>
            <div className="guideline-card">
              <h3>Format Recommendations</h3>
              <p>Use PNG for web, JPEG for photos, SVG for scalable graphics, and AI for print design.</p>
            </div>
            <div className="guideline-card">
              <h3>Color Consistency</h3>
              <p>Maintain brand color consistency across all applications and platforms.</p>
            </div>
            <div className="guideline-card">
              <h3>Minimum Size</h3>
              <p>Ensure logos maintain readability at minimum 24px height for digital use.</p>
            </div>
          </div>
        </div>
      </div>

      <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
