const ACCESS_TOKEN_KEY = "lumifin_access_token";
const REFRESH_TOKEN_KEY = "lumifin_refresh_token";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function setAuthTokens(tokens: AuthTokens): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function getAccessToken(): string | null {
  const storage = getStorage();
  return storage ? storage.getItem(ACCESS_TOKEN_KEY) : null;
}

export function getRefreshToken(): string | null {
  const storage = getStorage();
  return storage ? storage.getItem(REFRESH_TOKEN_KEY) : null;
}

export function clearAuthTokens(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
}
