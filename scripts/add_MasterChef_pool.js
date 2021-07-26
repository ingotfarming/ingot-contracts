const MasterChef = artifacts.require("MasterChef");
const IngotToken = artifacts.require("IngotToken");

module.exports = async function (callback) {
  const ingotToken = await IngotToken.deployed();
  const masterChef = await MasterChef.deployed();

  await masterChef.add(1000,ingotToken.address ,false);
  const len = await masterChef.poolLength();
  console.log(len);
  console.log("created pool");
  callback();

};
