/* eslint-disable no-console */
/* eslint-env node */

/*
  firefox bookmarks json file

  {
    "guid": "Y5Mvy7Hzqz39",
    "title": "varie",
    "index": 7,
    "dateAdded": 1609588020907000,
    "lastModified": 1609608674969000,
    "id": 889,
    "typeCode": 2,
    "type": "text/x-moz-place-container",
    "children": [
      {
        "guid": "g82LrDygtg9Z",
        "title": "Hot Door - CADtools",
        "index": 0,
        "dateAdded": 1609588065274000,
        "lastModified": 1609588065274000,
        "id": 894,
        "typeCode": 1,
        "tags": "illustrator",
        "iconuri": "https://www.hotdoor.com/apple-touch-icon.png",
        "type": "text/x-moz-place",
        "uri": "https://www.hotdoor.com/"
      }
    ]
  }

*/
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';
import { usedTags, bookmarks } from './shared-vars.mjs';


// necessaria perché sqlite3 non utilizza le promesse ma solo i callback
// async function runQuery(query, values_array) {
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

export async function import_ff() {


  const current_dir = new URL('.', import.meta.url).pathname,
    ff_file = './bookmarks-2024-07-14.json',
    tags = ['fonts', 'fonts (fonderie)', 'fonts librerie'],
    exclude_folders = ['lavori', 'blu', 'mazx / primominuto', 'giulia', 'ƒ'];

  const ff_json = JSON.parse(fs.readFileSync(path.resolve(current_dir, ff_file), 'utf8'));


  const guid = ['menu________', 'tjrmOlmHJnOu']; // tjrmOlmHJnOu = web / `toolbar_____` o `menu________` se presente importa solo la parte con la guid indicata



  function parse_bookmark_array(bookmark_array) {


    // skips items in "exclude_folders" array
    // adds closest folder name as tags except whose containing "____"

    for(let i =0; i<bookmark_array.length; i++) {

      const item = bookmark_array[i],
        item_has_children_prop = Object.prototype.hasOwnProperty.call(item, 'children');

      if(item.title && (
        (item_has_children_prop && exclude_folders.indexOf(item.title) !== -1) ||
        /((:8888)|(:8889))$/.test(item.uri??null) )) {
        continue;
      }

      if( item_has_children_prop ) {
        parse_bookmark_array( item.children);

      } else if(item.uri) {
        const dateAdded_d = new Date(item.dateAdded / 1000),
          rec_tags_ids = [];

        let isFavorite = 0, isReadingList = 0;

        if(item.tags) {
          const current_tags = item.tags.split(',').map(i => i.toLowerCase().trim());

          current_tags.forEach(t => {
            if(t) {
              if(t === '_preferiti') {
                isFavorite = 1;

              } else if(t === '_reading_list') {
                isReadingList = 1;

              } else {

                let tagIdx = usedTags.indexOf(t);

                if(tagIdx === -1) {
                  usedTags.push(t);
                  rec_tags_ids.push(usedTags.length);

                } else {
                  rec_tags_ids.push(tagIdx + 1);
                }

              }
            }

          });
        }

        // eliminazione query string utm
        let url = new URL(item.uri.trim()),
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
        item.uri = url.toString();

        // controllo se url già presente
        const itemIdx = bookmarks.findIndex(i => i.url === item.uri),
          itemObj = {
            title: item.title,
            date_added: `${dateAdded_d.getFullYear()}-${String(dateAdded_d.getMonth() + 1).padStart(2, '0')}-${String(dateAdded_d.getDay()).padStart(2, '0')} `+
              `${String(dateAdded_d.getHours()).padStart(2, '0')}:${String(dateAdded_d.getMinutes()).padStart(2, '0')}:${String(dateAdded_d.getSeconds()).padStart(2, '0')}`,
            date_updated: null,
            date_visited: null,
            url: item.uri,
            tags: [...new Set(rec_tags_ids)],
            favorite: isFavorite,
            reading_list: isReadingList,
            icon: item.iconUri?? null
          };

        if(itemIdx !== -1) {

          bookmarks[itemIdx] = {
            ...bookmarks[itemIdx],
            ...itemObj,
            tags: [...new Set([...rec_tags_ids, ...bookmarks[itemIdx].tags])],
          };

        } else {

          bookmarks.push(itemObj);
        }

      }
    } // end for
  }

  if(guid) {
    parse_bookmark_array(ff_json.children.find(i => i.guid === guid[0]).children.find(i => i.guid === guid[1]).children);

  } else {

    parse_bookmark_array(ff_json.children);
  }

  console.log('END FF');

}
