import { create } from 'ipfs-http-client';

class IPFSService {
  constructor() {
    // Initialize IPFS client with your credentials
    this.ipfs = this.initializeIPFS();
  }

  initializeIPFS() {
    // Check if JWT access token is available (preferred method)
    if (import.meta.env.VITE_JWT_ACCESS_TOKEN) {
      return create({
        host: 'api.pinata.cloud',
        port: 443,
        protocol: 'https',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_JWT_ACCESS_TOKEN}`
        }
      });
    }
    
    // Fallback to project ID and secret
    if (import.meta.env.VITE_IPFS_PROJECT_ID && import.meta.env.VITE_IPFS_PROJECT_SECRET) {
      return create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: `Basic ${btoa(
            import.meta.env.VITE_IPFS_PROJECT_ID + ':' + import.meta.env.VITE_IPFS_PROJECT_SECRET
          )}`
        }
      });
    }
    
    // Fallback: Public IPFS gateway (limited functionality)
    console.warn('No IPFS credentials found. Using public gateway with limited functionality.');
    return create({
      host: 'ipfs.io',
      port: 443,
      protocol: 'https'
    });
  }

  /**
   * Upload file to IPFS via Pinata
   * @param {File|Buffer} file - File to upload
   * @returns {Promise<string>} IPFS hash
   */
  async uploadFile(file) {
    try {
      // For Pinata, we need to use their specific API endpoint
      if (import.meta.env.VITE_JWT_ACCESS_TOKEN) {
        return await this.uploadToPinata(file);
      } else {
        // Use regular IPFS client for other providers
        const result = await this.ipfs.add(file);
        return result.path;
      }
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload file to Pinata using their API
   * @param {File} file - File to upload
   * @returns {Promise<string>} IPFS hash
   */
  async uploadToPinata(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_JWT_ACCESS_TOKEN}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      throw error;
    }
  }

  /**
   * Upload JSON metadata to IPFS via Pinata
   * @param {Object} metadata - JSON metadata object
   * @returns {Promise<string>} IPFS hash
   */
  async uploadMetadata(metadata) {
    try {
      if (import.meta.env.VITE_JWT_ACCESS_TOKEN) {
        return await this.uploadMetadataToPinata(metadata);
      } else {
        // Use regular IPFS client for other providers
        const json = JSON.stringify(metadata);
        const result = await this.ipfs.add(json);
        return result.path;
      }
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload metadata to Pinata using their API
   * @param {Object} metadata - JSON metadata object
   * @returns {Promise<string>} IPFS hash
   */
  async uploadMetadataToPinata(metadata) {
    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_JWT_ACCESS_TOKEN}`
        },
        body: JSON.stringify(metadata)
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading metadata to Pinata:', error);
      throw error;
    }
  }

  /**
   * Get IPFS URL for a given hash (Pinata gateway)
   * @param {string} hash - IPFS hash
   * @returns {string} IPFS URL
   */
  getIPFSUrl(hash) {
    // Use Pinata gateway for better reliability
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }

  /**
   * Upload NFT pack metadata
   * @param {Object} packData - Pack metadata
   * @returns {Promise<string>} IPFS hash
   */
  async uploadPackMetadata(packData) {
    try {
      const metadata = {
        name: packData.name,
        description: packData.description,
        image: packData.image,
        external_url: packData.externalUrl,
        attributes: packData.attributes,
        pack_id: packData.packId,
        max_supply: packData.maxSupply,
        created_at: new Date().toISOString(),
        creator: 'CodeXero',
        collection: 'CodeXero NFTs'
      };

      return await this.uploadMetadata(metadata);
    } catch (error) {
      console.error('Error uploading pack metadata:', error);
      throw error;
    }
  }

  /**
   * Create complete NFT metadata with IPFS links
   * @param {Object} nftData - NFT data
   * @param {string} imageHash - IPFS hash of the image
   * @returns {Promise<string>} IPFS hash of metadata
   */
  async createNFTMetadata(nftData, imageHash) {
    try {
      const metadata = {
        name: nftData.name,
        description: nftData.description,
        image: this.getIPFSUrl(imageHash),
        external_url: nftData.externalUrl || 'https://codexero.com',
        attributes: nftData.attributes || [],
        rarity: nftData.rarity || 'Common',
        pack_id: nftData.packId,
        token_id: nftData.tokenId,
        created_at: new Date().toISOString(),
        creator: 'CodeXero',
        collection: 'CodeXero NFTs'
      };

      return await this.uploadMetadata(metadata);
    } catch (error) {
      console.error('Error creating NFT metadata:', error);
      throw error;
    }
  }

  /**
   * Optimize image for NFT (resize and compress)
   * @param {File} imageFile - Image file to optimize
   * @returns {Promise<File>} Optimized image file
   */
  async optimizeImageForNFT(imageFile) {
    // This is a placeholder for image optimization
    // You can implement actual image optimization here
    return imageFile;
  }
}

export default IPFSService;