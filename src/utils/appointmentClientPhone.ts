/** Telefon client pentru afișare clinică (API poate trimite user_phone și/sau client_phone). */
export function getAppointmentClientPhone(row: unknown): string | undefined {
  const a = row as Record<string, unknown>;
  const v = a.user_phone ?? a.userPhone ?? a.client_phone;
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length > 0 ? s : undefined;
}
