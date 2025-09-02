import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import NFTMintingService from '../services/nftMintingService.js';
import { isWalletConnected, getAccountAddress } from '../utils/signerAdapter.js';
import './NFTGallery.css';

export default function NFTGallery({ contractAddress, onNFTMinted }) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState({});
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');

  useEffect(() => {
    checkWalletConnection();
    // Always load NFTs regardless of wallet connection
    loadNFTs();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const connected = await isWalletConnected();
      setWalletConnected(connected);
      
      if (connected) {
        const address = await getAccountAddress();
        setAccountAddress(address);
        loadNFTs();
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
        setNfts(result.nfts);
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
          <div className="nft-grid">
            {nfts.map((nft) => (
              <div key={nft.nftId} className="nft-card">
                <div className="nft-image">
                  <img src={nft.image} alt={nft.name} />
                </div>
                <div className="nft-info">
                  <h3 className="nft-name">{nft.name}</h3>
                  <p className="text-gray-300 mb-2">{nft.description}</p>
                  <div className="nft-details">
                    <span className="nft-rarity">Rarity: {nft.rarity}</span>
                    <span className="nft-supply">
                      {nft.currentSupply}/{nft.maxSupply}
                    </span>
                  </div>
                  <div className="nft-price">
                    Price: {ethers.utils.formatEther(nft.price)} ETH
                  </div>
                  <button
                    disabled={true}
                    className="mint-button disabled"
                    title="Connect wallet to mint"
                  >
                    🔗 Connect Wallet to Mint
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
      <div className="gallery-header">
        <h2 className="text-2xl font-bold text-white mb-4">Available NFTs</h2>
        <p className="text-gray-300 mb-6">
          Connected: {accountAddress ? `${accountAddress.slice(0, 6)}...${accountAddress.slice(-4)}` : 'Unknown'}
        </p>
      </div>

      <div className="nft-grid">
        {nfts.map((nft) => (
          <div key={nft.nftId} className="nft-card">
            <div className="nft-image">
              <img src={nft.image} alt={nft.name} />
            </div>
            <div className="nft-info">
              <h3 className="nft-name">{nft.name}</h3>
              <p className="nft-description">{nft.description}</p>
              <div className="nft-details">
                <span className="nft-rarity">Rarity: {nft.rarity}</span>
                <span className="nft-supply">
                  {nft.currentSupply}/{nft.maxSupply}
                </span>
              </div>
              <div className="nft-price">
                Price: {ethers.utils.formatEther(nft.price)} ETH
              </div>
              <button
                onClick={() => handleMint(nft.nftId)}
                disabled={minting[nft.nftId] || !nft.isAvailable}
                className={`mint-button ${minting[nft.nftId] ? 'minting' : ''}`}
              >
                {minting[nft.nftId] ? 'Minting...' : 'Mint NFT'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
