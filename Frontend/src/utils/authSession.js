const STORAGE_MAP = {
  user: {
    token: "token",
    user: "user",
    userId: "userId",
    flag: "isLoggedIn",
  },
  seller: {
    token: "sellerToken",
    user: "sellerUser",
    userId: "sellerUserId",
    flag: "sellerLoggedIn",
  },
  admin: {
    token: "adminToken",
    user: "adminUser",
    userId: "adminUserId",
    flag: "adminLoggedIn",
  },
};

const getKeys = (scope) => STORAGE_MAP[scope] || STORAGE_MAP.user;

const readJSON = (storage, key) => {
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeSession = (storage, keys, token, user) => {
  storage.setItem(keys.token, token);
  storage.setItem(keys.user, JSON.stringify(user));

  const resolvedUserId = user?._id || user?.id || "";
  if (resolvedUserId) {
    storage.setItem(keys.userId, resolvedUserId);
  } else {
    storage.removeItem(keys.userId);
  }

  storage.setItem(keys.flag, "true");
};

export const saveAuthSession = (scope, { token, user, remember = true }) => {
  const keys = getKeys(scope);
  const primary = remember ? localStorage : sessionStorage;
  const secondary = remember ? sessionStorage : localStorage;

  clearAuthSession(scope);
  writeSession(primary, keys, token, user);
  secondary.removeItem(keys.token);
  secondary.removeItem(keys.user);
  secondary.removeItem(keys.userId);
  secondary.removeItem(keys.flag);
};

export const clearAuthSession = (scope) => {
  const keys = getKeys(scope);
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(keys.token);
    storage.removeItem(keys.user);
    storage.removeItem(keys.userId);
    storage.removeItem(keys.flag);
  });
};

export const getAuthToken = (scope) => {
  const keys = getKeys(scope);
  return localStorage.getItem(keys.token) || sessionStorage.getItem(keys.token) || "";
};

export const getAuthUser = (scope) => {
  const keys = getKeys(scope);
  return readJSON(localStorage, keys.user) || readJSON(sessionStorage, keys.user);
};
