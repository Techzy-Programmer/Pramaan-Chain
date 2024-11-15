import fs from "fs";
import { Input } from "@cliffy/prompt";
import { Command } from "@cliffy/command";
import { hashFile } from "../../utils/hash.js";
import { sendRequest } from "../../utils/api-req.js";
import { plog, pok, pwarn } from "../../utils/paint.js";
import { delay, gci, handleNExit } from "../../utils/general.js";
import { fsPicker } from "../../utils/fs-picker.js";

export const uploadCmd = new Command()
  .name("upload").alias("up")
  .option("-p, --filePath <val:string>", "Your Evidence's file path")
  .option("-n, --name <val:string>", "Friendly name for your evidence")
  .description("Upload your evidence with the Pramaan-Chain network.")
  .action(uploadEvidence);

async function uploadEvidence({ filePath, name }: { filePath?: string; name?: string }) {
  if (!filePath) {
    filePath = await fsPicker({
      promptMessage: "Select the file you want to upload",
    });
  }

  if (!name) {
    name = await Input.prompt({
      message: "Enter a friendly name for your evidence",
      minLength: 1,
    });
  }

  const fileExt = "." + filePath.split(".").pop();
  if (!fileExt) {
    pwarn("File with no extension is not supported.");
    return;
  }

  const formData = new FormData();
  const hash = await hashFile(filePath);
  const fileSize = fs.lstatSync(filePath).size;
  const evidenceBuffer = fs.readFileSync(filePath);
  formData.append("evidence", new Blob([evidenceBuffer]));

  const upResp = await sendRequest("/evidence/upload", {
    method: "POST",
    body: formData,

    headers: {
      "X-Evidence-Extension": fileExt,
      "X-Evidence-Hash": hash,
    },
  });

  if (!upResp.ok) {
    pwarn(upResp.error);
    return;
  }

  plog();
  pok(upResp.message);

  let tx: string, index: number;
  const { client } = await gci();

  try {
    await delay(2000);
    index = Number(await client.read.getEvidenceIndex());
    tx = await client.write.storeEvidence([hash, name, fileExt, BigInt(fileSize)]);
  } catch (err) {
    handleNExit(err);
  }

  const cnfResp = await sendRequest(`/evidence/confirmed/${index}`, {
    headers: {
      "X-Evidence-Creation-Tx": tx,
      "X-Evidence-Hash": hash,
    },
  });

  if (!cnfResp.ok) {
    pwarn(cnfResp.error);
    return;
  }

  pok(cnfResp.message);
}