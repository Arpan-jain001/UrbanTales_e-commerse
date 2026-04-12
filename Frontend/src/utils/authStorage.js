import { clearAuthSession, getAuthToken, getAuthUser, saveAuthSession } from "./authSession";

export const saveUserAuth = (token, user, options = {}) =>
  saveAuthSession("user", {
    token,
    user,
    remember: options.remember !== false,
  });

export const clearUserAuth = () => clearAuthSession("user");

export const getStoredUser = () => getAuthUser("user");

export const getStoredUserToken = () => getAuthToken("user");
