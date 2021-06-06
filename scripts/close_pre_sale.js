const Store = artifacts.require("Store");

module.exports = async function (callback) {
  const store = await Store.deployed();
  await store.setIsPresale(false);
  console.log("close Pre sale Store");
  callback();

};
