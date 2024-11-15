import fs from 'fs';
import path from 'path';
import { paint } from './paint.js';
import { Select } from "@cliffy/prompt";

type FSOption = {
  promptMessage: string;
  startPath?: string;
  onlyDirs?: boolean;
};

const selDirTxt = `👉 ${paint.m.bold("Select This Directory")}`

export async function fsPicker({ promptMessage, startPath = process.cwd(), onlyDirs = false }: FSOption): Promise<string> {
  let currentPath = path.resolve(startPath);

  while (true) {
    console.clear();
    const fileTree = await getFileTree(currentPath, onlyDirs);

    const options = [
      onlyDirs ? { name: selDirTxt, value: currentPath, isDirectory: true } : null,
      currentPath !== path.parse(currentPath).root
        ? { name: `🔙 ${paint.b.bold("Go Back")}`, value: path.dirname(currentPath), isDirectory: true }
        : null,
      ...fileTree
    ].filter(Boolean);

    const selected = await Select.prompt({
      options: options.map(option => option.name),
      message: promptMessage,
    });

    const choice = options.find(option => option.name === selected);
    if (!choice) continue;

    if (choice.isDirectory) {
      if (choice.name === selDirTxt) {
        return choice.value;
      }

      currentPath = choice.value;
    }
    else return choice.value;
  }
}

async function getFileTree(dirPath: string, onlyDirs = false): Promise<any[]> {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

  const directories = entries
    .filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const files = onlyDirs
    ? []
    : entries
        .filter(entry => entry.isFile())
        .sort((a, b) => a.name.localeCompare(b.name));

  const options = directories.map(dir => ({
    value: path.join(dirPath, dir.name),
    name: `📁 ${dir.name}`,
    isDirectory: true,
  })).concat(files.map(file => ({
    value: path.join(dirPath, file.name),
    name: `📄 ${file.name}`,
    isDirectory: false,
  })));

  return options;
}
