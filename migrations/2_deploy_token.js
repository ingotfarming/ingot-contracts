const IngotToken = artifacts.require("IngotToken");
const PrivateSale = artifacts.require("PrivateSale");


module.exports = async function (deployer) {
  await deployer.deploy(IngotToken);
  const ingotToken = await IngotToken.deployed();
  console.log("IngotToken deployed to: ", ingotToken.address);

  await deployer.deploy(PrivateSale, ingotToken.address);
  const privateSale = await PrivateSale.deployed();
  console.log("PrivateSale deployed to: ", privateSale.address);

  await ingotToken.addMinter(privateSale.address);
  console.log("set privateSale a minter of ingotToken");
};
