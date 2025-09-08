import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { createContract, isWalletConnected, getAccountAddress } from '../utils/signerAdapter.js';
import { supabase } from '../supabase.js';
import CONTRACT_ABI from '../constants/abi.json';

export default function ReferralGenerator({ contractAddress }) {
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalEarnings: '0',
    referralCount: '0',
    isActive: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [hasMintedNFTs, setHasMintedNFTs] = useState(false);
  const [canCreateReferrals, setCanCreateReferrals] = useState(false);
  
  // Referral creation states
  const [referralCreationMode, setReferralCreationMode] = useState(false);
  const [referralForm, setReferralForm] = useState({
    targetWalletAddress: '',
    referralCode: ''
  });
  
  // Referral verification states
  const [verificationMode, setVerificationMode] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [referralStatus, setReferralStatus] = useState(null);

  const [contract, setContract] = useState(null);

  // ... existing code ...

  // Initialize contract when component mounts or account changes
  useEffect(() => {
    const initializeContract = async () => {
      if (accountAddress && window.ethereum) {
        try {
          const contractInstance = createContract(contractAddress, CONTRACT_ABI.abi);
          setContract(contractInstance);
          console.log('Contract initialized:', contractInstance);
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      }
    };

    initializeContract();
  }, [accountAddress]);

  const addWalletToContract = async () => {
    if (!contract) {
      console.error('Contract not initialized');
      return false;
    }

    try {
      const tx = await contract.addVerifiedWallet(accountAddress);
      await tx.wait();
      console.log('Wallet added to verified wallets:', accountAddress);
      return true;
    } catch (error) {
      console.error('Error adding wallet to contract:', error);
      return false;
    }
  };


  useEffect(() => {
    if (referralCode) {
      loadReferralStatus();
    }
  }, [referralCode]);

  const loadReferralStatus = async () => {
    if (!referralCode) return;
    
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('is_verified, verified_at, verified_wallet')
        .eq('referral_code', referralCode)
        .single();
      
      if (!error && data) {
        setReferralStatus(data);
      }
    } catch (error) {
      console.error('Error loading referral status:', error);
    }
  };



  useEffect(() => {
    checkWalletConnection();
  }, [contractAddress]);

  useEffect(() => {
    if (accountAddress && contractAddress) {
      checkEligibility();
      loadReferralData();
    }
  }, [accountAddress, contractAddress]);

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
      setAccountAddress('');
    }
  };

  const checkEligibility = async () => {
    try {
      const contract = createContract(contractAddress, CONTRACT_ABI.abi);
      
      // Check if user is contract owner
      const owner = await contract.owner();
      const isContractOwner = owner.toLowerCase() === accountAddress.toLowerCase();
      setIsOwner(isContractOwner);
      
      // Check if user has minted NFTs
      const userNFTs = await contract.getUserNFTs(accountAddress);
      const hasNFTs = userNFTs.length > 0;
      setHasMintedNFTs(hasNFTs);
      
      // Determine if user can create referrals
      // Only owner OR users who have minted NFTs can create referrals
      setCanCreateReferrals(isContractOwner || hasNFTs);
      
      console.log('Eligibility check:', {
        isOwner: isContractOwner,
        hasMintedNFTs: hasNFTs,
        canCreateReferrals: isContractOwner || hasNFTs
      });
      
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setCanCreateReferrals(false);
    }
  };

  const loadReferralData = async () => {
    try {
      if (!accountAddress || !contractAddress) return;
      
      setIsLoading(true);
      
      // Check if user has referral code in Supabase - use array instead of single
      const { data: referralData, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('creator_address', accountAddress)
        .eq('is_active', true);

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Failed to load referral data');
        return;
      }

      if (referralData && referralData.length > 0) {
        // User has referral codes - take the first active one
        const activeReferral = referralData[0];
        setReferralCode(activeReferral.referral_code);
        
        // Get referral count from verifications
        const { count: verificationCount } = await supabase
          .from('referral_verifications')
          .select('*', { count: 'exact', head: true })
          .eq('referral_code', activeReferral.referral_code);

        setReferralStats({
          totalEarnings: '0', // No earnings system in contract yet
          referralCount: verificationCount?.toString() || '0',
          isActive: activeReferral.is_active
        });
      } else {
        // User doesn't have a referral code
        setReferralCode('');
        setReferralStats({
          totalEarnings: '0',
          referralCount: '0',
          isActive: false
        });
      }
      
    } catch (error) {
      console.error('Error loading referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate unique 8-digit referral code
// ... existing code ...

const generateUniqueReferralCode = async (targetWalletAddress) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let attempts = 0;
  const maxAttempts = 50; // Prevent infinite loops
  
  while (attempts < maxAttempts) {
    // Generate 8-character alphanumeric code
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Check if code already exists in Supabase
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referral_code', code)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Code doesn't exist, we can use it
        return code;
      } else if (data) {
        // Code exists, try again
        attempts++;
        continue;
      }
    } catch (error) {
      // If there's an error, assume code is available
      return code;
    }
  }
  
  // Fallback: use wallet address hash + timestamp
  const timestamp = Date.now().toString(36);
  const walletHash = targetWalletAddress.slice(-6).toUpperCase();
  return `${walletHash}${timestamp}`.slice(0, 8);
};

// ... existing code ...

  const createReferralCodeForUser = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!canCreateReferrals) {
      toast.error('You are not eligible to create referral codes. Only owners or users with minted NFTs can create referrals.');
      return;
    }

    if (!referralForm.targetWalletAddress || referralForm.targetWalletAddress === '') {
      toast.error('Please enter a target wallet address');
      return;
    }

    // Validate wallet address format
    if (!referralForm.targetWalletAddress.startsWith('0x') || referralForm.targetWalletAddress.length !== 42) {
      toast.error('Please enter a valid wallet address (0x... format)');
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if target user already has an active referral code
      const { data: existingReferrals, error: checkError } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('creator_address', referralForm.targetWalletAddress)
        .eq('is_active', true);

      if (checkError) {
        console.error('Error checking existing referrals:', checkError);
        toast.error('Failed to check existing referrals');
        return;
      }

      if (existingReferrals && existingReferrals.length > 0) {
        toast.error('This wallet already has an active referral code.');
        return;
      }
      
      // Generate unique referral code
      const newReferralCode = await generateUniqueReferralCode();
      
      // Save to Supabase with TARGET wallet address as creator
      const { data, error } = await supabase
        .from('referrals')
        .insert([
          {
            referral_code: newReferralCode,
            creator_address: referralForm.targetWalletAddress, // TARGET wallet address
            creator_type: isOwner ? 'owner' : 'nft_holder',
            is_active: true,
            created_at: new Date().toISOString(),
            created_by: accountAddress // WHO created it (you)
          }
        ]);

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Failed to save referral code to database');
        return;
      }

      toast.success(`✅ Referral code ${newReferralCode} created successfully for ${referralForm.targetWalletAddress}!`);
      
      // Reset form
      setReferralForm({ targetWalletAddress: '', referralCode: '' });
      setReferralCreationMode(false);
      
      // Reload referral data
      await loadReferralData();
      
    } catch (error) {
      console.error('Error creating referral code:', error);
      toast.error(`Error creating referral code: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

// ... existing code ...

const verifyOwnReferralCode = async () => {
  if (!referralCode) {
    setVerificationStatus({
      success: false,
      message: 'No referral code to verify.'
    });
    return;
  }

  try {
    setVerificationStatus(null);
    
    // Check if referral code exists and is active
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referral_code', referralCode)
      .eq('creator_address', accountAddress)
      .eq('is_active', true)
      .single();

    if (referralError || !referralData) {
      setVerificationStatus({
        success: false,
        message: 'Invalid or inactive referral code.'
      });
      return;
    }

    // Check if this referral code has already been verified
    if (referralData.is_verified) {
      setVerificationStatus({
        success: false,
        message: 'This referral code has already been used by another wallet.'
      });
      return;
    }

    const isWalletAddressAdded = await     addWalletToContract()

    if(!isWalletAddressAdded) {
      setVerificationStatus({
        success: false,
        message: 'Failed to verify wallet address. Please try again.'
      });
      return;
    }


    // Update referral record to mark as verified
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_wallet: accountAddress
      })
      .eq('referral_code', referralCode);

    if (updateError) {
      console.error('Error updating referral:', updateError);
      setVerificationStatus({
        success: false,
        message: 'Failed to verify referral code. Please try again.'
      });
      return;
    }

    loadReferralStatus()

    // setVerificationStatus({
    //   success: true,
    //   message: 'Referral code verified successfully! You can now mint NFTs.'
    // });

  } catch (error) {
    console.error('Error verifying referral:', error);
    setVerificationStatus({
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    });
  }
};


const verifyReferralCode = async () => {
  if (!account || !referralForm.referralCode) {
    setVerificationResult({
      success: false,
      message: 'Please connect your wallet and enter a referral code.'
    });
    return;
  }

  try {
    setVerificationResult(null);
    
    // Check if referral code exists and is active
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referral_code', referralForm.referralCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (referralError || !referralData) {
      setVerificationResult({
        success: false,
        message: 'Invalid or inactive referral code. Please check and try again.'
      });
      return;
    }

    // Check if this wallet has already been verified with this code
    if (referralData.is_verified) {
      setVerificationResult({
        success: false,
        message: 'This referral code has already been used by another wallet.'
      });
      return;
    }

    // Update referral record to mark as verified
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_wallet: account
      })
      .eq('referral_code', referralForm.referralCode.toUpperCase());

    if (updateError) {
      console.error('Error updating referral:', updateError);
      setVerificationResult({
        success: false,
        message: 'Failed to verify referral code. Please try again.'
      });
      return;
    }

    setVerificationResult({
      success: true,
      message: `Referral code verified successfully! You can now mint NFTs.`
    });

    // Clear the form
    setReferralForm({
      ...referralForm,
      referralCode: ''
    });

  } catch (error) {
    console.error('Error verifying referral:', error);
    setVerificationResult({
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    });
  }
};

// ... existing code ...


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
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full border border-blue-400/30 backdrop-blur-lg mb-6">
            <span className="text-5xl">🔗</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Wallet Not Connected</h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Please connect your wallet to access referral features
          </p>
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-xl p-6 inline-block">
            <p className="text-blue-700 font-medium">
              Connect your wallet to start using the referral system
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full border border-blue-400/30 backdrop-blur-lg mb-6">
          <span className="text-3xl">🎯</span>
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-blue-500 bg-clip-text text-transparent">
          Referral System
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage referrals, create codes for others, and track your referral statistics
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto rounded-full mt-6"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Eligibility Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Your Wallet</h4>
            <div className="bg-gray-100/50 p-3 rounded-lg border border-gray-200/50">
              <p className="text-gray-600 text-sm font-mono break-all">
                {accountAddress}
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Status</h4>
            <div className="space-y-2">
              <div className={`flex items-center text-sm ${isOwner ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{isOwner ? '✅' : '❌'}</span>
                {isOwner ? 'Contract Owner' : 'Not Owner'}
              </div>
              <div className={`flex items-center text-sm ${hasMintedNFTs ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="mr-2">{hasMintedNFTs ? '✅' : '❌'}</span>
                {hasMintedNFTs ? 'Has Minted NFTs' : 'No Minted NFTs'}
              </div>
              <div className={`flex items-center text-sm ${canCreateReferrals ? 'text-green-600' : 'text-red-500'}`}>
                <span className="mr-2">{canCreateReferrals ? '✅' : '❌'}</span>
                {canCreateReferrals ? 'Can Create Referrals' : 'Cannot Create Referrals'}
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Your Referral Code</h4>
            {referralCode ? (
              <div>
                <p className="text-green-600 font-mono text-sm mb-3 bg-green-50/50 p-2 rounded-lg border border-green-200/50">
                  {referralCode}
                </p>
                {referralStatus?.is_verified ? (
                  <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/50 text-green-700 p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium">✅ Verified</p>
                    <p className="text-xs text-green-600 mt-1">
                      Verified by: {referralStatus.verified_wallet?.slice(0, 6)}...{referralStatus.verified_wallet?.slice(-4)}
                    </p>
                    <p className="text-xs text-green-600">
                      Date: {new Date(referralStatus.verified_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-yellow-50/80 to-amber-50/80 border border-yellow-200/50 text-yellow-700 p-3 rounded-lg mb-3">
                    <p className="text-sm font-medium">⏳ Pending Verification</p>
                    <p className="text-xs text-yellow-600">This referral code hasn't been used yet</p>
                  </div>
                )}
                <div className="flex gap-2 mb-3">
                  {!referralStatus?.is_verified && (
                    <button
                      onClick={verifyOwnReferralCode}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Verify Referral Code
                    </button>
                  )}
                </div>
                
                {/* Verification Status Message */}
                {verificationStatus && (
                  <div className={`p-3 rounded-lg border ${
                    verificationStatus.success 
                      ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200/50 text-green-700' 
                      : 'bg-gradient-to-r from-red-50/80 to-red-100/80 border-red-200/50 text-red-700'
                  }`}>
                    <p className="text-sm font-medium">
                      {verificationStatus.success ? '✅ Success!' : '❌ Error'}
                    </p>
                    <p className="text-xs mt-1">{verificationStatus.message}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-sm bg-gray-100/50 p-3 rounded-lg border border-gray-200/50">
                  You don't have a referral code yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => {
              setVerificationMode(false);
              setReferralCreationMode(false);
            }}
            className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
              !verificationMode && !referralCreationMode
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 border border-gray-200/50'
            }`}
          >
            Referral Management
          </button>
          <button
            onClick={() => {
              setVerificationMode(false);
              setReferralCreationMode(true);
            }}
            className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
              referralCreationMode
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 border border-gray-200/50'
            }`}
          >
            Create Referral
          </button>
        </div>

        {!verificationMode && !referralCreationMode ? (
          // Referral Management Mode
          <div className="space-y-8">
            {/* Referral Stats Section */}
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-xl rounded-2xl border border-blue-200/50 shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Referral Statistics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 p-6 text-center shadow-md">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full border border-green-400/30 mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-2">{referralStats.totalEarnings}</div>
                  <div className="text-gray-600 font-medium">Total Earnings</div>
                  <div className="text-sm text-gray-500">SEI</div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 p-6 text-center shadow-md">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full border border-blue-400/30 mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800 mb-2">{referralStats.referralCount}</div>
                  <div className="text-gray-600 font-medium">Referral Count</div>
                  <div className="text-sm text-gray-500">Users</div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 p-6 text-center shadow-md">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full border border-orange-400/30 mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className={`text-2xl font-bold mb-2 ${referralStats.isActive ? 'text-green-600' : 'text-red-500'}`}>
                    {referralStats.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-gray-600 font-medium">Status</div>
                  <div className="text-sm text-gray-500">Current State</div>
                </div>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-gradient-to-r from-purple-50/80 to-violet-50/80 backdrop-blur-xl rounded-2xl border border-purple-200/50 shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">How Referrals Work</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full border border-purple-400/30 text-purple-600 font-bold text-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Eligibility Check</h4>
                    <p className="text-gray-600">
                      Only contract owners or users with minted NFTs can create referral codes for others
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full border border-purple-400/30 text-purple-600 font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Create for Others</h4>
                    <p className="text-gray-600">
                      Generate unique 8-digit referral codes for other wallet addresses
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full border border-purple-400/30 text-purple-600 font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Wallet Verification</h4>
                    <p className="text-gray-600">
                      Users with referral codes get their wallets verified automatically
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : referralCreationMode ? (
          // Referral Creation Mode
          <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-xl rounded-2xl border border-green-200/50 shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Create Referral Code for User</h3>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-green-200/50 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Wallet Address
                  </label>
                  <input
                    type="text"
                    value={referralForm.targetWalletAddress}
                    onChange={(e) => setReferralForm({...referralForm, targetWalletAddress: e.target.value})}
                    placeholder="0x... (wallet address to create referral for)"
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200/50 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-sm"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Enter the wallet address that will receive the referral code
                  </p>
                </div>
                
                <button
                  onClick={createReferralCodeForUser}
                  disabled={isLoading || !referralForm.targetWalletAddress}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Creating...
                    </span>
                  ) : (
                    'Create Referral Code'
                  )}
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl border border-blue-200/50">
                <p className="text-blue-700 text-sm">
                  <strong>How it works:</strong> Enter a wallet address and the system will generate a unique 8-digit referral code 
                  for that address. The referral code will be associated with the target wallet address, not yours.
                </p>
              </div>
            </div>
          </div>
        ) : ( null)}
      </div>
    </div>
  );
}