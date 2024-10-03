// SPDX-License-Identifier: MIT LICENSE
pragma solidity ^0.8.27;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakeERC20 {

    error AddressZeroDetected();
    error CantSendZero();
    error InsufficientFunds();
    error NotStaked();
    error NotOwner();
    error TimeNotReached();
    error AlreadyWithdrawn();
    error AlreadyStaked();
    
    uint256 totalStaked;
    address tokenAddress;
    address owner;

    struct Stake{
        bool isStaked;
        uint256 amount;
        uint256 period;
        uint256 startTime;
    }

    mapping (address => Stake) stakers;

    constructor (address _tokenAddress){
        tokenAddress = _tokenAddress;
        owner = msg.sender;
    }

    function stake(uint256 _periodInDays, uint256 amount ) external {
        if(msg.sender == address(0)){revert AddressZeroDetected();}
        if(IERC20(tokenAddress).balanceOf(msg.sender) < amount){revert InsufficientFunds();}
        if(amount <= 0) {revert CantSendZero();}
        if (stakers[msg.sender].isStaked == true) { revert AlreadyStaked(); }

        IERC20(tokenAddress).transferFrom(msg.sender,address(this),amount);
        totalStaked += amount;
        
        stakers[msg.sender] = Stake(true,amount,block.timestamp + _periodInDays * 1 days,block.timestamp);
    }

    function withdraw() external {
        if(block.timestamp < stakers[msg.sender].period){revert TimeNotReached();}
        if(stakers[msg.sender].isStaked == false){revert AlreadyWithdrawn();}
        if(msg.sender == address(0)){revert AddressZeroDetected();}

        uint256 amount = stakers[msg.sender].amount + calcReward();

        totalStaked -= stakers[msg.sender].amount;

        stakers[msg.sender].amount = 0; 
        stakers[msg.sender].isStaked = false;

        IERC20(tokenAddress).transfer(msg.sender, amount);
    }

    function emergencyWithdraw () external {
        if(msg.sender == address(0)){revert AddressZeroDetected();}
        if(stakers[msg.sender].isStaked == false){revert AlreadyWithdrawn();}

        uint256 amount = stakers[msg.sender].amount;

        totalStaked -= stakers[msg.sender].amount;

        stakers[msg.sender].amount = 0; 
        stakers[msg.sender].isStaked = false;


        IERC20(tokenAddress).transfer(msg.sender, amount);

    }

    function calcReward () internal view returns(uint256){
        if (stakers[msg.sender].isStaked == false){revert NotStaked();}
        uint256 stakingDuration = stakers[msg.sender].startTime - stakers[msg.sender].startTime;
        uint256 rewardRatePerSecond = 1; 
        return stakingDuration * rewardRatePerSecond;

    }

    function totalStake() external view returns(uint256){
       
        if(msg.sender == address(0)){revert AddressZeroDetected();}
        return totalStaked;
    }

    function checkUserStake (address _user) external view returns(uint256){
       
        if(msg.sender == address(0)){revert AddressZeroDetected();}
        if(stakers[_user].isStaked == false){
            return 0;
        }else{
            return stakers[_user].amount;
        }
    }
}