// User types
export interface User {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

// Event types
export interface Event {
  eventDate: string | number | Date;
  revenue: number;
  eventId: number;
  title: string;
  description: string;
  shortDescription?: string;
  organizerId: number;
  organizerName: string;
  venueId: number;
  venueName: string;
  venueCity: string;
  categoryId: number;
  categoryName: string;
  startDateTime: string;
  endDateTime: string;
  imageUrl?: string;
  basePrice: number;
  currency: string;
  isOnline: boolean;
  ticketsSold: number;
  availableTickets: number;
  status: string;
  isPublished: boolean;
}

export interface TicketType {
  ticketTypeId: number;
  eventId: number;
  name: string;
  description?: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
  quantityRemaining: number;
  isActive: boolean;
  isOnSale: boolean;
}

export interface Ticket {
  ticketId: number;
  eventId: number;
  eventTitle: string;
  ticketTypeName: string;
  ticketNumber: string;
  qrCode?: string;
  pricePaid: number;
  status: string;
  purchaseDate: string;
  attendeeFirstName?: string;
  attendeeLastName?: string;
  attendeeEmail?: string;
  eventStartDateTime: string;
  venueName: string;
  venueAddress: string;
}

export interface Order {
  orderId: number;
  orderNumber: string;
  eventTitle: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  tickets: Ticket[];
}