const PrivateSale = artifacts.require("PrivateSale");

module.exports = async function (callback) {
  const privateSale = await PrivateSale.deployed();
  await privateSale.setIsPrivateSale(false);
  console.log("close Private Sale");
  callback();

};
