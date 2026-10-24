// In-browser stand-in for the Express + MongoDB API.
//
// Every method mirrors a planned REST endpoint (noted above each method),
// enforces the same authentication, ownership and validation rules, and
// persists to localStorage so the demo workspace survives reloads.
// Milestone 2 swaps `services/index.js` over to the real API in `api.js`.
import { createSeed } from '../data/fixtures';
import { priorityRank, statusRank } from '../utils/constants';
import { dateOffset, isTaskOverdue, todayStr } from '../utils/dates';
import {
  hasErrors, validateLogin, validatePassword, validateProfile, validateProject, validateRegistration, validateTask,
} from '../utils/validators';
import { ApiError } from './ApiError';
import { tokenStorage } from './tokenStorage';

const DB_KEY = 'cadence.demo-db.v1';
const LATENCY_MS = 250;
const ACTIVITY_LIMIT = 300;

let db = load();

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupt or unavailable storage: fall back to fresh seed data.
  }
  return createSeed();
}

function save() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // Storage full or disabled; keep working in memory.
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Simulates a network round trip; thrown ApiErrors become rejected promises. */
async function handle(fn) {
  await sleep(LATENCY_MS);
  return structuredClone(fn());
}

const uid = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const nowIso = () => new Date().toISOString();
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

function invalid(fields) {
  throw new ApiError(422, 'Please fix the highlighted fields.', fields);
}

// ---------------------------------------------------------------- helpers

function publicUser(user) {
  if (!user) return null;
  const { id, name, email, title, createdAt } = user;
  return { id, name, email, title, createdAt };
}

const findUser = (id) => db.users.find((u) => u.id === id);

function requireUser() {
  const token = tokenStorage.get();
  const id = token?.startsWith('demo.') ? token.slice(5) : null;
  const user = id && findUser(id);
  if (!user) throw new ApiError(401, 'Your session has expired. Please sign in again.');
  return user;
}

function requireProject(projectId, user) {
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) throw new ApiError(404, 'Project not found.');
  if (!project.memberIds.includes(user.id)) throw new ApiError(403, "You don't have access to this project.");
  return project;
}

function requireOwner(project, user, action) {
  if (project.ownerId !== user.id) {
    const owner = findUser(project.ownerId);
    throw new ApiError(403, `Only the project owner (${owner?.name ?? 'owner'}) can ${action}.`);
  }
}

function requireTask(taskId, user) {
  const task = db.tasks.find((t) => t.id === taskId);
  if (!task) throw new ApiError(404, 'Task not found.');
  const project = requireProject(task.projectId, user);
  return { task, project };
}

function logActivity(type, actor, projectId, taskId, message) {
  db.activity.unshift({ id: uid('a'), type, actorId: actor.id, projectId, taskId, message, createdAt: nowIso() });
  db.activity.length = Math.min(db.activity.length, ACTIVITY_LIMIT);
}

function progressFor(projectId) {
  const tasks = db.tasks.filter((t) => t.projectId === projectId);
  const completed = tasks.filter((t) => t.status === 'completed').length;
  return {
    total: tasks.length,
    completed,
    open: tasks.length - completed,
    overdue: tasks.filter(isTaskOverdue).length,
    percent: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
  };
}

function serializeProject(project) {
  const counts = progressFor(project.id);
  return {
    ...project,
    owner: publicUser(findUser(project.ownerId)),
    members: project.memberIds.map((id) => publicUser(findUser(id))).filter(Boolean),
    taskCounts: counts,
    progress: counts.percent,
  };
}

function serializeTask(task) {
  const project = db.projects.find((p) => p.id === task.projectId);
  return {
    ...task,
    assignee: publicUser(findUser(task.assigneeId)),
    createdBy: publicUser(findUser(task.createdById)),
    project: project ? { id: project.id, name: project.name, ownerId: project.ownerId } : null,
    isOverdue: isTaskOverdue(task),
  };
}

function serializeActivity(entry) {
  const project = db.projects.find((p) => p.id === entry.projectId);
  return { ...entry, actor: publicUser(findUser(entry.actorId)), project: project ? { id: project.id, name: project.name } : null };
}

const memberProjects = (user) => db.projects.filter((p) => p.memberIds.includes(user.id));

const TASK_SORTS = {
  deadline: (a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'),
  priority: (a, b) => priorityRank(b.priority) - priorityRank(a.priority),
  status: (a, b) => statusRank(a.status) - statusRank(b.status),
  title: (a, b) => a.title.localeCompare(b.title),
  created: (a, b) => b.createdAt.localeCompare(a.createdAt),
  updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
};

const PROJECT_SORTS = {
  deadline: (a, b) => a.deadline.localeCompare(b.deadline),
  updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  name: (a, b) => a.name.localeCompare(b.name),
  progress: (a, b) => b.progress - a.progress,
};

// ------------------------------------------------------------------- API

export const mockBackend = {
  auth: {
    // POST /api/auth/register
    register: (input) => handle(() => {
      const errors = validateRegistration({ ...input, confirmPassword: input.password });
      if (hasErrors(errors)) invalid(errors);
      const email = input.email.trim().toLowerCase();
      if (db.users.some((u) => u.email === email)) {
        throw new ApiError(409, 'An account with this email already exists.', { email: 'This email is already registered' });
      }
      const user = { id: uid('u'), name: input.name.trim(), email, title: '', createdAt: nowIso() };
      db.users.push(user);
      save();
      return { token: `demo.${user.id}`, user: publicUser(user) };
    }),

    // POST /api/auth/login
    login: (input) => handle(() => {
      const errors = validateLogin(input);
      if (hasErrors(errors)) invalid(errors);
      const user = db.users.find((u) => u.email === input.email.trim().toLowerCase());
      // Demo workspace: any password of 8+ characters signs in. Milestone 2
      // verifies a bcrypt hash on the server instead.
      if (!user || input.password.length < 8) throw new ApiError(401, 'Invalid email or password.');
      return { token: `demo.${user.id}`, user: publicUser(user) };
    }),

    // GET /api/auth/me
    me: () => handle(() => ({ user: publicUser(requireUser()) })),
  },

  users: {
    // PATCH /api/users/me
    updateProfile: (input) => handle(() => {
      const user = requireUser();
      const errors = validateProfile(input);
      if (hasErrors(errors)) invalid(errors);
      const email = input.email.trim().toLowerCase();
      if (db.users.some((u) => u.email === email && u.id !== user.id)) {
        throw new ApiError(409, 'That email is already in use.', { email: 'This email is already registered' });
      }
      Object.assign(user, { name: input.name.trim(), email, title: (input.title ?? '').trim() });
      save();
      return { user: publicUser(user) };
    }),

    // PATCH /api/users/me/password
    changePassword: ({ currentPassword, newPassword }) => handle(() => {
      requireUser();
      const errors = {};
      if (!currentPassword) errors.currentPassword = 'Current password is required';
      const passwordError = validatePassword(newPassword);
      if (passwordError) errors.newPassword = passwordError;
      else if (newPassword === currentPassword) errors.newPassword = 'Choose a password you are not currently using';
      if (hasErrors(errors)) invalid(errors);
      return { message: 'Password updated.' };
    }),

    // GET /api/users/me/summary
    summary: () => handle(() => {
      const user = requireUser();
      const projects = memberProjects(user);
      const ids = new Set(projects.map((p) => p.id));
      const assigned = db.tasks.filter((t) => ids.has(t.projectId) && t.assigneeId === user.id);
      return {
        projectsOwned: projects.filter((p) => p.ownerId === user.id).length,
        projectsJoined: projects.length,
        tasksAssigned: assigned.length,
        tasksCompleted: assigned.filter((t) => t.status === 'completed').length,
      };
    }),
  },

  projects: {
    // GET /api/projects?search=&status=&ownership=&sort=
    list: ({ search = '', status = 'all', ownership = 'all', sort = 'deadline' } = {}) => handle(() => {
      const user = requireUser();
      const q = search.trim().toLowerCase();
      return memberProjects(user)
        .filter((p) => status === 'all' || p.status === status)
        .filter((p) => ownership === 'all' || (ownership === 'owned' ? p.ownerId === user.id : p.ownerId !== user.id))
        .filter((p) => !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
        .map(serializeProject)
        .sort(PROJECT_SORTS[sort] ?? PROJECT_SORTS.deadline);
    }),

    // GET /api/projects/:id
    get: (projectId) => handle(() => serializeProject(requireProject(projectId, requireUser()))),

    // POST /api/projects
    create: (input) => handle(() => {
      const user = requireUser();
      const data = { name: input.name?.trim(), description: (input.description ?? '').trim(), status: input.status, startDate: input.startDate, deadline: input.deadline };
      const errors = validateProject(data);
      if (hasErrors(errors)) invalid(errors);
      const project = { id: uid('p'), ...data, ownerId: user.id, memberIds: [user.id], createdAt: nowIso(), updatedAt: nowIso() };
      db.projects.push(project);
      logActivity('project.created', user, project.id, null, 'created the project');
      save();
      return serializeProject(project);
    }),

    // PATCH /api/projects/:id
    update: (projectId, input) => handle(() => {
      const user = requireUser();
      const project = requireProject(projectId, user);
      requireOwner(project, user, 'edit project details');
      const next = { ...project, ...pick(input, ['name', 'description', 'status', 'startDate', 'deadline']) };
      next.name = next.name?.trim();
      next.description = (next.description ?? '').trim();
      const errors = validateProject(next);
      if (hasErrors(errors)) invalid(errors);
      const statusChanged = next.status !== project.status;
      Object.assign(project, next, { updatedAt: nowIso() });
      logActivity('project.updated', user, project.id, null, statusChanged ? `changed the project status to ${next.status.replace('_', ' ')}` : 'updated project details');
      save();
      return serializeProject(project);
    }),

    // DELETE /api/projects/:id  (cascades to the project's tasks and activity)
    remove: (projectId) => handle(() => {
      const user = requireUser();
      const project = requireProject(projectId, user);
      requireOwner(project, user, 'delete this project');
      db.projects = db.projects.filter((p) => p.id !== projectId);
      db.tasks = db.tasks.filter((t) => t.projectId !== projectId);
      db.activity = db.activity.filter((a) => a.projectId !== projectId);
      save();
      return { id: projectId };
    }),

    // POST /api/projects/:id/members  { email }
    addMember: (projectId, { email }) => handle(() => {
      const user = requireUser();
      const project = requireProject(projectId, user);
      requireOwner(project, user, 'add team members');
      const normalized = (email ?? '').trim().toLowerCase();
      if (!normalized) invalid({ email: 'Email is required' });
      const member = db.users.find((u) => u.email === normalized);
      if (!member) throw new ApiError(404, 'No Cadence account uses that email. Ask them to sign up first.', { email: 'No account found for this email' });
      if (project.memberIds.includes(member.id)) throw new ApiError(409, `${member.name} is already on this project.`, { email: 'Already a member' });
      project.memberIds.push(member.id);
      project.updatedAt = nowIso();
      logActivity('member.added', user, project.id, null, `added ${member.name} to the team`);
      save();
      return serializeProject(project);
    }),

    // DELETE /api/projects/:id/members/:userId  (unassigns their open tasks)
    removeMember: (projectId, memberId) => handle(() => {
      const user = requireUser();
      const project = requireProject(projectId, user);
      requireOwner(project, user, 'remove team members');
      if (memberId === project.ownerId) throw new ApiError(400, 'The project owner cannot be removed.');
      if (!project.memberIds.includes(memberId)) throw new ApiError(404, 'That person is not on this project.');
      const member = findUser(memberId);
      project.memberIds = project.memberIds.filter((id) => id !== memberId);
      project.updatedAt = nowIso();
      db.tasks.forEach((t) => {
        if (t.projectId === projectId && t.assigneeId === memberId) {
          t.assigneeId = null;
          t.updatedAt = nowIso();
        }
      });
      logActivity('member.removed', user, project.id, null, `removed ${member?.name ?? 'a member'} from the team`);
      save();
      return serializeProject(project);
    }),
  },

  tasks: {
    // GET /api/tasks?projectId=&status=&priority=&assignee=&scope=&overdue=&search=&sort=
    list: ({ projectId, status = 'all', priority = 'all', assignee = 'all', scope = 'all', overdue = false, search = '', sort = 'deadline' } = {}) => handle(() => {
      const user = requireUser();
      const projectIds = projectId ? [requireProject(projectId, user).id] : memberProjects(user).map((p) => p.id);
      const ids = new Set(projectIds);
      const q = search.trim().toLowerCase();
      const assigneeId = assignee === 'me' ? user.id : assignee;
      return db.tasks
        .filter((t) => ids.has(t.projectId))
        .filter((t) => scope === 'all' || (scope === 'assigned' ? t.assigneeId === user.id : t.createdById === user.id))
        .filter((t) => status === 'all' || (status === 'open' ? t.status !== 'completed' : t.status === status))
        .filter((t) => priority === 'all' || t.priority === priority)
        .filter((t) => assigneeId === 'all' || (assigneeId === 'unassigned' ? !t.assigneeId : t.assigneeId === assigneeId))
        .filter((t) => !overdue || isTaskOverdue(t))
        .filter((t) => !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
        .sort((a, b) => (TASK_SORTS[sort] ?? TASK_SORTS.deadline)(a, b) || TASK_SORTS.priority(a, b))
        .map(serializeTask);
    }),

    // POST /api/projects/:projectId/tasks
    create: (projectId, input) => handle(() => {
      const user = requireUser();
      const project = requireProject(projectId, user);
      const data = {
        title: input.title?.trim(), description: (input.description ?? '').trim(), status: input.status ?? 'todo',
        priority: input.priority ?? 'medium', deadline: input.deadline, assigneeId: input.assigneeId || null,
      };
      const errors = validateTask(data, { project });
      if (hasErrors(errors)) invalid(errors);
      const task = { id: uid('t'), projectId, ...data, createdById: user.id, createdAt: nowIso(), updatedAt: nowIso() };
      db.tasks.push(task);
      project.updatedAt = nowIso();
      const assignee = findUser(task.assigneeId);
      logActivity('task.created', user, projectId, task.id, assignee ? `created "${task.title}" and assigned it to ${assignee.name}` : `created "${task.title}"`);
      save();
      return serializeTask(task);
    }),

    // PATCH /api/tasks/:id
    update: (taskId, input) => handle(() => {
      const user = requireUser();
      const { task, project } = requireTask(taskId, user);
      const next = { ...task, ...pick(input, ['title', 'description', 'status', 'priority', 'deadline', 'assigneeId']) };
      next.title = next.title?.trim();
      next.description = (next.description ?? '').trim();
      next.assigneeId = next.assigneeId || null;
      const errors = validateTask(next, { project, deadlineChanged: next.deadline !== task.deadline });
      if (hasErrors(errors)) invalid(errors);

      const statusLabel = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', completed: 'Completed' };
      if (next.status !== task.status) {
        logActivity('task.status', user, project.id, task.id, next.status === 'completed' ? `completed "${next.title}"` : `moved "${next.title}" to ${statusLabel[next.status]}`);
      }
      if (next.assigneeId !== task.assigneeId) {
        const assignee = findUser(next.assigneeId);
        logActivity('task.assigned', user, project.id, task.id, assignee ? `assigned "${next.title}" to ${assignee.name}` : `unassigned "${next.title}"`);
      }
      Object.assign(task, next, { updatedAt: nowIso() });
      project.updatedAt = nowIso();
      save();
      return serializeTask(task);
    }),

    // DELETE /api/tasks/:id  (project owner or task creator)
    remove: (taskId) => handle(() => {
      const user = requireUser();
      const { task, project } = requireTask(taskId, user);
      if (project.ownerId !== user.id && task.createdById !== user.id) {
        throw new ApiError(403, 'Only the project owner or the person who created this task can delete it.');
      }
      db.tasks = db.tasks.filter((t) => t.id !== taskId);
      logActivity('task.deleted', user, project.id, null, `deleted "${task.title}"`);
      save();
      return { id: taskId };
    }),
  },

  dashboard: {
    // GET /api/dashboard
    get: () => handle(() => {
      const user = requireUser();
      const projects = memberProjects(user);
      const ids = new Set(projects.map((p) => p.id));
      const tasks = db.tasks.filter((t) => ids.has(t.projectId));
      const today = todayStr();
      const weekAhead = dateOffset(7);
      const count = (status) => tasks.filter((t) => t.status === status).length;

      return {
        stats: {
          totalProjects: projects.length,
          activeProjects: projects.filter((p) => p.status === 'active').length,
          totalTasks: tasks.length,
          pendingTasks: count('todo'),
          inProgressTasks: count('in_progress'),
          inReviewTasks: count('in_review'),
          completedTasks: count('completed'),
          overdueTasks: tasks.filter(isTaskOverdue).length,
          myOpenTasks: tasks.filter((t) => t.assigneeId === user.id && t.status !== 'completed').length,
        },
        upcoming: tasks
          .filter((t) => t.status !== 'completed' && t.deadline >= today && t.deadline <= weekAhead)
          .sort((a, b) => TASK_SORTS.deadline(a, b) || TASK_SORTS.priority(a, b))
          .slice(0, 6)
          .map(serializeTask),
        overdue: tasks.filter(isTaskOverdue).sort(TASK_SORTS.deadline).slice(0, 5).map(serializeTask),
        projects: projects
          .filter((p) => p.status !== 'completed')
          .map(serializeProject)
          .sort(PROJECT_SORTS.deadline),
        activity: db.activity.filter((a) => ids.has(a.projectId)).slice(0, 10).map(serializeActivity),
      };
    }),
  },

  /** Restores the original demo workspace (used from Profile settings). */
  resetDemoData: () => handle(() => {
    db = createSeed();
    save();
    return { ok: true };
  }),
};
