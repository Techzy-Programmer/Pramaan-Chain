import fs from "fs";
import { Stream } from "stream";
import { sendRequest } from "./api-req.js";
import { pipeline } from "stream/promises";
import { paint, perror } from "./paint.js";
import Spinnies from "spinnies";

export async function downloadEvidence(pubAddr: string, evHash: string, fullDlPth: string, sig: string = "") {
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
    return;
  }

  const dlStream = Stream.Readable.fromWeb(dlResp.body as any);
  const destStream = fs.createWriteStream(fullDlPth);

  await pipeline(dlStream, destStream);
  // ToDo: Add file hash verification
}
