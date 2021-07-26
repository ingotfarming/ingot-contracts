const IngotToken = artifacts.require("IngotToken");
const IngotNFT = artifacts.require("IngotNFT");
const IngotFarm = artifacts.require("IngotFarm");
const Store = artifacts.require("Store");

module.exports = async function (deployer) {
  const ingotToken = await IngotToken.deployed();
  console.log("IngotToken deployed to: ", ingotToken.address);

  const ingotAsset = await IngotNFT.deployed();
  console.log("IngotNFT deployed to: ", ingotAsset.address);
    
  await deployer.deploy(IngotFarm, ingotToken.address, ingotAsset.address);
  const pool = await IngotFarm.deployed();
  console.log("Pool deployed to: ", pool.address);

  
  await deployer.deploy(Store, ingotToken.address, ingotAsset.address);
  const store = await Store.deployed();
  console.log("Store deployed to: ", store.address);
  

  await ingotToken.addMinter(pool.address);
  await ingotToken.addMinter(store.address);
  await ingotAsset.addMinter(store.address);
  console.log("set Pool a minter of ingotToken");
  console.log("set Store a minter of ingotToken");
  console.log("set Store a minter of ingotAsset");

  
  // await store.setIsStoreOpen(true);
  // await store.setIsPresale(true);
  // console.log("set is Pre sale Store");
  // console.log("set open Store");

};
