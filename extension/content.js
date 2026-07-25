// Hello Friend — content.js
// Copyright (c) 2026 Vedant Chouhan
// Licensed under GNU GPL v3
// github.com/vedantchouhan/hello-friend

let interventionShown = false;
const FINAL_MESSAGE = "Are you sure?\nThere are better things than this.\nWe are here for you bro.";

// ── Layer 3a: Chrome Built-in AI (text/context analysis) ─────────────────
async function runChromeAICheck() {
  try {
    // Check if Chrome AI is available
    if (!('LanguageModel' in window)) return false;

    const availability = await LanguageModel.availability();
    if (availability === 'unavailable') return false;

    const session = await LanguageModel.create({
      systemPrompt: "You are a content safety classifier. You only respond with one word: 'explicit' or 'safe'."
    });

    const pageContext = [
      `URL: ${window.location.href}`,
      `Title: ${document.title}`,
      `H1: ${document.querySelector('h1')?.textContent?.slice(0, 200) || ''}`,
      `Meta: ${document.querySelector('meta[name="description"]')?.content?.slice(0, 200) || ''}`,
      `Content: ${document.body?.innerText?.slice(0, 500) || ''}`
    ].join('\n');

    const result = await session.prompt(
      `Does this webpage contain explicit adult/sexual content?\n${pageContext}`
    );

    session.destroy();
    return result.toLowerCase().includes('explicit');

  } catch (e) {
    return false;
  }
}

// ── Layer 3b: Skin tone heuristic (lightweight, no model needed) ──────────
function analyzeSkinTone(img) {
  try {
    const canvas = document.createElement('canvas');
    const size = 64; // Small sample — fast
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;

    let skinPixels = 0;
    let totalPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      if (a < 128) continue; // Skip transparent
      totalPixels++;

      // Skin tone detection (covers multiple ethnicities)
      if (
        r > 60 && g > 40 && b > 20 &&
        r > g && r > b &&
        Math.abs(r - g) > 10 &&
        r - b > 20 &&
        r < 250
      ) {
        skinPixels++;
      }
    }

    if (totalPixels === 0) return false;
    const skinRatio = skinPixels / totalPixels;
    return skinRatio > 0.42; // >42% skin tone = suspicious
  } catch {
    return false;
  }
}

// ── Layer 3: Run all checks ───────────────────────────────────────────────
async function runLayer3() {
  // 3a: Chrome AI context check
  const aiDetected = await runChromeAICheck();
  if (aiDetected) {
    showIntervention();
    return;
  }

  // 3b: Scan large images for skin tone
  const images = Array.from(document.querySelectorAll('img')).filter(img =>
    img.complete &&
    img.naturalWidth > 150 &&
    img.naturalHeight > 150 &&
    img.crossOrigin !== 'anonymous' // Skip CORS-protected images
  );

  let suspiciousCount = 0;
  const maxCheck = Math.min(images.length, 20); // Check max 20 images

  for (let i = 0; i < maxCheck; i++) {
    if (analyzeSkinTone(images[i])) {
      suspiciousCount++;
      if (suspiciousCount >= 3) { // 3+ suspicious images = trigger
        showIntervention();
        return;
      }
    }
  }
}

// ── Inject styles ─────────────────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById("hf-styles")) return;
  const style = document.createElement("style");
  style.id = "hf-styles";
  style.textContent = `
    @keyframes hf-fadein {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes hf-slidein {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes hf-bounce {
      0%   { transform: scale(0.4); opacity: 0; }
      55%  { transform: scale(1.2); opacity: 1; }
      75%  { transform: scale(0.92); }
      90%  { transform: scale(1.06); }
      100% { transform: scale(1); }
    }
    @keyframes hf-breathe {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.08); }
    }
    @keyframes hf-blink {
      0%, 85%, 100% { transform: scaleY(1); }
      92%           { transform: scaleY(0.06); }
    }
    @keyframes hf-glow {
      0%, 100% { text-shadow: 0 0 20px rgba(255,255,255,0.1); }
      50%      { text-shadow: 0 0 40px rgba(255,255,255,0.25); }
    }
    #hf-overlay {
      position: fixed !important;
      top: 0 !important; left: 0 !important;
      width: 100vw !important; height: 100vh !important;
      background: linear-gradient(135deg, #060608 0%, #0c0c10 100%) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      animation: hf-fadein 0.35s ease !important;
    }
    #hf-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: hf-slidein 0.45s cubic-bezier(0.22,1,0.36,1) 0.1s both;
    }
    #hf-smiley {
      font-size: 80px;
      line-height: 1;
      margin-bottom: 40px;
      display: inline-block;
      animation:
        hf-bounce 0.75s cubic-bezier(0.34,1.56,0.64,1) 0.2s both,
        hf-breathe 4s ease-in-out 1.2s infinite,
        hf-blink 5.5s ease-in-out 2.5s infinite,
        hf-glow 4s ease-in-out 1s infinite;
      user-select: none;
      cursor: default;
    }
    #hf-message {
      color: rgba(255,255,255,0.85) !important;
      font-size: 21px !important;
      font-weight: 400 !important;
      text-align: center !important;
      max-width: 500px !important;
      line-height: 1.8 !important;
      margin: 0 40px 52px !important;
      white-space: pre-line !important;
      letter-spacing: 0.15px !important;
    }
    #hf-back-btn {
      background: transparent !important;
      border: 1px solid rgba(255,255,255,0.12) !important;
      color: rgba(255,255,255,0.45) !important;
      font-size: 13px !important;
      padding: 11px 32px !important;
      border-radius: 100px !important;
      cursor: pointer !important;
      font-family: inherit !important;
      letter-spacing: 0.5px !important;
      transition: all 0.25s ease !important;
    }
    #hf-back-btn:hover {
      background: rgba(255,255,255,0.05) !important;
      color: rgba(255,255,255,0.75) !important;
      border-color: rgba(255,255,255,0.25) !important;
      transform: translateY(-1px) !important;
    }
    #hf-close {
      position: fixed !important;
      top: 18px !important; right: 22px !important;
      background: transparent !important;
      border: none !important;
      color: rgba(255,255,255,0.15) !important;
      font-size: 18px !important;
      cursor: pointer !important;
      padding: 8px 10px !important;
      line-height: 1 !important;
      transition: all 0.2s !important;
      font-family: inherit !important;
      border-radius: 50% !important;
    }
    #hf-close:hover {
      color: rgba(255,255,255,0.4) !important;
      background: rgba(255,255,255,0.05) !important;
    }
    #hf-dots {
      position: fixed !important;
      bottom: 32px !important;
      display: flex !important;
      gap: 6px !important;
    }
    .hf-dot {
      width: 5px !important;
      height: 5px !important;
      border-radius: 50% !important;
      background: rgba(255,255,255,0.15) !important;
      transition: background 0.3s !important;
    }
    .hf-dot.active {
      background: rgba(255,255,255,0.5) !important;
    }
  `;
  document.head.appendChild(style);
}

function removeOverlay() {
  const overlay = document.getElementById("hf-overlay");
  if (overlay) overlay.remove();
  const styles = document.getElementById("hf-styles");
  if (styles) styles.remove();
  document.body.style.overflow = "";
  interventionShown = false;
}

function showOverlay(message, stage) {
  const existing = document.getElementById("hf-overlay");
  if (existing) existing.remove();
  document.body.style.overflow = "hidden";

  const overlay = document.createElement("div");
  overlay.id = "hf-overlay";

  const smiley = document.createElement("div");
  smiley.id = "hf-smiley";
  smiley.textContent = "🙂";

  const msg = document.createElement("p");
  msg.id = "hf-message";
  msg.textContent = message;

  const backBtn = document.createElement("button");
  backBtn.id = "hf-back-btn";
  backBtn.textContent = "← take me back";
  backBtn.onclick = () => {
    removeOverlay();
    chrome.runtime.sendMessage({ type: "GO_HOME" });
  };

  const closeBtn = document.createElement("button");
  closeBtn.id = "hf-close";
  closeBtn.innerHTML = "&#x2715;";
  closeBtn.onclick = () => {
    if (stage === 1) {
      showOverlay(FINAL_MESSAGE, 2);
    } else {
      removeOverlay();
    }
  };

  const dots = document.createElement("div");
  dots.id = "hf-dots";
  const dot1 = document.createElement("div");
  dot1.className = "hf-dot" + (stage === 1 ? " active" : "");
  const dot2 = document.createElement("div");
  dot2.className = "hf-dot" + (stage === 2 ? " active" : "");
  dots.appendChild(dot1);
  dots.appendChild(dot2);

  const content = document.createElement("div");
  content.id = "hf-content";
  content.appendChild(smiley);
  content.appendChild(msg);
  content.appendChild(backBtn);

  overlay.appendChild(content);
  overlay.appendChild(closeBtn);
  overlay.appendChild(dots);
  document.documentElement.appendChild(overlay);
}

function showIntervention() {
  if (interventionShown) return;
  interventionShown = true;
  injectStyles();
  chrome.storage.local.get(["personalMessage"], (result) => {
    const message = result.personalMessage ||
      "Hey. You set this up because you made a promise to yourself.\nThat promise still matters.";
    showOverlay(message, 1);
  });
}

// ── Listen from background.js (Layer 1 + 2) ──────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_INTERVENTION") {
    showIntervention();
  }
});

// ── Run Layer 3 after page loads ──────────────────────────────────────────
if (document.readyState === 'complete') {
  runLayer3();
} else {
  window.addEventListener('load', runLayer3);
}

// Also watch for dynamic content (infinite scroll, SPAs)
let layer3Timer;
const observer = new MutationObserver(() => {
  clearTimeout(layer3Timer);
  layer3Timer = setTimeout(() => {
    if (!interventionShown) runLayer3();
  }, 1500);
});

document.addEventListener('DOMContentLoaded', () => {
  observer.observe(document.body, { childList: true, subtree: true });
});
