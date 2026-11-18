// API types: what the Node.js API sends and receives. Screens use the UI types in src/types and the mappers in src/services/mappers convert between the two.

export type Role = 'customer' | 'partner' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  avatar: string | null;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
  partner?: PartnerProfile | null;
}

export interface PartnerProfile {
  id: number;
  userId: number;
  companyName: string;
  address: string | null;
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
  name?: string;
  email?: string;
  phone?: string | null;
  avatar?: string | null;
}

export type CarType = 'Sedan' | 'SUV' | 'Hatchback' | 'Luxury' | 'Van' | 'Coupe' | 'Convertible' | 'Pickup';
export type Transmission = 'Automatic' | 'Manual';
export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'CNG';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Car {
  id: number;
  partnerId: number;
  make: string;
  model: string;
  year: number;
  type: CarType;
  seats: number;
  doors: number;
  transmission: Transmission;
  fuelType: FuelType;
  dailyPrice: number;
  location: string;
  description: string | null;
  status: 'active' | 'inactive';
  approvalStatus: ApprovalStatus;
  partnerCompanyName: string;
  images: string[];
  features: string[];
  createdAt: string;
  updatedAt: string;
  /** Partner endpoints only: today's calendar status from the availability data. Independent of approvalStatus. */
  availabilityToday?: { date: string; status: 'available' | 'unavailable' | 'booked' };
}

export interface CarInput {
  make: string; model: string; year: number; type: CarType; seats: number; doors: number;
  transmission: Transmission; fuelType: FuelType; dailyPrice: number; location: string;
  description?: string; status?: 'active' | 'inactive'; images?: string[]; features?: string[];
}

export interface CarSearchFilters {
  location?: string; pickupDate?: string; returnDate?: string; carType?: string;
  minPrice?: number; maxPrice?: number; seats?: number; transmission?: string; fuelType?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'year_desc'; page?: number; limit?: number;
}

export interface CarAvailability {
  carId: number;
  startDate: string;
  endDate: string;
  /** The server's "today" (business time zone). */
  today?: string;
  availableDates: string[];
  unavailableDates: string[];
  bookedDates: string[];
}

export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

export interface Reservation {
  id: number;
  customerId: number;
  partnerId: number;
  carId: number;
  pickupLocation: string;
  pickupDate: string;
  returnDate: string;
  status: ReservationStatus;
  dailyPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  carMake?: string; carModel?: string; carYear?: number; carType?: string; carImage?: string | null;
  partnerCompanyName?: string;
  customerName?: string; customerEmail?: string;
  /** Booking fields. Reservations created before the booking module have a reference and 00:00 times too. */
  bookingReference?: string;
  /** "HH:mm". `pickupDate` / `returnDate` stay "YYYY-MM-DD". */
  pickupTime?: string;
  returnTime?: string;
  rentalDays?: number;
  subtotalAmount?: number;
  serviceFeeAmount?: number;
  taxAmount?: number;
  /** Latest reason given for a rejection or cancellation. */
  statusReason?: string | null;
  /** Details endpoints only. Names are included for partners and admins, never for customers. */
  history?: ReservationHistoryEntry[];
  canCancel?: boolean;
  /** Admin and partner views. */
  customerPhone?: string | null;
  partnerName?: string | null;
  partnerEmail?: string | null;
  partnerPhone?: string | null;
  carLocation?: string | null;
}

export interface ReservationHistoryEntry {
  id: number;
  fromStatus: ReservationStatus | null;
  toStatus: ReservationStatus;
  changedByRole: 'customer' | 'partner' | 'admin' | 'system';
  changedByName?: string | null;
  reason?: string | null;
  createdAt: string;
}

/** What the customer asks for. The server prices it and checks availability; nothing else is read from the request. */
export interface BookingWindowInput {
  carId: number;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
}

export interface PriceBreakdown {
  dailyPrice: number;
  rentalDays: number;
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  serviceFeePercent: number;
  taxPercent: number;
}

/** POST /customers/me/reservations/quote. A conflict or invalid window is an error response, not a quote. */
export interface ReservationQuote {
  car: { id: number; make: string; model: string; year: number; location: string };
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  pricing: PriceBreakdown;
  available: true;
  eligibility: {
    canBook: boolean;
    verificationStatus: 'not_submitted' | 'pending_review' | 'approved' | 'rejected' | 'resubmission_required';
    /** Why booking is blocked, ready to show. Null when canBook. */
    message: string | null;
  };
}

export interface AdminDashboard {
  stats: Record<string, number>;
  recentReservations: Array<Record<string, any>>;
  pendingCars: Array<Record<string, any>>;
}
