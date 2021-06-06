

const IngotNFT = artifacts.require("IngotNFT");

module.exports = async function (callback) {
  const ingotAsset = await IngotNFT.deployed();
  await ingotAsset.burnAssetBatch([0,1,2,3,4,5,6,7,8,9,10,11],[0,0,0,0,0,0,0,0,0,0,0,0])
  console.log("Burned all NFT");
  callback();
};
