# Import bookmarks from FF and from a md file

Firefox json bookmarjs file (path in var `ff_file`, set in `src/import-firefox-bookmarks.mjs`)

Optional md file (path set in `src/import-markdown.mjs`)

```markdown
## Tools
* DevTools Tips <https://devtoolstips.org/> #browsers #web development
```

where: 
* `## Tools` = collection title (used also as tag as one word only)
* `*` record
* `🟡` favorite (fac.)
* `DevTools Tips` record title
* `<https://devtoolstips.org/>` record url
* `#browsers #web development` tags


After import, a `result_bookmarks.json` is also created.
