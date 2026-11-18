/** Business rules for rentals. Mirror these in the API when it exists. */
export const RENTAL_RULES = {
  /** Shortest rental, in hours. */
  minHours: 4,
  /** Longest rental, in days. */
  maxDays: 30,
  /** How far ahead the calendar lets a customer browse, in months. */
  calendarMonthsAhead: 12,
  /**
   * A pickup at least this many hours after booking is an ADVANCE reservation. Mirrors BOOKING_ADVANCE_MIN_HOURS in the API,
   * which is the authority: this copy only gives a faster hint before the request is sent.
   */
  advanceMinHours: 24,
  /** Furthest pickup, in days from today. Mirrors BOOKING_MAX_ADVANCE_DAYS. */
  maxAdvanceDays: 365,
} as const;
