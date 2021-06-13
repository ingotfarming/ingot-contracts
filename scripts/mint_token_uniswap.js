

const IngotToken = artifacts.require("IngotToken");

module.exports = async function (callback) {
  const ingotToken = await IngotToken.deployed();
  const address = await ingotToken.owner();
  console.log("owner: "+ address);
  await ingotToken.mint(address, web3.utils.toWei("1050000"));
  console.log("Minted tokens");
  callback();
};
