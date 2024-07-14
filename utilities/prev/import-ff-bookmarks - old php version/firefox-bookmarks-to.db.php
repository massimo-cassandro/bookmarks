<?php
/*
  Import firefox bookmarks json file

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

// TODO -> parts tag

require_once '../public/php/init.php';
$json_file = 'bookmarks-2023-06-26.json';
$json_data = json_decode(file_get_contents($json_file), true);

$guid = "menu________"; // `toolbar_____` o `menu________` se presente importa solo la parte con la guid indicata


function normalize_string($string) {
  return strtolower(trim($string));
}


function add_tags($tag_array) {
  global $db;
  $tag_array = array_unique( array_map('normalize_string', $tag_array));

  // check tags, add them if necessary and return ids
  $tags_id = array();

  foreach ($tag_array as $tag) {
    if($tag) {
      $q = "select id from tags where tag like :tag";
      $statement = $db->prepare($q);
      $statement->bindValue(':tag', $tag);
      $result = $statement->execute();
      $row = $result->fetchArray(SQLITE3_ASSOC);

      if($row) {
        $tags_id[] = $row['id'];

      } else {
        $q = "INSERT INTO tags (tag) VALUES (:tag);";
        $statement = $db->prepare($q);
        $statement->bindValue(':tag', $tag);
        $result = $statement->execute();

        $tags_id[] = $db->querySingle("SELECT last_insert_rowid() as last_id;");
      }
    }
  }

  return $tags_id;
}

function add_bookmark($item, $folder_tag) {
  global $db;


  // search for bookmark uri in db, if it not exists, it will be added
  // otherwise only tags are added (if they exists)
  $q = "select id as bookmark_id from (bookmarks) where url like '{$item['uri']}'";

  $statement = $db->prepare($q);
  // $statement->bindValue(':uri', $item['uri']);
  $result = $statement->execute();
  $row = $result->fetchArray(SQLITE3_ASSOC);

  $tags = array();
  if( array_key_exists('tags', $item) ) {
    $tags = explode(',', $item['tags']);
  }
  if($folder_tag) {
    $tags[] = $folder_tag;
  }


  if(in_array('_preferiti', $tags)) {
    $is_favorite = 1;
  }
  $tags = array_filter($tags, static function ($item) {
    return $item !== "_preferiti";
  });


  $tags_id = add_tags($tags);

  if(!$row) {

    $q = "INSERT INTO bookmarks (
          title,
          url,
          favicon_url,
          favorite,
          date_added
      )
      VALUES (
          :title,
          :url,
          :icon,
          :fav,
          :date_added
      );";

    $statement = $db->prepare($q);
    $statement->bindValue(':title', $item['title']);
    $statement->bindValue(':url', $item['uri']);
    $statement->bindValue(':icon',
    array_key_exists('iconuri', $item) ? $item['iconuri'] : null);
    $statement->bindValue(':fav', $is_favorite);
    $statement->bindValue(':date_added', date('Y-m-d H:i:s', $item['dateAdded']/1000000));

    $result = $statement->execute();

    $bookmark_id = $db->querySingle("SELECT last_insert_rowid() as last_id;");


  } else {
    $bookmark_id = $row['bookmark_id'];
  }

  if(count($tags_id) and $bookmark_id) {
    $values=array();
    foreach ($tags_id as $tagID) {
      $values[] = "({$bookmark_id }, {$tagID})";
    }
    $q = 'INSERT OR IGNORE INTO bookmark_has_tags (bookmark_id, tag_id) values ' .
      join(',', $values);

    $statement = $db->prepare($q);
    $result = $statement->execute();
  }

}

function parse_bookmark_array($bookmark_array) {

  // skips those in "exclude_folders" array

  $exclude_folders = ['lavori', 'blu', 'altervista', 'giulia', 'ƒ'];

  foreach ($bookmark_array as $item) {

    if($item['title'] and (
      ( array_key_exists('children', $item) and in_array($item['title'], $exclude_folders)) or
      (array_key_exists('uri', $item) and strpos($item['uri'], ':8888') !== false and strpos($item['uri'], ':8889') !== false) // skip local dev bookmarks
    )) {
      continue;
    }

    if( array_key_exists('uri', $item) ) {
      add_bookmark($item);

    } else if( array_key_exists('children', $item) ) {
      parse_bookmark_array($item['children']);
    }
  }
}


var_dump(
  array_filter($json_data['children'], function($k, $v) {
    return $v['guid'] == $guid;
  }, ARRAY_FILTER_USE_BOTH)
);

exit;

parse_bookmark_array($json_data['children']);



echo 'END';
