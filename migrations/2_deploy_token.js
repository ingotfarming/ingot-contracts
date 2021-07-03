const IngotToken = artifacts.require("IngotToken");

module.exports = async function (deployer) {
  await deployer.deploy(IngotToken);
  const ingotToken = await IngotToken.deployed();
  console.log("IngotToken deployed to: ", ingotToken.address);
};
