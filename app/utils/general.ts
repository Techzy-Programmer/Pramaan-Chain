import os from "os";
import path from "node:path";
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
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
