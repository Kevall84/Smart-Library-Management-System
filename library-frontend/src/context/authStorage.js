export const TOKEN_KEY = "auth_token";
export const USER_KEY = "auth_user";

export const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

