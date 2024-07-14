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
// import * as url from 'url';

const dir = new URL('.', import.meta.url).pathname;

const ff_file = './bookmarks-2023-06-26.json',
  exclude_folders = ['lavori', 'blu', 'mazx / primominuto', 'giulia', 'ƒ'];

const ff_json = JSON.parse(fs.readFileSync(dir + ff_file, 'utf8'));


const guid = 'toolbar_____'; // `toolbar_____` o `menu________` se presente importa solo la parte con la guid indicata

const bookmarks = [];


function parse_bookmark_array(bookmark_array) {


  // skips items in "exclude_folders" array
  // adds closest folder name as tags except whose containing "____"

  for(let i =0; i<bookmark_array.length; i++) {

    const item = bookmark_array[i];

    if(item.title && (
      (item.hasOwnProperty('children') && exclude_folders.indexOf(item.title) !== -1) ||
      /((:8888)|(:8889))$/.test(item.uri??null) )) {
      continue;
    }

    if( item.hasOwnProperty('children') ) {
      parse_bookmark_array( item.children);

    } else if(item.uri) {
      bookmarks.push(
        `* ${item.title} <${item.uri}> ${item.tags?.split(',')?.map(i => `#${i.trim()}`).join(' ') }`.trim()
      );
    }
  } // end for
}

if(guid) {
  parse_bookmark_array(ff_json.children.find(i => i.guid === guid).children);

} else {

  parse_bookmark_array(ff_json.children);
}

// console.log(bookmarks);

fs.writeFileSync(dir + 'result.md', bookmarks.join('\n'));

console.log('END');
