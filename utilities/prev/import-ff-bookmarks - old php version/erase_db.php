<?php
// die('WARNING this script completely erase db');
require_once '../public/php/init.php';
$queries=array(
  "delete from bookmark_tags;",
  "delete from collection_bookmarks;",
  "delete from bookmarks;",
  "delete from tags;",
  "delete from collections;",
  "UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='bookmarks'",
  "UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='tags'"
  "UPDATE SQLITE_SEQUENCE SET SEQ=0 WHERE NAME='collections'"
);

foreach($queries as $q) {
  $statement = $db->prepare($q);
  $result = $statement->execute();
}

echo 'END';
