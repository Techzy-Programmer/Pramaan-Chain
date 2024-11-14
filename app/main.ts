import { Command } from "@cliffy/command";
import { setupCmd } from "./cli/setup.js";
import { recoverCmd } from "./cli/recover.js";
import { init } from "./utils/general.js";
import { APP_VERSION } from "./utils/vars.js";

init();

const mainCmd = new Command()
  .name("pch")
  .version(APP_VERSION)
  .usage("[command] [options]")
  .description("Pramaan-Chain Owner CLI for preserving digital evidences.");

mainCmd
  .command("setup-account", setupCmd)
  .command("recover-account", recoverCmd);

process.argv.shift();
process.argv.shift();
mainCmd.parse(process.argv);
