import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { createContract, isWalletConnected, getAccountAddress } from '../../utils/signerAdapter.js';
import CONTRACT_ABI from '../../constants/abi.json';
import './NFTManagement.css';

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Supply</h3>
        <p className="text-3xl font-bold text-blue-600">{stats.totalSupply}</p>
        <p className="text-sm text-gray-600">Maximum NFTs allowed</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Remaining Supply</h3>
        <p className="text-3xl font-bold text-green-600">{stats.remainingSupply}</p>
        <p className="text-sm text-gray-600">Available for minting</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Total NFT Types</h3>
        <p className="text-3xl font-bold text-purple-600">{stats.totalNFTs}</p>
        <p className="text-sm text-gray-600">Different NFT designs</p>
      </div>
    </div>
  );

  const renderNFTList = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">NFT Collection Management</h3>
      </div>
      
      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading NFTs...</p>
        </div>
      ) : allNFTs.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <p>No NFTs found in the collection</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NFT Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supply
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allNFTs.map((nft) => {
                const currentSupply = parseInt(nft.currentSupply);
                const maxSupply = parseInt(nft.maxSupply);
                const supplyPercentage = maxSupply > 0 ? (currentSupply / maxSupply) * 100 : 0;
                
                return (
                  <tr key={nft.nftId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {nft.image && !nft.image.includes('QmExplorerImage') && !nft.image.includes('QmWarriorImage') ? (
                            <img 
                              src={nft.image} 
                              alt={nft.name}
                              className="h-10 w-10 rounded object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="h-10 w-10 rounded bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium" style={{display: (nft.image && !nft.image.includes('QmExplorerImage') && !nft.image.includes('QmWarriorImage')) ? 'none' : 'flex'}}>
                            {nft.name?.charAt(0) || 'N'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{nft.name}</div>
                          <div className="text-sm text-gray-500">ID: {nft.nftId}</div>
                          <div className="text-sm text-gray-500">Rarity: {nft.rarity}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {nft.currentSupply} / {nft.maxSupply}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${supplyPercentage}%`}}
                        ></div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ethers.utils.formatEther(nft.price)} SEI
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        nft.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {nft.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isOwner && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateNFT(nft)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteNFT(nft.nftId)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs"
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
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Update NFT: {editingNFT.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={updateForm.isAvailable}
                    onChange={(e) => setUpdateForm({...updateForm, isAvailable: e.target.checked})}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Available for minting</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (SEI)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={updateForm.price}
                  onChange={(e) => setUpdateForm({...updateForm, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.01"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={updateNFT}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Update NFT
              </button>
              <button
                onClick={() => setEditingNFT(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">NFT Management</h2>
          <p className="text-gray-600">Please connect your wallet to access NFT management features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">NFT Management</h2>
        <p className="text-gray-600">
          {isOwner 
            ? "Manage your NFT collection, update prices, and control availability."
            : "View NFT collection statistics and information."
          }
        </p>
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