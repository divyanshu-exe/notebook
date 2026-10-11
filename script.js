(function () {
  var KEY = "notes-app:v1";
  var notes = [];
  var editingId = null;
  var form = document.getElementById("form");
  var titleEl = document.getElementById("title");
  var bodyEl = document.getElementById("body");
  var errEl = document.getElementById("err");
  var listEl = document.getElementById("list");
  var countEl = document.getElementById("count");

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      notes = Array.isArray(parsed) ? parsed : [];
    } catch (e) { notes = []; }
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) {}
  }

  function fmt(ts) {
    return new Date(ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }

  function button(label, cls, onClick, aria) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.textContent = label;
    if (aria) b.setAttribute("aria-label", aria);
    b.addEventListener("click", onClick);
    return b;
  }

  function renderEditing(n) {
    var li = document.createElement("li");

    var t = document.createElement("input");
    t.type = "text";
    t.maxLength = 120;
    t.value = n.title;
    t.placeholder = "Title";
    t.setAttribute("aria-label", "Edit title");

    var b = document.createElement("textarea");
    b.value = n.body;
    b.placeholder = "Write your note here";
    b.setAttribute("aria-label", "Edit note text");

    var err = document.createElement("span");
    err.className = "hint";
    err.setAttribute("role", "alert");

    var actions = document.createElement("div");
    actions.className = "actions";
    actions.appendChild(button("Cancel", "ghost", function () {
      editingId = null;
      render();
    }));
    actions.appendChild(button("Save changes", "save", function () {
      var nt = t.value.trim();
      var nb = b.value.trim();
      if (!nt && !nb) { err.textContent = "Add a title or some text first."; return; }
      n.title = nt;
      n.body = nb;
      n.updated = Date.now();
      persist();
      editingId = null;
      render();
    }));

    var meta = document.createElement("div");
    meta.className = "meta";
    meta.appendChild(err);
    meta.appendChild(actions);

    li.className = "editing";
    li.appendChild(t);
    li.appendChild(b);
    li.appendChild(meta);
    setTimeout(function () { t.focus(); }, 0);
    return li;
  }

  function renderNote(n) {
    var li = document.createElement("li");
    var h = document.createElement("h3");
    h.textContent = n.title || "Untitled";
    var p = document.createElement("p");
    p.textContent = n.body;

    var d = document.createElement("span");
    d.className = "date";
    d.textContent = n.updated ? "Edited " + fmt(n.updated) : fmt(n.created);

    var actions = document.createElement("div");
    actions.className = "actions";
    actions.appendChild(button("Edit", "edit", function () {
      editingId = n.id;
      render();
    }, "Edit note: " + (n.title || "Untitled")));
    actions.appendChild(button("Delete", "del", function () {
      notes = notes.filter(function (x) { return x.id !== n.id; });
      if (editingId === n.id) editingId = null;
      persist();
      render();
    }, "Delete note: " + (n.title || "Untitled")));

    var meta = document.createElement("div");
    meta.className = "meta";
    meta.appendChild(d);
    meta.appendChild(actions);

    li.appendChild(h);
    if (n.body) li.appendChild(p);
    li.appendChild(meta);
    return li;
  }

  function render() {
    listEl.innerHTML = "";
    countEl.textContent = notes.length + (notes.length === 1 ? " note" : " notes");

    if (!notes.length) {
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No notes yet. Write one above and save it.";
      listEl.appendChild(empty);
      return;
    }

    notes.forEach(function (n) {
      listEl.appendChild(n.id === editingId ? renderEditing(n) : renderNote(n));
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var t = titleEl.value.trim();
    var b = bodyEl.value.trim();
    if (!t && !b) { errEl.textContent = "Add a title or some text first."; return; }
    errEl.textContent = "";
    notes.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: t,
      body: b,
      created: Date.now()
    });
    persist();
    titleEl.value = "";
    bodyEl.value = "";
    titleEl.focus();
    render();
  });

  load();
  render();
})();
