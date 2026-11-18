/* =========================================================
   StudyFlow — Smart Student Study & Task Planner
   Pure Vanilla JavaScript (ES6+) with LocalStorage Persistence
   ========================================================= */

"use strict";

// ================= STORAGE KEYS =================
const STORAGE_KEYS = {
  TASKS: "studyflow_tasks_v1",
  THEME: "studyflow_theme_v1",
  SESSIONS: "studyflow_sessions_v1",
};

// ================= STUDY TIPS =================
const STUDY_TIPS = [
  "Use the Pomodoro method: 25 minutes of focused study followed by a 5-minute break.",
  "After finishing a topic, explain it out loud in your own words (Feynman Technique).",
  "Tackle one High Priority subject task before checking social media or notifications.",
  "Break large lab assignments into small 30-minute subtasks with clear deadlines.",
  "Review class notes within 24 hours to dramatically improve long-term memory retention.",
  "Practice writing HTML/CSS/JS snippets from scratch before your Web Technology viva.",
];

// ================= APPLICATION STATE =================
let tasks = [];
let currentTipIndex = 0;

// Pomodoro Timer State
const RING_CIRCUMFERENCE = 2 * Math.PI * 78; // matches r="78" in index.html
let timerMode = "focus";
let totalSeconds = 25 * 60;
let remainingSeconds = 25 * 60;
let timerInterval = null;
let isTimerRunning = false;
let completedSessions = 0;

// ================= DOM REFERENCES =================
const todayDateEl = document.getElementById("todayDate");
const themeToggleBtn = document.getElementById("themeToggle");
const themeIconEl = document.getElementById("themeIcon");
const importBtn = document.getElementById("importBtn");
const importFileInput = document.getElementById("importFileInput");
const exportBtn = document.getElementById("exportBtn");

// Stats & Progress
const statTotalEl = document.getElementById("statTotal");
const statCompletedEl = document.getElementById("statCompleted");
const statPendingEl = document.getElementById("statPending");
const statHighEl = document.getElementById("statHigh");
const progressSummaryEl = document.getElementById("progressSummary");
const progressPercentEl = document.getElementById("progressPercent");
const progressFillEl = document.getElementById("progressFill");
const progressBarTrackEl = document.getElementById("progressBarTrack");

// Form Elements
const taskForm = document.getElementById("taskForm");
const formHeadingEl = document.getElementById("formHeading");
const taskIdInput = document.getElementById("taskId");
const taskTitleInput = document.getElementById("taskTitle");
const taskSubjectInput = document.getElementById("taskSubject");
const taskPriorityInput = document.getElementById("taskPriority");
const taskDueDateInput = document.getElementById("taskDueDate");
const taskNotesInput = document.getElementById("taskNotes");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const resetFormBtn = document.getElementById("resetFormBtn");

// Validation Error Elements
const titleErrorEl = document.getElementById("titleError");
const subjectErrorEl = document.getElementById("subjectError");
const dateErrorEl = document.getElementById("dateError");

// Filters & Task List
const searchInput = document.getElementById("searchInput");
const filterSubjectSelect = document.getElementById("filterSubject");
const filterStatusSelect = document.getElementById("filterStatus");
const filterPrioritySelect = document.getElementById("filterPriority");
const sortTasksSelect = document.getElementById("sortTasks");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const taskCountBadgeEl = document.getElementById("taskCountBadge");
const taskListEl = document.getElementById("taskList");
const emptyStateEl = document.getElementById("emptyState");

// Timer Elements
const modeButtons = document.querySelectorAll(".mode-btn");
const timerTimeEl = document.getElementById("timerTime");
const timerLabelEl = document.getElementById("timerLabel");
const timerProgressRing = document.getElementById("timerProgressRing");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetTimerBtn = document.getElementById("resetTimerBtn");
const sessionCountEl = document.getElementById("sessionCount");

// Chart, Tips & Toast
const subjectChartEl = document.getElementById("subjectChart");
const studyTipEl = document.getElementById("studyTip");
const nextTipBtn = document.getElementById("nextTipBtn");
const toastEl = document.getElementById("toast");

// ================= UTILITY FUNCTIONS =================

/** Format local date as YYYY-MM-DD (avoids timezone off-by-one bugs) */
function getLocalDateString(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Format YYYY-MM-DD into a human-friendly label like "Nov 20, 2026" */
function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Check if a task is overdue (past today and not completed) */
function isTaskOverdue(task) {
  if (task.completed || !task.dueDate) return false;
  return task.dueDate < getLocalDateString(0);
}

/** Escape HTML special characters to prevent XSS injection */
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/** Show temporary toast feedback message */
let toastTimeout = null;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2600);
}

// ================= DATA PERSISTENCE =================

function getStarterTasks() {
  return [
    {
      id: "task-1",
      title: "Complete Web Technology DOM & Event Handling Lab",
      subject: "Web Technology",
      priority: "High",
      dueDate: getLocalDateString(1),
      notes: "Revise addEventListener, form validation, and localStorage API",
      completed: false,
      createdAt: Date.now() - 300000,
    },
    {
      id: "task-2",
      title: "Practice SQL Joins & Normalization (1NF to BCNF)",
      subject: "DBMS",
      priority: "High",
      dueDate: getLocalDateString(2),
      notes: "Solve 10 previous year exam queries",
      completed: false,
      createdAt: Date.now() - 200000,
    },
    {
      id: "task-3",
      title: "Revise CPU Scheduling Algorithms (SJF, Round Robin)",
      subject: "Operating Systems",
      priority: "Medium",
      dueDate: getLocalDateString(4),
      notes: "Draw Gantt charts and calculate average waiting time",
      completed: true,
      createdAt: Date.now() - 100000,
    },
    {
      id: "task-4",
      title: "Read OSI Model vs TCP/IP Layers Summary",
      subject: "Computer Networks",
      priority: "Low",
      dueDate: getLocalDateString(5),
      notes: "Focus on HTTP, DNS, TCP 3-way handshake",
      completed: false,
      createdAt: Date.now() - 50000,
    },
  ];
}

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (saved) {
      tasks = JSON.parse(saved);
    } else {
      tasks = getStarterTasks();
      saveTasks();
    }
  } catch (err) {
    console.error("Failed to load tasks:", err);
    tasks = getStarterTasks();
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

// ================= THEME MANAGEMENT =================

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIconEl.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || "light";
  applyTheme(savedTheme);
}

themeToggleBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const nextTheme = current === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  showToast(`Switched to ${nextTheme === "dark" ? "Dark" : "Light"} Mode`);
});

// ================= FORM VALIDATION & CRUD =================

function clearValidationErrors() {
  titleErrorEl.textContent = "";
  subjectErrorEl.textContent = "";
  dateErrorEl.textContent = "";
}

function validateForm() {
  clearValidationErrors();
  let isValid = true;

  const title = taskTitleInput.value.trim();
  const subject = taskSubjectInput.value;
  const dueDate = taskDueDateInput.value;

  if (title.length < 3) {
    titleErrorEl.textContent = "Please enter a task title (at least 3 characters).";
    isValid = false;
  }

  if (!subject) {
    subjectErrorEl.textContent = "Please select a subject.";
    isValid = false;
  }

  if (!dueDate) {
    dateErrorEl.textContent = "Please choose a due date.";
    isValid = false;
  }

  return isValid;
}

function resetEditMode() {
  taskIdInput.value = "";
  formHeadingEl.textContent = "Add New Study Task";
  submitBtn.textContent = "+ Add Task";
  cancelEditBtn.classList.add("hidden");
  taskForm.reset();
  taskDueDateInput.value = getLocalDateString(1);
  clearValidationErrors();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) return;

  const editingId = taskIdInput.value;
  const taskPayload = {
    title: taskTitleInput.value.trim(),
    subject: taskSubjectInput.value,
    priority: taskPriorityInput.value,
    dueDate: taskDueDateInput.value,
    notes: taskNotesInput.value.trim(),
  };

  if (editingId) {
    // UPDATE existing task
    tasks = tasks.map((task) =>
      task.id === editingId ? { ...task, ...taskPayload } : task
    );
    showToast("Task updated successfully!");
  } else {
    // CREATE new task
    const newTask = {
      id: "task-" + Date.now(),
      ...taskPayload,
      completed: false,
      createdAt: Date.now(),
    };
    tasks.unshift(newTask);
    showToast("New study task added!");
  }

  saveTasks();
  resetEditMode();
  renderAll();
});

cancelEditBtn.addEventListener("click", resetEditMode);

resetFormBtn.addEventListener("click", () => {
  setTimeout(() => {
    clearValidationErrors();
    if (!taskIdInput.value) {
      taskDueDateInput.value = getLocalDateString(1);
    }
  }, 0);
});

function startEditTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  taskIdInput.value = task.id;
  taskTitleInput.value = task.title;
  taskSubjectInput.value = task.subject;
  taskPriorityInput.value = task.priority;
  taskDueDateInput.value = task.dueDate;
  taskNotesInput.value = task.notes || "";

  formHeadingEl.textContent = "Edit Study Task";
  submitBtn.textContent = "Save Changes";
  cancelEditBtn.classList.remove("hidden");
  clearValidationErrors();

  taskTitleInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleTaskStatus(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderAll();
}

function deleteTask(id) {
  if (taskIdInput.value === id) {
    resetEditMode();
  }
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderAll();
  showToast("Task deleted.");
}

clearCompletedBtn.addEventListener("click", () => {
  const completedCount = tasks.filter((t) => t.completed).length;
  if (completedCount === 0) {
    showToast("No completed tasks to clear.");
    return;
  }
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  renderAll();
  showToast(`Cleared ${completedCount} completed task(s).`);
});

// ================= FILTERING, SORTING & RENDERING =================

function hasActiveFilters() {
  return (
    searchInput.value.trim() !== "" ||
    filterSubjectSelect.value !== "all" ||
    filterStatusSelect.value !== "all" ||
    filterPrioritySelect.value !== "all"
  );
}

function resetFilters() {
  searchInput.value = "";
  filterSubjectSelect.value = "all";
  filterStatusSelect.value = "all";
  filterPrioritySelect.value = "all";
  renderTaskList();
}

function getFilteredAndSortedTasks() {
  const query = searchInput.value.trim().toLowerCase();
  const subjectFilter = filterSubjectSelect.value;
  const statusFilter = filterStatusSelect.value;
  const priorityFilter = filterPrioritySelect.value;
  const sortBy = sortTasksSelect.value;

  const priorityRank = { High: 1, Medium: 2, Low: 3 };

  return tasks
    .filter((task) => {
      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.subject.toLowerCase().includes(query) ||
        (task.notes && task.notes.toLowerCase().includes(query));

      const matchesSubject =
        subjectFilter === "all" || task.subject === subjectFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && task.completed) ||
        (statusFilter === "pending" && !task.completed) ||
        (statusFilter === "overdue" && isTaskOverdue(task));

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesSubject && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "dueAsc") return a.dueDate.localeCompare(b.dueDate);
      if (sortBy === "dueDesc") return b.dueDate.localeCompare(a.dueDate);
      if (sortBy === "priority") {
        return (priorityRank[a.priority] || 9) - (priorityRank[b.priority] || 9);
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
}

function renderTaskList() {
  const visibleTasks = getFilteredAndSortedTasks();
  const filtersActive = hasActiveFilters();

  resetFiltersBtn.classList.toggle("hidden", !filtersActive);
  taskCountBadgeEl.textContent = filtersActive
    ? `Showing ${visibleTasks.length} of ${tasks.length}`
    : `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

  taskListEl.innerHTML = "";

  if (visibleTasks.length === 0) {
    emptyStateEl.classList.remove("hidden");
    return;
  }

  emptyStateEl.classList.add("hidden");

  visibleTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item${task.completed ? " completed" : ""}`;
    li.dataset.id = task.id;

    const overdue = isTaskOverdue(task);
    const priorityClass = `badge-${task.priority.toLowerCase()}`;

    li.innerHTML = `
      <div class="task-left">
        <input
          type="checkbox"
          class="task-checkbox"
          ${task.completed ? "checked" : ""}
          aria-label="Mark '${escapeHTML(task.title)}' as completed"
        />
        <div class="task-content">
          <div class="task-title">${escapeHTML(task.title)}</div>
          ${task.notes ? `<p class="task-note">${escapeHTML(task.notes)}</p>` : ""}
          <div class="task-meta">
            <span class="badge badge-subject">${escapeHTML(task.subject)}</span>
            <span class="badge ${priorityClass}">${escapeHTML(task.priority)}</span>
            <span class="badge ${overdue ? "badge-overdue" : "badge-date"}">
              ${overdue ? "Overdue: " : "Due: "}${formatDisplayDate(task.dueDate)}
            </span>
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-action-btn edit" type="button">Edit</button>
        <button class="icon-action-btn delete" type="button">Delete</button>
      </div>
    `;

    taskListEl.appendChild(li);
  });
}

// Event Delegation for Task List Actions (Checkbox, Edit, Delete)
taskListEl.addEventListener("click", (event) => {
  const item = event.target.closest(".task-item");
  if (!item) return;
  const id = item.dataset.id;

  if (event.target.classList.contains("task-checkbox")) {
    toggleTaskStatus(id);
  } else if (event.target.classList.contains("edit")) {
    startEditTask(id);
  } else if (event.target.classList.contains("delete")) {
    deleteTask(id);
  }
});

// Re-render when filters change
[
  searchInput,
  filterSubjectSelect,
  filterStatusSelect,
  filterPrioritySelect,
  sortTasksSelect,
].forEach((control) => {
  control.addEventListener("input", renderTaskList);
  control.addEventListener("change", renderTaskList);
});

resetFiltersBtn.addEventListener("click", () => {
  resetFilters();
  showToast("Filters reset.");
});

function renderStatsAndProgress() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPending = tasks.filter((t) => !t.completed && t.priority === "High").length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  statTotalEl.textContent = total;
  statCompletedEl.textContent = completed;
  statPendingEl.textContent = pending;
  statHighEl.textContent = highPending;

  progressSummaryEl.textContent = `${completed} of ${total} tasks completed`;
  progressPercentEl.textContent = `${percent}%`;
  progressFillEl.style.width = `${percent}%`;
  progressBarTrackEl.setAttribute("aria-valuenow", String(percent));
}

function renderSubjectChart() {
  subjectChartEl.innerHTML = "";

  if (tasks.length === 0) {
    subjectChartEl.innerHTML = `<p class="muted-text">Add tasks to see your subject breakdown.</p>`;
    return;
  }

  // Group counts by subject
  const counts = {};
  tasks.forEach((task) => {
    if (!counts[task.subject]) {
      counts[task.subject] = { total: 0, completed: 0 };
    }
    counts[task.subject].total += 1;
    if (task.completed) counts[task.subject].completed += 1;
  });

  const sortedSubjects = Object.entries(counts).sort(
    (a, b) => b[1].total - a[1].total
  );

  sortedSubjects.forEach(([subject, data]) => {
    const sharePercent = Math.round((data.total / tasks.length) * 100);
    const row = document.createElement("div");
    row.className = "chart-row";
    row.innerHTML = `
      <div class="chart-row-top">
        <span>${escapeHTML(subject)}</span>
        <span class="muted-text">${data.completed}/${data.total} done</span>
      </div>
      <div class="chart-bar-bg">
        <div class="chart-bar-fill" style="width: ${sharePercent}%"></div>
      </div>
    `;
    subjectChartEl.appendChild(row);
  });
}

function renderAll() {
  renderStatsAndProgress();
  renderTaskList();
  renderSubjectChart();
}

// ================= EXPORT & IMPORT JSON =================

const VALID_PRIORITIES = new Set(["High", "Medium", "Low"]);

function sanitizeImportedTask(raw, index) {
  if (!raw || typeof raw !== "object") return null;
  const title = typeof raw.title === "string" ? raw.title.trim().slice(0, 100) : "";
  const subject = typeof raw.subject === "string" && raw.subject.trim()
    ? raw.subject.trim()
    : "Other";
  const dueDate = typeof raw.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.dueDate)
    ? raw.dueDate
    : getLocalDateString(1);

  if (title.length < 3) return null;

  return {
    id: typeof raw.id === "string" && raw.id.trim()
      ? raw.id.trim()
      : `task-import-${Date.now()}-${index}`,
    title,
    subject,
    priority: VALID_PRIORITIES.has(raw.priority) ? raw.priority : "Medium",
    dueDate,
    notes: typeof raw.notes === "string" ? raw.notes.trim().slice(0, 140) : "",
    completed: Boolean(raw.completed),
    createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : Date.now(),
  };
}

importBtn.addEventListener("click", () => {
  importFileInput.value = "";
  importFileInput.click();
});

importFileInput.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || ""));
      const rawTasks = Array.isArray(parsed) ? parsed : parsed.tasks;

      if (!Array.isArray(rawTasks)) {
        showToast("Invalid backup file: missing tasks list.");
        return;
      }

      const validTasks = rawTasks
        .map((item, idx) => sanitizeImportedTask(item, idx))
        .filter(Boolean);

      if (validTasks.length === 0 && rawTasks.length > 0) {
        showToast("No valid tasks found in the selected file.");
        return;
      }

      tasks = validTasks;
      saveTasks();

      if (
        !Array.isArray(parsed) &&
        Number.isFinite(Number(parsed.completedPomodoroSessions)) &&
        Number(parsed.completedPomodoroSessions) >= 0
      ) {
        completedSessions = Math.floor(Number(parsed.completedPomodoroSessions));
        localStorage.setItem(STORAGE_KEYS.SESSIONS, String(completedSessions));
        sessionCountEl.textContent = completedSessions;
      }

      resetEditMode();
      renderAll();
      showToast(`Imported ${validTasks.length} study task(s)!`);
    } catch (err) {
      console.error("Failed to import JSON:", err);
      showToast("Could not parse JSON file. Please check the file format.");
    }
  };
  reader.readAsText(file);
});

exportBtn.addEventListener("click", () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    completedPomodoroSessions: completedSessions,
    tasks,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `studyflow-tasks-${getLocalDateString(0)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Tasks exported as JSON!");
});

// ================= POMODORO TIMER =================

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (err) {
    // Ignore audio errors if blocked by browser autoplay policy
  }
}

function updateTimerUI() {
  const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const secs = String(remainingSeconds % 60).padStart(2, "0");
  timerTimeEl.textContent = `${mins}:${secs}`;

  const progressRatio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const offset = RING_CIRCUMFERENCE * (1 - progressRatio);
  timerProgressRing.style.strokeDasharray = String(RING_CIRCUMFERENCE);
  timerProgressRing.style.strokeDashoffset = String(offset);

  document.title = isTimerRunning
    ? `${mins}:${secs} — StudyFlow`
    : "StudyFlow — Smart Student Study & Task Planner";
}

function setTimerMode(mode, minutes) {
  stopTimer();
  timerMode = mode;
  totalSeconds = minutes * 60;
  remainingSeconds = totalSeconds;

  modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  const labels = {
    focus: "Focus Time",
    short: "Short Break",
    long: "Long Break",
  };
  timerLabelEl.textContent = labels[mode] || "Focus Time";
  updateTimerUI();
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isTimerRunning = false;
  startPauseBtn.textContent = "Start";
}

function toggleTimer() {
  if (isTimerRunning) {
    stopTimer();
    updateTimerUI();
    return;
  }

  isTimerRunning = true;
  startPauseBtn.textContent = "Pause";

  timerInterval = setInterval(() => {
    remainingSeconds -= 1;
    updateTimerUI();

    if (remainingSeconds <= 0) {
      stopTimer();
      playBeep();

      if (timerMode === "focus") {
        completedSessions += 1;
        localStorage.setItem(STORAGE_KEYS.SESSIONS, String(completedSessions));
        sessionCountEl.textContent = completedSessions;
        showToast("Focus session complete! Take a short break.");
      } else {
        showToast("Break finished! Ready for another focus session.");
      }

      remainingSeconds = totalSeconds;
      updateTimerUI();
    }
  }, 1000);
}

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setTimerMode(btn.dataset.mode, Number(btn.dataset.minutes));
  });
});

startPauseBtn.addEventListener("click", toggleTimer);

resetTimerBtn.addEventListener("click", () => {
  stopTimer();
  remainingSeconds = totalSeconds;
  updateTimerUI();
});

function initSessions() {
  const saved = Number(localStorage.getItem(STORAGE_KEYS.SESSIONS));
  completedSessions = Number.isFinite(saved) && saved > 0 ? saved : 0;
  sessionCountEl.textContent = completedSessions;
}

// ================= STUDY TIPS =================

function showTip(index) {
  currentTipIndex = index % STUDY_TIPS.length;
  studyTipEl.textContent = STUDY_TIPS[currentTipIndex];
}

nextTipBtn.addEventListener("click", () => {
  showTip(currentTipIndex + 1);
});

// ================= INITIALIZATION =================

function initApp() {
  // Display today's date in header
  todayDateEl.textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Set default due date to tomorrow
  taskDueDateInput.value = getLocalDateString(1);

  initTheme();
  initSessions();
  loadTasks();
  renderAll();
  updateTimerUI();
  showTip(0);
}

initApp();
