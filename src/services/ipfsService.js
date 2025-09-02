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
      const result = await this.ipfs.add(file);
      return result.path;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
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
      const json = JSON.stringify(metadata);
      const result = await this.ipfs.add(json);
      return result.path;
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
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
        created_at: new Date().toISOString()
      };

      return await this.uploadMetadata(metadata);
    } catch (error) {
      console.error('Error uploading pack metadata:', error);
      throw error;
    }
  }

  /**
   * Upload individual NFT metadata
   * @param {Object} nftData - NFT metadata
   * @returns {Promise<string>} IPFS hash
   */
  async uploadNFTMetadata(nftData) {
    try {
      const metadata = {
        name: nftData.name,
        description: nftData.description,
        image: nftData.image,
        external_url: nftData.externalUrl,
        attributes: nftData.attributes,
        rarity: nftData.rarity,
        pack_id: nftData.packId,
        token_id: nftData.tokenId,
        created_at: new Date().toISOString()
      };

      return await this.uploadMetadata(metadata);
    } catch (error) {
      console.error('Error uploading NFT metadata:', error);
      throw error;
    }
  }

  /**
   * Batch upload multiple files
   * @param {File[]} files - Array of files to upload
   * @returns {Promise<string[]>} Array of IPFS hashes
   */
  async batchUploadFiles(files) {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error in batch upload:', error);
      throw error;
    }
  }

  /**
   * Pin IPFS hash to ensure availability
   * @param {string} hash - IPFS hash to pin
   * @returns {Promise<boolean>} Success status
   */
  async pinHash(hash) {
    try {
      await this.ipfs.pin.add(hash);
      return true;
    } catch (error) {
      console.error('Error pinning hash:', error);
      return false;
    }
  }

  /**
   * Upload image file with Pinata optimization
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<string>} IPFS hash
   */
  async uploadImage(imageFile) {
    try {
      // Optimize image for NFT standards
      const optimizedFile = await this.optimizeImageForNFT(imageFile);
      return await this.uploadFile(optimizedFile);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Optimize image for NFT standards
   * @param {File} imageFile - Original image file
   * @returns {Promise<File>} Optimized image file
   */
  async optimizeImageForNFT(imageFile) {
    // For now, return the original file
    // You can add image optimization logic here later
    return imageFile;
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
}

export default IPFSService;