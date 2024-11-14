import { Command } from "@cliffy/command";
import { setupCmd } from "./cli/setup.js";
import { init } from "./utils/general.js";
import { APP_VERSION } from "./utils/vars.js";

init();

const mainCmd = new Command()
  .name("pch")
  .version(APP_VERSION)
  .usage("[command] [options]")
  .description("Owner CLI for Pramaan-Chain for preserving digital evidence.");

mainCmd
  .command("setup-account", setupCmd);

process.argv.shift()
process.argv.shift()
mainCmd.parse(process.argv);
