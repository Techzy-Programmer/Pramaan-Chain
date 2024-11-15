import os from "os";
import path from "node:path";
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { BaseError, ContractFunctionRevertedError } from "viem";
import { getInstance, signMessage } from "../contract/init.js";
import { paint, perror, plog } from "./paint.js";
import { mkdirSync, statSync } from "node:fs";
import { colors } from "@cliffy/ansi/colors";
import { APP_NAME } from "./vars.js";

export function init() {
  console.log(colors.brightMagenta.bold(`${APP_NAME}\n`));
  const dataDir = getAppDataDir(APP_NAME);
  
  try {
    const dataDirStat = statSync(dataDir);

    if (!dataDirStat.isDirectory()) {
      mkdirSync(dataDir);
    }
  } catch {
    mkdirSync(dataDir);
  }
}

export async function gci() { // get contract instance
  return ({
    client: await getInstance(),
    sig: signMessage
  })
}

export async function waitForEnter() {
  const rl = readline.createInterface({ input, output });
  await rl.question('');
  rl.close();
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getAppDataDir(appName: string): string {
  let appDataPath: string;

  if (process.platform === 'win32') {
    appDataPath = process.env.APPDATA || process.env.LOCALAPPDATA || "";
  }
  else if (process.platform === 'darwin') {
    appDataPath = path.join(os.homedir(), 'Library', 'Application Support');
  }
  else if (process.platform === 'linux') {
    appDataPath = path.join(os.homedir(), '.config');
  } else {
    throw new Error('Unsupported platform!');
  }

  return path.join(appDataPath, appName);
}

export function handleNExit(err: unknown): never {
  if (!(err instanceof BaseError)) {
    perror("An unexpected error occurred!");
    process.exit(1);
  }

  const revertError = err.walk(err => err instanceof ContractFunctionRevertedError);
  if (!(revertError instanceof ContractFunctionRevertedError)) {
    perror(err.message);
    process.exit(1);
  }

  const { shortMessage, name } = revertError;

  plog(`${paint.r(`Error (${name}):`)}
  ${paint.r.bold(shortMessage.replace(/\n/g, "\n  "))}\n`);
  process.exit(1);
}

export function formatBytes(bytes: number | bigint) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(Number(bytes)) / Math.log(k));
  const formattedSize = parseFloat((Number(bytes) / Math.pow(k, i)).toFixed(2));

  return `${formattedSize} ${sizes[i]}`;
}
