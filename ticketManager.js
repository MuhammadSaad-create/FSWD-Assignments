// ticketManager.js: data layer (ES6 class, objects, arrays, loops, array methods)

export const STATUSES = ["Open", "In Progress", "Closed"];
export const PRIORITIES = ["Low", "Medium", "High"];

export class TicketManager {
  #tickets = [];
  #nextId = 1;

  constructor(initial = []) {
    // Loop over seed data and add each record
    for (const ticket of initial) {
      this.add(ticket);
    }
  }

  // CREATE: build an object, spread it into the array
  add({ customer, issue, priority, status }) {
    const ticket = {
      id: this.#nextId++,
      customer: customer.trim(),
      issue: issue.trim(),
      priority,
      status,
      createdAt: new Date().toISOString(),
    };
    this.#tickets = [...this.#tickets, ticket];
    return ticket;
  }

  // READ
  getAll() {
    return [...this.#tickets];
  }

  getById(id) {
    return this.#tickets.find((t) => t.id === id);
  }

  // UPDATE: map + spread to produce a new object without mutating the old one
  update(id, changes) {
    let updated = null;
    this.#tickets = this.#tickets.map((t) => {
      if (t.id !== id) return t;
      updated = { ...t, ...changes };
      return updated;
    });
    return updated;
  }

  // DELETE
  remove(id) {
    const before = this.#tickets.length;
    this.#tickets = this.#tickets.filter((t) => t.id !== id);
    return this.#tickets.length < before;
  }

  // SEARCH & FILTER: keyword in issue, plus status and priority
  search({ keyword = "", status = "", priority = "" } = {}) {
    const term = keyword.trim().toLowerCase();
    return this.#tickets.filter(
      (t) =>
        (term === "" || t.issue.toLowerCase().includes(term)) &&
        (status === "" || t.status === status) &&
        (priority === "" || t.priority === priority)
    );
  }

  // SUMMARY: totals computed with a loop
  summary() {
    const counts = { total: 0, open: 0, progress: 0, closed: 0 };
    for (const { status } of this.#tickets) {
      counts.total++;
      if (status === "Open") counts.open++;
      else if (status === "In Progress") counts.progress++;
      else if (status === "Closed") counts.closed++;
    }
    return counts;
  }
}
