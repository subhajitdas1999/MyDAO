//SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

/*{
	"0": "uint256: 36348085178222983392456617670535241478612241265971707191723330344148927949749"
}*/


contract Box is Ownable{
    uint256 private value;

  // Emitted when the stored value changes
  event ValueChanged(uint256 newValue);

  // Stores a new value in the contract
  function store(uint256 newValue) public onlyOwner {
    value = newValue;
    emit ValueChanged(newValue);
  }

  // Reads the last stored value
  function retrieve() public view returns (uint256) {
    return value;
  }

  function tmp (string memory str) public pure returns(bytes32){
    return keccak256(bytes(str));
  }
}