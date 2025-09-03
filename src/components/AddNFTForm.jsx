import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { createContract, isWalletConnected, getAccountAddress } from '../utils/signerAdapter.js';
import IPFSService from '../services/ipfsService.js';
import CONTRACT_ABI from '../constants/abi.json';

export default function AddNFTForm({ contractAddress }) {
  const [formData, setFormData] = useState({
    nftId: '',
    name: '',
    description: '',
    image: null,
    metadata: '',
    rarity: '1',
    price: '',
    attributes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize IPFS service
  const ipfsService = new IPFSService();

  // Generate random NFT ID function
  const generateRandomNFTId = () => {
    // Generate a random 6-digit number starting from 100000
  
    return Date.now()
  };

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
        const contract = createContract(contractAddress, CONTRACT_ABI.abi);
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === address.toLowerCase());
        
        // If owner, generate a random NFT ID
        if (owner.toLowerCase() === address.toLowerCase()) {
          const randomId = generateRandomNFTId();
          setFormData(prev => ({
            ...prev,
            nftId: randomId.toString()
          }));
        }
      }
    } catch (error) {
      console.error('Error checking wallet and ownership:', error);
      setWalletConnected(false);
      setIsOwner(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateNewNFTId = () => {
    const newId = generateRandomNFTId();
    setFormData(prev => ({
      ...prev,
      nftId: newId.toString()
    }));
    toast.info(`🆔 Generated new NFT ID: ${newId}`);
  };

  const uploadImageToIPFS = async (file) => {
    try {
      setUploadProgress(10);
      toast.info(' Uploading image to IPFS...');
      
      const imageHash = await ipfsService.uploadFile(file);
      setUploadProgress(100);
      
      toast.success('✅ Image uploaded to IPFS successfully!');
      return imageHash;
    } catch (error) {
      console.error('Error uploading image to IPFS:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
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
    if (!formData.nftId || !formData.name || !formData.description || !formData.image || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setUploadProgress(0);
      
      // Step 1: Upload image to IPFS
      const imageHash = await uploadImageToIPFS(formData.image);
      const imageUrl = `ipfs://${imageHash}`;
      
      // Step 2: Create metadata and upload to IPFS
      const metadata = {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        external_url: 'https://codexero.com',
        attributes: formData.attributes ? JSON.parse(formData.attributes) : [],
        rarity: parseInt(formData.rarity),
        nft_id: parseInt(formData.nftId),
        created_at: new Date().toISOString(),
        creator: 'CodeXero',
        collection: 'CodeXero NFTs'
      };
      
      setUploadProgress(50);
      toast.info(' Uploading metadata to IPFS...');
      
      const metadataHash = await ipfsService.uploadMetadata(metadata);
      const metadataUrl = `ipfs://${metadataHash}`;
      
      setUploadProgress(75);
      
      // Step 3: Add NFT to contract
      const contract = createContract(contractAddress, CONTRACT_ABI.abi);
      
      // Convert price to wei (SEI uses 18 decimals like ETH)
      const priceInWei = ethers.utils.parseEther(formData.price);
      
      // Add the NFT with IPFS links
      const tx = await contract.addPreExistingNFT(
        parseInt(formData.nftId),
        formData.name,
        formData.description,
        imageUrl,
        metadataUrl,
        parseInt(formData.rarity),
        1, // Default max supply (can be updated later)
        priceInWei,
        formData.attributes || '{}'
      );
      
      toast.info('Adding NFT to contract... Please wait for transaction confirmation');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      toast.success('✅ NFT added successfully to contract!');
      console.log('Transaction receipt:', receipt);
      
      // Reset form and generate new random ID
      const newRandomId = generateRandomNFTId();
      setFormData({
        nftId: newRandomId.toString(),
        name: '',
        description: '',
        image: null,
        metadata: '',
        rarity: '1',
        price: '',
        attributes: ''
      });
      setImagePreview('');
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Error adding NFT:', error);
      toast.error(`Error adding NFT: ${error.message}`);
      setUploadProgress(0);
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
      
      const contract = createContract(contractAddress, CONTRACT_ABI.abi);
      
      // Sample NFTs data with random IDs
      const sampleNFTs = [
        {
          nftId: generateRandomNFTId(),
          name: "Cosmic Explorer #1",
          description: "A rare cosmic explorer NFT with unique space attributes",
          image: "ipfs://QmSampleImage1",
          metadata: "ipfs://QmSampleMetadata1",
          rarity: 2,
          price: "0.01",
          attributes: "Type: Explorer, Rarity: Rare, Element: Cosmic"
        },
        {
          nftId: generateRandomNFTId(),
          name: "Digital Warrior #1",
          description: "A legendary digital warrior with powerful combat abilities",
          image: "ipfs://QmSampleImage2",
          metadata: "ipfs://QmSampleMetadata2",
          rarity: 4,
          price: "0.05",
          attributes: "Type: Warrior, Rarity: Legendary, Class: Combat"
        },
        {
          nftId: generateRandomNFTId(),
          name: "Mystic Mage #1",
          description: "An epic mystic mage with ancient magical powers",
          image: "ipfs://QmSampleImage3",
          metadata: "ipfs://QmSampleMetadata3",
          rarity: 3,
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
            1, // Default max supply
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
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full border border-orange-400/30 backdrop-blur-lg mb-6">
            <span className="text-5xl">🔗</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Wallet Not Connected</h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Please connect your wallet to add NFTs to the CodeXero collection
          </p>
          <button
            onClick={connectWallet}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-400/20 to-red-500/20 rounded-full border border-red-400/30 backdrop-blur-lg mb-6">
            <span className="text-5xl">🚫</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Only the contract owner can add NFTs to the collection
          </p>
          <div className="bg-gradient-to-r from-red-50/80 to-orange-50/80 border border-red-200/50 rounded-xl p-6 inline-block">
            <p className="text-red-700 font-medium">
              You need to be the contract owner to access this feature
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
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full border border-orange-400/30 backdrop-blur-lg mb-6">
          <span className="text-3xl">➕</span>
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-orange-500 bg-clip-text text-transparent">
          Add New NFT
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Add pre-existing NFTs to the collection with direct IPFS upload
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full mt-6"></div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-orange-200/50 shadow-2xl shadow-orange-500/20 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Name Field */}
            <div className="space-y-3">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter NFT name"
                required
                className="w-full bg-white/80 border border-gray-200/50 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter NFT description"
                rows="3"
                required
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-white/80 border border-gray-200/50 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none shadow-sm"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label htmlFor="image" className="block text-sm font-semibold text-gray-700">
                Image File *
              </label>
              <div className="border-2 border-dashed border-orange-200/50 rounded-xl p-8 text-center hover:border-orange-400 transition-colors duration-300 bg-gradient-to-r from-orange-50/30 to-red-50/30">
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img src={imagePreview} alt="Preview" className="mx-auto max-h-48 rounded-xl shadow-lg" />
                      <p className="text-orange-600 font-medium">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full border border-orange-400/30 mb-4">
                        <span className="text-3xl">📁</span>
                      </div>
                      <p className="text-gray-800 text-lg font-medium">Click to upload image</p>
                      <p className="text-gray-600 text-sm">PNG, JPG, GIF • Max 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Rarity and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="rarity" className="block text-sm font-semibold text-gray-700">
                  Rarity
                </label>
                <select
                  id="rarity"
                  name="rarity"
                  value={formData.rarity}
                  onChange={handleInputChange}
                  className="w-full bg-white/80 border border-gray-200/50 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                >
                  <option value="1" className="bg-white text-gray-800">Common</option>
                  <option value="2" className="bg-white text-gray-800">Rare</option>
                  <option value="3" className="bg-white text-gray-800">Epic</option>
                  <option value="4" className="bg-white text-gray-800">Legendary</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700">
                  Price (SEI) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price in SEI"
                  step="0.001"
                  min="0"
                  required
                  className="w-full bg-white/80 border border-gray-200/50 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            {/* Attributes */}
            <div className="space-y-3">
              <label htmlFor="attributes" className="block text-sm font-semibold text-gray-700">
                Attributes (JSON)
              </label>
              <textarea
                id="attributes"
                name="attributes"
                value={formData.attributes}
                onChange={handleInputChange}
                placeholder='Enter JSON attributes (e.g., {"type": "Explorer", "rarity": "Rare"})'
                rows="2"
                className="w-full bg-white/80 border border-gray-200/50 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none shadow-sm"
              />
              <small className="text-gray-500 text-sm">
                Optional: JSON format for custom attributes
              </small>
            </div>

            {/* Upload Progress Bar */}
            {uploadProgress > 0 && (
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-center text-gray-700 font-semibold">{uploadProgress}% Complete</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Adding NFT...
                  </span>
                ) : (
                  'Add NFT'
                )}
              </button>
              
              <button
                type="button"
                onClick={addSampleNFTs}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Adding...
                  </span>
                ) : (
                  'Add Sample NFTs'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}