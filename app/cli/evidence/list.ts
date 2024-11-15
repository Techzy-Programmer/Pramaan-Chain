import { Select } from "@cliffy/prompt";
import { Command } from "@cliffy/command";
import { getAccount } from "../../utils/db.js";
import { paint, plog, pwarn } from "../../utils/paint.js";
import { downloadEvidence } from "../../utils/evidence-dl.js";
import { formatBytes, gci, handleNExit } from "../../utils/general.js";
import { fsPicker } from "../../utils/fs-picker.js";
import Spinnies from "spinnies";
import path from "path";

export const listCmd = new Command()
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
  const spinnies = new Spinnies();
  const { client } = await gci();
  let actrl: ACTRL;
  
  if (useAccess) {
    spinnies.add("list", { text: "Fetching evidences you have requested access for..." });

    try {
      const perm = await client.read.getAccessControl();
      const evidences = await client.read.getAllEvidenceForMaster([perm.masterOwner]);

      actrl = {
        owner: perm.masterOwner,
        sig: perm.metaSignature,
        evidences,
      };
    } catch (e) {
      spinnies.stopAll();
      handleNExit(e);
    }
  } else {
    spinnies.add("list", { text: "Fetching evidences uploaded by you..." });
    const acc = await getAccount();

    if (!acc) {
      spinnies.stopAll();
      pwarn("No account found in local DB.");
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
      spinnies.stopAll();
      handleNExit(e);
    }
  }

  if (actrl.evidences.length === 0) {
    spinnies.stopAll();
    spinnies.remove("list");
    console.log("No evidences found.");

    return;
  }

  spinnies.update("list", { text: "Evidences fetch successful.", status: "succeed" });
  const { dataHash, name, extension } = await renderEvidences(actrl);

  const dlPth = await fsPicker({
    promptMessage: "Select a folder to download the evidence to",
    onlyDirs: true,
  });

  const fpath = path.join(dlPth, name + extension);
  if (!await downloadEvidence(actrl.owner, dataHash, fpath, actrl.sig)) return;
  plog(`\nEvidence download complete\n  Stored At > ${paint.g.bold(`${fpath}`)}`);
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
