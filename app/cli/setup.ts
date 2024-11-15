import { english, generateMnemonic, mnemonicToAccount } from "viem/accounts";
import { paint, pdim, perror, plog, pok, pwarn } from "../utils/paint.js";
import { gci, handleNExit, waitForEnter } from "../utils/general.js";
import { addAccount, switchAccount } from "../utils/db.js";
import { sendRequest } from "../utils/api-req.js";
import { Confirm, Input } from "@cliffy/prompt";
import { Command } from "@cliffy/command";
import { Table } from "@cliffy/table";
import { Buffer } from "buffer";
import Spinnies from "spinnies";

export const setupCmd = new Command()
  .name("setup-account").alias("set")
  .option("-n, --name <val:string>", "Your name as legal entity.")
  .description("Register a new account with the Pramaan-Chain network.")
  .action(setupAccount);

async function setupAccount({ name }: { name?: string }) {
  if (!name) {
    name = await Input.prompt({
      message: "Enter your name as legal entity",
      maxLength: 64,
      minLength: 1,
    });
  }

  plog();
  const mnemonic = generateMnemonic(english);
  const account = mnemonicToAccount(mnemonic);

  pwarn("You are about to peep at your account 12-words secret recovery phrase.");
  pdim("Please ensure no one is looking at your screen.");
  plog("Hit enter to continue....");
  await waitForEnter();

  const mnemonicWords = mnemonic.split(" ").map((word, index) => paint.c.underline.bold(word) + "\n" + paint.w.italic.dim(`${index + 1}`));
  pok("Please note down the following 12-words secret recovery phrase in same order as displayed and keep it private & safe.");
  pwarn("You will lose access to all your evidence data and account if you lose this recovery phrase.\n");

  new Table(
    mnemonicWords.slice(0, 4),
    mnemonicWords.slice(4, 8),
    mnemonicWords.slice(8, 12)
  )
    .border()
    .align("center")
    .padding(2)
    .render();

  plog();
  plog(`Your corresponding public address is: ${paint.c.bold(account.address)}`);
  plog(`Head over to opBNB blockchain network to check your account activities: ${paint.b.underline(
    `https://opbnb.bscscan.com/address/${account.address}`
  )}`);
  const privKey = Buffer.from(account.getHdKey().privateKey!).toString("hex");

  plog("\nPlease fund your account with at least 0.001 BNB token and bridge to opBNB to successfully register your account.");
  plog("Once funded and bridged, hit enter to continue....");
  await waitForEnter();

  const spinnies = new Spinnies();
  spinnies.add("register", { text: "Account registration in progress..." });

  await addAccount({
    address: account.address,
    privKey,
    name,
  });

  let tx: `0x${string}`;
  const { client } = await gci();

  try {
    tx = await client.write.registerOwner([name]);
  } catch (err) {
    handleNExit(err);
  }

  const resp = await sendRequest("/owner/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      tx,
    }),
  });

  spinnies.update("register", { text: `Account Registration: ${resp.ok ? paint.g("Successful") : paint.r("Failed")}` });
  spinnies.stopAll();

  if (!resp.ok) {
    perror("Failed to register account on Pramaan-Chain network.");
    pwarn("[RESPONSE]: " + resp.error);
    return;
  }

  pok(resp.message + `\nBlockchain Txn > https://opbnb.bscscan.com/tx/${tx}`);

  const wantToSwitch = await Confirm.prompt({
    message: "Would you like to switch to this account as default?",
    default: false,
  });

  if (wantToSwitch) {
    await switchAccount(account.address);
  }
}
