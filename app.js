const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxrt_kCz7PLVLou5ypsbMULPCI_AU3ZDONZ--H_91XIcSN_dEXFTA0DHkvy1xTNcBul/exec";

// Create your own secret key and paste the exact same value into google-apps-script.js.
// Example: "richie-2026-ab-tracker-CHANGE-ME"
const API_SECRET = "legos";

const form = document.getElementById("logForm");
const statusEl = document.getElementById("status");
const saveButton = document.getElementById("saveButton");
const todayLabel = document.getElementById("todayLabel");

function getLocalDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

todayLabel.textContent = new Date().toLocaleDateString(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric"
});

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = type;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (SCRIPT_URL.includes("PASTE_YOUR")) {
    setStatus("Add your Google Apps Script Web App URL in app.js first.", "error");
    return;
  }

  if (API_SECRET.includes("PASTE_YOUR")) {
    setStatus("Add your secret key in app.js first.", "error");
    return;
  }

  const payload = {
    secret: API_SECRET,
    date: getLocalDateString(),
    weight: document.getElementById("weight").value,
    calories: document.getElementById("calories").value,
    protein: document.getElementById("protein").value,
    steps: document.getElementById("steps").value,
    workout: document.getElementById("workout").value,
    notes: document.getElementById("notes").value
  };

  saveButton.disabled = true;
  setStatus("Saving...");

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    setStatus("Saved to Google Sheets.", "success");
    form.reset();
  } catch (error) {
    console.error(error);
    setStatus("Save failed. Check your script URL and deployment settings.", "error");
  } finally {
    saveButton.disabled = false;
  }
});
