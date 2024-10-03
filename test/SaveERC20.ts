import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
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

    it("Should receive and store the funds to lock", async function () {
    
     

     
    });

    // it("Should fail if the unlockTime is not in the future", async function () {
      
    // });
  });


});