import { db, DBAccount } from "./db.js";

const baseUrl = 'https://api.pramaan-chain.tech';

type Resp<T extends Object = {}> = 
  | (T & { message: string; ok: true })
  | { error: string; ok: false };

export async function sendRequest<T extends Object = {}>(
  path: string,
  options: RequestInit = {}
): Promise<Resp<T>> {
  if (!await db.exists("/account")) {
    throw new Error(
      "Account not found, please setup your account using CLI. Try `pch -h` for help."
    );
  }

  const { signMessage } = await import("../contract/init.js");
  const { address } = await db.getObject<DBAccount>("/account");
  const signature = await signMessage("Authorize Me!");

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    
    headers: {
      ...options.headers,
      "X-Signature": signature,
      "X-Pub-Address": address,
    },
  });

  return {
    ...(await res.json()),
    ok: res.ok,
  };
}
