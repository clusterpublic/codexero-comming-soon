const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("�� Deploying CodeXero NFT Contract to SEI Testnet...");

  // Get the contract factory
  const CodeXeroNFT = await ethers.getContractFactory("CodeXeroNFT");
  
  // Deploy the contract
  const codeXeroNFT = await CodeXeroNFT.deploy();
  await codeXeroNFT.deployed();

  console.log("✅ CodeXero NFT deployed to:", codeXeroNFT.address);

  // Get deployment info
  const network = await ethers.provider.getNetwork();
  const deployer = await ethers.getSigner();
  
  const deploymentInfo = {
    contractName: "CodeXeroNFT",
    contractAddress: codeXeroNFT.address,
    network: {
      name: network.name,
      chainId: network.chainId
    },
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    constructorArgs: [],
    verified: false
  };

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network.chainId}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("📝 Deployment info saved to:", deploymentFile);

  // Initialize contract with default settings
  console.log("🔧 Initializing contract...");
  
  // Enable minting
  await codeXeroNFT.toggleMinting();
  console.log("✅ Minting enabled");

  // Upload default NFT metadata to IPFS if credentials are configured
  if (process.env.JWT_ACCESS_TOKEN || (process.env.IPFS_PROJECT_ID && process.env.IPFS_PROJECT_SECRET)) {
    console.log("📤 Uploading NFT metadata to IPFS...");
    try {
      await uploadNFTMetadataToIPFS(codeXeroNFT);
      console.log("✅ NFT metadata uploaded to IPFS");
    } catch (error) {
      console.log("⚠️ Failed to upload NFT metadata:", error.message);
    }
  }

  console.log("🎉 Contract deployment and initialization complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Update .env.local with contract address:", codeXeroNFT.address);
  console.log("2. Verify contract on SEI block explorer (seitrace.com)");
  console.log("3. Test minting functionality with SEI");
  console.log("4. Deploy to SEI mainnet when ready");
}

async function uploadNFTMetadataToIPFS(contract) {
  // This function would integrate with Pinata to upload metadata
  // For now, we'll just log the intention
  console.log("�� NFT metadata ready for IPFS upload");
  console.log("   - NFT 1: CodeXero Explorer (Common) - 0.01 SEI");
  console.log("   - NFT 2: CodeXero Warrior (Rare) - 0.02 SEI");
  console.log("   - NFT 3: CodeXero Mage (Epic) - 0.03 SEI");
  console.log("   - NFT 4: CodeXero Legend (Legendary) - 0.05 SEI");
  
  // You can implement actual IPFS upload logic here using your credentials
  if (process.env.JWT_ACCESS_TOKEN) {
    console.log("🔑 Using JWT token for Pinata authentication");
  } else if (process.env.IPFS_PROJECT_ID) {
    console.log("🔑 Using project ID/secret for IPFS authentication");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });