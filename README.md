# StudyFlow — Smart Student Study & Task Planner

A clean, responsive, zero-dependency **Web Technology (B.Tech 3rd Year)** mini-project built using **HTML5, CSS3, and Vanilla JavaScript (ES6+)** with browser `localStorage` persistence.

## Features

- **Full CRUD Task Management**: Add, view, edit, mark complete, and delete study tasks with subject, priority (`High`, `Medium`, `Low`), due date, and optional notes.
- **Live Dashboard & Progress Bar**: Displays total tasks, completed count, pending count, high-priority pending items, and an animated completion progress bar.
- **Search, Filter & Sort**: Search by keyword, filter by completion status or priority, and sort by due date, priority, or recently added.
- **Overdue Detection**: Automatically highlights pending tasks past their due date.
- **Pomodoro Focus Timer**: Built-in `25m` Focus, `5m` Short Break, and `15m` Long Break timer with an animated SVG ring, session counter, browser tab countdown, and Web Audio API completion chime.
- **Subject Distribution Chart**: Pure HTML/CSS/JS visual breakdown of tasks per B.Tech subject.
- **Light / Dark Mode**: Theme switcher saved in `localStorage`.
- **Export to JSON**: Download all tasks and session stats as a `.json` backup file.
- **100% Offline Ready**: No external CDNs, frameworks, or server setup required.

## Project Structure

```text
student-study-planner/
├── index.html   # Semantic HTML5 layout, form, dashboard, and timer SVG
├── style.css    # CSS3 variables, Flexbox, Grid, responsive media queries, dark mode
├── script.js    # Vanilla ES6+ JS: CRUD, validation, event delegation, Pomodoro, localStorage
└── README.md    # Documentation & viva guide
```

## How to Run

1. Open the folder `student-study-planner`.
2. Double-click **`index.html`** to open it in any web browser (Chrome, Edge, Firefox).
3. Start adding, editing, filtering tasks, or running the Pomodoro timer—all data is automatically saved in your browser's `localStorage`.

## Web Technology Concepts Covered (Great for Report & Viva)

| Syllabus Topic | Where It Is Used |
| --- | --- |
| **HTML5 Semantic Elements** | `<header>`, `<main>`, `<section>`, `<aside>`, `<article>`, `<footer>` in `index.html` |
| **HTML Forms & Client-Side Validation** | Custom JS validation with inline error messages (`validateForm()` in `script.js`) |
| **CSS3 Layout & Responsive Design** | CSS Grid, Flexbox, CSS Custom Properties (`:root`), `@media` queries in `style.css` |
| **DOM Manipulation & Event Delegation** | Dynamic task list rendering and single click listener on `#taskList` |
| **Web Storage API (`localStorage`)** | Persisting tasks (`JSON.stringify` / `JSON.parse`), dark mode, and Pomodoro count |
| **SVG & CSS Transitions** | Circular countdown ring (`stroke-dasharray` / `stroke-dashoffset`) |
| **Web Audio API & Blob API** | Timer completion beep (`AudioContext`) and JSON file download (`Blob` + `URL.createObjectURL`) |
| **XSS Prevention** | Escaping user-entered strings via `escapeHTML()` before inserting into the DOM |
