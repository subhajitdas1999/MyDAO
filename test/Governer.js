const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = waffle.provider;

const {
  MIN_DELAY,
  moveTime,
  VOTING_DELAY,
  VOTING_PERIOD,
  PROPOSER_THRESHOLD,
  QUORUM_PERCENTAGE,
  moveBlocks,
} = require("../utils/VarAndFunctions");

const description = "";

describe("Governor contract & Box contract", () => {
  let deployer;
  let addr1;
  let addr2;
  let addrs;
  let VotingToken;
  let TimeLock;
  let MyGovernor;
  let Box;
  let votingToken;
  let timeLock;
  let governor;
  let box;

  beforeEach(async () => {
    [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();

    //get all Contracts
    VotingToken = await ethers.getContractFactory("VotingToken");
    TimeLock = await ethers.getContractFactory("TimeLock");
    MyGovernor = await ethers.getContractFactory("MyGovernor");
    Box = await ethers.getContractFactory("Box");

    votingToken = await VotingToken.deploy();
    timeLock = await TimeLock.deploy(MIN_DELAY, [], []); //minDelay, proposers,executors
    governor = await MyGovernor.deploy(
      votingToken.address,
      timeLock.address,
      VOTING_DELAY,
      VOTING_PERIOD,
      PROPOSER_THRESHOLD,
      QUORUM_PERCENTAGE
    ); //token address, timeLock address

    //delegate deployer address
    await votingToken.delegate(deployer.address);
    // await votingToken.delegate(addr1.address);

    //set up all roles
    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executerRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

    //grant the proposer role to the governor contract . only governor contract can propose proposal
    const proposerTx = await timeLock.grantRole(proposerRole, governor.address);

    //grant executor role to all , anyone can execute a proposal
    const executorTx = await timeLock.grantRole(
      executerRole,
      "0x0000000000000000000000000000000000000000"
    );

    //revoke admin role of deployer.
    const revokeTx = await timeLock.revokeRole(adminRole, deployer.address);

    //deploy box contract
    box = await Box.deploy();

    //transfer ownership of box contract to timeLock
    await box.transferOwnership(timeLock.address);
  });

  it("Should propose , vote , queue , execute", async () => {
    const encodeFunctionCall = box.interface.encodeFunctionData("store", [30]);

    const proposeTx = await governor.propose(
      [box.address],
      [0],
      [encodeFunctionCall],
      description
    );
    const proposeReceipt = await proposeTx.wait();
    const proposalId = proposeReceipt.events[0].args.proposalId;
    let proposalState = await governor.state(proposalId);

    //need to move the blocks
    await moveBlocks(VOTING_DELAY);
    // vote 0 -> against, 1-> For, 2 -> abstain
    let voteTx = await governor.castVoteWithReason(proposalId, "1", "you");

    proposalState = await governor.state(proposalId);

    //need to move the blocks
    await moveBlocks(VOTING_PERIOD);
    proposalState = await governor.state(proposalId);

    const descriptionHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(description)
    );
    proposalState = await governor.state(proposalId);

    //queue the proposal
    const queueTx = await governor.queue(
      [box.address],
      [0],
      [encodeFunctionCall],
      descriptionHash
    );

    // //need to move Time
    await moveTime(MIN_DELAY);

    const executeTx = await governor.execute(
      [box.address],
      [0],
      [encodeFunctionCall],
      descriptionHash
    );

    console.log(await box.retrieve());
  });
});
