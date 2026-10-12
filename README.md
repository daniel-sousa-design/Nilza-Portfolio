# Nilza-Portfolio

Static site — no build step. Serve the folder and open it:

```sh
python3 -m http.server 8765   # then visit http://localhost:8765
```

- `index.html` — page markup (info section, project nav)
- `css/styles.css` — layout, scaled from the 1512px Figma frame
- `js/projects.js` — project list and gallery layouts (edit this to add projects/images)
- `js/main.js` — sticky nav, active project, load-next-on-scroll
- `assets/img/<project>/` — images
