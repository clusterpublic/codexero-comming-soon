import { ethers } from 'ethers';
import { createContract } from '../utils/signerAdapter.js';

// Contract ABI for minting functions - Updated for pre-existing NFTs
const MINTING_ABI = [
  "function mintSpecificNFT(uint256 nftId, address referrer) payable",
  "function getNFTInfo(uint256 nftId) view returns (tuple(uint256 nftId, string name, string description, string image, string metadata, uint256 rarity, bool isAvailable, uint256 maxSupply, uint256 currentSupply, uint256 price, string attributes))",
  "function getTokenNFTId(uint256 tokenId) view returns (uint256)",
  "function maxMintPerWallet() view returns (uint256)",
  "function mintedCount(address wallet) view returns (uint256)",
  "function verifyWalletForMinting(address wallet) view returns (bool eligible, string reason)"
];

class NFTMintingService {
  constructor(contractAddress, rpcUrl) {
    this.contractAddress = contractAddress;
    this.contract = createContract(contractAddress, MINTING_ABI);
    this.rpcUrl = rpcUrl;
  }

  // Get all available NFTs
  async getAvailableNFTs() {
    try {
      console.log('Getting available NFTs from contract:', this.contractAddress);
      
      // Try to fetch NFTs from the contract first
      const nfts = [];
      let nftId = 1;
      const maxAttempts = 1000; // Prevent infinite loop
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        try {
          // Try to get NFT info from the contract
          const nftInfo = await this.contract.getNFTInfo(nftId);
          
          // Check if this NFT exists and is available
          if (nftInfo.nftId.toString() !== '0' && nftInfo.isAvailable) {
            nfts.push({
              nftId: nftInfo.nftId.toString(),
              name: nftInfo.name,
              description: nftInfo.description,
              image: nftInfo.image,
              metadata: nftInfo.metadata,
              rarity: nftInfo.rarity.toString(),
              isAvailable: nftInfo.isAvailable,
              maxSupply: nftInfo.maxSupply.toString(),
              currentSupply: nftInfo.currentSupply.toString(),
              price: nftInfo.price,
              attributes: nftInfo.attributes
            });
            console.log(`Found NFT #${nftId}: ${nftInfo.name}`);
          }
          
          nftId++;
          attempts++;
          
        } catch (error) {
          // If we get an error, this NFT ID doesn't exist, so we can stop
          if (error.message && (error.message.includes('NFT not found') || 
                               error.message.includes('reverted') || 
                               error.message.includes('execution reverted'))) {
            console.log(`No more NFTs found after ID ${nftId - 1}`);
            break;
          } else {
            // For other errors, log and continue
            console.warn(`Error checking NFT #${nftId}:`, error.message);
            nftId++;
            attempts++;
          }
        }
      }
      
      // If no NFTs found in contract, return empty array
      if (nfts.length === 0) {
        console.log('No NFTs found in contract, returning empty array');
        return {
          success: true,
          nfts: []
        };
      }
      
      console.log(`Found ${nfts.length} NFTs in contract`);
      return {
        success: true,
        nfts: nfts
      };
      
    } catch (error) {
      console.error('Error getting available NFTs:', error);
      
      // Fallback to mock NFTs if contract call fails
      console.log('Falling back to mock NFTs due to error');
      const mockNFTs = [
        {
          nftId: 1001,
          name: "Cosmic Explorer #1",
          description: "A rare cosmic explorer NFT with unique space attributes",
          image: "https://via.placeholder.com/300x300/6366F1/FFFFFF?text=Cosmic+1",
          metadata: "https://example.com/metadata/cosmic1.json",
          rarity: 2,
          isAvailable: true,
          maxSupply: 100,
          currentSupply: 0,
          price: ethers.utils.parseEther("0.01"),
          attributes: "Type: Explorer, Rarity: Rare, Element: Cosmic"
        },
        {
          nftId: 1002,
          name: "Digital Warrior #1",
          description: "A legendary digital warrior with powerful combat abilities",
          image: "https://via.placeholder.com/300x300/DC2626/FFFFFF?text=Warrior+1",
          metadata: "https://example.com/metadata/warrior1.json",
          rarity: 4,
          maxSupply: 25,
          currentSupply: 0,
          price: ethers.utils.parseEther("0.05"),
          attributes: "Type: Warrior, Rarity: Legendary, Class: Combat"
        },
        {
          nftId: 1003,
          name: "Mystic Mage #1",
          description: "An epic mystic mage with ancient magical powers",
          image: "https://via.placeholder.com/300x300/7C3AED/FFFFFF?text=Mage+1",
          metadata: "https://example.com/metadata/mage1.json",
          rarity: 3,
          maxSupply: 50,
          currentSupply: 0,
          price: ethers.utils.parseEther("0.025"),
          attributes: "Type: Mage, Rarity: Epic, School: Mystic"
        }
      ];

      return {
        success: true,
        nfts: mockNFTs
      };
    }
  }

  // Get specific NFT info
  async getNFTInfo(nftId) {
    try {
      const nftInfo = await this.contract.getNFTInfo(nftId);
      return {
        success: true,
        nft: {
          nftId: nftInfo.nftId.toString(),
          name: nftInfo.name,
          description: nftInfo.description,
          image: nftInfo.image,
          metadata: nftInfo.metadata,
          rarity: nftInfo.rarity.toString(),
          isAvailable: nftInfo.isAvailable,
          maxSupply: nftInfo.maxSupply.toString(),
          currentSupply: nftInfo.currentSupply.toString(),
          price: nftInfo.price,
          attributes: nftInfo.attributes
        }
      };
    } catch (error) {
      console.error('Error getting NFT info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mint a specific NFT
  async mintSpecificNFT(nftId, referrer = ethers.constants.AddressZero) {
    try {
      console.log(`Minting NFT #${nftId} with referrer:`, referrer);
      
      // Get NFT info to get the price
      const nftInfo = await this.getNFTInfo(nftId);
      if (!nftInfo.success) {
        throw new Error('Failed to get NFT info');
      }

      const price = nftInfo.nft.price;
      console.log('NFT price:', ethers.utils.formatEther(price), 'ETH');

      // Call the mint function
      const tx = await this.contract.mintSpecificNFT(nftId, referrer, { value: price });
      console.log('Mint transaction sent:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Mint transaction confirmed:', receipt);

      return {
        success: true,
        transactionHash: tx.hash,
        receipt: receipt
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default NFTMintingService;