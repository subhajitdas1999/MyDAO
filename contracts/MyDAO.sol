// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MyDAOHelper.sol";
import "hardhat/console.sol";

contract MyDAO is MyDAOHelper {
    //proposal struct
    struct Proposal {
        string description;
        address payable recipient;
        uint256 id;
        uint256 amount;
        uint256 votes;
        uint256 endTime;
        bool executed;
    }

    //admin address
    address public admin;
    //ERC20 token address
    address public token;
    //total amount of contribution
    uint256 public totalContribution;
    //total shares
    uint256 public totalShares;
    //voting period
    uint256 public votingPeriod;
    // percentage needed to execute a proposal
    uint256 public Quorum;
    // proposal id
    uint256 public proposalId;

    //map all the investors
    // mapping(address => bool) public investors;
    //map shares amount of the investors
    mapping(address => uint256) public shares;
    //map proposal id with the proposal struct
    mapping(uint256 => Proposal) public proposals;
    //map all the investor vote w.r.t a proposal .Ex, votes[INVESTOR_ADDRESS][PROPOSAL_ID]
    mapping(address => mapping(uint256 => bool)) public votes;

    modifier onlyAdminOrInvestor() {
        require(
            msg.sender == admin || shares[msg.sender] > 0,
            "Admin or Investor needed"
        );
        _;
    }
    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    constructor(address _token) {
        admin = msg.sender;
        token = _token;
        votingPeriod = 604800; // 1 week is voting time,after a proposal is created
        Quorum = 40; //40% votes of all shares required to execute a proposal
    }

    //contribute
    receive() external payable {
        contribute();
    }

    // send ether and become an investor
    function contribute() public payable {
        require(msg.value >= priceOfToken, "send more ether");
        uint256 weiAmount = msg.value;
        uint256 tokenAmount = calTokenAmount(weiAmount);

        //add the investor and details to the collection
        // investors[msg.sender] = true;
        shares[msg.sender] += tokenAmount;
        totalShares += tokenAmount;
        totalContribution += weiAmount;

        //send the tokens to investor
        IERC20(token).transfer(msg.sender, tokenAmount);
        emit Contributor(msg.sender, weiAmount, tokenAmount);
    }

    //redeem shares
    //need to approve token amount before calling this function
    function redeemShare() external onlyAdminOrInvestor {
        uint256 tokenAmount = shares[msg.sender];

        //transfer the tokens from investor to this contract
        IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);

        //calculate the redeem ether amount
        uint256 weiAmount = redeemAmount(tokenAmount);
        require(
            totalContribution >= weiAmount,
            "Not enough funds, try after some time"
        );

        //remove investor details
        shares[msg.sender] = 0;
        // investors[msg.sender] = false;
        totalContribution -= weiAmount;
        totalShares -= tokenAmount;

        //send the ether back to the investor
        payable(msg.sender).transfer(weiAmount);

        emit RedeemShare(msg.sender, tokenAmount, weiAmount);
    }

    //to create proposal
    function createProposal(
        string memory _description,
        address payable _recipient,
        uint256 _amount
    ) external onlyAdminOrInvestor {
        require(bytes(_description).length != 0, "Need a proposal description");
        require(_amount <= totalContribution, "Amount is too big");
        require(
            _recipient != address(0),
            "Cannot proceed with 0 recipient address"
        );
        //update the ID
        proposalId++;
        Proposal memory proposal = Proposal(
            _description,
            _recipient,
            proposalId,
            _amount, //requested amount
            0, //initial votes
            votingPeriod + block.timestamp, //voting time
            false //execution
        );

        //adding it to the collection
        proposals[proposalId] = proposal;
        //emit the event
        emit ProposalCreated(proposal.id, proposal.recipient, proposal.amount);
    }

    //voting a proposal
    function vote(uint256 _proposalId) external onlyAdminOrInvestor {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(block.timestamp <= proposal.endTime, "voting time exceeded");
        require(
            !votes[msg.sender][proposal.id],
            "You cannot vote to same proposal twice"
        );
        require(canVote(token, msg.sender), "No voting power yet");
        //save the vote
        votes[msg.sender][proposal.id] = true;
        //update votes to the proposal
        proposal.votes += shares[msg.sender];

        emit Voted(proposal.id, shares[msg.sender]);
    }

    //execute the proposal
    function executeProposal(uint256 _proposalId) external onlyAdmin {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(
            block.timestamp > proposal.endTime,
            "Cannot execute it ,under voting period"
        );
        require(
            (proposal.votes / totalShares) * 100 >= Quorum,
            "Not enough votes ,cannot proceed further"
        );
        require(
            totalContribution >= proposal.amount,
            "Not enough funds,try after some time"
        );

        //update the proposal execution
        proposal.executed = true;
        totalContribution -= proposal.amount;
        //send the ether to proposal recipient
        (proposal.recipient).transfer(proposal.amount);

        emit ProposalExecuted(
            totalContribution,
            proposal.recipient,
            proposal.amount
        );
    }

    /* All Events */
    event Contributor(address investor, uint256 weiAmount, uint256 tokenAmount);
    event RedeemShare(address investor, uint256 tokenAmount, uint256 weiAmount);
    event ProposalCreated(
        uint256 proposalId,
        address recipient,
        uint256 amount
    );
    event Voted(uint256 proposalId, uint256 withShare);
    event ProposalExecuted(
        uint256 totalContributionLeft,
        address recipient,
        uint256 amount
    );
}
