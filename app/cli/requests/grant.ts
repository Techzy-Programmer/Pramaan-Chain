import { Command } from "@cliffy/command";
import { sendRequest } from "../../utils/api-req.js";
import { gci, handleNExit } from "../../utils/general.js";
import { Confirm, Select, Number as Num } from "@cliffy/prompt";
import { pwarn, perror, plog, paint, pok, pdim } from "../../utils/paint.js";
import Spinnies from "spinnies";

export const grantCmd = new Command().name("grant")
  .option("-p, --pub-key <val:string>", "Public address of the user to grant the request to")
  .option("-d, --duration <val:number>", "Duration in seconds for which the access should be granted")
  .description("Grant access to your evidence data to specified user")
  .action(grantRequest);

async function grantRequest({ pubKey, duration }: { pubKey?: string; duration?: number }) {
  const { client, sig } = await gci();
  const spinnies = new Spinnies();

  if (!pubKey) {
    try {
      spinnies.add("reqs", { text: "Fetching pending requests..." });
      const reqs = await client.read.getAllRequests();

      spinnies.stopAll();
      spinnies.remove("reqs");

      if (!reqs.length) {
        pwarn("No pending requests found.");
        return;
      }
  
      pubKey = await askForPubKey(reqs);
    } catch (err) {
      spinnies.stopAll();
      handleNExit(err);
    }
  }

  if (!pubKey.startsWith("0x") || pubKey.length !== 42) {
    perror("Provided public address is invalid");
    return;
  }

  if (!duration) {
    duration = await Num.prompt({
      message: "Enter access duration in seconds",
      min: 1
    })
  }
  
  plog()
  plog("Read carefully and acknowledge to continue")
  plog(`${paint.c("You are about to grant access to all your evidence data")}
  ${paint.w.dim("Here is the detail for access control")}
    Requester: ${paint.g.bold(pubKey)}
    Access Duration: ${paint.r.bold(duration.toString() + " second(s)")}
  ${paint.y.bold("Warning:")} ${paint.w.dim("You won't be able to revoke access once granted")}\n`)
  const confirmed = await Confirm.prompt("Are you absolutely sure to continue?")

  if (!confirmed) {
    pdim("Aborting operation...")
    return;
  }

  let expiryTs: bigint;
  let tx: `0x${string}`;
  spinnies.add("grant", { text: "Granting access to the user..." });

  try {
    const tsNow = await client.read.getTimestamp();
    expiryTs = tsNow + BigInt(duration);

    tx = await client.write.grantAccess([
      pubKey as `0x${string}`,
      await sig(`${expiryTs}`),
      BigInt(expiryTs)
    ]);
  } catch (err) {
    spinnies.stopAll();
    handleNExit(err);
  }

  const resp = await sendRequest("/grant-access", {
    method: "POST",

    body: JSON.stringify({
      accessTS: Number(expiryTs),
      subOwnerPubAddr: pubKey,
      tx
    })
  });

  spinnies.update("grant", {
    text: `Access Grant: ${resp.ok ? paint.g("Successful") : paint.r("Failed")}`,
    status: "stopped"
  });

  if (!resp.ok) {
    perror(resp.error);
    return;
  }

  plog();
  pok(resp.message);
}

async function askForPubKey(reqs: ReqsType) {
  const options = reqs.map(({ requester, name, timestamp }, index) => ({
    name: `${index + 1}. ${paint.c.bold(name)} (${paint.g.underline(requester)}) - ${paint
      .w.dim(new Date(Number(`${timestamp}000`)).toLocaleString())}`,
    value: requester
  }));

  return await Select.prompt({
    message: "Select a request to grant access",
    options
  });
}

type ReqsType = readonly {
  requester: `0x${string}`;
  timestamp: bigint;
  name: string;
}[]
