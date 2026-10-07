import type { BookingBlock } from "@/types/booking";
import { addDays, combine, dateOf, nowWall } from "@/lib/date";

/**
 * Mock bookings, generated relative to today so the demo never goes stale.
 * Each helper returns a block from `fromDay` to `toDay` (days from today).
 */
const today = () => dateOf(nowWall());

let seq = 0;
function block(
  carId: string,
  fromDay: number,
  fromTime: string,
  toDay: number,
  toTime: string,
  kind: BookingBlock["kind"] = "booking",
): BookingBlock {
  const base = today();
  return {
    id: `blk_${String(++seq).padStart(3, "0")}`,
    carId,
    start: combine(addDays(base, fromDay), fromTime),
    end: combine(addDays(base, toDay), toTime),
    kind,
  };
}

export function getMockBookings(): BookingBlock[] {
  seq = 0;
  return [
    // Corolla: free today, booked in a few days (conflicts with a search that spans it)
    block("car_001", 3, "10:00", 6, "10:00"),
    block("car_001", 14, "09:00", 16, "18:00"),
    // Sportage: currently out, back in four days (shows "Available from")
    block("car_002", -1, "09:00", 4, "14:00"),
    block("car_002", 9, "10:00", 12, "10:00"),
    // Swift: wide open
    // BMW: out now, then booked again later
    block("car_004", -2, "12:00", 2, "12:00"),
    block("car_004", 7, "10:00", 10, "10:00"),
    // Camry: one booking next week
    block("car_005", 6, "08:00", 9, "20:00"),
    // Tucson: owner maintenance hold, followed by a booking
    block("car_006", 1, "00:00", 3, "00:00", "blocked"),
    block("car_006", 5, "10:00", 8, "10:00"),
    // Tesla: out for a long rental
    block("car_007", -3, "10:00", 11, "10:00"),
    // Jazz: back-to-back bookings (two stretches that run into each other)
    block("car_008", 2, "10:00", 4, "10:00"),
    block("car_008", 4, "10:00", 6, "10:00"),
    // Prado: busy weekend block next week
    block("car_009", 5, "09:00", 7, "21:00"),
    block("car_009", 18, "09:00", 22, "09:00"),
    // CX-5: free this week, booked next
    block("car_010", 8, "10:00", 13, "10:00"),
    // Golf: short trips
    block("car_011", 1, "14:00", 2, "10:00"),
    block("car_011", 10, "10:00", 12, "10:00"),
    // A5: currently out
    block("car_012", 0, "08:00", 5, "08:00"),
  ];
}
