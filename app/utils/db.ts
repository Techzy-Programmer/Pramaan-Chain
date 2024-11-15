import { JsonDB, Config } from 'node-json-db';
import { getAppDataDir } from './general.js';
import { APP_NAME } from './vars.js';
import { pwarn } from './paint.js';

export const db = new JsonDB(
  new Config(`${getAppDataDir(APP_NAME)}/local_db`,
  true,
  true,
  '/'
));

export async function getAccount() {
  const defAccIndex = await db.getObjectDefault<number>("/defaultAccount", -1);
  if (defAccIndex === -1) return null;

  return db.getObject<DBAccount>(`/accounts[${defAccIndex}]`);
}

export async function addAccount(account: DBAccount) {
  await db.push("/accounts[]", account);

  const defAccIndex = await db.getObjectDefault<number>("/defaultAccount", -1);
  if (defAccIndex === -1) await db.push("/defaultAccount", 0);
  
  return await db.count("/accounts") - 1;
}

export function getDefaultAccountIndex() {
  return db.getObjectDefault<number>("/defaultAccount", -1);
}

export async function switchAccount(address: string) {
  const i = await db.getIndex("/accounts", address, "address");
  if (i === -1) {
    pwarn("Account with provided id not found in local db");
    return;
  }

  await db.push("/defaultAccount", i);
}

export async function removeAccount(address: string) {
  const i = await db.getIndex("/accounts", address, "address");
  if (i === -1) {
    return;
  }

  await db.delete(`/accounts[${i}]`);
  if (await db.count("/accounts") === 0) {
    await db.push("/defaultAccount", -1);
    return;
  }

  const defAccIndex = await db.getObjectDefault<number>("/defaultAccount", -1);
  if (defAccIndex > i) await db.push("/defaultAccount", defAccIndex - 1);
  else if (defAccIndex === i) await db.push("/defaultAccount", 0);
}

export type DBAccount = {
  address: string;
  privKey: string;
  name: string;
}
