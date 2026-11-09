/** Business rules for rentals. Mirror these in the API when it exists. */
export const RENTAL_RULES = {
  /** Shortest rental, in hours. */
  minHours: 4,
  /** Longest rental, in days. */
  maxDays: 30,
  /** How far ahead the calendar lets a customer browse, in months. */
  calendarMonthsAhead: 12,
} as const;
