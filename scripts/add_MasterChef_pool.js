const MasterChef = artifacts.require("MasterChef");
const IngotToken = artifacts.require("IngotToken");

const lpAddress = "0x27c21b436a8792b56f41704a0d0bf0164e9e14a7";

module.exports = async function (callback) {
  const masterChef = await MasterChef.deployed();

  await masterChef.add(1000,lpAddress ,false);
  const len = await masterChef.poolLength();
  console.log(len);
  console.log("created pool");
  callback();

};
