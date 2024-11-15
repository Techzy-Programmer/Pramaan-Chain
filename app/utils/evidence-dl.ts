import fs from "fs";
import { Stream } from "stream";
import { sendRequest } from "./api-req.js";
import { pipeline } from "stream/promises";

export async function downloadEvidence(pubAddr: string, evHash: string, fullDlPth: string, sig: string = "") {
  const dlResp = await sendRequest(`/evidence/download/${evHash}/${pubAddr}`, {
    headers: { "X-Access-Signature": sig }
  }, true);

  if (!dlResp.ok || !dlResp.body) {
    console.log("Error downloading evidence.");
    return;
  }

  const dlStream = Stream.Readable.fromWeb(dlResp.body as any);
  const destStream = fs.createWriteStream(fullDlPth);

  await pipeline(dlStream, destStream);
}
