pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IIngotToken.sol";


contract IngotToken is ERC20, IIngotToken, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // uint256 public UNISWAP_LIQUIDITY = 1050000 * 1e18;
    mapping (address => bool) public _minters;
    constructor() public ERC20("Ingot Token", "Ingot"){
        _minters[msg.sender] = true;
        // _mint(msg.sender, UNISWAP_LIQUIDITY);
    }
    
    /* ========== MINTER ONLY FUNCTIONS ========== */

    function mint(address _to, uint256 _amount) external override {
        require(_minters[msg.sender], "!minter");
        _mint(_to, _amount);
    }
    function burnTokens(uint256 amount) external override {
        require(_minters[msg.sender], "!minter");
        _burn(msg.sender, amount);
    }

    /* ========== OWNER ONLY FUNCTIONS ========== */
    
    function addMinter(address _minter) external onlyOwner {
        _minters[_minter] = true;
    }
    
    function removeMinter(address _minter) external onlyOwner {
        _minters[_minter] = false;
    }

}