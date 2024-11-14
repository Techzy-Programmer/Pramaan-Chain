import { english, generateMnemonic, mnemonicToAccount } from "viem/accounts";
import { Command } from "@cliffy/command";
import { Buffer } from "buffer";

export const setupCmd = new Command()
  .name("setup-account").alias("set")
  .option("-n, --name <val:string>", "Your name as legal entity.")
  .description("Register a new account with the Pramaan-Chain network.")
  .action(setupAccount);

function setupAccount({ name }: { name?: string }) {
  if (!name) {
    console.log("Please pass your name");
    return;
  }

  const mnemonic = generateMnemonic(english, 256);
  const account = mnemonicToAccount(mnemonic);

  console.log(`Account mnemonic: ${mnemonic}`);
  console.log(`Account address: ${account.address}`);
  console.log(`Account master private address: ${account.getHdKey().privateExtendedKey}`);
  console.log(`Account private address: ${Buffer.from(account.getHdKey().privateKey!).toString("hex")}`);
}
