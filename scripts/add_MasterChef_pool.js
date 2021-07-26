const MasterChef = artifacts.require("MasterChef");
const IngotToken = artifacts.require("IngotToken");

const lpAddress = "0xbDF80f7ea30b4aebc53Eef3eB763AC46f2836f99";

module.exports = async function (callback) {
  const masterChef = await MasterChef.deployed();

  await masterChef.add(1000,lpAddress ,false);
  const len = await masterChef.poolLength();
  console.log(len);
  console.log("created pool");
  callback();

};
