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

  return (
    <header className={`header ${className}`}>
      <div className="logo">
        <div className="logo-animated-container" onClick={()=>navigate("/")}>
          <img src={logo} alt="CodeZero" className="logo-img-animated" />
          <div className="bounce-wave"></div>
          <span className="logo-text">CodeXero</span>
        </div>
      </div>
      
      {/* Desktop Navigation */}
      <nav className="nav hidden md:flex">
        {/* <ConnectWallet /> */}
        {showWaitlistButton && onWaitlistOpen && (
          <button className="get-started-btn" onClick={onWaitlistOpen}>
            Get Early Access
          </button>
        )}
        <button className="get-started-btn" onClick={() => navigate('/brand-kit')}>
          Brand Kit
        </button>
      </nav>

      {/* Mobile Hamburger Menu */}
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
              {/* Connect Wallet Button */}
              {/* <div className="pb-3 border-b border-orange-100">
                <ConnectWallet />
              </div> */}
              
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
            </div>
          </div>
        )}
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
