import { useState, useEffect, useRef } from 'react';
import '../App.css';
import logo from '../assets/logo.png';
import { supabase } from '../supabase';
import Confetti from '../Confetti';
import seiLogo from "../assets/sei_red_and_white.svg"
import Header from '../components/Header';



function LoadingScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const messages = [
    'INITIALIZING BLOCKCHAIN PROTOCOL...',
    'CONNECTING TO SEI NETWORK...',
    'LOADING SMART CONTRACTS...',
    'VERIFYING SECURITY LAYERS...',
    'CODEXERO READY TO DEPLOY',
  ];
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        let next = prev + Math.random() * 12 + 2;
        if (next > 100) next = 100;
        return next;
      });
    }, 200); // Increased from 200ms to 400ms
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        onFinish();
      }, 1500);
    }
    // Switch messages
    if (progress > (currentMessage + 1) * 20 && currentMessage < messages.length - 1) {
      setCurrentMessage(currentMessage + 1);
    }
  }, [progress, currentMessage, messages.length, onFinish]);

  // Particle effect
  useEffect(() => {
    const container = document.querySelector('.loading-particles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 4 + 's';
      particle.style.animationDuration = Math.random() * 3 + 2 + 's';
      container.appendChild(particle);
    }
  }, []);

  return (
    <div id="loading-overlay" className="loading-overlay" style={{ opacity: progress >= 100 ? 0 : 1, pointerEvents: progress >= 100 ? 'none' : 'auto', display: progress >= 100 ? 'none' : 'flex' }}>
      <div className="loading-content">
        <div className="logo-loading">
          <img src={logo} alt="CodeZero" className="loading-logo" />
          <div className="loading-pulse"></div>
        </div>
        <div className="loading-text">
          {messages.map((msg, i) => (
            <div key={i} className={`system-message${i === currentMessage ? ' active' : ''}`}>{msg}</div>
          ))}
        </div>
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            <div className="progress-glitch"></div>
          </div>
          <div className="progress-percentage">{Math.floor(progress)}%</div>
        </div>
        <div className="loading-particles"></div>
      </div>
    </div>
  );
}

function WaitlistModal({ open, onClose }) {
  const [counter, setCounter] = useState(950);
  const [animating, setAnimating] = useState(false);
  const [formState, setFormState] = useState('idle'); // idle | securing | secured
  const [email, setEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [errors, setErrors] = useState({});
  const inputRef = useRef();
  const inputRef2 = useRef();

  // Wallet address validation function
  const validateWalletAddress = (address) => {
    if (!address) return 'Wallet address is required';

    // Remove spaces and convert to lowercase
    const cleanAddress = address.trim();

    // Check for Ethereum format: 0x followed by exactly 40 hex characters
    if (!cleanAddress.startsWith('0x')) {
      return 'Wallet address must start with 0x';
    }

    if (cleanAddress.length !== 42) {
      return 'Wallet address must be exactly 42 characters (0x + 40 hex characters)';
    }

    // Check if it contains only valid hex characters after 0x
    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      return 'Wallet address must contain only hexadecimal characters (0-9, a-f, A-F)';
    }

    return null; // No error
  };

  // Email validation function
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return null;
  };

  useEffect(() => {
    async function fetchTotalSubscriptions() {
      const { count, error } = await supabase
        .from('waitlist_subscriptions')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching total subscriptions:', error);
        return;
      }

      setAnimating(true);
      let start = 0;
      let end = 300 + count;
      let duration = 2000;
      let startTime = Date.now();
      function update() {
        let elapsed = Date.now() - startTime;
        let progress = Math.min(elapsed / duration, 1);
        let value = Math.floor(start - (start - end) * progress);
        setCounter(value);
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          setTimeout(() => {
            const urgency = document.querySelector('.counter-urgency');
            if (urgency) urgency.style.animation = 'urgencyPulse 2s infinite';
          }, 500);
        }
      }
      update();

    }

    fetchTotalSubscriptions()

  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate inputs
    const emailError = validateEmail(email);
    const walletError = validateWalletAddress(walletAddress);

    if (emailError || walletError) {
      setErrors({
        email: emailError,
        walletAddress: walletError
      });
      return;
    }

    setFormState('securing');

    try {
      // First check if email or wallet is already subscribed
      const { data: existingSubscriptions, error: checkError } = await supabase
        .from('waitlist_subscriptions')
        .select('email, walletaddress')
        .or(`email.eq.${email},walletaddress.eq.${walletAddress}`);

      if (checkError) {
        console.error('Error checking existing subscriptions:', checkError);
        setFormState('idle');
        return;
      }

      // Check if already subscribed
      if (existingSubscriptions && existingSubscriptions.length > 0) {
        const existingEmail = existingSubscriptions.find(sub => sub.email === email);
        const existingWallet = existingSubscriptions.find(sub => sub.walletaddress === walletAddress);

        let errorMessage = '';
        if (existingEmail && existingWallet) {
          errorMessage = 'Both email and wallet address are already subscribed!';
        } else if (existingEmail) {
          errorMessage = 'This email address is already subscribed!';
        } else if (existingWallet) {
          errorMessage = 'This wallet address is already subscribed!';
        }

        setErrors({
          general: errorMessage
        });
        setFormState('idle');
        return;
      }

      // Save to Supabase if not already subscribed
      const { data, error } = await supabase
        .from('waitlist_subscriptions')
        .insert([
          {
            email: email,
            walletaddress: walletAddress,
            subscribed_at: new Date().toISOString(),
            status: 'active'
          }
        ]);

      if (error) {
        console.error('Error saving subscription:', error);
        setFormState('idle');
        return;
      }

      // Success - show secured message and trigger confetti
      setFormState('secured');
      setShowConfetti(true);

      // Update counter by 1 after successful subscription
      setCounter(prevCounter => prevCounter + 1);

      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setFormState('idle');
          setEmail('');
          setWalletAddress('');
          setShowConfetti(false);
          setErrors({});
          if (inputRef.current) inputRef.current.value = '';
        }, 1000);
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      setFormState('idle');
    }
  }

  // Clear errors when modal closes
  const handleClose = () => {
    setErrors({});
    setEmail('');
    setWalletAddress('');
    setFormState('idle');
    setShowConfetti(false);
    onClose();
  };

  if (!open) return null;
  return (
    <div id="waitlist-modal" className="waitlist-modal">
      <Confetti trigger={showConfetti} />
      <div className="modal-backdrop" onClick={handleClose}></div>
      <div className="modal-content">
        <button className="modal-close" onClick={handleClose}>&times;</button>
        <div className="exclusive-badge">
          <span className="badge-text">EXCLUSIVE</span>
          <div className="badge-glow"></div>
        </div>
        <h2 className="modal-title">Be Among The First 1000</h2>
        <p className="modal-subtitle">Join the elite early access list for CodeXero</p>
        <div className="spots-counter">
          <div className="counter-value">
            <span className="counter-number">{counter}</span>
            <span className="counter-total">/ 1000</span>
          </div>
          <div className="counter-label">Spots Remaining</div>
          <div className="counter-urgency">Only {1000 - counter} left!</div>
        </div>
        <div className="vip-benefits">
          <h3>VIP Early Bird Benefits:</h3>
          <ul className="benefits-list">
            <li>🚀 First access to all features</li>
            <li>🎯 Priority customer support</li>
            <li>🏆 Founder badge & special role</li>
          </ul>
        </div>
        <form className="waitlist-form" onSubmit={handleSubmit}>
          {/* General error message */}
          {errors.general && (
            <div className="general-error-message">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <input
              ref={inputRef}
              type="email"
              placeholder="Enter your email address"
              className={`email-input ${errors.email ? 'error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <div className="error-message">{errors.email}</div>}

            <input
              type="text"
              placeholder="Enter your SEI wallet address"
              className={`email-input ${errors.walletAddress ? 'error' : ''}`}
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              required
            />
            {errors.walletAddress && <div className="error-message">{errors.walletAddress}</div>}

            <button type="submit" className="join-waitlist-btn" disabled={formState !== 'idle'} style={formState === 'secured' ? { background: 'linear-gradient(45deg, #4CAF50, #45a049)' } : {}}>
              <span className="btn-text">
                {formState === 'idle' && 'SECURE MY SPOT'}
                {formState === 'securing' && 'SECURING...'}
                {formState === 'secured' && 'SPOT SECURED! ✓'}
              </span>
              <div className="btn-glow"></div>
            </button>
          </div>
          <p className="form-note">We'll never spam you. One-click unsubscribe.</p>
        </form>
      </div>
    </div>
  );
}

function HomePage() {
  const [loading, setLoading] = useState(true);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  // Glitch effect
  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        const glitchElements = document.querySelectorAll('.wave-letter, .glass-tag');
        const randomElement = glitchElements[Math.floor(Math.random() * glitchElements.length)];
        if (randomElement && Math.random() < 0.05) {
          randomElement.style.filter = 'blur(1px) brightness(1.5)';
          randomElement.style.transform += ' skew(2deg)';
          setTimeout(() => {
            randomElement.style.filter = '';
            randomElement.style.transform = randomElement.style.transform.replace(' skew(2deg)', '');
          }, 50);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className="container1">
        {loading && <LoadingScreen onFinish={() => setLoading(false)} />}
        <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
        {/* Header */}
        <Header onWaitlistOpen={() => setWaitlistOpen(true)} showWaitlistButton={true} />
        {/* Main Content */}
        <main className="hero">
          <div className="hero-content">
            {/* Background Text */}
            <div className="bg-text">CODEXERO</div>
            {/* 3D Logo Container */}
            <div className="logo-3d-container">
              <div className="spotlight-beam"></div>
              <div className="logo-3d-wrapper">
                <img src={logo} alt="CodeXero Logo" className="main-logo" />
              </div>
            </div>
            {/* Main Content */}
            <div className="main-content">
              <h1 className="main-title wave-text">
                <span className="wave-letter">C</span>
                <span className="wave-letter">o</span>
                <span className="wave-letter">d</span>
                <span className="wave-letter">e</span>
                <span className="wave-letter">X</span>
                <span className="wave-letter">e</span>
                <span className="wave-letter">r</span>
                <span className="wave-letter">o</span>
                <span className="wave-space"> </span>
                <span className="wave-letter">i</span>
                <span className="wave-letter">s</span>
                <span className="wave-space"> </span>
                <span className="wave-letter">C</span>
                <span className="wave-letter">o</span>
                <span className="wave-letter">m</span>
                <span className="wave-letter">i</span>
                <span className="wave-letter">n</span>
                <span className="wave-letter">g</span>
                <span className="wave-letter">.</span>
              </h1>
              <p className="subtitle">On <img src={seiLogo} alt="Sei" className="sei-logo" /> ICM moves faster.</p>
              {/* Flipping Glass Tags Section */}
              <div className="tags-inline">
                <div className="tag-container-inline">
                  <div className="left-tags">
                    <div className="tag glass-tag">
                      <div className="flip-text">
                        <span className="flip-word active">DEX</span>
                        <span className="flip-word">DeFi</span>
                        <span className="flip-word">Swap</span>
                        <span className="flip-word">Liquidity</span>
                        <span className="flip-word">Staking</span>
                        <span className="flip-word">Data Feeds</span>
                      </div>
                    </div>
                    <div className="tag glass-tag">
                      <div className="flip-text">
                        <span className="flip-word active">NFTs</span>
                        <span className="flip-word">Collectibles</span>
                        <span className="flip-word">Minting</span>
                        <span className="flip-word">DAO</span>
                        <span className="flip-word">Treasury</span>
                        <span className="flip-word">Smart Contracts</span>
                      </div>
                    </div>
                    <div className="tag glass-tag">
                      <div className="flip-text">
                        <span className="flip-word active">Payments</span>
                        <span className="flip-word">Wallet</span>
                        <span className="flip-word">Cross-chain</span>
                        <span className="flip-word">Voting</span>
                        <span className="flip-word">Yield</span>
                        <span className="flip-word">Chainlink</span>

                      </div>
                    </div>
                    <div className="tag glass-tag">
                      <div className="flip-text">
                        <span className="flip-word active">GameFi</span>
                        <span className="flip-word">Community</span>
                        <span className="flip-word">Play-to-Earn</span>
                        <span className="flip-word">Rewards</span>
                        <span className="flip-word">Oracles</span>
                        <span className="flip-word active">Stablecoins</span>
                      </div>
                    </div>
                  </div>
                  {/* <div className="next-arrow glass-arrow">
                  Next
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div> */}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Hall of Dapp Section */}
        {/* <HallOfDapp /> */}


        {/* Toast Notifications - Now handled in main.jsx */}
      </div>
    </div>
  );
}

export default HomePage;
