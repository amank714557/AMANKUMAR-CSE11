# StudyFlow — Smart Student Study & Task Planner

A clean, responsive, zero-dependency **Web Technology (B.Tech 3rd Year)** mini-project built using **HTML5, CSS3, and Vanilla JavaScript (ES6+)** with browser `localStorage` persistence.

## Features

- **Full CRUD Task Management**: Add, view, edit, mark complete, and delete study tasks with subject, priority (`High`, `Medium`, `Low`), due date, and optional notes.
- **Undo Deletion Support**: Accidental task deletions or clearing completed tasks can be reversed with a one-click **Undo** toast action.
- **Live Dashboard & Progress Bar**: Displays total tasks, completed count, pending count, high-priority pending items, task count badge, and an animated completion progress bar.
- **Search, Filter & Sort**: Search by keyword, filter by **subject**, **status** (`Pending`, `Overdue`, `Completed`), or **priority**, sort by due date/priority/newest, and clear filters in one click.
- **Smart Due-Date Indicators**: Highlights tasks that are **Due Today**, **Due Tomorrow**, or **Overdue** (with exact overdue day count).
- **Drift-Free Pomodoro Focus Timer**: Built-in `25m` Focus, `5m` Short Break, and `15m` Long Break timer using timestamp-based countdown, animated SVG progress ring, session counter, browser tab countdown, and Web Audio API chime.
- **Daily Focus & Study Streak Tracking**: Tracks daily focus minutes and consecutive active study days in `localStorage`.
- **Subject Distribution Chart**: Pure HTML/CSS/JS visual breakdown of tasks across B.Tech subjects.
- **JSON Backup & Restore**: Export all tasks and study stats as `.json`, and re-import backups with schema sanitization via `FileReader`.
- **Keyboard Shortcuts & Accessibility**: Built-in shortcuts modal (`?`), ARIA roles/states, focus-visible indicators, reduced-motion support, and print-friendly layout (`@media print`).
- **Light / Dark Mode**: Theme switcher saved in `localStorage`.
- **100% Offline Ready**: No external CDNs, frameworks, or server setup required.

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `/` | Focus task search input |
| `N` | Jump to new task title input |
| `Space` | Start or pause Pomodoro timer |
| `T` | Toggle Light / Dark theme |
| `Esc` | Cancel edit mode or close modal |
| `?` | Open / close keyboard shortcuts guide |

## Project Structure

```text
AMANKUMAR-CSE11/
├── index.html   # Semantic HTML5 layout, form, dashboard, timer SVG, and shortcuts modal
├── style.css    # CSS3 variables, Grid, Flexbox, responsive queries, dark mode, print styles
├── script.js    # Vanilla ES6+ JS: CRUD, filters, undo, drift-free Pomodoro, streak, JSON I/O
├── .gitignore   # Standard OS, editor, and temporary file ignores
└── README.md    # Documentation, shortcuts, & viva guide
```

## How to Run

1. Clone or open the `AMANKUMAR-CSE11` folder.
2. Double-click **`index.html`** to open it in any modern browser (Chrome, Edge, Firefox).
3. Start adding, editing, filtering tasks, or running the Pomodoro timer—all data is saved automatically in `localStorage`.

## Web Technology Concepts Covered (Great for Report & Viva)

| Syllabus Topic | Where It Is Used |
| --- | --- |
| **HTML5 Semantic Elements & ARIA** | `<header>`, `<main>`, `<section>`, `<aside>`, `<article>`, `<footer>`, `role="tablist"`, `role="dialog"`, `aria-invalid` in `index.html` |
| **HTML Forms & Client-Side Validation** | Custom JS validation with inline error messages and focus management (`validateForm()` in `script.js`) |
| **CSS3 Layout, Print & Responsive Design** | CSS Grid, Flexbox, CSS Custom Properties (`:root`), `@media` responsive, `@media print`, and `prefers-reduced-motion` in `style.css` |
| **DOM Manipulation & Event Delegation** | Dynamic task list rendering, single click listener on `#taskList`, and global keyboard event handling |
| **Web Storage API (`localStorage`)** | Persisting tasks, dark mode, Pomodoro count, daily focus minutes, and study streak |
| **FileReader & Blob APIs** | Exporting backups (`Blob` + `URL.createObjectURL`) and restoring/sanitizing JSON backups (`FileReader`) |
| **SVG & CSS Transitions** | Circular countdown ring (`stroke-dasharray` / `stroke-dashoffset`) with `Date.now()` drift-free timing |
| **Web Audio API** | Timer completion chime synthesized with `AudioContext` |
| **XSS Prevention** | Escaping user-entered strings via `escapeHTML()` before rendering into the DOM |
