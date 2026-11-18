import type { Car as ApiCar, CarInput, PartnerProfile, Reservation as ApiReservation, User } from "@/types/api";
import type { Partner, PartnerCarInput, PartnerCarStatus, PartnerCarView, PartnerReservationView } from "@/types/partner";
import { bodyTypeFromApi, bodyTypeToApi, imagesFromUrls } from "./cars";
import { mapHistory } from "./customer";
import { idOf, orEmpty, toDateKey, toWallClock } from "./common";

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

/** A booking on one of the partner's cars, with the customer's contact details the API shares for the handover. */
export function mapPartnerReservation(r: ApiReservation): PartnerReservationView {
  const car = `${r.carMake ?? ""} ${r.carModel ?? ""}`.trim();
  return {
    id: idOf(r.id),
    customerId: idOf(r.customerId),
    partnerId: idOf(r.partnerId),
    carId: idOf(r.carId),
    pickupLocation: orEmpty(r.pickupLocation),
    pickupDate: toWallClock(r.pickupTime ? `${r.pickupDate.slice(0, 10)}T${r.pickupTime}` : r.pickupDate),
    returnDate: toWallClock(r.returnTime ? `${r.returnDate.slice(0, 10)}T${r.returnTime}` : r.returnDate),
    status: r.status,
    bookingType: r.bookingType ?? "standard",
    dailyPrice: r.dailyPrice,
    totalPrice: r.totalPrice,
    bookingReference: r.bookingReference,
    statusReason: r.statusReason || undefined,
    createdAt: r.createdAt,
    customer: { id: idOf(r.customerId), name: orEmpty(r.customerName), email: orEmpty(r.customerEmail), phone: orEmpty(r.customerPhone) },
    car: {
      id: idOf(r.carId),
      make: r.carMake ?? "",
      model: r.carModel ?? "",
      year: r.carYear ?? 0,
      type: bodyTypeFromApi(r.carType ?? ""),
      location: orEmpty(r.carLocation),
      images: imagesFromUrls(r.carImage ? [r.carImage] : [], car),
    },
    days: r.rentalDays ?? 1,
    pricing:
      r.subtotalAmount !== undefined
        ? { subtotal: r.subtotalAmount, serviceFee: r.serviceFeeAmount ?? 0, tax: r.taxAmount ?? 0, total: r.totalPrice }
        : undefined,
    history: mapHistory(r.history),
  };
}
