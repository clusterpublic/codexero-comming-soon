import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { createContract, isWalletConnected, getAccountAddress } from '../utils/signerAdapter.js';
import './ReferralGenerator.css';

// Contract ABI for referral functions - updated to match deployed contract
const REFERRAL_ABI = [
  "function referrals(address) view returns (tuple(address referrer, uint256 referralCount, uint256 totalEarnings, bool isActive))",
  "function getReferralData(address referrer) view returns (tuple(address referrer, uint256 referralCount, uint256 totalEarnings, bool isActive))",
  "function createReferral(address referrer) external",
  "function referralCount() view returns (uint256)"
];

export default function ReferralGenerator({ contractAddress }) {
  // Debug: Log the contract address prop (only in development)
  if (import.meta.env.DEV) {
    console.log('ReferralGenerator: Received contractAddress prop:', contractAddress);
    console.log('ReferralGenerator: Type of contractAddress:', typeof contractAddress);
    console.log('ReferralGenerator: Length of contractAddress:', contractAddress ? contractAddress.length : 'undefined');
  }

  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalEarnings: '0',
    referralCount: '0',
    isActive: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');

  // Check if contract address is provided
  if (!contractAddress || contractAddress === '' || contractAddress === 'undefined') {
    return (
      <div className="referral-generator">
        <div className="bg-red-900 bg-opacity-50 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-300 mb-2">Contract Not Configured</h3>
          <p className="text-red-200 mb-4">
            The smart contract address is not configured
          </p>
          <div className="bg-gray-800 rounded-lg p-4 inline-block">
            <p className="text-gray-300 text-sm">
              Please set VITE_CONTRACT_ADDRESS in your environment variables
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Current value: {contractAddress || 'undefined'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Expected format: 0x... (42 characters)
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Validate contract address format
  if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
    return (
      <div className="referral-generator">
        <div className="bg-red-900 bg-opacity-50 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-300 mb-2">Invalid Contract Address</h3>
          <p className="text-red-200 mb-4">
            The contract address format is invalid
          </p>
          <div className="bg-gray-800 rounded-lg p-4 inline-block">
            <p className="text-gray-300 text-sm">
              Current value: {contractAddress}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Expected format: 0x... (42 characters)
            </p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Reload referral data when account address changes
  useEffect(() => {
    if (accountAddress && accountAddress !== '') {
      console.log('ReferralGenerator: Account address changed, reloading referral data');
      loadReferralData();
    }
  }, [accountAddress]);

  const checkWalletConnection = async () => {
    try {
      const connected = await isWalletConnected();
      setWalletConnected(connected);
      
      if (connected) {
        const address = await getAccountAddress();
        console.log('ReferralGenerator: Got account address:', address);
        setAccountAddress(address);
        
        // Only load referral data if we have a valid address
        if (address && address !== '') {
          console.log('ReferralGenerator: Account address is valid, loading referral data');
          loadReferralData();
        } else {
          console.log('ReferralGenerator: Account address is empty, skipping referral data load');
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setWalletConnected(false);
      setAccountAddress('');
    }
  };

  const loadReferralData = async () => {
    try {
      // Validate account address before proceeding
      if (!accountAddress || accountAddress === '') {
        console.log('ReferralGenerator: Cannot load referral data - account address is empty');
        return;
      }
      
      setIsLoading(true);
      console.log('ReferralGenerator: Loading referral data with contract address:', contractAddress);
      console.log('ReferralGenerator: Account address:', accountAddress);
      
      const contract = createContract(contractAddress, REFERRAL_ABI);
      console.log('ReferralGenerator: Contract created successfully:', contract);
      
      // Get referral data using the correct function
      console.log('ReferralGenerator: Calling getReferralData with address:', accountAddress);
      const referralData = await contract.getReferralData(accountAddress);
      console.log('ReferralGenerator: getReferralData result:', referralData);
      
      // Check if user has referral data
      if (referralData.referrer !== ethers.constants.AddressZero) {
        // User is a referrer
        setReferralCode(`REF_${accountAddress.slice(2, 8).toUpperCase()}`); // Generate a simple referral code
        setReferralStats({
          totalEarnings: ethers.utils.formatEther(referralData.totalEarnings),
          referralCount: referralData.referralCount.toString(),
          isActive: referralData.isActive
        });
      } else {
        // User is not a referrer yet
        setReferralCode('');
        setReferralStats({
          totalEarnings: '0',
          referralCount: '0',
          isActive: false
        });
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        argument: error.argument,
        value: error.value
      });
      toast.error('Failed to load referral data');
    } finally {
      setIsLoading(false);
    }
  };

  const createReferralCode = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Validate account address
    if (!accountAddress || accountAddress === '') {
      toast.error('Account address not available');
      return;
    }

    try {
      setIsLoading(true);
      const contract = createContract(contractAddress, REFERRAL_ABI);
      
      // Note: This function requires owner permissions, so it might fail for regular users
      const tx = await contract.createReferral(accountAddress);
      toast.info('Creating referral code... Please wait for confirmation');
      
      const receipt = await tx.wait();
      toast.success('✅ Referral code created successfully!');
      
      // Reload referral data
      await loadReferralData();
    } catch (error) {
      console.error('Error creating referral code:', error);
      if (error.message.includes('onlyOwner')) {
        toast.error('Only contract owner can create referral codes. Please contact the admin.');
      } else {
        toast.error(`Error creating referral code: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralCode) {
      toast.error('No referral code available');
      return;
    }

    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const shareReferralLink = () => {
    if (!referralCode) {
      toast.error('No referral code available');
      return;
    }

    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join CodeXero NFT Collection',
        text: `Use my referral code ${referralCode} to get started!`,
        url: referralLink
      });
    } else {
      copyReferralLink();
    }
  };

  if (!walletConnected) {
    return (
      <div className="referral-generator">
        <div className="bg-blue-900 bg-opacity-50 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-xl font-semibold text-blue-300 mb-2">Wallet Not Connected</h3>
          <p className="text-blue-200 mb-4">
            Please connect your wallet to access referral features
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="referral-generator">
      <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-300 mb-3">🔗 Referral System</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Connected</h4>
            <p className="text-gray-300 text-sm font-mono">{accountAddress}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Your Referral Code</h4>
            {referralCode ? (
              <div>
                <p className="text-green-400 font-mono text-sm mb-2">{referralCode}</p>
                <button
                  onClick={copyReferralLink}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition-colors"
                >
                  Copy Link
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 text-sm mb-2">You don't have a referral code yet. Contact admin to get one!</p>
                <button
                  onClick={createReferralCode}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm px-3 py-2 rounded transition-colors"
                >
                  {isLoading ? 'Requesting...' : 'Request Referral Code'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="referral-content">
        {/* Referral Code Section */}
        <div className="referral-code-section">
          <h3 className="text-lg font-semibold text-white mb-3">Your Referral Code</h3>
          
          {referralCode ? (
            <div className="referral-code-display">
              <div className="code-box">
                <span className="code-text">{referralCode}</span>
                <button
                  onClick={copyReferralLink}
                  className="copy-button"
                  title="Copy referral link"
                >
                  📋
                </button>
              </div>
              <div className="code-actions">
                <button
                  onClick={copyReferralLink}
                  className="action-button secondary"
                >
                  Copy Link
                </button>
                <button
                  onClick={shareReferralLink}
                  className="action-button primary"
                >
                  Share
                </button>
              </div>
            </div>
          ) : (
            <div className="no-code-section">
              <p className="text-gray-400 mb-4">
                You don't have a referral code yet. Contact admin to get one!
              </p>
              <button
                onClick={createReferralCode}
                disabled={isLoading}
                className="create-code-button"
              >
                {isLoading ? 'Requesting...' : 'Request Referral Code'}
              </button>
            </div>
          )}
        </div>

        {/* Referral Stats Section */}
        <div className="referral-stats-section">
          <h3 className="text-lg font-semibold text-white mb-3">Referral Statistics</h3>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-label">Total Earnings</div>
                <div className="stat-value">{referralStats.totalEarnings} ETH</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-label">Referral Count</div>
                <div className="stat-value">{referralStats.referralCount}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-label">Status</div>
                <div className={`stat-value ${referralStats.isActive ? 'text-green-400' : 'text-red-400'}`}>
                  {referralStats.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="how-it-works-section">
          <h3 className="text-lg font-semibold text-white mb-3">How Referrals Work</h3>
          
          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4 className="step-title">Get Your Code</h4>
                <p className="step-description">
                  Contact admin to get a unique referral code
                </p>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4 className="step-title">Share Your Link</h4>
                <p className="step-description">
                  Share your referral link with friends and community
                </p>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4 className="step-title">Earn Rewards</h4>
                <p className="step-description">
                  Get rewards when people use your referral code to mint NFTs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
