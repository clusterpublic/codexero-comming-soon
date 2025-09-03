import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { createContract, isWalletConnected, getAccountAddress } from '../../utils/signerAdapter.js';
import CONTRACT_ABI from '../../constants/abi.json';

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
          
          console.log(' Raw allListings:', allListings);
          
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
                console.log(' Processing tokenId:', tokenId.toString());

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
            console.log(' Raw mintingHistory:', mintingHistory);
            console.log('📊 mintingHistory length:', mintingHistory.length);

            const historyWithDetails = [];
            for (let i = 0; i < mintingHistory.length; i++) {
                const tokenId = mintingHistory[i];
                console.log(' Processing minting history tokenId:', tokenId.toString());

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
        <div className="space-y-8">
            <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Available NFTs for Sale</h3>
                <p className="text-gray-600 text-lg">Discover and purchase unique CodeXero NFTs from other collectors</p>
            </div>
            
            {loading ? (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full border border-blue-400/30 backdrop-blur-lg mb-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-xl text-gray-600 font-medium">Loading marketplace...</p>
                </div>
            ) : listings.length === 0 ? (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full border border-gray-400/30 backdrop-blur-lg mb-6">
                        <span className="text-4xl">🏪</span>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">No NFTs Available</h4>
                    <p className="text-gray-600 text-lg">No NFTs are currently listed for sale</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {listings.map((listing) => (
                        <div key={listing.listingId} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-500/20 overflow-hidden hover:shadow-2xl hover:shadow-gray-500/30 transition-all duration-300 hover:scale-105 group">
                            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                                {listing.nftInfo.image ? (
                                    <img
                                        src={convertIPFSUrl(listing.nftInfo.image)}
                                        alt={listing.nftInfo.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                            // Better fallback image
                                            e.target.src = getFallbackImage(
                                                listing.nftInfo.name || 'NFT',
                                                listing.nftInfo.rarity || 1
                                            );
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-gray-500 text-lg font-medium">No Image</span>
                                    </div>
                                )}
                                
                                {/* Price Badge */}
                                <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                    {listing.price} SEI
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <h4 className="font-bold text-xl text-gray-800 mb-3 line-clamp-2">
                                    {listing.nftInfo.name || `NFT #${listing.tokenId}`}
                                </h4>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {listing.nftInfo.description || 'No description available'}
                                </p>
                                
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Seller:</span>
                                        <span className="text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">
                                            {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                                        </span>
                                    </div>
                                </div>
                                
                                {walletConnected && accountAddress !== listing.seller && (
                                    <button
                                        onClick={() => buyNFT(listing.listingId)}
                                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
        <div className="space-y-8">
            <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">My NFT Collection</h3>
                <p className="text-gray-600 text-lg">Manage and trade your owned CodeXero NFTs</p>
            </div>
            
            {userNFTs.length === 0 ? (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full border border-gray-400/30 backdrop-blur-lg mb-6">
                        <span className="text-4xl">🎨</span>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">No NFTs Yet</h4>
                    <p className="text-gray-600 text-lg">You don't own any NFTs yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {userNFTs.map((nft) => {
                        // Check if this NFT is already listed for sale
                        const isListed = listings.some(listing => 
                            listing.tokenId === nft.tokenId && listing.isActive
                        );
                        
                        return (
                            <div key={nft.tokenId} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-500/20 overflow-hidden hover:shadow-2xl hover:shadow-gray-500/30 transition-all duration-300 hover:scale-105 group">
                                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                                    {nft.image ? (
                                        <img
                                            src={convertIPFSUrl(nft.image)}
                                            alt={nft.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.src = getFallbackImage(nft.name || 'NFT', nft.rarity || 1);
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-gray-500 text-lg font-medium">No Image</span>
                                        </div>
                                    )}
                                    
                                    {/* Status Badge */}
                                    {isListed && (
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                            Listed
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-6">
                                    <h4 className="font-bold text-xl text-gray-800 mb-3 line-clamp-2">
                                        {nft.name || `NFT #${nft.tokenId}`}
                                    </h4>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {nft.description || 'No description available'}
                                    </p>
                                    
                                    {/* Show listing status */}
                                    {isListed && (
                                        <div className="mb-4 p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/50 rounded-xl">
                                            <p className="text-green-800 text-sm font-medium">
                                                ✅ Listed for Sale
                                            </p>
                                            <p className="text-green-600 text-xs mt-1">
                                                Price: {listings.find(l => l.tokenId === nft.tokenId)?.price} SEI
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-3">
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
                                            className={`w-full py-3 px-6 rounded-xl transition-all duration-300 font-medium ${
                                                isListed 
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
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
                                                className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                                            className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
        <div className="space-y-8">
            <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">My Minting History</h3>
                <p className="text-gray-600 text-lg">Track all the NFTs you've minted on CodeXero</p>
            </div>
            
            {userMintingHistory.length === 0 ? (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full border border-gray-400/30 backdrop-blur-lg mb-6">
                        <span className="text-4xl">📜</span>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-2">No Minting History</h4>
                    <p className="text-gray-600 text-lg">No minting history found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {userMintingHistory.map((nft) => (
                        <div key={nft.tokenId} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-500/20 overflow-hidden hover:shadow-2xl hover:shadow-gray-500/30 transition-all duration-300 hover:scale-105 group">
                            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                                {nft.image ? (
                                    <img
                                        src={convertIPFSUrl(nft.image)}
                                        alt={nft.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.src = getFallbackImage(nft.name || 'NFT', nft.rarity || 1);
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-gray-500 text-lg font-medium">No Image</span>
                                    </div>
                                )}
                                
                                {/* Minted Badge */}
                                <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                    Minted
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <h4 className="font-bold text-xl text-gray-800 mb-3 line-clamp-2">
                                    {nft.name || `NFT #${nft.tokenId}`}
                                </h4>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {nft.description || 'No description available'}
                                </p>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Token ID:</span>
                                        <span className="text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">
                                            {nft.tokenId}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Minted by:</span>
                                        <span className="text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">
                                            {accountAddress.slice(0, 6)}...{accountAddress.slice(-4)}
                                        </span>
                                    </div>
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
            {/* Header Section */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full border border-blue-400/30 backdrop-blur-lg mb-6">
                    <span className="text-3xl">🏪</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-blue-500 bg-clip-text text-transparent">
                    NFT Marketplace
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Buy, sell, and trade your CodeXero NFTs in a secure and user-friendly marketplace
                </p>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto rounded-full mt-6"></div>
            </div>

            {!walletConnected && (
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="bg-gradient-to-r from-yellow-50/80 to-amber-50/80 backdrop-blur-xl rounded-2xl border border-yellow-200/50 shadow-lg p-6">
                        <div className="flex items-center space-x-3">
                            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full border border-yellow-400/30">
                                <span className="text-xl">🔗</span>
                            </div>
                            <p className="text-yellow-800 font-medium">
                                Please connect your wallet to access marketplace features
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-2">
                    <nav className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('marketplace')}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                                activeTab === 'marketplace'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                            }`}
                        >
                            Marketplace
                        </button>
                        <button
                            onClick={() => setActiveTab('my-nfts')}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                                activeTab === 'my-nfts'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                            }`}
                        >
                            My NFTs
                        </button>
                        <button
                            onClick={() => setActiveTab('minting-history')}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                                activeTab === 'minting-history'
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                            }`}
                        >
                            Minting History
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'marketplace' && renderMarketplaceTab()}
            {activeTab === 'my-nfts' && renderMyNFTsTab()}
            {activeTab === 'minting-history' && renderMintingHistoryTab()}
        </div>
    );
}