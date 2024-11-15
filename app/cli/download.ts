import fs from "fs";
import { Command } from "@cliffy/command";
import { sendRequest } from "../utils/request.js";
import { pwarn, pinfo, perror } from "../utils/paint.js";

export const downloadCmd = new Command()
  .name("download-evidence")
  .alias("dwn")
  .option("-a, --address <val:string>", "Your account's Public address.")
  .option(
    "-e, --evidenceHash <val:string>",
    "The SHA-512 hash of the evidence."
  )
  .option(
    "-m, --masterAddress <val:string>",
    "The master's public address for the evidence owner."
  )
  .option(
    "-o, --output <val:string>",
    "The output file path to save the downloaded evidence."
  )
  .description("Download your evidence file from the Pramaan-Chain network.")
  .action(downloadEvidence);

async function downloadEvidence({
  address,
  evidenceHash,
  masterAddress,
  output,
}: {
  address?: string;
  evidenceHash?: string;
  masterAddress?: string;
  output?: string;
}) {
  if (!address || !evidenceHash || !masterAddress || !output) {
    pwarn(
      "Public address, evidence hash, master address, and output path are required."
    );
    return;
  }

  console.log("Public Address:", address);
  console.log("Evidence Hash:", evidenceHash);
  console.log("Master Address:", masterAddress);
  console.log("Output File Path:", output);
  console.log(
    evidenceHash.length !== 128 && perror("Invalid evidence hash length.")
  );
  console.log(evidenceHash.length);
  const resp = await sendRequest<Blob>(
    "/evidence/download/" + evidenceHash + "/" + masterAddress,
    {
      method: "GET",
      headers: {
        "X-Pub-Address": address,
      },
    }
  );

  if (!resp.ok) {
    console.log("Error: ", resp.error);
    return;
  }

  // Convert Blob to ReadableStream for file writing
  const fileStream = fs.createWriteStream(output);

  // If the response is a Blob, convert it to a buffer and write it to the file
  if (resp instanceof Blob) {
    const buffer = Buffer.from(await resp.arrayBuffer());
    fileStream.write(buffer);
    fileStream.close();
    pinfo("Evidence downloaded successfully to: " + output);
  } else {
    console.log("Unexpected response format.");
  }
}
