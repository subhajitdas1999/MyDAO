
const {
    MIN_DELAY,
    moveTime,
    VOTING_DELAY,
    VOTING_PERIOD,
    PROPOSER_THRESHOLD,
    QUORUM_PERCENTAGE,
    moveBlocks,
  } = require("../utils/VarAndFunctions");


async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    //get all Contracts
    const VotingToken = await ethers.getContractFactory("VotingToken");
    const TimeLock = await ethers.getContractFactory("TimeLock");
    const MyGovernor = await ethers.getContractFactory("MyGovernor");
    const Box = await ethers.getContractFactory("Box");

    console.log("Deploying Voting Token contract,TimeLock Contract and governor contract ...................");
    const votingToken = await VotingToken.deploy();
    const timeLock = await TimeLock.deploy(MIN_DELAY, [], []); //minDelay, proposers,executors
    const governor = await MyGovernor.deploy(
      votingToken.address,
      timeLock.address,
      VOTING_DELAY,
      VOTING_PERIOD,
      PROPOSER_THRESHOLD,
      QUORUM_PERCENTAGE
    ); //token address, timeLock address

    console.log("Delegating Deployer address..............");
    //delegate deployer address
    const delegationTx = await votingToken.delegate(deployer.address);
    

    //set up all roles
    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executerRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

    console.log("Setting up all Roles..........");
    //grant the proposer role to the governor contract . only governor contract can propose proposal
    const proposerTx = await timeLock.grantRole(proposerRole, governor.address);

    //grant executor role to all , anyone can execute a proposal
    const executorTx = await timeLock.grantRole(
      executerRole,
      "0x0000000000000000000000000000000000000000"
    );

    console.log("Revoking Deployer Role as admin..............");
    //revoke admin role of deployer.
    const revokeTx = await timeLock.revokeRole(adminRole, deployer.address);

    console.log("Deploying box contract..........");
    //deploy box contract
    const box = await Box.deploy();
    
    console.log("Transferring box contract ownership to timelock contract ....");
    //transfer ownership of box contract to timeLock
    await box.transferOwnership(timeLock.address);

    console.log("Voting Token address : ", votingToken.address);
    console.log("TimeLock address : ", timeLock.address);
    console.log("Governor address : ", governor.address);
    console.log("Box address : ", box.address);

    console.log("-------------------------------------------------------");

    console.log("delegation Tx hash : ",delegationTx.hash);
    console.log("setting governor the proposer Tx : ",proposerTx.hash);
    console.log("setting anyone executor Tx hash : ",executorTx.hash);



  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });