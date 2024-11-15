import { addAccount, db, getDefaultAccountIndex, removeAccount, switchAccount } from "../utils/db.js";
import { paint, pdim, plog, pwarn } from "../utils/paint.js";
import { english, mnemonicToAccount } from "viem/accounts";
import { sendRequest } from "../utils/api-req.js";
import { Confirm, Input } from "@cliffy/prompt";
import { Command } from "@cliffy/command";
import { Buffer } from "buffer";

export const recoverCmd = new Command()
  .name("recover-account").alias("rec")
  .option("-r, --recovery-phrase <val:string>", "Your name as legal entity.")
  .description("Recover your account using the 12-words long private recovery phrase.")
  .action(recoverAccount);

async function recoverAccount({ recoveryPhrase }: { recoveryPhrase?: string }) {
  if (!recoveryPhrase) {
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

    recoveryPhrase = words.join(" ");
  }
  
  const account = mnemonicToAccount(recoveryPhrase);
  const privKey = Buffer.from(account.getHdKey().privateKey!).toString("hex");

  const defIndexBackup = await getDefaultAccountIndex();

  const recAccI = await addAccount({
    address: account.address,
    name: "",
    privKey,
  });

  await switchAccount(account.address);

  const resp = await sendRequest<{
    owner: {
      CreationTx: string;
      Name: string;
    }
  }>("/owner/retrieve");

  if (!resp.ok) {
    await removeAccount(account.address);
    if (resp.fetchError) return pwarn("Account recovery failed");
    pwarn("Account recovery failed, no account exists with provided recovery phrase. Please try again.");
    return;
  }

  await db.push(`/accounts[${recAccI}]/name`, resp.owner.Name);
  plog(`Blockchain registration link: ${paint.g.bold.underline(`https://opbnb.bscscan.com/tx/${resp.owner.CreationTx}`)}`);
  plog(`Account ${paint.c.bold(account.address)} recovered successfully.\nWelcome back ${paint.c.bold(resp.owner.Name)}`);

  const wantToSwitch = await Confirm.prompt({
    message: "Would you like to switch newly recovered account as default account?",
    default: false,
  });

  if (!wantToSwitch) {
    db.push("/defaultAccount", (defIndexBackup === -1) ? 0 : defIndexBackup);
  }
}
