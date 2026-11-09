import type {
  Admin,
  AdminCarDetail,
  AdminCarUpdate,
  AdminCarView,
  AdminCustomerDetail,
  AdminCustomerRow,
  AdminCustomerUpdate,
  AdminDashboard,
  AdminLocation,
  AdminLoginInput,
  AdminPartnerDetail,
  AdminPartnerRow,
  AdminReservationDetail,
  AdminReservationView,
  AdminSettings,
  CarApprovalStatus,
  CustomerStatus,
  PartnerStatus,
} from "@/types/admin";

/**
 * Data-access contracts for the ADMIN area. Screens only import the functions
 * from src/services/admin/*.service.ts, which use ./api-repository.ts. That file
 * adapts the endpoints in src/services/api/admin.service.ts to these shapes.
 *
 * Admin accounts use the same /auth endpoints as everyone else; the repository
 * refuses any session whose role is not "admin". The API must also reject a
 * customer or partner token on every /admin route.
 *
 * Endpoints used:
 *   POST /auth/login, GET /auth/me, POST /auth/logout
 *   GET  /admin/customers, /admin/partners, /admin/cars, /admin/reservations   (paged, all pages are read)
 *   PATCH /admin/cars/:id/approve | reject | suspend
 *   PATCH /admin/partners/:id/activate | suspend
 * Detail pages, counts and the dashboard are built from those lists.
 *
 * Not offered by the backend yet. These report "unavailable" and change nothing:
 *   - editing or deleting a customer, changing a customer's status
 *   - editing or deleting a car
 *   - moving a partner back to "pending"
 *   - platform settings (read and save)
 */
export interface AdminAuthRepository {
  loginAdmin(input: AdminLoginInput): Promise<Admin>;
  /** The signed-in admin, or null when there is no admin session. */
  getAdmin(): Promise<Admin | null>;
  logoutAdmin(): Promise<void>;
}

export interface AdminCustomerRepository {
  getCustomers(): Promise<AdminCustomerRow[]>;
  getCustomerById(id: string): Promise<AdminCustomerDetail | null>;
  updateCustomer(id: string, input: AdminCustomerUpdate): Promise<AdminCustomerRow>;
  updateCustomerStatus(id: string, status: CustomerStatus): Promise<AdminCustomerRow>;
}

export interface AdminPartnerRepository {
  getPartners(): Promise<AdminPartnerRow[]>;
  getPartnerById(id: string): Promise<AdminPartnerDetail | null>;
  updatePartnerStatus(id: string, status: PartnerStatus): Promise<AdminPartnerRow>;
}

export interface AdminDashboardRepository {
  getDashboard(): Promise<AdminDashboard>;
}

/**
 * Approval workflow. Every call returns the updated car and refuses a move the workflow
 * does not allow (409 conflict), so the rules live on the server.
 *
 *   pending   --approve--> approved        pending   --reject--> rejected
 *   rejected  --approve--> approved        approved  --suspend-> suspended
 *   suspended --activate-> approved
 */
export interface AdminCarRepository {
  getCars(): Promise<AdminCarView[]>;
  getCarById(id: string): Promise<AdminCarDetail | null>;
  getCarLocations(): Promise<AdminLocation[]>;
  updateCar(id: string, input: AdminCarUpdate): Promise<AdminCarView>;
  /** Generic move through the workflow. approveCar/rejectCar/suspendCar/activateCar are the named shortcuts. */
  updateCarStatus(id: string, status: Exclude<CarApprovalStatus, "pending">): Promise<AdminCarView>;
  approveCar(id: string): Promise<AdminCarView>;
  rejectCar(id: string): Promise<AdminCarView>;
  suspendCar(id: string): Promise<AdminCarView>;
  activateCar(id: string): Promise<AdminCarView>;
  deleteCar(id: string): Promise<void>;
}

/** Read-only on purpose: reservations are managed by customers and partners. No payments or refunds here. */
export interface AdminReservationRepository {
  getReservations(): Promise<AdminReservationView[]>;
  getReservationById(id: string): Promise<AdminReservationDetail | null>;
}

export interface AdminSettingsRepository {
  getSettings(): Promise<AdminSettings>;
  updateSettings(input: AdminSettings): Promise<AdminSettings>;
}
