import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Step1Verification from '../components/Step1Verification.jsx';
import NFTGallery from '../components/NFTGallery.jsx';
import AddNFTForm from '../components/AddNFTForm.jsx';
import ReferralGenerator from '../components/ReferralGenerator.jsx';
import { isWalletConnected, getAccountAddress, createContract } from '../utils/signerAdapter.js';
import CONTRACT_ABI from '../constants/abi.json';
import '../components/AddNFTForm.css';
import '../components/ReferralGenerator.css';
import Marketplace from '../components/marketplace/Marketplace.jsx';
import NFTManagement from '../components/nft-management/NFTManagement.jsx';
import WalletApprovalSection from '../components/WalletApprovalSection.jsx';
import Header from '../components/Header.jsx';

export default function MintNft() {
  const [currentTab, setCurrentTab] = useState('verification');
  const [contractAddress, setContractAddress] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [mintingStatus, setMintingStatus] = useState(false);
  const [loadingMintingStatus, setLoadingMintingStatus] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    // Get contract address from environment
    const address = import.meta.env.VITE_CONTRACT_ADDRESS;
    if (address) {
      setContractAddress(address);
      checkWalletConnection();
      checkMintingStatus();
    }
  }, []);

  const checkWalletConnection = async () => {
    try {
      const connected = await isWalletConnected();
      setWalletConnected(connected);
      console.log("conneced", connected)
      if (connected) {
        const address = await getAccountAddress();
        console.log("adress", address)
        setAccountAddress(address);
        checkIfOwner(address);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const checkIfOwner = async (address) => {
    try {
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      if (contractAddress && address) {
        const contract = createContract(contractAddress, CONTRACT_ABI.abi);
        const owner = await contract.owner();
        console.log('checking owner',owner, address)
        setIsOwner(owner.toLowerCase() === address.toLowerCase());
      }
    } catch (error) {
      console.error('Error checking owner status:', error);
    }
  };

  const checkMintingStatus = async () => {
    try {
      if (contractAddress) {
        setLoadingMintingStatus(true);
        const contract = createContract(contractAddress, CONTRACT_ABI.abi);
        const status = await contract.mintingEnabled();
        setMintingStatus(status);
      }
    } catch (error) {
      console.error('Error checking minting status:', error);
    } finally {
      setLoadingMintingStatus(false);
    }
  };

  const toggleMinting = async () => {
    try {
      if (!isOwner) {
        toast.error('Only contract owner can toggle minting');
        return;
      }

      setLoadingMintingStatus(true);
      const contract = createContract(contractAddress, CONTRACT_ABI.abi);
      
      const tx = await contract.toggleMinting();
      await tx.wait();
      
      // Refresh minting status
      await checkMintingStatus();
      
      toast.success(`Minting ${mintingStatus ? 'disabled' : 'enabled'} successfully!`);
    } catch (error) {
      console.error('Error toggling minting:', error);
      toast.error(`Failed to toggle minting: ${error.message}`);
    } finally {
      setLoadingMintingStatus(false);
    }
  };

  const handleWalletApproval = async (walletAddress) => {
    try {
      if (!isOwner) {
        toast.error('Only contract owner can approve wallets');
        return;
      }

      const contract = createContract(contractAddress, CONTRACT_ABI.abi);
      const tx = await contract.addVerifiedWallet(walletAddress);
      await tx.wait();
      
      toast.success(`Wallet ${walletAddress} approved successfully!`);
    } catch (error) {
      console.error('Error approving wallet:', error);
      toast.error(`Failed to approve wallet: ${error.message}`);
    }
  };


  const handleNFTMinted = (mintData) => {
    console.log('NFT minted:', mintData);
    toast.success('NFT minted successfully!');
  };

  const handleVerificationComplete = () => {
    setVerificationComplete(true);
    setCurrentTab('nft-gallery'); // Set to first available tab after verification
    toast.success('🎉 Verification completed! You now have access to all NFT features.');
  };

  // Dynamic tabs array - verification tab only shows when verification is not complete
  const tabs = verificationComplete ? [
    { id: 'nft-gallery', label: 'NFT Gallery', icon: '🖼️', description: 'Browse your NFT collection' },
  
    { id: 'referral', label: 'Referral Generator', icon: '🎯', description: 'Generate referral links' },
    { id: 'wallet-approval', label: 'Wallet Approval', icon: '✅', description: 'Manage wallet permissions' },
    
    { id: 'nft-management', label: 'NFT Management', icon: '⚙️', description: 'Manage your NFT portfolio' }
  ] : [
    { id: 'verification', label: 'Step 1: Verification', icon: '🔐', description: 'Complete verification process' }
  ];

  const ownerTabs = [  { id: 'add-nft', label: 'Add NFT', icon: '➕', description: 'Create new NFT assets', isOwner:true },{ id: 'marketplace', label: 'Marketplace', icon: '🛒', description: 'Trade and discover NFTs',isOwner:true },]

  const renderTabContent = () => {
    switch (currentTab) {
      case 'verification':
        return <Step1Verification onVerificationComplete={handleVerificationComplete} />;
      case 'nft-gallery':
        return (
          <NFTGallery 
            contractAddress={contractAddress} 
            onNFTMinted={handleNFTMinted}
          />
        );
      case 'add-nft':
        return (
          <AddNFTForm 
            contractAddress={contractAddress}
          />
        );
      case 'referral':
        return (
          <ReferralGenerator 
            contractAddress={contractAddress}
          />
        );
        case 'marketplace':
          return (
            <Marketplace
              contractAddress={contractAddress}
            />
          );
          case 'nft-management':
            return (
              <NFTManagement
                contractAddress={contractAddress}
              />
            );
      case 'wallet-approval':
        return (
          <WalletApprovalSection 
            contractAddress={contractAddress}
            isOwner={isOwner}
            mintingStatus={mintingStatus}
            loadingMintingStatus={loadingMintingStatus}
            onToggleMinting={toggleMinting}
            onWalletApproved={handleWalletApproval}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('./assets/backgroubnd.jpg')" }}>
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        {/* Header Component */}
        <Header showWaitlistButton={false} />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Page Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full border border-orange-400/30 backdrop-blur-lg mb-6">
              <span className="text-4xl">🎨</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-orange-500 bg-clip-text text-transparent">
              CodeXero NFT Platform
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              {verificationComplete 
                ? 'Mint, manage, and trade your digital assets with professional-grade tools'
                : 'Complete verification to unlock the full NFT platform'
              }
            </p>
            
          </div>


          {/* Conditional Tab Navigation - Only show after verification */}
          {verificationComplete && (
            <div className="mb-12">
              <div className="flex flex-wrap justify-center gap-3">
                {tabs.map((tab) => (   <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`group relative px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                      currentTab === tab.id
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/30 transform scale-105'
                        : 'bg-white/80 hover:bg-white/90 text-gray-700 hover:text-gray-800 hover:shadow-lg hover:shadow-orange-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{tab.icon}</span>
                      <div className="text-left">
                        <div className="font-bold">{tab.label}</div>
                        <div className={`text-xs opacity-80 transition-opacity duration-300 ${
                          currentTab === tab.id ? 'opacity-100' : 'opacity-60'
                        }`}>
                          {tab.description}
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover effect indicator */}
                    {currentTab === tab.id && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-orange-500 rounded-full"></div>
                    )}
                  </button>))}

                  {isOwner && ownerTabs.map((tab) => (   <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`group relative px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                      currentTab === tab.id
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/30 transform scale-105'
                        : 'bg-white/80 hover:bg-white/90 text-gray-700 hover:text-gray-800 hover:shadow-lg hover:shadow-orange-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{tab.icon}</span>
                      <div className="text-left">
                        <div className="font-bold">{tab.label}</div>
                        <div className={`text-xs opacity-80 transition-opacity duration-300 ${
                          currentTab === tab.id ? 'opacity-100' : 'opacity-60'
                        }`}>
                          {tab.description}
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover effect indicator */}
                    {currentTab === tab.id && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-orange-500 rounded-full"></div>
                    )}
                  </button>))}
              </div>
            </div>
          )}


          {/* Tab Content */}
          <div className="animate-fadeIn">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

