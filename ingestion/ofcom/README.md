# Ofcom documents (added by hand)

Ofcom's website blocks automated access, so the pipeline cannot find or download
its documents. Instead, add one `.txt` file here per Ofcom AI document. The next
pipeline run picks up any file whose URL is not already in the database.

File format: four header lines, a blank line, then the document's text pasted
from the web page or PDF.

```
url: https://www.ofcom.org.uk/...
title: The document's title
date: 2026-03-14
type: Statement

The full text of the document...
```

- `date` is the publication date as YYYY-MM-DD.
- `type` is the kind of document as Ofcom labels it (Statement, Consultation,
  Guidance, News, ...).
- Paste the real text: the model's summary and its quote check both work from it.
  Files with less than 200 characters of text, or that never mention AI, are skipped.
