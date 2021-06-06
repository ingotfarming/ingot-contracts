const Store = artifacts.require("Store");

module.exports = async function (callback) {
  const store = await Store.deployed();
  await store.extractEther();
  console.log("ETH Extracted");
  callback();

};
