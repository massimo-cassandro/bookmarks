/* eslint-disable no-console */
/* eslint-env node */

import db from './db-connect.mjs';


export async function eraseDb() {

  const queries = [
    'delete from bookmark_tags;',
    'delete from collection_bookmarks;',
    'delete from bookmarks;',
    'delete from tags;',
    'delete from collections;',
    'UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME=\'bookmarks\'',
    'UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME=\'tags\'',
    'UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME=\'collections\''
  ];

  queries.forEach(q => {
    db.run(q);
  });

}
