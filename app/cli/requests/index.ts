import { pdim, pwarn } from "../../utils/paint.js";
import { Command } from "@cliffy/command";
import { grantCmd } from "./grant.js";
import { sendCmd } from "./send.js";

export const requestsCmd = new Command()
  .name("requests").alias("req")
  .description("Send or Grant request to access evidence data")
  .action(handleRequests)
  .command("send", sendCmd)
  .command("grant", grantCmd)

async function handleRequests() {
  pwarn("Please specify a sub-command to perform the request operation.");
  pdim("Use -h flag to see available sub-commands.");
}
