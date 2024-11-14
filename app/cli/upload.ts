import fs from "fs";
// import { pipeline, Stream } from "stream";
import { Command } from "@cliffy/command";
import { sendRequest } from "../utils/request.js";
import { pwarn } from "../utils/paint.js";

export const uploadCmd = new Command()
  .name("upload-evidence")
  .alias("upl")
  .option("-a, --address <val:string>", "Your account's Public address.")
  .option("-p, --filePath <val:string>", "Your Evidence's file path")
  .description("Upload your evidence with the Pramaan-Chain network.")
  .action(uploadEvidence);

async function uploadEvidence({
  address,
  filePath,
}: {
  address?: string;
  filePath?: string;
}) {
  console.log("Public Address : ", address);
  console.log("Upload evidence at : ", filePath);
  const formData = new FormData();
  if (!filePath) {
    throw new Error("filePath is required");
  }
  const fileBuffer = fs.readFileSync(filePath);
  formData.append("file", new Blob([fileBuffer]));

  const resp = await sendRequest<{
    owner: {
      CreationTx: string;
      Name: string;
    };
  }>("/evidence/upload", {
    method: "POST",
    headers: address ? { "X-Pub-Address": address } : undefined,
    body: formData,
  });

  if (!resp.ok) {
    pwarn(resp.error);
    // await db.delete("/account");
    return;
  }
  console.log(resp.message);
}
