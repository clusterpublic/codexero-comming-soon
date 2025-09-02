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

class WalletVerificationService {
  constructor(contractAddress, rpcUrl) {
    this.contractAddress = contractAddress;
    this.rpcUrl = rpcUrl;
    // Don't create provider here - we'll create it when needed
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
   * Get contract instance with current provider
   * @returns {Object} ethers contract instance
   */
  getContract() {
    const provider = this.getProvider();
    return new ethers.Contract(this.contractAddress, CONTRACT_ABI, provider);
  }

  /**
   * Check if wallet is eligible for minting
   * @param {string} walletAddress - Wallet address to check
   * @returns {Promise<Object>} Eligibility status
   */
  async checkWalletEligibility(walletAddress) {
    try {
      const [hasNFTs, tokenBalance] = await this.getContract().checkWalletEligibility(walletAddress);
      
      return {
        success: true,
        hasNFTs: hasNFTs,
        tokenBalance: tokenBalance.toString(),
        eligible: hasNFTs || tokenBalance.gte(ethers.utils.parseEther("100"))
      };
    } catch (error) {
      console.error('Error checking wallet eligibility:', error);
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
      const [eligible, reason] = await this.getContract().verifyWalletForMinting(walletAddress);
      
      return {
        success: true,
        eligible: eligible,
        reason: reason,
        walletAddress: walletAddress
      };
    } catch (error) {
      console.error('Error verifying wallet for minting:', error);
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
      const referralData = await this.getContract().getReferralData(referrerAddress);
      
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

