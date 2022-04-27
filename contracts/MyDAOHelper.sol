// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyDAOHelper{
    //price of a single token
    uint public priceOfToken = 10000000;

    //minimum token needed for voting
    uint private minTokenForVote = 100; //a investor need minimum 100 tokens in account to vote

    function calTokenAmount(uint _weiAmount) internal view returns(uint){
        return _weiAmount / priceOfToken ;
    }

    function redeemAmount(uint _tokenAmount) internal view returns(uint){
        return _tokenAmount * priceOfToken ;
    }

    function canVote(address _token,address _voter) internal view returns(bool){
        return IERC20(_token).balanceOf(_voter) >= minTokenForVote;
    }
}