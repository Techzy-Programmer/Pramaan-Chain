import { JsonDB, Config } from 'node-json-db';
import { getAppDataDir } from './general.js';
import { APP_NAME } from './vars.js';

export const db = new JsonDB(
  new Config(`${getAppDataDir(APP_NAME)}/local_db`,
  true,
  true,
  '/'
));

export type DBAccount = {
  address: string;
  privKey: string;
  name: string;
}
