import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width={20}
      height={20}
      {...props}
    >
      {children}
    </svg>
  );
}

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Base>
);

export const MenuIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Base>
);

export const PinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Base>
);

export const CalendarIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Base>
);

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Base>
);

export const SeatIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 4.5c-1.4 0-2.3 1.2-2 2.5l1.4 7.2c.2 1 1 1.8 2.1 1.8H15" />
    <path d="M15 16h2.6a1.9 1.9 0 0 1 1.9 1.9V19M9.5 20h9" />
  </Base>
);

export const GearIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="6" cy="6" r="1.8" />
    <circle cx="12" cy="6" r="1.8" />
    <circle cx="18" cy="6" r="1.8" />
    <circle cx="12" cy="18" r="1.8" />
    <path d="M6 8v3.5h12V8M12 11.5v4.7" />
  </Base>
);

export const FuelIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h6A1.5 1.5 0 0 1 14 5.5V20M4 20h11" />
    <path d="M7.5 8h4M14 9.5l2.5 1.7c.7.5 1 1.1 1 2V17a1.5 1.5 0 0 0 3 0V9l-2.5-2.5" />
  </Base>
);

export const ShieldIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-2.5Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Base>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const PhoneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.5 4h3l1.5 4-2 1.4a11 11 0 0 0 5.6 5.6L16 13l4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />
  </Base>
);

export const MailIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="m4 8 8 5.5L20 8" />
  </Base>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m14.5 6-6 6 6 6" />
  </Base>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </Base>
);

export const FilterIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </Base>
);

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);

export const AlertIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4 3 19.5h18L12 4Z" />
    <path d="M12 10v4.2M12 17h.01" />
  </Base>
);

export const BagIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="5" y="8" width="14" height="12" rx="2.5" />
    <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" />
  </Base>
);

export const XCircleIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m9 9 6 6M15 9l-6 6" />
  </Base>
);
