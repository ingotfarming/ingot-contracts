

const IngotFarm = artifacts.require("IngotFarm");

module.exports = async function (callback) {
  console.log("param: " + process.argv[4]);
  const pool = await IngotFarm.deployed();
  let weiAmount = web3.utils.toWei(process.argv[4]);
  await pool.updatePool();
  await pool.setRewardPerBlock(weiAmount);
  console.log("set reward: ", weiAmount);
  callback();
};
