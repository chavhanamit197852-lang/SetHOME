# RoomFinder — Vanilla HTML/CSS/JavaScript

This is the framework-free version of the RoomFinder website.

## Tech
- HTML5
- CSS3
- JavaScript (ES6)
- No React
- No Node.js required to run the finished static website
- No external UI library

## Folder structure

```text
roomfinder/
├── index.html
├── about.html
├── contact.html
├── README.md
├── css/
│   ├── style.css
│   └── animations.css
├── js/
│   ├── main.js
│   └── listings.js
├── images/
│   ├── room-1.svg
│   ├── room-2.svg
│   ├── room-3.svg
│   ├── room-4.svg
│   ├── room-5.svg
│   ├── room-6.svg
│   ├── about-room.svg
│   ├── team-1.svg
│   ├── team-2.svg
│   └── team-3.svg
└── icons/
```

## How to use

1. Extract the ZIP.
2. Open the folder in VS Code.
3. Replace the files inside `images/` with your own reference images.
4. If you replace an image, keep the same filename OR update the filename in `js/listings.js` / the HTML.
5. Open `index.html` directly, or use VS Code Live Server.

## Important

The contact form is a frontend demo only. It does not actually send email. Connect a backend, Formspree, EmailJS, or your own API when you are ready.

The map is intentionally a lightweight placeholder so there is no dependency on a map service.

## Main editable files

- `js/listings.js` → property data
- `css/style.css` → main UI
- `css/animations.css` → animations
- `js/main.js` → search, modal, mobile menu, reveal animations and form behavior
