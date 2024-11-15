import { getAccount } from "./db.js";

const baseUrl = 'https://api.pramaan-chain.tech';

type Resp<T extends Object = {}> = 
  | { error: string; ok: false }
  | (T & { message: string; body?: ReadableStream; ok: true })

export async function sendRequest<T extends Object = {}>(
  path: string,
  options: RequestInit = {},
  rawBody: boolean = false
): Promise<Resp<T>> {
  const acc = await getAccount();
  if (!acc) {
    throw new Error(
      "Account not found, please setup your account using CLI. Try `pch -h` for help."
    );
  }

  const { signMessage } = await import("../contract/init.js");
  const signature = await signMessage("Authorize Me!");
  const { address } = acc;

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    
    headers: {
      ...options.headers,
      "X-Signature": signature,
      "X-Pub-Address": address,
    },
  });

  if (rawBody && res.ok) {
    return {
      ok: true,
      ...({} as T),
      message: res.statusText,
      body: res.body as ReadableStream,
    };
  }

  return {
    ...(await res.json()),
    ok: res.ok,
  }
}
