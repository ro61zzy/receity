/** Digits-only phone for matching customers */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

export function hasValidPhone(phone: string): boolean {
  return normalizePhone(phone).length >= 9;
}
