import { ethers } from 'ethers';

// Contract ABI for wallet verification functions
const CONTRACT_ABI = [
  "function checkWalletEligibility(address wallet) view returns (bool hasNFTs, uint256 tokenBalance)",
  "function verifyWalletForMinting(address wallet) view returns (bool eligible, string reason)",
  "function getReferralData(address referrer) view returns (tuple(address referrer, uint256 referralCount, uint256 totalEarnings, bool isActive))",
  "function mint(address to, uint256 packId, address referrer) payable",
  "function batchMint(address to, uint256[] packIds, address referrer) payable",
  "function getTotalSupply() view returns (uint256)",
  "function getRemainingSupply() view returns (uint256)",
  "function getPackURI(uint256 packId) view returns (string)",
  "function mintingEnabled() view returns (bool)"
];

// Sei testnet configuration
const SEI_TESTNET_CONFIG = {
  chainId: 1328,
  chainName: 'Sei Testnet',
  nativeCurrency: {
    name: 'SEI',
    symbol: 'SEI',
    decimals: 18,
  },
  rpcUrls: ['https://evm-rpc-testnet.sei-apis.com'],
  blockExplorerUrls: ['https://seitrace.com'],
};

class WalletVerificationService {
  constructor(contractAddress, rpcUrl) {
    this.contractAddress = contractAddress;
    this.rpcUrl = rpcUrl;
    this.targetChainId = SEI_TESTNET_CONFIG.chainId;
  }

  /**
   * Get the browser's Web3 provider
   * @returns {Object} ethers Web3Provider
   */
  getProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.providers.Web3Provider(window.ethereum);
    }
    // Fallback to JsonRpcProvider if no browser provider
    return new ethers.providers.JsonRpcProvider(this.rpcUrl);
  }

  /**
   * Check if the current network matches the target network
   * @returns {Promise<boolean>} True if network matches
   */
  async checkNetworkMatch() {
    try {
      const provider = this.getProvider();
      const network = await provider.getNetwork();
      return network.chainId === this.targetChainId;
    } catch (error) {
      console.warn('Error checking network:', error);
      return false;
    }
  }

  /**
   * Switch to the target network if needed
   * @returns {Promise<boolean>} True if network switch was successful
   */
  async switchToTargetNetwork() {
    if (typeof window === 'undefined' || !window.ethereum) {
      return false;
    }

    try {
      // Try to switch to the target network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${this.targetChainId.toString(16)}` }],
      });
      return true;
    } catch (switchError) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEI_TESTNET_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      } else {
        console.error('Error switching network:', switchError);
        return false;
      }
    }
  }

  /**
   * Get contract instance with current provider
   * @returns {Object} ethers contract instance
   */
  getContract() {
    const provider = this.getProvider();
    return new ethers.Contract(this.contractAddress, CONTRACT_ABI, provider);
  }

  /**
   * Get contract instance with signer for transactions
   * @returns {Object} ethers contract instance with signer
   */
  getContractWithSigner() {
    const provider = this.getProvider();
    const signer = provider.getSigner();
    return new ethers.Contract(this.contractAddress, CONTRACT_ABI, signer);
  }

  /**
   * Check if wallet is eligible for minting
   * @param {string} walletAddress - Wallet address to check
   * @returns {Promise<Object>} Eligibility status
   */
  async checkWalletEligibility(walletAddress) {
    try {
      // First check if we're on the correct network
      const isCorrectNetwork = await this.checkNetworkMatch();
      if (!isCorrectNetwork) {
        // Try to switch to the target network
        const switchSuccess = await this.switchToTargetNetwork();
        if (!switchSuccess) {
          return {
            success: false,
            error: `Please switch to ${SEI_TESTNET_CONFIG.chainName} (Chain ID: ${this.targetChainId}) to check wallet eligibility`
          };
        }
      }

      // Validate the wallet address format
      if (!ethers.utils.isAddress(walletAddress)) {
        return {
          success: false,
          error: 'Invalid wallet address format'
        };
      }

      const [hasNFTs, tokenBalance] = await this.getContract().checkWalletEligibility(walletAddress);
      
      return {
        success: true,
        hasNFTs: hasNFTs,
        tokenBalance: tokenBalance.toString(),
        eligible: hasNFTs || tokenBalance.gte(ethers.utils.parseEther("100"))
      };
    } catch (error) {
      console.error('Error checking wallet eligibility:', error);
      
      // Handle specific ENS errors
      if (error.code === 'UNSUPPORTED_OPERATION' && error.message.includes('network does not support ENS')) {
        return {
          success: false,
          error: `Network does not support ENS. Please ensure you're connected to ${SEI_TESTNET_CONFIG.chainName}`
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify wallet for minting with detailed reason
   * @param {string} walletAddress - Wallet address to verify
   * @returns {Promise<Object>} Verification result
   */
  async verifyWalletForMinting(walletAddress) {
    try {
      // First check if we're on the correct network
      const isCorrectNetwork = await this.checkNetworkMatch();
      if (!isCorrectNetwork) {
        // Try to switch to the target network
        const switchSuccess = await this.switchToTargetNetwork();
        if (!switchSuccess) {
          return {
            success: false,
            error: `Please switch to ${SEI_TESTNET_CONFIG.chainName} (Chain ID: ${this.targetChainId}) to verify wallet eligibility`
          };
        }
      }

      // Validate the wallet address format
      if (!ethers.utils.isAddress(walletAddress)) {
        return {
          success: false,
          error: 'Invalid wallet address format'
        };
      }

      const [eligible, reason] = await this.getContract().verifyWalletForMinting(walletAddress);
      
      return {
        success: true,
        eligible: eligible,
        reason: reason,
        walletAddress: walletAddress
      };
    } catch (error) {
      console.error('Error verifying wallet for minting:', error);
      
      // Handle specific ENS errors
      if (error.code === 'UNSUPPORTED_OPERATION' && error.message.includes('network does not support ENS')) {
        return {
          success: false,
          error: `Network does not support ENS. Please ensure you're connected to ${SEI_TESTNET_CONFIG.chainName}`
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get referral data for an address
   * @param {string} referrerAddress - Referrer address
   * @returns {Promise<Object>} Referral data
   */
  async getReferralData(referrerAddress) {
    try {
      console.log('Using direct RPC provider for referral data');
      const provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);
      const contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, provider);
      
      const referralData = await contract.getReferralData(referrerAddress);
      
      return {
        success: true,
        referrer: referralData.referrer,
        referralCount: referralData.referralCount.toString(),
        totalEarnings: ethers.utils.formatEther(referralData.totalEarnings),
        isActive: referralData.isActive
      };
    } catch (error) {
      console.error('Error getting referral data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if minting is enabled
   * @returns {Promise<boolean>} Minting status
   */
  async isMintingEnabled() {
    try {
      return await this.getContract().mintingEnabled();
    } catch (error) {
      console.error('Error checking minting status:', error);
      return false;
    }
  }

  /**
   * Get contract statistics
   * @returns {Promise<Object>} Contract stats
   */
  async getContractStats() {
    try {
      const [totalSupply, remainingSupply, mintingEnabled] = await Promise.all([
        this.getContract().getTotalSupply(),
        this.getContract().getRemainingSupply(),
        this.getContract().mintingEnabled()
      ]);

      return {
        success: true,
        totalSupply: totalSupply.toString(),
        remainingSupply: remainingSupply.toString(),
        mintingEnabled: mintingEnabled
      };
    } catch (error) {
      console.error('Error getting contract stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get pack information
   * @param {number} packId - Pack ID
   * @returns {Promise<Object>} Pack info
   */
  async getPackInfo(packId) {
    try {
      const packURI = await this.getContract().getPackURI(packId);
      
      return {
        success: true,
        packId: packId,
        packURI: packURI
      };
    } catch (error) {
      console.error('Error getting pack info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if address has referral override
   * @param {string} walletAddress - Wallet address to check
   * @param {string} referrerAddress - Referrer address
   * @returns {Promise<boolean>} Has referral override
   */
  async hasReferralOverride(walletAddress, referrerAddress) {
    try {
      const referralData = await this.getReferralData(referrerAddress);
      
      if (!referralData.success || !referralData.isActive) {
        return false;
      }

      // Check if referrer has referrals (indicating they're a valid referrer)
      return parseInt(referralData.referralCount) > 0;
    } catch (error) {
      console.error('Error checking referral override:', error);
      return false;
    }
  }

  /**
   * Validate wallet address format
   * @param {string} address - Address to validate
   * @returns {boolean} Is valid address
   */
  isValidAddress(address) {
    try {
      return ethers.utils.isAddress(address);
    } catch (error) {
      return false;
    }
  }

  /**
   * Format wallet address for display
   * @param {string} address - Address to format
   * @returns {string} Formatted address
   */
  formatAddress(address) {
    if (!this.isValidAddress(address)) {
      return 'Invalid Address';
    }
    
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export default WalletVerificationService;

