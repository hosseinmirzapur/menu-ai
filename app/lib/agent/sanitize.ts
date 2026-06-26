export function sanitizeMessage(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .trim()
    .slice(0, 500);
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9+\-()\s]/g, "").trim();
}

export function sanitizeTableNumber(table: string): string {
  return table.replace(/[^0-9a-zA-Z\s-]/g, "").trim().slice(0, 20);
}

export function sanitizeOrderNotes(notes: string): string {
  return notes
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, 500);
}
