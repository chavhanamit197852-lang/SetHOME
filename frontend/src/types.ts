export type Role = 'USER' | 'VENDOR' | 'ADMIN';

export type RoomStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ImageStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
}

export interface RoomImage {
  id: number;
  url: string;
  displayOrder: number;
  status?: ImageStatus;
}

export interface Room {
  id: number;
  title: string;
  price: string;
  location: string;
  type: string;
  description: string;

  /*
   * Kept temporarily for compatibility with the existing frontend/backend.
   * New UI should prefer images[].
   */
  image?: string;

  /*
   * New multi-image room gallery.
   */
  images?: RoomImage[];

  status?: RoomStatus;

  /*
   * Available in vendor/admin responses only.
   * Public room responses should not expose this.
   */
  vendorEmail?: string;

  rejectionReason?: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  userName?: string;
  reviewerName?: string;
  createdAt?: string;
}

export interface HomeRequest {
  requestId: number;
  roomTitle: string;
  roomLocation: string;
  roomPrice: string;
  name: string;
  phone?: string;
  age?: number;
  occupation: string;
  qualification?: string;
  puneDuration: string;
  message?: string;
  status: string;
  adminReason?: string;
  createdAt?: string;
}