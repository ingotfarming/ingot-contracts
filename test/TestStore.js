
const utils = require('./utils.js');
const BN = web3.utils.BN;

const IngotToken = artifacts.require("IngotToken");
const IngotNFT = artifacts.require("IngotNFT");
const Store = artifacts.require("Store");

var ingotToken;
var ingotAsset;
var store;

var REWARD_FOR_BLOCK;
var EPSILON_REWARD = new BN(100)
const SAFE_MULTIPLIER = (new BN('10')).pow(new BN('18'));


contract("StoreTest", async accounts => {

  async function deployContract() {
    ingotToken = await IngotToken.new();
    ingotAsset = await IngotNFT.new();
    store = await Store.new(ingotToken.address, ingotAsset.address);

    await ingotToken.addMinter(store.address);
    await ingotAsset.addMinter(store.address);
  
    await ingotAsset.addType(0, 10, 1000);
    await ingotAsset.addType(1, 15, 1000);
    await ingotAsset.addType(2, 50, 1000);
    await ingotAsset.addType(3, 10, 2);
    await ingotAsset.addType(4, 10, 1);

    await store.setPriceNft(0, web3.utils.toWei("0.1"));
    await store.setPriceNft(1, web3.utils.toWei("0.2"));
    await store.setPriceNft(2, web3.utils.toWei("0.3"));
    await store.setPriceNft(3, web3.utils.toWei("0.4"));
    await store.setPriceNft(4, web3.utils.toWei("0.3"));

  };
  const owner = accounts[0];
  const account1 = accounts[1];
  const account2 = accounts[2];
  
  describe("Contation creation:", function() {
    before(deployContract);
    it("Open Pre Sale", async function() {
      await utils.expectThrow(store.buyTokens({ value: 1, from: account1}));
      await store.setIsPresale(true, {from: owner});
    });
    it("Buy some Tokens", async function() {
      let amount = web3.utils.toWei(new BN(10));

      await store.buyTokens({ value: amount, from: account1 });
      let balance = (await ingotToken.balanceOf.call(account1));
      let factorWeiToken = await store.RATIO_WEI_TOKEN.call();
      assert.ok(balance.eq(factorWeiToken.mul(amount)));
    });
    it("Open Store", async function() {
      await store.setIsStoreOpen(true, {from: owner});
    });
    it("Buy some NFTs", async function() {
      let ids = [0,1];
      let amounts = [ new BN(2), new BN(3)];
      var amountToken = new BN(0);
      for(let i=0; i<ids.length;i++){
        let price = await store.priceNFT.call(ids[i]);
        amountToken = amountToken.add(price.mul(amounts[i]));
      }

      let balanceBefore = await ingotAsset.balanceOfBatch.call(Array(ids.length).fill(account1), ids);
      await ingotToken.approve(store.address, amountToken, {from: account1});
      await store.buyBatchNft(ids, amounts, {from: account1});

      let balanceAfter = await ingotAsset.balanceOfBatch.call(Array(ids.length).fill(account1), ids);
      
      assert.ok(utils.equalArray(utils.subArray(balanceAfter,balanceBefore),amounts));
    });
    it("Buy one NFT", async function() {
      let ids = [1];
      let amounts = [new BN(2)];
      var amountToken = new BN(0);
      for(let i=0; i<ids.length;i++){
        let price = await store.priceNFT.call(ids[i]);
        amountToken = amountToken.add(price.mul(amounts[i]));
      }
      let balanceBefore = await ingotAsset.balanceOfBatch.call(Array(ids.length).fill(account1), ids);
      await ingotToken.approve(store.address, amountToken, {from: account1});
      await store.buyBatchNft(ids, amounts, {from: account1});

      let balanceAfter = await ingotAsset.balanceOfBatch.call(Array(ids.length).fill(account1), ids);
      
      assert.ok(utils.equalArray(utils.subArray(balanceAfter,balanceBefore),amounts));
    });
/*
    it("Extract Ether", async function() {
      let gasPrice = new BN(await web3.eth.getGasPrice());
      let balanceBefore = new BN(await web3.eth.getBalance(accounts[0]));
      let balanceBeforeWei = web3.utils.fromWei(balanceBefore);

      console.log(balanceBeforeWei);

      let response1 = await store.extractEther();
      let gasUsed = new BN(await response1.receipt.gasUsed);
      let gasSpended= gasPrice.mul(gasUsed)
      let gasSpendedWei = web3.utils.fromWei(gasSpended)

      console.log( gasSpendedWei.toString())
      
      let balanceAfter = new BN(await web3.eth.getBalance(accounts[0]));
      let balanceAfterWei = web3.utils.fromWei(balanceAfter);

      console.log(balanceAfterWei)
      console.log((balanceBefore.add(gasSpended)).toString(), balanceAfter.toString());
      assert.ok((balanceBefore.sub(gasSpended)).eq(balanceAfter));

    });
*/
  });
  describe("Buy:", function() {
    before(deployContract);
    it("Open Store", async function() {
      await store.setIsStoreOpen(true, {from: owner});
    });
    it("Buy one NFT", async function() {
      let ids = [4]; let amounts = [new BN(1)];
      await ingotToken.mint(account1, web3.utils.toWei("10000"), {from:owner});
      await ingotToken.approve(store.address, web3.utils.toWei("0.3"), {from:account1});
      
      let balanceBefore = await ingotAsset.balanceOfBatch.call(Array(ids.length).fill(account1), ids);
      await store.buyBatchNft(ids, amounts, {from:account1});
      let balanceAfter= await ingotAsset.balanceOfBatch.call(Array(ids.length).fill(account1), ids);
      assert.ok(utils.equalArray(utils.subArray(balanceAfter,balanceBefore),amounts));

    });
    it("Buy a second Fail NFT", async function() {
      let ids = [4]; let amounts = [new BN(1)];
      await ingotToken.mint(account1, web3.utils.toWei("10000"), {from:owner});
      await ingotToken.approve(store.address, web3.utils.toWei("0.3"), {from:account1});
      
      let balanceBefore = await ingotAsset.balanceOfBatch.call(Array(ids.length).fill(account1), ids);
      await utils.expectThrow(store.buyBatchNft(ids, amounts, {from:account1}));
      let balanceAfter= await ingotAsset.balanceOfBatch.call(Array(ids.length).fill(account1), ids);
      assert.ok(utils.equalArray(balanceAfter, balanceBefore));
    });
  });
});
