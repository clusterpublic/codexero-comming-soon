import { useState, useEffect } from 'react'
import Slider from 'react-slick'
import { motion } from 'framer-motion'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import './App.css'

// Custom component for word-by-word animation
const AnimatedText = ({ text, className, delay = 0, staggerDelay = 0.1 }) => {
  const words = text.split(' ');

  return (
    <motion.div 
      className={className}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { 
              opacity: 0, 
              y: 20,
              scale: 0.8
            },
            visible: { 
              opacity: 1, 
              y: 0,
              scale: 1,
              transition: {
                duration: 0.6,
                ease: "easeOut",
                delay: delay + (index * staggerDelay)
              }
            }
          }}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

function App() {
  // Sample data for the slider - you can replace with your actual images and names
  const slides = [
    {
      id: 1,
      name: "SEI Blockchain Diagram Generator",
      desc:"Create professional blockchain ecosystem diagrams with interactive canvas",
      image: "https://i.imghippo.com/files/me3987HW.png"
    },
    {
      id: 2,
      name: "Hot Take Card Builder",
      desc:"Transform your spiciest takes into premium, flex-worthy cards for X",
      image: "https://i.imghippo.com/files/glTn8910PLA.png"
    },
    {
      id: 3,
      name: "Decentralized Prediction Markets",
      desc:"Trade on the outcome of real-world events. Create markets, place bets, and earn rewards in a trustless environment.",
      image: "https://i.imghippo.com/files/biK2811Ieg.png"
    },
    {
      id: 4,
      name: "Launch Your Meme To The Moon! 🌙",
      desc:"Create memecoins in seconds. Graduate at 1K SEI. Auto-list on DragonSwap. 100% fair launch, 100% memes, 100% gains!",
      image: "https://i.imghippo.com/files/Ses2568AE.png"
    }
  ];

  // Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          dots: true,
          arrows: false
        }
      }
    ]
  };

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.8,
        delayChildren: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  // Calculate when all text animations will be complete
  const getTextAnimationDuration = (text, staggerDelay) => {
    const wordCount = text.split(' ').length;
    return (wordCount - 1) * staggerDelay + 0.6; // 0.6s is the duration of each word animation
  };

  const taglineDuration = getTextAnimationDuration("Our Innovation, Your Success", 0.1);
  const titleDuration = getTextAnimationDuration("Revolutionary Platform Coming Soon", 0.15);
  const descriptionDuration = getTextAnimationDuration("We're building something incredible that will transform the way you work. Stay tuned for the launch of our revolutionary platform.", 0.08);

  // Total time for all text animations
  const totalTextTime = 0.5 + taglineDuration + 0.8 + titleDuration + 0.8 + descriptionDuration;

  return (
    <div className="app">
      {/* Header Section */}
      <header className="header">
        <div className="header-content">
          <div className="logo">CodeXero</div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="action-buttons">
            <button className="btn-secondary">Connect Wallet</button>
            <button className="btn-primary">Get Started</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="hero-content">
          <motion.h2 
            className="tagline"
            variants={itemVariants}
          >
            OUR INNOVATION, YOUR SUCCESS
          </motion.h2>
          
          <motion.div className="main-title">
            <AnimatedText 
              text="Revolutionary Platform"
              variants={itemVariants}
            />
            <AnimatedText 
              text="Coming Soon"
              variants={itemVariants}
              className="highlight"
            />
          </motion.div>
          
          <motion.p 
            className="description"
            variants={itemVariants}
          >
            We're building something incredible that will revolutionize the way you interact with technology. Get ready for the future.
          </motion.p>

          {/* Carousel Section */}
          <motion.div 
            className="carousel-section"
            variants={itemVariants}
          >
            <Slider {...settings}>
              {slides.map((slide) => (
                <div key={slide.id} className="carousel-slide">
                  <div className="slide-image">
                    <img src={slide.image} alt={slide.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  </div>
                  <div className="slide-name">{slide.name}</div>
                  <div className="slide-desc">{slide.desc}</div>
                </div>
              ))}
            </Slider>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="cta-section"
            variants={itemVariants}
          >
            <h3 className="cta-title">Get Notified When We Launch</h3>
            <div className="email-signup">
              <div className="input-container">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="email-input"
                />
                <button className="notify-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="send-icon">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </div>
            <p className="signup-text">Be the first to know when we launch!</p>
          </motion.div>
        </div>
      </main>

      {/* Footer Section */}
      <motion.footer 
        className="footer"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: totalTextTime + 2.1, duration: 0.8 }}
      >
        <div className="footer-content">
          <div className="social-section">
            <span className="social-label">Follow Us</span>
            <div className="social-icons">
              <a href="#" className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="social-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
        </a>
      </div>
          </div>
        </div>
      </motion.footer>

      {/* Dynamic Web3 Background Animation */}
      <motion.div 
        className="web3-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4, duration: 1.5 }}
      >
        {/* Web3 Tech Icons - Continuous Stream */}
        <motion.div 
          className="web3-icon tech-1"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, -400, -600, -800], 
            y: [0, -300, -400, -500]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.5,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>BLOCKCHAIN</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-2"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, 400, 600, 800], 
            y: [0, -300, -400, -500]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.5,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>SMART CONTRACTS</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-3"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, -500, -700, -900], 
            y: [0, 200, 300, 400]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.5,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <span>DEFI</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-4"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, 500, 700, 900], 
            y: [0, 200, 300, 400]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.5,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>NFT</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-5"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, 0, 0, 0], 
            y: [0, -500, -700, -900]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.5,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>DAO</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-6"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, 0, 0, 0], 
            y: [0, 500, 700, 900]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.5,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>WEB3</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-7"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, -300, -500, -700], 
            y: [0, 0, 0, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.5,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <span>CRYPTO</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-8"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, 300, 500, 700], 
            y: [0, 0, 0, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.5,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>METAVERSE</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-9"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, -200, -400, -600], 
            y: [0, -200, -300, -400]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.5,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>AI</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-10"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, 200, 400, 600], 
            y: [0, -200, -300, -400]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.5,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>GAMING</span>
        </motion.div>

        {/* Additional Web3 Elements - Second Wave */}
        <motion.div 
          className="web3-icon tech-11"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, -150, -350, -550], 
            y: [0, 150, 250, 350]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 1,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <span>TOKENS</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-12"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, 150, 350, 550], 
            y: [0, 150, 250, 350]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 1,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>MINING</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-13"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, -400, -600, -800], 
            y: [0, 0, 0, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 1,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>STAKING</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-14"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, 400, 600, 800], 
            y: [0, 0, 0, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 1,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>YIELD</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-15"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, 0, 0, 0], 
            y: [0, -400, -600, -800]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 1,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <span>LIQUIDITY</span>
        </motion.div>

        {/* Additional Icons to reach 20 total */}
        <motion.div 
          className="web3-icon tech-16"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, -250, -450, -650], 
            y: [0, 100, 200, 300]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.8,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>LAYER2</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-17"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, 250, 450, 650], 
            y: [0, 100, 200, 300]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.8,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>BRIDGE</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-18"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, -350, -550, -750], 
            y: [0, -100, -200, -300]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.8,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>ORACLE</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-19"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, 350, 550, 750], 
            y: [0, -100, -200, -300]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.8,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <span>WALLET</span>
        </motion.div>

        <motion.div 
          className="web3-icon tech-20"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0], 
            x: [0, -100, -300, -500], 
            y: [0, 350, 450, 550]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            repeatDelay: 0.8,
            ease: "easeOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>DEX</span>
        </motion.div>

        {/* Emoji & Symbol Elements - 20 Additional Animated Elements */}
        <motion.div 
          className="emoji-element emoji-1"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, -450, -650, -850], 
            y: [0, -250, -350, -450]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">⚡</span>
          <span className="emoji-text">LIGHTNING</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-2"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, 450, 650, 850], 
            y: [0, -250, -350, -450]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🔥</span>
          <span className="emoji-text">HOT</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-3"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, -550, -750, -950], 
            y: [0, 150, 250, 350]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🚀</span>
          <span className="emoji-text">MOON</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-4"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, 550, 750, 950], 
            y: [0, 150, 250, 350]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">💎</span>
          <span className="emoji-text">DIAMOND</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-5"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, 0, 0, 0], 
            y: [0, -600, -800, -1000]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🌙</span>
          <span className="emoji-text">NIGHT</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-6"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, 0, 0, 0], 
            y: [0, 600, 800, 1000]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">☀️</span>
          <span className="emoji-text">DAY</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-7"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, -400, -600, -800], 
            y: [0, 0, 0, 0]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🔗</span>
          <span className="emoji-text">CHAIN</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-8"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, 400, 600, 800], 
            y: [0, 0, 0, 0]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🔐</span>
          <span className="emoji-text">LOCK</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-9"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, -300, -500, -700], 
            y: [0, -200, -300, -400]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🎯</span>
          <span className="emoji-text">TARGET</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-10"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, 300, 500, 700], 
            y: [0, -200, -300, -400]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">⚔️</span>
          <span className="emoji-text">SWORD</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-11"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, -200, -400, -600], 
            y: [0, 200, 300, 400]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🛡️</span>
          <span className="emoji-text">SHIELD</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-12"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, 200, 400, 600], 
            y: [0, 200, 300, 400]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">⚡</span>
          <span className="emoji-text">POWER</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-13"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, -500, -700, -900], 
            y: [0, 0, 0, 0]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🔮</span>
          <span className="emoji-text">CRYSTAL</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-14"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, 500, 700, 900], 
            y: [0, 0, 0, 0]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🌟</span>
          <span className="emoji-text">STAR</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-15"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, 0, 0, 0], 
            y: [0, -500, -700, -900]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🌊</span>
          <span className="emoji-text">WAVE</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-16"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, 0, 0, 0], 
            y: [0, 500, 700, 900]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🌪️</span>
          <span className="emoji-text">STORM</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-17"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, -150, -350, -550], 
            y: [0, 150, 250, 350]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🎲</span>
          <span className="emoji-text">DICE</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-18"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, 150, 350, 550], 
            y: [0, 150, 250, 350]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🎨</span>
          <span className="emoji-text">ART</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-19"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, -350, -550, -750], 
            y: [0, -150, -250, -350]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">🏆</span>
          <span className="emoji-text">TROPHY</span>
        </motion.div>

        <motion.div 
          className="emoji-element emoji-20"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.3, 1, 0], 
            x: [0, 350, 550, 750], 
            y: [0, -150, -250, -350]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            repeatDelay: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="emoji">💫</span>
          <span className="emoji-text">SPARKLE</span>
        </motion.div>

        {/* Chain Network Symbols */}
        <motion.div 
          className="chain-symbol chain-1"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 0.7, 0.7, 0], 
            scale: [0, 1.4, 1.4, 0], 
            x: [0, -600, -800, -1000], 
            y: [0, 0, 0, 0]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            repeatDelay: 4,
            ease: "easeInOut"
          }}
        >
          <span className="chain-text">ETH</span>
        </motion.div>

        <motion.div 
          className="chain-symbol chain-2"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 0.7, 0.7, 0], 
            scale: [0, 1.4, 1.4, 0], 
            x: [0, 600, 800, 1000], 
            y: [0, 0, 0, 0]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            repeatDelay: 4,
            ease: "easeInOut"
          }}
        >
          <span className="chain-text">SOL</span>
        </motion.div>

        <motion.div 
          className="chain-symbol chain-3"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 0.7, 0.7, 0], 
            scale: [0, 1.4, 1.4, 0], 
            x: [0, 0, 0, 0], 
            y: [0, -700, -900, -1100]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            repeatDelay: 4,
            ease: "easeInOut"
          }}
        >
          <span className="chain-text">SEI</span>
        </motion.div>

        <motion.div 
          className="chain-symbol chain-4"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 0.7, 0.7, 0], 
            scale: [0, 1.4, 1.4, 0], 
            x: [0, 0, 0, 0], 
            y: [0, 700, 900, 1100]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            repeatDelay: 4,
            ease: "easeInOut"
          }}
        >
          <span className="chain-text">BNB</span>
        </motion.div>

        {/* Floating Code Symbols */}
        <motion.div 
          className="code-symbol code-1"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 0.8, 0.8, 0], 
            scale: [0, 1.5, 1.5, 0], 
            x: [0, -300, -400, -500], 
            y: [0, 300, 400, 500]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            repeatDelay: 2,
            ease: "easeInOut"
          }}
        >
          &lt;/&gt;
        </motion.div>

        <motion.div 
          className="code-symbol code-2"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 0.8, 0.8, 0], 
            scale: [0, 1.5, 1.5, 0], 
            x: [0, 300, 400, 500], 
            y: [0, -300, -400, -500]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            repeatDelay: 2,
            ease: "easeInOut"
          }}
        >
          { }
        </motion.div>

        <motion.div 
          className="code-symbol code-3"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 0.8, 0.8, 0], 
            scale: [0, 1.5, 1.5, 0], 
            x: [0, -400, -500, -600], 
            y: [0, -200, -300, -400]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            repeatDelay: 2,
            ease: "easeInOut"
          }}
        >
          [ ]
        </motion.div>

        {/* Chain Link Elements */}
        <motion.div 
          className="chain-link link-1"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 0.6, 0.6, 0], 
            scale: [0, 1.2, 1.2, 0], 
            x: [0, 400, 500, 600], 
            y: [0, 200, 300, 400]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </svg>
        </motion.div>

        <motion.div 
          className="chain-link link-2"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 0.6, 0.6, 0], 
            scale: [0, 1.2, 1.2, 0], 
            x: [0, -400, -500, -600], 
            y: [0, -200, -300, -400]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </svg>
        </motion.div>
      </motion.div>
      </div>
  )
}

export default App
