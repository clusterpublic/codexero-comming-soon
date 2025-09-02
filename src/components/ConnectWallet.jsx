import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { UserProfileService } from '../services/userProfileService.js'
import WalletVerificationService from '../services/walletVerificationService.js'
import NFTMintingService from '../services/nftMintingService.js'
import { toast } from 'react-toastify'

// Contract configuration - Updated for your environment
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x...'; // Add your deployed contract address
const RPC_URL = 'https://evm-rpc-testnet.sei-apis.com';

// Browser wallet connection functions
const connectBrowserWallet = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  } else {
    throw new Error('No Web3 provider found. Please install MetaMask or another Web3 wallet.');
  }
};

async function createOrUpdateUserProfile(normalizedAddress, userId) {
  try {
    // Check if user profile already exists
    const { data: existingProfile, error: selectError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', selectError)
      return null
    }

    if (existingProfile) {
      // Update existing profile with new connection timestamp
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          wallet_connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating existing profile:', updateError)
        return null
      }

      console.log('Updated existing user profile:', updatedProfile)
      return updatedProfile
    } else {
      // Create new user profile
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          wallet_address: normalizedAddress,
          wallet_connected_at: new Date().toISOString(),
          verification_metadata: {
            wallet_connection_source: 'web3_connect',
            user_agent: navigator.userAgent,
            connection_timestamp: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating new profile:', insertError)
        return null
      }

      console.log('Created new user profile:', newProfile)
      return newProfile
    }
  } catch (error) {
    console.error('Error in createOrUpdateUserProfile:', error)
    return null
  }

  // Also update waitlist if exists (backward compatibility)
  try {
    await upsertWaitlistConnection(normalizedAddress)
  } catch (error) {
    console.warn('Waitlist update failed (non-critical):', error)
  }
}

async function upsertWaitlistConnection(normalizedAddress) {
  // Try lower-case column first (matches current app usage)
  const { data: existingLower, error: selectLowerErr } = await supabase
    .from('waitlist_subscriptions')
    .select('id, walletaddress')
    .eq('walletaddress', normalizedAddress)
    .limit(1)
    .maybeSingle()

  if (selectLowerErr) {
    // Continue fallback to camelCase check
    // console.warn('Select lower-case walletaddress error:', selectLowerErr)
  }

  let targetId = existingLower?.id

  if (!targetId) {
    // Fallback: check camelCase column used in SQL script
    const { data: existingCamel } = await supabase
      .from('waitlist_subscriptions')
      .select('id, walletAddress')
      .eq('walletAddress', normalizedAddress)
      .limit(1)
      .maybeSingle()

    targetId = existingCamel?.id
  }

  if (targetId) {
    // Update status/timestamp without inserting new email (email is NOT NULL in schema)
    await supabase
      .from('waitlist_subscriptions')
      .update({ status: 'wallet_connected', updated_at: new Date().toISOString() })
      .eq('id', targetId)
  }
}

export default function ConnectWallet() {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // State for wallet verification
  const [walletVerification, setWalletVerification] = useState({
    isChecking: false,
    isEligible: false,
    hasNFTs: false,
    tokenBalance: '0',
    reason: 'Not checked yet'
  });
  
  // State for referral system
  const [referralCode, setReferralCode] = useState('');
  const [referralData, setReferralData] = useState(null);

  // Initialize wallet verification service
  const walletVerificationService = new WalletVerificationService(CONTRACT_ADDRESS, RPC_URL);

  // Check if wallet is already connected
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            checkWalletEligibility(accounts[0].toLowerCase());
          }
        } catch (error) {
          console.error('Error checking existing wallet connection:', error);
        }
      }
    };

    checkExistingConnection();
  }, []);

  // Listen for wallet connection changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          setWalletAddress(null);
          setWalletVerification({
            isChecking: false,
            isEligible: false,
            hasNFTs: false,
            tokenBalance: '0',
            reason: 'Wallet disconnected'
          });
        } else {
          // User switched accounts
          setWalletAddress(accounts[0]);
          checkWalletEligibility(accounts[0].toLowerCase());
        }
      };

      const handleChainChanged = () => {
        // Reload page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Check wallet eligibility when connected
  const checkWalletEligibility = async (walletAddress) => {
    if (!walletAddress) return;
    
    setWalletVerification(prev => ({ ...prev, isChecking: true }));
    
    try {
      const result = await walletVerificationService.verifyWalletForMinting(walletAddress);
      
      if (result.success) {
        setWalletVerification({
          isChecking: false,
          isEligible: result.eligible,
          hasNFTs: false, // This would come from the contract
          tokenBalance: '0', // This would come from the contract
          reason: result.reason
        });
      } else {
        setWalletVerification({
          isChecking: false,
          isEligible: false,
          hasNFTs: false,
          tokenBalance: '0',
          reason: result.error || 'Verification failed'
        });
      }
    } catch (error) {
      console.error('Wallet verification error:', error);
      setWalletVerification({
        isChecking: false,
        isEligible: false,
        hasNFTs: false,
        tokenBalance: '0',
        reason: 'Error during verification'
      });
    }
  };

  // Check referral code
  const checkReferralCode = async (code) => {
    if (!code) return;
    
    try {
      const result = await walletVerificationService.getReferralData(code);
      
      if (result.success && result.isActive) {
        setReferralData(result);
        // Override wallet verification for referral users
        setWalletVerification(prev => ({ ...prev, isEligible: true, reason: 'Referral override' }));
        toast.success('Referral code applied successfully!');
      } else {
        toast.error('Invalid or inactive referral code');
      }
    } catch (error) {
      console.error('Referral check error:', error);
      toast.error('Failed to verify referral code');
    }
  };

  // Handle referral form submission
  const handleReferralSubmit = (e) => {
    e.preventDefault();
    checkReferralCode(referralCode);
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const address = await connectBrowserWallet();
      setWalletAddress(address);
      await checkWalletEligibility(address.toLowerCase());
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet. Please ensure MetaMask is installed and unlocked.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setWalletVerification({
      isChecking: false,
      isEligible: false,
      hasNFTs: false,
      tokenBalance: '0',
      reason: 'Wallet disconnected'
    });
    toast.info('Wallet disconnected');
  };

  // Handle mint button click
  const handleMintClick = () => {
    if (!walletAddress) {
      toast.error('Wallet not connected. Please connect your wallet first.');
      return;
    }
    checkWalletEligibility(walletAddress.toLowerCase());
  };

  return (
    <div className="connect-wallet-container">
      <div className="wallet-section">
        <h2 className="section-title">Connect Your Wallet</h2>
        <p className="section-description">
          Connect your wallet to start your CodeXero journey
        </p>
        
        {!walletAddress ? (
          <button 
            onClick={handleConnectWallet} 
            className="connect-btn"
            disabled={isConnecting}
          >
            {isConnecting ? '🔗 Connecting...' : '🔗 Connect Wallet'}
          </button>
        ) : (
          <div className="wallet-info">
            <div className="wallet-address">
              <span className="label">Connected:</span>
              <span className="address">{walletAddress}</span>
            </div>
            <button onClick={handleDisconnectWallet} className="disconnect-btn">
              🔌 Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Referral System */}
      <div className="referral-section">
        <h3 className="section-title">Referral System</h3>
        <p className="section-description">
          Have a referral code? Enter it to bypass wallet verification requirements.
        </p>
        <form onSubmit={handleReferralSubmit} className="referral-form">
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="Enter referral code..."
            className="referral-input"
            disabled={walletVerification.isEligible}
          />
          <button 
            type="submit" 
            className="referral-submit-btn"
            disabled={walletVerification.isEligible || !referralCode}
          >
            Apply Code
          </button>
        </form>
        {referralData && (
          <div className="referral-success">
            ✅ Referral code applied! Referrer: {referralData.referrer}
          </div>
        )}
      </div>

      {/* Wallet Verification Status */}
      {walletAddress && (
        <div className="verification-status">
          <h3 className="section-title">Wallet Verification Status</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Wallet Address:</span>
              <span className="status-value">{walletAddress}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Status:</span>
              <span className={`status-value ${walletVerification.isEligible ? 'eligible' : 'not-eligible'}`}>
                {walletVerification.isChecking ? 'Checking...' : 
                 walletVerification.isEligible ? '✅ Eligible' : '❌ Not Eligible'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Has NFTs:</span>
              <span className="status-value">
                {walletVerification.hasNFTs ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Token Balance:</span>
              <span className="status-value">
                {walletVerification.tokenBalance} SEI
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Reason:</span>
              <span className="status-value reason">
                {walletVerification.reason}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {walletAddress && (
        <div className="action-buttons">
          {walletVerification.isEligible ? (
            <button
              onClick={() => navigate('/mint-nft')}
              className="proceed-btn"
            >
              🚀 Proceed to Minting
            </button>
          ) : (
            <div className="eligibility-actions">
              <button
                onClick={() => checkWalletEligibility(walletAddress.toLowerCase())}
                className="retry-btn"
                disabled={walletVerification.isChecking}
              >
                🔄 Retry Verification
              </button>
              <p className="eligibility-help">
                Need help? Contact support or use a referral code above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}