import { Select } from "@cliffy/prompt";
import { Command } from "@cliffy/command";
import { db, DBAccount } from "../utils/db.js";
import { paint, pinfo } from "../utils/paint.js";
import { formatBytes, gci, handleNExit } from "../utils/general.js";

export const listEvidenceCmd = new Command()
  .name("list").alias("ls")
  .option("-a, --use-access", "List the evidences you have requested access for.")
  .description("Upload your evidence with the Pramaan-Chain network.")
  .action(listEvidence);

type ACTRL = {
  owner: `0x${string}`;
  sig: string;

  evidences: readonly {
    timestamp: bigint;
    extension: string;
    dataHash: string;
    size: bigint;
    name: string;
  }[];
}

async function listEvidence({ useAccess }: { useAccess?: boolean }) {
  const { client } = await gci();
  let actrl: ACTRL;
  
  if (useAccess) {
    pinfo("Listing evidences you have requested access for...");

    try {
      const perm = await client.read.getAccessControl()
      const evidences = await client.read.getAllEvidenceForMaster([perm.masterOwner]);

      actrl = {
        owner: perm.masterOwner,
        sig: perm.metaSignature,
        evidences,
      };
    } catch (e) {
      handleNExit(e);
    }
  } else {
    const { address } = await db.getObject<DBAccount>("/account");

    try {
      const evidences = await client.read.getAllEvidence();

      actrl = {
        owner: address as `0x${string}`,
        evidences,
        sig: "",
      };
    } catch (e) {
      handleNExit(e);
    }
  }

  if (actrl.evidences.length === 0) {
    console.log("No evidences found.");
    return;
  }

  const selectedHash = await renderEvidences(actrl);
  console.log("\nYou Selected", selectedHash);
}

async function renderEvidences(actrl: ACTRL) {
  const prompt = actrl.evidences.map(({
    extension,
    timestamp,
    dataHash,
    name,
    size
  }, i) => {
    return {
      name: `${i + 1}. ${paint.c.bold(name + extension)} (${paint.g(formatBytes(size))}) - ${paint.w.dim(new Date(Number(`${timestamp}000`)).toLocaleString())}`,
      value: dataHash
    };
  });

  const selectedHash = await Select.prompt({
    message: "Select an evidence to download",
    options: prompt
  });

  return selectedHash;
}
