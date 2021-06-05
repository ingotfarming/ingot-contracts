pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IINGOTToken.sol";


contract INGOTToken is ERC20, IINGOTToken, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    uint256 public UNISWAP_LIQUIDITY = 1050000 * 1e18;
    mapping (address => bool) public _minters;
    constructor() public ERC20("Ingot Token", "INGOT"){
        _minters[msg.sender] = true;
        _mint(msg.sender, UNISWAP_LIQUIDITY);
    }
    
    /* ========== EXTERNAL MUTATIVE FUNCTIONS ========== */

    /**
     * @dev allow owner to mint
     * @param _to mint token to address
     * @param _amount amount of ALPA to mint
     */
    function mint(address _to, uint256 _amount) external override {
        require(_minters[msg.sender], "!minter");
        
        _mint(_to, _amount);
    }
    function addMinter(address _minter) external onlyOwner {
        _minters[_minter] = true;
    }
    
    function removeMinter(address _minter) external onlyOwner {
        _minters[_minter] = false;
    }
    function burnOwnToken(uint256 amount) external override {
        require(_minters[msg.sender], "!minter");
        _burn(msg.sender, amount);
    }
}