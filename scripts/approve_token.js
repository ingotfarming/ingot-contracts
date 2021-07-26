

const IngotToken = artifacts.require("IngotToken");

module.exports = async function (callback) {
  console.log("param: " + process.argv[4]);
  const ingotToken = await IngotToken.deployed();
  const address = "0x77A7A555d2f2d3DebB29E9315384ea48Ce1756BD"
  console.log("owner: "+ address);
  let weiAmount = web3.utils.toWei(process.argv[4]);
  await ingotToken.approve(address, weiAmount);
  console.log("Approve: "+ weiAmount);
  callback();
};
