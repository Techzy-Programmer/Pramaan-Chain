import { Command } from "@cliffy/command";
import { colors } from "@cliffy/ansi/colors";
import { setupCmd } from "./cli/setup.js";

console.log(colors.brightMagenta.bold("Pramaan-Chain"))

const mainCmd = new Command()
  .name("pch")
  .version("0.1.0")
  .usage("[command] [options]")
  .description("Owner CLI for Pramaan-Chain for preserving digital evidence.");

mainCmd
  .command("setup-account", setupCmd);

process.argv.shift()
process.argv.shift()
mainCmd.parse(process.argv);
