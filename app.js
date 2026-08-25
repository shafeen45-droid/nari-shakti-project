// ============================================================
// NARI SAATHI — app.js
// Vanilla JS SPA logic: language switching, tabs, search,
// category filters, bookmarks (localStorage), detail modal.
// ============================================================

const STORAGE_LANG = "narisaathi_lang";
const STORAGE_SAVED = "narisaathi_saved";

let state = {
  lang: localStorage.getItem(STORAGE_LANG) || "en",
  tab: "home", // home | schemes | jobs | saved
  category: "all",
  query: "",
  saved: JSON.parse(localStorage.getItem(STORAGE_SAVED) || "[]"),
};

function t(key) {
  return (UI[state.lang] && UI[state.lang][key]) || UI.en[key] || key;
}

// Get a localized field with graceful fallback to English
function loc(obj) {
  if (!obj) return "";
  return obj[state.lang] || obj.en || "";
}

function saveState() {
  localStorage.setItem(STORAGE_LANG, state.lang);
  localStorage.setItem(STORAGE_SAVED, JSON.stringify(state.saved));
}

function toggleSaved(id) {
  const idx = state.saved.indexOf(id);
  if (idx >= 0) state.saved.splice(idx, 1);
  else state.saved.push(id);
  saveState();
  render();
}

function isSaved(id) {
  return state.saved.includes(id);
}

// ---------- root render ----------
function render() {
  document.documentElement.lang = state.lang;
  renderTopbar();
  renderTabsAndBottomNav();
  renderMain();
}

function renderTopbar() {
  const el = document.getElementById("topbar");
  el.innerHTML = `
    <div class="topbar-inner">
      <a class="brand" href="#" data-nav="home">
        <span class="brand-mark"></span>
        <span>${t("appName")}</span>
      </a>
      <div class="topbar-search">
        <input id="searchInput" type="search" placeholder="${t("searchPlaceholder")}" value="${escapeAttr(state.query)}" />
      </div>
      <select class="lang-select" id="langSelect" aria-label="${t("languageLabel")}">
        ${LANGUAGES.map(l => `<option value="${l.code}" ${l.code === state.lang ? "selected" : ""}>${l.native}</option>`).join("")}
      </select>
    </div>
  `;
  el.querySelector("[data-nav='home']").addEventListener("click", (e) => {
    e.preventDefault();
    state.tab = "home";
    render();
  });
  el.querySelector("#langSelect").addEventListener("change", (e) => {
    state.lang = e.target.value;
    saveState();
    render();
  });
  const searchInput = el.querySelector("#searchInput");
  searchInput.addEventListener("input", (e) => {
    state.query = e.target.value;
    if (state.tab === "home") state.tab = "schemes";
    renderMain();
  });
}

function renderTabsAndBottomNav() {
  const tabsEl = document.getElementById("tabs");
  const tabs = [
    ["home", t("navHome"), "🏠"],
    ["schemes", t("navSchemes"), "📜"],
    ["jobs", t("navJobs"), "💼"],
    ["saved", t("navSaved"), "🔖"],
  ];
  tabsEl.innerHTML = tabs.map(([id, label]) =>
    `<button class="tab-btn ${state.tab === id ? "active" : ""}" data-tab="${id}">${label}</button>`
  ).join("");
  tabsEl.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => { state.tab = btn.dataset.tab; render(); });
  });

  const bottomNav = document.getElementById("bottomNav");
  bottomNav.innerHTML = tabs.map(([id, label, icon]) =>
    `<button class="${state.tab === id ? "active" : ""}" data-tab="${id}">
       <span class="nav-icon">${icon}</span><span>${label}</span>
     </button>`
  ).join("");
  bottomNav.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => { state.tab = btn.dataset.tab; render(); });
  });
}

function renderMain() {
  const main = document.getElementById("main");
  if (state.tab === "home") main.innerHTML = homeView();
  else if (state.tab === "schemes") main.innerHTML = schemesView();
  else if (state.tab === "jobs") main.innerHTML = jobsView();
  else if (state.tab === "saved") main.innerHTML = savedView();
  attachMainListeners();
}

// ---------- HOME ----------
function homeView() {
  const categories = ["education", "finance", "health", "entrepreneur", "safety", "employment", "housing"];
  return `
    <section class="hero">
      <div>
        <h1>${t("heroTitle")}</h1>
        <p>${t("heroSub")}</p>
        <div class="hero-actions">
          <button class="btn btn-primary" data-nav="schemes">${t("exploreSchemes")}</button>
          <button class="btn btn-secondary" data-nav="jobs">${t("exploreJobs")}</button>
        </div>
      </div>
      <div class="hero-art"><div class="hero-art-glyph">🧵</div></div>
    </section>
    <div class="thread-divider"></div>
    <div class="helpline" style="margin-top:20px;">
      <span style="font-size:1.4rem;">📞</span>
      <div><strong>${t("helplineTitle")}</strong><br/>${t("helplineText")}</div>
    </div>
    <section class="section">
      <div class="section-head"><h2>${t("categoriesTitle")}</h2></div>
      <div class="grid">
        ${categories.map(cat => `
          <div class="card" data-cat-nav="${cat}">
            <div class="badge">${CATEGORY_ICONS[cat]}</div>
            <h3>${t("cat" + capitalize(cat))}</h3>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ---------- SCHEMES ----------
function schemesView() {
  const cats = ["all", "education", "finance", "health", "entrepreneur", "safety", "employment", "housing"];
  const q = state.query.trim().toLowerCase();
  let list = SCHEMES.filter(s => state.category === "all" || s.category === state.category);
  if (q) {
    list = list.filter(s =>
      loc(s.name).toLowerCase().includes(q) ||
      loc(s.description).toLowerCase().includes(q) ||
      t("cat" + capitalize(s.category)).toLowerCase().includes(q)
    );
  }
  return `
    <section class="section">
      <div class="section-head">
        <h2>${t("schemesHeading")}</h2>
        <p>${t("schemesSub")}</p>
      </div>
      <div class="chip-row">
        ${cats.map(c => `<button class="chip ${state.category === c ? "active" : ""}" data-cat="${c}">${c === "all" ? t("allCategories") : t("cat" + capitalize(c))}</button>`).join("")}
      </div>
      ${list.length === 0 ? `<div class="empty-state">${t("noResults")}</div>` : `
      <div class="grid">
        ${list.map(schemeCard).join("")}
      </div>`}
    </section>
  `;
}

function schemeCard(s) {
  return `
    <div class="card" data-open-scheme="${s.id}">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="badge">${CATEGORY_ICONS[s.category]}</div>
        <button class="bookmark-btn" data-toggle-save="${s.id}" aria-label="${t("save")}">${isSaved(s.id) ? "🔖" : "🏷️"}</button>
      </div>
      <h3>${loc(s.name)}</h3>
      <p class="card-desc">${loc(s.description)}</p>
      <div class="card-foot"><span>${t("viewDetails")} →</span></div>
    </div>
  `;
}

// ---------- JOBS ----------
function jobsView() {
  const q = state.query.trim().toLowerCase();
  let list = JOB_RESOURCES;
  if (q) {
    list = list.filter(j => loc(j.name).toLowerCase().includes(q) || loc(j.description).toLowerCase().includes(q));
  }
  const groups = [
    ["central", t("centralGovt")],
    ["state", t("stateGovt")],
    ["private", t("private_")],
  ];
  return `
    <section class="section">
      <div class="section-head">
        <h2>${t("jobsHeading")}</h2>
        <p>${t("jobsSub")}</p>
      </div>
      ${list.length === 0 ? `<div class="empty-state">${t("noResults")}</div>` :
        groups.map(([g, label]) => {
          const items = list.filter(j => j.group === g);
          if (items.length === 0) return "";
          return `
            <h3 style="font-family:var(--font-display); color:var(--indigo); margin: 24px 0 12px;">${label}</h3>
            <div class="grid">
              ${items.map(jobCard).join("")}
            </div>
          `;
        }).join("")
      }
    </section>
  `;
}

function jobCard(j) {
  return `
    <div class="card job-card" data-open-job="${j.id}">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <span class="group-tag">${t(j.group === "central" ? "centralGovt" : j.group === "state" ? "stateGovt" : "private_")}</span>
        <button class="bookmark-btn" data-toggle-save="job-${j.id}" aria-label="${t("save")}">${isSaved("job-" + j.id) ? "🔖" : "🏷️"}</button>
      </div>
      <h3>${loc(j.name)}</h3>
      <p class="card-desc">${loc(j.description)}</p>
      <div class="card-foot"><span>${t("officialLink")} →</span></div>
    </div>
  `;
}

// ---------- SAVED ----------
function savedView() {
  const savedSchemes = SCHEMES.filter(s => isSaved(s.id));
  const savedJobs = JOB_RESOURCES.filter(j => isSaved("job-" + j.id));
  if (savedSchemes.length === 0 && savedJobs.length === 0) {
    return `<section class="section"><div class="empty-state">${t("savedEmpty")}</div></section>`;
  }
  return `
    <section class="section">
      <div class="section-head"><h2>${t("navSaved")}</h2></div>
      ${savedSchemes.length ? `<div class="grid">${savedSchemes.map(schemeCard).join("")}</div>` : ""}
      ${savedJobs.length ? `<div class="grid" style="margin-top:18px;">${savedJobs.map(jobCard).join("")}</div>` : ""}
    </section>
  `;
}

// ---------- listeners ----------
function attachMainListeners() {
  document.querySelectorAll("[data-nav]").forEach(el => {
    el.addEventListener("click", (e) => { e.preventDefault(); state.tab = el.dataset.nav; render(); });
  });
  document.querySelectorAll("[data-cat-nav]").forEach(el => {
    el.addEventListener("click", () => { state.tab = "schemes"; state.category = el.dataset.catNav; render(); });
  });
  document.querySelectorAll("[data-cat]").forEach(el => {
    el.addEventListener("click", () => { state.category = el.dataset.cat; renderMain(); });
  });
  document.querySelectorAll("[data-open-scheme]").forEach(el => {
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-toggle-save]")) return;
      openSchemeModal(el.dataset.openScheme);
    });
  });
  document.querySelectorAll("[data-open-job]").forEach(el => {
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-toggle-save]")) return;
      openJobModal(el.dataset.openJob);
    });
  });
  document.querySelectorAll("[data-toggle-save]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSaved(el.dataset.toggleSave);
    });
  });
}

// ---------- modal ----------
function openSchemeModal(id) {
  const s = SCHEMES.find(x => x.id === id);
  if (!s) return;
  showModal(`
    <span class="ministry-tag">${t("ministry")}: ${s.ministry}</span>
    <h2>${loc(s.name)}</h2>
    <div class="modal-block"><p>${loc(s.description)}</p></div>
    <div class="modal-block"><h4>${t("eligibility")}</h4><p>${loc(s.eligibility)}</p></div>
    <div class="modal-block"><h4>${t("benefits")}</h4><p>${loc(s.benefits)}</p></div>
    <div class="modal-block"><h4>${t("howToApply")}</h4><p>${loc(s.howToApply)}</p></div>
    <div class="modal-actions">
      <a class="btn btn-primary" href="${s.officialLink}" target="_blank" rel="noopener">${t("officialLink")} ↗</a>
      <button class="btn btn-secondary" data-toggle-save="${s.id}">${isSaved(s.id) ? t("unsave") : t("save")}</button>
    </div>
    <div class="disclaimer-box">${t("disclaimer")}</div>
  `);
}

function openJobModal(id) {
  const j = JOB_RESOURCES.find(x => x.id === id);
  if (!j) return;
  showModal(`
    <span class="ministry-tag">${t(j.group === "central" ? "centralGovt" : j.group === "state" ? "stateGovt" : "private_")}</span>
    <h2>${loc(j.name)}</h2>
    <div class="modal-block"><p>${loc(j.description)}</p></div>
    <div class="modal-actions">
      <a class="btn btn-primary" href="${j.link}" target="_blank" rel="noopener">${t("officialLink")} ↗</a>
      <button class="btn btn-secondary" data-toggle-save="job-${j.id}">${isSaved("job-" + j.id) ? t("unsave") : t("save")}</button>
    </div>
    <div class="disclaimer-box">${t("disclaimer")}</div>
  `);
}

function showModal(innerHtml) {
  const backdrop = document.getElementById("modalBackdrop");
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <button class="modal-close" id="modalCloseBtn" aria-label="${t("close")}">✕</button>
      ${innerHtml}
    </div>
  `;
  backdrop.style.display = "flex";
  backdrop.querySelector("#modalCloseBtn").addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });
  backdrop.querySelectorAll("[data-toggle-save]").forEach(el => {
    el.addEventListener("click", () => {
      toggleSaved(el.dataset.toggleSave);
      closeModal();
    });
  });
}

function closeModal() {
  const backdrop = document.getElementById("modalBackdrop");
  backdrop.style.display = "none";
  backdrop.innerHTML = "";
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

// ---------- init ----------
document.addEventListener("DOMContentLoaded", () => {
  render();

  // Register service worker for basic offline/PWA support
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});
