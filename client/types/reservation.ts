export interface Reservation {
  id: number;
  reservationCode: string;
  organization: string;
  purpose: string;
  people: number;
  customer: string;
  customerPhone: string;
  customerPhone2?: string;
  customerEmail?: string;
  startDate: string;
  endDate: string;
  colorCode: string;
  status: string;
  companyZipCode?: string;
  companyAddress?: string;
  businessNumber?: string;
  ceoName?: string;
  siteManager?: string;
  siteManagerPhone?: string;
  siteManagerPhone2?: string;
  siteManagerEmail?: string;
  billingManager?: string;
  billingManagerPhone?: string;
  billingManagerEmail?: string;
  paymentMethod?: string;
  memo?: string;
  rooms?: RoomReservation[];
  classrooms?: ClassroomReservation[];
  meals?: MealReservation[];
  createdAt?: string;
}

export interface RoomReservation {
  roomNumber: string;
  roomType: '1인실' | '2인실' | '4인실';
  reservedDate: string;
}

export interface ClassroomReservation {
  classroomName: string;
  reservedDate: string;
}

export interface MealReservation {
  reservedDate: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  specialBreakfast?: boolean;
  specialLunch?: boolean;
  specialDinner?: boolean;
}
