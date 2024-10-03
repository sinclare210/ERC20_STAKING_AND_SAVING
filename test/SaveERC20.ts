import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("SaveERC20", function () {
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
  
async function deploySaveERC20() {
  

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const { token } = await loadFixture(deployToken);

    const  SaveERC20 = await hre.ethers.getContractFactory("SaveERC20");
    const saveERC20 = await SaveERC20.deploy(token);

    return {saveERC20, owner, otherAccount,token };
  }

   describe("Deployment", function () {
    it("Should set the right owner", async function () {
      
       const {saveERC20, owner} = await loadFixture(deploySaveERC20);

      expect (await saveERC20._owner()).to.equal(owner)
      
    });

    it("Should set the right token", async function () {

        const {saveERC20, owner,token} = await loadFixture(deploySaveERC20);

        expect (await saveERC20.tokenAddress()).to.equal(token);
      
    });

 
  });

  describe ("deposit", function (){
      it("should deposit correctly", async function () {
         const {saveERC20, owner,otherAccount, token} = await loadFixture(deploySaveERC20);
          
          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)


          const depAmount = ethers.parseUnits("10", 18)

          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          await (saveERC20.connect(otherAccount).deposit(depAmount))
          //checking my balance
          expect (await saveERC20.connect(otherAccount).myBalance()).to.equal(depAmount);
          //checking contract bal
          expect (await saveERC20.contractBalance()).to.equal(depAmount);
          //checking for user balance
          expect (await saveERC20.userBalance(otherAccount)).to.equal(depAmount);
          
          

      });

      it("revert when sending zero", async function () {
          const {owner,otherAccount,token,saveERC20} = await loadFixture(deploySaveERC20);

          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)


          const depAmount = ethers.parseUnits("0", 18)

          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          await expect (saveERC20.connect(otherAccount).deposit(depAmount)).to.be.revertedWithCustomError(saveERC20, "CantSendZero");
      });

      it("should revert on depoditing more than balance", async function () {
          const {owner,otherAccount,token,saveERC20} = await loadFixture(deploySaveERC20);

          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)
          const depAmount = ethers.parseUnits("101", 18)
          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          await expect(saveERC20.connect(otherAccount).deposit(depAmount)).to.revertedWithCustomError(saveERC20, "InsufficientFunds")

      });

      it("correct event on deposit", async function () {
          const {owner,otherAccount,token,saveERC20} = await loadFixture(deploySaveERC20);

          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)
          const depAmount = ethers.parseUnits("10", 18)
          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          await expect(saveERC20.connect(otherAccount).deposit(depAmount)).to.emit(saveERC20, "depositSuccessful")

      });


  })

  describe("transfer", function (){
         it("it should transfer succesfully", async function () {
          const {owner,otherAccount,token,saveERC20} = await loadFixture(deploySaveERC20);

          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)
          const depAmount = ethers.parseUnits("10", 18)
          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          await (saveERC20.connect(otherAccount).deposit(depAmount))
          const tfAmount = ethers.parseUnits("1",18);

        expect (await saveERC20.connect(otherAccount).myBalance()).to.equal(depAmount)
        await expect ( saveERC20.connect(otherAccount).transerFunds(tfAmount,owner)).to.emit(saveERC20, "transerFundsSuccess")

      });

      it("it should revert with insufficient funds", async function () {
          const {owner,otherAccount,token,saveERC20} = await loadFixture(deploySaveERC20);

          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)
          const depAmount = ethers.parseUnits("10", 18)
          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          await (saveERC20.connect(otherAccount).deposit(depAmount))
          const tfAmount = ethers.parseUnits("11",18);

        expect (await saveERC20.connect(otherAccount).myBalance()).to.equal(depAmount)
        await expect ( saveERC20.connect(otherAccount).transerFunds(tfAmount,owner)).to.revertedWithCustomError(saveERC20, "InsufficientFunds")

      });

      it("it should revert with cant send zero when user try to send zero", async function () {
          const {owner,otherAccount,token,saveERC20} = await loadFixture(deploySaveERC20);

          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)
          const depAmount = ethers.parseUnits("10", 18)
          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          await (saveERC20.connect(otherAccount).deposit(depAmount))
          const tfAmount = ethers.parseUnits("0",18);

        expect (await saveERC20.connect(otherAccount).myBalance()).to.equal(depAmount)
        await expect ( saveERC20.connect(otherAccount).transerFunds(tfAmount,owner)).to.revertedWithCustomError(saveERC20, "CantSendZero")

      });


      
  })

  describe("withdraw", function (){
         it("it should transfer succesfully", async function () {
          const {owner,otherAccount,token,saveERC20} = await loadFixture(deploySaveERC20);

          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)
          const depAmount = ethers.parseUnits("10", 18)
          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          await (saveERC20.connect(otherAccount).deposit(depAmount))
          const tfAmount = ethers.parseUnits("1",18);

        expect (await saveERC20.connect(otherAccount).myBalance()).to.equal(depAmount)
        await expect ( saveERC20.connect(otherAccount).withdraw(tfAmount)).to.emit(saveERC20, "withdrawSuccess")

      });

       it("it should revert with cant send zero when user try to send zero", async function () {
          const {owner,otherAccount,token,saveERC20} = await loadFixture(deploySaveERC20);

          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)
          const depAmount = ethers.parseUnits("10", 18)
          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          await (saveERC20.connect(otherAccount).deposit(depAmount))
          const tfAmount = ethers.parseUnits("0",18);

        expect (await saveERC20.connect(otherAccount).myBalance()).to.equal(depAmount)
        await expect ( saveERC20.connect(otherAccount).withdraw(tfAmount)).to.revertedWithCustomError(saveERC20, "CantSendZero")

      });

       it("should check user contract balance", async function () {
          const {owner,otherAccount,token,saveERC20} = await loadFixture(deploySaveERC20);

          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)
          const depAmount = ethers.parseUnits("10", 18)
          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          await (saveERC20.connect(otherAccount).deposit(depAmount))
          const tfAmount = ethers.parseUnits("1",18);

        expect (await saveERC20.connect(otherAccount).myBalance()).to.equal(depAmount)
        await ( saveERC20.connect(otherAccount).withdraw(tfAmount))
        expect (await saveERC20.contractBalance()).to.equal(depAmount - tfAmount)
        expect (await saveERC20.connect(otherAccount).myBalance()).to.equal(depAmount - tfAmount)
        

      });

      describe("depositForAnotherUser", function (){
         it("should emit correctly", async function () {
          const {owner,otherAccount,token,saveERC20} = await loadFixture(deploySaveERC20);

          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)
          const depAmount = ethers.parseUnits("10", 18)
          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          
          const tfAmount = ethers.parseUnits("1",18);

        
        await expect ( saveERC20.connect(otherAccount).depositForAnotherUser(tfAmount,owner)).to.emit(saveERC20, "depositForAnotherUserSuccesful")

      });

       it("it should revert with cant send zero when user try to send zero", async function () {
          const {owner,otherAccount,token,saveERC20} = await loadFixture(deploySaveERC20);

          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)
          const depAmount = ethers.parseUnits("10", 18)
          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          await (saveERC20.connect(otherAccount).deposit(depAmount))
          const tfAmount = ethers.parseUnits("0",18);

        expect (await saveERC20.connect(otherAccount).myBalance()).to.equal(depAmount)
        await expect ( saveERC20.connect(otherAccount).depositForAnotherUser(tfAmount,owner)).to.revertedWithCustomError(saveERC20, "CantSendZero")

      });

       it("should check user contract balance", async function () {
          const {owner,otherAccount,token,saveERC20} = await loadFixture(deploySaveERC20);

          const trfAmount = ethers.parseUnits("100", 18)
          await token.transfer(otherAccount,trfAmount);
          expect (await token.balanceOf(otherAccount)).to.equal(trfAmount)
          const depAmount = ethers.parseUnits("10", 18)
          await token.connect(otherAccount).approve(saveERC20, trfAmount);

          await (saveERC20.connect(otherAccount).deposit(depAmount))
          const tfAmount = ethers.parseUnits("1",18);

        expect (await saveERC20.connect(otherAccount).myBalance()).to.equal(depAmount)
        await ( saveERC20.connect(otherAccount).depositForAnotherUser(depAmount,owner))
        expect (await saveERC20.contractBalance()).to.equal(depAmount)
        expect (await saveERC20.myBalance()).to.equal(depAmount)
       
        

      });
  })

  })

});