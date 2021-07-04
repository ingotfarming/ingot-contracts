pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IIngotToken.sol";

contract PrivateSale is Ownable, ReentrancyGuard{
    using SafeMath for uint256;
    using SafeERC20 for IIngotToken;

    IIngotToken public token;

    mapping (address => uint256) public users;

    // Pre sale variables
    uint256 public constant SAFE_MULTIPLIER = 1e18;
    uint256 public MAX_ETH_USER = 1 * SAFE_MULTIPLIER;
    uint256 public weiRaised = 0;
    uint256 public ETH_CAP = 1000 * SAFE_MULTIPLIER;
    uint256 public RATIO_WEI_TOKEN = 1950;
    bool public isPrivateSale = true;

    constructor(IIngotToken _token) public {
        token = _token;
    }

    /* ========== PUBLIC ========== */

    function buyTokens() public nonReentrant payable {
        require(isPrivateSale, "Private Sale Ended");
        uint256 weiAmount = msg.value;
        require(weiAmount > 0, "Store: invalid argument");
        require(weiRaised.add(weiAmount) <= ETH_CAP, "ETH CAP Overlimit");
        require(users[msg.sender].add(weiAmount) <= MAX_ETH_USER, "ETH PER USER Overlimit");
        uint256 tokenAmount = weiAmount.mul(RATIO_WEI_TOKEN);
        
        users[msg.sender] = users[msg.sender].add(weiAmount);
        weiRaised = weiRaised.add(weiAmount);
        token.mint(msg.sender, tokenAmount);   
    }

    /* ========== OWNER ONLY FUNCTIONS ========== */

    function extractEther() public onlyOwner {
       payable(owner()).transfer(address(this).balance);
   }

    function setMaxETHUser(uint256 cap) public onlyOwner {
        MAX_ETH_USER = cap;
    }

    function setETHCap(uint256 cap) public onlyOwner {
        ETH_CAP = cap;
    }

    function setRatioWeiToken(uint256 ratio) public onlyOwner {
        RATIO_WEI_TOKEN = ratio;
    }

    function setIsPrivateSale(bool flag) public onlyOwner {
        isPrivateSale= flag;
    }
}