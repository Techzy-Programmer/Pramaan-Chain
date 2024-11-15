import { Select } from "@cliffy/prompt";
import { Command } from "@cliffy/command";
import { getAccount } from "../../utils/db.js";
import { paint, pinfo, pok } from "../../utils/paint.js";
import {
  downloadEvidence,
  verifyEvidenceHash,
} from "../../utils/evidence-dl.js";
import { formatBytes, gci, handleNExit } from "../../utils/general.js";
import { fsPicker } from "../../utils/fs-picker.js";

export const listCmd = new Command()
  .name("list")
  .alias("ls")
  .option(
    "-a, --use-access",
    "List the evidences you have requested access for."
  )
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
};

async function listEvidence({ useAccess }: { useAccess?: boolean }) {
  const { client } = await gci();
  let actrl: ACTRL;

  if (useAccess) {
    pinfo("Listing evidences you have requested access for...");

    try {
      const perm = await client.read.getAccessControl();
      const evidences = await client.read.getAllEvidenceForMaster([
        perm.masterOwner,
      ]);

      actrl = {
        owner: perm.masterOwner,
        sig: perm.metaSignature,
        evidences,
      };
    } catch (e) {
      handleNExit(e);
    }
  } else {
    const acc = await getAccount();
    if (!acc) {
      console.log("No account found in local DB.");
      return;
    }

    const { address } = acc;

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

  const { dataHash, name, extension } = await renderEvidences(actrl);

  const dlPth = await fsPicker({
    promptMessage: "Select a folder to download the evidence to",
    onlyDirs: true,
  });

  console.log("\nDownloading...");
  await downloadEvidence(
    actrl.owner,
    dataHash,
    `${dlPth}/${name}${extension}`,
    actrl.sig
  );
  pok("Download complete.");
  verifyEvidenceHash(`${dlPth}/${name}${extension}`, dataHash);
}

async function renderEvidences(actrl: ACTRL) {
  const prompt = actrl.evidences.map(
    ({ extension, timestamp, dataHash, name, size }, i) => {
      return {
        name: `${i + 1}. ${paint.c.bold(name + extension)} (${paint.g(
          formatBytes(size)
        )}) - ${paint.w.dim(
          new Date(Number(`${timestamp}000`)).toLocaleString()
        )}`,
        value: { dataHash, name, extension },
      };
    }
  );

  const selectedEv = await Select.prompt({
    message: "Select an evidence to download",
    options: prompt,
  });

  return selectedEv;
}
