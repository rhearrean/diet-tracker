// Google Apps Script Backend v3
// Supports saving, preserving existing values on blank fields, hidden Settings sheet, and loading row data by date.

const SETTINGS_SHEET_NAME = "Settings";
const API_SECRET = "legos";

function getSetting(key, fallback) {
  const settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS_SHEET_NAME);
  if (!settingsSheet) return fallback;

  const lastRow = settingsSheet.getLastRow();
  if (lastRow < 1) return fallback;

  const values = settingsSheet.getRange(1, 1, lastRow, 2).getValues();

  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === key) return values[i][1];
  }

  return fallback;
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (!data.secret || data.secret !== API_SECRET) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: "Unauthorized" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const sheetName = getSetting("DailyLogSheet", "Daily Log");
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  const date = data.date || "";
  const values = [
    date,
    toNumberOrBlank(data.weight),
    toNumberOrBlank(data.calories),
    toNumberOrBlank(data.protein),
    toNumberOrBlank(data.steps),
    data.workout || "",
    data.notes || ""
  ];

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const dateValues = sheet.getRange(2, 1, Math.max(lastRow - 1, 1), 1).getValues().flat();

  let rowToUpdate = -1;

  for (let i = 0; i < dateValues.length; i++) {
    if (normalizeDate(dateValues[i]) === date) {
      rowToUpdate = i + 2;
      break;
    }
  }

  if (rowToUpdate === -1) rowToUpdate = lastRow + 1;

  const existingValues = sheet.getRange(rowToUpdate, 1, 1, 7).getValues()[0];
  const newValues = values.map((value, index) => {
    if (index === 0) return value;
    return value === "" ? existingValues[index] : value;
  });

  sheet.getRange(rowToUpdate, 1, 1, newValues.length).setValues([newValues]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, row: rowToUpdate }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const secret = e.parameter.secret;
  const date = e.parameter.date;

  if (!secret || secret !== API_SECRET) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: "Unauthorized" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const sheetName = getSetting("DailyLogSheet", "Daily Log");
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  const lastRow = Math.max(sheet.getLastRow(), 1);
  const rows = sheet.getRange(2, 1, Math.max(lastRow - 1, 1), 7).getValues();

  for (let i = 0; i < rows.length; i++) {
    if (normalizeDate(rows[i][0]) === date) {
      return ContentService
        .createTextOutput(JSON.stringify({
          ok: true,
          found: true,
          entry: {
            date: normalizeDate(rows[i][0]),
            weight: rows[i][1],
            calories: rows[i][2],
            protein: rows[i][3],
            steps: rows[i][4],
            workout: rows[i][5],
            notes: rows[i][6]
          }
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, found: false }))
    .setMimeType(ContentService.MimeType.JSON);
}

function toNumberOrBlank(value) {
  if (value === "" || value === null || value === undefined) return "";
  const number = Number(value);
  return isNaN(number) ? "" : number;
}

function normalizeDate(value) {
  if (!value) return "";

  if (Object.prototype.toString.call(value) === "[object Date]") {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }

  return String(value).slice(0, 10);
}
