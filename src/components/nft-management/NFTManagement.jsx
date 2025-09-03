import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { createContract, isWalletConnected, getAccountAddress } from '../../utils/signerAdapter.js';
import CONTRACT_ABI from '../../constants/abi.json';

export default function NFTManagement({ contractAddress }) {
  const [allNFTs, setAllNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [stats, setStats] = useState({
    totalSupply: '0',
    remainingSupply: '0',
    totalNFTs: '0'
  });
  
  // Form states for updating NFTs
  const [editingNFT, setEditingNFT] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    isAvailable: true,
    price: ''
  });

  useEffect(() => {
    checkWalletConnection();
  }, [contractAddress]);

  const checkWalletConnection = async () => {
    const connected = await isWalletConnected();
    setWalletConnected(connected);
    if (connected) {
      const address = await getAccountAddress();
      setAccountAddress(address);
      loadNFTData();
    }
  };

  useEffect(()=>{
if(accountAddress && contractAddress){
    checkOwnership();
}
  },[contractAddress, accountAddress])

  const checkOwnership = async () => {
    try {
      const contract = createContract(contractAddress, CONTRACT_ABI.abi);
      const owner = await contract.owner();
      console.log("owner", owner, 'accountAddress', accountAddress)
      setIsOwner(owner.toLowerCase() === accountAddress.toLowerCase());
    } catch (error) {
      console.error('Error checking ownership:', error);
    }
  };

  const loadNFTData = async () => {
    try {
      setLoading(true);
      const contract = createContract(contractAddress, CONTRACT_ABI.abi);
      
      // Load all NFT data
      const allNFTData = await contract.getAllNFTData();
      
      // Convert BigNumber objects to strings
      const processedNFTs = allNFTData.map(nft => ({
        nftId: nft.nftId.toString(),
        name: nft.name,
        description: nft.description,
        image: nft.image,
        metadata: nft.metadata,
        rarity: nft.rarity.toString(),
        isAvailable: nft.isAvailable,
        maxSupply: nft.maxSupply.toString(),
        currentSupply: nft.currentSupply.toString(),
        price: nft.price.toString(),
        attributes: nft.attributes
      }));
      
      setAllNFTs(processedNFTs);
      
      // Load statistics and convert to strings
      const totalSupply = await contract.getTotalSupply();
      const remainingSupply = await contract.getRemainingSupply();
      const totalNFTs = await contract.getNFTCount();
      
      setStats({
        totalSupply: totalSupply.toString(),
        remainingSupply: remainingSupply.toString(),
        totalNFTs: totalNFTs.toString()
      });
      
    } catch (error) {
      console.error('Error loading NFT data:', error);
      toast.error('Failed to load NFT data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNFT = (nft) => {
    setEditingNFT(nft);
    setUpdateForm({
      isAvailable: nft.isAvailable,
      price: ethers.utils.formatEther(nft.price)
    });
  };

  const updateNFT = async () => {
    try {
      if (!editingNFT) return;
      
      const contract = createContract(contractAddress, CONTRACT_ABI.abi);
      const priceInWei = ethers.utils.parseEther(updateForm.price);
      
      const tx = await contract.updateNFT(
        editingNFT.nftId,
        updateForm.isAvailable,
        priceInWei
      );
      
      await tx.wait();
      toast.success('NFT updated successfully!');
      
      // Reset form and reload data
      setEditingNFT(null);
      setUpdateForm({ isAvailable: true, price: '' });
      loadNFTData();
      
    } catch (error) {
      console.error('Error updating NFT:', error);
      toast.error('Failed to update NFT');
    }
  };

  const deleteNFT = async (nftId) => {
    if (!window.confirm(`Are you sure you want to delete NFT #${nftId}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const contract = createContract(contractAddress, CONTRACT_ABI.abi);
      
      const tx = await contract.deleteNFT(nftId);
      await tx.wait();
      
      toast.success('NFT deleted successfully!');
      loadNFTData();
      
    } catch (error) {
      console.error('Error deleting NFT:', error);
      toast.error('Failed to delete NFT');
    }
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-xl rounded-2xl border border-blue-200/50 shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full border border-blue-400/30 mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Total Supply</h3>
        <p className="text-4xl font-bold text-blue-600 mb-2">{stats.totalSupply}</p>
        <p className="text-gray-600">Maximum NFTs allowed</p>
      </div>
      
      <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-xl rounded-2xl border border-green-200/50 shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full border border-green-400/30 mb-4">
          <span className="text-2xl">🎯</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Remaining Supply</h3>
        <p className="text-4xl font-bold text-green-600 mb-2">{stats.remainingSupply}</p>
        <p className="text-gray-600">Available for minting</p>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50/80 to-violet-50/80 backdrop-blur-xl rounded-2xl border border-purple-200/50 shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400/20 to-violet-500/20 rounded-full border border-purple-400/30 mb-4">
          <span className="text-2xl">🎨</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Total NFT Types</h3>
        <p className="text-4xl font-bold text-purple-600 mb-2">{stats.totalNFTs}</p>
        <p className="text-gray-600">Different NFT designs</p>
      </div>
    </div>
  );

  const renderNFTList = () => (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-500/20 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-gray-100/80">
        <h3 className="text-2xl font-bold text-gray-800">NFT Collection Management</h3>
        <p className="text-gray-600 mt-2">Manage your NFT collection, update prices, and control availability</p>
      </div>
      
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full border border-blue-400/30 backdrop-blur-lg mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-xl text-gray-600 font-medium">Loading NFTs...</p>
        </div>
      ) : allNFTs.length === 0 ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full border border-gray-400/30 backdrop-blur-lg mb-6">
            <span className="text-4xl">🎨</span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mb-2">No NFTs Found</h4>
          <p className="text-gray-600 text-lg">No NFTs found in the collection</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50">
            <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80">
              <tr>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  NFT Info
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Supply
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200/50">
              {allNFTs.map((nft) => {
                const currentSupply = parseInt(nft.currentSupply);
                const maxSupply = parseInt(nft.maxSupply);
                const supplyPercentage = maxSupply > 0 ? (currentSupply / maxSupply) * 100 : 0;
                
                return (
                  <tr key={nft.nftId} className="hover:bg-gray-50/50 transition-colors duration-200">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-200/50 shadow-sm">
                          {nft.image && !nft.image.includes('QmExplorerImage') && !nft.image.includes('QmWarriorImage') ? (
                            <img 
                              src={nft.image} 
                              alt={nft.name}
                              className="h-14 w-14 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600 text-lg font-bold" style={{display: (nft.image && !nft.image.includes('QmExplorerImage') && !nft.image.includes('QmWarriorImage')) ? 'none' : 'flex'}}>
                            {nft.name?.charAt(0) || 'N'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-bold text-gray-900 mb-1">{nft.name}</div>
                          <div className="text-sm text-gray-600 mb-1">ID: {nft.nftId}</div>
                          <div className="text-sm text-gray-600">Rarity: {nft.rarity}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-lg font-semibold text-gray-900 mb-2">
                        {nft.currentSupply} / {nft.maxSupply}
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-3 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full shadow-sm transition-all duration-300" 
                          style={{width: `${supplyPercentage}%`}}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{supplyPercentage.toFixed(1)}%</div>
                    </td>
                    
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        {ethers.utils.formatEther(nft.price)} SEI
                      </div>
                    </td>
                    
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${
                        nft.isAvailable 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200/50' 
                          : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200/50'
                      }`}>
                        {nft.isAvailable ? '✅ Available' : '❌ Unavailable'}
                      </span>
                    </td>
                    
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                      {isOwner && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleUpdateNFT(nft)}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteNFT(nft.nftId)}
                            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderUpdateModal = () => {
    if (!editingNFT) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-8 border w-96 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl border-gray-200/50">
          <div className="mt-3">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full border border-indigo-400/30 mb-4">
                <span className="text-2xl">✏️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Update NFT: {editingNFT.name}
              </h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Availability
                </label>
                <label className="flex items-center p-3 bg-gray-50/50 rounded-lg border border-gray-200/50 cursor-pointer hover:bg-gray-100/50 transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={updateForm.isAvailable}
                    onChange={(e) => setUpdateForm({...updateForm, isAvailable: e.target.checked})}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 font-medium">Available for minting</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Price (SEI)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={updateForm.price}
                  onChange={(e) => setUpdateForm({...updateForm, price: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 shadow-sm"
                  placeholder="0.01"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={updateNFT}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Update NFT
              </button>
              <button
                onClick={() => setEditingNFT(null)}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!walletConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-400/20 to-gray-500/20 rounded-full border border-gray-400/30 backdrop-blur-lg mb-6">
            <span className="text-5xl">🔗</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">NFT Management</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Please connect your wallet to access NFT management features
          </p>
          <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border border-gray-200/50 rounded-xl p-6 inline-block">
            <p className="text-gray-700 font-medium">
              Connect your wallet to start managing your NFT collection
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
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full border border-indigo-400/30 backdrop-blur-lg mb-6">
          <span className="text-3xl">⚙️</span>
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-indigo-500 bg-clip-text text-transparent">
          NFT Management
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {isOwner 
            ? "Manage your NFT collection, update prices, and control availability with full administrative control."
            : "View NFT collection statistics and information as a collection member."
          }
        </p>
        <div className="w-32 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 mx-auto rounded-full mt-6"></div>
      </div>

      {/* Statistics */}
      {renderStats()}

      {/* NFT List */}
      {renderNFTList()}

      {/* Update Modal */}
      {renderUpdateModal()}
    </div>
  );
}