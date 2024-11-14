import { english, mnemonicToAccount } from "viem/accounts";
import { Command } from "@cliffy/command";
import { Buffer } from "buffer";
import { Input } from "@cliffy/prompt";

export const recoverCmd = new Command()
  .name("recover-account")
  .alias("rec")
  .option("-m", "Your mnemonic to recover account.")
  .description("Recover an account with the Pramaan-Chain network.")
  .action(recoverAccount);

async function recoverAccount() {
  // Prompt the user for information
  const data: string[] = [];
  for (let i = 0; i < 12; i++) {
    let word = await Input.prompt({
      message: `Enter word ${i + 1}`,
      minLength: 3,
      suggestions: english,
    });
    data.push(word);
  }

  const mnemonic = data.join(" ");
  // Generate account from mnemonic
  console.log(data);

  const account = mnemonicToAccount(mnemonic);

  // Output account information
  console.log(`Account address: ${account.address}`);
  console.log(
    `Account master private address: ${account.getHdKey().privateExtendedKey}`
  );
  console.log(
    `Account private address: ${Buffer.from(
      account.getHdKey().privateKey!
    ).toString("hex")}`
  );
}
