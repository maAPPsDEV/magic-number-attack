const MagicNum = artifacts.require("MagicNum");

module.exports = function (_deployer) {
  // Use deployer to state migration tasks.
  _deployer.deploy(MagicNum);
};
