import { gci, handleNExit } from "../utils/general.js";
import { paint, plog } from "../utils/paint.js";
import { Command } from "@cliffy/command";

export const checkAccessCmd = new Command()
  .name("check-access").alias("chk")
  .description("Checks if you have been granted access to any evidence data.")
  .action(checkAccess);

async function checkAccess() {
  const { client } = await gci();

  try {
    const actrl = await client.read.getAccessControl();
    const lines = [
      `${paint.c("You have access to the evidence data of the following owner:")}`,
      `  ${paint.w.dim("Request granter:")} ${paint.g.bold(actrl.masterOwner)}`,
      `  ${paint.w.dim("Access expiring at:")} ${paint.r.bold(new Date(Number(`${actrl.expirationTime}000`)).toLocaleString())}`,
    ]

    plog(lines.join("\n"), "\n");
  } catch (e) {
    handleNExit(e);
  }
}