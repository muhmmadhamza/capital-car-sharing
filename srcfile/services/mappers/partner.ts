import type { Car as ApiCar, CarInput, PartnerProfile, User } from "@/types/api";
import type { Partner, PartnerCarInput, PartnerCarStatus, PartnerCarView } from "@/types/partner";
import { bodyTypeFromApi, bodyTypeToApi, imagesFromUrls } from "./cars";
import { idOf, orEmpty, toDateKey } from "./common";

/** Partner account from the profile the API returns. */
export function mapPartner(p: PartnerProfile): Partner {
  return {
    id: idOf(p.id),
    name: orEmpty(p.name),
    companyName: p.companyName || undefined,
    email: orEmpty(p.email),
    phone: orEmpty(p.phone),
    address: orEmpty(p.address),
    avatar: p.avatar || undefined,
    createdAt: p.createdAt,
  };
}

/** A partner that was just registered: the profile when the API nests it, the signed-up details otherwise. */
export function mapPartnerFromUser(u: User, fallback: { companyName?: string; address?: string }): Partner {
  if (u.partner) return mapPartner({ ...u.partner, name: u.partner.name ?? u.name, email: u.partner.email ?? u.email, phone: u.partner.phone ?? u.phone, avatar: u.partner.avatar ?? u.avatar });
  return {
    id: idOf(u.id),
    name: u.name,
    companyName: fallback.companyName || undefined,
    email: u.email,
    phone: orEmpty(u.phone),
    address: orEmpty(fallback.address),
    avatar: u.avatar || undefined,
    createdAt: u.createdAt,
  };
}

/** What the partner sees as the listing state, from the API's approval + active flags. */
export function listingStatusOf(c: Pick<ApiCar, "approvalStatus" | "status">): PartnerCarStatus {
  switch (c.approvalStatus) {
    case "pending":
      return "pending";
    case "rejected":
      return "rejected";
    case "suspended":
      return "suspended";
    default:
      return c.status === "active" ? "available" : "unavailable";
  }
}

export function mapPartnerCar(c: ApiCar): PartnerCarView {
  const status = listingStatusOf(c);
  return {
    id: idOf(c.id),
    partnerId: idOf(c.partnerId),
    make: c.make,
    model: c.model,
    year: c.year,
    type: bodyTypeFromApi(c.type),
    seats: c.seats,
    doors: c.doors,
    transmission: c.transmission,
    fuelType: c.fuelType,
    dailyPrice: c.dailyPrice,
    location: c.location,
    description: orEmpty(c.description),
    images: imagesFromUrls(c.images, `${c.make} ${c.model}`),
    features: c.features ?? [],
    createdAt: c.createdAt,
    status,
    listingStatus: status,
    // Today's calendar status comes from the API's availability data. It is never guessed from the approval
    // or listing status; when the API did not send it, it stays undefined and the screens say so.
    today: c.availabilityToday?.status,
    todayDate: c.availabilityToday?.date ? toDateKey(c.availabilityToday.date) : undefined,
  };
}

export function toApiCarInput(input: PartnerCarInput): CarInput {
  return {
    make: input.make.trim(),
    model: input.model.trim(),
    year: input.year,
    type: bodyTypeToApi(input.type),
    seats: input.seats,
    doors: input.doors,
    transmission: input.transmission,
    fuelType: input.fuelType,
    dailyPrice: input.dailyPrice,
    location: input.location.trim(),
    description: input.description.trim(),
    images: input.images.map((i) => i.src).filter((s): s is string => Boolean(s)),
    features: input.features,
  };
}
