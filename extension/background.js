// Hello Friend — background.js
// Copyright (c) 2026 Vedant Chouhan
// Licensed under GNU GPL v3
// github.com/vedantchouhan/hello-friend

// ── Layer 1: Blocked domains ─────────────────────────────────────────────
const BLOCKED_DOMAINS = [
  "pornhub.com", "xvideos.com", "xnxx.com", "xhamster.com",
  "redtube.com", "youporn.com", "tube8.com", "beeg.com",
  "spankbang.com", "eporner.com", "tnaflix.com", "drtuber.com",
  "hardsextube.com", "slutload.com", "keezmovies.com", "4tube.com",
  "fux.com", "sexvid.xxx", "porn.com", "sex.com",
  "hentaihaven.xxx", "nhentai.net", "rule34.xxx", "e621.net",
  "gelbooru.com", "danbooru.donmai.us", "tbib.org",
  "xhamsterlive.com", "chaturbate.com", "bongacams.com",
  "stripchat.com", "camsoda.com", "myfreecams.com",
  "livejasmin.com", "cam4.com", "onlyfans.com", "fansly.com",
  "manyvids.com", "brazzers.com", "naughtyamerica.com",
  "realitykings.com", "bangbros.com", "mofos.com",
  "twistys.com", "digitalplayground.com", "adultfriendfinder.com",
  "redgifs.com", "scrolller.com", "eroprofile.com",
  "porntrex.com", "fullporner.com", "goodporn.to",
  "desixnxx.net", "desi49.com", "indiansexvideos.net",
  "masalaclips.com",
];

// ── Layer 2: Trigger keywords ─────────────────────────────────────────────
const TRIGGER_KEYWORDS = [
  "porn", "pornhub", "sex video", "xxx", "nude", "naked",
  "explicit", "nsfw", "hentai", "erotic", "onlyfans",
  "adult video", "hot girls", "sexy video", "boobs",
  "free porn", "watch porn", "porn sites", "best porn",
  "chudai", "chut", "lund", "desi sex", "indian sex",
  "desi porn", "sexy aunty", "bhabhi sex", "nangi",
  "nangi ladki", "gand",
];

// ── Search engines ────────────────────────────────────────────────────────
const SEARCH_ENGINES = [
  { host: "google.com",     param: "q" },
  { host: "bing.com",       param: "q" },
  { host: "yahoo.com",      param: "p" },
  { host: "duckduckgo.com", param: "q" },
  { host: "youtube.com",    param: "search_query" },
  { host: "yandex.com",     param: "text" },
];

function isDomainBlocked(url) {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return BLOCKED_DOMAINS.some(d =>
      hostname === d || hostname.endsWith("." + d)
    );
  } catch { return false; }
}

function isSearchBlocked(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace("www.", "");
    const engine = SEARCH_ENGINES.find(e =>
      hostname === e.host || hostname.endsWith("." + e.host)
    );
    if (!engine) return false;
    const query = parsed.searchParams.get(engine.param);
    if (!query) return false;
    const lq = query.toLowerCase();
    return TRIGGER_KEYWORDS.some(k => lq.includes(k.toLowerCase()));
  } catch { return false; }
}

function triggerIntervention(tabId) {
  chrome.tabs.sendMessage(tabId, { type: "SHOW_INTERVENTION" })
    .catch(() => {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"]
      }).then(() => {
        chrome.tabs.sendMessage(tabId, { type: "SHOW_INTERVENTION" });
      }).catch(() => {});
    });
}

// ── Monitor tabs ──────────────────────────────────────────────────────────
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && tab.url) {
    if (isDomainBlocked(tab.url) || isSearchBlocked(tab.url)) {
      triggerIntervention(tabId);
    }
  }
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;
  if (isDomainBlocked(details.url) || isSearchBlocked(details.url)) {
    triggerIntervention(details.tabId);
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId !== 0) return;
  if (isDomainBlocked(details.url) || isSearchBlocked(details.url)) {
    triggerIntervention(details.tabId);
  }
});

// ── Handle GO_HOME from content.js ───────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "GO_HOME" && sender.tab) {
    chrome.tabs.update(sender.tab.id, { url: "chrome://newtab" });
  }
});

// ── Open onboarding on first install ─────────────────────────────────────
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("onboarding.html")
    });
  }
});
