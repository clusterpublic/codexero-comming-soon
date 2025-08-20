import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const Confetti = ({ trigger }) => {
  useEffect(() => {
    if (trigger) {
      // Main confetti burst from center - covers entire screen
      confetti({
        particleCount: 200,
        spread: 180, // Full 180 degree spread
        origin: { y: 0.6, x: 0.5 }, // Center of screen, near button
        colors: ['#ff6b47', '#ff8a65', '#ffab40', '#4CAF50', '#2196F3', '#9C27B0'],
        gravity: 0.7,
        ticks: 250,
        startVelocity: 30,
        decay: 0.9,
        zIndex: 10000
      });

      // Left side burst for full coverage
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.6, x: 0.2 }, // Left side
          colors: ['#ff6b47', '#ff8a65', '#ffab40', '#4CAF50'],
          gravity: 0.6,
          ticks: 200,
          startVelocity: 25,
          zIndex: 10000
        });
      }, 100);

      // Right side burst for full coverage
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.6, x: 0.8 }, // Right side
          colors: ['#2196F3', '#9C27B0', '#ff6b47', '#4CAF50'],
          gravity: 0.6,
          ticks: 200,
          startVelocity: 25,
          zIndex: 10000
        });
      }, 200);

      // Top burst for complete screen coverage
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 180,
          origin: { y: 0.3, x: 0.5 }, // Top of screen
          colors: ['#ff6b47', '#ff8a65', '#ffab40', '#4CAF50', '#2196F3', '#9C27B0'],
          gravity: 0.8,
          ticks: 220,
          startVelocity: 35,
          zIndex: 10000
        });
      }, 300);

      // Final celebration burst from multiple points
      setTimeout(() => {
        // Center burst
        confetti({
          particleCount: 75,
          spread: 120,
          origin: { y: 0.6, x: 0.5 },
          colors: ['#ff6b47', '#ff8a65', '#ffab40'],
          gravity: 0.7,
          ticks: 180,
          startVelocity: 28,
          zIndex: 10000
        });
        
        // Left burst
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6, x: 0.3 },
          colors: ['#4CAF50', '#2196F3'],
          gravity: 0.6,
          ticks: 160,
          startVelocity: 22,
          zIndex: 10000
        });
        
        // Right burst
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6, x: 0.7 },
          colors: ['#9C27B0', '#ff6b47'],
          gravity: 0.6,
          ticks: 160,
          startVelocity: 22,
          zIndex: 10000
        });
      }, 400);
    }
  }, [trigger]);

  return null; // This component doesn't render anything visible
};

export default Confetti;
