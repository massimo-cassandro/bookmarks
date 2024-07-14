/* eslint-disable no-console */
/* eslint-env node */

// import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

import sqlite3 from 'sqlite3';

sqlite3.verbose();

const current_dir = new URL('.', import.meta.url).pathname;

const db = new sqlite3.Database(path.resolve(current_dir, '../../../db/bookmarks.db'), (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to db.');
});

export default db;
