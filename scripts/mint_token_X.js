

const IngotToken = artifacts.require("IngotToken");

module.exports = async function (callback) {
  console.log("param: " + process.argv[4]);
  const ingotToken = await IngotToken.deployed();
  const address = await ingotToken.owner();
  console.log("owner: "+ address);
  let weiAmount = web3.utils.toWei(process.argv[4]);
  await ingotToken.mint(address, weiAmount);
  console.log("Minted tokens: "+ weiAmount);
  callback();
};
