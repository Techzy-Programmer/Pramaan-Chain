import fs from "fs";
import { Command } from "@cliffy/command";
import { sendRequest } from "../utils/request.js";
import { pok, pwarn } from "../utils/paint.js";
import { Input } from "@cliffy/prompt";
import { hashFile } from "../utils/hash.js";
import { gci } from "../utils/general.js";

export const uploadCmd = new Command()
  .name("upload-evidence").alias("upl")
  .option("-p, --filePath <val:string>", "Your Evidence's file path")
  .description("Upload your evidence with the Pramaan-Chain network.")
  .action(uploadEvidence);

async function uploadEvidence({ filePath }: { filePath?: string; }) {
  if (!filePath) {
    filePath = await Input.prompt({
      message: "Enter the file path of the evidence you want to upload",
      minLength: 3,
    });
  }

  const name = await Input.prompt({
    message: "Enter a friendly name for the evidence",
    minLength: 3,
  });

  if (!fs.existsSync(filePath)) {
    pwarn("File not found at the specified path.");
    return;
  }

  const fileExt = "." + filePath.split(".").pop();
  if (!fileExt) {
    pwarn("File with no extension is not supported.");
    return;
  }

  const formData = new FormData();
  const hash = await hashFile(filePath);
  const evidenceBuffer = fs.readFileSync(filePath);
  formData.append("evidence", new Blob([evidenceBuffer]));

  const upResp = await sendRequest("/evidence/upload/0", {
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

  pok(upResp.message);

  const { client } = await gci();
  const tx = await client.write.storeEvidence([hash, name, fileExt]);

  const cnfResp = await sendRequest("/evidence/confirmed/0", {
    method: "POST",

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
