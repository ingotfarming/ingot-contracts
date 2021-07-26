pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IIngotNFT.sol";

contract IngotNFT is ERC1155, IIngotNFT, Ownable {
    using SafeMath for uint256;

    mapping (address => bool) public _minters;
    mapping (uint256 => Asset) public assets;

    struct Asset {
        uint256 id;
        uint256 power;
        uint256 currMinting;
        uint256 maxMinting;
    }

    constructor() public ERC1155("https://app.ingotfarming.finance/api/ingotnft/{id}.json"){
        _minters[msg.sender] = true;

        addType(0, 10, 7000);
        addType(1, 14, 5425);
        addType(2, 19, 4204);
        addType(3, 26, 3258);
        addType(4, 35, 2525);
        addType(5, 47, 1957);
        addType(6, 65, 1516);
        addType(7, 87, 1175);
        addType(8, 118, 910);
        addType(9, 160, 706);
        addType(10, 215, 547);
        addType(11, 290, 424);

    }

    /* ========== MINTER ONLY FUNCTIONS ========== */

    function mint(address to, uint256 id, uint256 amount, bytes calldata data) override external {
        require(_minters[msg.sender], "!minter");
        Asset storage asset = assets[id];
        require(asset.maxMinting > 0);
        require(asset.currMinting.add(amount) <= asset.maxMinting, "Exceed max minting allowed");
        asset.currMinting = asset.currMinting.add(amount);
        
        _mint( to,  id,  amount, data);
    }

    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) override external {
        require(_minters[msg.sender], "!minter");
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];
            Asset storage asset = assets[id];
            require(asset.maxMinting > 0);
            require(asset.currMinting.add(amount) <= asset.maxMinting, "Exceed max minting allowed");
            asset.currMinting = asset.currMinting.add(amount); 
        }
        _mintBatch( to,  ids,  amounts, data);
    }

    /* ========== OWNER ONLY FUNCTIONS ========== */

    function setURI(string memory _newuri) external onlyOwner {
        _setURI(_newuri);
    }

    function addType(uint256 id, uint256 power, uint256 maxMinting) public onlyOwner {
        Asset storage asset = assets[id];
        asset.id = id;
        asset.power = power;
        asset.maxMinting = maxMinting;
    }

    function burnAssetBatch(uint256[] memory ids, uint256[] memory amounts) public onlyOwner {
        require(ids.length > 0, "IngotNFT: invalid argument");
        require(ids.length == amounts.length, "IngotNFT: invalid argument");
        
        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];
            Asset storage asset = assets[id];
            require(asset.maxMinting > 0, "IngotNFT: invalid argument");
            if(amount == 0){
                asset.maxMinting = asset.currMinting;
            }else{
                asset.maxMinting = Math.max( asset.maxMinting.sub(amount), asset.currMinting);
            }
        }
    }

    function addMinter(address _minter) external onlyOwner {
        _minters[_minter] = true;
    }

    function removeMinter(address _minter) external onlyOwner {
        _minters[_minter] = false;
    }

    /* ========== PUBLIC ========== */

    function getAssetInfo(uint256 _id) override external view returns(uint256, uint256, uint256, uint256){
        return(assets[_id].id, assets[_id].power, assets[_id].currMinting, assets[_id].maxMinting);
    }

    function assetPowerBatch(uint256[] memory ids) override public view returns (uint256[] memory) {
        uint256[] memory batch = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; ++i) {
            batch[i] = assets[ids[i]].power;
        }
        return batch;
    }

    function assetCurrMintingBatch(uint256[] memory ids) override public view returns (uint256[] memory) {
        uint256[] memory batch = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; ++i) {
            batch[i] = assets[ids[i]].currMinting;
        }
        return batch;
    }

    function assetMaxMintingBatch(uint256[] memory ids) override public view returns (uint256[] memory) {
        uint256[] memory batch = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; ++i) {
            batch[i] = assets[ids[i]].maxMinting;
        }
        return batch;
    }
}