import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const dataStoreModule = buildModule("DataStoreModule", (m) => {
  const initMSG = "Rishabh Kumar";

  return {
    ds: m.contract("DataStore", [initMSG])
  };
});

export default dataStoreModule;
