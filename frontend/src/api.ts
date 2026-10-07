import type {
  HomeRequest,
  Review,
  Room,
  User,
} from './types';

const request = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data as T;
};

export const api = {
  // =========================
  // AUTH
  // =========================

  me: () =>
    request<{
      success: boolean;
      user: User;
    }>('/api/auth/me'),

  login: (email: string, password: string) =>
    request<{
      success: boolean;
      user: User;
      message?: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  register: (body: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'USER' | 'VENDOR';
  }) =>
    request<{
      success: boolean;
     
      message?: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<{
      success: boolean;
      message?: string;
    }>('/api/auth/logout', {
      method: 'POST',
    }),

  // =========================
  // PUBLIC ROOMS
  // =========================

  rooms: () =>
    request<Room[]>('/api/rooms'),

  room: (id: string | number) =>
    request<Room>(
      `/api/rooms/${encodeURIComponent(String(id))}`
    ),

  // =========================
  // VENDOR ROOMS
  // =========================

  vendorRooms: () =>
    request<Room[]>('/api/vendor/rooms'),

  /*
   * Creates a room and uploads all room images together.
   *
   * IMPORTANT:
   * Do not manually set Content-Type here.
   * The browser must generate the multipart/form-data boundary.
   */
  createRoomWithImages: async (
    room: Omit<Room, 'id' | 'images'>,
    files: File[]
  ) => {
    const formData = new FormData();

    const roomData = {
      title: room.title,
      price: room.price,
      location: room.location,
      type: room.type,
      description: room.description,
    };

    formData.append(
      'room',
      new Blob(
        [JSON.stringify(roomData)],
        { type: 'application/json' }
      )
    );

    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(
      '/api/vendor/rooms/with-images',
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
        `Listing submission failed (${response.status})`
      );
    }

    return data as {
      success: boolean;
      message: string;
      roomId: number;
    };
  },

  // =========================
  // ADMIN ROOMS
  // =========================

  pendingRooms: () =>
    request<Room[]>('/api/admin/rooms/pending'),

  approveRoom: (id: number) =>
    request<Room>(
      `/api/admin/rooms/${id}/approve`,
      {
        method: 'PATCH',
      }
    ),

  rejectRoom: (
    id: number,
    reason: string
  ) =>
    request<Room>(
      `/api/admin/rooms/${id}/reject`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          reason,
        }),
      }
    ),

  // =========================
  // REVIEWS
  // =========================

  reviews: (roomId: number) =>
    request<Review[]>(
      `/api/reviews/room/${roomId}`
    ),

  createReview: (
    roomId: number,
    rating: number,
    comment: string
  ) =>
    request<Review>(
      '/api/reviews',
      {
        method: 'POST',
        body: JSON.stringify({
          roomId,
          rating,
          comment,
        }),
      }
    ),

  // =========================
  // HOME REQUESTS
  // =========================

  myRequests: () =>
    request<HomeRequest[]>(
      '/api/user/home-requests'
    ),

  createHomeRequest: (
    body: Record<string, string | number>
  ) =>
    request<HomeRequest>(
      '/api/user/home-requests',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    ),

  adminRequests: () =>
    request<HomeRequest[]>(
      '/api/admin/home-requests'
    ),

  updateRequest: (
    id: number,
    status: string,
    adminReason: string
  ) =>
    request<HomeRequest>(
      `/api/admin/home-requests/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          adminReason,
        }),
      }
    ),
};