// Seed data for the demo workspace. Dates are relative to "today" so the
// overdue / upcoming views always have something meaningful to show.
// Milestone 2 replaces this module with the MongoDB-backed Express API.
import { dateOffset } from '../utils/dates';

const hoursAgo = (h) => new Date(Date.now() - h * 3_600_000).toISOString();

export const DEMO_ACCOUNTS = [
  { email: 'ava@cadence.dev', name: 'Ava Thompson', title: 'Product Lead' },
  { email: 'marcus@cadence.dev', name: 'Marcus Chen', title: 'Senior Engineer' },
];

const users = [
  { id: 'u1', name: 'Ava Thompson', email: 'ava@cadence.dev', title: 'Product Lead', createdAt: hoursAgo(24 * 140) },
  { id: 'u2', name: 'Marcus Chen', email: 'marcus@cadence.dev', title: 'Senior Engineer', createdAt: hoursAgo(24 * 132) },
  { id: 'u3', name: 'Priya Natarajan', email: 'priya@cadence.dev', title: 'UX Designer', createdAt: hoursAgo(24 * 120) },
  { id: 'u4', name: 'Diego Alvarez', email: 'diego@cadence.dev', title: 'QA Engineer', createdAt: hoursAgo(24 * 98) },
  { id: 'u5', name: 'Lena Fischer', email: 'lena@cadence.dev', title: 'Marketing Manager', createdAt: hoursAgo(24 * 75) },
  { id: 'u6', name: 'Samuel Okafor', email: 'samuel@cadence.dev', title: 'Data Analyst', createdAt: hoursAgo(24 * 40) },
];

const projects = [
  {
    id: 'p1', name: 'Website Redesign', ownerId: 'u1', memberIds: ['u1', 'u2', 'u3', 'u4'], status: 'active',
    description: 'Rebuild the marketing site on a modern component system with faster pages, a refreshed visual identity, and WCAG 2.2 AA accessibility.',
    startDate: dateOffset(-30), deadline: dateOffset(21), createdAt: hoursAgo(24 * 30), updatedAt: hoursAgo(5),
  },
  {
    id: 'p2', name: 'Mobile App v2', ownerId: 'u2', memberIds: ['u2', 'u1', 'u4'], status: 'active',
    description: 'Ship offline-first task syncing, push notification preferences, and a redesigned onboarding flow for iOS and Android.',
    startDate: dateOffset(-45), deadline: dateOffset(35), createdAt: hoursAgo(24 * 45), updatedAt: hoursAgo(2),
  },
  {
    id: 'p3', name: 'Q4 Marketing Launch', ownerId: 'u5', memberIds: ['u5', 'u1', 'u3'], status: 'planning',
    description: 'Coordinate messaging, landing pages, and a customer webinar series for the Q4 product launch.',
    startDate: dateOffset(3), deadline: dateOffset(60), createdAt: hoursAgo(24 * 6), updatedAt: hoursAgo(20),
  },
  {
    id: 'p4', name: 'Customer Portal Migration', ownerId: 'u1', memberIds: ['u1', 'u2'], status: 'completed',
    description: 'Move every customer account from the legacy portal to the new platform with single sign-on.',
    startDate: dateOffset(-90), deadline: dateOffset(-5), createdAt: hoursAgo(24 * 90), updatedAt: hoursAgo(24 * 6),
  },
  {
    id: 'p5', name: 'Data Warehouse Rollout', ownerId: 'u4', memberIds: ['u4', 'u2', 'u6'], status: 'on_hold',
    description: 'Consolidate product analytics into a single warehouse with a documented event schema.',
    startDate: dateOffset(-20), deadline: dateOffset(40), createdAt: hoursAgo(24 * 20), updatedAt: hoursAgo(24 * 3),
  },
];

// [id, projectId, title, status, priority, assigneeId, createdById, deadline offset (days), description]
const taskRows = [
  ['t1', 'p1', 'Audit current site information architecture', 'completed', 'medium', 'u3', 'u1', -18, 'Inventory every page, map traffic, and flag content to merge or retire.'],
  ['t2', 'p1', 'Design new homepage hero and navigation', 'completed', 'high', 'u3', 'u1', -9, 'Desktop and mobile variants, including the mega-menu states.'],
  ['t3', 'p1', 'Build responsive component library', 'in_progress', 'high', 'u2', 'u1', 4, 'Buttons, cards, forms, and navigation with documented props.'],
  ['t4', 'p1', 'Write accessibility test plan', 'in_review', 'medium', 'u4', 'u1', 2, 'Cover keyboard navigation, screen readers, contrast, and reduced motion.'],
  ['t5', 'p1', 'Migrate blog content to the new CMS', 'todo', 'medium', 'u2', 'u1', -2, 'Roughly 140 posts; preserve slugs and set up redirects.'],
  ['t6', 'p1', 'Set up analytics and conversion tracking', 'todo', 'low', 'u1', 'u1', 12, 'Define events for sign-ups, demo requests, and pricing views.'],
  ['t7', 'p1', 'Cross-browser QA pass', 'todo', 'urgent', 'u4', 'u1', 6, 'Safari, Firefox, Chrome, Edge, plus iOS and Android browsers.'],
  ['t8', 'p2', 'Implement offline sync for task lists', 'in_progress', 'urgent', 'u2', 'u2', 3, 'Queue writes locally and reconcile conflicts on reconnect.'],
  ['t9', 'p2', 'Push notification preferences screen', 'todo', 'high', 'u1', 'u2', -1, 'Per-project toggles plus quiet hours.'],
  ['t10', 'p2', 'Regression suite for iOS 18', 'in_review', 'high', 'u4', 'u2', 1, 'Automate the top 40 user journeys.'],
  ['t11', 'p2', 'App Store screenshots and listing copy', 'todo', 'medium', 'u1', 'u2', 15, 'Six screenshots per device class, localized for EN and DE.'],
  ['t12', 'p2', 'Crash reporting integration', 'completed', 'medium', 'u2', 'u2', -12, ''],
  ['t13', 'p3', 'Finalize launch messaging framework', 'in_progress', 'high', 'u5', 'u5', 7, 'Positioning, key messages, and proof points for each persona.'],
  ['t14', 'p3', 'Landing page wireframes', 'todo', 'medium', 'u3', 'u5', 10, ''],
  ['t15', 'p3', 'Customer webinar outline', 'todo', 'low', 'u1', 'u5', 20, 'Three-part series; recruit two customer speakers.'],
  ['t16', 'p4', 'Migrate legacy accounts', 'completed', 'urgent', 'u2', 'u1', -30, ''],
  ['t17', 'p4', 'Configure SSO providers', 'completed', 'high', 'u2', 'u1', -20, 'Google Workspace and Microsoft Entra ID.'],
  ['t18', 'p4', 'Send launch announcement email', 'completed', 'low', 'u1', 'u1', -6, ''],
  ['t19', 'p5', 'Evaluate warehouse vendors', 'completed', 'medium', 'u4', 'u4', -10, ''],
  ['t20', 'p5', 'Define event schema', 'todo', 'high', 'u6', 'u4', 14, 'Naming conventions, required properties, and ownership.'],
];

const tasks = taskRows.map(([id, projectId, title, status, priority, assigneeId, createdById, offset, description], i) => ({
  id, projectId, title, status, priority, assigneeId, createdById, description,
  deadline: dateOffset(offset),
  createdAt: hoursAgo(24 * (30 - i)),
  updatedAt: hoursAgo(3 + i * 4),
}));

const activity = [
  ['a1', 'task.status', 'u2', 'p2', 't8', 'moved "Implement offline sync for task lists" to In Progress', 2],
  ['a2', 'task.status', 'u4', 'p1', 't4', 'moved "Write accessibility test plan" to In Review', 5],
  ['a3', 'task.assigned', 'u2', 'p2', 't9', 'assigned "Push notification preferences screen" to Ava Thompson', 9],
  ['a4', 'task.created', 'u1', 'p1', 't7', 'created "Cross-browser QA pass"', 14],
  ['a5', 'project.created', 'u5', 'p3', null, 'created the project', 24 * 6],
  ['a6', 'member.added', 'u5', 'p3', null, 'added Priya Natarajan to the team', 24 * 6 - 1],
  ['a7', 'task.status', 'u3', 'p1', 't2', 'completed "Design new homepage hero and navigation"', 24 * 2],
  ['a8', 'project.updated', 'u1', 'p4', null, 'marked the project as Completed', 24 * 6],
].map(([id, type, actorId, projectId, taskId, message, h]) => ({ id, type, actorId, projectId, taskId, message, createdAt: hoursAgo(h) }));

/** Returns a fresh copy of the demo workspace. */
export function createSeed() {
  return structuredClone({ users, projects, tasks, activity });
}
