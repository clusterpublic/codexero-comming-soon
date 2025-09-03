import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { createContract, isWalletConnected, getAccountAddress } from '../../utils/signerAdapter.js';
import CONTRACT_ABI from '../../constants/abi.json';
import './Marketplace.css';

export default function Marketplace({ contractAddress }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [walletConnected, setWalletConnected] = useState(false);
    const [accountAddress, setAccountAddress] = useState('');
    const [userNFTs, setUserNFTs] = useState([]);
    const [userMintingHistory, setUserMintingHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('marketplace'); // marketplace, my-nfts, minting-history

    useEffect(() => {
        checkWalletConnection();
        if (contractAddress) {
            loadMarketplaceListings();
        }
    }, [contractAddress]);

    const checkWalletConnection = async () => {
        const connected = await isWalletConnected();
        setWalletConnected(connected);
        if (connected) {
            const address = await getAccountAddress();
            setAccountAddress(address);
        }
    };

    useEffect(() => {
        if (contractAddress && accountAddress) {
            loadUserData()
        }
    }, [contractAddress, accountAddress])

    const loadUserData = async () => {
        if (accountAddress && contractAddress) {
            await Promise.all([
                loadUserNFTs(),
                loadUserMintingHistory()
            ]);
        }
    };

    const loadMarketplaceListings = async () => {
        try {
          setLoading(true);
          const contract = createContract(contractAddress, CONTRACT_ABI.abi);
          const allListings = await contract.getAllListings();
          
          console.log('�� Raw allListings:', allListings);
          
          const listingsData = [];
          for (let i = 0; i < allListings.length; i++) {
            const listing = allListings[i];
            
            // Check if this is an active listing
            if (listing.isActive) {
              try {
                // Get the token ID from the listing
                const tokenId = listing.tokenId;
                
                // Get detailed NFT info using the token ID
                const nftInfo = await contract.getDetailedNFTInfo(tokenId);
                
                listingsData.push({
                  listingId: listing.listingId.toString(),
                  tokenId: tokenId.toString(),
                  price: ethers.utils.formatEther(listing.price),
                  seller: listing.seller,
                  isActive: listing.isActive,
                  nftInfo: nftInfo
                });
              } catch (detailError) {
                console.error('❌ Error getting detailed info for listing:', listing, detailError);
              }
            }
          }
          
          console.log('✅ Final listingsData:', listingsData);
          setListings(listingsData);
        } catch (error) {
          console.error('❌ Error loading marketplace listings:', error);
          toast.error('Failed to load marketplace listings');
        } finally {
          setLoading(false);
        }
      };
    const loadUserNFTs = async () => {
        try {
            console.log('🔍 Loading user NFTs for address:', accountAddress);
            const contract = createContract(contractAddress, CONTRACT_ABI.abi);

            // Debug: Check if contract has the function
            console.log('📋 Contract methods:', Object.keys(contract.functions));

            const userNFTsData = await contract.getUserNFTs(accountAddress);
            console.log('📊 Raw userNFTsData:', userNFTsData);
            console.log('📊 userNFTsData length:', userNFTsData.length);

            const nftsWithDetails = [];
            for (let i = 0; i < userNFTsData.length; i++) {
                const tokenId = userNFTsData[i];
                console.log('�� Processing tokenId:', tokenId.toString());

                try {
                    const detailedInfo = await contract.getDetailedNFTInfo(tokenId);
                    console.log('📋 Detailed info for tokenId', tokenId.toString(), ':', detailedInfo);

                    nftsWithDetails.push({
                        tokenId: tokenId.toString(),
                        ...detailedInfo
                    });
                } catch (detailError) {
                    console.error('❌ Error getting detailed info for tokenId', tokenId.toString(), ':', detailError);
                }
            }

            console.log('✅ Final nftsWithDetails:', nftsWithDetails);
            setUserNFTs(nftsWithDetails);
        } catch (error) {
            console.error('❌ Error loading user NFT:', error);
            toast.error('Failed to load user NFTs');
        }
    };

    const loadUserMintingHistory = async () => {
        try {
            console.log('🔍 Loading minting history for address:', accountAddress);
            const contract = createContract(contractAddress, CONTRACT_ABI.abi);

            const mintingHistory = await contract.getUserMintingHistory(accountAddress);
            console.log('�� Raw mintingHistory:', mintingHistory);
            console.log('📊 mintingHistory length:', mintingHistory.length);

            const historyWithDetails = [];
            for (let i = 0; i < mintingHistory.length; i++) {
                const tokenId = mintingHistory[i];
                console.log('�� Processing minting history tokenId:', tokenId.toString());

                try {
                    const detailedInfo = await contract.getDetailedNFTInfo(tokenId);
                    console.log('📋 Detailed info for minting tokenId', tokenId.toString(), ':', detailedInfo);

                    historyWithDetails.push({
                        tokenId: tokenId.toString(),
                        ...detailedInfo
                    });
                } catch (detailError) {
                    console.error('❌ Error getting detailed info for minting tokenId', tokenId.toString(), ':', detailError);
                }
            }

            console.log('✅ Final minting history:', historyWithDetails);
            setUserMintingHistory(historyWithDetails);
        } catch (error) {
            console.error('❌ Error loading minting history:', error);
            toast.error('Failed to load minting history');
        }
    };

    const listNFTForSale = async (tokenId, price) => {
        try {
            const contract = createContract(contractAddress, CONTRACT_ABI.abi);
            const priceInWei = ethers.utils.parseEther(price);

            const tx = await contract.listNFTForSale(tokenId, priceInWei);
            await tx.wait();

            toast.success('NFT listed for sale successfully!');
            loadUserNFTs();
            loadMarketplaceListings();
        } catch (error) {
            console.error('Error listing NFT:', error);
            toast.error('Failed to list NFT for sale');
        }
    };

    const buyNFT = async (listingId) => {
        try {
            const contract = createContract(contractAddress, CONTRACT_ABI.abi);
            const listing = await contract.getListingByTokenId(listingId);

            const tx = await contract.buyNFT(listingId, { value: listing.price });
            await tx.wait();

            toast.success('NFT purchased successfully!');
            loadMarketplaceListings();
            loadUserData();
        } catch (error) {
            console.error('Error buying NFT:', error);
            toast.error('Failed to purchase NFT');
        }
    };

    const cancelListing = async (listingId) => {
        try {
            const contract = createContract(contractAddress, CONTRACT_ABI.abi);

            const tx = await contract.cancelListing(listingId);
            await tx.wait();

            toast.success('Listing cancelled successfully!');
            loadUserNFTs();
            loadMarketplaceListings();
        } catch (error) {
            console.error('Error cancelling listing:', error);
            toast.error('Failed to cancel listing');
        }
    };

    // Add this function at the top of your component
    const convertIPFSUrl = (ipfsUrl) => {
        if (!ipfsUrl) return '';

        // If it's already a full URL, return as is
        if (ipfsUrl.startsWith('http')) {
            return ipfsUrl;
        }

        // If it's an IPFS hash (starts with Qm...)
        if (ipfsUrl.startsWith('Qm') || ipfsUrl.startsWith('bafy')) {
            return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
        }

        // If it's ipfs:// format
        if (ipfsUrl.startsWith('ipfs://')) {
            const hash = ipfsUrl.replace('ipfs://', '');
            return `https://gateway.pinata.cloud/ipfs/${hash}`;
        }

        // If it's a placeholder like "QmWarriorImage", use a default image
        if (ipfsUrl.includes('Image') || ipfsUrl.includes('Metadata')) {
            return 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&h=300&fit=crop';
        }

        return '';
    };

    // Add this function for better fallback images
    const getFallbackImage = (nftName, rarity) => {
        const rarityColors = {
            1: 'bg-gray-400', // Common
            2: 'bg-blue-400', // Rare
            3: 'bg-purple-400', // Epic
            4: 'bg-yellow-400' // Legendary
        };

        const color = rarityColors[rarity] || 'bg-gray-400';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(nftName)}&background=${color.replace('bg-', '').replace('-400', '')}&color=fff&size=300`;
    };

    const renderMarketplaceTab = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Available NFTs for Sale</h3>
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading marketplace...</p>
                </div>
            ) : listings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No NFTs currently listed for sale</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <div key={listing.listingId} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="aspect-square bg-gray-200">
                                {listing.nftInfo.image ? (
                                    <img
                                        src={convertIPFSUrl(listing.nftInfo.image)}
                                        alt={listing.nftInfo.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Better fallback image
                                            e.target.src = getFallbackImage(
                                                listing.nftInfo.name || 'NFT',
                                                listing.nftInfo.rarity || 1
                                            );
                                        }}
                                    />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center ${getFallbackImage('NFT', 1)}`}>
                                        <span className="text-gray-500 text-sm">No Image</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h4 className="font-semibold text-lg text-gray-800 mb-2">
                                    {listing.nftInfo.name || `NFT #${listing.tokenId}`}
                                </h4>
                                <p className="text-gray-600 text-sm mb-3">
                                    {listing.nftInfo.description || 'No description available'}
                                </p>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-lg font-bold text-blue-600">
                                        {listing.price} SEI
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                                    </span>
                                </div>
                                {walletConnected && accountAddress !== listing.seller && (
                                    <button
                                        onClick={() => buyNFT(listing.listingId)}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Buy Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderMyNFTsTab = () => (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">My NFTs</h3>
          {userNFTs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>You don't own any NFTs yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userNFTs.map((nft) => {
                // Check if this NFT is already listed for sale
                const isListed = listings.some(listing => 
                  listing.tokenId === nft.tokenId && listing.isActive
                );
                
                return (
                  <div key={nft.tokenId} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="aspect-square bg-gray-200">
                      {nft.image ? (
                        <img
                          src={convertIPFSUrl(nft.image)}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = getFallbackImage(nft.name || 'NFT', nft.rarity || 1);
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${getFallbackImage('NFT', 1)}`}>
                          <span className="text-gray-500 text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">
                        {nft.name || `NFT #${nft.tokenId}`}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">
                        {nft.description || 'No description available'}
                      </p>
                      
                      {/* Show listing status */}
                      {isListed && (
                        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-green-800 text-sm font-medium">
                            ✅ Listed for Sale
                          </p>
                          <p className="text-green-600 text-xs">
                            Price: {listings.find(l => l.tokenId === nft.tokenId)?.price} SEI
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            if (isListed) {
                              // If already listed, show current listing info
                              const listing = listings.find(l => l.tokenId === nft.tokenId);
                              toast.info(`This NFT is already listed for ${listing?.price} SEI`);
                            } else {
                              // If not listed, prompt for price
                              const price = prompt('Enter price in SEI:');
                              if (price && !isNaN(price)) {
                                listNFTForSale(nft.tokenId, price);
                              }
                            }
                          }}
                          disabled={isListed}
                          className={`w-full py-2 px-4 rounded-md transition-colors ${
                            isListed 
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {isListed ? 'Already Listed' : 'List for Sale'}
                        </button>
                        
                        {isListed && (
                          <button
                            onClick={() => {
                              // Cancel listing functionality
                              const listing = listings.find(l => l.tokenId === nft.tokenId);
                              if (listing) {
                                cancelListing(listing.listingId);
                              }
                            }}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                          >
                            Cancel Listing
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            // Transfer NFT functionality
                            const recipient = prompt('Enter recipient address:');
                            if (recipient) {
                              // Implement transfer function
                              toast.info('Transfer functionality coming soon');
                            }
                          }}
                          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Transfer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );

    const renderMintingHistoryTab = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">My Minting History</h3>
            {userMintingHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No minting history found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userMintingHistory.map((nft) => (
                        <div key={nft.tokenId} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="aspect-square bg-gray-200">
                                {nft.image ? (
                                    <img
                                        src={convertIPFSUrl(nft.image)}
                                        alt={nft.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = getFallbackImage(nft.name || 'NFT', nft.rarity || 1);
                                        }}
                                    />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center ${getFallbackImage('NFT', 1)}`}>
                                        <span className="text-gray-500 text-sm">No Image</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h4 className="font-semibold text-lg text-gray-800 mb-2">
                                    {nft.name || `NFT #${nft.tokenId}`}
                                </h4>
                                <p className="text-gray-600 text-sm mb-3">
                                    {nft.description || 'No description available'}
                                </p>
                                <div className="text-sm text-gray-500">
                                    <p>Token ID: {nft.tokenId}</p>
                                    <p>Minted by: {accountAddress.slice(0, 6)}...{accountAddress.slice(-4)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">NFT Marketplace</h2>
                <p className="text-gray-600">Buy, sell, and trade your CodeXero NFTs</p>
            </div>

            {!walletConnected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800">
                        Please connect your wallet to access marketplace features
                    </p>
                </div>
            )}

            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('marketplace')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'marketplace'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Marketplace
                        </button>
                        <button
                            onClick={() => setActiveTab('my-nfts')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-nfts'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            My NFTs
                        </button>
                        <button
                            onClick={() => setActiveTab('minting-history')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'minting-history'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Minting History
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'marketplace' && renderMarketplaceTab()}
            {activeTab === 'my-nfts' && renderMyNFTsTab()}
            {activeTab === 'minting-history' && renderMintingHistoryTab()}
        </div>
    );
}