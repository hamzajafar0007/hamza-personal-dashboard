# Hamza's Personal Dashboard

An original personal productivity dashboard built with plain HTML, CSS, and JavaScript. It brings quick notes, a to-do list, a calculator, theme switching, a live clock, and search into one responsive interface.

## Features

- **Quick Notes:** create and delete notes.
- **To-do List:** add, complete, and delete tasks; view completion progress; clear completed tasks.
- **Calculator:** basic arithmetic, percentage, decimals, and delete/clear controls.
- **Dark and light themes:** your choice is remembered in this browser.
- **Live clock and date:** uses your device's local time.
- **Search:** filters notes and tasks as you type.
- **Responsive layout:** adapts to desktop, tablet, and mobile screens.
- **Local persistence:** notes, tasks, and theme are stored in browser `localStorage`; no account or server is required.

## Project structure

```text
hamza-personal-dashboard/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Add a note or task and refresh the page to check that browser storage works.

No build tools or dependencies are required.

## Publish with GitHub Pages

1. Sign in at [GitHub](https://github.com/).
2. Click **New repository**.
3. Name it `hamza-personal-dashboard`.
4. Choose **Public** if you want to show it in your portfolio. Do not upload private information.
5. Create the repository.
6. On the repository page, choose **Add file → Upload files**.
7. Upload `index.html`, `style.css`, `script.js`, and `README.md` (upload the files themselves, not just the ZIP).
8. Enter a commit message such as `Add Hamza Personal Dashboard`.
9. Click **Commit changes**.
10. Open **Settings → Pages**.
11. Under the build/deployment section, select **Deploy from a branch**, choose `main` and `/(root)`, then save.
12. Wait a short while and refresh the Pages section. GitHub will show the published website link.

Your project will normally be available at:

`https://YOUR-GITHUB-USERNAME.github.io/hamza-personal-dashboard/`

Replace `YOUR-GITHUB-USERNAME` with your actual GitHub username. The exact URL appears in your repository's Pages settings.

## Important notes

- This project is written from scratch for this delivery; it does not intentionally reuse another project's source code or assets.
- You can customize the colors, wording, and features further to make it more personal.
- Notes and tasks are stored only in the browser where you use the dashboard. They are not synced between devices.
- Do not store passwords, API keys, or other secrets in this project or in a public GitHub repository.
- The calculator evaluates only a restricted arithmetic expression character set. As with any code, review and understand the source before publishing.

## Author

**Hamza** — Personal learning project.
