// SPDX-License-Identifier: MIT LICENSE
pragma solidity 0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SaveERC20 {

    error AddressZeroDetected();
    error CantSendZero();
    error InsufficientFunds();
    error NotOwner();
    error CantSendToZeroAddress();

    address public tokenAddress;
    address  public _owner;

    constructor (address _tokenAddress){
        _owner = msg.sender;
        tokenAddress = _tokenAddress;
    }

    mapping (address => uint256) balance;
    event withdrawalSuccessful (address indexed user, uint256 indexed amount);
    event depositSuccessful (address indexed user, uint256 indexed amount);
    event depositForAnotherUserSuccesful  (address indexed sender,address indexed user, uint256 indexed amount);

    function deposit (uint256 amount) external{
        if(msg.sender == address(0)){revert AddressZeroDetected();}
        if(IERC20(tokenAddress).balanceOf(msg.sender) < amount){revert InsufficientFunds();}
        if(amount <= 0) {revert CantSendZero();}
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        balance[msg.sender] += amount;
        emit depositSuccessful(msg.sender, amount);
    }

    function myBalance() external view returns(uint256){
        if(msg.sender == address(0)){revert AddressZeroDetected();}
        return balance[msg.sender];
    }

    function contractBalance() external view returns(uint256){
        if(msg.sender == address(0)){revert AddressZeroDetected();}
        if(msg.sender != _owner){revert NotOwner();}
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    function userBalance(address _user) external view returns(uint256){
        if(msg.sender == address(0)){revert AddressZeroDetected();}
        require(msg.sender == _owner,"Not authorized");
        return balance[_user];
    }

    function withdraw(uint256 amount) external{
        if(msg.sender == address(0)){revert AddressZeroDetected();}
       if(balance[msg.sender] <= amount) {revert InsufficientFunds();}
        if(amount <= 0) {revert CantSendZero();}
        balance[msg.sender] -= amount;
        IERC20(tokenAddress).transfer(msg.sender, amount);
    }

    function transerFunds(uint256 amount, address _to) external{
        if(msg.sender == address(0)){revert AddressZeroDetected();}
        if(_to == address(0)){revert CantSendToZeroAddress();}
        if(balance[msg.sender] <= amount) {revert InsufficientFunds();}
         if(amount <= 0) {revert CantSendZero();}
        balance[msg.sender] -= amount;

        IERC20(tokenAddress).transfer(_to, amount);
    }

    function depositForAnotherUser(uint256 amount, address _to) external{
        if(msg.sender == address(0)){revert AddressZeroDetected();}
        if(_to == address(0)){revert CantSendToZeroAddress();}
         if(amount <= 0) {revert CantSendZero();}
        
        if(IERC20(tokenAddress).balanceOf(msg.sender) <amount){revert InsufficientFunds();}

        IERC20(tokenAddress).transferFrom(msg.sender, _to, amount);

        balance[_to] += amount;

        emit depositForAnotherUserSuccesful(msg.sender, _to, amount);



    }

}