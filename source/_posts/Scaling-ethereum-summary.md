---
title: Scaling Ethereum - A short summary
date: 2018-02-22 18:28:11
tags: 
  - Summary
  - Ethereum
categories:
  - Blockchain
---
 
This post will provide you with a short introduction of the future of ethereum with regards to it's scalability.

## The problem statement

* Transaction throughput is constantly hitting limit at ~ 15 transaction / second
* Gas usage and price are increasing at at time skyrocketing especially during ICOs or hyped games like cryptokittens
* Gas limits are a limiting factor on what kind of transaction can be mined. Large computation are expensive if not impossible to be included on ethereum blockchain
* Latency and confirmation times are a limiting factor for some use-cases. Imagine waiting 3min everytime you buy a cup of coffee.
* PoW is highly inefficient in terms of computer hardware & electricity costs. Only a very small percentage of total network computational power are needed to process all transaction

## Metropolis & Sharding

### Metropolis

Metropolis is a planned development phase for ethereum. It will include proof-of-stake which is a pre-requisite for many important scaling solutions like sharding. The proof of stake implementation of ethereum is called Casper. It consist of two hard forks, Byzantium (Implemented) & Constantinople.

**Constantinople is rumored to include Casper and is expected to be released in 2018 to complete the Metropolis phase.**

[More info on Metropolis](https://blockgeeks.com/guides/ethereum-metropolis/)

### Sharding

It works by basically splitting the chain into smaller pieces, allowing more transaction to be processed by different shards at the same time while still maintaining the security and transparency nature of the blockchain
More transactions can be validated at once in parallel, and shard nodes only need to store certain segments of the blockchain
Sharing in PoW is technically possible but carry a high risk of smaller pool overtaken due to lower hashrate hence, it will only be implemented after proof of stake aka Casper

#### Validator Manager Contract
Validator Manager Contract is an special contract that helps join sharding network into mainchain
It is a proof of stake system where ether is deposited into this contract as collateral & validators’ stake may be slashed if they misbehaved.
It uses pseudorandomness sampling. One shard chain validator would be sampled from validators pool list, and become the collator of the specific shards in specific “period” to make it impossible for any bad actor from predicting which validator will create blocks
It has collation header validation which the VMC provides on-chain verification immediately
By utilizing UTXO model, the user can deposit ether on a specific shard via transaction call and create a receipt (with a receipt ID) on main chain. The shard chain user can create a receipt-consuming transaction with the given receipt ID to spend this receipt to achieve cross-shard communication.
It is also a on-chain governance system where VMC acts as the parliament to enable validators to vote on-chain.

[More info on Sharding]( https://github.com/ethereum/wiki/wiki/Sharding-FAQ)

## Plasma
Framework of incentivized and enforced execution of smart contracts which is scalable to a significant amount of state updates per second 
A set of smart contracts that allows for private chains or transaction with periodic synchronisation with the main chain
Each “private blockchain” can be purpose fitted depending on use case. dex, social networks, microtransaction
Allows for unlimited scalability with enforceable state transition via proof of fraud
Nested blockchains
Block rollback upon proof of fraud

[Plasma whitepaper](plasma.io/plasma.pdf)
[OmiseGO - First plasma project construction post](https://blog.omisego.network/construction-of-a-plasma-chain-0x1-614f6ebd1612)
[First plasma POC demo by Bankex](https://github.com/BANKEX/PlasmaETHexchange)

## State channels & Raiden

It is for blockchain interactions which could occur on the blockchain but are done off chain

How it works : 
* State is locked (could be eth) with multisig/smart contract
* Only a specific set of participants must completely agree with each other to update it.
* Signing and transaction happens as usual but off chain. Each new update “overrides” previous updates.
* Prevent malicious actor eg submitting earlier state before Alice sent money to Bob so Alice can “pretend” didn't pay
* Submit the state back to the blockchain, which closes the state channel and unlocks the state again

Note that the maximum amount of ether that can be transacted is the total amount locked when opening the channel

### Raiden

It is similar to [bitcoin’s Lightning](http://lightning.network/docs/) where it is a off-chain scaling solution, enabling near-instant, low-fee and scalable payments
Raiden allow for multi-hops to find payment channel instead of creation n-to-n channels

Think of it as transacting cheques as "real money" and Ethereum as the bank to deposit & withdraw. There is also no need to write direct recipient and fees apply only when cheque is “cashed in”.

µRaiden is a subset of Raiden technology for simpler applications which will be cheaper & easier to use. It supports many-to-one payment setups, like users interacting with a Dapp. It does not support multihop transfer fees, and therefore only allows to send tokens unidirectionally to predetermined receivers.

[More on raiden](https://raiden.network/faq.html)

## Truebit
Bridging computation on-offchain by doing offchain computation and provides onchain dispute handling
Unanimous consensus protocol meaning even if 1 participant dispute on the result, the verification layer kicks in :

* Onchain code checks the disputed line of code onchain (it defeats the purpose to compute the entire problem on the blockchain) and punishes the error
* Validator takes the reward for resolving errors if error is found
* Participant's stake is slashed if dispute proved to be false

There is also a forced Error Mechanism to keep validators from leaving the network when all solution are accurate without errors. It works by having system generated error every x block as incentive to keep validators validating every solution submitted to the network

[Truebit Whitepaper](https://people.cs.uchicago.edu/~teutsch/papers/truebit.pdf)

## Final words
Each technology tackles scalability in its own way and are complementary - a good sign for the future of ethereum
Coming months or years we will see upcoming large scale projects. There are a lots of protocol level projects being developed like loom network, distributed data storage projects and other scalability projects

Excellent read: [Making Sense of Ethereum’s Layer 2 Scaling Solutions: State Channels, Plasma, and Truebit](https://medium.com/l4-media/making-sense-of-ethereums-layer-2-scaling-solutions-state-channels-plasma-and-truebit-22cb40dcc2f4)