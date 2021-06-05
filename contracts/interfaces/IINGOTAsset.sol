pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface IINGOTAsset is IERC1155 {
    function getAssetInfo(uint256 _id) external view returns(uint256, uint256, uint256, uint256);
    function mint(address to, uint256 id, uint256 amount, bytes calldata data) external;
    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external;
    function assetPowerBatch(uint256[] memory ids) external view returns (uint256[] memory);
    function assetCurrMintingBatch(uint256[] memory ids) external view returns (uint256[] memory);
    function assetMaxMintingBatch(uint256[] memory ids) external view returns (uint256[] memory);
}

 