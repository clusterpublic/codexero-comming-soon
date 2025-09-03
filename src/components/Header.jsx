import logo from '../assets/logo.png';
import ConnectWallet from './ConnectWallet';

export default function Header({ onWaitlistOpen, showWaitlistButton = true, className = "" }) {
  return (
    <header className={`header ${className}`}>
      <div className="logo">
        <div className="logo-animated-container">
          <img src={logo} alt="CodeZero" className="logo-img-animated" />
          <div className="bounce-wave"></div>
          <span className="logo-text">CodeXero</span>
        </div>
      </div>
      <nav className="nav">
        <ConnectWallet />
        {showWaitlistButton && onWaitlistOpen && (
          <button className="get-started-btn" onClick={onWaitlistOpen}>
            Get Early Access
          </button>
        )}
      </nav>
    </header>
  );
}
