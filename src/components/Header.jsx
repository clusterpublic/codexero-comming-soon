import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import ConnectWallet from "./ConnectWallet";
import PillNav from "./three/PillNav";

export default function Header({
  onWaitlistOpen,
  showWaitlistButton = true,
  className = "",
}) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleBrandKitClick = () => {
    navigate("/brand-kit");
    setIsMenuOpen(false);
  };

  const handleEarlyAccessClick = () => {
    onWaitlistOpen();
    setIsMenuOpen(false);
  };

  const handleTwitterClick = () => {
    window.open("https://x.com/codexero_xyz", "_blank");
    setIsMenuOpen(false);
  };

  return (
    <header className={`header ${className}`}>
      {/* Left Side - Logo */}
      <div className="logo">
        <div className="logo-animated-container" onClick={() => navigate("/")}>
          <img src={logo} alt="CodeZero" className="logo-img-animated" />
          <div className="bounce-wave"></div>
          <span className="logo-text">CodeXero</span>
        </div>
      </div>

      {/* Right Side - Navigation */}
      <div className="nav-container flex items-center justify-end">
        {/* Desktop Navigation - Hidden on mobile */}
        {/* <nav className="nav hidden md:flex"> */}
        {/* {showWaitlistButton && onWaitlistOpen && (
            <button className="get-started-btn" onClick={onWaitlistOpen}>
              Get Early Access
            </button>
          )}
          <button
            className="get-started-btn"
            onClick={() => navigate("/brand-kit")}
          >
            Brand Kit
          </button>
          <button
            className="get-started-btn flex items-center gap-2"
            onClick={handleTwitterClick}
            title="Follow us on Twitter"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="hidden sm:inline">Twitter</span>
          </button> */}

        <PillNav
          items={[
            {
              label: "  Get Early Access",
              onClick: () => {
                if (onWaitlistOpen && showWaitlistButton) {
                  handleEarlyAccessClick();
                }
              },
            },
            {
              label: "Brand Kit",
              onClick: () => {
                handleBrandKitClick();
                // Add your custom logic here
              },
            },
            {
              label: "Twitter",
              onClick: () => {
                handleTwitterClick();
                // Add your custom logic here
              },
            },
          ]}
          activeHref="home"
          className="custom-nav"
          ease="power2.easeOut"
          initialLoadAnimation={false}
          baseColor="#000000"
          pillColor="#ffffff"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#000000"
        />
        {/* </nav> */}
      </div>


    </header>
  );
}
