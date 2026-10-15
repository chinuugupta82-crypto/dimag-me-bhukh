# Dimag Me Bhukh: website with admin panel

A normal website (HTML, CSS and JavaScript) plus an admin panel that publishes changes straight to the website.

- `SETUP-ONCE.md` – read this first. A one-time setup (GitHub + free hosting + a secret key).
- `HOW-TO-EDIT.md` – daily use, for Akanksha.

The admin also has a **Blog** section: write posts, and each published post appears in the **Blog** section of the home page (newest first) and gets its own page. The Blog section is always on the home page, right under **Latest Updates** (the band that shows the newest YouTube video automatically). Until the first post is published it shows a friendly "coming soon" note.

The order of the sections on the website follows the **Menu & section order** page in the admin (Settings), so moving an entry there moves the section on the page.

Folder contents: `index.html` (the website), `posts/` (appears when you publish posts), `admin/` (the admin panel at `/admin/`), `content.js` (all words, links and photo names), `images/` (photos), `style.css`, `script.js`, `template.js` (the look and behaviour; no need to touch), `favicon.svg`, `robots.txt`.

You can also use the admin without any setup: edit, then choose **More → Download ZIP** and upload the files to any web host by hand. Setting up the connection in `SETUP-ONCE.md` removes that manual step.
