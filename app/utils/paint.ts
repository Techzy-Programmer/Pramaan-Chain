import { colors } from "@cliffy/ansi/colors";

export function pinfo(msg: string) {
  console.log(colors.brightBlue(msg));
}

export function pwarn(msg: string) {
  console.log(colors.brightYellow(msg));
}

export function perror(msg: string) {
  console.log(colors.brightRed(msg));
}

export function pok(msg: string) {
  console.log(colors.brightGreen(msg));
}

export function pdim(msg: string) {
  console.log(colors.dim(msg));
}

export function plog(...msg: string[]) {
  console.log(...msg);
}

export const paint = {
  m: colors.magenta,
  y: colors.yellow,
  g: colors.green,
  w: colors.white,
  k: colors.black,
  b: colors.blue,
  c: colors.cyan,
  r: colors.red,
};
