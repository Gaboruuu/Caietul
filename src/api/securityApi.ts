import { API_BASE } from "../config/apiBase";
import { buildAuthenticatedRequestInit } from "../utils/requestContext";
import type {
  SecurityDashboard,
  SuspiciousObservation,
} from "../types/security";

const parseJson = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
};

export const fetchSecurityDashboard = async (
  limit = 50,
): Promise<SecurityDashboard> => {
  const response = await fetch(
    `${API_BASE}/api/security/dashboard?limit=${encodeURIComponent(limit)}`,
    buildAuthenticatedRequestInit(),
  );

  const payload = await parseJson<SecurityDashboard & { error?: string }>(
    response,
  );

  if (!response.ok) {
    throw new Error(payload.error || `Request failed with ${response.status}`);
  }

  return payload;
};

export const resolveSecurityObservation = async (
  observationId: string,
): Promise<SuspiciousObservation> => {
  const response = await fetch(
    `${API_BASE}/api/security/observations/${encodeURIComponent(observationId)}/resolve`,
    buildAuthenticatedRequestInit({
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    }),
  );

  const payload = await parseJson<{
    observation?: SuspiciousObservation;
    error?: string;
  }>(response);

  if (!response.ok) {
    throw new Error(payload.error || `Request failed with ${response.status}`);
  }

  if (!payload.observation) {
    throw new Error("Security observation response did not include data");
  }

  return payload.observation;
};
