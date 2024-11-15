import Spinnies from "spinnies";
import { Input } from "@cliffy/prompt";
import { Command } from "@cliffy/command";
import { paint, pdim, plog, pwarn } from "../../utils/paint.js";
import { gci, handleNExit } from "../../utils/general.js";
import { fsPicker } from "../../utils/fs-picker.js";
import { hashFile } from "../../utils/hash.js";

export const verifyCmd = new Command()
  .name("verify").alias("vf")
  .option("-p, --filePath <val:string>", "Your Evidence's file path")
  .option("-a, --pubAddress <val:string>", "Public address of the owner to whom the evidence belongs")
  .description("Check the integrity & authenticity of the evidence data on the Pramaan-Chain network.")
  .action(verifyEvidence);

export async function verifyEvidence({ filePath, pubAddress }: { filePath?: string, pubAddress?: string }) {
  if (!filePath) {
    filePath = await fsPicker({
      promptMessage: "Select the evidence file to proceed"
    })
  }

  if (!pubAddress) {
    pubAddress = await Input.prompt({
      message: "Enter the public address of the owner who owns this evidence",
      minLength: 42,
    });

    if (!pubAddress.startsWith("0x")) {
      pwarn("Public address should start with '0x'");
      return;
    }
  }

  const spinnies = new Spinnies();
  spinnies.add("verify", { text: "Verifying integrity of the evidence..." });
  const evHash = await hashFile(filePath);
  const { client } = await gci();

  try {
    const evidence = await client.read.verifyEvidenceIntegrity([pubAddress as `0x${string}`, evHash]);
    pdim("Evidence matched with the hash stored on the Pramaan-Chain network.");
    plog(`This means the evidence is ${paint.w.bold("authentic")} and has ${paint.w.bold("not")} been tampered with\n  As a precautionary measure you must verify the following facts about this evidence file:`);
    plog(`
    - Evidence Creation Times: ${paint.c.bold(new Date(Number(evidence.timestamp)).toLocaleString())}
    - Evidence Owner: ${paint.c.bold(pubAddress)}
    - Evidence IP Origin: ${paint.c.bold(evidence.ipAddress)}
    `)
  } catch (error) {
    spinnies.stopAll();
    handleNExit(error);
  }
}
