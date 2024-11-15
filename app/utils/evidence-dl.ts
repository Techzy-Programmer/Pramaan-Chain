import fs from "fs";
import { Stream } from "stream";
import { sendRequest } from "./api-req.js";
import { pipeline } from "stream/promises";
import { perror, pok } from "./paint.js";
import { hashFile } from "./hash.js";

export async function downloadEvidence(
  pubAddr: string,
  evHash: string,
  fullDlPth: string,
  sig: string = ""
) {
  const dlResp = await sendRequest(
    `/evidence/download/${evHash}/${pubAddr}`,
    {
      headers: { "X-Access-Signature": sig },
    },
    true
  );

  if (!dlResp.ok || !dlResp.body) {
    perror("Error downloading evidence.");
    return;
  }

  const dlStream = Stream.Readable.fromWeb(dlResp.body as any);
  const destStream = fs.createWriteStream(fullDlPth);

  await pipeline(dlStream, destStream);
}

export async function verifyEvidenceHash(
  filePath: string,
  expectedHash: string
) {
  const downloadedHash = await hashFile(filePath);

  if (downloadedHash === expectedHash) {
    pok("Verification successful: The evidence is untampered.");
  } else {
    perror("Verification failed: The evidence may have been tampered with.");
  }
}