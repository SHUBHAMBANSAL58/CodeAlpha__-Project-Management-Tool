// Single entry point for data access used by every page and component.
//
// The demo workspace runs on `mockBackend`, which mirrors the REST contract
// of the planned Express API. Milestone 2 re-points each method at `api`
// (axios), e.g. `list: (params) => api.get('/projects', { params })`, without
// touching any UI code.
import { mockBackend } from './mockBackend';

export const UNAUTHORIZED_EVENT = 'cadence:unauthorized';

/** Wraps every service call so an expired session signs the user out everywhere. */
function withAuthGuard(group) {
  return Object.fromEntries(
    Object.entries(group).map(([name, fn]) => [
      name,
      async (...args) => {
        try {
          return await fn(...args);
        } catch (error) {
          if (error?.status === 401 && name !== 'login') window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
          throw error;
        }
      },
    ]),
  );
}

export const authService = withAuthGuard(mockBackend.auth);
export const userService = withAuthGuard(mockBackend.users);
export const projectService = withAuthGuard(mockBackend.projects);
export const taskService = withAuthGuard(mockBackend.tasks);
export const dashboardService = withAuthGuard(mockBackend.dashboard);
export const resetDemoData = mockBackend.resetDemoData;
export { ApiError } from './ApiError';
