/* Hamza's Personal Dashboard — original project code */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORAGE = { notes: "hamzaDashboardNotesV1", tasks: "hamzaDashboardTasksV1", theme: "hamzaDashboardThemeV1" };

  function load(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { showToast("Could not save. Browser storage may be disabled."); }
  }
  let notes = load(STORAGE.notes, []);
  let tasks = load(STORAGE.tasks, []);
  let expression = "";
  let justCalculated = false;
  let toastTimer;

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function updateClock() {
    const now = new Date();
    $("#clock").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    $("#time-stat").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    $("#today-date").textContent = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    $("#date-stat").textContent = now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
    $("#year").textContent = now.getFullYear();
  }

  function renderNotes() {
    $("#notes-count").textContent = notes.length;
    $("#notes-pill").textContent = `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;
    const list = $("#notes-list");
    if (!notes.length) {
      list.innerHTML = '<div class="empty-state">Your notes will appear here.</div>';
      applySearch();
      return;
    }
    list.innerHTML = notes.slice().reverse().map(note => `
      <article class="note-item searchable" data-search="${escapeHTML((note.title + " " + note.body).toLowerCase())}">
        <h3>${escapeHTML(note.title)}</h3><p>${escapeHTML(note.body)}</p>
        <small class="item-meta">${escapeHTML(note.date)}</small>
        <button class="delete-button" type="button" data-delete-note="${escapeHTML(note.id)}" aria-label="Delete note">×</button>
      </article>`).join("");
    applySearch();
  }

  function renderTasks() {
    const completed = tasks.filter(task => task.done).length;
    const pending = tasks.length - completed;
    const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    $("#tasks-count").textContent = `${completed}/${tasks.length}`;
    $("#tasks-caption").textContent = tasks.length ? `${percent}% of your tasks completed` : "Ready when you are";
    $("#pending-pill").textContent = `${pending} left`;
    $("#progress-fill").style.width = `${percent}%`;
    $("#progress-text").textContent = `${percent}%`;
    const list = $("#tasks-list");
    if (!tasks.length) {
      list.innerHTML = '<div class="empty-state">Add a task to get started.</div>';
      applySearch();
      return;
    }
    list.innerHTML = tasks.map(task => `
      <div class="task-item searchable ${task.done ? "done" : ""}" data-search="${escapeHTML(task.text.toLowerCase())}">
        <input class="task-check" type="checkbox" data-toggle-task="${escapeHTML(task.id)}" ${task.done ? "checked" : ""} aria-label="Mark task complete">
        <span class="task-text">${escapeHTML(task.text)}</span>
        <button class="delete-button" type="button" data-delete-task="${escapeHTML(task.id)}" aria-label="Delete task">×</button>
      </div>`).join("");
    applySearch();
  }

  function applySearch() {
    const query = $("#global-search").value.trim().toLowerCase();
    $$(".searchable").forEach(item => {
      item.classList.toggle("hidden-by-search", Boolean(query) && !item.dataset.search.includes(query));
    });
  }

  $("#note-form").addEventListener("submit", event => {
    event.preventDefault();
    const title = $("#note-title").value.trim();
    const body = $("#note-body").value.trim();
    if (!title || !body) return;
    notes.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), title, body,
      date: new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) });
    save(STORAGE.notes, notes);
    event.currentTarget.reset();
    renderNotes();
    showToast("Note saved on this browser.");
  });

  $("#task-form").addEventListener("submit", event => {
    event.preventDefault();
    const input = $("#task-input");
    const text = input.value.trim();
    if (!text) return;
    tasks.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), text, done: false });
    save(STORAGE.tasks, tasks);
    input.value = "";
    renderTasks();
    showToast("Task added.");
  });

  document.addEventListener("click", event => {
    const deleteNote = event.target.closest("[data-delete-note]");
    const deleteTask = event.target.closest("[data-delete-task]");
    const nav = event.target.closest("[data-target]");
    if (deleteNote) {
      notes = notes.filter(note => note.id !== deleteNote.dataset.deleteNote);
      save(STORAGE.notes, notes); renderNotes(); showToast("Note deleted.");
    }
    if (deleteTask) {
      tasks = tasks.filter(task => task.id !== deleteTask.dataset.deleteTask);
      save(STORAGE.tasks, tasks); renderTasks(); showToast("Task deleted.");
    }
    if (nav) {
      $$(".nav-link").forEach(link => link.classList.toggle("active", link === nav));
      const target = document.getElementById(nav.dataset.target);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      $("#sidebar").classList.remove("open");
    }
  });

  document.addEventListener("change", event => {
    const checkbox = event.target.closest("[data-toggle-task]");
    if (!checkbox) return;
    const task = tasks.find(item => item.id === checkbox.dataset.toggleTask);
    if (task) {
      task.done = checkbox.checked;
      save(STORAGE.tasks, tasks); renderTasks();
    }
  });

  $("#clear-completed").addEventListener("click", () => {
    const before = tasks.length;
    tasks = tasks.filter(task => !task.done);
    save(STORAGE.tasks, tasks); renderTasks();
    showToast(before === tasks.length ? "No completed tasks to clear." : "Completed tasks cleared.");
  });

  $("#search-form").addEventListener("submit", event => {
    event.preventDefault(); applySearch();
    const query = $("#global-search").value.trim();
    showToast(query ? "Showing matching notes and tasks." : "Search cleared.");
  });
  $("#global-search").addEventListener("input", applySearch);

  function setTheme(theme) {
    document.body.classList.toggle("light", theme === "light");
    $("#theme-toggle").textContent = theme === "light" ? "☾" : "☼";
    save(STORAGE.theme, theme);
  }
  $("#theme-toggle").addEventListener("click", () => {
    setTheme(document.body.classList.contains("light") ? "dark" : "light");
  });
  setTheme(load(STORAGE.theme, "dark"));

  $("#menu-toggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

  const output = $("#calc-output");
  const calcExpression = $("#calc-expression");
  function displayExpression() { output.textContent = expression || "0"; }
  function calculate() {
    if (!expression) return;
    // Only calculator characters are accepted; no eval() is used.
    if (!/^[0-9+\-*/%.()\s]+$/.test(expression)) {
      output.textContent = "Invalid"; expression = ""; return;
    }
    try {
      const result = new Function('"use strict"; return (' + expression + ')')();
      if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("Invalid result");
      calcExpression.textContent = expression + " =";
      expression = String(Number(result.toPrecision(12)));
      output.textContent = expression;
      justCalculated = true;
    } catch {
      output.textContent = "Error";
      expression = "";
    }
  }
  $(".calc-keys").addEventListener("click", event => {
    const key = event.target.closest("button");
    if (!key) return;
    const action = key.dataset.action;
    const value = key.dataset.value;
    if (action === "clear") {
      expression = ""; justCalculated = false; calcExpression.textContent = "Ready"; output.textContent = "0"; return;
    }
    if (action === "delete") {
      expression = expression.slice(0, -1); justCalculated = false; displayExpression(); return;
    }
    if (action === "equals") { calculate(); return; }
    if (value) {
      if (justCalculated && /[0-9.(]/.test(value)) { expression = ""; calcExpression.textContent = "Ready"; }
      justCalculated = false;
      expression += value;
      calcExpression.textContent = "Calculation";
      displayExpression();
    }
  });

  // Initial render
  updateClock();
  setInterval(updateClock, 1000);
  renderNotes();
  renderTasks();
})();
