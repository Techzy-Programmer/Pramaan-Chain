import { paint, pdim, plog, pwarn } from "../utils/paint.js";
import { english, mnemonicToAccount } from "viem/accounts";
import { sendRequest } from "../utils/request.js";
import { Command } from "@cliffy/command";
import { Input } from "@cliffy/prompt";
import { db } from "../utils/db.js";
import { Buffer } from "buffer";

export const recoverCmd = new Command()
  .name("recover-account").alias("rec")
  .description("Recover your account using the 12-words long private recovery phrase.")
  .action(recoverAccount);

async function recoverAccount() {
  const words: string[] = [];

  for (let i = 0; i < 12; i++) {
    pdim("Important: Please ensure no one is looking at your screen.\nEnter the phrase exactly as recorded, in the same order.");
    const word = await Input.prompt({
      message: `Enter Phrase ${i + 1}`,
      suggestions: english,
      minLength: 3,
    });
    
    console.clear();
    words.push(word);
  }

  const mnemonic = words.join(" ");
  const account = mnemonicToAccount(mnemonic);
  const privKey = Buffer.from(account.getHdKey().privateKey!).toString("hex");

  await db.push("/account", {
    address: account.address,
    name: "",
    privKey,
  });

  const resp = await sendRequest<{
    owner: {
      CreationTx: string;
      Name: string;
    }
  }>("/owner/retrieve");

  if (!resp.ok) {
    pwarn("Account recovery failed, no account exists with provided recovery phrase. Please try again.");
    await db.delete("/account");
    return;
  }

  await db.push("/account/name", resp.owner.Name);
  plog(`Blockchain registration link: ${paint.g.bold.underline(`https://opbnb.bscscan.com/tx/${resp.owner.CreationTx}`)}`);
  plog(`Account ${paint.c.bold(account.address)} recovered successfully.\nWelcome back ${paint.c.bold(resp.owner.Name)}`);
}
