// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const TokenModule = buildModule("TokenModule", (m) => {
  

  const token = m.contract("SINCLAIR");

  return { token };
});

export default TokenModule;

//0x0856D34c16A4d37Bb290084b4943AD5A4492b791
