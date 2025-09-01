import { useState } from 'react';
import Step1Verification from '../components/Step1Verification';

export default function MintNft() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const handleStep1Complete = () => {
    setCompletedSteps(prev => new Set([...prev, 1]));
    // Auto-advance to step 2 when step 1 is complete
    setTimeout(() => {
      setCurrentStep(2);
    }, 2000);
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Social Verification', description: 'Connect and verify social accounts' },
      { number: 2, title: 'Wallet Setup', description: 'Configure your wallet for minting' },
      { number: 3, title: 'NFT Minting', description: 'Mint your unique NFT' },
    ];

    return (
      <div className="step-indicator">
        <div className="step-indicator-container">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`
                step-circle
                ${currentStep === step.number 
                  ? 'active' 
                  : completedSteps.has(step.number)
                    ? 'completed'
                    : 'pending'
                }
              `}>
                {completedSteps.has(step.number) ? '✓' : step.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  step-connector
                  ${completedSteps.has(step.number) ? 'completed' : 'pending'}
                `} />
              )}
            </div>
          ))}
        </div>
        
        <div className="step-info">
          <h2 className="step-info-title">
            Step {currentStep}: {steps[currentStep - 1]?.title}
          </h2>
          <p className="step-info-desc">
            {steps[currentStep - 1]?.description}
          </p>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Verification onStepComplete={handleStep1Complete} />;
      case 2:
        return (
          <div className="step-card">
            <div className="step-card-icon animate-pulse">🚧</div>
            <h2 className="step-card-title">
              Step 2: Wallet Setup
            </h2>
            <p className="step-card-subtitle">Configure your wallet for NFT minting</p>
            <div className="step-card-content">
              <h3>Coming Soon</h3>
              <p>Wallet setup functionality will be implemented here</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-card">
            <div className="step-card-icon animate-bounce">🎨</div>
            <h2 className="step-card-title">
              Step 3: NFT Minting
            </h2>
            <p className="step-card-subtitle">Mint your unique NFT</p>
            <div className="step-card-content">
              <h3>Ready to Mint!</h3>
              <p>NFT minting functionality will be implemented here</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mint-nft-page">
      <div className="mint-nft-container">
        {/* Header */}
        <div className="mint-nft-header">
          <div className="mint-nft-icon">
            <div className="text-4xl">🎭</div>
          </div>
          <h1 className="mint-nft-title">
            Mint Your NFT
          </h1>
          <p className="mint-nft-subtitle">
            Follow the steps below to verify your identity and mint your unique{' '}
            <span className="font-semibold" style={{color: '#ff6b47'}}>CodeXero NFT</span>
          </p>
          <div className="mint-nft-divider"></div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Current Step Content */}
        <div className="step-content">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        {currentStep > 1 && (
          <div className="step-navigation">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              className="nav-button"
            >
              ← Previous Step
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
