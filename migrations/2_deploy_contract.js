const INGOTToken = artifacts.require("INGOTToken");
const INGOTAsset = artifacts.require("INGOTAsset");
const AssetPool = artifacts.require("AssetPool");
const Store = artifacts.require("Store");

module.exports = async function (deployer) {
  await deployer.deploy(INGOTToken);
  const ingotToken = await INGOTToken.deployed();
  console.log("INGOTToken deployed to: ", ingotToken.address);

  await deployer.deploy(INGOTAsset);
  const ingotAsset = await INGOTAsset.deployed();
  console.log("INGOTAsset deployed to: ", ingotAsset.address);
    
  await deployer.deploy(AssetPool, ingotToken.address, ingotAsset.address);
  const pool = await AssetPool.deployed();
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

  
  await store.setIsStoreOpen(true);
  await store.setIsPresale(true);
  console.log("set is Pre sale Store");
  console.log("set open Store");

};
