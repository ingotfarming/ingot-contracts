pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IIngotToken.sol";
import "./interfaces/IIngotNFT.sol";

contract Store is Ownable, ReentrancyGuard{
    using SafeMath for uint256;
    using SafeERC20 for IIngotToken;

    IIngotToken public token;
    IIngotNFT public asset;

    mapping(uint256 => uint256) public priceNFT;
    bool public isStoreOpen = false;

    // Pre sale variables
    uint256 public constant SAFE_MULTIPLIER = 1e18;
    uint256 public weiRaised = 0;
    uint256 public ETH_CAP = 1000 * SAFE_MULTIPLIER;
    uint256 public RATIO_WEI_TOKEN = 1950;
    bool public isPresale = false;

    constructor(IIngotToken _token, IIngotNFT _asset) public {
        token = _token;
        asset = _asset;
        
        priceNFT[0] = SAFE_MULTIPLIER.mul(100);
        priceNFT[1] = SAFE_MULTIPLIER.mul(130);
        priceNFT[2] = SAFE_MULTIPLIER.mul(169);
        priceNFT[3] = SAFE_MULTIPLIER.mul(220);
        priceNFT[4] = SAFE_MULTIPLIER.mul(285);
        priceNFT[5] = SAFE_MULTIPLIER.mul(371);
        priceNFT[6] = SAFE_MULTIPLIER.mul(483);
        priceNFT[7] = SAFE_MULTIPLIER.mul(627);
        priceNFT[8] = SAFE_MULTIPLIER.mul(816);
        priceNFT[9] = SAFE_MULTIPLIER.mul(1060);
        priceNFT[10] = SAFE_MULTIPLIER.mul(1378);
        priceNFT[11] = SAFE_MULTIPLIER.mul(1792);
    }

    /* ========== PUBLIC ========== */

    function buyBatchNft(uint256[] memory _ids, uint256[] memory _amounts) public nonReentrant {
        require(isStoreOpen, "Store is closed");
        require(_ids.length > 0, "Store: invalid argument");
        require(_amounts.length > 0, "Store: invalid argument");
        require(_ids.length == _amounts.length, "Pool: invalid argument");

        uint256  amountRequired = 0;
        for (uint256 i = 0; i < _ids.length; i++) {
            uint256 id = _ids[i];
            uint256 amount = _amounts[i];
            require(priceNFT[id]>0, "Store: invalid argument");
            require(amount>0, "Store: invalid argument");
            //require(maxAmountAllowedNft[id].sub(minedNft[id]) >= amount, "Store: invalid argument");
            amountRequired = amountRequired.add(priceNFT[id].mul(amount));
        }
        require(amountRequired>0, "Store: invalid argument");

        token.safeTransferFrom(msg.sender, address(this), amountRequired);
        token.burnTokens(amountRequired);
        asset.mintBatch(msg.sender, _ids, _amounts,"");
    }

    function buyTokens() public nonReentrant payable {
        require(isPresale, "Presale Ended");
        uint256 weiAmount = msg.value;
        require(weiAmount>0, "Store: invalid argument");
        require(weiRaised.add(weiAmount) <= ETH_CAP, "ETH CAP Overlimit");
        uint256 tokenAmount = weiAmount.mul(RATIO_WEI_TOKEN);
    
        weiRaised = weiRaised.add(weiAmount);
        token.mint(msg.sender, tokenAmount);   
    }

    /* ========== OWNER ONLY FUNCTIONS ========== */

    function extractEther() public onlyOwner {
       payable(owner()).transfer(address(this).balance);
   }

    function setPriceNft(uint256 id, uint256 price) public onlyOwner {
        priceNFT[id] = price;
    }

    function setETHCap(uint256 cap) public onlyOwner {
        ETH_CAP = cap;
    }

    function setRatioWeiToken(uint256 ratio) public onlyOwner {
        RATIO_WEI_TOKEN = ratio;
    }

    function setIsPresale(bool flag) public onlyOwner {
        isPresale = flag;
    }

    function setIsStoreOpen(bool flag) public onlyOwner {
        isStoreOpen = flag;
    }
}