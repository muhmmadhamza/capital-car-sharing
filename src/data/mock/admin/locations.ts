import type { AdminLocation } from "@/types/admin";

/** Seed pickup branches. Reservations show the branch name; cars point at it by id. */
export const adminLocations: AdminLocation[] = [
  { id: "aloc_downtown", name: "Downtown Station" },
  { id: "aloc_airport", name: "International Airport" },
  { id: "aloc_railway", name: "Central Railway Hub" },
  { id: "aloc_harbour", name: "Harbour Point" },
  { id: "aloc_business", name: "Business Park" },
];

export const locationName = (id: string): string => adminLocations.find((l) => l.id === id)?.name ?? "Unknown location";
