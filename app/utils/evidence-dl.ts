import fs from "fs";
import Spinnies from "spinnies";
import { Stream } from "stream";
import { hashFile } from "./hash.js";
import { sendRequest } from "./api-req.js";
import { pipeline } from "stream/promises";
import { paint, perror, plog } from "./paint.js";

export async function downloadEvidence(
  pubAddr: string,
  evHash: string,
  fullDlPth: string,
  sig: string = ""
): Promise<Boolean> {
  const spinnies = new Spinnies();
  spinnies.add("download", { text: "Downloading evidence..." });

  const dlResp = await sendRequest(`/evidence/download/${evHash}/${pubAddr}`, {
    headers: { "X-Access-Signature": sig }
  }, true);

  spinnies.update("download", {
    text: `Status: ${dlResp.ok ? paint.g("Successful") : paint.r("Failed")}`,
    status: "stopped"
  });

  if (!dlResp.ok || !dlResp.body) {
    perror("Error downloading evidence.");
    return false;
  }

  const dlStream = Stream.Readable.fromWeb(dlResp.body as any);
  const destStream = fs.createWriteStream(fullDlPth);

  await pipeline(dlStream, destStream);
  await verifyEvidenceHash(fullDlPth, evHash);

  return true;
}

async function verifyEvidenceHash(filePath: string, expectedHash: string) {
  const downloadedHash = await hashFile(filePath);

  if (downloadedHash === expectedHash)
    plog(`✔️ ${paint.g.bold("Checksum Verified:")}\n  The evidence is authentic`);
  else perror(`❌ ${paint.r.bold("Checksum Mismatch:")}:\n  The evidence has been tampered with.`);
}
