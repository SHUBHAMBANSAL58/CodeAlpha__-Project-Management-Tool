// Shared validation rules. The forms use them for instant feedback, and the
// API layer re-checks every payload, so a bypassed form can't store bad data.
import { PROJECT_STATUSES, TASK_PRIORITIES, TASK_STATUSES } from './constants';
import { formatDate, isValidDateStr, todayStr } from './dates';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const hasErrors = (errors) => Object.keys(errors).length > 0;

export function validateEmail(value) {
  const email = (value ?? '').trim();
  if (!email) return 'Email is required';
  if (!EMAIL_RE.test(email)) return 'Enter a valid email address';
  return null;
}

export function validateLogin({ email, password }) {
  const errors = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (!password) errors.password = 'Password is required';
  return errors;
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Use at least 8 characters';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Include at least one letter and one number';
  return null;
}

export function validateRegistration({ name, email, password, confirmPassword }) {
  const errors = {};
  const trimmed = (name ?? '').trim();
  if (!trimmed) errors.name = 'Name is required';
  else if (trimmed.length > 80) errors.name = 'Name must be 80 characters or fewer';
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export function validateProfile({ name, email, title }) {
  const errors = {};
  const trimmed = (name ?? '').trim();
  if (!trimmed) errors.name = 'Name is required';
  else if (trimmed.length > 80) errors.name = 'Name must be 80 characters or fewer';
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if ((title ?? '').length > 80) errors.title = 'Job title must be 80 characters or fewer';
  return errors;
}

export function validateProject(input) {
  const errors = {};
  const name = (input.name ?? '').trim();
  if (!name) errors.name = 'Project name is required';
  else if (name.length < 2) errors.name = 'Use at least 2 characters';
  else if (name.length > 100) errors.name = 'Project name must be 100 characters or fewer';
  if ((input.description ?? '').length > 2000) errors.description = 'Description must be 2000 characters or fewer';
  if (!PROJECT_STATUSES.some((s) => s.value === input.status)) errors.status = 'Choose a valid status';
  if (!input.startDate) errors.startDate = 'Start date is required';
  else if (!isValidDateStr(input.startDate)) errors.startDate = 'Enter a valid date';
  if (!input.deadline) errors.deadline = 'Deadline is required';
  else if (!isValidDateStr(input.deadline)) errors.deadline = 'Enter a valid date';
  if (!errors.startDate && !errors.deadline && input.deadline < input.startDate) {
    errors.deadline = 'Deadline must be on or after the start date';
  }
  return errors;
}

/**
 * @param {object} input task fields
 * @param {object} options
 * @param {object} [options.project] parent project (deadline bound)
 * @param {boolean} [options.deadlineChanged] only new/changed deadlines must not be in the past
 */
export function validateTask(input, { project, deadlineChanged = true } = {}) {
  const errors = {};
  const title = (input.title ?? '').trim();
  if (!title) errors.title = 'Task title is required';
  else if (title.length > 200) errors.title = 'Title must be 200 characters or fewer';
  if ((input.description ?? '').length > 5000) errors.description = 'Description must be 5000 characters or fewer';
  if (!TASK_STATUSES.some((s) => s.value === input.status)) errors.status = 'Choose a valid status';
  if (!TASK_PRIORITIES.some((p) => p.value === input.priority)) errors.priority = 'Choose a valid priority';
  if (!input.deadline) errors.deadline = 'Deadline is required';
  else if (!isValidDateStr(input.deadline)) errors.deadline = 'Enter a valid date';
  else if (deadlineChanged && input.deadline < todayStr()) errors.deadline = 'Deadline cannot be in the past';
  else if (deadlineChanged && project?.deadline && input.deadline > project.deadline) {
    errors.deadline = `Must be on or before the project deadline (${formatDate(project.deadline)})`;
  }
  if (input.assigneeId && project && !project.memberIds?.includes(input.assigneeId)) {
    errors.assigneeId = 'Tasks can only be assigned to project members';
  }
  return errors;
}
