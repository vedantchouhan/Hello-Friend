// Hello Friend — nsfw_scanner.js
// Copyright (c) 2026 Vedant Chouhan
// Licensed under GNU GPL v3
// github.com/vedantchouhan/hello-friend

// This script runs in PAGE context (injected via script tag)
// so it can access TensorFlow.js and NSFWJS

(async () => {
  // Load TensorFlow.js
  await loadScript(chrome.runtime.getURL('node_modules/@tensorflow/tfjs/dist/tf.min.js'));
  // Load NSFWJS
  await loadScript(chrome.runtime.getURL('node_modules/nsfwjs/dist/nsfwjs.min.js'));

  // Load model from local extension files
  const model = await nsfwjs.load(
    chrome.runtime.getURL('model/'),
    { size: 224 }
  );

  window.__hfModel = model;

  // Scan all images currently on page
  async function scanImages() {
    const images = Array.from(document.querySelectorAll('img'))
      .filter(img =>
        img.naturalWidth > 100 &&
        img.naturalHeight > 100 &&
        img.complete
      );

    for (const img of images) {
      try {
        const predictions = await window.__hfModel.classify(img);
        const porn = predictions.find(p => p.className === 'Porn');
        const sexy = predictions.find(p => p.className === 'Sexy');
        const hentai = predictions.find(p => p.className === 'Hentai');

        const explicitScore = (porn?.probability || 0) +
                              (sexy?.probability || 0) * 0.5 +
                              (hentai?.probability || 0);

        if (explicitScore > 0.75) {
          // Notify content script
          window.dispatchEvent(new CustomEvent('hf-explicit-detected', {
            detail: { score: explicitScore }
          }));
          break; // One detection is enough to trigger
        }
      } catch (e) {
        // Skip images that can't be classified (CORS etc.)
      }
    }
  }

  // Run on load
  if (document.readyState === 'complete') {
    scanImages();
  } else {
    window.addEventListener('load', scanImages);
  }

  // Also scan when new images are added (infinite scroll, dynamic content)
  const observer = new MutationObserver(() => {
    clearTimeout(window.__hfScanTimer);
    window.__hfScanTimer = setTimeout(scanImages, 800);
  });
  observer.observe(document.body, { childList: true, subtree: true });

})();

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    (document.head || document.documentElement).appendChild(script);
  });
}
