
const utils = require('./utils.js');
const BN = web3.utils.BN;

const IngotToken = artifacts.require("IngotToken");
const IngotNFT = artifacts.require("IngotNFT");
const IngotFarm = artifacts.require("IngotFarm");

var ingotToken;
var ingotAsset;
var assetPool;

var REWARD_FOR_BLOCK;
var REWARD_FOR_BLOCK_USER;
var REWARD_FOR_BLOCK_DEV;


var EPSILON_REWARD = new BN(100)
const SAFE_MULTIPLIER = (new BN('10')).pow(new BN('18'));

contract("IngotFarm", async accounts => {
  async function deployContract() {
    ingotToken = await IngotToken.new();
    ingotAsset = await IngotNFT.new();
    assetPool = await IngotFarm.new(ingotToken.address, ingotAsset.address);

    await ingotToken.addMinter(assetPool.address, {from: owner});
    await ingotAsset.addMinter(assetPool.address, {from: owner});
  
    await ingotAsset.addType(0, 10, 1000, {from: owner});
    await ingotAsset.addType(1, 15, 1000, {from: owner});
    await ingotAsset.addType(2, 50, 1000, {from: owner});
    await ingotAsset.addType(3, 10, 1000, {from: owner});
    await ingotAsset.mintBatch(account1, [0, 1, 2, 3], [100, 100, 100, 100], 0, {from: owner});
    await ingotAsset.mintBatch(account2, [0, 1, 2, 3], [100, 100, 100, 100], 0, {from: owner});
    
    REWARD_FOR_BLOCK = await assetPool.rewardForBlock.call();
    REWARD_FOR_BLOCK_USER = REWARD_FOR_BLOCK.mul(new BN(9)).div(new BN(10));
  };
  const owner = accounts[0];
  const account1 = accounts[1];
  const account2 = accounts[2];
  const account3 = accounts[3];


  describe("TransferBatchAsset", function() {
    before(deployContract);
    it("Check TransferBatchAsset", async function() {
      const idsAsset = [1, 0, 3]; const amountsAsset = [new BN(2), new BN(10), new BN(2)];
      const balancePoolBefore = await ingotAsset.balanceOfBatch.call(Array(idsAsset.length).fill(assetPool.address), idsAsset);
      const balanceAccountBefore = await ingotAsset.balanceOfBatch.call(Array(idsAsset.length).fill(account1), idsAsset);
      await ingotAsset.safeBatchTransferFrom(account1, assetPool.address, idsAsset, amountsAsset, 0, {from: account1});
      const balancePool = await ingotAsset.balanceOfBatch.call(Array(idsAsset.length).fill(assetPool.address), idsAsset);
      const balanceAccount = await ingotAsset.balanceOfBatch.call(Array(idsAsset.length).fill(account1), idsAsset);
      assert.ok(utils.equalArray(utils.subArray(balancePool,balancePoolBefore), amountsAsset));
      assert.ok(utils.equalArray(utils.subArray(balanceAccountBefore,balanceAccount), amountsAsset));
      for(let i=0;i<idsAsset.length;i++){
        let numAsset = await assetPool.getUserNumberAsset.call(account1, idsAsset[i]);
        assert.ok(numAsset.eq(amountsAsset[i]));
      }
    });
    it("Check TransferBatchAsset Fail: no id", async function() {
      await utils.expectThrow(ingotAsset.safeBatchTransferFrom(account1, assetPool.address, [1, 0, 100], [2,10,2], 0, {from: account1}));
    });
    it("Check TransferBatchAsset Fail: no amount", async function() {
      await utils.expectThrow(ingotAsset.safeBatchTransferFrom(account1, assetPool.address, [1, 0, 3], [2,10,100], 0, {from: account1}));
    });
  });

  describe("ClaimReward", function() {
    before(deployContract);
    describe("TestCase 1 User", async function() {
      const idsAsset = [0, 1]; const amountsAsset = [new BN(3),new BN(2)]; var reward; 
      it("Check no reward", async function() {
        const powers = await ingotAsset.assetPowerBatch.call(idsAsset);
        await ingotAsset.safeBatchTransferFrom(account1, assetPool.address, idsAsset, amountsAsset, 0, {from: account1});
        reward = await assetPool.pendingReward.call({from: account1});
        assert.ok(reward.eq(new BN(0)));
      });
      it("Check reward 1", async function() {
        await utils.advanceBlock();
        //await utils.advanceBlock();
        reward = await assetPool.pendingReward.call({from: account1});
        // console.log('Reward:', web3.utils.fromWei(reward), web3.utils.fromWei(REWARD_FOR_BLOCK_USER));
        assert.ok(((reward.sub(REWARD_FOR_BLOCK_USER)).abs()).lt(EPSILON_REWARD));
      });
      it("Claim reward 1", async function() {
        var balanceBefore = await ingotToken.balanceOf.call(account1);
        await assetPool.claim({from: account1});
        reward = (await ingotToken.balanceOf(account1)).sub(balanceBefore);
        //console.log('Reward:', web3.utils.fromWei(reward), web3.utils.fromWei(REWARD_FOR_BLOCK_USER.mul(new BN(2))));
        assert.ok(reward.sub(REWARD_FOR_BLOCK_USER.mul(new BN(2))).abs().lt(EPSILON_REWARD));
      });
      it("Retrieve some Asset and claim", async function() {
        var balanceBefore = await ingotToken.balanceOf.call(account1);
        await utils.advanceBlock();
        await assetPool.retrieve([1],[new BN(1)], {from: account1});
        await assetPool.claim({from: account1});
        reward = (await ingotToken.balanceOf(account1)).sub(balanceBefore);
        //console.log('Reward:', web3.utils.fromWei(reward), web3.utils.fromWei(REWARD_FOR_BLOCK_USER.mul(new BN(3))));
        assert.ok(reward.sub(REWARD_FOR_BLOCK_USER.mul(new BN(3))).abs().lt(EPSILON_REWARD));
      });
    });
    describe("TestCase 2 User", async function() {
      before(deployContract);
      const idsAsset1 = [0, 1]; const amountsAsset1 = [new BN(2),new BN(3)]; var reward2; 
      const idsAsset2 = [1, 2]; const amountsAsset2 = [new BN(2),new BN(1)]; var reward2; 
      it("Claim reward", async function() {
        await ingotAsset.safeBatchTransferFrom(account1, assetPool.address, idsAsset1, amountsAsset1, 0,{from: account1});
        await ingotAsset.safeBatchTransferFrom(account2, assetPool.address, idsAsset2, amountsAsset2, 0,{from: account2});
        const powers1 = (await assetPool.getUserInfo.call(account1))[0];
        const powers2 = (await assetPool.getUserInfo.call(account2))[0];
        let balanceBefore1 = (await ingotToken.balanceOf.call(account1));
        let balanceBefore2 = (await ingotToken.balanceOf.call(account2));

        await assetPool.claim({from: account1});
        await assetPool.claim({from: account2});

        reward1 = (await ingotToken.balanceOf(account1)).sub(balanceBefore1);
        ratio1 = SAFE_MULTIPLIER.mul(powers1).div(powers1.add(powers2));
        let rewardExp1 = REWARD_FOR_BLOCK_USER.add((REWARD_FOR_BLOCK_USER.mul(ratio1)).div(SAFE_MULTIPLIER))
        // console.log('Reward user 1:', web3.utils.fromWei(reward1), web3.utils.fromWei(rewardExp1), web3.utils.fromWei(ratio1));
        assert.ok(reward1.sub(rewardExp1).abs().lt(EPSILON_REWARD));

        reward2 = (await ingotToken.balanceOf(account2)).sub(balanceBefore2);
        ratio2 = SAFE_MULTIPLIER.mul(powers2).div(powers1.add(powers2));
        let rewardExp2 = ((REWARD_FOR_BLOCK_USER.mul(ratio2).mul(new BN(2))).div(SAFE_MULTIPLIER))
        //console.log('Reward user 2:', web3.utils.fromWei(reward2), web3.utils.fromWei(rewardExp2), web3.utils.fromWei(ratio2));
        assert.ok(reward2.sub(rewardExp2).abs().lt(EPSILON_REWARD));
      });
      it("Retrieve some Asset and claim U1", async function() {
        
      });
    });
  });
  describe("Keys Struct", function() {
    before(deployContract);
    it("After 1 transfer", async function() {
      await ingotAsset.safeBatchTransferFrom(account1, assetPool.address, [3], [1], 0, {from: account1});
      let length = (await assetPool.checkLengthSetKeys.call(account1)).toNumber();
      assert.equal(length,1);
      let id = (await assetPool.checkSetKeys.call(account1, 0)).toNumber();
      assert.equal(id,3);
      let amount = (await assetPool.getUserNumberAsset.call(account1, 3)).toNumber();
      assert.equal(amount,1);
    });
    it("After 1 retrieve", async function() {
      await assetPool.retrieve([3],[1], {from: account1});
      assert.equal((await assetPool.checkLengthSetKeys.call(account1)).toNumber(),0);
      assert.equal((await assetPool.getUserNumberAsset.call(account1, 3)).toNumber(),0);
    });
    it("After 2 transfer", async function() {
      await ingotAsset.safeBatchTransferFrom(account1, assetPool.address, [2,0], [3,2], 0, {from: account1});
      assert.equal((await assetPool.checkLengthSetKeys.call(account1)).toNumber(),2);
      assert.equal((await assetPool.checkSetKeys.call(account1, 0)).toNumber(),2);
      assert.equal((await assetPool.checkSetKeys.call(account1, 1)).toNumber(),0);
      assert.equal((await assetPool.getUserNumberAsset.call(account1, 2)).toNumber(),3);
      assert.equal((await assetPool.getUserNumberAsset.call(account1, 0)).toNumber(),2);
    });
    it("After 1 same transfer", async function() {
      await ingotAsset.safeBatchTransferFrom(account1, assetPool.address, [2,1], [1,1], 0, {from: account1});
      assert.equal((await assetPool.checkLengthSetKeys.call(account1)).toNumber(),3);
      assert.equal((await assetPool.checkSetKeys.call(account1, 0)).toNumber(),2);
      assert.equal((await assetPool.checkSetKeys.call(account1, 2)).toNumber(),1);
      assert.equal((await assetPool.getUserNumberAsset.call(account1, 2)).toNumber(),4);
      assert.equal((await assetPool.getUserNumberAsset.call(account1, 1)).toNumber(),1);
    });
  });


});
