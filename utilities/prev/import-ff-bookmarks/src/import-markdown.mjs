/* eslint-disable no-console */
/* eslint-env node */

/*
  Elabora il file bookmarks.md

  il file è suddiviso in sezioni indicate da
    `## __nome_sezione__`

  Ogni record ha questa struttura

    `* __titolo__ <__url__> #tag1, #tag2...

  Il simbolo `🟡` se presente, indica che si tratta di un preferito

  Se il nome della szione è di un solo carattere, viene aggiunta anche come tag
  e viene utilizzata come nome della collection

*/

// https://github.com/TryGhost/node-sqlite3/wiki/API
// https://www.scriptol.com/sql/sqlite-async-await.php
// https://www.sqlitetutorial.net/sqlite-nodejs/

import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import { usedTags, usedCollections, bookmarks } from './shared-vars.mjs';


export function import_markdown() {


  const current_dir = new URL('.', import.meta.url).pathname,
    md_file = path.resolve(current_dir, '../../../../bookmarks-tmp/bookmarks.md'),
    oggi = new Date(),
    content = fs.readFileSync(md_file, 'utf8').split('\n')
      .map(row => row.trim())
      .filter((row, idx) => row !== '' && idx > 0);

  let currentCollectionID = null,
    addToTags = null;

  content.forEach(row => {
    // console.log(row);

    // collection
    if(/^##/.test(row)) {

      const currentCollection = row.replace('##', '').trim();

      if(usedCollections.indexOf(currentCollection) === -1) {
        usedCollections.push(currentCollection);
      }

      currentCollectionID = usedCollections.findIndex(c => c === currentCollection) + 1;
      // console.log('currentCollection:', currentCollectionID, currentCollection);

      // se la collezione è di una sola parola, viene anche aggiunta come tag
      addToTags = currentCollection.indexOf(' ') === -1? currentCollection.toLowerCase() : null;

    // row
    } else {


      const thisrec = {},
        row_parts = row.match(/^\* ?(?<title>.*?) ?<(?<url>.*?)> *(?:#(?<tags>.*))?/),
        tags = row_parts.groups?.tags? row_parts.groups.tags.split('#').map(t => t.trim().toLowerCase()) : [];


      if(addToTags && tags.indexOf(addToTags) === -1) {
        tags.push(addToTags);
      }

      thisrec.favorite = Number(/🟡/.test(row_parts.groups.title));

      thisrec.title = row_parts.groups.title?.replace('🟡', '')?.trim() || null;

      let url = new URL(row_parts.groups.url.trim()),
        searchParams = url.searchParams;

      // necessario fare la cancellazione delle chiavi in due passaggi
      const keysToDelete = [];
      for (const key of searchParams.keys()) {
        if (/^utm_/.test(key)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(k => searchParams.delete(k));
      url.search = searchParams.toString();
      thisrec.url = url.toString();

      thisrec.tags = [];

      if(!thisrec.url) {
        console.log('******************\n'+row+'\n******************');
      }

      tags.forEach(tag => {
        let tagid = usedTags.indexOf(tag);

        if(tagid === -1) {
          usedTags.push(tag);
          thisrec.tags.push(usedTags.length);
        } else {
          thisrec.tags.push(tagid + 1);
        }

      });

      // controllo esistenza url
      // se esiste vengono solo aggiunte eventuali tag diverse
      const existingUrlIdx = bookmarks.findIndex(r => r.url === thisrec.url );


      if(existingUrlIdx !== -1) {
        if(!bookmarks[existingUrlIdx].title) {
          bookmarks[existingUrlIdx].title = thisrec.title;
        }
        bookmarks[existingUrlIdx].tags = [...new Set(bookmarks[existingUrlIdx].tags.concat(thisrec.tags))];

      } else {
        bookmarks.push({
          ...thisrec,
          date_added: `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, '0')}-${String(oggi.getDay()).padStart(2, '0')} `+
          '00:00:00',
          date_updated: null,
          date_visited: null,
          collection: currentCollectionID
        });

      }

    } //end if

  }); // end foreach


  console.log('END MD');

}
