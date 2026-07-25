const messageInput = document.getElementById("messageInput");
const saveBtn = document.getElementById("saveBtn");
const savedMsg = document.getElementById("savedMsg");
const charCount = document.getElementById("charCount");

chrome.storage.local.get(["personalMessage"], (result) => {
  if (result.personalMessage) {
    messageInput.value = result.personalMessage;
    charCount.textContent = result.personalMessage.length;
  }
});

messageInput.addEventListener("input", () => {
  charCount.textContent = messageInput.value.length;
});

saveBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  chrome.storage.local.set({ personalMessage: message }, () => {
    savedMsg.classList.add("visible");
    setTimeout(() => savedMsg.classList.remove("visible"), 2000);
  });
});

messageInput.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") saveBtn.click();
});
