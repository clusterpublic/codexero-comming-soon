require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "./hardhat.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    seiTestnet: {
      url: "https://evm-rpc-testnet.sei-apis.com",
      chainId: 1328,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY : '0x' + process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
    seiMainnet: {
      url: "https://evm-rpc.sei-apis.com",
      chainId: 713715,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY : '0x' + process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      seiTestnet: process.env.SEI_API_KEY || "",
      seiMainnet: process.env.SEI_API_KEY || "",
    },
    customChains: [
      {
        network: "seiTestnet",
        chainId: 1328,
        urls: {
          apiURL: "https://seitrace.com/api",
          browserURL: "https://seitrace.com",
        },
      },
      {
        network: "seiMainnet",
        chainId: 713715,
        urls: {
          apiURL: "https://seitrace.com/api",
          browserURL: "https://seitrace.com",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // Add IPFS configuration for metadata uploads
  ipfs: {
    projectId: process.env.IPFS_PROJECT_ID || process.env.JWT_ACCESS_TOKEN ? 'pinata' : undefined,
    projectSecret: process.env.IPFS_PROJECT_SECRET || undefined,
    jwtToken: process.env.JWT_ACCESS_TOKEN || undefined,
  },
};
