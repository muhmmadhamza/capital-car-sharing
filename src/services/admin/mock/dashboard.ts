import { delay } from "@/lib/browser-storage";
import type { ActivityStatus, AdminActivity, AdminDashboard } from "@/types/admin";
import type { AdminDashboardRepository } from "../contracts";
import { requireMockAdminSession } from "./auth";
import { allCars, allCustomers, allPartners, allReservations, carName } from "./store";

const ACTIVITY_LIMIT = 8;

/**
 * Everything is derived from the same mock records the Customers and Partners
 * pages edit, so approving a partner or deactivating a customer shows up here.
 */
function buildDashboard(): AdminDashboard {
  const customers = allCustomers();
  const partners = allPartners();
  const cars = allCars();
  const reservations = allReservations();
  const partnerName = (id: string) => partners.find((p) => p.id === id)?.companyName ?? "Unknown partner";
  const carLabel = (id: string) => {
    const car = cars.find((c) => c.id === id);
    return car ? `${car.make} ${car.model}` : "Unknown car";
  };
  const customerName = (id: string) => customers.find((c) => c.id === id)?.name ?? "Unknown customer";

  const activity: AdminActivity[] = [
    ...customers.map<AdminActivity>((c) => ({
      id: `act_${c.id}`,
      type: "customer_registered",
      name: c.name,
      detail: c.email,
      occurredAt: c.createdAt,
      status: c.status,
      href: `/admin/customers/${c.id}`,
    })),
    ...partners.map<AdminActivity>((p) => ({
      id: `act_${p.id}`,
      type: "partner_registered",
      name: p.companyName,
      detail: `Contact: ${p.name}`,
      occurredAt: p.createdAt,
      status: p.status,
      href: `/admin/partners/${p.id}`,
    })),
    ...cars.map<AdminActivity>((c) => ({
      id: `act_${c.id}`,
      type: "car_added",
      name: carName(c),
      detail: `Listed by ${partnerName(c.partnerId)}`,
      occurredAt: c.createdAt,
      status: c.approvalStatus as ActivityStatus,
      href: `/admin/partners/${c.partnerId}#cars`,
    })),
    ...reservations.map<AdminActivity>((r) => ({
      id: `act_${r.id}`,
      type: "reservation_created",
      name: customerName(r.customerId),
      detail: `${carLabel(r.carId)} · ${r.pickupLocation}`,
      occurredAt: r.createdAt,
      status: r.status,
      href: `/admin/customers/${r.customerId}#reservations`,
    })),
  ]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, ACTIVITY_LIMIT);

  return {
    stats: {
      totalCustomers: customers.length,
      totalPartners: partners.length,
      totalCars: cars.length,
      availableCars: cars.filter((c) => c.status === "available" && c.approvalStatus === "approved").length,
      bookedCars: cars.filter((c) => c.status === "booked").length,
      totalReservations: reservations.length,
      upcomingReservations: reservations.filter((r) => r.status === "upcoming").length,
      completedReservations: reservations.filter((r) => r.status === "completed").length,
    },
    attention: {
      pendingPartners: partners.filter((p) => p.status === "pending").length,
      pendingCars: cars.filter((c) => c.approvalStatus === "pending").length,
      inactiveCustomers: customers.filter((c) => c.status === "inactive").length,
    },
    activity,
  };
}

export const mockAdminDashboard: AdminDashboardRepository = {
  async getDashboard() {
    await delay(350);
    requireMockAdminSession();
    return buildDashboard();
  },
};
