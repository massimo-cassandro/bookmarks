/* eslint-disable no-console */
/* eslint-env node */
import { URL } from 'url';
import * as fs from 'fs';
import * as path from 'path';

import db from './db-connect.mjs';

import { usedTags, usedCollections, bookmarks } from './shared-vars.mjs';


// https://github.com/TryGhost/node-sqlite3/wiki/API
// https://www.scriptol.com/sql/sqlite-async-await.php
// https://www.sqlitetutorial.net/sqlite-nodejs/

// async function saveRecord(query, values_array) {
//   return new Promise(function(resolve, reject) {
//     db.run(query, values_array,
//       function(err)  {
//         if(err) {
//           reject(err.message);
//         } else {
//           resolve(this.lastID?? true);
//         }
//       });
//   });
// }

// // first row read
// async function getRecord(query, params) {
//   return new Promise(function(resolve, reject) {
//     db.get(query, params, function(err, row)  {
//       if(err) {
//         reject('Read error: ' + err.message);
//       } else {
//         resolve(row);
//       }
//     });
//   });
// }


export async function saveToDB() {

  const current_dir = new URL('.', import.meta.url).pathname;

  // tabelle uno a molti
  const collection_bookmarks = [], bookmark_tags = [];
  bookmarks.forEach((item, idx) => {

    const recId = idx + 1;
    bookmarks[idx].id = recId;

    if(item.collection) {
      collection_bookmarks.push([recId, item.collection]);
    }

    if(item.tags.length) {
      [...new Set(item.tags)].forEach(tag => {
        bookmark_tags.push([recId, tag]);
      });
    }
  });


  db.serialize(() => {
    db.run('INSERT INTO collections (collection) VALUES ' + Array(usedCollections.length).fill('(?)').join(','),
      usedCollections,
      function(err) {
        if(err) {
          console.error(err.message);
        } else {

          console.log(`collections - rows inserted: ${this.changes}`);
        }
      });

    db.run('INSERT INTO tags (tag) VALUES ' + Array(usedTags.length).fill('(?)').join(','),
      usedTags,
      function(err) {
        if(err) {
          console.error(err.message);
        } else {

          console.log(`tags - rows inserted: ${this.changes}`);
        }

      });

    db.run('INSERT INTO bookmarks (id, title, url, icon, favorite, reading_list, date_added, date_visited, date_updated) VALUES ' + Array(bookmarks.length).fill('(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(','),
      bookmarks.map(r => [r.id, r.title??null, r.url, r.icon??null, r.favorite?? 0, r.reading_list?? 0, r.date_added??null, r.date_visited??null, r.date_updated??null]).flat(),
      function(err) {
        if(err) {
          console.error(err.message);
        } else {
          console.log(`bookmarks - rows inserted: ${this.changes}`);
        }
      });

    db.run('INSERT INTO collection_bookmarks (bookmark_id, collection_id) VALUES ' + Array(collection_bookmarks.length).fill('(?, ?)').join(','),
      collection_bookmarks.flat(),
      function(err) {
        if(err) {
          console.error(err.message);
        } else {
          console.log(`collection_bookmarks - rows inserted: ${this.changes}`);
        }
      });

    db.run('INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES ' + Array(bookmark_tags.length).fill('(?, ?)').join(','),
      bookmark_tags.flat(),
      function(err) {
        if(err) {
          console.error(err.message);
        } else {
          console.log(`bookmark_tags - rows inserted: ${this.changes}`);
        }
      });

  });

  fs.writeFileSync(path.resolve(current_dir, '../result_bookmarks.json'), JSON.stringify(bookmarks, null, ' '));
  console.log('******\nbookmarks: ' + bookmarks.length + '\n**********');

  // console.log(bookmarks.filter(rec => rec.tags.length === 0));
  // console.log(bookmarks);
  // console.log(usedCollections);
  // console.log(usedTags);


  console.log('** END **');
}
