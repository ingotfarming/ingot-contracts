const Store = artifacts.require("Store");

module.exports = async function (callback) {
  const store = await Store.deployed();
  await store.setIsPresale(true);
  console.log("set is Pre sale Store");
  callback();

};
