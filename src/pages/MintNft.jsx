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

export default function MintNft() {
  const [currentTab, setCurrentTab] = useState('verification');
  const [contractAddress, setContractAddress] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [mintingStatus, setMintingStatus] = useState(false);
  const [loadingMintingStatus, setLoadingMintingStatus] = useState(false);

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

  const handleReferralGenerated = (referralData) => {
    console.log('Referral generated:', referralData);
    toast.success('Referral generated successfully!');
  };

  const handleNFTMinted = (mintData) => {
    console.log('NFT minted:', mintData);
    toast.success('NFT minted successfully!');
  };

  const tabs = [
    { id: 'verification', label: 'Step 1: Verification', icon: '��' },
    { id: 'nft-gallery', label: 'NFT Gallery', icon: '🖼️' },
    { id: 'add-nft', label: 'Add NFT', icon: '➕' },
    { id: 'referral', label: 'Referral Generator', icon: '��' },
    { id: 'wallet-approval', label: 'Wallet Approval', icon: '✅' },
    { id: 'marketplace', label: 'Marketplace', icon: '🛒' },
    { id: 'nft-management', label: 'NFT Management', icon: '🖼️' } // Add this line
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case 'verification':
        return <Step1Verification />;
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
          <div className="wallet-approval-section">
            <div className="max-w-4xl mx-auto p-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">✅</span>
                  Wallet Approval & Minting Control
                </h2>
                
                {/* Minting Status Section */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-500/30">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Minting Status Control
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-300 mb-2">
                        Current Minting Status:
                      </p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        mintingStatus 
                          ? 'bg-green-900 text-green-300 border border-green-500' 
                          : 'bg-red-900 text-red-300 border border-red-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          mintingStatus ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        {mintingStatus ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    
                    {isOwner && (
                      <button
                        onClick={toggleMinting}
                        disabled={loadingMintingStatus}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                          loadingMintingStatus
                            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            : mintingStatus
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {loadingMintingStatus ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </span>
                        ) : mintingStatus ? (
                          'Disable Minting'
                        ) : (
                          'Enable Minting'
                        )}
                      </button>
                    )}
                  </div>
                  
                  {!isOwner && (
                    <div className="bg-yellow-900/50 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ Only the contract owner can control minting status
                      </p>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-400 mt-3">
                    <p>• <strong>Enabled:</strong> Users can mint NFTs</p>
                    <p>• <strong>Disabled:</strong> Minting is paused for all users</p>
                    <p>• <strong>Owner Only:</strong> Only contract owner can change this setting</p>
                  </div>
                </div>

                {/* Wallet Approval Section */}
                <div className="p-6 bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-lg border border-green-500/30">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="mr-2">🔓</span>
                    Approve Wallet Addresses
                  </h3>
                  
                  <WalletApprovalForm 
                    onWalletApproved={handleWalletApproval}
                    isOwner={isOwner}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CodeXero NFT Platform
          </h1>
          <p className="text-xl text-gray-300">
            Mint, manage, and trade your digital assets
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                currentTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}

// Wallet Approval Form Component
function WalletApprovalForm({ onWalletApproved, isOwner }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }

    if (!isOwner) {
      toast.error('Only contract owner can approve wallets');
      return;
    }

    setIsSubmitting(true);
    try {
      await onWalletApproved(walletAddress.trim());
      setWalletAddress('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-2">
          Wallet Address to Approve
        </label>
        <input
          type="text"
          id="walletAddress"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="0x..."
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!isOwner}
        />
      </div>
      
      <button
        type="submit"
        disabled={!isOwner || isSubmitting || !walletAddress.trim()}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
          !isOwner || isSubmitting || !walletAddress.trim()
            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white hover:transform hover:scale-105'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Approving...
          </span>
        ) : (
          'Approve Wallet'
        )}
      </button>
      
      {!isOwner && (
        <div className="bg-yellow-900/50 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-300 text-sm">
            ⚠️ Only the contract owner can approve wallet addresses
          </p>
        </div>
      )}
      
      <div className="text-sm text-gray-400">
        <p>• <strong>Approved wallets</strong> can mint NFTs without verification</p>
        <p>• <strong>Owner only:</strong> Only contract owner can approve wallets</p>
        <p>• <strong>Instant access:</strong> Approved wallets can mint immediately</p>
      </div>
    </form>
  );
}