// Download a video file

import fs from "fs";
// import { pipeline, Stream } from "stream";
import { Command } from "@cliffy/command";
import { sendRequest } from "../utils/request.js";
import { pipeline, Stream } from "stream";

export const downloadCmd = new Command()
  .name("download-evidence")
  .alias("dnd")
  .option("-b, --blobName <val:string>", "Your Blob Name.")
  .option("-a, --address <val:string>", "Your account's Public address.")
  .option("-p, --filePath <val:string>", "Your Evidence's file path")
  .description("Upload your evidence with the Pramaan-Chain network.")
  .action(({ blobName, filePath, address }) =>
    downloadEvidence(blobName, filePath, address)
  );

async function downloadEvidence(
  blobName?: string,
  downloadPath?: string,
  address?: string | undefined
): Promise<void> {
  try {
    const response = await sendRequest(
      `/evidence/download?blobName=${blobName}`,
      {
        headers: {
          "X-Pub-Address": address || "",
        },
        method: "GET",
      }
    );

    if (response.ok) {
      if (!downloadPath) {
        throw new Error("Download path is not defined");
      }
      const destStream = fs.createWriteStream(downloadPath);
      const readableStream = Stream.Readable.fromWeb(response.message as any);

      pipeline(readableStream, destStream, (err) => {
        if (err) {
          console.error("Pipeline failed:", err);
        } else {
          console.log("Download complete");
        }
      });
    } else {
      const data = response.error;
      console.log("Download failed:", data);
    }
  } catch (err) {
    console.error("Error during download:", err);
  }
}
