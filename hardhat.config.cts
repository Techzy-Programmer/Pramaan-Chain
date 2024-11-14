import type { HardhatUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-toolbox-viem";
import { vars } from "hardhat/config";

const ETH_ACCOUNT_PRIVATE_KEY = vars.get("ETH_ACCOUNT_PRIVATE_KEY");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    }
  },
  paths: {
    cache: "./.hardhat/cache",
    artifacts: "./.hardhat/artifacts",
  },
  networks: {
    "skale-test": {
      chainId: 974399131,
      accounts: [ETH_ACCOUNT_PRIVATE_KEY],
      url: "https://testnet.skalenodes.com/v1/giant-half-dual-testnet",
    },
    "kcc-main": {
      chainId: 321,
      accounts: [ETH_ACCOUNT_PRIVATE_KEY],
      url: "https://rpc-mainnet.kcc.network",
    },
  }
};

export default config;
