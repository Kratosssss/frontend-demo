const STORAGE_KEY = "freight-quote-library:v1";
const DEFAULTS_KEY = "freight-quote-defaults:v1";
const DEFAULTS_VERSION = 2;
const TERMS = ["FOB", "EXW", "CFR", "CIF", "DAP", "DDU", "DDP", "其他"];
const LEGACY_SEA_DEFAULT_REMARKS = [
  "Rates are subject to final confirmation at the time of booking.",
  "Any cancellation or dead freight charges incurred after booking confirmation shall be borne by the customer.",
  "Storage, demurrage, detention, or any other additional charges are not included and will be charged at actual cost if incurred.",
  "Monthly payment terms may be available upon approval; however, prepayment is required for the first shipment in accordance with company policy.",
];
const SEA_DEFAULT_REMARKS = [
  "Due to ongoing volatility in the international shipping and freight markets, all rates and space are subject to final carrier confirmation and availability at the time of booking.",
  "Sailing schedules are indicative only and may be subject to delay, change, or rollover due to carrier operations, port congestion, weather conditions, or other circumstances beyond our reasonable control.",
  "Any cancellation, amendment, no-show, or dead freight charges incurred after booking confirmation shall be borne by the customer.",
  "Demurrage, detention, truck waiting time, storage, port congestion surcharges, and any other additional charges are not included and will be charged at actual cost if incurred.",
  "Cargo insurance is not included in this quotation unless expressly stated otherwise in writing. Given the uncertainties associated with international transportation, cargo owners are strongly advised to arrange adequate goods-in-transit insurance before shipment. Insurance can be quoted separately upon request.",
  "Prepayment is required for the first shipment in accordance with company policy.",
];
const AIR_DEFAULT_REMARKS = [
  "Due to ongoing volatility in the international air freight market, all rates and space are subject to final airline confirmation and availability at the time of booking.",
  "Flight schedules are indicative only and may be subject to delay, change, or cargo offload due to airline operations, space constraints, weather conditions, or other circumstances beyond our reasonable control.",
  "The final chargeable weight is subject to the airline's verified weight and dimensions.",
  "Any cancellation, amendment, no-show, or other charges incurred after booking confirmation shall be borne by the customer.",
  "Truck waiting time, palletization, storage, and any other additional charges not expressly included in this quotation will be charged at actual cost if incurred.",
  "Cargo insurance is not included in this quotation unless expressly stated otherwise in writing. Given the uncertainties associated with international transportation, cargo owners are strongly advised to arrange adequate goods-in-transit insurance before shipment. Insurance can be quoted separately upon request.",
  "Prepayment is required for the first shipment in accordance with company policy.",
];
const SEA_FOB_DEFAULT_CHARGES = [
  ["Ocean Freight", "Per container / CBM", "USD 0.00", ""],
  ["Origin Charges", "Per shipment", "USD 0.00", ""],
  ["Other Charges", "At cost", "USD 0.00", ""],
];
const SEA_EXW_DEFAULT_CHARGES = [
  ["Ocean Freight", "Per container / CBM", "USD 0.00", ""],
  ["Booking Fee", "20GP / 40HC", "USD 75 / 95", ""],
  ["THC", "20GP / 40HC", "USD 125 / 185", ""],
  ["Custom Clearance", "Per set — shipper to provide customs documents", "USD 35", ""],
  ["DOC", "Per B/L", "USD 75", ""],
  ["VGM", "Per container", "USD 15", ""],
];
const AIR_DEFAULT_CHARGES = [
  ["Air Freight (Q100)", "Per KG", "USD 0.00", ""],
  ["Customs Clearance & DOC", "Per shipment", "USD 0.00", ""],
  ["Pickup", "Per shipment", "USD 0.00", ""],
];

const homeView = document.getElementById("homeView");
const editorView = document.getElementById("editorView");
const defaultsView = document.getElementById("defaultsView");
const editorCardHost = document.getElementById("editorCardHost");
const templateCardHost = document.getElementById("templateCardHost");
const quoteList = document.getElementById("quoteList");
const quoteCount = document.getElementById("quoteCount");
const quoteCard = document.getElementById("quoteCard");
const statusEl = document.getElementById("status");
const defaultStatusEl = document.getElementById("defaultStatus");
const editorTitle = document.getElementById("editorTitle");
const modeChip = document.getElementById("modeChip");

let defaults = readDefaults();
let library = readLibrary();
let currentQuoteId = null;
let currentMode = "sea";
let currentTemplateTerm = null;
let dirty = false;
let autoSaveTimer;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[char]);
}

function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return "quote-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function infoLabelHtml(label = "New Field") {
  return `<input class="info-label" value="${escapeHtml(label)}" placeholder="Field name" aria-label="信息字段名称">`;
}

function infoRemoveCellHtml() {
  return `<td class="info-remove-cell"><div class="row-controls">
    <button type="button" class="move-row" data-move-info-row="up" aria-label="上移信息行" title="上移这一行">↑</button>
    <button type="button" class="move-row" data-move-info-row="down" aria-label="下移信息行" title="下移这一行">↓</button>
    <button type="button" class="remove-info-row" data-remove-info-row aria-label="删除信息行" title="删除这一行">×</button>
  </div></td>`;
}

function chargeRemoveCellHtml() {
  return `<td class="remove-cell"><div class="row-controls">
    <button type="button" class="move-row" data-move-charge-row="up" aria-label="上移费用行" title="上移这一行">↑</button>
    <button type="button" class="move-row" data-move-charge-row="down" aria-label="下移费用行" title="下移这一行">↓</button>
    <button type="button" class="remove-row" data-remove-row aria-label="删除费用行" title="删除费用行">×</button>
  </div></td>`;
}

function columnHeaderHtml(label = "New Column", summaryRole = "") {
  return `<th class="column-head" data-col-id="${makeId()}"${summaryRole ? ` data-summary-role="${summaryRole}"` : ""}>
    <input class="column-name" value="${escapeHtml(label)}" placeholder="Column name" aria-label="费用列名称">
    <button type="button" class="remove-column" data-remove-column aria-label="删除 ${escapeHtml(label)} 列" title="删除这一列">×</button>
  </th>`;
}

function chargeRowHtml(values = [], columnCount = 4, summaryRole = "") {
  const cells = Array.from({ length: columnCount }, (_, index) => values[index] || "");
  return `<tr${summaryRole ? ` data-summary-role="${summaryRole}"` : ""}>
    ${cells.map((value) => `<td><input value="${escapeHtml(value)}" placeholder=""></td>`).join("")}
    ${chargeRemoveCellHtml()}
  </tr>`;
}

function infoRowHtml(label = "New Field", value = "") {
  return `<tr><th>${infoLabelHtml(label)}</th><td><input value="${escapeHtml(value)}" placeholder=""></td>${infoRemoveCellHtml()}</tr>`;
}

function defaultEditorHtml(mode, requestedTerm) {
  const isAir = mode === "air";
  const selectedTerm = isAir ? "EXW" : (requestedTerm || "FOB");
  const originLabel = isAir ? "AOL" : "POL";
  const destinationLabel = isAir ? "AOD" : "POD";
  const defaultOrigin = isAir ? "NGB" : "Ningbo, China";
  const title = isAir ? "Air Freight Quote" : "Ocean Freight Quote";
  const carrierLabel = isAir ? "Airline" : "Carrier";
  const cargoLabel = isAir ? "Cargo / Chargeable Weight" : "Cargo";
  const columns = [
    { label: "Charge" },
    { label: "Basis" },
    { label: "Unit Price", summaryRole: "unit-price" },
    { label: "Qty / Volume" },
  ];
  const charges = isAir
    ? AIR_DEFAULT_CHARGES
    : selectedTerm === "EXW" ? SEA_EXW_DEFAULT_CHARGES : SEA_FOB_DEFAULT_CHARGES;
  const remarks = (isAir ? AIR_DEFAULT_REMARKS : SEA_DEFAULT_REMARKS)
    .map((line) => isAir ? `• ${line}` : line)
    .join("\n");

  return `<div class="quote-card-head"><strong>${title}</strong><span>All rates are subject to final confirmation at the time of booking.</span></div>
    <div class="quote-body">
      <table class="info-table" role="presentation">
        <tbody>
          <tr><th>${infoLabelHtml("Term")}</th><td><select data-field="term">${TERMS.map((term) => `<option value="${term}"${term === selectedTerm ? " selected" : ""}>${term}</option>`).join("")}</select></td>${infoRemoveCellHtml()}</tr>
          <tr><th data-origin-label>${infoLabelHtml(originLabel)}</th><td><input data-field="origin" value="${defaultOrigin}" placeholder="Origin"></td>${infoRemoveCellHtml()}</tr>
          <tr><th data-destination-label>${infoLabelHtml(destinationLabel)}</th><td><input data-field="destination" value="" placeholder="Destination"></td>${infoRemoveCellHtml()}</tr>
          <tr data-address-row="pickup" hidden><th>${infoLabelHtml("Pickup Address")}</th><td><input data-field="pickup" value="" placeholder="Pickup address"></td>${infoRemoveCellHtml()}</tr>
          <tr data-address-row="delivery" hidden><th>${infoLabelHtml("Delivery Address")}</th><td><input data-field="delivery" value="" placeholder="Delivery address"></td>${infoRemoveCellHtml()}</tr>
          ${isAir ? `<tr><th>${infoLabelHtml("Commodity")}</th><td><input data-field="commodity" value="" placeholder="Commodity / HS Code"></td>${infoRemoveCellHtml()}</tr>` : ""}
          <tr><th>${infoLabelHtml(cargoLabel)}</th><td><input data-field="cargo" value="" placeholder="${isAir ? "Packages / GW / Volume / Chargeable weight" : "Commodity / HS Code / Volume / CBM"}"></td>${infoRemoveCellHtml()}</tr>
          ${isAir ? "" : `<tr><th>${infoLabelHtml("Equipment")}</th><td><input data-field="equipment" value="" placeholder="20GP / 40HC"></td>${infoRemoveCellHtml()}</tr>`}
          <tr><th>${infoLabelHtml(carrierLabel)}</th><td><input data-field="carrier" value="" placeholder="${carrierLabel}"></td>${infoRemoveCellHtml()}</tr>
          ${isAir ? "" : `<tr data-fob-ocean-freight-row><th>${infoLabelHtml("O/F")}</th><td><input data-field="oceanFreight" value="" placeholder="USD 0.00 / container"></td>${infoRemoveCellHtml()}</tr>`}
          <tr><th>${infoLabelHtml("Routing")}</th><td><input data-field="routing" value="" placeholder="Direct / via / transfer point"></td>${infoRemoveCellHtml()}</tr>
          <tr><th>${infoLabelHtml("ETD")}</th><td><input data-field="etd" value="" placeholder="ETD / sailing date"></td>${infoRemoveCellHtml()}</tr>
          <tr><th>${infoLabelHtml("Estimated T/T")}</th><td><input data-field="transit" value="" placeholder="Estimated transit time"></td>${infoRemoveCellHtml()}</tr>
          <tr><th>${infoLabelHtml("Valid Until")}</th><td><input data-field="validUntil" value="" placeholder="DD-MMM-YYYY"></td>${infoRemoveCellHtml()}</tr>
        </tbody>
      </table>
      <div class="info-tools"><button type="button" class="add-row-btn" data-add-info-row>＋ 添加信息行</button></div>
      <div class="charges" data-secondary-charges>
        <h3>Charges</h3>
        <div class="charges-table-wrap"><table class="charges-table" role="presentation">
          <thead><tr>${columns.map((column) => columnHeaderHtml(column.label, column.summaryRole)).join("")}<th class="remove-cell" aria-label="操作"></th></tr></thead>
          <tbody data-charge-rows>${charges.map((row, index) => chargeRowHtml(row, columns.length, index === 0 ? (isAir ? "air-freight" : "ocean-freight") : "")).join("")}</tbody>
        </table></div>
        <div class="column-tools">
          <button type="button" class="add-row-btn" data-add-row>＋ 添加费用行</button>
          <button type="button" class="add-row-btn" data-add-column>＋ 添加列</button>
        </div>
      </div>
      <div class="remarks">
        <h3>Remarks</h3>
        <textarea data-field="remarks">${escapeHtml(remarks)}</textarea>
      </div>
    </div>`;
}

function builtInSeaTemplate(term) {
  return defaultEditorHtml("sea", term);
}

function migrateSeaDefaultTemplate(template, savedVersion) {
  if (typeof template !== "string" || savedVersion >= DEFAULTS_VERSION) return template;
  const legacyRemarks = LEGACY_SEA_DEFAULT_REMARKS.join("\n");
  const nextRemarks = SEA_DEFAULT_REMARKS.join("\n");
  return template.replace(legacyRemarks, nextRemarks);
}

function readDefaults() {
  const builtIn = {
    version: DEFAULTS_VERSION,
    sea: {
      FOB: builtInSeaTemplate("FOB"),
      EXW: builtInSeaTemplate("EXW"),
    },
  };
  try {
    const parsed = JSON.parse(localStorage.getItem(DEFAULTS_KEY));
    const result = {
      version: DEFAULTS_VERSION,
      sea: {
        FOB: typeof parsed?.sea?.FOB === "string" ? migrateSeaDefaultTemplate(parsed.sea.FOB, parsed.version) : builtIn.sea.FOB,
        EXW: typeof parsed?.sea?.EXW === "string" ? migrateSeaDefaultTemplate(parsed.sea.EXW, parsed.version) : builtIn.sea.EXW,
      },
    };
    if (!parsed || parsed.version !== DEFAULTS_VERSION || result.sea.FOB !== parsed?.sea?.FOB || result.sea.EXW !== parsed?.sea?.EXW) {
      localStorage.setItem(DEFAULTS_KEY, JSON.stringify(result));
    }
    return result;
  } catch {
    return builtIn;
  }
}

function writeDefaults() {
  try {
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(defaults));
    return true;
  } catch {
    setDefaultStatus("当前浏览器无法保存默认模板。", true);
    return false;
  }
}

function syncFormAttributes(root) {
  root.querySelectorAll("input").forEach((input) => input.setAttribute("value", input.value));
  root.querySelectorAll("textarea").forEach((textarea) => {
    textarea.textContent = textarea.value;
  });
  root.querySelectorAll("select").forEach((select) => {
    [...select.options].forEach((option) => option.toggleAttribute("selected", option.selected));
  });
}

function createExampleQuote() {
  const holder = document.createElement("div");
  holder.innerHTML = defaults.sea.FOB;
  const values = {
    destination: "Los Angeles, USA",
    cargo: "General cargo / 28 CBM",
    equipment: "40HC",
    carrier: "Example Carrier",
    oceanFreight: "USD 1,850 / 40HC",
    routing: "Direct",
    transit: "18 days",
    validUntil: "31-AUG-2026",
  };
  Object.entries(values).forEach(([field, value]) => {
    const control = holder.querySelector(`[data-field="${field}"]`);
    if (control) control.value = value;
  });
  syncFormAttributes(holder);
  const now = new Date().toISOString();
  return {
    id: makeId(),
    mode: "sea",
    term: "FOB",
    origin: "Ningbo, China",
    destination: values.destination,
    equipment: values.equipment,
    freightUnitPrice: values.oceanFreight,
    airline: "",
    airFreightUnitPrice: "",
    quoteHtml: holder.innerHTML,
    createdAt: now,
    updatedAt: now,
    example: true,
  };
}

function readLibrary() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && Array.isArray(parsed.quotes)) {
      const normalized = {
        version: 1,
        initialized: true,
        quotes: parsed.quotes,
      };
      if (parsed.initialized !== true) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
      return normalized;
    }
  } catch {
    // Invalid local data is treated as an uninitialized library.
  }
  const initializedLibrary = {
    version: 1,
    initialized: true,
    quotes: [createExampleQuote()],
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initializedLibrary));
  } catch {
    // The in-memory example remains usable; save operations will report the storage failure.
  }
  return initializedLibrary;
}

function writeLibrary() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    return true;
  } catch {
    setStatus("当前浏览器无法保存本地目录，请使用“下载 HTML”留档。", true);
    return false;
  }
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function readControlValue(root, selector) {
  const control = root.querySelector(selector);
  if (!control) return "";
  return String(control.value || control.getAttribute?.("value") || control.textContent || "").trim();
}

function readFreightSummary(root, mode) {
  const equipment = mode === "sea" ? readControlValue(root, '[data-field="equipment"]') : "";
  const carrier = readControlValue(root, '[data-field="carrier"]');
  const routing = readControlValue(root, '[data-field="routing"]');
  const directOceanFreight = readControlValue(root, '[data-field="oceanFreight"]');
  const table = root.querySelector(".charges-table");
  const headers = [...(table?.querySelectorAll("thead th") || [])].filter((cell) => !cell.classList.contains("remove-cell"));
  let priceIndex = headers.findIndex((cell) => cell.dataset.summaryRole === "unit-price");
  if (priceIndex < 0) {
    priceIndex = headers.findIndex((cell) => /unit price|amount \/ price/i.test(readControlValue(cell, ".column-name") || cell.textContent));
  }
  const rows = [...(table?.querySelectorAll("[data-charge-rows] tr") || [])];
  const role = mode === "air" ? "air-freight" : "ocean-freight";
  const label = mode === "air" ? /^air freight\b/i : /ocean freight/i;
  const freightRow = rows.find((row) => row.dataset.summaryRole === role)
    || rows.find((row) => label.test(readControlValue(row, "td input") || ""));
  const priceCell = freightRow && priceIndex >= 0 ? freightRow.children[priceIndex] : null;
  const tablePrice = priceCell ? readControlValue(priceCell, "input") || priceCell.textContent.trim() : "";
  return {
    equipment,
    freightUnitPrice: mode === "sea" ? (directOceanFreight || tablePrice) : "",
    airline: mode === "air" ? [carrier, routing].filter(Boolean).join(" / ") : "",
    airFreightUnitPrice: mode === "air" ? tablePrice : "",
  };
}

function summaryForQuote(quote) {
  if (quote.mode === "sea" && (quote.equipment || quote.freightUnitPrice)) {
    return { equipment: quote.equipment || "", freightUnitPrice: quote.freightUnitPrice || "" };
  }
  if (quote.mode === "air" && (quote.airline || quote.airFreightUnitPrice)) {
    return { airline: quote.airline || "", airFreightUnitPrice: quote.airFreightUnitPrice || "" };
  }
  const holder = document.createElement("template");
  holder.innerHTML = quote.quoteHtml || "";
  return readFreightSummary(holder.content, quote.mode === "air" ? "air" : "sea");
}

function renderHome() {
  const quotes = [...library.quotes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  quoteCount.textContent = quotes.length + " 条";
  if (!quotes.length) {
    quoteList.innerHTML = '<div class="empty"><strong>还没有保存的报价</strong>点击上方“新建海运”或“新建空运”开始报价。</div>';
    return;
  }
  quoteList.innerHTML = quotes.map((quote) => {
    const mode = quote.mode === "air" ? "air" : "sea";
    const modeName = mode === "air" ? "空运" : "海运";
    const origin = quote.origin || "未填写起运地";
    const destination = quote.destination || "未填写目的地";
    const summary = summaryForQuote(quote);
    const meta = mode === "air"
      ? `<span class="route-meta"><span>航司/路线：${escapeHtml(summary.airline || "未填写")}</span><span>空运费单价：${escapeHtml(summary.airFreightUnitPrice || "未填写")}</span></span>`
      : `<span class="route-meta"><span>柜型：${escapeHtml(summary.equipment || "未填写")}</span><span>海运费单价：${escapeHtml(summary.freightUnitPrice || "未填写")}</span></span>`;
    return `<article class="quote-capsule ${mode}" role="button" tabindex="0" data-quote-id="${escapeHtml(quote.id)}" aria-label="打开 ${modeName} ${escapeHtml(quote.term)} ${escapeHtml(origin)} 到 ${escapeHtml(destination)}">
      <div class="mode-label">${modeName}</div>
      <div class="route"><small>${escapeHtml(quote.term || "未填写 TERM")}</small><span class="route-main">${escapeHtml(origin)} → ${escapeHtml(destination)}</span>${meta}</div>
      <div class="updated">更新于 ${escapeHtml(formatDate(quote.updatedAt))}</div>
      <button class="delete-capsule" type="button" data-delete-quote="${escapeHtml(quote.id)}" aria-label="删除这条报价" title="删除报价">×</button>
    </article>`;
  }).join("");
}

function editorField(name) {
  return quoteCard.querySelector(`[data-field="${name}"]`);
}

function ensureEditableStructure() {
  const infoTable = quoteCard.querySelector(".info-table");
  if (infoTable) {
    infoTable.querySelectorAll("tbody tr").forEach((row) => {
      const labelCell = row.querySelector("th");
      if (labelCell && !labelCell.querySelector(".info-label")) {
        labelCell.innerHTML = infoLabelHtml(labelCell.textContent.trim() || "New Field");
      }
      const actionCell = row.querySelector(".info-remove-cell");
      if (!actionCell) row.insertAdjacentHTML("beforeend", infoRemoveCellHtml());
      else if (!actionCell.querySelector("[data-move-info-row]")) actionCell.outerHTML = infoRemoveCellHtml();
    });
    if (!quoteCard.querySelector("[data-add-info-row]")) {
      infoTable.insertAdjacentHTML("afterend", '<div class="info-tools"><button type="button" class="add-row-btn" data-add-info-row>＋ 添加信息行</button></div>');
    }
  }

  const table = quoteCard.querySelector(".charges-table");
  if (!table) return;
  const headerRow = table.querySelector("thead tr");
  [...headerRow.children].filter((cell) => !cell.classList.contains("remove-cell")).forEach((cell, index) => {
    if (cell.dataset.colId) return;
    const oldLabel = cell.textContent.trim() || `Column ${index + 1}`;
    const label = oldLabel === "Amount / Price" ? "Unit Price" : oldLabel;
    cell.outerHTML = columnHeaderHtml(label, label === "Unit Price" ? "unit-price" : "");
  });
  if (!headerRow.querySelector(".remove-cell")) {
    headerRow.insertAdjacentHTML("beforeend", '<th class="remove-cell" aria-label="操作"></th>');
  }
  table.querySelectorAll("[data-charge-rows] tr").forEach((row) => {
    const actionCell = row.querySelector(".remove-cell");
    if (!actionCell) row.insertAdjacentHTML("beforeend", chargeRemoveCellHtml());
    else if (!actionCell.querySelector("[data-move-charge-row]")) actionCell.outerHTML = chargeRemoveCellHtml();
  });
  const dataHeaders = [...headerRow.querySelectorAll("[data-col-id]")];
  const priceHeader = dataHeaders.find((cell) => /unit price|amount \/ price/i.test(readControlValue(cell, ".column-name") || cell.textContent));
  if (priceHeader) priceHeader.dataset.summaryRole = "unit-price";
  const rows = [...table.querySelectorAll("[data-charge-rows] tr")];
  const freightPattern = currentMode === "air" ? /^air freight\b/i : /ocean freight/i;
  const freightRow = rows.find((row) => freightPattern.test(readControlValue(row, "td input") || ""));
  if (freightRow) freightRow.dataset.summaryRole = currentMode === "air" ? "air-freight" : "ocean-freight";
  if (!table.parentElement.classList.contains("charges-table-wrap")) {
    const wrapper = document.createElement("div");
    wrapper.className = "charges-table-wrap";
    table.parentElement.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  }
  const charges = table.closest(".charges");
  if (charges && !charges.querySelector("[data-add-column]")) {
    charges.insertAdjacentHTML("beforeend", '<div class="column-tools"><button type="button" class="add-row-btn" data-add-row>＋ 添加费用行</button><button type="button" class="add-row-btn" data-add-column>＋ 添加列</button></div>');
  }
}

function updateAddressVisibility() {
  const term = editorField("term")?.value || "";
  const pickupRow = quoteCard.querySelector('[data-address-row="pickup"]');
  const deliveryRow = quoteCard.querySelector('[data-address-row="delivery"]');
  const fobOceanFreightRow = quoteCard.querySelector("[data-fob-ocean-freight-row]");
  const secondaryCharges = quoteCard.querySelector("[data-secondary-charges]");
  if (pickupRow) pickupRow.hidden = !["EXW", "DAP", "DDU", "DDP"].includes(term);
  if (deliveryRow) deliveryRow.hidden = !["DAP", "DDU", "DDP"].includes(term);
  if (fobOceanFreightRow) fobOceanFreightRow.hidden = term !== "FOB";
  if (secondaryCharges) {
    secondaryCharges.hidden = currentMode === "sea" && term === "FOB" && Boolean(fobOceanFreightRow);
  }
}

function loadQuoteHtml(html, term) {
  quoteCard.innerHTML = html;
  ensureEditableStructure();
  const termField = editorField("term");
  if (termField && term) termField.value = term;
  updateAddressVisibility();
}

function showEditor(title) {
  homeView.hidden = true;
  defaultsView.hidden = true;
  editorView.hidden = false;
  editorCardHost.appendChild(quoteCard);
  editorTitle.textContent = title;
  modeChip.textContent = currentMode === "air" ? "空运" : "海运";
  modeChip.className = "mode-chip " + currentMode;
  document.title = title + "｜海运空运报价目录";
  window.scrollTo(0, 0);
}

function openNew(mode) {
  currentTemplateTerm = null;
  currentQuoteId = null;
  currentMode = mode === "air" ? "air" : "sea";
  dirty = false;
  showEditor(currentMode === "air" ? "新建空运报价" : "新建海运报价");
  loadQuoteHtml(currentMode === "air" ? defaultEditorHtml("air") : defaults.sea.FOB, currentMode === "air" ? "EXW" : "FOB");
  setStatus("填写完成后点击“保存报价”，它会出现在主页目录中。");
}

function openExisting(id) {
  const quote = library.quotes.find((item) => item.id === id);
  if (!quote) return;
  currentTemplateTerm = null;
  currentQuoteId = quote.id;
  currentMode = quote.mode === "air" ? "air" : "sea";
  dirty = false;
  showEditor("编辑" + (currentMode === "air" ? "空运" : "海运") + "报价");
  loadQuoteHtml(quote.quoteHtml || defaultEditorHtml(currentMode, quote.term), quote.term);
  setStatus("已打开保存于 " + formatDate(quote.updatedAt) + " 的报价。");
}

function serializeCard({ forTemplate = false } = {}) {
  syncFormAttributes(quoteCard);
  const clone = quoteCard.cloneNode(true);
  if (forTemplate) {
    const term = clone.querySelector('[data-field="term"]');
    if (term) {
      term.disabled = false;
      term.removeAttribute("disabled");
      term.removeAttribute("data-template-fixed");
    }
  }
  return clone.innerHTML;
}

function saveCurrent(silent = false) {
  if (currentTemplateTerm) return false;
  const term = editorField("term")?.value || "";
  const origin = editorField("origin")?.value.trim() || "";
  const destination = editorField("destination")?.value.trim() || "";
  const summary = readFreightSummary(quoteCard, currentMode);
  const now = new Date().toISOString();
  const quoteHtml = serializeCard();
  if (currentQuoteId) {
    const quote = library.quotes.find((item) => item.id === currentQuoteId);
    if (!quote) return false;
    Object.assign(quote, {
      mode: currentMode,
      term,
      origin,
      destination,
      equipment: summary.equipment || "",
      freightUnitPrice: summary.freightUnitPrice || "",
      airline: summary.airline || "",
      airFreightUnitPrice: summary.airFreightUnitPrice || "",
      quoteHtml,
      updatedAt: now,
    });
  } else {
    currentQuoteId = makeId();
    library.quotes.push({
      id: currentQuoteId,
      mode: currentMode,
      term,
      origin,
      destination,
      equipment: summary.equipment || "",
      freightUnitPrice: summary.freightUnitPrice || "",
      airline: summary.airline || "",
      airFreightUnitPrice: summary.airFreightUnitPrice || "",
      quoteHtml,
      createdAt: now,
      updatedAt: now,
    });
    editorTitle.textContent = "编辑" + (currentMode === "air" ? "空运" : "海运") + "报价";
  }
  const saved = writeLibrary();
  dirty = !saved;
  if (saved) setStatus(silent ? "修改已自动保存。" : "报价已保存，可返回主页查看目录。");
  return saved;
}

function markDirty() {
  dirty = true;
  if (currentTemplateTerm) {
    setDefaultStatus("当前模板有未保存修改，请点击“保存当前模板”。");
    return;
  }
  if (!currentQuoteId) {
    setStatus("尚未保存。");
    return;
  }
  setStatus("正在保存修改…");
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => saveCurrent(true), 650);
}

function showHome() {
  clearTimeout(autoSaveTimer);
  if (!currentQuoteId && dirty && !confirm("这份新报价还没有保存，确定返回主页吗？")) return;
  if (currentQuoteId && dirty) saveCurrent(true);
  currentQuoteId = null;
  currentTemplateTerm = null;
  dirty = false;
  editorView.hidden = true;
  defaultsView.hidden = true;
  homeView.hidden = false;
  editorCardHost.appendChild(quoteCard);
  document.title = "海运空运报价目录";
  renderHome();
  window.scrollTo(0, 0);
}

function loadTemplateEditor(term) {
  currentTemplateTerm = term;
  currentMode = "sea";
  loadQuoteHtml(defaults.sea[term], term);
  const termField = editorField("term");
  if (termField) {
    termField.value = term;
    termField.disabled = true;
    termField.dataset.templateFixed = "true";
  }
  document.querySelectorAll("[data-template-term]").forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.templateTerm === term));
  });
  dirty = false;
  setDefaultStatus(`${term} 默认模板：Term 固定，可编辑其他字段、费用结构和内容。`);
}

function openDefaults() {
  clearTimeout(autoSaveTimer);
  currentQuoteId = null;
  currentTemplateTerm = "FOB";
  currentMode = "sea";
  dirty = false;
  homeView.hidden = true;
  editorView.hidden = true;
  defaultsView.hidden = false;
  templateCardHost.appendChild(quoteCard);
  loadTemplateEditor("FOB");
  document.title = "默认模板设置｜海运空运报价目录";
  window.scrollTo(0, 0);
}

function leaveDefaults() {
  if (dirty && !confirm("当前默认模板有未保存修改，确定返回主页吗？")) return;
  currentTemplateTerm = null;
  dirty = false;
  defaultsView.hidden = true;
  homeView.hidden = false;
  editorCardHost.appendChild(quoteCard);
  document.title = "海运空运报价目录";
  renderHome();
}

function saveDefaultTemplate() {
  if (!currentTemplateTerm) return;
  const termField = editorField("term");
  if (termField) termField.value = currentTemplateTerm;
  defaults.sea[currentTemplateTerm] = serializeCard({ forTemplate: true });
  if (writeDefaults()) {
    dirty = false;
    setDefaultStatus(`${currentTemplateTerm} 默认模板已显式保存；已保存报价不会被改动。`);
  }
}

function restoreDefaultTemplate() {
  if (!currentTemplateTerm) return;
  if (!confirm(`确定恢复 ${currentTemplateTerm} 内置模板吗？当前默认模板会被替换。`)) return;
  if (!confirm(`再次确认恢复 ${currentTemplateTerm} 内置模板。此操作不会修改已保存报价。`)) return;
  defaults.sea[currentTemplateTerm] = builtInSeaTemplate(currentTemplateTerm);
  if (writeDefaults()) {
    loadTemplateEditor(currentTemplateTerm);
    setDefaultStatus(`${currentTemplateTerm} 已恢复为内置模板。`);
  }
}

function switchTemplateTerm(term) {
  if (term === currentTemplateTerm) return;
  if (dirty && !confirm("当前模板有未保存修改，确定切换并放弃这些修改吗？")) return;
  loadTemplateEditor(term);
}

function handleTermChange(term) {
  if (currentTemplateTerm || currentMode !== "sea" || !["FOB", "EXW"].includes(term)) {
    updateAddressVisibility();
    markDirty();
    return;
  }
  const loadTemplate = confirm(`是否加载海运 ${term} 默认模板？\n\n确认：当前报价内容会被该模板覆盖。\n取消：只修改 Term，保留当前内容。`);
  if (loadTemplate) {
    loadQuoteHtml(defaults.sea[term], term);
    setStatus(`已加载海运 ${term} 默认模板，当前报价内容已覆盖。`);
  } else {
    updateAddressVisibility();
    setStatus(`已切换为 ${term}，未加载默认模板。`);
  }
  markDirty();
}

function resetEditor() {
  if (!confirm("确定恢复为这类报价的默认内容吗？当前填写内容会被替换。")) return;
  const term = editorField("term")?.value || (currentMode === "air" ? "EXW" : "FOB");
  const html = currentMode === "air"
    ? defaultEditorHtml("air")
    : (["FOB", "EXW"].includes(term) ? defaults.sea[term] : defaultEditorHtml("sea", term));
  loadQuoteHtml(html, term);
  markDirty();
  setStatus(currentQuoteId ? "已恢复默认，正在保存。" : "已恢复默认，尚未保存。");
}

function moveEditableRow(button, direction, label) {
  const row = button.closest("tr");
  const sibling = direction === "up" ? row?.previousElementSibling : row?.nextElementSibling;
  if (!row || !sibling) {
    const message = `${label}已经在最${direction === "up" ? "上" : "下"}方。`;
    currentTemplateTerm ? setDefaultStatus(message, true) : setStatus(message, true);
    return;
  }
  if (direction === "up") row.parentElement.insertBefore(row, sibling);
  else row.parentElement.insertBefore(sibling, row);
  markDirty();
}

function addChargeColumn() {
  const table = quoteCard.querySelector(".charges-table");
  const headerRow = table?.querySelector("thead tr");
  const actionHeader = headerRow?.querySelector(".remove-cell");
  if (!table || !headerRow || !actionHeader) return;
  const count = headerRow.querySelectorAll("[data-col-id]").length;
  actionHeader.insertAdjacentHTML("beforebegin", columnHeaderHtml(`Column ${count + 1}`));
  table.querySelectorAll("[data-charge-rows] tr").forEach((row) => {
    row.querySelector(".remove-cell")?.insertAdjacentHTML("beforebegin", '<td><input value="" placeholder=""></td>');
  });
  const nameInput = headerRow.querySelectorAll("[data-col-id]")[count]?.querySelector(".column-name");
  nameInput?.focus();
  nameInput?.select();
  markDirty();
}

function createExportRemarks(value) {
  const replacement = document.createElement("div");
  replacement.dataset.exportRemarks = "true";
  String(value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).forEach((line) => {
    const item = document.createElement("div");
    item.style.cssText = "display:block;margin:3px 0;padding-left:16px;text-indent:-16px;";
    item.textContent = "• " + line.replace(/^\s*[•·*-]\s*/, "");
    replacement.appendChild(item);
  });
  return replacement;
}

function applyExportInlineStyles(clone, copyTablesOnly = false) {
  clone.style.cssText = "width:100%;max-width:820px;border:none;background:#ffffff;color:#1e2c3a;font-family:Arial,sans-serif;font-size:14px;line-height:1.45;overflow:hidden;";
  const head = clone.querySelector(".quote-card-head");
  if (head) head.style.cssText = "padding:18px 20px 14px;border-bottom:1px solid #cbd5df;background:#ffffff;";
  const heading = clone.querySelector(".quote-card-head strong");
  if (heading) heading.style.cssText = "display:block;margin:0;color:#17324d;font-family:Arial,sans-serif;font-size:19px;font-weight:700;line-height:1.3;";
  const subtitle = clone.querySelector(".quote-card-head span");
  if (subtitle) subtitle.style.cssText = "display:block;margin:5px 0 0;color:#68798a;font-family:Arial,sans-serif;font-size:12px;font-weight:400;line-height:1.45;";
  const body = clone.querySelector(".quote-body");
  if (body) body.style.cssText = copyTablesOnly ? "padding:0;background:#ffffff;" : "padding:16px 20px 20px;background:#ffffff;";
  clone.querySelectorAll("table").forEach((table) => {
    table.style.cssText = "width:100%;border-collapse:collapse;border-spacing:0;table-layout:fixed;margin:0;";
    table.setAttribute("cellspacing", "0");
    table.setAttribute("cellpadding", "0");
  });
  clone.querySelectorAll("th,td").forEach((cell) => {
    cell.style.cssText = "border:1px solid #cbd5df;padding:7px 9px;text-align:left;vertical-align:top;color:#1e2c3a;font-family:Arial,sans-serif;font-size:14px;font-weight:400;line-height:1.45;word-break:break-word;";
  });
  clone.querySelectorAll(".info-table th").forEach((cell) => {
    cell.style.cssText += "width:28%;background:#f3f6f9;color:#263c50;font-weight:700;";
    cell.setAttribute("bgcolor", "#f3f6f9");
  });
  clone.querySelectorAll(".charges-table th").forEach((cell) => {
    cell.style.cssText += "background:#f3f6f9;color:#263c50;font-weight:700;";
    cell.setAttribute("bgcolor", "#f3f6f9");
  });
  const charges = clone.querySelector(".charges");
  if (charges) charges.style.cssText = copyTablesOnly ? "margin-top:0;" : "margin-top:14px;";
  const wrap = clone.querySelector(".charges-table-wrap");
  if (wrap) wrap.style.cssText = "overflow:visible;";
  clone.querySelectorAll(".charges h3,.remarks h3").forEach((title) => {
    title.style.cssText = "display:block;margin:0 0 7px;color:#17324d;font-family:Arial,sans-serif;font-size:14px;font-weight:700;line-height:1.4;";
  });
  const remarks = clone.querySelector(".remarks");
  if (remarks) remarks.style.cssText = "margin-top:14px;padding-top:12px;border-top:1px solid #cbd5df;";
  const remarksText = clone.querySelector(".remarks [data-export-remarks]") || clone.querySelector(".remarks div");
  if (remarksText) remarksText.style.cssText = "white-space:pre-line;color:#1e2c3a;font-family:Arial,sans-serif;font-size:14px;font-weight:400;line-height:1.55;";
}

function exportQuoteHtml({ copyTablesOnly = false } = {}) {
  syncFormAttributes(quoteCard);
  const clone = quoteCard.cloneNode(true);
  const sourceControls = quoteCard.querySelectorAll("input,select,textarea");
  clone.querySelectorAll("input,select,textarea").forEach((control, index) => {
    const source = sourceControls[index];
    const value = source ? source.value : "";
    const block = control.tagName === "TEXTAREA";
    if (block && control.matches('[data-field="remarks"]')) {
      control.replaceWith(createExportRemarks(value));
      return;
    }
    const replacement = document.createElement(block ? "div" : "span");
    replacement.textContent = value || "—";
    if (block) replacement.style.whiteSpace = "pre-line";
    control.replaceWith(replacement);
  });
  clone.querySelectorAll(".remove-cell,.remove-column,.column-tools,.info-remove-cell,.info-tools").forEach((node) => node.remove());
  clone.querySelectorAll("[hidden]").forEach((node) => node.remove());
  if (copyTablesOnly) {
    clone.querySelector(".quote-card-head")?.remove();
    clone.querySelector(".charges h3")?.remove();
  }
  applyExportInlineStyles(clone, copyTablesOnly);
  clone.removeAttribute("id");
  return copyTablesOnly ? (clone.querySelector(".quote-body")?.innerHTML || "") : clone.outerHTML;
}

function exportStyles() {
  return "body{margin:24px;background:#fff;color:#1e2c3a;font:14px Arial,sans-serif}.quote-card{max-width:820px;margin:auto;border:0;overflow:hidden}.quote-card-head{padding:20px 22px 16px;border-bottom:1px solid #cbd5df}.quote-card-head strong{display:block;color:#17324d;font-size:19px}.quote-card-head span{display:block;margin-top:5px;color:#68798a;font-size:12px}.quote-body{padding:18px 22px 22px}.quote-card table{width:100%;border-collapse:collapse;table-layout:fixed}.quote-card th,.quote-card td{border:1px solid #cbd5df;padding:7px 9px;text-align:left;vertical-align:top}.quote-card th{width:28%;background:#f3f6f9;color:#263c50}.charges{margin-top:14px}.charges h3,.remarks h3{margin:0 0 7px;color:#17324d;font-size:14px}.charges th{width:auto}.remarks{margin-top:14px;padding-top:12px;border-top:1px solid #cbd5df}";
}

async function copyQuote() {
  const html = exportQuoteHtml({ copyTablesOnly: true });
  const holder = document.createElement("div");
  holder.innerHTML = html;
  const plain = holder.innerText || holder.textContent || "";
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plain], { type: "text/plain" }),
      })]);
    } else {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      temp.style.position = "fixed";
      temp.style.left = "-9999px";
      document.body.appendChild(temp);
      const range = document.createRange();
      range.selectNodeContents(temp);
      const selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      if (!document.execCommand("copy")) throw new Error("copy failed");
      selection.removeAllRanges();
      temp.remove();
    }
    setStatus("报价表已复制，可粘贴到邮件正文。");
  } catch {
    setStatus("浏览器阻止了自动复制，请直接框选报价卡后复制。", true);
  }
}

function downloadQuote() {
  if (currentQuoteId && dirty) saveCurrent(true);
  const term = editorField("term")?.value || "QUOTE";
  const origin = editorField("origin")?.value.trim() || "Origin";
  const destination = editorField("destination")?.value.trim() || "Destination";
  const modeName = currentMode === "air" ? "空运" : "海运";
  const title = `${modeName}_${term}_${origin}_to_${destination}`.replace(/[\\/:*?"<>|]/g, "-");
  const source = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>${exportStyles()}</style></head><body>${exportQuoteHtml()}</body></html>`;
  const blob = new Blob([source], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = title + ".html";
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  setStatus("独立 HTML 已下载。");
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("storage-error", isError);
}

function setDefaultStatus(message, isError = false) {
  defaultStatusEl.textContent = message;
  defaultStatusEl.classList.toggle("storage-error", isError);
}

document.querySelectorAll("[data-new-mode]").forEach((button) => {
  button.addEventListener("click", () => openNew(button.dataset.newMode));
});
document.getElementById("openDefaults").addEventListener("click", openDefaults);
document.getElementById("backHome").addEventListener("click", showHome);
document.getElementById("backDefaultsHome").addEventListener("click", leaveDefaults);
document.getElementById("saveQuote").addEventListener("click", () => saveCurrent(false));
document.getElementById("copyQuote").addEventListener("click", copyQuote);
document.getElementById("downloadQuote").addEventListener("click", downloadQuote);
document.getElementById("resetQuote").addEventListener("click", resetEditor);
document.getElementById("saveDefault").addEventListener("click", saveDefaultTemplate);
document.getElementById("restoreDefault").addEventListener("click", restoreDefaultTemplate);
document.querySelectorAll("[data-template-term]").forEach((button) => {
  button.addEventListener("click", () => switchTemplateTerm(button.dataset.templateTerm));
});

quoteList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-quote]");
  if (deleteButton) {
    event.preventDefault();
    event.stopPropagation();
    const id = deleteButton.dataset.deleteQuote;
    const quote = library.quotes.find((item) => item.id === id);
    const label = quote ? `${quote.term} ${quote.origin || ""} → ${quote.destination || ""}` : "这条报价";
    if (confirm(`确定删除“${label}”吗？删除后无法恢复。`)) {
      library.quotes = library.quotes.filter((item) => item.id !== id);
      writeLibrary();
      renderHome();
    }
    return;
  }
  const capsule = event.target.closest("[data-quote-id]");
  if (capsule) openExisting(capsule.dataset.quoteId);
});

quoteList.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-quote-id]")) {
    event.preventDefault();
    openExisting(event.target.dataset.quoteId);
  }
});

quoteCard.addEventListener("input", markDirty);
quoteCard.addEventListener("change", (event) => {
  if (event.target.matches('[data-field="term"]')) {
    handleTermChange(event.target.value);
    return;
  }
  markDirty();
});

quoteCard.addEventListener("click", (event) => {
  const moveInfoButton = event.target.closest("[data-move-info-row]");
  if (moveInfoButton) {
    moveEditableRow(moveInfoButton, moveInfoButton.dataset.moveInfoRow, "信息行");
    return;
  }
  const moveChargeButton = event.target.closest("[data-move-charge-row]");
  if (moveChargeButton) {
    moveEditableRow(moveChargeButton, moveChargeButton.dataset.moveChargeRow, "费用行");
    return;
  }
  if (event.target.closest("[data-add-info-row]")) {
    const body = quoteCard.querySelector(".info-table tbody");
    body?.insertAdjacentHTML("beforeend", infoRowHtml());
    const labelInput = body?.lastElementChild?.querySelector(".info-label");
    labelInput?.focus();
    labelInput?.select();
    markDirty();
    return;
  }
  const removeInfoButton = event.target.closest("[data-remove-info-row]");
  if (removeInfoButton) {
    removeInfoButton.closest("tr")?.remove();
    updateAddressVisibility();
    markDirty();
    return;
  }
  if (event.target.closest("[data-add-row]")) {
    const headers = quoteCard.querySelectorAll(".charges-table thead [data-col-id]").length || 4;
    quoteCard.querySelector("[data-charge-rows]")?.insertAdjacentHTML("beforeend", chargeRowHtml([], headers));
    markDirty();
    return;
  }
  if (event.target.closest("[data-add-column]")) {
    addChargeColumn();
    return;
  }
  const removeColumnButton = event.target.closest("[data-remove-column]");
  if (removeColumnButton) {
    const table = removeColumnButton.closest(".charges-table");
    const header = removeColumnButton.closest("th");
    const headerRow = header?.parentElement;
    const dataHeaders = headerRow ? [...headerRow.querySelectorAll("[data-col-id]")] : [];
    if (dataHeaders.length <= 1) {
      currentTemplateTerm ? setDefaultStatus("费用表至少保留一列。", true) : setStatus("费用表至少保留一列。", true);
      return;
    }
    const columnIndex = [...headerRow.children].indexOf(header);
    table.querySelectorAll("[data-charge-rows] tr").forEach((row) => row.children[columnIndex]?.remove());
    header.remove();
    markDirty();
    return;
  }
  const removeRowButton = event.target.closest("[data-remove-row]");
  if (removeRowButton) {
    const rows = quoteCard.querySelectorAll("[data-charge-rows] tr");
    if (rows.length <= 1) {
      currentTemplateTerm ? setDefaultStatus("费用表至少保留一行。", true) : setStatus("费用表至少保留一行。", true);
      return;
    }
    removeRowButton.closest("tr")?.remove();
    markDirty();
  }
});

window.addEventListener("beforeunload", (event) => {
  if (dirty && (!currentQuoteId || currentTemplateTerm)) {
    event.preventDefault();
    event.returnValue = "";
  }
});

renderHome();
