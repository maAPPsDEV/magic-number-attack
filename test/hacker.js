const Hacker = artifacts.require("Hacker");
const { expect } = require("chai");
const { BN } = require("@openzeppelin/test-helpers");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Hacker", function ([_owner, _hacker]) {
  let deployedAddress;

  context("using memory slot on scratch space - 0x00", function () {
    const slot = "00";

    it("should deploy hacker contract with bytecodes", async function () {
      // deploy Hacker contract
      const result = await web3.eth.sendTransaction({
        from: _hacker,
        data:
          "0x600a80600b6000396000f3" + // initialization opcodes
          `602a60${slot}52602060${slot}f3`, // runtime opcodes
      });
      const address = result.contractAddress;
      expect(address).not.to.be.null;
      deployedAddress = address;
    });

    it("should answer magic number", async function () {
      const magicNum = await web3.eth.call({
        to: deployedAddress,
        data: web3.eth.abi.encodeFunctionCall(
          {
            name: "whatIsTheMeaningOfLife",
            type: "function",
            inputs: [],
          },
          [],
        ),
      });
      expect(web3.eth.abi.decodeParameter("uint256", magicNum)).to.be.equal("42");
    });
  });

  context("using memory slot on free memory pointer - 0x40, and 12 bytes initialization opcodes", function () {
    const slot = "40";

    it("should deploy hacker contract with bytecodes", async function () {
      // deploy Hacker contract
      const result = await web3.eth.sendTransaction({
        from: _hacker,
        data:
          "0x600a600c600039600a6000f3" + // initialization opcodes
          `602a60${slot}52602060${slot}f3`, // runtime opcodes
      });
      const address = result.contractAddress;
      expect(address).not.to.be.null;
      deployedAddress = address;
    });

    it("should answer magic number", async function () {
      const magicNum = await web3.eth.call({
        to: deployedAddress,
        data: web3.eth.abi.encodeFunctionCall(
          {
            name: "whatIsTheMeaningOfLife",
            type: "function",
            inputs: [],
          },
          [],
        ),
      });
      expect(web3.eth.abi.decodeParameter("uint256", magicNum)).to.be.equal("42");
    });
  });

  context("using memory slot on zero slot - 0x60", function () {
    const slot = "60";

    it("should deploy hacker contract with bytecodes", async function () {
      // deploy Hacker contract
      const result = await web3.eth.sendTransaction({
        from: _hacker,
        data:
          "0x600a80600b6000396000f3" + // initialization opcodes
          `602a60${slot}52602060${slot}f3`, // runtime opcodes
      });
      const address = result.contractAddress;
      expect(address).not.to.be.null;
      deployedAddress = address;
    });

    it("should answer magic number", async function () {
      const magicNum = await web3.eth.call({
        to: deployedAddress,
        data: web3.eth.abi.encodeFunctionCall(
          {
            name: "whatIsTheMeaningOfLife",
            type: "function",
            inputs: [],
          },
          [],
        ),
      });
      expect(web3.eth.abi.decodeParameter("uint256", magicNum)).to.be.equal("42");
    });
  });

  context("using memory slot on free memory area - 0x80", function () {
    const slot = "80";

    it("should deploy hacker contract with bytecodes", async function () {
      // deploy Hacker contract
      const result = await web3.eth.sendTransaction({
        from: _hacker,
        data:
          "0x600a80600b6000396000f3" + // initialization opcodes
          `602a60${slot}52602060${slot}f3`, // runtime opcodes
      });
      const address = result.contractAddress;
      expect(address).not.to.be.null;
      deployedAddress = address;
    });

    it("should answer magic number", async function () {
      const magicNum = await web3.eth.call({
        to: deployedAddress,
        data: web3.eth.abi.encodeFunctionCall(
          {
            name: "whatIsTheMeaningOfLife",
            type: "function",
            inputs: [],
          },
          [],
        ),
      });
      expect(web3.eth.abi.decodeParameter("uint256", magicNum)).to.be.equal("42");
    });
  });
});
