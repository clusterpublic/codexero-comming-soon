import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { createContract, isWalletConnected, getAccountAddress } from '../utils/signerAdapter.js';
import './AddNFTForm.css';

// Contract ABI for adding NFTs
const CONTRACT_ABI = [
  "function addPreExistingNFT(uint256 nftId, string name, string description, string image, string metadata, uint256 rarity, uint256 maxSupply, uint256 price, string attributes) external",
  "function owner() external view returns (address)"
];

export default function AddNFTForm({ contractAddress }) {
  const [formData, setFormData] = useState({
    nftId: '',
    name: '',
    description: '',
    image: '',
    metadata: '',
    rarity: '1',
    maxSupply: '',
    price: '',
    attributes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [nextAvailableId, setNextAvailableId] = useState(1001);

  // Check wallet connection and ownership on mount
  useEffect(() => {
    checkWalletAndOwnership();
  }, []);

  const checkWalletAndOwnership = async () => {
    try {
      const connected = await isWalletConnected();
      setWalletConnected(connected);
      
      if (connected) {
        const address = await getAccountAddress();
        const contract = createContract(contractAddress, CONTRACT_ABI);
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === address.toLowerCase());
        
        // If owner, try to find next available NFT ID
        if (owner.toLowerCase() === address.toLowerCase()) {
          await findNextAvailableId();
        }
      }
    } catch (error) {
      console.error('Error checking wallet and ownership:', error);
      setWalletConnected(false);
      setIsOwner(false);
    }
  };

  const findNextAvailableId = async () => {
    try {
      // Start checking from ID 1001 and find the next available one
      let testId = 1001;
      const maxAttempts = 100; // Prevent infinite loop
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        try {
          // Try to get NFT info - if it fails, the ID is available
          await contract.getNFTInfo(testId);
          // If we get here, the ID exists, try the next one
          testId++;
        } catch (error) {
          // If error contains "NFT not found" or similar, this ID is available
          if (error.message && (error.message.includes('NFT not found') || error.message.includes('reverted'))) {
            setNextAvailableId(testId);
            break;
          }
          testId++;
        }
        attempts++;
      }
      
      // Update form with suggested ID
      setFormData(prev => ({
        ...prev,
        nftId: nextAvailableId.toString()
      }));
      
    } catch (error) {
      console.error('Error finding next available ID:', error);
      // Fallback to default ID
      setNextAvailableId(1001);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isOwner) {
      toast.error('Only contract owner can add NFTs');
      return;
    }

    // Validate form data
    if (!formData.nftId || !formData.name || !formData.description || !formData.image || !formData.maxSupply || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      const contract = createContract(contractAddress, CONTRACT_ABI);
      
      // Convert price to wei
      const priceInWei = ethers.utils.parseEther(formData.price);
      
      // Add the NFT
      const tx = await contract.addPreExistingNFT(
        parseInt(formData.nftId),
        formData.name,
        formData.description,
        formData.image,
        formData.metadata,
        parseInt(formData.rarity),
        parseInt(formData.maxSupply),
        priceInWei,
        formData.attributes
      );
      
      toast.info('Adding NFT... Please wait for transaction confirmation');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      toast.success('✅ NFT added successfully!');
      console.log('Transaction receipt:', receipt);
      
      // Reset form
      setFormData({
        nftId: '',
        name: '',
        description: '',
        image: '',
        metadata: '',
        rarity: '1',
        maxSupply: '',
        price: '',
        attributes: ''
      });
      
    } catch (error) {
      console.error('Error adding NFT:', error);
      toast.error(`Error adding NFT: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addSampleNFTs = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isOwner) {
      toast.error('Only contract owner can add NFTs');
      return;
    }

    try {
      setIsLoading(true);
      
      const contract = createContract(contractAddress, CONTRACT_ABI);
      
      // Sample NFTs data with unique IDs (starting from higher numbers to avoid conflicts)
      const sampleNFTs = [
        {
          nftId: 1001,
          name: "Cosmic Explorer #1",
          description: "A rare cosmic explorer NFT with unique space attributes",
          image: "https://via.placeholder.com/300x300/6366F1/FFFFFF?text=Cosmic+1",
          metadata: "https://example.com/metadata/cosmic1.json",
          rarity: 2,
          maxSupply: 100,
          price: "0.01",
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
          price: "0.05",
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
          price: "0.025",
          attributes: "Type: Mage, Rarity: Epic, School: Mystic"
        }
      ];

      toast.info('Adding sample NFTs... This may take a few minutes');
      
      for (const nft of sampleNFTs) {
        try {
          const priceInWei = ethers.utils.parseEther(nft.price);
          
          console.log(`Adding sample NFT #${nft.nftId}: ${nft.name}`);
          
          const tx = await contract.addPreExistingNFT(
            nft.nftId,
            nft.name,
            nft.description,
            nft.image,
            nft.metadata,
            nft.rarity,
            nft.maxSupply,
            priceInWei,
            nft.attributes
          );
          
          await tx.wait();
          console.log(`Added sample NFT #${nft.nftId}`);
          toast.success(`✅ Added ${nft.name}`);
          
        } catch (error) {
          console.error(`Error adding NFT #${nft.nftId}:`, error);
          
          // Check if it's a duplicate NFT ID error
          if (error.message && error.message.includes('NFT ID already exists')) {
            toast.warning(`⚠️ NFT #${nft.nftId} already exists, skipping...`);
            continue; // Skip this NFT and continue with the next one
          } else {
            // For other errors, show the error and stop
            toast.error(`Failed to add ${nft.name}: ${error.message}`);
            break;
          }
        }
      }
      
      toast.success('✅ Sample NFTs process completed!');
      
    } catch (error) {
      console.error('Error adding sample NFTs:', error);
      toast.error(`Error adding sample NFTs: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        await checkWalletAndOwnership();
      } else {
        toast.error('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  if (!walletConnected) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🔗</div>
        <h3 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h3>
        <p className="text-gray-300 mb-4">
          Please connect your wallet to add NFTs
        </p>
        <button
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🚫</div>
        <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
        <p className="text-gray-300 mb-4">
          Only the contract owner can add NFTs
        </p>
      </div>
    );
  }

  return (
    <div className="add-nft-form">
      <div className="form-header">
        <h2 className="text-2xl font-bold text-white mb-4">Add New NFT</h2>
        <p className="text-gray-300 mb-6">
          Add pre-existing NFTs to the collection
        </p>
      </div>

      <form onSubmit={handleSubmit} className="nft-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nftId">NFT ID *</label>
            <input
              type="number"
              id="nftId"
              name="nftId"
              value={formData.nftId}
              onChange={handleInputChange}
              placeholder="Enter unique NFT ID"
              required
            />
            {nextAvailableId > 1001 && (
              <small className="text-blue-400 text-sm mt-1">
                💡 Suggested ID: {nextAvailableId} (to avoid conflicts)
              </small>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter NFT name"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter NFT description"
            rows="3"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="image">Image URL *</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="Enter image URL"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="metadata">Metadata URL</label>
            <input
              type="url"
              id="metadata"
              name="metadata"
              value={formData.metadata}
              onChange={handleInputChange}
              placeholder="Enter metadata URL (optional)"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rarity">Rarity</label>
            <select
              id="rarity"
              name="rarity"
              value={formData.rarity}
              onChange={handleInputChange}
            >
              <option value="1">Common</option>
              <option value="2">Rare</option>
              <option value="3">Epic</option>
              <option value="4">Legendary</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="maxSupply">Max Supply *</label>
            <input
              type="number"
              id="maxSupply"
              name="maxSupply"
              value={formData.maxSupply}
              onChange={handleInputChange}
              placeholder="Enter max supply"
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price (ETH) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price in ETH"
              step="0.001"
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="attributes">Attributes</label>
            <input
              type="text"
              id="attributes"
              name="attributes"
              value={formData.attributes}
              onChange={handleInputChange}
              placeholder="Enter attributes (optional)"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? 'Adding NFT...' : 'Add NFT'}
          </button>
          
          <button
            type="button"
            onClick={addSampleNFTs}
            disabled={isLoading}
            className="sample-button"
          >
            {isLoading ? 'Adding...' : 'Add Sample NFTs'}
          </button>
        </div>
      </form>
    </div>
  );
}
