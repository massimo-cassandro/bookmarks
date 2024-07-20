/* eslint-disable no-console */

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


const current_dir = new URL('.', import.meta.url).pathname,
  ff_file = './bookmarks-2024-07-15.json',
  tags_to_include = ['html'],
  exclude_folders = ['lavori', 'blu', 'mazx / primominuto', 'giulia', 'ƒ'];

const ff_json = JSON.parse(fs.readFileSync(path.resolve(current_dir, ff_file), 'utf8'));

const guid = ['menu________', 'tjrmOlmHJnOu']; // tjrmOlmHJnOu = web / `toolbar_____` o `menu________` se presente importa solo la parte con la guid indicata

let result = [];

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

      const current_tags = item.tags?.split(',').map(i => i.toLowerCase().trim()) ?? [];

      result.push(...current_tags);
        
    }
  } // end for
}

if(guid) {
  parse_bookmark_array(ff_json.children.find(i => i.guid === guid[0]).children.find(i => i.guid === guid[1]).children);

} else {

  parse_bookmark_array(ff_json.children);
}



fs.writeFileSync(path.join(current_dir, 'tags.md'), '# Tags\n\n' + result.join('\n'));


console.log('** END **');
