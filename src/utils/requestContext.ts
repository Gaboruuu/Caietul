import { getCurrentRoles, getCurrentUser } from "./auth";

const buildHeaders = (headers?: HeadersInit): Headers => {
  if (headers instanceof Headers) {
    return new Headers(headers);
  }

  return new Headers(headers || {});
};

export const buildAuthenticatedHeaders = (
  headers: HeadersInit = {},
): Headers => {
  const requestHeaders = buildHeaders(headers);
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return requestHeaders;
  }

  const roles = getCurrentRoles();

  if (currentUser.id) {
    requestHeaders.set("x-user-id", String(currentUser.id));
  }

  if (currentUser.email) {
    requestHeaders.set("x-user-email", String(currentUser.email));
  }

  if (currentUser.name) {
    requestHeaders.set("x-user-name", String(currentUser.name));
  }

  requestHeaders.set("x-user-roles", JSON.stringify(roles));
  requestHeaders.set(
    "x-user-group",
    roles.includes("admin") ? "admin" : "user",
  );

  return requestHeaders;
};

export const buildAuthenticatedRequestInit = (
  init: RequestInit = {},
): RequestInit => ({
  ...init,
  headers: buildAuthenticatedHeaders(init.headers),
});