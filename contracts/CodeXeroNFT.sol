// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title CodeXeroNFT
 * @dev NFT contract with pre-existing NFT collection, wallet verification, and referral system
 * @author CodeXero Team
 */
contract CodeXeroNFT is ERC721, ERC721URIStorage, Ownable, EIP712 {
    using Counters for Counters.Counter;
    using ECDSA for bytes32;

    // Constants
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public maxMintPerWallet = 5;
    
    // State variables
    Counters.Counter private _tokenIds;
    string public baseURI;
    bool public mintingEnabled = false;
    
    // Pre-existing NFT collection
    struct PreExistingNFT {
        uint256 nftId;           // Unique identifier for this NFT design
        string name;             // NFT name
        string description;      // NFT description
        string image;            // IPFS image hash
        string metadata;         // IPFS metadata hash
        uint256 rarity;          // 1=Common, 2=Rare, 3=Epic, 4=Legendary
        bool isAvailable;        // Can this NFT still be minted?
        uint256 maxSupply;       // How many of this design can exist
        uint256 currentSupply;   // How many have been minted
        uint256 price;           // Individual price for this NFT
        string attributes;       // JSON attributes string
    }
    
    // Structs
    struct ReferralData {
        address referrer;
        uint256 referralCount;
        uint256 totalEarnings;
        bool isActive;
    }
    
    struct MintRequest {
        address to;
        uint256 nftId;
        address referrer;
        uint256 nonce;
        uint256 deadline;
    }
    
    // Mappings
    mapping(uint256 => PreExistingNFT) public preExistingNFTs;  // nftId => NFT data
    mapping(uint256 => uint256) public tokenToNFTId;            // tokenId => nftId
    mapping(address => uint256) public mintedCount;
    mapping(address => ReferralData) public referrals;
    mapping(bytes32 => bool) public usedNonces;
    mapping(address => bool) public verifiedWallets;
    mapping(address => bool) public nftHolders;
    mapping(address => uint256) public tokenBalances;
    
    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 indexed nftId);
    event ReferralCreated(address indexed referrer, address indexed referee);
    event ReferralBonusPaid(address indexed referrer, uint256 amount);
    event WalletVerified(address indexed wallet, bool hasNFTs, uint256 tokenBalance);
    event PreExistingNFTAdded(uint256 indexed nftId, string name, uint256 rarity, uint256 price);
    event PreExistingNFTUpdated(uint256 indexed nftId);
    event MintingToggled(bool enabled);
    
    // Modifiers
    modifier mintingAllowed() {
        require(mintingEnabled, "Minting is not enabled");
        _;
    }
    
    modifier validNFT(uint256 nftId) {
        require(preExistingNFTs[nftId].nftId != 0, "Invalid NFT ID");
        _;
    }
    
    modifier withinSupplyLimit() {
        require(_tokenIds.current() < MAX_SUPPLY, "Max supply reached");
        _;
    }
    
    modifier validMintRequest(MintRequest calldata request) {
        require(request.deadline > block.timestamp, "Request expired");
        require(request.to != address(0), "Invalid recipient");
        require(mintedCount[request.to] < maxMintPerWallet, "Max mint per wallet reached");
        _;
    }
    
    constructor() ERC721("CodeXero NFT", "CODEXERO") EIP712("CodeXeroNFT", "1.0.0") {
        _initializePreExistingNFTs();
    }
    
    /**
     * @dev Initialize your pre-existing NFT collection
     */
    function _initializePreExistingNFTs() internal {
        // Add your pre-existing NFTs here - you can modify these or add more
        _addPreExistingNFT(1, "CodeXero Explorer", "A brave explorer in the CodeXero universe", 
                          "ipfs://QmExplorerImage", "ipfs://QmExplorerMetadata", 1, 100, 0.01 ether, "{}");
        
        _addPreExistingNFT(2, "CodeXero Warrior", "A fierce warrior protecting the CodeXero realm", 
                          "ipfs://QmWarriorImage", "ipfs://QmWarriorMetadata", 2, 50, 0.02 ether, "{}");
        
        _addPreExistingNFT(3, "CodeXero Mage", "A powerful mage with ancient knowledge", 
                          "ipfs://QmMageImage", "ipfs://QmMageMetadata", 3, 25, 0.03 ether, "{}");
        
        _addPreExistingNFT(4, "CodeXero Legend", "The legendary guardian of CodeXero", 
                          "ipfs://QmLegendImage", "ipfs://QmLegendMetadata", 4, 10, 0.05 ether, "{}");
    }
    
    /**
     * @dev Add a pre-existing NFT to the collection
     */
    function _addPreExistingNFT(
        uint256 nftId,
        string memory name,
        string memory description,
        string memory image,
        string memory metadata,
        uint256 rarity,
        uint256 maxSupply,
        uint256 price,
        string memory attributes
    ) internal {
        preExistingNFTs[nftId] = PreExistingNFT({
            nftId: nftId,
            name: name,
            description: description,
            image: image,
            metadata: metadata,
            rarity: rarity,
            isAvailable: true,
            maxSupply: maxSupply,
            currentSupply: 0,
            price: price,
            attributes: attributes
        });
        
        emit PreExistingNFTAdded(nftId, name, rarity, price);
    }
    
    /**
     * @dev Check if wallet holds CodeXero NFTs or tokens
     * @param wallet Address to check
     * @return hasNFTs Whether wallet holds NFTs
     * @return tokenBalance Token balance
     */
    function checkWalletEligibility(address wallet) public view returns (bool hasNFTs, uint256 tokenBalance) {
        hasNFTs = nftHolders[wallet];
        tokenBalance = tokenBalances[wallet];
    }
    
    /**
     * @dev Verify wallet eligibility for minting
     * @param wallet Address to verify
     * @return eligible Whether wallet is eligible
     * @return reason Reason for ineligibility if any
     */
    function verifyWalletForMinting(address wallet) public view returns (bool eligible, string memory reason) {
        if (verifiedWallets[wallet]) {
            return (true, "Wallet pre-verified");
        }
        
        (bool hasNFTs, uint256 tokenBalance) = checkWalletEligibility(wallet);
        
        if (hasNFTs) {
            return (true, "Wallet holds CodeXero NFTs");
        }
        
        if (tokenBalance >= 100 * 10**18) { // 100 tokens minimum
            return (true, "Wallet holds sufficient tokens");
        }
        
        return (false, "Wallet does not meet eligibility requirements");
    }
    
    /**
     * @dev Override wallet verification for referral users
     * @param wallet Wallet address
     * @param referrer Referrer address
     * @return success Whether override was successful
     */
    function overrideWalletVerification(address wallet, address referrer) public onlyOwner returns (bool success) {
        require(referrals[referrer].isActive, "Referrer not active");
        require(referrals[referrer].referralCount > 0, "Referrer has no referrals");
        
        verifiedWallets[wallet] = true;
        emit WalletVerified(wallet, true, 0);
        
        return true;
    }
    
    /**
     * @dev Create referral link
     * @param referrer Referrer address
     */
    function createReferral(address referrer) public onlyOwner {
        require(referrer != address(0), "Invalid referrer address");
        require(!referrals[referrer].isActive, "Referral already exists");
        
        referrals[referrer] = ReferralData({
            referrer: referrer,
            referralCount: 0,
            totalEarnings: 0,
            isActive: true
        });
    }
    
    /**
     * @dev Mint a specific pre-existing NFT
     * @param nftId The ID of the pre-existing NFT to mint
     * @param referrer Referrer address (optional)
     */
    function mintSpecificNFT(uint256 nftId, address referrer) 
        public 
        payable 
        mintingAllowed 
        withinSupplyLimit 
        validNFT(nftId) 
    {
        PreExistingNFT storage nft = preExistingNFTs[nftId];
        
        // Validations
        require(nft.isAvailable, "NFT is not available for minting");
        require(nft.currentSupply < nft.maxSupply, "NFT supply limit reached");
        require(msg.value >= nft.price, "Insufficient payment");
        require(mintedCount[msg.sender] < maxMintPerWallet, "Max mint per wallet reached");
        
        // Check wallet eligibility (skip if referral)
        if (referrer == address(0)) {
            (bool eligible, ) = verifyWalletForMinting(msg.sender);
            require(eligible, "Wallet not eligible for minting");
        } else {
            require(referrals[referrer].isActive, "Invalid referrer");
            // Override wallet verification for referral users
            verifiedWallets[msg.sender] = true;
        }
        
        // Mint the NFT
        _mintNFTInternal(msg.sender, nftId, nft);
        
        // Handle referral bonus (20% of NFT price)
        if (referrer != address(0)) {
            _handleReferralBonus(referrer, nft.price);
        }
        
        emit NFTMinted(msg.sender, _tokenIds.current(), nftId);
    }
    
    /**
     * @dev Internal function to mint NFT (reduces stack usage)
     */
    function _mintNFTInternal(address to, uint256 nftId, PreExistingNFT storage nft) internal {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, nft.metadata);
        
        // Update mappings
        tokenToNFTId[newTokenId] = nftId;
        nft.currentSupply++;
        mintedCount[to]++;
        nftHolders[to] = true;
    }
    
    /**
     * @dev Handle referral bonus (reduces stack usage)
     */
    function _handleReferralBonus(address referrer, uint256 nftPrice) internal {
        uint256 referralBonus = nftPrice * 20 / 100; // 20% bonus
        referrals[referrer].referralCount++;
        referrals[referrer].totalEarnings += referralBonus;
        
        payable(referrer).transfer(referralBonus);
        
        emit ReferralBonusPaid(referrer, referralBonus);
        emit ReferralCreated(referrer, msg.sender);
    }
    
    /**
     * @dev Gasless minting using EIP-712 signature
     * @param request Mint request data
     * @param signature Signature for verification
     */
    function mintWithSignature(MintRequest calldata request, bytes calldata signature) 
        public 
        mintingAllowed 
        withinSupplyLimit 
        validMintRequest(request) 
        validNFT(request.nftId)
    {
        // Verify signature
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("MintRequest(address to,uint256 nftId,address referrer,uint256 nonce,uint256 deadline)"),
            request.to,
            request.nftId,
            request.referrer,
            request.nonce,
            request.deadline
        )));
        
        address signer = digest.recover(signature);
        require(signer == owner(), "Invalid signature");
        
        // Check nonce
        require(!usedNonces[keccak256(abi.encode(request.nonce))], "Nonce already used");
        usedNonces[keccak256(abi.encode(request.nonce))] = true;
        
        // Check wallet eligibility (skip if referral)
        if (request.referrer == address(0)) {
            (bool eligible, ) = verifyWalletForMinting(request.to);
            require(eligible, "Wallet not eligible for minting");
        } else {
            require(referrals[request.referrer].isActive, "Invalid referrer");
            // Override wallet verification for referral users
            verifiedWallets[request.to] = true;
        }
        
        PreExistingNFT storage nft = preExistingNFTs[request.nftId];
        require(nft.isAvailable, "NFT is not available for minting");
        require(nft.currentSupply < nft.maxSupply, "NFT supply limit reached");
        
        // Mint NFT
        _mintNFTInternal(request.to, request.nftId, nft);
        
        // Handle referral bonus
        if (request.referrer != address(0)) {
            _handleReferralBonus(request.referrer, nft.price);
        }
        
        emit NFTMinted(request.to, _tokenIds.current(), request.nftId);
    }
    
    /**
     * @dev Update wallet verification status
     * @param wallet Wallet address
     * @param hasNFTs Whether wallet holds NFTs
     * @param tokenBalance Token balance
     */
    function updateWalletVerification(address wallet, bool hasNFTs, uint256 tokenBalance) public onlyOwner {
        nftHolders[wallet] = hasNFTs;
        tokenBalances[wallet] = tokenBalance;
        verifiedWallets[wallet] = hasNFTs || tokenBalance >= 100 * 10**18;
        
        emit WalletVerified(wallet, hasNFTs, tokenBalance);
    }
    
    /**
     * @dev Add new pre-existing NFT
     * @param nftId NFT ID
     * @param name NFT name
     * @param description NFT description
     * @param image IPFS image hash
     * @param metadata IPFS metadata hash
     * @param rarity Rarity level
     * @param maxSupply Maximum supply
     * @param price NFT price
     * @param attributes JSON attributes
     */
    function addPreExistingNFT(
        uint256 nftId,
        string calldata name,
        string calldata description,
        string calldata image,
        string calldata metadata,
        uint256 rarity,
        uint256 maxSupply,
        uint256 price,
        string calldata attributes
    ) public onlyOwner {
        require(bytes(name).length > 0, "Empty name");
        require(preExistingNFTs[nftId].nftId == 0, "NFT ID already exists");
        
        _addPreExistingNFT(nftId, name, description, image, metadata, rarity, maxSupply, price, attributes);
    }
    
    /**
     * @dev Update existing NFT
     * @param nftId NFT ID to update
     * @param isAvailable Whether NFT is available for minting
     * @param price New price
     */
    function updateNFT(uint256 nftId, bool isAvailable, uint256 price) public onlyOwner validNFT(nftId) {
        PreExistingNFT storage nft = preExistingNFTs[nftId];
        nft.isAvailable = isAvailable;
        nft.price = price;
        
        emit PreExistingNFTUpdated(nftId);
    }
    
    /**
     * @dev Toggle minting status
     */
    function toggleMinting() public onlyOwner {
        mintingEnabled = !mintingEnabled;
        emit MintingToggled(mintingEnabled);
    }
    
    /**
     * @dev Set base URI for token URIs
     * @param newBaseURI New base URI
     */
    function setBaseURI(string calldata newBaseURI) public onlyOwner {
        baseURI = newBaseURI;
    }
    
    /**
     * @dev Set max mint per wallet
     * @param newMax New maximum
     */
    function setMaxMintPerWallet(uint256 newMax) public onlyOwner {
        maxMintPerWallet = newMax;
    }
    
    /**
     * @dev Withdraw contract balance
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Emergency pause minting
     */
    function emergencyPause() public onlyOwner {
        mintingEnabled = false;
        emit MintingToggled(false);
    }
    
    // Internal functions
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    // View functions
    function getTotalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
    
    function getRemainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - _tokenIds.current();
    }
    
    function getReferralData(address referrer) public view returns (ReferralData memory) {
        return referrals[referrer];
    }
    
    function getNFTInfo(uint256 nftId) public view returns (PreExistingNFT memory) {
        require(preExistingNFTs[nftId].nftId != 0, "NFT does not exist");
        return preExistingNFTs[nftId];
    }
    
    function getTokenNFTId(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return tokenToNFTId[tokenId];
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
