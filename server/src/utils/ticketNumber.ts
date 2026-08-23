/**
 * Generates an official backend Ticket Number formatted as TKT-YYYY-XXXXXX
 * based on the database primary key ID and current year.
 * e.g., ID 1 in 2026 => TKT-2026-000001
 */
export function generateTicketNumber(id: number, year: number = new Date().getFullYear()): string {
  const paddedId = String(id).padStart(6, "0");
  return `TKT-${year}-${paddedId}`;
}
