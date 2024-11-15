import Spinnies from "spinnies";
import { getAccount } from "./utils/db.js";
import { getBalance } from "./contract/init.js";
import { paint, pdim, perror, plog, pwarn } from "./utils/paint.js";

export async function baseCommand() {
  const activeAcc = await getAccount();

  if (!activeAcc) {
    renderHelp();
    return;
  }

  const { name, address } = activeAcc;
  const spinnies = new Spinnies();

  plog(`Welcome, ${paint.w.bold(name)}`);
  pdim("Here's the detail of your account\n");
  plog(`Address: ${paint.g.bold(address)}`);
  spinnies.add("fetch", { text: "Fetching your account balance..." });

  try {
    const bal = await getBalance(address);
    plog(`Your Account Balance: ${paint.g.bold(bal + " BNB")}`);
  } catch (err) {
    perror("\nFailed to fetch your account balance.");
    pwarn("Check your internet connection and try again.");
    return;
  } finally {
    spinnies.remove("fetch");
    spinnies.stopAll();
  }

  plog(`\nLooking for available commands? Try ${paint.c.bold("pch --help")}`);
}

function renderHelp() {
  const lines = [
    "Welcome to Pramaan-Chain",
    paint.c("A CLI to securely preserve digital evidences."),
    `${paint.y("Note:")} ${paint.w.dim("You have not configured any account yet.")}`,
    " ",
    "To configure a new account:",
    `  > ${paint.g.bold("pch setup-account")}`,
    "To recover an existing account:",
    `  > ${paint.g.bold("pch recover-account")}`,
    "To see all available commands and help menu:",
    `  > ${paint.g.bold("pch --help")}`,
  ];

  plog(lines.join("\n"));
}
