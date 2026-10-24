// main.js: UI wiring (DOM interactions, event handlers, rendering)

import { TicketManager } from "./ticketManager.js";
import { validateTicket } from "./validation.js";

const manager = new TicketManager([
  { customer: "Ayesha Khan", issue: "Unable to log in after password reset", priority: "High", status: "Open" },
  { customer: "Bilal Ahmed", issue: "Invoice PDF downloads as blank page", priority: "Medium", status: "In Progress" },
  { customer: "Sara Malik", issue: "Request to export data to CSV", priority: "Low", status: "Closed" },
]);

// ---- DOM references (destructured from one lookup helper) ----
const $ = (id) => document.getElementById(id);
const els = {
  form: $("ticket-form"),
  id: $("ticket-id"),
  customer: $("customer"),
  issue: $("issue"),
  priority: $("priority"),
  status: $("status"),
  submitLabel: $("submit-label"),
  formTitle: $("form-title"),
  resetBtn: $("reset-btn"),
  body: $("ticket-body"),
  empty: $("empty-state"),
  visible: $("visible-count"),
  search: $("search"),
  filterStatus: $("filter-status"),
  filterPriority: $("filter-priority"),
};
const fields = ["customer", "issue", "priority", "status"];
const DEFAULTS = { customer: "", issue: "", priority: "", status: "Open" };

// ---- Helpers ----
const escapeHtml = (str) =>
  str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const highlight = (text, term) => {
  const safe = escapeHtml(text);
  if (!term) return safe;
  const pattern = new RegExp(`(${escapeHtml(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return safe.replace(pattern, "<mark>$1</mark>");
};

const getFormValues = () => ({
  customer: els.customer.value,
  issue: els.issue.value,
  priority: els.priority.value,
  status: els.status.value,
});

const getFilters = () => ({
  keyword: els.search.value,
  status: els.filterStatus.value,
  priority: els.filterPriority.value,
});

// ---- Rendering ----
const renderSummary = () => {
  const { total, open, progress, closed } = manager.summary();
  $("count-total").textContent = total;
  $("count-open").textContent = open;
  $("count-progress").textContent = progress;
  $("count-closed").textContent = closed;
};

const renderTable = () => {
  const filters = getFilters();
  const rows = manager.search(filters);

  els.body.innerHTML = rows
    .map(({ id, customer, issue, priority, status }) => `
      <tr>
        <td class="text-muted">${id}</td>
        <td class="fw-semibold">${escapeHtml(customer)}</td>
        <td class="issue-cell text-truncate" title="${escapeHtml(issue)}">${highlight(issue, filters.keyword.trim())}</td>
        <td><span class="badge badge-priority-${priority}">${priority}</span></td>
        <td><span class="badge badge-status-${status.replace(" ", "-")}">${status}</span></td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${id}" aria-label="Edit ticket ${id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${id}" aria-label="Delete ticket ${id}">Delete</button>
        </td>
      </tr>`)
    .join("");

  els.visible.textContent = rows.length;
  els.empty.classList.toggle("d-none", rows.length > 0);
};

const refresh = () => {
  renderSummary();
  renderTable();
};

// ---- Form state ----
const showErrors = (errors) => {
  for (const field of fields) {
    const message = errors[field];
    els[field].classList.toggle("is-invalid", Boolean(message));
    $(`${field}-error`).textContent = message ?? "";
  }
};

// Reset Form: clear inputs, restore defaults, leave edit mode, no page reload
const resetForm = () => {
  els.form.reset();
  const { customer, issue, priority, status } = DEFAULTS;
  els.customer.value = customer;
  els.issue.value = issue;
  els.priority.value = priority;
  els.status.value = status;
  els.id.value = "";
  els.submitLabel.textContent = "Add Ticket";
  els.formTitle.textContent = "New Ticket";
  showErrors({});
};

const startEdit = (id) => {
  const ticket = manager.getById(id);
  if (!ticket) return;
  const { customer, issue, priority, status } = ticket;
  els.id.value = id;
  els.customer.value = customer;
  els.issue.value = issue;
  els.priority.value = priority;
  els.status.value = status;
  els.submitLabel.textContent = "Save Changes";
  els.formTitle.textContent = `Edit Ticket #${id}`;
  showErrors({});
  els.form.scrollIntoView({ behavior: "smooth", block: "start" });
};

// ---- Events ----
els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = getFormValues();
  const errors = validateTicket(values);
  showErrors(errors);
  if (Object.keys(errors).length > 0) return;

  const editingId = Number(els.id.value);
  if (editingId) {
    manager.update(editingId, {
      ...values,
      customer: values.customer.trim(),
      issue: values.issue.trim(),
    });
  } else {
    manager.add(values);
  }
  resetForm();
  refresh();
});

els.resetBtn.addEventListener("click", resetForm);

// Event delegation for edit / delete buttons
els.body.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  const ticketId = Number(id);

  if (action === "edit") {
    startEdit(ticketId);
  } else if (action === "delete") {
    if (window.confirm(`Delete ticket #${ticketId}?`)) {
      manager.remove(ticketId);
      if (Number(els.id.value) === ticketId) resetForm();
      refresh();
    }
  }
});

[els.search, els.filterStatus, els.filterPriority].forEach((el) =>
  el.addEventListener("input", renderTable)
);

// ---- Init ----
resetForm();
refresh();
