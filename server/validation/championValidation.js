const ROLES = ["Top", "Jungle", "Mid", "Bot", "Support"];

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const validateChampionInput = (payload) => {
  const errors = {};

  if (!isNonEmptyString(payload?.name)) {
    errors.name = "Champion name is required.";
  } else if (payload.name.trim().length > 40) {
    errors.name = "Champion name must be 40 characters or fewer.";
  }

  if (!isNonEmptyString(payload?.icon)) {
    errors.icon = "Champion icon is required.";
  } else if (payload.icon.trim().length > 4) {
    errors.icon = "Champion icon must be 4 characters or fewer.";
  }

  if (!ROLES.includes(payload?.role)) {
    errors.role = `Role must be one of: ${ROLES.join(", ")}.`;
  }

  return errors;
};

export const championValidationConfig = {
  roles: ROLES,
};
