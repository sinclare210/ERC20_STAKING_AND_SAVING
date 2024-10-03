// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenAddress = "0x0856D34c16A4d37Bb290084b4943AD5A4492b791";

const StakeERC20Module = buildModule("StakeERC20Module", (m) => {


  const stakeERC20 = m.contract("StakeERC20", [tokenAddress]);

  return { stakeERC20 };

});

//StakeERC20Module#StakeERC20 - 0x0D854Ba52464DfBE1b9631c2dEdA368247BeDAF8

export default StakeERC20Module;