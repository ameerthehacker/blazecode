const USERNAME_KEY = 'username';
const LAST_SELECTED_FILE_PATH_KEY = 'lastSelectedFilePath';
const NEEDS_TEMPLATE_HYDRATION_KEY = 'needsTemplateHydration';

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
