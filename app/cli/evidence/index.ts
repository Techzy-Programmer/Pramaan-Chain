import { pdim, pwarn } from "../../utils/paint.js";
import { Command } from "@cliffy/command";
import { uploadCmd } from "./upload.js";
import { listCmd } from "./list.js";

export const evidenceCmd = new Command()
  .name("evidence").alias("ev")
  .description("Manage your evidence data on the Pramaan-Chain network.")
  .action(handleEmptyevidence)
  .command("upload", uploadCmd)
  .command("list", listCmd);

async function handleEmptyevidence() {
  pwarn("Please specify a sub-command to perform the request operation.");
  pdim("Use -h flag to see available sub-commands.");
}
