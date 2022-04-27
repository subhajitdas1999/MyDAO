//SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MyERC20Token is ERC20,Ownable{

    constructor() ERC20("MyToken","MT"){
        _mint(owner(),100000000*(10**(decimals())));
    }
    //mint tokensBits
    function mint(uint _tokenSupply) public onlyOwner{
        _mint(owner(),_tokenSupply);
    }
    //burn Token Bits
    function burn(uint _tokenAmount) public onlyOwner{
        _burn(owner(),_tokenAmount);
    }

    function decimals() public pure  override returns (uint8) {
        return 0;
    }

    

    
}