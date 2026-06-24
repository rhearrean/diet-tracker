const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxrt_kCz7PLVLou5ypsbMULPCI_AU3ZDONZ--H_91XIcSN_dEXFTA0DHkvy1xTNcBul/exec";
const API_SECRET = "legos";

const form = document.getElementById("logForm");
const statusEl = document.getElementById("status");
const saveButton = document.getElementById("saveButton");
const todayLabel = document.getElementById("todayLabel");

function getLocalDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getFriendlyDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = type;
}

function setField(id, value) {
  document.getElementById(id).value = value ?? "";
}

function clearEntryFields() {
  setField("weight", "");
  setField("calories", "");
  setField("protein", "");
  setField("steps", "");
  setField("workout", "");
  setField("notes", "");
}

async function loadEntryForDate(date) {
  if (!date) return;
  if (SCRIPT_URL.includes("PASTE_YOUR") || API_SECRET.includes("PASTE_YOUR")) return;

  setStatus("Loading entry...");

  try {
    const url = `${SCRIPT_URL}?secret=${encodeURIComponent(API_SECRET)}&date=${encodeURIComponent(date)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.ok) {
      setStatus("Could not load entry.", "error");
      return;
    }

    if (!data.found) {
      clearEntryFields();
      setStatus("No entry found for this date.");
      return;
    }

    setField("weight", data.entry.weight);
    setField("calories", data.entry.calories);
    setField("protein", data.entry.protein);
    setField("steps", data.entry.steps);
    setField("workout", data.entry.workout);
    setField("notes", data.entry.notes);

    setStatus("Loaded saved entry.", "success");
  } catch (error) {
    console.error(error);
    setStatus("Could not load saved entry.", "error");
  }
}

todayLabel.textContent = getFriendlyDate();
document.getElementById("date").value = getLocalDateString();

document.getElementById("date").addEventListener("change", function () {
  loadEntryForDate(this.value);
});

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
    date: document.getElementById("date").value || getLocalDateString(),
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
  } catch (error) {
    console.error(error);
    setStatus("Save failed. Check your script URL and deployment settings.", "error");
  } finally {
    saveButton.disabled = false;
  }
});
