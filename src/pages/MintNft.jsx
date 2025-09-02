import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Step1Verification from '../components/Step1Verification.jsx';
import NFTGallery from '../components/NFTGallery.jsx';
import AddNFTForm from '../components/AddNFTForm.jsx';
import ReferralGenerator from '../components/ReferralGenerator.jsx';
import { isWalletConnected, getAccountAddress } from '../utils/signerAdapter.js';
import '../components/AddNFTForm.css';
import '../components/ReferralGenerator.css';

export default function MintNft() {
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationData, setVerificationData] = useState({
    twitterVerified: false,
    telegramVerified: false
  });
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');
  const [activeTab, setActiveTab] = useState('nfts'); // 'nfts', 'add', 'referral'

  // Contract address - you'll need to update this with your deployed contract
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x57D7b5eE27Ae947c01EF31dE8ba413f5921d146F';

  // Debug: Log environment variables
  console.log('MintNft: Environment variables:', {
    VITE_CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS,
    contractAddress: contractAddress,
    VITE_RPC_URL: import.meta.env.VITE_RPC_URL,
    VITE_CHAIN_ID: import.meta.env.VITE_CHAIN_ID
  });

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const connected = await isWalletConnected();
      setWalletConnected(connected);
      
      if (connected) {
        const address = await getAccountAddress();
        setAccountAddress(address);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setWalletConnected(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        await checkWalletConnection();
        if (walletConnected) {
          setCurrentStep(3);
        }
      } else {
        toast.error('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleVerificationComplete = (data) => {
    setVerificationData(data);
    setCurrentStep(2);
  };

  const handleWalletConnected = () => {
    setCurrentStep(3);
    checkWalletConnection();
  };

  const handleNFTMinted = (result) => {
    console.log('NFT minted:', result);
    toast.success('NFT minted successfully!');
  };

  const steps = [
    {
      id: 1,
      title: "Social Verification",
      description: "Complete social media verification steps"
    },
    {
      id: 2,
      title: "Wallet Setup",
      description: "Connect your wallet to proceed"
    },
    {
      id: 3,
      title: "NFT Selection & Minting",
      description: "Browse available NFTs and mint your favorites"
    }
  ];

  const handleStepClick = (stepId) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if user is contract owner (you can implement this check)
  const isContractOwner = true; // For now, assume true - you can add actual check later
  
  // Check if contract address is configured
  if (!contractAddress) {
    console.warn('Contract address not configured. Please set VITE_CONTRACT_ADDRESS in your environment variables.');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CodeXero NFT Minting
          </h1>
          <p className="text-xl text-gray-300">
            Complete verification and mint your favorite NFTs
          </p>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`flex items-center cursor-pointer transition-all duration-200 ${
                  step.id <= currentStep
                    ? 'text-blue-400'
                    : 'text-gray-500'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    step.id <= currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {step.id < currentStep ? '✓' : step.id}
                </div>
                <span className="font-medium">{step.title}</span>
                {index < steps.length - 1 && (
                  <div className="w-8 h-1 bg-gray-600 mx-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
                     {currentStep === 1 && (
             <div className="step-content">
               <Step1Verification onStepComplete={handleVerificationComplete} />
             </div>
           )}

          {currentStep === 2 && (
            <div className="step-content text-center">
              <div className="bg-gray-800 rounded-lg p-8 mb-6">
                <h2 className="text-2xl font-bold mb-4">Wallet Setup</h2>
                {walletConnected ? (
                  <div className="space-y-4">
                    <div className="bg-green-900 bg-opacity-50 rounded-lg p-4">
                      <p className="text-green-400 font-medium">✅ Wallet Connected</p>
                      <p className="text-sm text-gray-300 mt-1">{accountAddress}</p>
                    </div>
                    <button
                      onClick={handleNextStep}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                    >
                      Proceed to NFT Selection
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300">Please connect your wallet to continue</p>
                                         <button
                       onClick={connectWallet}
                       className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                     >
                       Connect Wallet
                     </button>
                  </div>
                )}
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handlePreviousStep}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Previous Step
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content">
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">NFT Selection & Minting</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('nfts')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        activeTab === 'nfts' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      🎨 View NFTs
                    </button>
                    {isContractOwner && (
                      <button
                        onClick={() => setActiveTab('add')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          activeTab === 'add' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        ➕ Add NFTs
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('referral')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        activeTab === 'referral' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      🔗 Referrals
                    </button>
                  </div>
                </div>
                
                {/* Tab Content */}
                {activeTab === 'nfts' && (
                  <div>
                    <p className="text-gray-300 mb-4">
                      Browse available NFTs and mint your favorites
                    </p>
                    {contractAddress ? (
                      <NFTGallery
                        contractAddress={contractAddress}
                        onNFTMinted={handleNFTMinted}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-red-400 mb-4">Contract address not configured</p>
                        <p className="text-gray-400 text-sm">
                          Please set VITE_CONTRACT_ADDRESS in your environment variables
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'add' && isContractOwner && (
                  <AddNFTForm 
                    contractAddress={contractAddress}
                  />
                )}
                
                {activeTab === 'referral' && (
                  <ReferralGenerator 
                    contractAddress={contractAddress}
                  />
                )}
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handlePreviousStep}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  Previous Step
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
