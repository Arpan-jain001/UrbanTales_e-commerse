export const saveUserAuth = (token, user) => {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("userId", user?._id || user?.id || "");
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("user", JSON.stringify(user));
};

export const clearUserAuth = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

export const getStoredUser = () => {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getStoredUserToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token") || "";
