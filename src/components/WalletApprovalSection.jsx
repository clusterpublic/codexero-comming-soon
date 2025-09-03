import { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { createContract, isWalletConnected, getAccountAddress } from '../utils/signerAdapter.js';
import CONTRACT_ABI from '../constants/abi.json';

export default function WalletApprovalSection({ contractAddress, isOwner, mintingStatus, loadingMintingStatus, onToggleMinting, onWalletApproved }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const handleWalletApproval = async (e) => {
    e.preventDefault();
    
    if (!walletAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }

    // Validate wallet address format
    if (!ethers.utils.isAddress(walletAddress)) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    try {
      setIsLoading(true);
      setVerificationStatus(null);
      
      const contract = createContract(contractAddress, CONTRACT_ABI.abi);
      
      // Add wallet to verified wallets
      const tx = await contract.addVerifiedWallet(walletAddress);
      await tx.wait();
      
      toast.success(`✅ Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} approved successfully!`);
      setWalletAddress('');
      setVerificationStatus({
        success: true,
        message: 'Wallet approved successfully!'
      });
      
      // Notify parent component
      if (onWalletApproved) {
        onWalletApproved(walletAddress);
      }
      
    } catch (error) {
      console.error('Error approving wallet:', error);
      
      // Check if it's already approved
      if (error.message && error.message.includes('Wallet already verified')) {
        setVerificationStatus({
          success: false,
          message: 'This wallet is already approved'
        });
        toast.warning('⚠️ This wallet is already approved');
      } else {
        setVerificationStatus({
          success: false,
          message: 'Failed to approve wallet. Please try again.'
        });
        toast.error('Failed to approve wallet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkWalletStatus = async () => {
    if (!walletAddress.trim()) {
      toast.error('Please enter a wallet address');
      return;
    }

    if (!ethers.utils.isAddress(walletAddress)) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    try {
      setIsLoading(true);
      setVerificationStatus(null);
      
      const contract = createContract(contractAddress, CONTRACT_ABI.abi);
      
      // Check if wallet is verified
      const isVerified = await contract.isWalletVerified(walletAddress);
      
      setVerificationStatus({
        success: true,
        message: isVerified 
          ? `✅ Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} is already approved` 
          : `❌ Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} is not approved yet`
      });
      
      if (isVerified) {
        toast.info('This wallet is already approved');
      } else {
        toast.info('This wallet is not approved yet');
      }
      
    } catch (error) {
      console.error('Error checking wallet status:', error);
      setVerificationStatus({
        success: false,
        message: 'Failed to check wallet status. Please try again.'
      });
      toast.error('Failed to check wallet status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wallet-approval-section">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-orange-200/50 shadow-2xl shadow-orange-500/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full border border-orange-400/30 backdrop-blur-lg mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Wallet Approval & Minting Control</h2>
            <p className="text-gray-600">Manage wallet permissions and control minting status</p>
          </div>
          
          {/* Minting Status Section */}
          <div className="mb-8 p-8 bg-gradient-to-r from-orange-50/80 to-red-50/80 rounded-2xl border border-orange-200/50 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">🎯</span>
              Minting Status Control
            </h3>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
              <div className="flex-1">
                <p className="text-gray-700 mb-3 font-medium">
                  Current Minting Status:
                </p>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border-2 ${
                  mintingStatus 
                    ? 'bg-green-100 text-green-800 border-green-500' 
                    : 'bg-red-100 text-red-800 border-red-500'
                }`}>
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    mintingStatus ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className="font-semibold">{mintingStatus ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              
              {isOwner && (
                <button
                  onClick={onToggleMinting}
                  disabled={loadingMintingStatus}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                    loadingMintingStatus
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : mintingStatus
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-xl hover:scale-105'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {loadingMintingStatus ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing...
                    </span>
                  ) : mintingStatus ? (
                    'Disable Minting'
                  ) : (
                    'Enable Minting'
                  )}
                </button>
              )}
            </div>
            
            {!isOwner && (
              <div className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 border border-yellow-300/50 rounded-xl p-6">
                <p className="text-yellow-800 font-medium flex items-center">
                  <span className="text-xl mr-2">⚠️</span>
                  Only the contract owner can control minting status
                </p>
              </div>
            )}
            
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-white/60 rounded-xl border border-orange-200/30">
                <div className="text-2xl mb-2">🟢</div>
                <p className="text-sm text-gray-700 font-medium">Enabled</p>
                <p className="text-xs text-gray-600">Users can mint NFTs</p>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-xl border border-orange-200/30">
                <div className="text-2xl mb-2">🔴</div>
                <p className="text-sm text-gray-700 font-medium">Disabled</p>
                <p className="text-xs text-gray-600">Minting is paused</p>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-xl border border-orange-200/30">
                <div className="text-2xl mb-2">👑</div>
                <p className="text-sm text-gray-700 font-medium">Owner Only</p>
                <p className="text-xs text-gray-600">Contract owner control</p>
              </div>
            </div>
          </div>

          {/* Wallet Approval Section */}
          <div className="p-8 bg-gradient-to-r from-green-50/80 to-blue-50/80 rounded-2xl border border-green-200/50 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-green-500 text-white text-sm font-bold rounded-full mr-3">🔓</span>
              Approve Wallet Addresses
            </h3>
            
            <form onSubmit={handleWalletApproval} className="space-y-6">
              <div>
                <label htmlFor="walletAddress" className="block text-sm font-semibold text-gray-700 mb-3">
                  Wallet Address
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    id="walletAddress"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x... (wallet address to approve)"
                    className="flex-1 px-4 py-3 bg-white/80 border border-gray-200/50 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 shadow-sm"
                    disabled={!isOwner}
                  />
                  <button
                    type="button"
                    onClick={checkWalletStatus}
                    disabled={!isOwner || isLoading || !walletAddress.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    Check Status
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  Enter the wallet address that needs approval to mint NFTs
                </p>
              </div>
              
              {verificationStatus && (
                <div className={`p-4 rounded-xl border ${
                  verificationStatus.success 
                    ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200/50 text-green-700' 
                    : 'bg-gradient-to-r from-red-50/80 to-red-100/80 border-red-200/50 text-red-700'
                }`}>
                  <p className="text-sm font-medium">
                    {verificationStatus.success ? '✅ Status Check' : '❌ Error'}
                  </p>
                  <p className="text-sm mt-1">{verificationStatus.message}</p>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={!isOwner || isLoading || !walletAddress.trim()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Approving...
                    </span>
                  ) : (
                    'Approve Wallet'
                  )}
                </button>
              </div>
              
              {!isOwner && (
                <div className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 border border-yellow-300/50 rounded-xl p-4">
                  <p className="text-yellow-800 text-sm font-medium flex items-center">
                    <span className="text-lg mr-2">⚠️</span>
                    Only the contract owner can approve wallet addresses
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
