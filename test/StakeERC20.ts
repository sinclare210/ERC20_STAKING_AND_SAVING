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
      const expecTedReturn = duration * 2;
   
      expect ( await  stakeERC20.connect(otherAccount).calcReward()).to.be.equal(expecTedReturn)



    });

    
  

 
  });
});
