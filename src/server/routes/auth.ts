import type { Express } from 'express';
import { getActorEmail, getGroups, hasEditorRole, requireAuthenticated } from '../auth/middleware';
export function registerAuthRoutes(app: Express) {
  app.get('/auth/editor-status', requireAuthenticated, (request, response) => response.json({ authenticated: true, actorEmail: getActorEmail(request), groups: getGroups(request), isEditor: hasEditorRole(request) }));
}