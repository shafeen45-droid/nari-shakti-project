# Nari Saathi (नारी साथी)

A simple web app for women across India to find **government schemes (yojanas)** and **government job resources** — with eligibility, benefits, how to apply, and official links — in their own language.

No installation needed. No login needed. No backend/server needed. Just open it and use it.

---

## 🧵 What this app does

- **Yojanas** — browse real Government of India schemes for women (education, finance, health, business loans, safety, employment, housing), each with eligibility, benefits, how to apply, and a real official government link.
- **Govt Jobs** — links to official job portals (NCS, SSC, UPSC, IBPS, etc.) and women-focused job platforms. Live listings change daily, so this app links to the official source instead of storing job posts that go stale.
- **Search & category filters** — find things quickly.
- **Save/Bookmark** — tap the bookmark icon on any scheme or job to save it for later. Saved items stay on your device.
- **6 languages** — English, Hindi, Tamil, Telugu, Bengali, Marathi. Switch anytime from the top-right dropdown.
- **Works on mobile & desktop** — it's a PWA (Progressive Web App), so on a phone you can "Add to Home Screen" and it opens like a real app icon, even offline (for the app itself — official links still need internet).

---

## 🛠️ Tech stack (Frontend & Backend, explained simply)

| Layer | What it means | What's used here |
|---|---|---|
| **Frontend** | What the user sees and clicks — runs entirely on the user's own phone/laptop in the browser | HTML, CSS, vanilla JavaScript (no framework) |
| **Backend** | A separate server that stores shared data, handles logins, etc. | **None.** This app doesn't need one — all data lives in the app itself |
| **Database** | Where data is stored | **None (server-side).** Scheme/job content lives in `data.js`. Bookmarks are saved in the browser's `localStorage` on the user's own device |

Because there's no backend or database, there's nothing to install, host, or pay for just to run it — it's a fully static site.

---

## 📁 File structure

```
nari-saathi/
├── index.html      → Page structure/shell
├── styles.css       → All visual styling (colors, layout, fonts)
├── data.js          → ALL content: translations + schemes + job links
├── app.js           → App logic: search, filters, bookmarks, language switch, popups
├── manifest.json     → PWA settings (app name, icon, colors) — lets users "install" it
├── icon.svg          → App icon
├── sw.js             → Service worker — lets the app open even with a weak connection
└── README.md         → This file
```

**You will almost never need to touch `index.html`, `styles.css`, `app.js`, `manifest.json`, `icon.svg`, or `sw.js`.**
Nearly everything you'd want to update — schemes, jobs, translations — lives in **`data.js`** only.

---

## ✏️ How to add or edit content (no coding knowledge needed)

Open `data.js` in any text editor (like Notepad, VS Code, etc.)

### Add a new scheme
Copy an existing scheme block inside the `SCHEMES` list and edit the text:
```js
{
  id: "unique-id-no-spaces",
  category: "education", // education | finance | health | entrepreneur | safety | employment | housing
  ministry: "Name of the Ministry/Department",
  officialLink: "https://official-website.gov.in/",
  name: { en: "Scheme Name in English", hi: "योजना का नाम हिंदी में" },
  description: { en: "...", hi: "..." },
  eligibility: { en: "...", hi: "..." },
  benefits: { en: "...", hi: "..." },
  howToApply: { en: "...", hi: "..." },
}
```

### Add a new language to a scheme
Just add one more key — e.g. `ta` for Tamil:
```js
name: { en: "...", hi: "...", ta: "தமிழில் பெயர்" }
```
If a language is missing for a scheme, the app automatically shows English instead — so nothing breaks.

### Add a whole new UI language (e.g. Kannada)
In the `UI` object at the top of `data.js`, copy the `en: {...}` block, rename it `kn: {...}`, and translate each line. Also add it to the `LANGUAGES` list at the very top so it shows up in the language dropdown.

### Add a new job resource
Add a new block inside `JOB_RESOURCES`, following the same pattern as the existing ones.

---

## 🚀 How to run it

**Locally (what you're doing now):**
1. Unzip the folder
2. Double-click `index.html` — make sure it stays inside the same folder as `styles.css`, `app.js`, `data.js`, etc. (they must all sit together)

**Online (so anyone can visit a real link):**
This is a static site, so it can be hosted for **free** on:
- [Netlify](https://www.netlify.com/) — drag and drop the folder
- [GitHub Pages](https://pages.github.com/)
- [Vercel](https://vercel.com/)

Just ask, and I can walk you through hosting it step by step whenever you're ready.

---

## ⚠️ Important notes

- Scheme rules, amounts and links can change over time. Always double check on the official website (linked in each scheme's detail page) before applying.
- This app does **not** collect money, documents, or personal data from users — it only stores your bookmarks locally on your own device.
- Job listings shown are **portals**, not individual live job posts — always check the official site for current openings.
- Full scheme details are currently written in **English + Hindi**. Tamil, Telugu, Bengali and Marathi have the app's menus/buttons translated, but individual scheme text still falls back to English until filled in.

---

## 🙋 Credits

Built for helping women across India easily discover and access government schemes and job opportunities meant for them — all in one place, in the language they're comfortable in.
