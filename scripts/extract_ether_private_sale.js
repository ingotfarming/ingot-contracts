const PrivateSale = artifacts.require("PrivateSale");

module.exports = async function (callback) {
  const privateSale = await PrivateSale.deployed();
  await privateSale.extractEther();
  console.log("privateSale extract Ether");
  callback();

};
