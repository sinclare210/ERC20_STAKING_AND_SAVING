import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("StakeERC20", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
   // and reset Hardhat Network to that snapshot in every test.
  async function deployToken() {
  

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const  erc20Token = await hre.ethers.getContractFactory("SINCLAIR");
    const token = await erc20Token.deploy();

    return {token, owner, otherAccount };
  }
  
async function deployStakeERC20() {
  

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const { token } = await loadFixture(deployToken);

    const  StakeERC20 = await hre.ethers.getContractFactory("StakeERC20");
    const stakeERC20 = await StakeERC20.deploy(token);

    return {stakeERC20, owner, otherAccount,token };
  }

   describe("Deployment", function () {
    it("Should set the right owner", async function () {
      
       const {stakeERC20, owner} = await loadFixture(deployStakeERC20);

      expect (await stakeERC20.owner()).to.equal(owner)
      
    });

    it("Should set the right token", async function () {

        const {stakeERC20, owner,token} = await loadFixture(deployStakeERC20);

        expect (await stakeERC20.tokenAddress()).to.equal(token);
      
    });

 
  });

   describe("stake", function () {
    it("cant send zero", async function () {
      
       const {stakeERC20, owner,token,otherAccount} = await loadFixture(deployStakeERC20);

      const trfAmount = ethers.parseUnits("10",18)
      await token.transfer(otherAccount,trfAmount);
      expect (await token.balanceOf(otherAccount)).to.be.equal(trfAmount)

      await token.connect(otherAccount).approve(stakeERC20,trfAmount);

     await expect ( stakeERC20.connect(otherAccount).stake(1,0)).to.be.revertedWithCustomError(stakeERC20,"CantSendZero")

    });

    it("cant send more than balance", async function () {
      
       const {stakeERC20, owner,token,otherAccount} = await loadFixture(deployStakeERC20);

      const trfAmount = ethers.parseUnits("10",18)
      await token.transfer(otherAccount,trfAmount);
      expect (await token.balanceOf(otherAccount)).to.be.equal(trfAmount)

      await token.connect(otherAccount).approve(stakeERC20,trfAmount);
      const trAmount = ethers.parseUnits("11",18)

     await expect ( stakeERC20.connect(otherAccount).stake(1,trAmount)).to.be.revertedWithCustomError(stakeERC20,"InsufficientFunds")

    });

     it("cant restake if curent stake is active", async function () {
      
       const {stakeERC20, owner,token,otherAccount} = await loadFixture(deployStakeERC20);

      const trfAmount = ethers.parseUnits("10",18)
      await token.transfer(otherAccount,trfAmount);
      expect (await token.balanceOf(otherAccount)).to.be.equal(trfAmount)

      await token.connect(otherAccount).approve(stakeERC20,trfAmount);
      const depAmount = ethers.parseUnits("4",18)

     await ( stakeERC20.connect(otherAccount).stake(1,depAmount))
     await expect (stakeERC20.connect(otherAccount).stake(1,depAmount)).to.be.revertedWithCustomError(stakeERC20,"AlreadyStaked");

    });

    it("should emit successfully", async function () {
      
       const {stakeERC20, owner,token,otherAccount} = await loadFixture(deployStakeERC20);

      const trfAmount = ethers.parseUnits("10",18)
      await token.transfer(otherAccount,trfAmount);
      expect (await token.balanceOf(otherAccount)).to.be.equal(trfAmount)

      await token.connect(otherAccount).approve(stakeERC20,trfAmount);
      const depAmount = ethers.parseUnits("4",18)

     
     await expect (stakeERC20.connect(otherAccount).stake(1,depAmount)).to.emit(stakeERC20,"StakeSuccessful");

    });

    it("should correctly increase total staked and check user stake", async function () {
      
       const {stakeERC20, owner,token,otherAccount} = await loadFixture(deployStakeERC20);

      const trfAmount = ethers.parseUnits("10",18)
      await token.transfer(otherAccount,trfAmount);
      expect (await token.balanceOf(otherAccount)).to.be.equal(trfAmount)

      await token.connect(otherAccount).approve(stakeERC20,trfAmount);
      const depAmount = ethers.parseUnits("4",18)

     
     await  (stakeERC20.connect(otherAccount).stake(1,depAmount))

      expect (await stakeERC20.connect(otherAccount).totalStake()).to.be.equal(depAmount);
      expect (await stakeERC20.connect(otherAccount).checkUserStake(otherAccount)).to.be.equal(depAmount);
          
    });

  

 
  });

  describe("calcreward", function () {
    it("should not calc until staked", async function () {
      
       const {stakeERC20, owner,token,otherAccount} = await loadFixture(deployStakeERC20);

      const trfAmount = ethers.parseUnits("10",18)
      await token.transfer(otherAccount,trfAmount);
      expect (await token.balanceOf(otherAccount)).to.be.equal(trfAmount)

      await token.connect(otherAccount).approve(stakeERC20,trfAmount);

      await expect(stakeERC20.connect(otherAccount).calcReward()).to.be.revertedWithCustomError(stakeERC20,"NotStaked")

    });

    it("should calc correctly", async function () {
      
       const {stakeERC20, owner,token,otherAccount} = await loadFixture(deployStakeERC20);

      const trfAmount = ethers.parseUnits("10",18)
      await token.transfer(otherAccount,trfAmount);
      expect (await token.balanceOf(otherAccount)).to.be.equal(trfAmount)

      await token.connect(otherAccount).approve(stakeERC20,trfAmount);
      const depAmount = ethers.parseUnits("4",18)

 
      await  (stakeERC20.connect(otherAccount).stake(1,depAmount))
     
     const duration = 60*1*60*24;
     
      await ethers.provider.send("evm_increaseTime", [duration]);
      await ethers.provider.send("evm_mine");
      const expecTedReturn = duration ;
   
      expect ( await  stakeERC20.connect(otherAccount).calcReward()).to.be.equal(expecTedReturn)



    });

    
  

 
  });


  describe("withdraw", function () {
    it("should revert when time is not reached", async function () {
      
       const {stakeERC20, owner,token,otherAccount} = await loadFixture(deployStakeERC20);

      const trfAmount = ethers.parseUnits("10",18)
      await token.transfer(otherAccount,trfAmount);
      expect (await token.balanceOf(otherAccount)).to.be.equal(trfAmount)

      await token.connect(otherAccount).approve(stakeERC20,trfAmount);
       const depAmount = ethers.parseUnits("4",18)

       await  (stakeERC20.connect(otherAccount).stake(1,depAmount))
       await expect ( stakeERC20.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(stakeERC20, "TimeNotReached")

    });

    it("should revert already withdraw if user stake is false", async function () {
      
       const {stakeERC20, owner,token,otherAccount} = await loadFixture(deployStakeERC20);

      const trfAmount = ethers.parseUnits("10",18)
      await token.transfer(otherAccount,trfAmount);
      expect (await token.balanceOf(otherAccount)).to.be.equal(trfAmount)

      await token.connect(otherAccount).approve(stakeERC20,trfAmount);
       const depAmount = ethers.parseUnits("4",18)

       await expect ( stakeERC20.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(stakeERC20, "AlreadyWithdrawn")

    });

    
        it("should emit withdraw successful", async function () {
      const { stakeERC20, owner, token, otherAccount } = await loadFixture(deployStakeERC20);

      const trfAmount = ethers.parseUnits("10", 18);
      await token.transfer(otherAccount, trfAmount);
       await token.transfer(owner, trfAmount);
      expect(await token.balanceOf(otherAccount)).to.equal(trfAmount);

      await token.connect(otherAccount).approve(stakeERC20, trfAmount);
       await token.approve(stakeERC20, trfAmount);
      const wdepAmount = ethers.parseUnits("4", 18);
       const depAmount = ethers.parseUnits("2", 18);

      await stakeERC20.connect(otherAccount).stake(1, depAmount);
      await stakeERC20.stake(1, wdepAmount);
      const amoutaferSake = await token.connect(otherAccount).balanceOf(otherAccount);

    //simulate time
      const duration = 60 * 1 * 60 * 24;
      await ethers.provider.send("evm_increaseTime", [duration]);
      await ethers.provider.send("evm_mine");

      // Before withdrawal, check the contract's balance
      const contractBalanceBefore = await token.balanceOf(stakeERC20);
      expect(contractBalanceBefore).to.be.equal(depAmount + wdepAmount);
      console.log(contractBalanceBefore)

      // Withdraw and check for event emission
      const rewardAmount = await stakeERC20.calcReward(); // Calculate the reward
      await expect(stakeERC20.connect(otherAccount).withdraw())
        .to.emit(stakeERC20, "withdrawSuccessful")
        

      // Check balances after withdrawal
      const contractBalanceAfter = await token.balanceOf(stakeERC20);
      const userBalanceAfter = await token.balanceOf(otherAccount);
      console.log(contractBalanceAfter)
      console.log(userBalanceAfter)

      // Ensure the contract balance has decreased by the withdrawn amount
      expect(contractBalanceAfter).to.equal((depAmount + wdepAmount) - (rewardAmount + depAmount));
      
      expect(userBalanceAfter).to.equal(rewardAmount + depAmount + amoutaferSake); // User should have received their staked amount + rewards
      console.log(rewardAmount + depAmount + amoutaferSake)
    });
 
  });

  describe("emergencyWithdraw", function () {
    it("should revert if user didnt stake or is unstake", async function () {
      
       const {stakeERC20, owner,token,otherAccount} = await loadFixture(deployStakeERC20);

      const trfAmount = ethers.parseUnits("10",18)
      await token.transfer(otherAccount,trfAmount);
      expect (await token.balanceOf(otherAccount)).to.be.equal(trfAmount)

      await token.connect(otherAccount).approve(stakeERC20,trfAmount);
       const depAmount = ethers.parseUnits("4",18)

      //  await  (stakeERC20.connect(otherAccount).stake(1,depAmount))
       await expect ( stakeERC20.connect(otherAccount).emergencyWithdraw()).to.be.revertedWithCustomError(stakeERC20, "AlreadyWithdrawn")

    });
     it("should send the user the it right amount", async function () {
      
       const {stakeERC20, owner,token,otherAccount} = await loadFixture(deployStakeERC20);

      const trfAmount = ethers.parseUnits("10",18)
      await token.transfer(otherAccount,trfAmount);
      expect (await token.balanceOf(otherAccount)).to.be.equal(trfAmount)

      await token.connect(otherAccount).approve(stakeERC20,trfAmount);
       const depAmount = ethers.parseUnits("4",18)

       await  (stakeERC20.connect(otherAccount).stake(1,depAmount))
       await  ( stakeERC20.connect(otherAccount).emergencyWithdraw())
         expect( await token.balanceOf(otherAccount)).to.equal(trfAmount)

    });
  });
});
