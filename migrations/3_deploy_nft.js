const IngotNFT = artifacts.require("IngotNFT");


module.exports = async function (deployer) {
  await deployer.deploy(IngotNFT);
  const ingotAsset = await IngotNFT.deployed();
  console.log("IngotNFT deployed to: ", ingotAsset.address);
};
