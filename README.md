# 🙂 Hello Friend

> "A friend who shows up when you need it most."

A free, minimal browser extension that shows your own words back to you at the right moment. No ads. No premium. No data collected. Just you and your message.

---

## ⚠️ Disclaimer

This tool is built with respect for the user. It does not block, judge, or report anything. It simply reminds you of something you already decided — when you need it most.

---

## 🚀 What it does

- Shows your own personal message when you visit certain sites
- Detects explicit search queries before results load
- Scans page content using on-device AI
- Works in incognito mode (user-enabled)
- Two-step intervention — requires a conscious decision to proceed
- Everything runs locally — zero data leaves your device

---

## 🛡️ How it works — 3 Layers

**Layer 1 — Domain Blocklist**
Instantly detects 50+ known adult domains before the page loads.

**Layer 2 — Search Query Detection**
Monitors Google, Bing, YouTube, DuckDuckGo, Yahoo for trigger keywords in English and Hindi. Fires before results appear.

**Layer 3 — On-Device AI**
Uses Chrome's built-in Gemini Nano to analyze page context. Also runs a lightweight skin-tone heuristic on images. Works on Twitter, Reddit, Telegram Web, Google Images — anywhere.

---

## ⚙️ Installation

**Step 1 — Clone this repo:**
```bash
git clone https://github.com/vedantchouhan/hello-friend.git
cd hello-friend
```

**Step 2 — Load in Chrome:**
1. Open `chrome://extensions`
2. Toggle **Developer mode** ON (top right)
3. Click **Load unpacked**
4. Select the `extension` folder

**Step 3 — Enable in Incognito (important):**
1. Click **Details** on Hello Friend
2. Toggle **Allow in Incognito** ON

**Step 4 — Write your message:**
Click the 🙂 icon in Chrome toolbar → write something to your future self → Save.

---

## 💬 The Intervention

When a blocked site or search is detected, a full-screen overlay appears with your personal message and two options:

- **← take me back** → returns to new tab (easy path)
- **✕** → shows a second message, then lets you through (your choice, always)

The second message is always:
> *"Are you sure? There are better things than this. We are here for you bro."*

---

## 🔒 Privacy

- No server. No backend. No accounts.
- Your personal message is stored locally on your device only.
- No browsing history tracked.
- No analytics or telemetry.
- Open source — verify everything yourself.

---

## 📁 Project Structure

```
hello-friend/
└── extension/
    ├── manifest.json       # Extension config
    ├── background.js       # Layer 1 + 2 detection
    ├── content.js          # Layer 3 + overlay UI
    ├── popup.html          # Message setup
    ├── popup.css
    ├── popup.js
    ├── onboarding.html     # First-time setup guide
    └── icons/
```

---

## 🗺️ Roadmap

- Android app (UsageStats API for app monitoring)
- Safari extension
- Firefox support
- ContentShield AI — custom trained vision model replacing heuristics

---

## 📄 License

GNU GPL v3 — see [LICENSE](LICENSE) for details.
Free to use and modify. If you distribute it, keep it open source.

---

## 👤 Author

**Vedant Chouhan**
B.Tech CSE (AI/ML) — UPES Dehradun
[github.com/vedantchouhan](https://github.com/vedantchouhan)