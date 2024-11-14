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
    "opbnb-test": {
      chainId: 5611,
      accounts: [ETH_ACCOUNT_PRIVATE_KEY],
      url: "https://opbnb-testnet-rpc.bnbchain.org/", // OR https://opbnb-testnet-rpc.publicnode.com
    },
    "opbnb-main": {
      chainId: 204,
      accounts: [ETH_ACCOUNT_PRIVATE_KEY],
      url: "https://opbnb-mainnet-rpc.bnbchain.org", // OR https://opbnb-rpc.publicnode.com
    },
  }
};

export default config;
