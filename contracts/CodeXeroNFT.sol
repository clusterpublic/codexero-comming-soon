// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CodeXeroNFT
 * @dev NFT contract with pre-existing NFT collection, wallet verification, referral bypass, and marketplace
 * @author CodeXero Team
 */
contract CodeXeroNFT is ERC721, ERC721URIStorage, Ownable, EIP712, ReentrancyGuard {
    using Counters for Counters.Counter;
    using ECDSA for bytes32;

    // Constants
    uint256 public constant MAX_SUPPLY = 10000;
    string public constant DOMAIN_NAME = "CodeXeroNFT";
    string public constant VERSION = "1";
    uint256 public constant MARKETPLACE_FEE = 250; // 2.5% (250 basis points)
    uint256 public constant BASIS_POINTS = 10000;

    // State variables
    bool public mintingEnabled = true;
    Counters.Counter private _tokenIds;
    string private baseURI;

    // Structs
    struct PreExistingNFT {
        uint256 nftId;
        string name;
        string description;
        string image;
        string metadata;
        uint256 rarity;
        bool isAvailable;
        uint256 maxSupply;
        uint256 currentSupply;
        uint256 price;
        string attributes;
    }

    struct MintRequest {
        address to;
        uint256 nftId;
        address referrer;
        uint256 nonce;
        uint256 deadline;
    }

    struct NFTListing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isActive;
        uint256 listingId;
        uint256 createdAt;
    }

    // Mappings
    mapping(uint256 => PreExistingNFT) public preExistingNFTs; // nftId => NFT data
    mapping(uint256 => uint256) public tokenToNFTId;            // tokenId => nftId
    mapping(address => bool) public nftHolders;
    mapping(address => bool) public verifiedWallets;
    mapping(bytes32 => bool) public usedNonces;
    
    // Marketplace mappings
    mapping(uint256 => NFTListing) public nftListings; // tokenId => listing
    mapping(uint256 => uint256) public listingIdToTokenId; // listingId => tokenId
    mapping(address => uint256[]) public userListings; // user => array of listing IDs
    mapping(address => uint256[]) public userNFTs;

    // Array to track all NFT IDs
    uint256[] public nftIds;
    
    // Marketplace state
    Counters.Counter private _listingIds;
    uint256 public totalListings = 0;

    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 indexed nftId);
    event WalletVerified(address indexed wallet, bool hasNFTs, uint256 tokenBalance);
    event PreExistingNFTAdded(uint256 indexed nftId, string name, uint256 rarity, uint256 price);
    event PreExistingNFTUpdated(uint256 indexed nftId);
    event NFTDeleted(uint256 indexed nftId);
    event MintingToggled(bool enabled);
    
    // Marketplace events
    event NFTListed(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, uint256 price);
    event NFTUnlisted(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller);
    event NFTSold(uint256 indexed listingId, uint256 indexed tokenId, address indexed seller, address buyer, uint256 price);
    event ListingPriceUpdated(uint256 indexed listingId, uint256 indexed tokenId, uint256 newPrice);

    // Modifiers
    modifier mintingAllowed() {
        require(mintingEnabled, "Minting is currently disabled");
        _;
    }

    modifier withinSupplyLimit() {
        require(_tokenIds.current() < MAX_SUPPLY, "Max supply reached");
        _;
    }

    modifier validNFT(uint256 nftId) {
        require(preExistingNFTs[nftId].nftId != 0, "NFT does not exist");
        _;
    }

    modifier validMintRequest(MintRequest calldata request) {
        require(request.deadline > block.timestamp, "Request expired");
        require(request.to != address(0), "Invalid recipient address");
        _;
    }

    modifier onlyNFTOwner(uint256 tokenId) {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the NFT owner");
        _;
    }

    modifier validListing(uint256 listingId) {
        require(nftListings[listingIdToTokenId[listingId]].isActive, "Listing not active");
        _;
    }

    /**
     * @dev Constructor
     */
    constructor() ERC721("CodeXero NFT", "CODEXERO") EIP712(DOMAIN_NAME, VERSION) {
        _initializePreExistingNFTs();
    }

    /**
     * @dev Initialize pre-existing NFTs with supply = 1
     */
    function _initializePreExistingNFTs() internal {
        _addPreExistingNFT(1, "CodeXero Explorer", "A brave explorer in the CodeXero universe", "ipfs://QmExplorerImage", "ipfs://QmExplorerMetadata", 1, 1, 0.01e18, "Type: Explorer, Rarity: Common, Element: Earth");
        _addPreExistingNFT(2, "CodeXero Warrior", "A fierce warrior defending the CodeXero realm", "ipfs://QmWarriorImage", "ipfs://QmWarriorMetadata", 2, 1, 0.02e18, "Type: Warrior, Rarity: Rare, Class: Combat");
        _addPreExistingNFT(3, "CodeXero Mage", "A powerful mage with ancient knowledge", "ipfs://QmMageImage", "ipfs://QmMageMetadata", 3, 1, 0.03e18, "Type: Mage, Rarity: Epic, School: Arcane");
        _addPreExistingNFT(4, "CodeXero Legend", "A legendary hero of the CodeXero saga", "ipfs://QmLegendImage", "ipfs://QmLegendMetadata", 4, 1, 0.05e18, "Type: Legend, Rarity: Legendary, Power: Ultimate");
    }

    /**
     * @dev Add new pre-existing NFT
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
     * @dev Internal function to add pre-existing NFT
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
        
        // Add ID to the tracking array
        nftIds.push(nftId);
        
        emit PreExistingNFTAdded(nftId, name, rarity, price);
    }

    /**
     * @dev Add verified wallet address
     */
    function addVerifiedWallet(address wallet) public {
        require(wallet != address(0), "Invalid wallet address");
        require(!verifiedWallets[wallet], "Wallet already verified");
        
        verifiedWallets[wallet] = true;
        emit WalletVerified(wallet, true, 0);
    }

    /**
     * @dev Verify wallet for minting
     */
    function verifyWalletForMinting(address wallet) public view returns (bool eligible, string memory reason) {
        // Check if wallet is directly verified
        if (verifiedWallets[wallet]) {
            return (true, "Wallet directly verified");
        }

        // Check if wallet holds any CodeXero NFTs
        if (nftHolders[wallet]) {
            return (true, "Wallet holds CodeXero NFTs");
        }

        // Check if wallet holds specific tokens
        uint256 balance = balanceOf(wallet);
        if (balance > 0) {
            return (true, "Wallet holds CodeXero tokens");
        }

        return (false, "Wallet not eligible for minting");
    }

    /**
     * @dev Mint specific NFT
     */
    function mintSpecificNFT(uint256 nftId, address referrer) 
        public 
        payable 
        mintingAllowed 
        withinSupplyLimit 
        validNFT(nftId)
    {
        PreExistingNFT storage nft = preExistingNFTs[nftId];
        
        // Check if NFT is available
        require(nft.isAvailable, "NFT is not available for minting");
        require(nft.currentSupply < nft.maxSupply, "NFT supply limit reached");
        
        // Check price
        require(msg.value == nft.price, "Incorrect payment amount");
        
        // Check wallet eligibility (skip if referral bypass)
        if (referrer == address(0)) {
            (bool eligible, ) = verifyWalletForMinting(msg.sender);
            require(eligible, "Wallet not eligible for minting");
        }
        // If referrer is provided, bypass wallet verification
        
        // Mint NFT
        _mintNFTInternal(msg.sender, nftId, nft);
        
        emit NFTMinted(msg.sender, _tokenIds.current(), nftId);
    }

    /**
     * @dev Internal function to mint NFT
     */
    function _mintNFTInternal(address to, uint256 nftId, PreExistingNFT storage nft) internal {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, nft.metadata);
        
        // Update mappings
        tokenToNFTId[newTokenId] = nftId;
        nft.currentSupply++;
        nftHolders[to] = true;

            // Track user's NFTs - ADD THIS
        userNFTs[to].push(newTokenId);
        
        // If supply is reached, mark as unavailable
        if (nft.currentSupply >= nft.maxSupply) {
            nft.isAvailable = false;
        }
    }

    /**
     * @dev Gasless minting using EIP-712 signature
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
        
        // Check wallet eligibility (skip if referral bypass)
        if (request.referrer == address(0)) {
            (bool eligible, ) = verifyWalletForMinting(request.to);
            require(eligible, "Wallet not eligible for minting");
        }
        
        PreExistingNFT storage nft = preExistingNFTs[request.nftId];
        require(nft.isAvailable, "NFT is not available for minting");
        require(nft.currentSupply < nft.maxSupply, "NFT supply limit reached");
        
        // Mint NFT
        _mintNFTInternal(request.to, request.nftId, nft);
        
        emit NFTMinted(request.to, _tokenIds.current(), request.nftId);
    }

    // ========== MARKETPLACE FUNCTIONS ==========

    /**
     * @dev List NFT for sale
     */
    function listNFTForSale(uint256 tokenId, uint256 price) 
        public 
        onlyNFTOwner(tokenId) 
        nonReentrant 
    {
        require(price > 0, "Price must be greater than 0");
        require(!nftListings[tokenId].isActive, "NFT already listed");
        
        // Create listing
        _listingIds.increment();
        uint256 listingId = _listingIds.current();
        
        nftListings[tokenId] = NFTListing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isActive: true,
            listingId: listingId,
            createdAt: block.timestamp
        });
        
        listingIdToTokenId[listingId] = tokenId;
        userListings[msg.sender].push(listingId);
        totalListings++;
        
        emit NFTListed(listingId, tokenId, msg.sender, price);
    }

    /**
     * @dev Unlist NFT from sale
     */
    function unlistNFT(uint256 tokenId) 
        public 
        onlyNFTOwner(tokenId) 
        nonReentrant 
    {
        require(nftListings[tokenId].isActive, "NFT not listed");
        
        uint256 listingId = nftListings[tokenId].listingId;
        
        // Remove listing
        delete nftListings[tokenId];
        delete listingIdToTokenId[listingId];
        
        // Remove from user listings
        _removeFromUserListings(msg.sender, listingId);
        totalListings--;
        
        emit NFTUnlisted(listingId, tokenId, msg.sender);
    }

    /**
     * @dev Buy listed NFT
     */
    function buyListedNFT(uint256 tokenId) 
        public 
        payable 
        nonReentrant 
    {
        NFTListing storage listing = nftListings[tokenId];
        require(listing.isActive, "Listing not active");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");
        require(msg.value == listing.price, "Incorrect payment amount");
        
        address seller = listing.seller;
        uint256 listingId = listing.listingId;
        
        // Calculate fees
        uint256 marketplaceFee = (listing.price * MARKETPLACE_FEE) / BASIS_POINTS;
        uint256 sellerAmount = listing.price - marketplaceFee;
        
        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);
        
        // Remove listing
        delete nftListings[tokenId];
        delete listingIdToTokenId[listingId];
        _removeFromUserListings(seller, listingId);
        totalListings--;
        
        // Transfer payments
        payable(seller).transfer(sellerAmount);
        payable(owner()).transfer(marketplaceFee);
        
        emit NFTSold(listingId, tokenId, seller, msg.sender, listing.price);
    }

    /**
     * @dev Update listing price
     */
    function updateListingPrice(uint256 tokenId, uint256 newPrice) 
        public 
        onlyNFTOwner(tokenId) 
    {
        require(nftListings[tokenId].isActive, "NFT not listed");
        require(newPrice > 0, "Price must be greater than 0");
        
        uint256 listingId = nftListings[tokenId].listingId;
        nftListings[tokenId].price = newPrice;
        
        emit ListingPriceUpdated(listingId, tokenId, newPrice);
    }

    /**
     * @dev Get all active listings
     */
    function getAllListings() public view returns (NFTListing[] memory) {
        NFTListing[] memory listings = new NFTListing[](totalListings);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _listingIds.current(); i++) {
            uint256 tokenId = listingIdToTokenId[i];
            if (nftListings[tokenId].isActive) {
                listings[count] = nftListings[tokenId];
                count++;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(listings, count)
        }
        
        return listings;
    }

    /**
     * @dev Get user's listings
     */
    function getUserListings(address user) public view returns (uint256[] memory) {
        return userListings[user];
    }

    /**
     * @dev Get listing by token ID
     */
    function getListingByTokenId(uint256 tokenId) public view returns (NFTListing memory) {
        return nftListings[tokenId];
    }

    // ========== HELPER FUNCTIONS ==========

    /**
     * @dev Remove listing from user's listing array
     */
    function _removeFromUserListings(address user, uint256 listingId) internal {
        uint256[] storage userListingArray = userListings[user];
        for (uint256 i = 0; i < userListingArray.length; i++) {
            if (userListingArray[i] == listingId) {
                userListingArray[i] = userListingArray[userListingArray.length - 1];
                userListingArray.pop();
                break;
            }
        }
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @dev Update wallet verification status
     */
    function updateWalletVerification(address wallet, bool hasNFTs) public onlyOwner {
        nftHolders[wallet] = hasNFTs;
        verifiedWallets[wallet] = hasNFTs;
        
        emit WalletVerified(wallet, hasNFTs, 0);
    }

    /**
     * @dev Update existing NFT
     */
    function updateNFT(uint256 nftId, bool isAvailable, uint256 price) public onlyOwner validNFT(nftId) {
        PreExistingNFT storage nft = preExistingNFTs[nftId];
        nft.isAvailable = isAvailable;
        nft.price = price;
        
        emit PreExistingNFTUpdated(nftId);
    }

    /**
     * @dev Delete NFT from contract
     */
    function deleteNFT(uint256 nftId) public onlyOwner validNFT(nftId) {
        PreExistingNFT storage nft = preExistingNFTs[nftId];
        
        // Check if any NFTs of this type have been minted
        require(nft.currentSupply == 0, "Cannot delete NFT with existing supply");
        
        // Remove from tracking array
        for (uint256 i = 0; i < nftIds.length; i++) {
            if (nftIds[i] == nftId) {
                nftIds[i] = nftIds[nftIds.length - 1];
                nftIds.pop();
                break;
            }
        }
        
        delete preExistingNFTs[nftId];
        
        emit NFTDeleted(nftId);
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
     */
    function setBaseURI(string calldata newBaseURI) public onlyOwner {
        baseURI = newBaseURI;
    }

    /**
     * @dev Withdraw contract balance (SEI)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No SEI balance to withdraw");
        
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Emergency pause minting
     */
    function emergencyPause() public onlyOwner {
        mintingEnabled = false;
        emit MintingToggled(false);
    }

    // ========== INTERNAL FUNCTIONS ==========

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // ========== VIEW FUNCTIONS ==========

    function getTotalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    function getRemainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - _tokenIds.current();
    }

    /**
     * @dev Get all NFT data (only available ones)
     */
    function getAllAvailableNFTData() public view returns (PreExistingNFT[] memory) {
        uint256 availableCount = 0;
        
        // Count available NFTs
        for (uint256 i = 0; i < nftIds.length; i++) {
            if (preExistingNFTs[nftIds[i]].isAvailable) {
                availableCount++;
            }
        }
        
        PreExistingNFT[] memory availableNFTs = new PreExistingNFT[](availableCount);
        uint256 count = 0;
        
        for (uint256 i = 0; i < nftIds.length; i++) {
            if (preExistingNFTs[nftIds[i]].isAvailable) {
                availableNFTs[count] = preExistingNFTs[nftIds[i]];
                count++;
            }
        }
        
        return availableNFTs;
    }

    /**
     * @dev Get all NFT data including sold out ones
     */
    function getAllNFTData() public view returns (PreExistingNFT[] memory) {
        PreExistingNFT[] memory allNFTs = new PreExistingNFT[](nftIds.length);
        
        for (uint256 i = 0; i < nftIds.length; i++) {
            uint256 nftId = nftIds[i];
            allNFTs[i] = preExistingNFTs[nftId];
        }
        
        return allNFTs;
    }

    /**
     * @dev Get NFT info by ID
     */
    function getNFTInfo(uint256 nftId) public view returns (PreExistingNFT memory) {
        require(preExistingNFTs[nftId].nftId != 0, "NFT does not exist");
        return preExistingNFTs[nftId];
    }

    /**
     * @dev Get token NFT ID mapping
     */
    function getTokenNFTId(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return tokenToNFTId[tokenId];
    }

    /**
     * @dev Get all NFT IDs
     */
    function getAllNFTIds() public view returns (uint256[] memory) {
        return nftIds;
    }

    /**
     * @dev Get NFT count
     */
    function getNFTCount() public view returns (uint256) {
        return nftIds.length;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }


// Replace the existing getUserNFTs function (around line 672)
function getUserNFTs(address user) public view returns (uint256[] memory) {
    return userNFTs[user];
}

// Replace the existing getUserMintingHistory function (around line 698)
function getUserMintingHistory(address user) public view returns (uint256[] memory) {
    return userNFTs[user]; // Same as getUserNFTs for now
}

// Add these new functions after the existing marketplace functions (around line 750)

/**
 * @dev Get user's marketplace activity (listings, purchases, sales)
 */
function getUserMarketplaceActivity(address user) public view returns (
    uint256[] memory activeListings,
    uint256[] memory soldListings,
    uint256[] memory purchasedTokens
) {
    // Get user's active listings
    activeListings = getUserListings(user);
    
    // For sold listings and purchases, you'd need to track these in events
    // This is a simplified version - you might want to enhance it
    soldListings = new uint256[](0); // Placeholder
    purchasedTokens = new uint256[](0); // Placeholder
    
    return (activeListings, soldListings, purchasedTokens);
}

/**
 * @dev Get detailed NFT info including ownership and listing status
 */
function getDetailedNFTInfo(uint256 tokenId) public view returns (
    uint256 nftId,
    string memory name,
    string memory description,
    string memory image,
    string memory metadata,
    uint256 rarity,
    address owner,
    bool isListed,
    uint256 listingPrice,
    address seller
) {
    require(_exists(tokenId), "Token does not exist");
    
    nftId = getTokenNFTId(tokenId);
    PreExistingNFT memory nft = getNFTInfo(nftId);
    
    name = nft.name;
    description = nft.description;
    image = nft.image;
    metadata = nft.metadata;
    rarity = nft.rarity;
    owner = ownerOf(tokenId);
    
    // Check if listed
    try this.getListingByTokenId(tokenId) returns (NFTListing memory listing) {
        isListed = listing.isActive;
        listingPrice = listing.price;
        seller = listing.seller;
    } catch {
        isListed = false;
        listingPrice = 0;
        seller = address(0);
    }
}

// Add missing cancelListing function (alias for unlistNFT)
function cancelListing(uint256 tokenId) public {
    unlistNFT(tokenId);
}

// Fix buyNFT function to match frontend calls
function buyNFT(uint256 listingId) public payable nonReentrant {
    uint256 tokenId = listingIdToTokenId[listingId];
    require(tokenId != 0, "Invalid listing ID");
    
    NFTListing storage listing = nftListings[tokenId];
    require(listing.isActive, "Listing not active");
    require(msg.sender != listing.seller, "Cannot buy your own NFT");
    require(msg.value == listing.price, "Incorrect payment amount");
    
    address seller = listing.seller;
    
    // Calculate fees
    uint256 marketplaceFee = (listing.price * MARKETPLACE_FEE) / BASIS_POINTS;
    uint256 sellerAmount = listing.price - marketplaceFee;
    
    // Transfer NFT
    _transfer(seller, msg.sender, tokenId);
    
    // Update userNFTs mapping
    _removeFromUserNFTs(seller, tokenId);
    userNFTs[msg.sender].push(tokenId);
    
    // Remove listing
    delete nftListings[tokenId];
    delete listingIdToTokenId[listingId];
    _removeFromUserListings(seller, listingId);
    totalListings--;
    
    // Transfer payments
    payable(seller).transfer(sellerAmount);
    payable(owner()).transfer(marketplaceFee);
    
    emit NFTSold(listingId, tokenId, seller, msg.sender, listing.price);
}

// Add helper function to remove NFT from user's array
function _removeFromUserNFTs(address user, uint256 tokenId) internal {
    uint256[] storage userTokens = userNFTs[user];
    for (uint256 i = 0; i < userTokens.length; i++) {
        if (userTokens[i] == tokenId) {
            userTokens[i] = userTokens[userTokens.length - 1];
            userTokens.pop();
            break;
        }
    }
}

}