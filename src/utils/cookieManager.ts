/**
 * Cookie Manager - Utilities for managing browser cookies
 */

interface CookieOptions {
  maxAge?: number; // in seconds
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

/**
 * Set a cookie with optional configuration
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  const {
    maxAge = 365 * 24 * 60 * 60, // 1 year default
    path = "/",
    secure = false,
    sameSite = "Lax",
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (maxAge) {
    cookieString += `; max-age=${maxAge}`;
  }

  if (path) {
    cookieString += `; path=${path}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (secure) {
    cookieString += "; secure";
  }

  if (sameSite) {
    cookieString += `; samesite=${sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Get a cookie by name
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=").map((c) => c.trim());

    if (decodeURIComponent(cookieName) === name) {
      return decodeURIComponent(cookieValue);
    }
  }

  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, path: string = "/"): void {
  setCookie(name, "", { maxAge: 0, path });
}

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  const cookies: Record<string, string> = {};

  document.cookie.split(";").forEach((cookie) => {
    const [name, value] = cookie.split("=").map((c) => c.trim());
    if (name) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  });

  return cookies;
}

/**
 * Set a JSON cookie (auto-serializes)
 */
export function setJsonCookie<T>(
  name: string,
  value: T,
  options?: CookieOptions,
): void {
  try {
    const jsonString = JSON.stringify(value);
    setCookie(name, jsonString, options);
  } catch (error) {
    console.error(`Failed to set JSON cookie "${name}":`, error);
  }
}

/**
 * Get a JSON cookie (auto-deserializes)
 */
export function getJsonCookie<T>(name: string): T | null {
  const cookie = getCookie(name);

  if (!cookie) {
    return null;
  }

  try {
    return JSON.parse(cookie) as T;
  } catch (error) {
    console.error(`Failed to parse JSON cookie "${name}":`, error);
    return null;
  }
}
