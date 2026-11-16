"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { BookingBlock, DateKey, RentalValidation, TimeKey, WallClock } from "@/types/booking";
import { validateRental } from "@/features/availability";
import { combine } from "@/lib/date";

interface BookingState {
  blocks: BookingBlock[];
  now: WallClock;
  startDate?: DateKey;
  endDate?: DateKey;
  pickupTime: TimeKey;
  returnTime: TimeKey;
  pickup?: WallClock;
  returnAt?: WallClock;
  validation: RentalValidation;
  selectDay: (day: DateKey) => void;
  setPickupTime: (t: TimeKey) => void;
  setReturnTime: (t: TimeKey) => void;
  clear: () => void;
}

const Ctx = createContext<BookingState | null>(null);

export function useBooking(): BookingState {
  const value = useContext(Ctx);
  if (!value) throw new Error("useBooking must be used inside <BookingProvider>");
  return value;
}

/**
 * Holds the customer's date selection so the calendar (left column) and the
 * reserve card (right column) stay in sync. Validation uses the same pure
 * function the server runs again before a reservation proceeds.
 */
export function BookingProvider({
  blocks,
  now,
  initial,
  children,
}: {
  blocks: BookingBlock[];
  now: WallClock;
  initial: { startDate?: DateKey; endDate?: DateKey; pickupTime: TimeKey; returnTime: TimeKey };
  children: ReactNode;
}) {
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [pickupTime, setPickupTime] = useState(initial.pickupTime);
  const [returnTime, setReturnTime] = useState(initial.returnTime);

  const selectDay = useCallback(
    (day: DateKey) => {
      if (!startDate || endDate || day < startDate) {
        setStartDate(day);
        setEndDate(undefined);
      } else {
        setEndDate(day);
      }
    },
    [startDate, endDate],
  );

  const clear = useCallback(() => {
    setStartDate(undefined);
    setEndDate(undefined);
  }, []);

  const value = useMemo<BookingState>(() => {
    const pickup = startDate ? combine(startDate, pickupTime) : undefined;
    const returnAt = endDate ? combine(endDate, returnTime) : undefined;
    return {
      blocks,
      now,
      startDate,
      endDate,
      pickupTime,
      returnTime,
      pickup,
      returnAt,
      validation: validateRental(blocks, pickup, returnAt, now),
      selectDay,
      setPickupTime,
      setReturnTime,
      clear,
    };
  }, [blocks, now, startDate, endDate, pickupTime, returnTime, selectDay, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
