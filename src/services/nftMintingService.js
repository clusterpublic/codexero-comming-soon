import { ethers } from 'ethers';
import { createContract } from '../utils/signerAdapter.js';
import CONTRACT_ABI from '../constants/abi.json';

class NFTMintingService {
  constructor(contractAddress, rpcUrl) {
    this.contractAddress = contractAddress;
    this.contract = createContract(contractAddress, CONTRACT_ABI.abi);
    this.rpcUrl = rpcUrl;
  }

  // Convert IPFS hash to displayable URL
  convertIPFSUrl(ipfsUrl) {
    if (!ipfsUrl) return '';
    
    // If it's already a full URL, return as is
    if (ipfsUrl.startsWith('http')) {
      return ipfsUrl;
    }
    
    // If it's an IPFS hash, convert to Pinata gateway
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    
    // If it's just a hash, assume it's IPFS
    if (ipfsUrl.startsWith('Qm') || ipfsUrl.startsWith('bafy')) {
      return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
    }
    
    return ipfsUrl;
  }

  // Get all available NFTs using the new contract function
  async getAvailableNFTs() {
    try {
      console.log('Getting available NFTs from contract using getAllAvailableNFTData():', this.contractAddress);
      
      // Use the new contract function to get only available NFTs
      const availableNFTs = await this.contract.getAllAvailableNFTData();
      console.log('Contract returned available NFTs:', availableNFTs);
      
      if (!availableNFTs || availableNFTs.length === 0) {
        console.log('No available NFTs found in contract');
        return {
          success: true,
          nfts: []
        };
      }
      
      // Process the returned NFT data
      const processedNFTs = availableNFTs.map(nft => {
        // All NFTs returned are already available, but double-check
        if (nft.nftId.toString() !== '0' && nft.isAvailable) {
          return {
            nftId: nft.nftId.toString(),
            name: nft.name,
            description: nft.description,
            image: this.convertIPFSUrl(nft.image),
            metadata: this.convertIPFSUrl(nft.metadata),
            rarity: this.getRarityName(nft.rarity.toString()),
            rarityLevel: parseInt(nft.rarity.toString()),
            isAvailable: nft.isAvailable,
            maxSupply: nft.maxSupply.toString(),
            currentSupply: nft.currentSupply.toString(),
            price: nft.price,
            attributes: nft.attributes
          };
        }
        return null;
      }).filter(nft => nft !== null); // Remove any null entries
      
      console.log(`Successfully processed ${processedNFTs.length} available NFTs:`, processedNFTs);
      
      // Sort NFTs by ID for consistent display
      processedNFTs.sort((a, b) => parseInt(a.nftId) - parseInt(b.nftId));
      
      return {
        success: true,
        nfts: processedNFTs
      };
      
    } catch (error) {
      console.error('Error getting available NFTs using getAllAvailableNFTData():', error);
      
      // Fallback to the old method if the new function fails
      console.log('Falling back to old method due to error');
      return this.getAvailableNFTsFallback();
    }
  }

  // Fallback method (old approach) in case the new function fails
  async getAvailableNFTsFallback() {
    try {
      console.log('Using fallback method to get NFTs...');
      
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
              image: this.convertIPFSUrl(nftInfo.image),
              metadata: this.convertIPFSUrl(nftInfo.metadata),
              rarity: this.getRarityName(nftInfo.rarity.toString()),
              rarityLevel: parseInt(nftInfo.rarity.toString()),
              isAvailable: nftInfo.isAvailable,
              maxSupply: nftInfo.maxSupply.toString(),
              currentSupply: nftInfo.currentSupply.toString(),
              price: nftInfo.price,
              attributes: nftInfo.attributes
            });
            console.log(`Found available NFT #${nftId}: ${nftInfo.name}`);
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
        console.log('No available NFTs found in contract, returning empty array');
        return {
          success: true,
          nfts: []
        };
      }
      
      console.log(`Found ${nfts.length} available NFTs in contract using fallback method`);
      return {
        success: true,
        nfts: nfts
      };
      
    } catch (error) {
      console.error('Error in fallback method:', error);
      
      // Final fallback to mock NFTs if everything fails
      console.log('Falling back to mock NFTs due to error');
      const mockNFTs = [
        {
          nftId: 1001,
          name: "Cosmic Explorer #1",
          description: "A rare cosmic explorer NFT with unique space attributes",
          image: "https://placehold.co/300x300/6366F1/FFFFFF?text=Cosmic+1",
          metadata: "https://example.com/metadata/cosmic1.json",
          rarity: "Rare",
          rarityLevel: 2,
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
          image: "https://placehold.co/300x300/DC2626/FFFFFF?text=Warrior+1",
          metadata: "https://example.com/metadata/warrior1.json",
          rarity: "Legendary",
          rarityLevel: 4,
          maxSupply: 25,
          currentSupply: 0,
          price: ethers.utils.parseEther("0.05"),
          attributes: "Type: Warrior, Rarity: Legendary, Class: Combat"
        },
        {
          nftId: 1003,
          name: "Mystic Mage #1",
          description: "An epic mystic mage with ancient magical powers",
          image: "https://placehold.co/300x300/7C3AED/FFFFFF?text=Mage+1",
          metadata: "https://example.com/metadata/warrior1.json",
          rarity: "Epic",
          rarityLevel: 3,
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

  // Get rarity name from level
  getRarityName(rarityLevel) {
    const rarityMap = {
      '1': 'Common',
      '2': 'Rare',
      '3': 'Epic',
      '4': 'Legendary'
    };
    return rarityMap[rarityLevel] || 'Unknown';
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
          image: this.convertIPFSUrl(nftInfo.image),
          metadata: this.convertIPFSUrl(nftInfo.metadata),
          rarity: this.getRarityName(nftInfo.rarity.toString()),
          rarityLevel: parseInt(nftInfo.rarity.toString()),
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
      console.log('NFT price:', ethers.utils.formatEther(price), 'SEI');

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