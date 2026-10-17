/* Hamza's Personal Dashboard — original project code */
(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORAGE = {
    notes: "hamzaDashboardNotesV1",
    tasks: "hamzaDashboardTasksV1",
    theme: "hamzaDashboardThemeV1"
  };

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

  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
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
    $("#welcome-date").textContent = now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
    $("#year").textContent = now.getFullYear();
  }

  function applySearch() {
    const query = $("#global-search").value.trim().toLowerCase();
    $$(".searchable").forEach(item => {
      item.classList.toggle("hidden-by-search", Boolean(query) && !item.dataset.search.includes(query));
    });
  }

  function renderNotes() {
    $("#notes-count").textContent = notes.length;
    $("#notes-pill").textContent = `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;
    const list = $("#notes-list");
    if (!notes.length) {
      list.innerHTML = '<div class="empty-state">Your notes will appear here.</div>';
      return;
    }
    list.innerHTML = notes.slice().reverse().map(note => `
      <article class="note-item searchable" data-search="${escapeHTML((note.title + " " + note.body).toLowerCase())}">
        <h3>${escapeHTML(note.title)}</h3>
        <p>${escapeHTML(note.body)}</p>
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

  $("#note-form").addEventListener("submit", event => {
    event.preventDefault();
    const title = $("#note-title").value.trim();
    const body = $("#note-body").value.trim();
    if (!title || !body) return;
    notes.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), title, body, date: new Date().toLocaleDateString() });
    save(STORAGE.notes, notes);
    renderNotes();
    $("#note-form").reset();
    showToast("Note saved successfully.");
  });

  $("#task-form").addEventListener("submit", event => {
    event.preventDefault();
    const text = $("#task-input").value.trim();
    if (!text) return;
    tasks.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), text, done: false });
    save(STORAGE.tasks, tasks);
    renderTasks();
    $("#task-form").reset();
    showToast("Task added to your list.");
  });

  document.addEventListener("click", event => {
    const noteDelete = event.target.closest("[data-delete-note]");
    if (noteDelete) {
      notes = notes.filter(note => String(note.id) !== noteDelete.dataset.deleteNote);
      save(STORAGE.notes, notes);
      renderNotes();
      showToast("Note deleted.");
    }
    const taskDelete = event.target.closest("[data-delete-task]");
    if (taskDelete) {
      tasks = tasks.filter(task => String(task.id) !== taskDelete.dataset.deleteTask);
      save(STORAGE.tasks, tasks);
      renderTasks();
      showToast("Task deleted.");
    }
  });

  document.addEventListener("change", event => {
    const checkbox = event.target.closest("[data-toggle-task]");
    if (!checkbox) return;
    const task = tasks.find(item => String(item.id) === checkbox.dataset.toggleTask);
    if (task) {
      task.done = checkbox.checked;
      save(STORAGE.tasks, tasks);
      renderTasks();
    }
  });

  $("#clear-completed").addEventListener("click", () => {
    const before = tasks.length;
    tasks = tasks.filter(task => !task.done);
    save(STORAGE.tasks, tasks);
    renderTasks();
    showToast(before === tasks.length ? "No completed tasks to clear." : "Completed tasks cleared.");
  });

  $("#search-form").addEventListener("submit", event => {
    event.preventDefault();
    applySearch();
    const query = $("#global-search").value.trim();
    showToast(query ? `Showing matches for "${query}".` : "Search cleared.");
  });
  $("#global-search").addEventListener("input", applySearch);

  const theme = load(STORAGE.theme, "dark");
  if (theme === "light") document.body.classList.add("light");
  $("#theme-toggle").textContent = document.body.classList.contains("light") ? "☾" : "☼";
  $("#theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    const nextTheme = document.body.classList.contains("light") ? "light" : "dark";
    save(STORAGE.theme, nextTheme);
    $("#theme-toggle").textContent = nextTheme === "light" ? "☾" : "☼";
    showToast(`${nextTheme === "light" ? "Light" : "Dark"} mode enabled.`);
  });

  function scrollToSection(id) {
    const section = document.getElementById(id);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    $("#current-section").textContent = id === "overview" ? "Overview" :
      id === "notes-section" ? "My Notes" :
      id === "tasks-section" ? "To-do List" : "Calculator";
    $$(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.target === id));
    $("#sidebar").classList.remove("open");
  }
  $$(".nav-link").forEach(link => link.addEventListener("click", () => scrollToSection(link.dataset.target)));
  $("#view-tasks").addEventListener("click", () => scrollToSection("tasks-section"));
  $("#menu-toggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  document.addEventListener("click", event => {
    if (window.innerWidth <= 850 && !event.target.closest("#sidebar") && !event.target.closest("#menu-toggle")) {
      $("#sidebar").classList.remove("open");
    }
  });

  const output = $("#calc-output");
  const expressionLabel = $("#calc-expression");
  function showExpression() {
    expressionLabel.textContent = expression || "Ready";
    output.textContent = expression || "0";
  }
  function calculate() {
    if (!expression || !/^[0-9+\-*/%.() ]+$/.test(expression)) return;
    try {
      const normalized = expression.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
      const result = Function('"use strict"; return (' + normalized + ')')();
      if (!Number.isFinite(result)) throw new Error("Invalid");
      expressionLabel.textContent = `${expression} =`;
      expression = String(Number(result.toFixed(8)));
      output.textContent = expression;
      justCalculated = true;
    } catch {
      output.textContent = "Error";
      showToast("Please check your calculation.");
      expression = "";
    }
  }
  $$(".key").forEach(key => key.addEventListener("click", () => {
    const action = key.dataset.action;
    const value = key.dataset.value;
    if (action === "clear") {
      expression = ""; justCalculated = false; showExpression(); return;
    }
    if (action === "delete") {
      expression = expression.slice(0, -1); justCalculated = false; showExpression(); return;
    }
    if (action === "equals") { calculate(); return; }
    if (value) {
      if (justCalculated && /[0-9.]/.test(value)) expression = "";
      justCalculated = false;
      expression += value;
      showExpression();
    }
  }));
  document.addEventListener("keydown", event => {
    if (event.target.matches("input, textarea")) {
      if (event.key === "Enter" && event.target.id === "global-search") return;
      return;
    }
    if (/^[0-9.+\-*/()%]$/.test(event.key)) {
      expression += event.key; justCalculated = false; showExpression();
    } else if (event.key === "Backspace") {
      expression = expression.slice(0, -1); showExpression();
    } else if (event.key === "Enter" || event.key === "=") {
      event.preventDefault(); calculate();
    } else if (event.key === "Escape") {
      expression = ""; showExpression();
    }
  });

  renderNotes();
  renderTasks();
  updateClock();
  setInterval(updateClock, 1000);
})();
