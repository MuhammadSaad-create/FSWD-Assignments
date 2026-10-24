// validation.js: input validation using conditions and operators

import { STATUSES, PRIORITIES } from "./ticketManager.js";

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]*$/;

/**
 * Validate form values. Returns an object of { field: message } errors.
 * An empty object means the data is valid.
 */
export const validateTicket = ({ customer, issue, priority, status }) => {
  const errors = {};
  const name = customer.trim();
  const text = issue.trim();

  if (name === "") {
    errors.customer = "Customer name is required.";
  } else if (name.length < 2 || name.length > 50) {
    errors.customer = "Name must be between 2 and 50 characters.";
  } else if (!NAME_PATTERN.test(name)) {
    errors.customer = "Name may contain only letters, spaces and . ' -";
  }

  if (text === "") {
    errors.issue = "Please describe the issue.";
  } else if (text.length < 10) {
    errors.issue = "Issue must be at least 10 characters.";
  } else if (text.length > 300) {
    errors.issue = "Issue must be 300 characters or fewer.";
  }

  if (!PRIORITIES.includes(priority)) {
    errors.priority = "Select a priority.";
  }

  if (!STATUSES.includes(status)) {
    errors.status = "Select a valid status.";
  }

  return errors;
};
