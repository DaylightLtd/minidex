export function normalizeReturnUrl(value: string | null) {
  if (!value || value === "/login" || value === "/register") {
    return "/home";
  }
  return value;
}
