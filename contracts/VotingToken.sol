//SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract VotingToken is ERC20Votes{
    constructor() ERC20("MyVotingToken","MVT") ERC20Permit("MyVotingToken") {
        _mint(msg.sender,1000000*(10**decimals()));
    }

    //making sure we are calling the _afterTokenTransfer of the ERC20Votes
    //And the snapshots are updated . we wanna know how many token each people have at Each block
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
        }

    function _mint(address account, uint256 amount) internal virtual override {
        super._mint(account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual override {
        super._burn(account, amount);
    }

}