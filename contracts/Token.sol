// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SINCLAIR is ERC20("SIN token","SIN"){
    address public owner;

    constructor (){
        owner = msg.sender;
        _mint(msg.sender,10000e18);
    }

    function mint(uint256 _amount) external {
        require(msg.sender == owner, "You are not the owner");
        _mint(msg.sender, _amount * 1e18);
    }
}