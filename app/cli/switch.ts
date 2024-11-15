import { db, DBAccount, getDefaultAccountIndex, switchAccount } from "../utils/db.js";
import { paint, pinfo, pwarn } from "../utils/paint.js";
import { Command } from "@cliffy/command";
import { Select } from "@cliffy/prompt";

export const switchCmd = new Command()
  .name("switch-account").alias("sw")
  .description("Switch between multiple accounts.")
  .action(switchAccountCommand);

async function switchAccountCommand() {
  const allAccs = await db.getObjectDefault<DBAccount[]>("/accounts", []);

  if (allAccs.length === 0) {
    pwarn("No account found in local DB.");
    return;
  }

  if (allAccs.length === 1) {
    pinfo("Only one account found in local DB.");
    return;
  }

  const currAccIndex = await getDefaultAccountIndex();

  const options = allAccs.map(({ name, address }, index) => ({
    name: `${index + 1}. ${paint.c.bold(name)} - (${paint.g(address)})`,
    disabled: index === currAccIndex,
    value: address
  }));

  const selectedAddr = await Select.prompt({
    message: "Select an account to switch to",
    options
  });

  await switchAccount(selectedAddr);
}
