const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle } = require("hardhat");

const provider = waffle.provider;

describe("MyDAO contract", () => {
  let deployer;
  let addr1;
  let addr2;
  let addrs;
  let MyDAO;
  let Token;
  let myDAO;
  let token;

  const ContributeAndCreateProposalFromAdmin = async()=>{
    const depositAmount = ethers.utils.parseEther("0.000000001");
    //become an investor    
    await myDAO.contribute({ value: depositAmount });

    //create a proposal
    await 
      myDAO.createProposal(
        "TEST PROPOSAL FROM AN ADMIN",
        addr2.address,
        "100000"
      )
  }
  beforeEach(async () => {
    [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();
    MyDAO = await ethers.getContractFactory("MyDAO");
    Token = await ethers.getContractFactory("MyERC20Token");
    token = await Token.deploy();
    myDAO = await MyDAO.deploy(token.address);

    //send initial tokens to myDAO
    const totalSupply = await token.totalSupply();
    await token.transfer(myDAO.address, totalSupply);
  });
  it("Should become an investor ,by sending ether to DAO contract", async () => {
    //send ether from addr1 account to become an investor
    const tx = await myDAO
      .connect(addr1)
      .contribute({ value: ethers.utils.parseEther("0.000000001") });
    const allEvents = (await tx.wait()).events;
    const contributorEvent = await allEvents.find(
      (el) => el.event === "Contributor"
    );
    const [investor, weiAmount, tokenAmount] = contributorEvent.args;

    expect(await token.balanceOf(addr1.address)).be.equal(tokenAmount);
  });

  it("Cannot become investor with less than 1 token Amount", async () => {
    await expect(
      myDAO.connect(addr1).contribute({ value: "100" })
    ).to.be.revertedWith("send more ether");
  });

  it("Should able to redeem shares and get ether back", async () => {
    const depositAmount = ethers.utils.parseEther("0.000000001");
    //become an investor
    await myDAO.contribute({ value: depositAmount });

    //ether balance of investor and contract before redeem
    const investorBalanceBefore = await provider.getBalance(deployer.address);
    const contractBalanceBefore = await provider.getBalance(myDAO.address);

    //share balance
    const tokenBalance = await token.balanceOf(deployer.address);

    //need to approve tokens to myDAO contract
    await token.approve(myDAO.address, tokenBalance);

    await expect(myDAO.redeemShare()).to.emit(myDAO, "RedeemShare");

    //ether balance of investor and contract After redeem
    const investorBalanceAfter = await provider.getBalance(deployer.address);
    const contractBalanceAfter = await provider.getBalance(myDAO.address);

    //calculate gas fees
    const gasFees = BigNumber.from(investorBalanceBefore)
      .add(BigNumber.from(depositAmount))
      .sub(BigNumber.from(investorBalanceAfter));

    //diff in investor balance
    const diffInvestorBalance = BigNumber.from(investorBalanceAfter)
      .sub(BigNumber.from(investorBalanceBefore))
      .add(gasFees);

    //diff in contract balance
    const diffContractBalance = BigNumber.from(contractBalanceBefore).sub(
      BigNumber.from(contractBalanceAfter)
    );

    //this two diff should be same
    expect(diffContractBalance).be.equal(diffInvestorBalance);
  });

  it("should revert proposal if requested amount is bigger than total contribution", async () => {
    //at this point total contribution is 0
    //now try to create proposal admin account
    await expect(
      myDAO.createProposal(
        "TEST PROPOSAL FROM AN ADMIN",
        addr2.address,
        "100000"
      )
    ).to.be.revertedWith("Amount is too big");
  });

  it("Admin or Investor should able to add proposal", async () => {
    const depositAmount = ethers.utils.parseEther("0.000000001");
    //become an investor
    await myDAO.connect(addr1).contribute({ value: depositAmount });

    //now try to create proposal from add1 (investor) account
    await expect(
      myDAO
        .connect(addr1)
        .createProposal(
          "TEST PROPOSAL FROM AN INVESTOR",
          addr2.address,
          "100000"
        )
    ).to.emit(myDAO, "ProposalCreated");

    //now try to create proposal admin account
    await expect(
      myDAO.createProposal(
        "TEST PROPOSAL FROM AN ADMIN",
        addr2.address,
        "100000"
      )
    ).to.emit(myDAO, "ProposalCreated");
  });

  it("Should not able to vote with less than 100 shares",async()=>{
    //contribute some amount
    const depositAmount = ethers.utils.parseEther("0.0000000001");
    await myDAO.contribute({ value: depositAmount });

    //now deployer has 10 shares

    //create a proposal
    await myDAO.createProposal("TEST PROPOSAL FROM AN ADMIN",addr2.address,"100000")   ;

    //try to vote with 10 shares . first proposal ,ID is 1
    await expect(myDAO.vote(1)).to.be.revertedWith("No voting power yet");
  })

  it("Investor should able to vote a proposal",async()=>{
    const depositAmount = ethers.utils.parseEther("0.000000001");
    //become an investor    
    await myDAO.connect(addr1).contribute({ value: depositAmount });
    await myDAO.contribute({ value: depositAmount });

    //create a proposal
    await 
      myDAO.createProposal(
        "TEST PROPOSAL FROM AN ADMIN",
        addr2.address,
        "100000"
      )
    

    //vote from admin , first proposal that's why ID is 1
    await expect(myDAO.vote(1)).to.emit(myDAO,"Voted");
    //vote from an Investor (addr1)
    await expect(myDAO.connect(addr1).vote(1)).to.emit(myDAO,"Voted");
  })

  it("should not able to vote after voting period",async()=>{
    // contribute and create a proposal fro deployer(admin) account
    await ContributeAndCreateProposalFromAdmin();

    const votingPeriod = await myDAO.votingPeriod();
    
    //voting period + 20 second
    const exceedVotingPeriod = BigNumber.from(votingPeriod).add(
      BigNumber.from(20));

    //increase the block timestamp. 
    await provider.send("evm_increaseTime", [exceedVotingPeriod.toNumber()]);
    await provider.send("evm_mine");

    //vote from admin , first proposal that's why ID is 1
    await expect(myDAO.vote(1)).to.be.revertedWith("voting time exceeded");
  })

  it("Should not able to vote twice for a Proposal",async()=>{
    // contribute and create a proposal fro deployer(admin) account
    await ContributeAndCreateProposalFromAdmin();

    //try to vote for the first time (id 1 , first proposal)
    await myDAO.vote(1)

    //try to vote again to the same proposal
    await expect(myDAO.vote(1)).to.be.revertedWith("You cannot vote to same proposal twice");

  })


  it("Should not able to execute a proposal which is under voting period",async()=>{
    //contribute and create a proposal fro deployer(admin) account
    await ContributeAndCreateProposalFromAdmin();

    //vote  (id 1 , first proposal)
    await myDAO.vote(1)

    //try to execute first proposal
    await expect(myDAO.executeProposal(1)).to.be.revertedWith("Cannot execute it ,under voting period");

  })

  it("Should not execute a proposal if it has vote less than quorum",async()=>{
    //contribute and create a proposal fro deployer(admin) account
    await ContributeAndCreateProposalFromAdmin();

    //cross the voting period

    const votingPeriod = await myDAO.votingPeriod();
    
    //voting period + 20 second
    const exceedVotingPeriod = BigNumber.from(votingPeriod).add(
      BigNumber.from(20));

    //increase the block timestamp. 
    await provider.send("evm_increaseTime", [exceedVotingPeriod.toNumber()]);
    await provider.send("evm_mine");

    //try to execute the proposal the without any vote

    await expect(myDAO.executeProposal(1)).to.be.revertedWith("Not enough votes ,cannot proceed further");
    
  })

  it("Should execute a proposal ,if match all the criteria, recipient gets ether",async()=>{
    //addr1 become an investor
    await myDAO.connect(addr1).contribute({ value: ethers.utils.parseEther("0.000000001") });

    //contribute and create a proposal fro deployer(admin) account
    await ContributeAndCreateProposalFromAdmin();

    // 1 = Proposal Id

    //vote from admin
    await myDAO.vote(1)

    //vote from addr1
    await myDAO.connect(addr1).vote(1);

    //finish the voting period
    const votingPeriod = await myDAO.votingPeriod();
    
    //voting period + 20 second
    const exceedVotingPeriod = BigNumber.from(votingPeriod).add(
      BigNumber.from(20));

    //increase the block timestamp. 
    await provider.send("evm_increaseTime", [exceedVotingPeriod.toNumber()]);
    await provider.send("evm_mine");

    //proposal receiver should receive requested amount

    //balance of addr2(recipient of proposal 1) before execution of proposal
    const addr2BalanceBeforeExecution = await provider.getBalance(addr2.address);

    //try to execute the proposal
    const tx = await myDAO.executeProposal(1);
    const allEvents = (await tx.wait()).events;
    const proposalEvent = await allEvents.find(
      (el) => el.event === "ProposalExecuted"
    );
    const [totalContribution, recipient, amount] = proposalEvent.args;

    //balance of addr2 after execution of proposal
    const addr2BalanceAfterExecution = await provider.getBalance(addr2.address);
    
    //difference in balance
    const diff = BigNumber.from(addr2BalanceAfterExecution).sub(BigNumber.from(addr2BalanceBeforeExecution));

    //this diff should be equal to amount emitted in the event
    expect(diff).be.equal(amount);

    


  })
});
