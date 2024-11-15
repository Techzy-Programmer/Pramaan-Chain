import { createWalletClient, formatEther, getContract, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { opBNB, opBNBTestnet } from "viem/chains";
import { db, getAccount } from "../utils/db.js";
import { abi } from "../abi.js";

const IS_PROD = false;
const CONTRACT_ADDRESS = "0x519C71569241F25317f9C6fdfA6DB61587fe855B";

async function geAccount() {
  await db.reload();
  const acc = await getAccount();
  
  if (!acc) {
    throw new Error("No account found in local DB.");
  }

  return privateKeyToAccount(`0x${acc.privKey}`);
}

async function getWalletClient() {
  return createWalletClient({
    chain: IS_PROD ? opBNB : opBNBTestnet,
    account: await geAccount(),
    transport: http()
  }).extend(publicActions);
}

export async function getInstance() {
  return getContract({
    client: await getWalletClient(),
    address: CONTRACT_ADDRESS,
    abi
  });
};

export async function signMessage(msg: string) {
  return (
    (await getWalletClient())
      .signMessage({ message: msg })
  );
}

export async function getBalance(addr: `0x${string}`) {
  const wc = (await getWalletClient());
  
  return formatEther(
    await wc.getBalance({ address: addr })
  );
}
