// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const tokenAddress = "0x0856D34c16A4d37Bb290084b4943AD5A4492b791";

const SaveERC20Module = buildModule("SaveERC20Module", (m) => {


  const saveERC20 = m.contract("SaveERC20", [tokenAddress]);

  return { saveERC20 };
});

export default SaveERC20Module;

//0x0719188861C1614958b675E2dbf42b32c88bCDc2
