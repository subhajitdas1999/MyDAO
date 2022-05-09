# DAO Contract Using OpenZeppeline Governance contract

**Table Of Contents**

[Overview](#overview)<br>
[Smart Contract](#smart-contracts)<br>
[Imp Transaction Hash](#imp-tx-hash)<br>
[Project Setup](#project-setup)<br>
[Hardhat Setup](#hardhat-setup)<br>





## **Overview**

This is a onchain governance contract .

- VotingToken.sol :- This ERC20 token uses the ERC20votes extension for voting . For voting(0 -> against ,1 -> For , 2 -> Abstain).

- TimeLock.sol :- TimeLock contract takes 3 arguments (minDelay :- Time delay between queue a proposal and execute a proposal, Proposers :- array of address of proposers, Executors :- array of addresses of executors). In this contract the proposer is only the governance contract , and anyone can execute a proposal.

- MyGovernor.sol :- This is the governance contract , admin of the box contract ,proposer . This is where user create a proposal , vote a proposal, queued a proposal and execute a proposal. And also user can check the state (look : IGovernor.sol) of a proposal with a proposalId (emitted during proposal creation). This contract takes 6 parameters during deployment (Voting Token contract , TimeLock contract, Voting Delay :- Duration in block number needed to start voting for a proposal after the proposal creation , Voting period :-
 Duration in block number for voting period , PROPOSER_THRESHOLD :- The number of votes required in order for a voter to become a proposer , QUORUM_PERCENTAGE :- Minimum number of cast voted required for a proposal to be successful).

- Box.sol :- This is a sample contract . for setting the value we are creating a proposal and after successful voting anyone can queue the proposal and after minDelay anyone can execute the proposal and the value in the box contract will be changed after a successful execution .

### Functions

```
function propose( address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description) public override(Governor, IGovernor) returns (uint256) {}
```
By calling this function a proposer can create a proposal . (in MyGovernor contract)

targets = [contract address whose function want to execute] ,in this case the box contract address.

values = [ether value] ,in this case 0

calldatas = [function calldata with value we want as argument]

description = A small description for the proposal.

This func will emit the proposal id , which will be needed later.

```
function delegate(address delegatee) public virtual override {}
```
Delegate the user address for voting a proposal . (In Voting Token contract)

```
function numCheckpoints(address account) public view virtual returns (uint32) {}
```

And get the checkpoints of a address after delegating an address by calling this function. (In Voting Token contract) .

```
function state(uint256 proposalId) public view virtual override returns (ProposalState) {}
```

Check the state of a proposal . for reference

enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }


```
function castVoteWithReason(uint256 proposalId,uint8 support,string calldata reason) public virtual override returns (uint256) {}
```
After the voting delay cast vote for a proposal with reason. (In Voting MyGovernor contract).

support = 0 -> Against, 1 -> For , 2 -> Abstain

```
function queue(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash) public virtual override returns (uint256) {}
```
After the voting period queue the proposal for execution . descriptionHash = Keccak256(bytes(str)). (In Voting MyGovernor contract).

```
function execute(address[] memory targets, uint256[] memory values, bytes[] memory calldatas,bytes32 descriptionHash) public payable virtual override returns (uint256) {}
```

After min delay of time lock contract an executor can execute a proposal .

***
## **Smart Contract**

All the contracts deployed at Rinkeby test network

1. Voting Token :- [0x9D06A7452690186f464Ef5f68A2161C0b382D3A5](https://rinkeby.etherscan.io/address/0x9D06A7452690186f464Ef5f68A2161C0b382D3A5#code)

2. TimeLock :- [0x343B6A72B45125e6470FEb6e955cC47393cb05BF](https://rinkeby.etherscan.io/address/0x343B6A72B45125e6470FEb6e955cC47393cb05BF#code)

3. MyGovernor :- [0x872273EF63b924D0664E9741bDCC5a1C24d18637](https://rinkeby.etherscan.io/address/0x872273EF63b924D0664E9741bDCC5a1C24d18637#code)

4. Box Contract :- [0x024cCB6C3d4f3DD90FE0E27c8aEeEF51c2941c0E]((https://rinkeby.etherscan.io/address/0x024cCB6C3d4f3DD90FE0E27c8aEeEF51c2941c0E#code))

***

## **Imp Transaction Hash**

1. Delegation of an user address :- [0xf350fd27447b99aaf19aec1028113cd9450f56a01b4c9e7764b701bdfccc803e](https://rinkeby.etherscan.io/tx/0xf350fd27447b99aaf19aec1028113cd9450f56a01b4c9e7764b701bdfccc803e)

2. Setting Proposer Role to governor contract :- [0xd10f031700ee62fcb5194469e8afe1e323316c05e29f639131121533123ac48f](https://rinkeby.etherscan.io/tx/0xd10f031700ee62fcb5194469e8afe1e323316c05e29f639131121533123ac48f)

3. setting Executor Role to anyone :- [0xfc9582a710f14dfe290117e8626fa9599c6f254bad8676d5234902df838893f8](https://rinkeby.etherscan.io/tx/0xfc9582a710f14dfe290117e8626fa9599c6f254bad8676d5234902df838893f8)

4. A Proposal :- [0x9af455358e207f9541ebfe99394708ae3d4c86b72addc78436ce46283f3644d3](https://rinkeby.etherscan.io/tx/0x9af455358e207f9541ebfe99394708ae3d4c86b72addc78436ce46283f3644d3)

5. Vote a proposal :- [0xe992dcd7e10691028b9a3e38dba61725c85970889ecde981ba803da2718eb8b3](https://rinkeby.etherscan.io/tx/0xe992dcd7e10691028b9a3e38dba61725c85970889ecde981ba803da2718eb8b3)

6. Queue a proposal :- [0x7fd0c491bb7f391dc5bfa26957c7b298a3a7ce9953d854291595ce755846956c](https://rinkeby.etherscan.io/tx/0x7fd0c491bb7f391dc5bfa26957c7b298a3a7ce9953d854291595ce755846956c)

7. Execution of a proposal :- [0xc248b9de0a0043c627d0671ef357c7fc7fcebbac1f5565797787138bbc005923](https://rinkeby.etherscan.io/tx/0xc248b9de0a0043c627d0671ef357c7fc7fcebbac1f5565797787138bbc005923)

***

## **Project Setup**

1. clone the repo .

```
git clone https://github.com/subhajitdas1999/MyDAO.git
```

2. Change the branch from master to Using_Openzeppeline

```
git switch Using_Openzeppeline
```

3. Install the dependencies

```
npm i
```

4. create an .env file . And fill the value as showed in the .env.example file 

***

## **Hardhat Setup**

1. clean the cache files
```
npx hardhat clean
```

2. Run the tests

```
npx hardhat test
```

3. Deploy to the Test network

```
npx hardhat run scripts/deploy.js --network rinkeby
```



