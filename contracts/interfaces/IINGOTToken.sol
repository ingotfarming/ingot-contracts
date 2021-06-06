pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IIngotToken is IERC20 {
    function mint(address _to, uint256 _amount) external;
    function burnTokens(uint256 amount) external;
}