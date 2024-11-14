import { paint, pdim, perror, plog, pok, pwarn } from "../utils/paint.js";
import { Confirm, Number as Num, Select } from "@cliffy/prompt";
import { sendRequest } from "../utils/request.js";
import { Command } from "@cliffy/command";
import { gci, handleNExit } from "../utils/general.js";

const grantCmd = new Command().name("grant")
  .option("-p, --pub-key <val:string>", "Public address of the user to grant the request to")
  .option("-d, --duration <val:number>", "Duration in seconds for which the access should be granted")
  .description("Grant access to your evidence data to specified user")
  .action(grantRequest);

const sendCmd = new Command().name("send")
  .option("-p, --pub-key <val:string>", "Public address of the owner to send the request to")
  .description("Request access to evidences from specified owner")
  .action(requestAccess);

export const requestCmd = new Command()
  .name("requests").alias("req")
  .description("Send or Grant request to access evidence data")
  .action(handleRequest)
  .command("grant", grantCmd)
  .command("send", sendCmd)

async function handleRequest() {
  pwarn("Please specify a sub-command to perform the request operation.");
  pdim("Use -h flag to see available sub-commands.");
}

async function grantRequest({ pubKey, duration }: { pubKey?: string; duration?: number }) {
  const { client, sig } = await gci();

  if (!pubKey) {
    try {
      const reqs = await client.read.getAllRequests();
      if (!reqs.length) {
        pwarn("No pending requests found.");
        return;
      }

      pubKey = await askForPubKey(reqs);
    } catch (err) {
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
    plog("Exiting...")
    return;
  }

  let tx: `0x${string}`;

  try {
    tx = await client.write.grantAccess([
      pubKey as `0x${string}`,
      await sig(`${duration}`),
      BigInt(duration)
    ]);
  } catch (err) {
    handleNExit(err);
  }

  const resp = await sendRequest("/grant-access", {
    method: "POST",

    body: JSON.stringify({
      msg: duration.toString(),
      subOwnerPubAddr: pubKey,
      tx
    })
  });

  if (!resp.ok) {
    perror(resp.error);
    return;
  }

  pok(resp.message);
}

async function requestAccess({ pubKey }: { pubKey?: string }) {
  if (!pubKey) {
    pwarn("Please specify the public address of the owner whom you want to send the request to.");
    return;
  }

  if (!pubKey.startsWith("0x") || pubKey.length !== 42) {
    perror("Provided public address is invalid");
    return;
  }

  let tx: `0x${string}`;
  const { client } = await gci();

  try {
    tx = await client.write.requestAccess([pubKey as `0x${string}`]);
  } catch (err) {
    handleNExit(err);
  }

  pdim("Request sent successfully");
  plog(`Transaction Hash on opBNB: ${paint.g.bold(tx)}`);
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
