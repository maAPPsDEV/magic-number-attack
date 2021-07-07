# Solidity Game - Magic Number Attack

_Inspired by OpenZeppelin's [Ethernaut](https://ethernaut.openzeppelin.com), MagicNumber Level_

⚠️Do not try on mainnet!

## Task

To solve this game, you only need to provide the Ethernaut with a "Solver", a contract that responds to "whatIsTheMeaningOfLife()" with the right number.
Easy right? Well... there's a catch.
The solver's code needs to be really tiny. Really reaaaaaallly tiny. Like freakin' really really itty-bitty tiny: 10 opcodes at most.

_Hint:_

Perhaps its time to leave the comfort of the Solidity compiler momentarily, and build this one by hand 🤪. That's right: Raw EVM bytecode.

1. EVM bytecode
2. [Layout in Memory](https://docs.soliditylang.org/en/v0.8.6/internals/layout_in_memory.html)
3. [Ethereum Book](https://github.com/ethereumbook/ethereumbook/blob/develop/13evm.asciidoc)

Good luck! 🤭

## What will you learn?

1. Solidity Compiler
2. Contract Creation
3. [Deconstructing Contract](https://blog.openzeppelin.com/deconstructing-a-solidity-contract-part-i-introduction-832efd2d7737/)

### What happens during contract creation

Recall that during [contract initialization](https://github.com/maAPPsDEV/gatekeeper-attack-two), the following happens:

1. **First, a user or contract sends a transaction to the Ethereum network.** This transaction contains data, but no recipient address. This format indicates to the EVM that is a "contract creation", not a regular send/call transaction.
2. **Second, the EVM compiles the contract code in Solidity (a high level, human readable language) into bytecode (a low level, machine readable language).** This bytecode directly translates into opcodes, which are executed in a single call stack.

> _Important to note: `contract creation` bytecode contains both 1) `initialization code` and 2) the contract’s actual `runtime code`, concatenated in sequential order._

3. **During contract creation, the EVM only executes the `initialization code`** until it reaches the first STOP or RETURN instruction in the stack. During this stage, the contract’s constructor() function is run, and the contract has an address.
4. **After this initialization code is run, only the `runtime code` remains on the stack.** These opcodes are then copied into memory and returned to the EVM.
5. **Finally, the EVM stores this returned, surplus code in the state storage**, in association with the new contract address. This is the `runtime code` that will be executed by the stack in all future calls to the new contract.

**Put simply**

To solve this game, you need 2 sets of opcodes:

- `Initialization opcodes`: to be run immediately by the EVM to create your contract and store your future runtime opcodes, and
- `Runtime opcodes`: to contain the actual execution logic you want. This is the main part of your code that should **return 0x `0x42` and be under 10 opcodes.**

_At this point, to independently solve this game, you can read in depth about [opcodes](https://medium.com/@blockchain101/solidity-bytecode-and-opcode-basics-672e9b1a88c2) and [smart contract deconstruction](https://blog.zeppelin.solutions/deconstructing-a-solidity-contract-part-i-introduction-832efd2d7737)._

You can see Opcodes reference [here](https://ethervm.io/)

## Let's get it coded

### Runtime Opcodes — Part 1

First, let’s figure out the `runtime code` logic. The level constrains you to only 10 opcodes. Luckily, it doesn’t take more than that to return a simple `0x42`.

**Returning values** is handled by the `RETURN` opcode, which takes in two arguments:

- `p`: the position where your value is stored in memory, i.e. 0x0, 0x40, 0x50. Let’s arbitrarily pick the 0x80 slot.
- `s`: the size of your stored data. _Recall your value is 32 bytes long (or 0x20 in hex)._

But… this means before you can return a value, first you have to store it in memory.

1. First, store your `0x42` value in memory with `mstore(p, v)`, where `p` is position and `v` is the value in hexadecimal:

```
6042    // v: push1 0x42 (value is 0x42)
6080    // p: push1 0x80 (memory slot is 0x80)
52      // mstore
```

2. Then, you can `return` this the `0x42` value:

```
6020    // s: push1 0x20 (value is 32 bytes in size)
6080    // p: push1 0x80 (value was stored in slot 0x80)
f3      // return
```

This resulting opcode sequence should be `604260805260206080f3`. Your runtime opcode is exactly 10 opcodes and 10 bytes long.

### Initialization Opcodes — Part 2

Now let’s create the contract `initialization opcodes`. These opcodes need to replicate your `runtime opcodes` to memory, before returning them to the EVM. _Recall that the EVM will then automatically save the runtime sequence `604260805260206080f3` to the blockchain — you won’t have to handle this last part._

**Copying code** from one place to another is handled by the opcode `codecopy`, which takes in 3 arguments:

- `t`: the destination position of the code, in memory. _Let’s arbitrarily save the code to the 0x00 position._
- `f`: the current position of the `runtime opcodes`, in reference to the entire bytecode. Remember that `f` starts after `initialization opcodes` end. _What a chicken and egg problem! This value is currently unknown to you._
- `s`: size of the code, in bytes. _Recall that `604260805260206080f3` is 10 bytes long (or 0x0a in hex)._

3. First copy your `runtime opcodes` into memory. Add a placeholder for `f`, as it is currently unknown:

```
600a    // s: push1 0x0a (10 bytes)
60??    // f: push1 0x?? (current position of runtime opcodes)
6000    // t: push1 0x00 (destination memory index 0)
39      // CODECOPY
```

4. Then, `return` your in-memory `runtime opcodes` to the EVM:

```
600a    // s: push1 0x0a (runtime opcode length)
6000    // p: push1 0x00 (access memory index 0)
f3      // return to EVM
```

5. Notice that in total, your `initialization opcodes` take up 12 bytes, or `0x0c` spaces. This means your `runtime opcodes` will start at index `0x0c`, where `f` is now known to be `0x0c`:

```
600a    // s: push1 0x0a (10 bytes)
600c    // f: push1 0x?? (current position of runtime opcodes)
6000    // t: push1 0x00 (destination memory index 0)
39      // CODECOPY
```

6. The final sequence is thus:

```
0x600a600c600039600a6000f3604260805260206080f3
```

Where the first 12 bytes are `initialization opcodes` and the subsequent 10 bytes are your `runtime opcodes`. 7. In Truffle console, create your contract with the following commands:

```
> var account = "your address here";
> var bytecode = "0x600a600c600039600a6000f3604260805260206080f3";
> web3.eth.sendTransaction({ from: account, data: bytecode }, function(err,res){console.log(res)});
```

8. Look up the newly created **contract address** from the returned transaction hash. You can do this via Etherscan or via getTransactionReceipt(hash).
9. In the console, simply input the following to pass the game:

```
await contract.setSolver("contract address");
```

**UPDATE**: `initialization opcodes` can be optimized as 11 bytes, and this is in reality what solc actually compile.

```
PUSH1 0A DUP1 PUSH1 0B PUSH1 00 CODECOPY PUSH1 00 RETURN
600a80600b6000396000f3
```

## What is the most difficult challenge?

### What is the cryptic part at the end of a solidity contract bytecode? 🤔

If you compile an empty contract, you will notice that there are some strange/unaligned bytes append at the end of the runtime bytecodes.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.5 <0.9.0;

contract Hacker {}

```

Runtime Bytecodes:

```
PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x0 DUP1 REVERT INVALID LOG2 PUSH5 0x6970667358 0x22 SLT KECCAK256 PUSH30 0x828A0559B3E8FD79CC9E07CA40D03884B9D38AAA92A87B3A614E0D08E4FC SWAP2 PUSH5 0x736F6C6343 STOP ADDMOD MOD STOP CALLER
```

What are those `INVALID LOG2 PUSH5 0x6970667358 0x22 SLT KECCAK256 PUSH30 0x828A0559B3E8FD79CC9E07CA40D03884B9D38AAA92A87B3A614E0D08E4FC SWAP2 PUSH5 0x736F6C6343 STOP ADDMOD MOD STOP CALLER` exactly?

It's [contract metadata](https://docs.soliditylang.org/en/v0.8.6/metadata.html)

> The compiler appends by default the IPFS hash of the metadata file to the end of the bytecode of each contract, so that you can retrieve the file in an authenticated way without having to resort to a centralized data provider.

For more easy read to see openzeppelin's [this article](https://blog.openzeppelin.com/deconstructing-a-solidity-contract-part-vi-the-swarm-hash-70f069e22aef/)

In order to disable metadata hash, you need to provide an option to solidity compiler

```
solc --metadata-hash none --opcodes-runtime contracts/Empty.sol
```

_Even if you disabled metadata hash:_

### Well, still you see a few annoyed bytecodes more? 😤

```
a164736f6c6343000806000a
```

Remember what you've learnd above:
`a264` is the encode for ipfs hash. `a164` looks similar, so I tried to covert hex `736f6c6343000806000a` to ascii, as a result: `solcC` 😲, yes, here is the catch!!!

`>>>` **You will never find the answer in the formal documents.** `<<<`

But if you try to read [solc](https://github.com/ethereum/solidity) release notes...

Finally, see the answer at version [0.5.9](https://github.com/ethereum/solidity/releases/tag/v0.5.9)

> Assembler: Encode the compiler version in the deployed bytecode.

(_It was midnight already, when I've found that answer eventually._ 🥱)

## Source Code

⚠️This contract contains a bug or risk. Do not use on mainnet!

```solidity
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract MagicNum {
  address public solver;

  constructor() public {}

  function setSolver(address _solver) public {
    solver = _solver;
  }

  /*
    ____________/\\\_______/\\\\\\\\\_____        
     __________/\\\\\_____/\\\///////\\\___       
      ________/\\\/\\\____\///______\//\\\__      
       ______/\\\/\/\\\______________/\\\/___     
        ____/\\\/__\/\\\___________/\\\//_____    
         __/\\\\\\\\\\\\\\\\_____/\\\//________   
          _\///////////\\\//____/\\\/___________  
           ___________\/\\\_____/\\\\\\\\\\\\\\\_ 
            ___________\///_____\///////////////__
  */
}

```

## Configuration

### Install Truffle cli

_Skip if you have already installed._

```
npm install -g truffle
```

### Install Dependencies

```
yarn install
```

## Test and Attack!💥

### Run Tests

```
truffle develop
test
```

```
truffle(develop)> test
Using network 'develop'.


Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.



  Contract: Hacker
    using memory slot on scratch space - 0x00
      √ should deploy hacker contract with bytecodes (140ms)
      √ should answer magic number (81ms)
    using memory slot on free memory pointer - 0x40, and 12 bytes initialization opcodes
      √ should deploy hacker contract with bytecodes (119ms)
      √ should answer magic number (94ms)
    using memory slot on zero slot - 0x60
      √ should deploy hacker contract with bytecodes (158ms)
      √ should answer magic number (53ms)
    using memory slot on free memory area - 0x80
      √ should deploy hacker contract with bytecodes (140ms)
      √ should answer magic number (56ms)


  8 passing (952ms)

```
