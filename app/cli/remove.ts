import { db, DBAccount, removeAccount } from "../utils/db.js";
import { paint, pwarn } from "../utils/paint.js";
import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt";

export const removeCmd = new Command()
  .name("remove-account").alias("rm")
  .description("Remove an account from the local DB.")
  .action(removeAccountCommand);

async function removeAccountCommand() {
  const allAccs = await db.getObjectDefault<DBAccount[]>("/accounts", []);

  if (allAccs.length === 0) {
    pwarn("No account found in local DB.");
    return;
  }
  const options = allAccs.map(({ name, address }, index) => ({
    name: `${index + 1}. ${paint.c.bold(name)} - (${paint.g(address)})`,
    value: address
  }));

  const selectedAddr = await Select.prompt({
    message: "Select an account to switch to",
    options
  });

  await removeAccount(selectedAddr);
}
