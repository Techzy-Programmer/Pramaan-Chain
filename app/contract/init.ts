import { createWalletClient, getContract, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { opBNB, opBNBTestnet } from "viem/chains";
import { db, DBAccount } from "../utils/db.js";
import { abi } from "../abi.js";

const IS_PROD = false;
const CONTRACT_ADDRESS = "0x519C71569241F25317f9C6fdfA6DB61587fe855B";

const pchWallet = createWalletClient({
  chain: IS_PROD ? opBNB : opBNBTestnet,
  account: await geAccount(),
  transport: http()
}).extend(publicActions);

async function geAccount() {
  if (!await db.exists("/account")) {
    throw new Error("No account found in local DB.");
  }

  const acc = await db.getObject<DBAccount>("/account");
  return privateKeyToAccount(`0x${acc.privKey}`);
}

export const pchContract = getContract({
  address: CONTRACT_ADDRESS,
  client: pchWallet,
  abi
});

export function signMessage(msg: string) {
  return pchWallet.signMessage({ message: msg });
}
