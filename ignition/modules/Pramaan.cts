import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PramaanModule = buildModule("Pramaan_Module_v1", (builder) => ({
  pramaan: builder.contract("Pramaan")
}));

export default PramaanModule;
