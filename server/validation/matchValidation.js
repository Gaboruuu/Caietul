const ROLES = ["Top", "Jungle", "Mid", "Bot", "Support"];
const RESULTS = ["Victory", "Defeat", "Remake"];
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const validateNumber = (value, fieldName, min, max) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return `${fieldName} must be a number.`;
  }

  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}.`;
  }

  return undefined;
};

const isValidDateString = (value) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
};

export const validateMatchInput = (payload) => {
  const errors = {};

  if (!isNonEmptyString(payload?.champion)) {
    errors.champion = "Champion name is required.";
  } else if (payload.champion.trim().length > 30) {
    errors.champion = "Champion name must be 30 characters or fewer.";
  }

  if (!ROLES.includes(payload?.role)) {
    errors.role = `Role must be one of: ${ROLES.join(", ")}.`;
  }

  if (!RESULTS.includes(payload?.result)) {
    errors.result = `Result must be one of: ${RESULTS.join(", ")}.`;
  }

  const fields = [
    ["kills", 0, 99],
    ["deaths", 0, 99],
    ["assists", 0, 99],
    ["cs", 0, 1500],
    ["visionScore", 0, 300],
    ["duration", 60, 7200],
  ];

  for (const [fieldName, min, max] of fields) {
    const error = validateNumber(payload?.[fieldName], fieldName, min, max);
    if (error) {
      errors[fieldName] = error;
    }
  }

  if (!isValidDateString(payload?.date)) {
    errors.date = "Date must be a valid date string.";
  }

  if (!isNonEmptyString(payload?.patch)) {
    errors.patch = "Patch is required.";
  } else if (!/^\d+\.\d+$/.test(payload.patch.trim())) {
    errors.patch = "Patch must be in format e.g. 14.8";
  }

  if (payload?.notes !== undefined && typeof payload.notes !== "string") {
    errors.notes = "Notes must be a string when provided.";
  } else if (typeof payload?.notes === "string" && payload.notes.length > 500) {
    errors.notes = "Notes must be 500 characters or fewer.";
  }

  return errors;
};

export const validatePaginationQuery = (query) => {
  const errors = {};
  let page = 1;
  let pageSize = DEFAULT_PAGE_SIZE;

  if (query.page !== undefined) {
    page = Number(query.page);
    if (!Number.isInteger(page) || page < 1) {
      errors.page = "Page must be a positive integer.";
      page = 1;
    }
  }

  if (query.pageSize !== undefined) {
    pageSize = Number(query.pageSize);
    if (!Number.isInteger(pageSize) || pageSize < 1) {
      errors.pageSize = "Page size must be a positive integer.";
      pageSize = DEFAULT_PAGE_SIZE;
    } else if (pageSize > MAX_PAGE_SIZE) {
      errors.pageSize = `Page size must be ${MAX_PAGE_SIZE} or less.`;
    }
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    page,
    pageSize,
  };
};

export const matchValidationConfig = {
  roles: ROLES,
  results: RESULTS,
  defaultPageSize: DEFAULT_PAGE_SIZE,
  maxPageSize: MAX_PAGE_SIZE,
};
