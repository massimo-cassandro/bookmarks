/* eslint-disable no-console */
/* eslint-env node */

import db from './src/db-connect.mjs';
import {eraseDb} from './src/erase-db.mjs';
import { import_markdown } from './src/import-markdown.mjs';
import { import_ff } from './src/import-firefox-bookmarks.mjs';
import { saveToDB } from './src/save-to.db.mjs';


await eraseDb();
import_markdown();
import_ff();
await saveToDB();

db.close();

console.log('end');
