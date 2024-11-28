const USERNAME_KEY = 'username';
const LAST_SELECTED_FILE_PATH_KEY = 'lastSelectedFilePath';
const NEEDS_TEMPLATE_HYDRATION_KEY = 'needsTemplateHydration';
const TEMPLATE_KEY = 'template';
const LAST_TEMPLATE_KEY = 'lastTemplate';

export function getUsername() {
  return (localStorage.getItem(USERNAME_KEY) || '').trim();
}

export function setUsername(username: string) {
  localStorage.setItem(USERNAME_KEY, username.trim());
}

export function getLastSelectedFilePath(sessionId: string) {
  return localStorage.getItem(`${sessionId}__${LAST_SELECTED_FILE_PATH_KEY}`);
}

export function setLastSelectedFilePath(sessionId: string, filePath: string) {
  localStorage.setItem(
    `${sessionId}__${LAST_SELECTED_FILE_PATH_KEY}`,
    filePath
  );
}

const getNeedsTemplateHydrationKey = (sessionId: string) =>
  `${sessionId}__${NEEDS_TEMPLATE_HYDRATION_KEY}`;
const getTemplateToHydrateKey = (sessionId: string) =>
  `${sessionId}__${TEMPLATE_KEY}`;

export function setTemplate(sessionId: string, template: string) {
  localStorage.setItem(getTemplateToHydrateKey(sessionId), template);
}

export function getTemplate(sessionId: string) {
  return localStorage.getItem(getTemplateToHydrateKey(sessionId));
}

export function setNeedsTemplateHydration(sessionId: string, needs: boolean) {
  localStorage.setItem(
    getNeedsTemplateHydrationKey(sessionId),
    needs.toString()
  );
}

export function needsTemplateHydration(sessionId: string) {
  return (
    localStorage.getItem(getNeedsTemplateHydrationKey(sessionId)) === 'true'
  );
}

export function getLastTemplate() {
  return localStorage.getItem(LAST_TEMPLATE_KEY);
}

export function setLastTemplate(template: string) {
  return localStorage.setItem(LAST_TEMPLATE_KEY, template);
}
