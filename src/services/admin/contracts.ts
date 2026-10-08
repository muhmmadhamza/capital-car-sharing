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
 * from src/services/admin/*.service.ts. Each of those picks the mock or the
 * HTTP implementation, so moving to Next.js -> Node.js -> PostgreSQL means
 * filling in ./http.ts, not rewriting a screen.
 *
 * Admin accounts, session and endpoints are separate from customers and
 * partners. The API must reject a customer or partner session on every
 * /admin route and the other way round.
 *
 * Planned API, all under /api/v1, session in an httpOnly cookie, every route
 * requires an admin session (401 unauthenticated / 403 forbidden):
 *   POST  /admin/auth/login           { email, password, remember }  -> Admin  (401 invalid_credentials)
 *   POST  /admin/auth/logout                                         -> 204
 *   GET   /admin/me                                                  -> Admin | 401
 *   GET   /admin/dashboard                                           -> AdminDashboard
 *   GET   /admin/customers                                           -> AdminCustomerRow[]
 *   GET   /admin/customers/:id                                       -> AdminCustomerDetail   (404 not_found)
 *   PATCH /admin/customers/:id        AdminCustomerUpdate            -> AdminCustomerRow      (409 email_taken)
 *   PATCH /admin/customers/:id/status { status }                     -> AdminCustomerRow
 *   GET   /admin/partners                                            -> AdminPartnerRow[]
 *   GET   /admin/partners/:id                                        -> AdminPartnerDetail    (404 not_found)
 *   PATCH /admin/partners/:id/status  { status }                     -> AdminPartnerRow
 *   GET   /admin/cars                                                -> AdminCarView[]
 *   GET   /admin/cars/:id                                            -> AdminCarDetail        (404 not_found)
 *   GET   /admin/locations                                           -> AdminLocation[]
 *   PATCH /admin/cars/:id             AdminCarUpdate                 -> AdminCarView
 *   PATCH /admin/cars/:id/status      { status }                     -> AdminCarView          (409 conflict on a move the workflow forbids)
 *   POST  /admin/cars/:id/approve                                    -> AdminCarView          (409 conflict when not pending/rejected)
 *   POST  /admin/cars/:id/reject                                     -> AdminCarView          (409 conflict when not pending)
 *   POST  /admin/cars/:id/suspend                                    -> AdminCarView          (409 conflict when not approved)
 *   POST  /admin/cars/:id/activate                                   -> AdminCarView          (409 conflict when not suspended)
 *   DELETE /admin/cars/:id                                           -> 204                   (409 conflict with upcoming/active reservations)
 *   GET   /admin/reservations                                        -> AdminReservationView[]
 *   GET   /admin/reservations/:id                                    -> AdminReservationDetail (404 not_found)
 *   GET   /admin/settings                                            -> AdminSettings
 *   PUT   /admin/settings             AdminSettings                  -> AdminSettings         (400 invalid_input + field)
 *
 * Lists are returned whole for now. Add ?page, ?limit, ?q and ?status on the
 * server when the tables grow; the UI already filters through one function.
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
 * does not allow (409 conflict), so the rules live in one place for both the mock and the API.
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
