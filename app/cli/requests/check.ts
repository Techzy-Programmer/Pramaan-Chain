import Spinnies from "spinnies";
import { gci, handleNExit } from "../../utils/general.js";
import { paint, plog } from "../../utils/paint.js";
import { Command } from "@cliffy/command";

export const checkCmd = new Command()
  .name("check")
  .description("Check if you have been granted access (if requested for)")
  .action(checkAccess);

async function checkAccess() {
  const spinnies = new Spinnies();
  const { client } = await gci();
  
  try {
    spinnies.add("check", { text: "Checking if you've been granted access..." });
    const actrl = await client.read.getAccessControl();
    spinnies.update("check", {
      text: "Call successful.",
      status: "stopped",
    });

    const lines = [
      `${paint.c("You have access to the evidence data of the following owner:")}`,
      `  ${paint.w.dim("Request granter:")} ${paint.g.bold(actrl.masterOwner)}`,
      `  ${paint.w.dim("Access expiring at:")} ${paint.r.bold(new Date(Number(`${actrl.expirationTime}000`)).toLocaleString())}`,
    ]

    plog(lines.join("\n"), "\n");
  } catch (e) {
    spinnies.stopAll();
    handleNExit(e);
  }
}
