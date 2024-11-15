import { Command } from "@cliffy/command";
import { paint, perror, plog, pwarn } from "../../utils/paint.js";
import { gci, handleNExit } from "../../utils/general.js";
import Spinnies from "spinnies";

export const sendCmd = new Command().name("send")
  .option("-p, --pub-key <val:string>", "Public address of the owner to send the request to")
  .description("Request access to evidences from specified owner")
  .action(requestAccess);

async function requestAccess({ pubKey }: { pubKey?: string }) {
  if (!pubKey) {
    pwarn("Please specify the public address of the owner whom you want to send the request to.");
    return;
  }

  if (!pubKey.startsWith("0x") || pubKey.length !== 42) {
    perror("Provided public address is invalid");
    return;
  }

  let tx: `0x${string}`;
  const { client } = await gci();
  const spinnies = new Spinnies();
  spinnies.add("send", { text: "Sending request to the owner for access..." });

  try {
    tx = await client.write.requestAccess([pubKey as `0x${string}`]);
  } catch (err) {
    spinnies.stopAll();
    handleNExit(err);
  }

  spinnies.update("send", { text: `Request sent successfully.`, status: "succeed" });
  plog(`Transaction Hash on opBNB: ${paint.g.bold(tx)}`);
}
