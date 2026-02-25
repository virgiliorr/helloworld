const STORAGE_KEY = "condo-units";

const form = document.getElementById("unit-form");
const tableBody = document.getElementById("units-table");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("status-filter");
const clearDataButton = document.getElementById("clear-data");
const rowTemplate = document.getElementById("row-template");

let units = loadUnits();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const newUnit = {
    id: crypto.randomUUID(),
    tower: form.tower.value.trim(),
    unitNumber: form.unitNumber.value.trim(),
    owner: form.owner.value.trim(),
    fee: Number(form.fee.value),
    status: form.status.value,
  };

  units.push(newUnit);
  saveUnits();
  form.reset();
  render();
});

searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);

clearDataButton.addEventListener("click", () => {
  if (!units.length) {
    return;
  }

  const confirmDelete = window.confirm("¿Seguro que deseas eliminar todas las unidades?");
  if (!confirmDelete) {
    return;
  }

  units = [];
  saveUnits();
  render();
});

function loadUnits() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return [];
  }

  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUnits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(units));
}

function matchesFilters(unit) {
  const query = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;

  const inSearch =
    !query ||
    unit.tower.toLowerCase().includes(query) ||
    unit.unitNumber.toLowerCase().includes(query) ||
    unit.owner.toLowerCase().includes(query);

  const inStatus = status === "Todos" || unit.status === status;

  return inSearch && inStatus;
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function render() {
  tableBody.innerHTML = "";

  const filteredUnits = units.filter(matchesFilters);

  filteredUnits.forEach((unit) => {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector('[data-key="tower"]').textContent = unit.tower;
    row.querySelector('[data-key="unitNumber"]').textContent = unit.unitNumber;
    row.querySelector('[data-key="owner"]').textContent = unit.owner;
    row.querySelector('[data-key="fee"]').textContent = formatMoney(unit.fee);

    const statusCell = row.querySelector('[data-key="status"]');
    const statusPill = document.createElement("span");
    statusPill.className = `status-pill ${unit.status === "Al día" ? "status-paid" : "status-pending"}`;
    statusPill.textContent = unit.status;
    statusCell.appendChild(statusPill);

    row.querySelector(".toggle-status").addEventListener("click", () => {
      unit.status = unit.status === "Al día" ? "Pendiente" : "Al día";
      saveUnits();
      render();
    });

    row.querySelector(".remove").addEventListener("click", () => {
      units = units.filter((item) => item.id !== unit.id);
      saveUnits();
      render();
    });

    tableBody.appendChild(row);
  });

  emptyState.style.display = filteredUnits.length ? "none" : "block";
}

render();
