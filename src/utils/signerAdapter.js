import { ethers } from 'ethers';

/**
 * Get the browser's native Web3 provider
 * @returns {Object} ethers Web3Provider
 */
function getBrowserProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  throw new Error('No Web3 provider found. Please install MetaMask or another Web3 wallet.');
}

/**
 * Get the signer from the browser's Web3 provider
 * @returns {Object} ethers Signer
 */
export function getBrowserSigner() {
  const provider = getBrowserProvider();
  return provider.getSigner();
}

/**
 * Create a contract instance using browser's native Web3 provider
 * @param {string} contractAddress - Contract address
 * @param {Array} abi - Contract ABI
 * @returns {Object} ethers contract instance
 */
export function createContract(contractAddress, abi) {
  if (!contractAddress) {
    throw new Error('Contract address is required');
  }
  
  if (!abi || !Array.isArray(abi)) {
    throw new Error('Valid ABI array is required');
  }
  
  try {
    const signer = getBrowserSigner();
    console.log('Created browser signer:', signer);
    
    const contract = new ethers.Contract(contractAddress, abi, signer);
    console.log('Created contract successfully:', contract);
    
    return contract;
  } catch (error) {
    console.error('Error creating contract:', error);
    throw error;
  }
}

/**
 * Get the connected account address
 * @returns {Promise<string>} Account address
 */
export async function getAccountAddress() {
  const signer = getBrowserSigner();
  return await signer.getAddress();
}

/**
 * Check if wallet is connected
 * @returns {Promise<boolean>} Connection status
 */
export async function isWalletConnected() {
  try {
    const provider = getBrowserProvider();
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Request wallet connection
 * @returns {Promise<string[]>} Connected accounts
 */
export async function requestWalletConnection() {
  const provider = getBrowserProvider();
  return await provider.send('eth_requestAccounts', []);
}
