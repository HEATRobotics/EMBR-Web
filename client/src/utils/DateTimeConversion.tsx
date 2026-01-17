// Utility functions for date-time format conversions
// Utility function to check if a string is in ISO 8601 date format (one with 'T' and 'Z')
export function isISOFormat(str: any): boolean {
  return typeof str === 'string' && str.includes('T') && str.endsWith('Z');
}

// Convert ISO 8601 string to SQL timestamp format (YYYY-MM-DD HH:MM:SS)
export function convertISOToTimestamp(isoStr: string): string {
  return isoStr.slice(0, 19).replace('T', ' ');
}

// Normalize time fields to ensure they are in SQL timestamp format or null
export function normalizeTimeField(field: any): string | null {
  if (!field) return null; // null stays null
  if (isISOFormat(field)) {
    return convertISOToTimestamp(field);
  }
  return field; // already a timestamp
}
