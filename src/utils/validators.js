export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const validatePassword = (pw) =>
  pw.length >= 8 &&
  /[a-z]/.test(pw) &&
  /[A-Z]/.test(pw) &&
  /[0-9]/.test(pw)

export const validateUsername = (u) =>
  u.length >= 3 &&
  u.length <= 50 &&
  /^[a-zA-Z0-9_]+$/.test(u)
