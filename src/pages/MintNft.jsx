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
      <div className="mb-12">
        <div className="flex items-center justify-center space-x-6 mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`
                w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-500 transform hover:scale-110
                ${currentStep === step.number 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-4 ring-blue-300 ring-opacity-50' 
                  : completedSteps.has(step.number)
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white ring-4 ring-green-300 ring-opacity-50'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 hover:from-gray-500 hover:to-gray-600'
                }
              `}>
                {completedSteps.has(step.number) ? '✓' : step.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-20 h-1 mx-4 rounded-full transition-all duration-500
                  ${completedSteps.has(step.number) 
                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
                  }
                `} />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Step {currentStep}: {steps[currentStep - 1]?.title}
          </h2>
          <p className="text-gray-300 text-base">
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
          <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-2xl border border-gray-700 text-center transform hover:scale-[1.02] transition-all duration-300">
            <div className="mb-6">
              <div className="text-7xl mb-4 animate-pulse">🚧</div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Step 2: Wallet Setup
              </h2>
              <p className="text-xl text-gray-300">Configure your wallet for NFT minting</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl border border-gray-600">
              <h3 className="text-2xl font-semibold mb-3 text-blue-300">Coming Soon</h3>
              <p className="text-gray-400 text-lg">Wallet setup functionality will be implemented here</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-2xl border border-gray-700 text-center transform hover:scale-[1.02] transition-all duration-300">
            <div className="mb-6">
              <div className="text-7xl mb-4 animate-bounce">🎨</div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Step 3: NFT Minting
              </h2>
              <p className="text-xl text-gray-300">Mint your unique NFT</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl border border-gray-600">
              <h3 className="text-2xl font-semibold mb-3 text-green-300">Ready to Mint!</h3>
              <p className="text-gray-400 text-lg">NFT minting functionality will be implemented here</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <div className="text-4xl">🎭</div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Mint Your NFT
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Follow the steps below to verify your identity and mint your unique{' '}
            <span className="text-blue-400 font-semibold">CodeXero NFT</span>
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Current Step Content */}
        <div className="flex justify-center mb-12">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        {currentStep > 1 && (
          <div className="flex justify-center">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-600 hover:border-gray-500"
            >
              ← Previous Step
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
