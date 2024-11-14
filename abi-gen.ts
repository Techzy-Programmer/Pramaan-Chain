import { existsSync, readFileSync, writeFileSync } from "fs";

const artifactDataPath = ".hardhat/artifacts/contracts/Pramaan.sol/Pramaan.json";
const targetABIFile = "./app/abi.ts";

if (!existsSync(artifactDataPath)) {
  throw new Error(`Contract artifact '${artifactDataPath}' not found.`);
}

const abiObj = JSON.parse(readFileSync(artifactDataPath, "utf-8")).abi;
const abiStr = JSON.stringify(abiObj, null, 2);

writeFileSync(targetABIFile, `export const abi = ${abiStr} as const;\r\n`);
console.log(`ABI data written to ${targetABIFile}`);
