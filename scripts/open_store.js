const Store = artifacts.require("Store");

module.exports = async function (callback) {
  const store = await Store.deployed();
  await store.setIsStoreOpen(true);
  console.log("set open Store");
  callback();
};
