export const getCurrentRoles = (): string[] => {
  try {
    const raw = localStorage.getItem("currentRoles");
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
};

export const isAdmin = (): boolean => {
  return getCurrentRoles().includes("admin");
};

export const logout = (): void => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentRoles");
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
