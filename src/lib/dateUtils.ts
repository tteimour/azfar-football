/**
 * Date utilities for dd/mm format with auto-year detection
 */

/**
 * Formats an ISO date string to dd/mm format
 * @param isoDate - ISO date string (e.g., "2026-01-25")
 * @returns Date string in dd/mm format (e.g., "25/01")
 */
export function formatDateDDMM(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
}

/**
 * Formats an ISO date string to a full display format
 * @param isoDate - ISO date string
 * @returns Formatted string like "25/01 (Sat)"
 */
export function formatDateDisplay(isoDate: string): string {
  const date = new Date(isoDate);
  const ddmm = formatDateDDMM(isoDate);
  const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' });
  return `${ddmm} (${dayName})`;
}

/**
 * Parses a dd/mm string to ISO date format using current or next year
 * If the date has already passed this year, uses next year
 * @param ddmm - Date string in dd/mm format (e.g., "25/01")
 * @returns ISO date string (e.g., "2026-01-25")
 */
export function parseDateDDMM(ddmm: string): string {
  const parts = ddmm.split('/');
  if (parts.length !== 2) {
    throw new Error('Invalid date format. Expected dd/mm');
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);

  if (isNaN(day) || isNaN(month) || day < 1 || day > 31 || month < 1 || month > 12) {
    throw new Error('Invalid date values');
  }

  const today = new Date();
  let year = today.getFullYear();

  // Create a date with current year
  const candidateDate = new Date(year, month - 1, day);

  // If the date has passed, use next year
  if (candidateDate < today) {
    year += 1;
  }

  // Format as ISO date (YYYY-MM-DD)
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');

  return `${year}-${monthStr}-${dayStr}`;
}

/**
 * Validates a dd/mm date string
 * @param ddmm - Date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidDDMM(ddmm: string): boolean {
  if (!ddmm || typeof ddmm !== 'string') return false;

  const match = ddmm.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);

  if (month < 1 || month > 12) return false;

  // Check day validity for the month
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysInMonth[month - 1]) return false;

  return true;
}

/**
 * Gets today's date in ISO format
 * @returns ISO date string for today
 */
export function getTodayISO(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Checks if a date is in the past
 * @param isoDate - ISO date string
 * @returns true if the date is before today
 */
export function isDatePast(isoDate: string): boolean {
  const date = new Date(isoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Gets relative time description for a date
 * @param isoDate - ISO date string
 * @returns Human-readable relative time (e.g., "Today", "Tomorrow", "In 3 days")
 */
export function getRelativeDay(isoDate: string): string {
  const date = new Date(isoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;

  return formatDateDisplay(isoDate);
}
