//SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

//We want to wait for a new vote to execute
//Give time to users to "GET out" if the want to

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimeLock is TimelockController{
    //minDelay : How long you have wait before executing (in time)
    //proposers : List of addresses that can propose
    //executors : who can execute when a proposal passes

    //we need to pass this to timelock controller
    constructor(uint minDelay,address[] memory proposers,address[] memory executors) TimelockController(minDelay,proposers,executors){

    }
}