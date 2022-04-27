async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    console.log("Account balance:", (await deployer.getBalance()).toString());

    MyDAO = await ethers.getContractFactory("MyDAO");
    Token = await ethers.getContractFactory("MyERC20Token");
    token = await Token.deploy();
    myDAO = await MyDAO.deploy(token.address);

    //send initial tokens to myDAO
    const totalSupply = await token.totalSupply();
    await token.transfer(myDAO.address, totalSupply);

    console.log("DAS address:", myDAO.address);
    console.log("Token address:", token.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });