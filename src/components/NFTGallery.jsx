import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import NFTMintingService from '../services/nftMintingService.js';
import './NFTGallery.css';

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
      'Common': 'bg-gray-600',
      'Rare': 'bg-blue-600',
      'Epic': 'bg-purple-600',
      'Legendary': 'bg-yellow-600'
    };
    return badges[rarity] || 'bg-gray-600';
  };

  // Show wallet connection prompt if not connected
  if (!walletConnected) {
    return (
      <div className="nft-gallery">
        <div className="gallery-header">
          <h2 className="text-2xl font-bold text-white mb-4">Available NFTs</h2>
          <div className="bg-yellow-900 bg-opacity-50 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-center">
              🔗 Connect your wallet to mint NFTs
            </p>
            <div className="text-center mt-3">
              <button
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>

        {/* Show NFTs but with disabled mint buttons */}
        {loading ? (
          <div className="text-center py-8">
            <div className="loading-spinner mb-4"></div>
            <p className="text-gray-300">Loading available NFTs...</p>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-white mb-2">No NFTs Available</h3>
            <p className="text-gray-300 mb-4">
              There are no NFTs in the collection yet
            </p>
            <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 inline-block">
              <p className="text-blue-300 text-sm">
                Contract owner needs to add NFTs first
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => (
              <div key={nft.nftId} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="nft-image mb-4">
                  <img 
                    src={nft.imageUrl} 
                    alt={nft.name} 
                    className="w-full h-48 object-cover rounded-lg shadow-lg"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/300x300/6366F1/FFFFFF?text=Image+Error';
                    }}
                  />
                </div>
                <div className="nft-info">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{nft.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRarityBadge(nft.rarityText)}`}>
                      {nft.rarityText}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{nft.description}</p>
                  <div className="flex justify-between items-center mb-3 text-sm">
                    <span className="text-gray-400">
                      Supply: {nft.currentSupply}/{nft.maxSupply}
                    </span>
                    <span className="text-green-400 font-semibold">
                      {nft.formattedPrice} SEI
                    </span>
                  </div>
                  <button
                    disabled={true}
                    className="w-full py-2 px-4 rounded-lg font-semibold bg-gray-600 text-gray-300 cursor-not-allowed"
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
      <div className="text-center py-8">
        <div className="loading-spinner mb-4"></div>
        <p className="text-gray-300">Loading available NFTs...</p>
      </div>
    );
  }

  // Show no NFTs message
  if (nfts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-xl font-semibold text-white mb-2">No NFTs Available</h3>
        <p className="text-gray-300 mb-4">
          There are no NFTs in the collection yet
        </p>
        <div className="bg-blue-900 bg-opacity-50 rounded-lg p-4 inline-block">
          <p className="text-blue-300 text-sm">
            Contract owner needs to add NFTs first
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-gallery">
      <div className="gallery-header text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Available NFTs</h2>
        <p className="text-gray-300">
          Connected: {accountAddress ? `${accountAddress.slice(0, 6)}...${accountAddress.slice(-4)}` : 'Unknown'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <div key={nft.nftId} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="nft-image mb-4">
              <img 
                src={nft.imageUrl} 
                alt={nft.name} 
                className="w-full h-48 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/300x300/6366F1/FFFFFF?text=Image+Error';
                }}
              />
            </div>
            <div className="nft-info">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">{nft.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRarityBadge(nft.rarityText)}`}>
                  {nft.rarityText}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-3 line-clamp-2">{nft.description}</p>
              <div className="flex justify-between items-center mb-3 text-sm">
                <span className="text-gray-400">
                  Supply: {nft.currentSupply}/{nft.maxSupply}
                </span>
                <span className="text-green-400 font-semibold">
                  {nft.formattedPrice} SEI
                </span>
              </div>
              <button
                onClick={() => handleMint(nft.nftId)}
                disabled={minting[nft.nftId] || !nft.isAvailable}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  minting[nft.nftId] 
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:transform hover:scale-105'
                }`}
              >
                {minting[nft.nftId] ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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