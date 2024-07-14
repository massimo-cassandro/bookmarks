--
-- File generated with SQLiteStudio v3.4.4 on sab set 16 19:35:54 2023
--
-- Text encoding used: UTF-8
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: bookmarks
DROP TABLE IF EXISTS bookmarks;

CREATE TABLE IF NOT EXISTS bookmarks (
    id           INTEGER       PRIMARY KEY AUTOINCREMENT
                               NOT NULL,
    title        VARCHAR (255) DEFAULT NULL,
    url          TEXT          NOT NULL,
    description  TEXT          DEFAULT NULL,
    notes        TEXT          DEFAULT NULL,
    icon         TEXT          DEFAULT NULL,
    image        TEXT          DEFAULT NULL,
    favorite     BOOLEAN       DEFAULT (0)
                               NOT NULL,
    reading_list BOOLEAN       NOT NULL
                               DEFAULT (0),
    date_added   DATETIME      NOT NULL
                               DEFAULT (datetime('now', 'localtime') ),
    date_updated VARCHAR (255) DEFAULT (datetime('now', 'localtime') ),
    date_visited DATETIME      DEFAULT (datetime('now', 'localtime') )
);


-- Table: collection_bookmarks
DROP TABLE IF EXISTS collection_bookmarks;

CREATE TABLE IF NOT EXISTS collection_bookmarks (
    collection_id INT REFERENCES tags (id) ON DELETE CASCADE
                                           ON UPDATE NO ACTION,
    bookmark_id   INT REFERENCES bookmarks (id) ON DELETE CASCADE
                                                ON UPDATE NO ACTION,
    PRIMARY KEY (
        collection_id ASC,
        bookmark_id ASC
    )
);


-- Table: collections
DROP TABLE IF EXISTS collections;

CREATE TABLE IF NOT EXISTS collections (
    id         INTEGER PRIMARY KEY AUTOINCREMENT
                       NOT NULL,
    collection VARCHAR NOT NULL
);


-- Table: bookmark_tags
DROP TABLE IF EXISTS bookmark_tags;

CREATE TABLE IF NOT EXISTS bookmark_tags (
    bookmark_id INT REFERENCES bookmarks (id) ON DELETE CASCADE
                                              ON UPDATE NO ACTION,
    tag_id      INT REFERENCES tags (id) ON DELETE CASCADE
                                         ON UPDATE NO ACTION,
    PRIMARY KEY (
        bookmark_id ASC,
        tag_id ASC
    )
);

-- Table: tags
DROP TABLE IF EXISTS tags;

CREATE TABLE IF NOT EXISTS tags (
    id  INTEGER PRIMARY KEY AUTOINCREMENT
                NOT NULL,
    tag VARCHAR UNIQUE
                NOT NULL
);


COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
