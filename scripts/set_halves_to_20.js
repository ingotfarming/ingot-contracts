

const IngotFarm = artifacts.require("IngotFarm");

module.exports = async function (callback) {
  const pool = await IngotFarm.deployed();
  let weiAmount = web3.utils.toWei("20");
  await pool.setRewardPerBlock(weiAmount);
  console.log("set reward: ", weiAmount);
  callback();
};
