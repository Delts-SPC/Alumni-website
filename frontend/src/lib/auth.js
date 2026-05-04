const SESSION_KEY = "daec_admin_session_v1";

export function login(email, password) {
  const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
  const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;
  if (
    email?.trim().toLowerCase() === adminEmail?.trim().toLowerCase() &&
    password === adminPassword
  ) {
    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

export function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}
