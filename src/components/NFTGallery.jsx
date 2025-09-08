import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import NFTMintingService from '../services/nftMintingService.js';

export default function NFTGallery({ contractAddress, onNFTMinted }) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');
  const [minting, setMinting] = useState({});

  useEffect(() => {
    checkWalletConnection();
    loadNFTs();
  }, [contractAddress]);

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setAccountAddress(accounts[0]);
        } else {
          setWalletConnected(false);
          setAccountAddress('');
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setWalletConnected(false);
    }
  };

  const loadNFTs = async () => {
    try {
      setLoading(true);
      console.log('NFTGallery: Starting to load NFTs...');
      
      // Load NFTs regardless of wallet connection status
      const nftService = new NFTMintingService(contractAddress, 'https://evm-rpc-testnet.sei-apis.com');
      console.log('NFTGallery: NFTMintingService created, calling getAvailableNFTs...');
      
      const result = await nftService.getAvailableNFTs();
      console.log('NFTGallery: getAvailableNFTs result:', result);
      
      if (result.success) {
        console.log(`NFTGallery: Successfully loaded ${result.nfts.length} NFTs:`, result.nfts);
        // Process NFT data to fix image URLs and rarity display
        const processedNFTs = result.nfts.map(nft => ({
          ...nft,
          // Fix rarity display
          rarityText: getRarityText(nft.rarity),
          // Fix image URL - if it's a placeholder, use a default image
          imageUrl: getValidImageUrl(nft.image),
          // Format price properly
          formattedPrice: ethers.utils.formatEther(nft.price)
        }));
        setNfts(processedNFTs);
      } else {
        console.error('NFTGallery: Failed to load NFTs:', result.error);
        toast.error('Failed to load NFTs');
      }
    } catch (error) {
      console.error('NFTGallery: Error loading NFTs:', error);
      toast.error(`Error loading NFTs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to get valid image URL
  const getValidImageUrl = (imageUrl) => {
    // Check if the image URL is a valid IPFS hash or URL
    if (!imageUrl || imageUrl === '' || 
        imageUrl.includes('QmExplorerImage') || 
        imageUrl.includes('QmWarriorImage') || 
        imageUrl.includes('QmMageImage') || 
        imageUrl.includes('QmLegendImage')) {
      // Return a working placeholder image service
      return 'https://placehold.co/300x300/6366F1/FFFFFF?text=CodeXero+NFT';
    }
    
    // If it's an IPFS hash, convert to gateway URL
    if (imageUrl.startsWith('ipfs://')) {
      return imageUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    }
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Default fallback
    return 'https://placehold.co/300x300/6366F1/FFFFFF?text=CodeXero+NFT';
  };

  // Function to get rarity text from rarity number
  const getRarityText = (rarity) => {
    const rarityMap = {
      1: 'Common',
      2: 'Rare', 
      3: 'Epic',
      4: 'Legendary'
    };
    return rarityMap[rarity] || 'Unknown';
  };

  const handleMint = async (nftId) => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setMinting(prev => ({ ...prev, [nftId]: true }));
      
      const nftService = new NFTMintingService(contractAddress, 'https://evm-rpc-testnet.sei-apis.com');
      const result = await nftService.mintSpecificNFT(nftId);
      
      if (result.success) {
        toast.success(`✅ Successfully minted NFT #${nftId}!`);
        if (onNFTMinted) {
          onNFTMinted(result);
        }
        // Reload NFTs to update supply
        loadNFTs();
      } else {
        toast.error(`Failed to mint NFT: ${result.error}`);
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error(`Error minting NFT: ${error.message}`);
    } finally {
      setMinting(prev => ({ ...prev, [nftId]: false }));
    }
  };

  const connectWallet = async () => {
    try {
      // Request wallet connection
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        await checkWalletConnection();
      } else {
        toast.error('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const getRarityBadge = (rarity) => {
    const badges = {
      'Common': 'bg-gray-500 text-white',
      'Rare': 'bg-blue-500 text-white',
      'Epic': 'bg-purple-500 text-white',
      'Legendary': 'bg-yellow-500 text-white'
    };
    return badges[rarity] || 'bg-gray-500 text-white';
  };

  // Show wallet connection prompt if not connected
  if (!walletConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full border border-orange-400/30 backdrop-blur-lg mb-6">
            <span className="text-3xl">🎨</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-orange-500 bg-clip-text text-transparent">
            Available NFTs
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect your wallet to mint exclusive CodeXero NFTs
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Wallet Connection Prompt */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 rounded-2xl border border-yellow-200/50 shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full border border-yellow-400/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="text-2xl font-bold text-yellow-800 mb-3">Wallet Connection Required</h3>
            <p className="text-gray-700 mb-6">
              Connect your Web3 wallet to view and mint available NFTs from the CodeXero collection
            </p>
            <button
              onClick={connectWallet}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              Connect Wallet
            </button>
          </div>
        </div>

        {/* Show NFTs but with disabled mint buttons */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full border border-orange-400/30 mb-6">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-xl text-gray-600 font-medium">Loading available NFTs...</p>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full border border-gray-400/30 mb-6">
              <span className="text-5xl">🎨</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No NFTs Available</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              There are no NFTs in the collection yet. The contract owner needs to add NFTs first.
            </p>
            <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 border border-gray-200/50 rounded-xl p-6 inline-block">
              <p className="text-gray-700 font-medium">
                Contract owner needs to add NFTs first
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nfts.map((nft) => (
              <div key={nft.nftId} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-orange-200/50 shadow-xl shadow-orange-500/20 overflow-hidden hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105">
                <div className="relative">
                  <img 
                    src={nft.imageUrl} 
                    alt={nft.name} 
                    className="w-full h-56 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/300x300/6366F1/FFFFFF?text=Image+Error';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRarityBadge(nft.rarityText)} shadow-lg`}>
                      {nft.rarityText}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{nft.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{nft.description}</p>
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-gray-500 font-medium">
                      Supply: {nft.currentSupply}/{nft.maxSupply}
                    </span>
                    <span className="text-orange-600 font-bold text-lg">
                      {nft.formattedPrice} SEI
                    </span>
                  </div>
                  <button
                    disabled={true}
                    className="w-full py-3 px-4 rounded-xl font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    Connect Wallet to Mint
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full border border-orange-400/30 mb-6">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading NFTs</h3>
        <p className="text-gray-600">Fetching available NFTs from the blockchain...</p>
      </div>
    );
  }

  // Show no NFTs message
  if (nfts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 text-center py-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full border border-gray-400/30 mb-6">
          <span className="text-5xl">🎨</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">No NFTs Available</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          There are no NFTs in the collection yet. The contract owner needs to add NFTs first.
        </p>
        <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 border border-gray-200/50 rounded-xl p-6 inline-block">
          <p className="text-gray-700 font-medium">
            Contract owner needs to add NFTs first
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full border border-orange-400/30 backdrop-blur-lg mb-6">
          <span className="text-3xl">🎨</span>
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-orange-500 bg-clip-text text-transparent">
          Available NFTs
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
          Mint exclusive CodeXero NFTs from our curated collection
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-full text-sm font-medium text-blue-800">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Connected: {accountAddress ? `${accountAddress.slice(0, 6)}...${accountAddress.slice(-4)}` : 'Unknown'}
        </div>
        <div className="w-32 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full mt-6"></div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {nfts.map((nft) => (
          <div key={nft.nftId} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-orange-200/50 shadow-xl shadow-orange-500/20 overflow-hidden hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105">
            <div className="relative">
              <img 
                src={nft.imageUrl} 
                alt={nft.name} 
                className="w-full h-56 object-cover"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/300x300/6366F1/FFFFFF?text=Image+Error';
                }}
              />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRarityBadge(nft.rarityText)} shadow-lg`}>
                  {nft.rarityText}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">{nft.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{nft.description}</p>
              <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-gray-500 font-medium">
                  Supply: {nft.currentSupply}/{nft.maxSupply}
                </span>
                <span className="text-orange-600 font-bold text-lg">
                  {nft.formattedPrice} SEI
                </span>
              </div>
              <button
                onClick={() => handleMint(nft.nftId)}
                disabled={minting[nft.nftId] || !nft.isAvailable}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  minting[nft.nftId] 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white hover:shadow-xl hover:scale-105 transform shadow-lg'
                }`}
              >
                {minting[nft.nftId] ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Minting...
                  </span>
                ) : (
                  'Mint NFT'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}