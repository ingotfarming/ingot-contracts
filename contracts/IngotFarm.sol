pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IIngotToken.sol";
import "./interfaces/IIngotNFT.sol";

contract IngotFarm is ERC1155Receiver, ReentrancyGuard, Ownable{
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.UintSet;

    struct UserInfo {
        EnumerableSet.UintSet keys;
        mapping(uint256 => uint256) values;

        uint256 totalPower;
        uint256 pendingReward;
        uint256 rewardDebt;
    }

    // Info of Reward.
    struct RewardInfo {
        // Last block number that INGOTs distribution occurs.
        uint256 lastRewardBlock;
        // Accumulated INGOTs per share.
        uint256 accTokenPerShare;
        // Accumulated Share
        uint256 accShare;
    }

    IIngotToken public token;
    IIngotNFT public asset;
    
    uint256 public constant SAFE_MULTIPLIER = 1e18;
    
    // farm pool info
    RewardInfo public rewardInfo;
    uint256 public rewardForBlock = 10 * SAFE_MULTIPLIER;

    mapping(address => UserInfo) private userInfo;

    constructor(IIngotToken _token, IIngotNFT _asset) public {
        token = _token;
        asset = _asset;

        rewardInfo = RewardInfo({
            lastRewardBlock: block.number,
            accTokenPerShare: 0,
            accShare: 0
        });
    }

    /* ========== PUBLIC ========== */

    function pendingReward() external view returns(uint256){
        UserInfo storage user = userInfo[msg.sender];
        if(rewardInfo.accShare == 0){
            return user.pendingReward.sub(user.pendingReward.div(10));
        }
        uint256 reward = (block.number.sub(rewardInfo.lastRewardBlock)).mul(rewardForBlock);
        uint256 accTokenPerShare = rewardInfo.accTokenPerShare.add(
            reward.mul(SAFE_MULTIPLIER).div(rewardInfo.accShare));
        uint256 totalReward = user.totalPower.mul(accTokenPerShare).div(SAFE_MULTIPLIER);
        uint256 pending = totalReward.sub(user.rewardDebt);
        uint256 accPendingReward = user.pendingReward.add(pending);

        return accPendingReward.sub(accPendingReward.div(10));
    }

    function claim() public nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        updatePool();
        _updateUserReward(user);
        user.rewardDebt = user.totalPower.mul(rewardInfo.accTokenPerShare).div(SAFE_MULTIPLIER);
        uint256 pendingReward = user.pendingReward;
        if(pendingReward > 0){
            user.pendingReward = 0;
            uint256 devReward = pendingReward.div(10);
            token.mint(owner(), devReward);
            token.mint(msg.sender, pendingReward.sub(devReward));
        }
    }

    function retrieve(uint256[] memory _ids, uint256[] memory _values) public nonReentrant {
        require(_ids.length > 0, "Pool: invalid argument");
        require(_values.length > 0, "Pool: invalid argument");
        require(_ids.length == _values.length, "Pool: invalid argument");

        UserInfo storage user = userInfo[msg.sender];
        for (uint256 i = 0; i < _ids.length; i++) {
            uint256 id = _ids[i];
            require(_values[i]> 0 , "Pool: invalid argument");
            require(user.values[id] >= _values[i] , "Pool: invalid argument");
            
            user.values[id] = user.values[id].sub(_values[i]);
            
            if(user.values[id] == 0){
                user.keys.remove(id);
            }            
        }
        uint256 oldPower = user.totalPower;
        updatePool();
        _updateUserReward(user);
        _updateUserPower(user);
        user.rewardDebt = user.totalPower.mul(rewardInfo.accTokenPerShare).div(SAFE_MULTIPLIER);
        rewardInfo.accShare = rewardInfo.accShare.add(user.totalPower).sub(oldPower);

        asset.safeBatchTransferFrom(address(this), msg.sender, _ids, _values, "");

    }

    function updatePool() public {
        if (block.number <= rewardInfo.lastRewardBlock) {
            return;
        }

        if (rewardInfo.accShare == 0) {
            rewardInfo.lastRewardBlock = block.number;
            return;
        }

        uint256 reward = (block.number.sub(rewardInfo.lastRewardBlock)).mul(rewardForBlock);

        rewardInfo.accTokenPerShare = rewardInfo.accTokenPerShare.add(
            reward.mul(SAFE_MULTIPLIER).div(rewardInfo.accShare)
        );

        rewardInfo.lastRewardBlock = block.number;
    }

    function getUserInfo(address addr) public view returns(uint256, uint256, uint256){
        return(userInfo[addr].totalPower, userInfo[addr].pendingReward, userInfo[addr].rewardDebt );
    }

    function getUserNumberAsset(address addr, uint256 assetType) public view returns(uint256){
        return userInfo[addr].values[assetType];
    }

    function checkLengthSetKeys(address userAddress) external view returns(uint256){
        return userInfo[userAddress].keys.length();
    }

    function checkSetKeys(address userAddress, uint256 i) external view returns(uint256){
        return userInfo[userAddress].keys.at(i); 
    }

    /* ========== ERC1155Receiver ========== */

    function onERC1155Received(address _operator, address _from, uint256 _id, uint256 _value, bytes calldata _data)
    external override nonReentrant fromAssetAddress returns (bytes4) {
        
        UserInfo storage user = userInfo[_from];
        
        user.values[_id] = user.values[_id].add(_value);

        if(!user.keys.contains(_id)){
            user.keys.add(_id);
        }
        
        uint256 oldPower = user.totalPower;
        updatePool();
        _updateUserReward(user);
        _updateUserPower(user);
        user.rewardDebt = user.totalPower.mul(rewardInfo.accTokenPerShare).div(SAFE_MULTIPLIER);
        rewardInfo.accShare = rewardInfo.accShare.add(user.totalPower).sub(oldPower);


        return
            bytes4(
                keccak256(
                    "onERC1155Received(address,address,uint256,uint256,bytes)"
                )
            );
            
    }

    function onERC1155BatchReceived(address _operator, address _from, uint256[] calldata _ids, uint256[] calldata _values, bytes calldata _data)
    external override nonReentrant fromAssetAddress returns (bytes4) {
        require(_ids.length == _values.length, "Array must be equal!");
        
        UserInfo storage user = userInfo[_from];

        for (uint256 i = 0; i < _ids.length; i++) {
            uint256 id = _ids[i];
            user.values[id] = user.values[id].add(_values[i]);
            if(!user.keys.contains(id)){
                user.keys.add(id);
            }
        }
        
        uint256 oldPower = user.totalPower;
        updatePool();
        _updateUserReward(user);
        _updateUserPower(user);
        user.rewardDebt = user.totalPower.mul(rewardInfo.accTokenPerShare).div(SAFE_MULTIPLIER);
        rewardInfo.accShare = rewardInfo.accShare.add(user.totalPower).sub(oldPower);

         return
            bytes4(
                keccak256(
                    "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"
                )
            );
    }

    /* ========== PRIVATE ========== */

    function _updateUserPower(UserInfo storage _user) private
    {
        uint256 totalPower = 0;
        for (uint256 i = 0; i < _user.keys.length(); i++) {
            uint256 id = _user.keys.at(i);
            (, uint256 _power, ,) = asset.getAssetInfo(id);
            
            totalPower = totalPower.add(_user.values[id].mul(_power));
        }

        _user.totalPower = totalPower;
    }


    function _updateUserReward(UserInfo storage user) private{
        if(user.totalPower > 0){
            uint256 totalReward = user.totalPower.mul(rewardInfo.accTokenPerShare).div(SAFE_MULTIPLIER);
            uint256 pending = totalReward.sub(user.rewardDebt);
            user.pendingReward = user.pendingReward.add(pending);
        }       
    }

    /* ========== OWNER ONLY FUNCTIONS ========== */

    function setRewardPerBlock(uint256 _tokenPerBlock) external onlyOwner {
        rewardForBlock = _tokenPerBlock;
    }

    /* ========== MODIFIER ========== */

    modifier fromAssetAddress() {
        require(
            msg.sender == address(asset),
            "Pool: received Asset from unauthenticated contract"
        );
        _;
    }

}