---
title: Solidity development with Remix and Metamask
date: 2018-02-20 18:28:11
tags: 
  - Onboarding
  - Solidity
categories:
  - Blockchain
---

This blog aims to familiarise you with the process of deploying & interacting smart contracts. In this post, we will be using remix as the IDE and metamask as the frontend UI to interact with the smart contract.

## Enter the Remix

Remix is an online IDE for Solidity with an intergrated debugger & testing environment. It allows developers to compile and deploy smart contracts on a local test environment or public blockchain via metamask. If you haven't, read the [previous post](/2018/02/20/gettings-started-on-blockchain-development/) first.

**[Access the latest version of remix](http://remix.ethereum.org/)**

#### Some things to note when using remix
* Ensure the environment is correct
  * Javascript VM option means the blockchain exist only on the remix environment
  * Injected web3 option will use metamask to connect to the ethereum network that metamask is currently on
  * Web3 Provider option allows you to connect to any ethereum node (ganache for example)
* The details button in Compile tab is useful to get smart contract's Bytecode or [ABI](https://solidity.readthedocs.io/en/develop/abi-spec.html) for use in 3rd party tools.
* When verifying contract source code on etherscan, make sure optimiser is selected

More details & tutorials are available on the official documentation [here](https://remix.readthedocs.io/en/latest/)

## Meet the Metamask
Metamask is a chrome extension that acts as a bridge that allows you to run Ethereum dApps right in your browser without running a full Ethereum node.

**[Install metamask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)**

#### Some things to note when using metamask
* Metamask uses [Mnemonic phrase](https://en.bitcoin.it/wiki/Mnemonic_phrase) as private keys. Meaning, the actual private key is derived from the seed words and you can restore your wallet using it. Keep them safe!
* Multiple addresses can be generated using wallet (or seed words). This is known as a [Deterministic wallet](https://en.bitcoin.it/wiki/Deterministic_wallet)

More info on metamask on their [official github page](https://github.com/MetaMask/faq/)