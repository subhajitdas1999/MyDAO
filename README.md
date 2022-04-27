# MyDAO
This DAO contract , where anyone can become a Investor. Investor has the ability to create a proposal , and vote for it .Only admin of the DAO has the ability to execute a proposal after all the requirements met .

Admin or investor should have a certain amount of share tokens ,to vote for a proposal (see MyDAOHelper.sol) .Every proposal has voting 
time period, which is 1 week (604800 seconds) , in which every investor can vote with their respective share amount .Every proposal should have the quorum 40% for execution. An Investor can redeem his share percent and get back his investment.

PRICE OF SINGLE TOKEN = 10000000 wei

MINIMUM TOKENS NEED TO VOTE = 100

# Function Details

## contribute

```
function contribute() public payable {}
```
By calling this function with some ether user can become an investor of the DAO . user will get back some tokens in wallet address ,as an share amount .

IF user send ether directly to the DAO contract ,the internally this function gets called.

Note:- Always send ether amount greater the single token price, otherwise function call will be reverted.

## redeemShare

```
function redeemShare() external onlyAdminOrInvestor {}
```
Note:- Before calling this function caller need to approve all share(token) amount to this contract address

This function helps investors to redeem his shares and get back the invested amount .

Only admin and investor can call this function .After calling the function all the tokens of the investor transferred to the contract 

address from investor address (that's why caller need to approve tokens amount to this contract).

After successful execution of this function call, caller will get invested amount back.

## CreateProposal

```
function createProposal(string memory _description,address payable _recipient,uint256 _amount) external onlyAdminOrInvestor{}
```
By calling this function admin or investor can create a proposal .

_description = A small description about the proposal

_recipient = The address who will get the amount ,when the proposal will be executed

_amount = Requested amount for the proposal

## Vote

```
function vote(uint256 _proposalId) external onlyAdminOrInvestor {}
```
By calling this function with the proposal Id investor can vote for a proposal.

_proposalId = the proposal id user wants to vote.

A voter should have a certain amount of tokens (minimum tokens to vote) .Function Caller's shares amount is used, to increase the vote 

amount of the proposal .

## Execute The Proposal

```
function executeProposal(uint256 _proposalId) external onlyAdmin {}
```
Only Admin can call this function.

By calling this function admin can execute a proposal . A proposal execution will be reverted if the proposal is under voting period , 

proposal has voting less than quorum.

After successful execution proposal recipient will receive the amount that is proposed and the proposal will be marked as executed.

# Contract Address

ERC20 share token (0x96E82c9F7D3A77572Ac3D134bBDd618865251397)[https://rinkeby.etherscan.io/address/0x96E82c9F7D3A77572Ac3D134bBDd618865251397#code]

DAO contract address (0xd9a88D569bC48bB2f2a4a236B36e68cefd7EeE85)[https://rinkeby.etherscan.io/address/0xd9a88D569bC48bB2f2a4a236B36e68cefd7EeE85#code]


# Important Transaction Hashes

Contribute and become an Investor: (0x327a6f9483bbc4b8ecd1536815319508eeae906277c424a1283e4d2e66dbefcd)[https://rinkeby.etherscan.io/tx/0x327a6f9483bbc4b8ecd1536815319508eeae906277c424a1283e4d2e66dbefcd]

proposal creation (0x1c2a9f9bd373e0fde35d8d133bedecb6fa36c93ea471c9fd0e0311c98865941e)[https://rinkeby.etherscan.io/tx/0x1c2a9f9bd373e0fde35d8d133bedecb6fa36c93ea471c9fd0e0311c98865941e]

vote from an Investor (0xc8b9b0b10f4ecfb2b1dfc14c408496fc2a838250d9447563d30ed002e315dd81)[https://rinkeby.etherscan.io/tx/0xc8b9b0b10f4ecfb2b1dfc14c408496fc2a838250d9447563d30ed002e315dd81]

Redeem share of an Investor 

1. Approve the share tokens to DAO contract (0xf722e0510d84453a921a656519837bbceb2cef33f409cce769966baa2a45186c)[https://rinkeby.etherscan.io/tx/0xf722e0510d84453a921a656519837bbceb2cef33f409cce769966baa2a45186c]

2. Redeem (0xf43cf952676fa80acd7834f1e085881f3a494809d5dc880867c35a551ea953b7)[https://rinkeby.etherscan.io/tx/0xf43cf952676fa80acd7834f1e085881f3a494809d5dc880867c35a551ea953b7]


# Run Tests

To run the tests .From root directory run

```
npx hardhat test
```