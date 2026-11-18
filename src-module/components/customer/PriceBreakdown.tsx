import { cn, formatMoney } from "@/lib/utils";

export interface PriceBreakdownProps {
  days: number;
  dailyPrice: number;
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  className?: string;
}

/**
 * The price rows used by checkout, the confirmation and the reservation details, so the customer sees the same
 * numbers everywhere. The server computes every figure; this only draws them. Fee and tax rows appear only when
 * they are charged.
 */
export function PriceBreakdown({ days, dailyPrice, subtotal, serviceFee, tax, total, className }: PriceBreakdownProps) {
  const row = "flex items-baseline justify-between gap-4 py-2.5 text-sm";
  return (
    <dl className={cn("divide-y divide-navy-900/10", className)}>
      <div className={row}>
        <dt className="text-navy-700">Rental duration</dt>
        <dd className="text-right font-medium text-navy-900">
          {days} {days === 1 ? "day" : "days"}
        </dd>
      </div>
      <div className={row}>
        <dt className="text-navy-700">
          {formatMoney(dailyPrice)} × {days} {days === 1 ? "day" : "days"}
        </dt>
        <dd className="text-right font-medium text-navy-900">{formatMoney(subtotal)}</dd>
      </div>
      {serviceFee > 0 ? (
        <div className={row}>
          <dt className="text-navy-700">Service fee</dt>
          <dd className="text-right font-medium text-navy-900">{formatMoney(serviceFee)}</dd>
        </div>
      ) : null}
      {tax > 0 ? (
        <div className={row}>
          <dt className="text-navy-700">Taxes</dt>
          <dd className="text-right font-medium text-navy-900">{formatMoney(tax)}</dd>
        </div>
      ) : null}
      <div className={row}>
        <dt className="font-semibold text-navy-900">Total</dt>
        <dd className="text-right font-display text-lg font-semibold text-navy-900">{formatMoney(total)}</dd>
      </div>
    </dl>
  );
}
