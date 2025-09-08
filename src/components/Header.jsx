import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import ConnectWallet from './ConnectWallet';

export default function Header({ onWaitlistOpen, showWaitlistButton = true, className = "" }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleBrandKitClick = () => {
    navigate('/brand-kit');
    setIsMenuOpen(false);
  };

  const handleEarlyAccessClick = () => {
    onWaitlistOpen();
    setIsMenuOpen(false);
  };

  const handleTwitterClick = () => {
    window.open('https://x.com/codexero_xyz', '_blank');
    setIsMenuOpen(false);
  };

  return (
    <header className={`header ${className}`}>
      {/* Left Side - Logo */}
      <div className="logo">
        <div className="logo-animated-container" onClick={()=>navigate("/")}>
          <img src={logo} alt="CodeZero" className="logo-img-animated" />
          <div className="bounce-wave"></div>
          <span className="logo-text">CodeXero</span>
        </div>
      </div> 
      
      {/* Right Side - Navigation */}
      <div className="nav-container">
        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="nav hidden md:flex">
          {showWaitlistButton && onWaitlistOpen && (
            <button className="get-started-btn" onClick={onWaitlistOpen}>
              Get Early Access
            </button>
          )}
          <button className="get-started-btn" onClick={() => navigate('/brand-kit')}>
            Brand Kit
          </button>
          <button 
            className="get-started-btn flex items-center gap-2" 
            onClick={handleTwitterClick} 
            title="Follow us on Twitter"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="hidden sm:inline">Twitter</span>
          </button>
        </nav>

        {/* Mobile Hamburger Menu - Hidden on desktop */}
        <div className="md:hidden relative">
          {/* Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-orange-200/30 hover:bg-white/20 transition-all duration-300"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 bg-orange-500 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
              <span className={`block w-5 h-0.5 bg-orange-500 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`block w-5 h-0.5 bg-orange-500 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
            </div>
          </button>

          {/* Mobile Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl border border-orange-200/30 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300">
              <div className="p-4 space-y-3">
                {/* Get Early Access Button */}
                {showWaitlistButton && onWaitlistOpen && (
                  <button
                    onClick={handleEarlyAccessClick}
                    className="get-started-btn w-full"
                  >
                    🚀 Get Early Access
                  </button>
                )}
                
                {/* Brand Kit Button */}
                <button
                  onClick={handleBrandKitClick}
                  className="get-started-btn w-full"
                >
                  🎨 Brand Kit
                </button>

                {/* Twitter Button */}
                <button
                  onClick={handleTwitterClick}
                  className="get-started-btn w-full flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}