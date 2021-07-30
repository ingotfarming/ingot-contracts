const IngotToken = artifacts.require("IngotToken");
const MasterChef = artifacts.require("MasterChef");
const cakePerBlock = '10'
const startBlock = 0;

module.exports = async function(deployer, network, accounts) {
  const ingotToken = await IngotToken.deployed();
  const cakePerBlockWei = web3.utils.toWei(cakePerBlock);

  await deployer.deploy(MasterChef, ingotToken.address, accounts[0], cakePerBlockWei, startBlock);
  const masterChef = await MasterChef.deployed();
  console.log("MasterChef deployed to: ", masterChef.address);

  await ingotToken.addMinter(masterChef.address);
  
  console.log("set MasterChef a minter of ingotToken");

};
