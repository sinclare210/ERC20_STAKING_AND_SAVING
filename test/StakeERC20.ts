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
    it("Should set the right owner", async function () {
      
       const {stakeERC20, owner} = await loadFixture(deployStakeERC20);

      expect (await stakeERC20.owner()).to.equal(owner)
      
    });

    it("Should set the right token", async function () {

        const {stakeERC20, owner,token} = await loadFixture(deployStakeERC20);

        expect (await stakeERC20.tokenAddress()).to.equal(token);
      
    });

 
  });
});
