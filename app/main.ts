import { Command } from "@cliffy/command";
import { setupCmd } from "./cli/setup.js";
import { recoverCmd } from "./cli/recover.js";
import { init } from "./utils/general.js";
import { APP_VERSION } from "./utils/vars.js";
import { requestsCmd } from "./cli/requests/index.js";
import { evidenceCmd } from "./cli/evidence/index.js";
import { switchCmd } from "./cli/switch.js";
import { removeCmd } from "./cli/remove.js";
import { baseCommand } from "./base-cmd.js";

init();

const mainCmd = new Command()
  .name("pch")
  .version(APP_VERSION)
  .usage("[command] [options]")
  .description("Pramaan-Chain Owner CLI for securely preserving digital evidences.")
  .action(baseCommand);

mainCmd
  .command("setup-account", setupCmd)
  .command("recover-account", recoverCmd)
  .command("switch-account", switchCmd)
  .command("remove-account", removeCmd)
  .command("requests", requestsCmd)
  .command("evidence", evidenceCmd)

process.argv.shift();
process.argv.shift();
mainCmd.parse(process.argv);
