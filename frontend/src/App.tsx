


import {
  ChangeEvent,
  DragEvent,

  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useMemo,
  useState
} from 'react';
import { api } from './api';
import type {
  HomeRequest,
  Review,
  Role,
  Room,
  User
} from './types';
type Route = {
  path: string;
  params: URLSearchParams;
};
const image = (value?: string) =>
  value?.startsWith('http')
    ? value
    : value
      ? `/${value
          .replace(/^\.\//, '')
          .replace(/^images\//, 'assets/images/')}`
      : '/assets/images/room-1.svg';
const errorText = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';
const navigate = (path: string) => {
  window.location.hash = path;
  window.scrollTo(0, 0);
};
const useRoute = (): Route => {
  const [hash, setHash] = useState(
    window.location.hash || '#/'
  );
  useEffect(() => {
    const onHash = () =>
      setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () =>
      window.removeEventListener('hashchange', onHash);
  }, []);
  const [path, query = ''] =
    hash.slice(1).split('?');
  return {
    path: path || '/',
    params: new URLSearchParams(query)
  };
};
function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.me()
      .then(result => setUser(result.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  const logout = async () => {
    await api.logout().catch(() => undefined);
    setUser(null);
    navigate('/');
  };
  return {
    user,
    setUser,
    loading,
    logout
  };
}
function Header({
  user,
  logout
}: {
  user: User | null;
  logout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  const dashboardHref =
    user?.role === 'ADMIN'
      ? '#/admin'
      : user?.role === 'VENDOR'
        ? '#/vendor-dashboard'
        : '#/renter-dashboard';
  return (
    <header className="site-header">
      <nav className="navbar container">
        <a
          className="brand"
          href="#/"
          onClick={closeMenu}
        >
          <img
            src="/assets/images/logo3.jpeg"
            alt="SetHome"
            className="brand-logo"
          />
        </a>
        <div
          className="location-pill"
          aria-label="Current service area"
        >
          📍 Lohegaon, Pune
        </div>
        <button
          className="menu-toggle"
          type="button"
          aria-label={
            open
              ? 'Close navigation'
              : 'Open navigation'
          }
          aria-expanded={open}
          onClick={() => setOpen(value => !value)}
        >
          {open ? '×' : '☰'}
        </button>
        <div
          className={`nav-links ${open ? 'open' : ''}`}
        >
          <a href="#/" onClick={closeMenu}>
            Home
          </a>
          <a href="#/about" onClick={closeMenu}>
            About Us
          </a>
          <a href="#/list-room" onClick={closeMenu}>
            List Your Room
          </a>
          <div className="auth-links">
            {user ? (
              <>
                <a
                  href={dashboardHref}
                  onClick={closeMenu}
                >
                  {user.name}
                </a>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    closeMenu();
                    void logout();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <a
                href="#/login"
                onClick={closeMenu}
              >
                Login
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <a
            className="brand footer-brand"
            href="/"
          >
            <img
              src="/assets/images/logo3.jpeg"
              alt="SetHome"
              className="brand-logo"
            />
          </a>
          <p>
            Find verified rooms, PGs and apartments
            in Lohegaon, Pune.
          </p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <a href="#/">Home</a>
          <a href="#/about">About Us</a>
        </div>
        <div>
          <h3>Room Types</h3>
          <span>Single Rooms</span>
          <span>PG Accommodation</span>
          <span>1/2/3 BHK Apartments</span>
        </div>
        <div>
          <h3>Contact</h3>
          <span>📍 Lohegaon, Pune</span>
          <span>📞 +91 98765 43210</span>
          <span>✉ hello@sethome.in</span>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 SetHome. All rights reserved.
      </div>
    </footer>
  );
}
function Layout({
  children,
  user,
  logout
}: {
  children: ReactNode;
  user: User | null;
  logout: () => void;
}) {
  const isVendorDashboard =
    window.location.hash
      .split('?')[0] ===
    '#/vendor-dashboard';

  const isVendorListing =
    window.location.hash
      .split('?')[0] ===
    '#/list-room' &&
    user?.role === 'VENDOR';

  if (
    isVendorDashboard ||
    isVendorListing
  ) {
    return (
      <main className="vendor-page-shell">
        {children}
      </main>
    );
  }

  return (
    <>
      <Header
        user={user}
        logout={logout}
      />

      <main>
        {children}
      </main>

      <Footer />
    </>
  );
}
function Status({
  message,
  kind
}: {
  message: string;
  kind?: string;
}) {
  return message ? (
    <p className={`form-status ${kind || ''}`}>
      {message}
    </p>
  ) : null;
}
function Home({ user }: { user: User | null }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selected, setSelected] =
    useState<Room | null>(null);
  const [query, setQuery] = useState('');
  useEffect(() => {
    api.rooms()
      .then(setRooms)
      .catch(() => setRooms([]));
  }, []);
  const filtered = rooms.filter(room =>
    `${room.title} ${room.location} ${room.type}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );
  return (
    <>
      <section className="hero">
        <div className="hero-background">
          <img
            src="/assets/images/sethomeimage1.png"
            alt=""
          />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <form
            className="search-box"
            onSubmit={event => {
              event.preventDefault();
              document
                .getElementById('featured')
                ?.scrollIntoView({
                  behavior: 'smooth'
                });
            }}
          >
            <span className="search-icon">
              ⌕
            </span>
            <input
              value={query}
              onChange={event =>
                setQuery(event.target.value)
              }
              type="search"
              placeholder="Lohegaon, Pune"
              aria-label="Search rooms"
            />
            <button>Search</button>
          </form>
          <span className="eyebrow">
            ROOMS • PG • APARTMENTS
          </span>
          <h1>
            Find your perfect room{' '}
            <span>in Lohegaon, Pune</span>
          </h1>
          <p>
            Browse verified listings, connect
            directly with owners, and find a
            place that feels like home.
          </p>
          <div className="hero-actions">
            <a
              href="#featured"
              className="btn btn-primary"
            >
              Browse Rooms
            </a>
            <a
              href="#/list-room"
              className="btn btn-secondary"
            >
              List Your Room
            </a>
          </div>
        </div>
      </section>
      <section
        className="section section-muted"
        id="featured"
      >
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow blue">
              FEATURED
            </span>
            <h2>Featured Rooms</h2>
            <p>
              Discover rental options in
              Lohegaon, Pune.
            </p>
          </div>
          <div className="listing-grid">
            {filtered.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                onSelect={() =>
                  setSelected(room)
                }
              />
            ))}
          </div>
          {!filtered.length && (
            <div className="empty-state">
              <p>
                No rooms match your search.
              </p>
            </div>
          )}
        </div>
      </section>
      <section className="section how-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow blue">
              SIMPLE PROCESS
            </span>
            <h2>How It Works</h2>
          </div>
          <div className="steps">
            <article className="step">
              <div className="step-icon">
                ⌕
              </div>
              <h3>Search</h3>
              <p>
                Browse verified listings.
              </p>
            </article>
            <article className="step">
              <div className="step-icon">
                ⌂
              </div>
              <h3>View Details</h3>
              <p>
                Explore features and
                locations.
              </p>
            </article>
            <article className="step">
              <div className="step-icon">
                ☎
              </div>
              <h3>Request</h3>
              <p>
                Send a request to the owner.
              </p>
            </article>
          </div>
        </div>
      </section>
      {selected && (
        <RoomModal
          room={selected}
          user={user}
          close={() => setSelected(null)}
        />
      )}
    </>
  );
}
function RoomCard({
  room,
  onSelect
}: {
  room: Room;
  onSelect: () => void;
}) {
  return (
    <article className="listing-card">
      <div className="listing-image-wrap">
        <img
          src={image(room.image)}
          alt={room.title}
        />
      </div>
      <div className="listing-content">
        <h3>{room.title}</h3>
        <p className="meta">
          ⌖ {room.location}
        </p>
        <p className="meta">
          ⌂ {room.type}
        </p>
        <p className="price">
          {room.price}
        </p>
        <button
          className="btn btn-primary"
          onClick={onSelect}
        >
          View Details
        </button>
      </div>
    </article>
  );
}
function RoomModal({
  room,
  user,
  close
}: {
  room: Room;
  user: User | null;
  close: () => void;
}) {
  const [reviews, setReviews] =
    useState<Review[]>([]);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const load = () =>
    api.reviews(room.id)
      .then(setReviews)
      .catch(() => setReviews([]));
  useEffect(() => {
    void load();
  }, [room.id]);
  const submit = async (
    event: FormEvent
  ) => {
    event.preventDefault();
    try {
      await api.createReview(
        room.id,
        Number(rating),
        comment
      );
      setRating('');
      setComment('');
      setStatus('Review submitted.');
      load();
    } catch (error) {
      setStatus(errorText(error));
    }
  };
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
    >
      <div className="room-modal">
        <button
          className="modal-close"
          onClick={close}
        >
          ×
        </button>
        <img
          src={image(room.image)}
          alt={room.title}
        />
        <h2>{room.title}</h2>
        <p className="meta">
          ⌖ {room.location} · ⌂ {room.type}
        </p>
        <p className="price">
          {room.price}
        </p>
        <p>{room.description}</p>
        <a
          className="btn btn-primary"
          href={`#/request-home?roomId=${room.id}`}
        >
          Request This Home
        </a>
        <section className="reviews-section">
          <div className="reviews-heading">
            <h3>Reviews</h3>
            <span>
              {reviews.length} review(s)
            </span>
          </div>
          <div>
            {reviews.length ? (
              reviews.map(review => (
                <article
                  className="review-card"
                  key={review.id}
                >
                  <strong>
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(
                      5 - review.rating
                    )}
                  </strong>
                  <p>{review.comment}</p>
                  <small>
                    {review.userName ||
                      review.reviewerName ||
                      'SetHome user'}
                  </small>
                </article>
              ))
            ) : (
              <p className="review-loading">
                No reviews yet.
              </p>
            )}
          </div>
          {user?.role === 'USER' ? (
            <form
              className="review-form-wrap"
              onSubmit={submit}
            >
              <h4>Write a Review</h4>
              <label>
                Rating
                <select
                  value={rating}
                  onChange={event =>
                    setRating(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select rating
                  </option>
                  {[5, 4, 3, 2, 1].map(value => (
                    <option
                      key={value}
                      value={value}
                    >
                      {'★'.repeat(value)} — {value}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Comment
                <textarea
                  value={comment}
                  onChange={event =>
                    setComment(event.target.value)
                  }
                  required
                  maxLength={1000}
                />
              </label>
              <button className="btn btn-primary">
                Submit Review
              </button>
              <Status
                message={status}
                kind={
                  status === 'Review submitted.'
                    ? 'success'
                    : 'error'
                }
              />
            </form>
          ) : (
            <p className="review-login-message">
              Login as a renter to write a review.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
function AuthPage({
  mode,
  route,
  setUser
}: {
  mode: 'login' | 'register';
  route: Route;
  setUser: (user: User) => void;
}) {
  const [status, setStatus] = useState('');
  const isLogin = mode === 'login';
  const redirect =
    route.params.get('redirect') || '';
  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const values = Object.fromEntries(
      new FormData(
        event.currentTarget
      ).entries()
    ) as Record<string, string>;
    try {
      if (isLogin) {
        const result = await api.login(
          values.email,
          values.password
        );
        setUser(result.user);
        navigate(
          redirect ||
            (result.user.role === 'ADMIN'
              ? '/admin'
              : result.user.role === 'VENDOR'
                ? '/vendor-dashboard'
                : '/renter-dashboard')
        );
      } else {
          const registerData : Parameters<typeof api.register>[0]= {
    name: values.name.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    password: values.password,
    role: values.role === 'VENDOR' ? 'VENDOR' : 'USER'
  };

  const result = await api.register(registerData);
        setStatus(
          result.message ||
            'Account created. Please login.'
        );
      }
    } catch (error) {
      setStatus(errorText(error));
    }
  };
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>
            {isLogin
              ? 'Welcome Back'
              : 'Create Account'}
          </h1>
          <p>
            {isLogin
              ? 'Login to your SetHome account.'
              : 'Join SetHome and find or list your perfect property.'}
          </p>
        </div>
        <form onSubmit={submit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>
                  Full Name
                  <input
                    name="name"
                    required
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Phone
                  <input
                    name="phone"
                    type="tel"
                    required
                  />
                </label>
              </div>
            </>
          )}
          <div className="form-group">
            <label>
              Email
              <input
                name="email"
                type="email"
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Password
              <input
                name="password"
                type="password"
                minLength={6}
                required
              />
            </label>
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>I want to:</label>
              <div className="role-options">
                <label className="role-option">
                  <input
                    name="role"
                    type="radio"
                    value="USER"
                    defaultChecked
                  />
                  Find a Room
                </label>
                <label className="role-option">
                  <input
                    name="role"
                    type="radio"
                    value="VENDOR"
                  />
                  List a Property
                </label>
              </div>
            </div>
          )}
          <button className="btn btn-primary">
            {isLogin
              ? 'Login'
              : 'Create Account'}
          </button>
          <Status
            message={status}
            kind={
              status.includes('created')
                ? 'success'
                : 'error'
            }
          />
        </form>
        <div className="auth-footer">
          <p>
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <a href="#/register">
                  Register
                </a>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <a href="#/login">
                  Login
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
function Guard({
  user,
  role,
  children
}: {
  user: User | null;
  role: Role;
  children: ReactNode;
}) {
  if (!user) {
    return (
      <section className="section">
        <div className="container">
          <Status
            message="Please login to continue."
            kind="error"
          />
        </div>
      </section>
    );
  }
  if (user.role !== role) {
    return (
      <section className="section">
        <div className="container">
          <Status
            message="You do not have access to this page."
            kind="error"
          />
        </div>
      </section>
    );
  }
  return <>{children}</>;
}
function ListRoom() {
  type SelectedImage = {
    id: string;
    file: File;
    url: string;
  };

  type Amenity =
    | 'Wi-Fi'
    | 'Parking'
    | 'Attached Bathroom'
    | 'Kitchen'
    | 'AC'
    | 'Furnished'
    | 'Washing Machine'
    | 'Power Backup'
    | '24/7 Water'
    | 'Security'
    | 'Balcony'
    | 'CCTV';

  const [currentStep, setCurrentStep] = useState(1);

  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  /*
   * Vendor phone is collected here.
   *
   * It will be persisted later when the backend
   * Room/vendor listing model is extended.
   */
  const [vendorPhone, setVendorPhone] = useState('');

  const [amenities, setAmenities] =
    useState<Amenity[]>([]);

  const [selectedImages, setSelectedImages] =
    useState<SelectedImage[]>([]);

  const [previewIndex, setPreviewIndex] =
    useState<number | null>(null);

  const objectUrls = useRef<Set<string>>(
    new Set()
  );

  const amenitiesList: Amenity[] = [
    'Wi-Fi',
    'Parking',
    'Attached Bathroom',
    'Kitchen',
    'AC',
    'Furnished',
    'Washing Machine',
    'Power Backup',
    '24/7 Water',
    'Security',
    'Balcony',
    'CCTV'
  ];

  /*
   * Clean object URLs when component unmounts.
   */
  useEffect(() => {
    return () => {
      objectUrls.current.forEach(url => {
        URL.revokeObjectURL(url);
      });

      objectUrls.current.clear();
    };
  }, []);

  const createImage = (
    file: File
  ): SelectedImage => {
    const url = URL.createObjectURL(file);

    objectUrls.current.add(url);

    return {
      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,
      file,
      url
    };
  };

  const formatFileSize = (
    bytes: number
  ) => {
    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const validateFiles = (
    files: File[]
  ) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png'
    ];

    const maxSize =
      5 * 1024 * 1024;

    const invalidType =
      files.find(
        file =>
          !allowedTypes.includes(
            file.type
          )
      );

    if (invalidType) {
      setStatus(
        `${invalidType.name} is not a supported image. Use JPG, JPEG or PNG.`
      );

      return false;
    }

    const oversized =
      files.find(
        file =>
          file.size > maxSize
      );

    if (oversized) {
      setStatus(
        `${oversized.name} is larger than 5MB.`
      );

      return false;
    }

    return true;
  };

  const addImages = (
    files: File[]
  ) => {
    if (!files.length) return;

    if (!validateFiles(files)) {
      return;
    }

    const remaining =
      10 - selectedImages.length;

    if (remaining <= 0) {
      setStatus(
        'You already have 10 images.'
      );

      return;
    }

    const filesToAdd =
      files.slice(0, remaining);

    const newImages =
      filesToAdd.map(
        createImage
      );

    setSelectedImages(
      previous => [
        ...previous,
        ...newImages
      ]
    );

    setStatus('');
  };

  const handleFileSelect = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    addImages(
      Array.from(
        event.target.files || []
      )
    );

    event.target.value = '';
  };

  const handleDrop = (
    event: DragEvent<HTMLLabelElement>
  ) => {
    event.preventDefault();

    addImages(
      Array.from(
        event.dataTransfer.files
      )
    );
  };

  const removeImage = (
    id: string
  ) => {
    setSelectedImages(
      previous => {
        const image =
          previous.find(
            item =>
              item.id === id
          );

        if (image) {
          URL.revokeObjectURL(
            image.url
          );

          objectUrls.current.delete(
            image.url
          );
        }

        return previous.filter(
          item =>
            item.id !== id
        );
      }
    );

    setPreviewIndex(null);
  };

  const clearAllImages = () => {
    selectedImages.forEach(
      image => {
        URL.revokeObjectURL(
          image.url
        );

        objectUrls.current.delete(
          image.url
        );
      }
    );

    setSelectedImages([]);
    setPreviewIndex(null);
  };

  const moveImage = (
    index: number,
    direction: 'left' | 'right'
  ) => {
    setSelectedImages(
      previous => {
        const next = [
          ...previous
        ];

        const target =
          direction === 'left'
            ? index - 1
            : index + 1;

        if (
          target < 0 ||
          target >= next.length
        ) {
          return previous;
        }

        [
          next[index],
          next[target]
        ] = [
          next[target],
          next[index]
        ];

        return next;
      }
    );
  };

  const setCoverImage = (
    index: number
  ) => {
    if (index === 0) {
      return;
    }

    setSelectedImages(
      previous => {
        const next = [
          ...previous
        ];

        const cover =
          next.splice(index, 1)[0];

        next.unshift(cover);

        return next;
      }
    );
  };

  const toggleAmenity = (
    amenity: Amenity
  ) => {
    setAmenities(
      previous =>
        previous.includes(amenity)
          ? previous.filter(
              item =>
                item !== amenity
            )
          : [
              ...previous,
              amenity
            ]
    );
  };

  /*
   * STEP VALIDATION
   */

  const validateStepOne = () => {
    if (!title.trim()) {
      setStatus(
        'Please enter a room title.'
      );
      return false;
    }

    if (!price.trim()) {
      setStatus(
        'Please enter the monthly rent.'
      );
      return false;
    }

    if (!location.trim()) {
      setStatus(
        'Please enter the location.'
      );
      return false;
    }

    if (!type) {
      setStatus(
        'Please select a room type.'
      );
      return false;
    }

    if (!description.trim()) {
      setStatus(
        'Please describe the property.'
      );
      return false;
    }

    if (!vendorPhone.trim()) {
      setStatus(
        'Please enter your phone number.'
      );
      return false;
    }

    setStatus('');

    return true;
  };

  const validateStepThree = () => {
    if (
      selectedImages.length === 0
    ) {
      setStatus(
        'Please upload at least one property image.'
      );

      return false;
    }

    setStatus('');

    return true;
  };

  const goNext = () => {
    if (currentStep === 1) {
      if (!validateStepOne()) {
        return;
      }
    }

    if (currentStep === 3) {
      if (!validateStepThree()) {
        return;
      }
    }

    setStatus('');

    setCurrentStep(
      previous =>
        Math.min(4, previous + 1)
    );
  };

  const goBack = () => {
    setStatus('');

    setCurrentStep(
      previous =>
        Math.max(1, previous - 1)
    );
  };

  /*
   * FINAL SUBMISSION
   *
   * The backend currently accepts the room fields
   * plus all images together.
   */
  const submitListing = async () => {
    if (!validateStepOne()) {
      setCurrentStep(1);
      return;
    }

    if (!validateStepThree()) {
      setCurrentStep(3);
      return;
    }

    try {
      setSubmitting(true);

      setStatus(
        'Submitting your listing...'
      );

      const room:
        Omit<
          Room,
          'id' | 'images'
        > = {
        title: title.trim(),
        price: price.trim(),
        location: location.trim(),
        type,
        description:
          description.trim()
      };

      /*
       * IMPORTANT:
       *
       * selectedImages order is the
       * vendor-selected image order.
       *
       * selectedImages[0] = cover.
       */
      const orderedFiles =
        selectedImages.map(
          image => image.file
        );

      await api.createRoomWithImages(
        room,
        orderedFiles
      );

      /*
       * Phone + amenities are currently
       * frontend-only until backend support
       * is added.
       */

      setTitle('');
      setPrice('');
      setLocation('');
      setType('');
      setDescription('');
      setVendorPhone('');
      setAmenities([]);

      selectedImages.forEach(
        image => {
          URL.revokeObjectURL(
            image.url
          );

          objectUrls.current.delete(
            image.url
          );
        }
      );

      setSelectedImages([]);
      setPreviewIndex(null);
      setCurrentStep(1);

      setStatus(
        'Listing submitted successfully. Your room and images are now waiting for admin approval.'
      );
    } catch (error) {
      setStatus(
        errorText(error)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const previewImage =
    previewIndex !== null
      ? selectedImages[
          previewIndex
        ]
      : null;



  return (

    
    

    
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">
            PROPERTY LISTING
          </span>

          <h1>
            Add New Listing
          </h1>

          <p>
            Add your property details,
            facilities and photos.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">

          <div className="listing-wizard">

            {/* =================================
                LEFT STEP NAVIGATION
            ================================= */}

            <aside className="listing-wizard-sidebar">

              <div className="listing-wizard-title">
                <strong>
                  Add New Listing
                </strong>

                <span>
                  Complete all steps
                </span>
              </div>

              {[
                {
                  number: 1,
                  title: 'Room Details',
                  subtitle:
                    'Basic information about your room'
                },
                {
                  number: 2,
                  title: 'Amenities',
                  subtitle:
                    'Facilities and features'
                },
                {
                  number: 3,
                  title: 'Images',
                  subtitle:
                    'Upload photos up to 10'
                },
                {
                  number: 4,
                  title: 'Review & Submit',
                  subtitle:
                    'Confirm your listing'
                }
              ].map(step => (
                <button
                  key={step.number}
                  type="button"
                  className={
                    `listing-step ${
                      currentStep ===
                      step.number
                        ? 'active'
                        : currentStep >
                            step.number
                          ? 'completed'
                          : ''
                    }`
                  }
                  onClick={() => {
                    /*
                     * Do not allow jumping forward
                     * without completing the previous
                     * step.
                     */
                    if (
                      step.number <
                      currentStep
                    ) {
                      setCurrentStep(
                        step.number
                      );
                    }

                    if (
                      step.number ===
                      currentStep + 1
                    ) {
                      goNext();
                    }
                  }}
                >

                  <span className="listing-step-number">
                    {currentStep >
                    step.number
                      ? '✓'
                      : step.number}
                  </span>

                  <span className="listing-step-copy">

                    <strong>
                      {step.title}
                    </strong>

                    <small>
                      {step.subtitle}
                    </small>

                  </span>

                </button>
              ))}

            </aside>

            {/* =================================
                MAIN WIZARD
            ================================= */}

            <div className="listing-wizard-main">

              {/* ===============================
                  STEP 1
              =============================== */}

              {currentStep === 1 && (
                <div className="listing-wizard-panel">

                  <div className="listing-wizard-heading">
                    <div>
                      <span className="eyebrow blue">
                        STEP 1 OF 4
                      </span>

                      <h2>
                        Room Details
                      </h2>

                      <p>
                        Tell renters the basic
                        information about your
                        property.
                      </p>
                    </div>
                  </div>

                  <div className="listing-form-grid">

                    <label>
                      Room Title *
                      <input
                        value={title}
                        onChange={event =>
                          setTitle(
                            event.target.value
                          )
                        }
                        placeholder="e.g. Cozy Studio Apartment"
                        disabled={submitting}
                      />
                    </label>

                    <label>
                      Price per month *
                      <input
                        value={price}
                        onChange={event =>
                          setPrice(
                            event.target.value
                          )
                        }
                        placeholder="e.g. ₹12,000"
                        disabled={submitting}
                      />
                    </label>

                    <label className="full">
                      Location *
                      <input
                        value={location}
                        onChange={event =>
                          setLocation(
                            event.target.value
                          )
                        }
                        placeholder="e.g. Lohegaon, Pune"
                        disabled={submitting}
                      />
                    </label>

                    <label>
                      Room Type *
                      <select
                        value={type}
                        onChange={event =>
                          setType(
                            event.target.value
                          )
                        }
                        disabled={submitting}
                      >
                        <option value="">
                          Select room type
                        </option>

                        {[
                          'Single Room',
                          'Studio Apartment',
                          '1 BHK',
                          '2 BHK',
                          '3 BHK',
                          'PG Accommodation'
                        ].map(value => (
                          <option
                            key={value}
                            value={value}
                          >
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Your Phone Number *
                      <input
                        type="tel"
                        value={
                          vendorPhone
                        }
                        onChange={event =>
                          setVendorPhone(
                            event.target.value
                          )
                        }
                        placeholder="+91 98765 43210"
                        disabled={submitting}
                      />
                    </label>

                    <label className="full">
                      Description *

                      <textarea
                        value={
                          description
                        }
                        onChange={event =>
                          setDescription(
                            event.target.value
                          )
                        }
                        maxLength={500}
                        rows={7}
                        placeholder="Describe your room, facilities and nearby attractions..."
                        disabled={submitting}
                      />

                      <span className="field-counter">
                        {description.length}
                        /500
                      </span>
                    </label>

                  </div>

                  <div className="listing-wizard-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        navigate(
                          '/vendor-dashboard'
                        )
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={goNext}
                    >
                      Next
                    </button>
                  </div>

                </div>
              )}

              {/* ===============================
                  STEP 2
              =============================== */}

              {currentStep === 2 && (
                <div className="listing-wizard-panel">

                  <div className="listing-wizard-heading">
                    <div>
                      <span className="eyebrow blue">
                        STEP 2 OF 4
                      </span>

                      <h2>
                        Amenities
                      </h2>

                      <p>
                        Select the facilities
                        available with this property.
                      </p>
                    </div>

                    <strong className="amenity-count">
                      {amenities.length}
                      {' selected'}
                    </strong>
                  </div>

                  <div className="amenities-grid">

                    {amenitiesList.map(
                      amenity => {
                        const selected =
                          amenities.includes(
                            amenity
                          );

                        return (
                          <button
                            key={amenity}
                            type="button"
                            className={
                              `amenity-option ${
                                selected
                                  ? 'selected'
                                  : ''
                              }`
                            }
                            onClick={() =>
                              toggleAmenity(
                                amenity
                              )
                            }
                            disabled={
                              submitting
                            }
                          >
                            <span>
                              {selected
                                ? '✓'
                                : '+'}
                            </span>

                            {amenity}
                          </button>
                        );
                      }
                    )}

                  </div>

                  <div className="listing-amenity-note">
                    <strong>
                      Tip
                    </strong>

                    <p>
                      Select only facilities
                      that are actually available
                      at the property.
                    </p>
                  </div>

                  <div className="listing-wizard-actions">

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={goBack}
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={goNext}
                    >
                      Next
                    </button>

                  </div>

                </div>
              )}

              {/* ===============================
                  STEP 3
              =============================== */}

              {currentStep === 3 && (
                <div className="listing-wizard-panel">

                  <div className="listing-wizard-heading">

                    <div>
                      <span className="eyebrow blue">
                        STEP 3 OF 4
                      </span>

                      <h2>
                        Property Images
                      </h2>

                      <p>
                        Upload clear photos of
                        your property.
                      </p>
                    </div>

                    <strong className="listing-image-count">
                      {selectedImages.length}
                      {' / 10'}
                    </strong>

                  </div>

                  <label
                    className="listing-image-dropzone"
                    onDragOver={event =>
                      event.preventDefault()
                    }
                    onDrop={
                      handleDrop
                    }
                  >

                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      multiple
                      hidden
                      disabled={
                        submitting ||
                        selectedImages.length >=
                          10
                      }
                      onChange={
                        handleFileSelect
                      }
                    />

                    <div className="listing-upload-icon">
                      ⇧
                    </div>

                    <strong>
                      Drag & drop images here
                    </strong>

                    <span>
                      or
                    </span>

                    <span className="listing-choose-files">
                      Choose Files
                    </span>

                    <small>
                      JPG, JPEG, PNG ·
                      Maximum 5MB per image
                    </small>

                  </label>

                  <div className="listing-image-progress-row">

                    <span>
                      {selectedImages.length}
                      {' / 10'} images selected
                    </span>

                    <strong>
                      {10 -
                        selectedImages.length}
                      {' images remaining'}
                    </strong>

                  </div>

                  <div className="listing-image-progress">
                    <span
                      style={{
                        width: `${
                          selectedImages.length *
                          10
                        }%`
                      }}
                    />
                  </div>

                  {selectedImages.length >
                    0 && (
                    <div className="listing-image-grid">

                      {selectedImages.map(
                        (
                          selectedImage,
                          index
                        ) => (
                          <article
                            key={
                              selectedImage.id
                            }
                            className={
                              `listing-image-item ${
                                index === 0
                                  ? 'cover'
                                  : ''
                              }`
                            }
                          >

                            <button
                              type="button"
                              className="listing-image-preview"
                              onClick={() =>
                                setPreviewIndex(
                                  index
                                )
                              }
                            >
                              <img
                                src={
                                  selectedImage.url
                                }
                                alt={
                                  selectedImage.file
                                    .name
                                }
                              />
                            </button>

                            {index === 0 && (
                              <span className="listing-cover-badge">
                                COVER
                              </span>
                            )}

                            <button
                              type="button"
                              className="listing-remove-image"
                              onClick={() =>
                                removeImage(
                                  selectedImage.id
                                )
                              }
                            >
                              ×
                            </button>

                            <div className="listing-image-details">

                              <strong
                                title={
                                  selectedImage.file
                                    .name
                                }
                              >
                                {
                                  selectedImage.file
                                    .name
                                }
                              </strong>

                              <span>
                                {formatFileSize(
                                  selectedImage.file
                                    .size
                                )}
                              </span>

                            </div>

                            <div className="listing-image-controls">

                              <button
                                type="button"
                                disabled={
                                  index === 0
                                }
                                onClick={() =>
                                  moveImage(
                                    index,
                                    'left'
                                  )
                                }
                              >
                                ←
                              </button>

                              <button
                                type="button"
                                disabled={
                                  index ===
                                  selectedImages.length -
                                    1
                                }
                                onClick={() =>
                                  moveImage(
                                    index,
                                    'right'
                                  )
                                }
                              >
                                →
                              </button>

                              <button
                                type="button"
                                disabled={
                                  index === 0
                                }
                                onClick={() =>
                                  setCoverImage(
                                    index
                                  )
                                }
                                title="Set as cover"
                              >
                                ★
                              </button>

                            </div>

                          </article>
                        )
                      )}

                    </div>
                  )}

                  <div className="listing-image-footer">

                    <div>
                      <strong>
                        Accepted formats
                      </strong>

                      <span>
                        JPG, JPEG, PNG ·
                        Maximum 5MB each ·
                        Maximum 10 images
                      </span>
                    </div>

                    <button
                      type="button"
                      className="listing-clear-images"
                      disabled={
                        selectedImages.length ===
                        0
                      }
                      onClick={
                        clearAllImages
                      }
                    >
                      Clear All
                    </button>

                  </div>

                  <div className="listing-wizard-actions">

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={goBack}
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={goNext}
                    >
                      Review Listing
                    </button>

                  </div>

                </div>
              )}

              {/* ===============================
                  STEP 4
              =============================== */}

              {currentStep === 4 && (
                <div className="listing-wizard-panel">

                  <div className="listing-wizard-heading">

                    <div>
                      <span className="eyebrow blue">
                        STEP 4 OF 4
                      </span>

                      <h2>
                        Review & Submit
                      </h2>

                      <p>
                        Check everything before
                        sending your listing to
                        SetHome.
                      </p>
                    </div>

                  </div>

                  {/* Room summary */}

                  <div className="listing-review-card">

                    <div className="listing-review-header">
                      <h3>
                        Room Details
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentStep(1)
                        }
                      >
                        Edit
                      </button>
                    </div>

                    <div className="listing-review-grid">

                      <div>
                        <span>
                          Room Title
                        </span>

                        <strong>
                          {title}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Monthly Rent
                        </span>

                        <strong>
                          {price}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Location
                        </span>

                        <strong>
                          {location}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Room Type
                        </span>

                        <strong>
                          {type}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Vendor Phone
                        </span>

                        <strong>
                          {vendorPhone}
                        </strong>
                      </div>

                    </div>

                    <div className="listing-review-description">
                      <span>
                        Description
                      </span>

                      <p>
                        {description}
                      </p>
                    </div>

                  </div>

                  {/* Amenities */}

                  <div className="listing-review-card">

                    <div className="listing-review-header">
                      <h3>
                        Amenities
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentStep(2)
                        }
                      >
                        Edit
                      </button>
                    </div>

                    {amenities.length ? (
                      <div className="listing-review-amenities">

                        {amenities.map(
                          amenity => (
                            <span
                              key={
                                amenity
                              }
                            >
                              ✓ {amenity}
                            </span>
                          )
                        )}

                      </div>
                    ) : (
                      <p className="listing-review-empty">
                        No amenities selected.
                      </p>
                    )}

                  </div>

                  {/* Images */}

                  <div className="listing-review-card">

                    <div className="listing-review-header">
                      <h3>
                        Images
                        {' '}
                        ({selectedImages.length}/10)
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentStep(3)
                        }
                      >
                        Edit
                      </button>
                    </div>

                    <div className="listing-review-images">

                      {selectedImages.map(
                        (
                          selectedImage,
                          index
                        ) => (
                          <button
                            type="button"
                            key={
                              selectedImage.id
                            }
                            onClick={() =>
                              setPreviewIndex(
                                index
                              )
                            }
                          >
                            <img
                              src={
                                selectedImage.url
                              }
                              alt={
                                selectedImage.file
                                  .name
                              }
                            />

                            {index === 0 && (
                              <span>
                                Cover
                              </span>
                            )}
                          </button>
                        )
                      )}

                    </div>

                  </div>

                  {/* Approval notice */}

                  <div className="listing-submit-notice">

                    <strong>
                      Before you submit
                    </strong>

                    <p>
                      Your room and all submitted
                      images will be sent to the
                      SetHome admin team together.
                      The listing will remain pending
                      until the admin approves it.
                    </p>

                  </div>

                  <Status
                    message={status}
                    kind={
                      status.startsWith(
                        'Listing submitted'
                      )
                        ? 'success'
                        : 'error'
                    }
                  />

                  <div className="listing-wizard-actions">

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={goBack}
                      disabled={
                        submitting
                      }
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={
                        submitListing
                      }
                      disabled={
                        submitting
                      }
                    >
                      {submitting
                        ? 'Submitting...'
                        : 'Submit Listing'}
                    </button>

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* =================================
          IMAGE LIGHTBOX
      ================================= */}

      {previewImage && (
        <div
          className="listing-lightbox"
          onClick={() =>
            setPreviewIndex(null)
          }
        >

          <button
            type="button"
            className="listing-lightbox-close"
            onClick={() =>
              setPreviewIndex(null)
            }
          >
            ×
          </button>

          <button
            type="button"
            className="listing-lightbox-prev"
            onClick={event => {
              event.stopPropagation();

              setPreviewIndex(
                previous => {
                  if (
                    previous === null
                  ) {
                    return 0;
                  }

                  return previous > 0
                    ? previous - 1
                    : selectedImages.length -
                        1;
                }
              );
            }}
          >
            ‹
          </button>

          <img
            src={previewImage.url}
            alt={
              previewImage.file.name
            }
            onClick={event =>
              event.stopPropagation()
            }
          />

          <button
            type="button"
            className="listing-lightbox-next"
            onClick={event => {
              event.stopPropagation();

              setPreviewIndex(
                previous => {
                  if (
                    previous === null
                  ) {
                    return 0;
                  }

                  return previous <
                    selectedImages.length -
                      1
                    ? previous + 1
                    : 0;
                }
              );
            }}
          >
            ›
          </button>

          <div
            className="listing-lightbox-caption"
            onClick={event =>
              event.stopPropagation()
            }
          >
            {previewImage.file.name}
            {' · '}
            {formatFileSize(
              previewImage.file.size
            )}
          </div>

        </div>
      )}
    </>
  );
}
function RequestHome({
  route
}: {
  route: Route;
}) {
  const roomId =
    route.params.get('roomId');
  const [room, setRoom] =
    useState<Room | null>(null);
  const [status, setStatus] =
    useState('');
  useEffect(() => {
    if (!roomId) {
      setStatus('No home was selected.');
      return;
    }
    api.room(roomId)
      .then(setRoom)
      .catch(() =>
        setStatus(
          'This home is no longer available.'
        )
      );
  }, [roomId]);
  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!roomId) return;
    const values =
      Object.fromEntries(
        new FormData(
          event.currentTarget
        ).entries()
      ) as Record<string, string>;
    try {
      await api.createHomeRequest({
        ...values,
        roomId: Number(roomId),
        age: Number(values.age)
      });
      event.currentTarget.reset();
      setStatus(
        'Home request submitted successfully. The SetHome team will review it.'
      );
    } catch (error) {
      setStatus(errorText(error));
    }
  };
  return (
    <section className="contact-page">
      <div className="container">
        <div className="section-heading">
          <h1>Request This Home</h1>
          <p>
            Tell us a little about yourself
            and we'll review your request.
          </p>
        </div>
        {room && (
          <RoomCard
            room={room}
            onSelect={() => undefined}
          />
        )}
        <Status
          message={status}
          kind={
            status.startsWith(
              'Home request'
            )
              ? 'success'
              : 'error'
          }
        />
        {room && (
          <form
            className="contact-form"
            onSubmit={submit}
          >
            <div className="form-group">
              <label>
                Full Name
                <input
                  name="name"
                  required
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Phone Number
                <input
                  name="phone"
                  type="tel"
                  required
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Age
                <input
                  name="age"
                  type="number"
                  min="18"
                  max="100"
                  required
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Occupation
                <input
                  name="occupation"
                  required
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Qualification
                <input
                  name="qualification"
                  required
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                How long have you been in
                Pune?
                <input
                  name="puneDuration"
                  required
                />
              </label>
            </div>
            <div className="form-group">
              <label>
                Message
                <textarea
                  name="message"
                  rows={5}
                />
              </label>
            </div>
            <button className="btn btn-primary">
              Send Home Request
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
function RenterDashboard({
  user
}: {
  user: User;
}) {
  const [requests, setRequests] =
    useState<HomeRequest[]>([]);
  const [status, setStatus] =
    useState('Loading your requests...');
  useEffect(() => {
    api.myRequests()
      .then(value => {
        setRequests(value);
        setStatus(
          `${value.length} home request(s)`
        );
      })
      .catch(error =>
        setStatus(errorText(error))
      );
  }, []);
  const count = (state?: string) =>
    state
      ? requests.filter(
          request =>
            request.status === state
        ).length
      : requests.length;
  return (
    <section className="section">
      <div className="container">
        <div className="form-heading">
          <span className="eyebrow">
            Renter Panel
          </span>
          <h1>Renter Dashboard</h1>
          <p>
            Welcome, {user.name}. Manage your
            room requests here.
          </p>
        </div>
        <div className="renter-stats">
          {[
            ['Total Requests', count()],
            ['Pending', count('PENDING')],
            ['Approved', count('APPROVED')],
            ['Rejected', count('REJECTED')]
          ].map(([label, value]) => (
            <div
              className="renter-stat-card"
              key={String(label)}
            >
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <div className="renter-dashboard-actions">
          <a
            className="btn btn-primary"
            href="#/"
          >
            Browse Available Rooms
          </a>
        </div>
        <Status
          message={status}
          kind="success"
        />
        <div className="renter-section-heading">
          <h2>My Room Requests</h2>
          <p>
            Track the status of rooms you have
            requested.
          </p>
        </div>
        {requests.length ? (
          <div>
            {requests.map(request => (
              <RequestCard
                key={request.requestId}
                request={request}
              />
            ))}
          </div>
        ) : (
          <div className="renter-empty-card">
            <div className="renter-empty-icon">
              ⌂
            </div>
            <h3>No requests yet</h3>
            <p>
              Your room requests will appear
              here after you submit your first
              request.
            </p>
            <a
              className="btn btn-primary"
              href="#/"
            >
              Find a Room
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
function RequestCard({
  request,
  admin
}: {
  request: HomeRequest;
  admin?: (status: string) => void;
}) {
  return (
    <article className="renter-request-card">
      <div className="renter-request-card-header">
        <div>
          <span className="eyebrow">
            Request #{request.requestId}
          </span>
          <h3>{request.roomTitle}</h3>
        </div>
        <span
          className={`request-status ${request.status.toLowerCase()}`}
        >
          {request.status}
        </span>
      </div>
      <div className="renter-request-info">
        <p>
          📍 <strong>Location:</strong>{' '}
          {request.roomLocation}
        </p>
        <p>
          💰 <strong>Price:</strong>{' '}
          {request.roomPrice}
        </p>
        <p>
          👤 <strong>Name:</strong>{' '}
          {request.name}
        </p>
        <p>
          💼 <strong>Occupation:</strong>{' '}
          {request.occupation}
        </p>
        <p>
          🏙️ <strong>Pune Duration:</strong>{' '}
          {request.puneDuration}
        </p>
      </div>
      {request.message && (
        <div className="renter-request-message">
          <strong>Message</strong>
          <p>{request.message}</p>
        </div>
      )}
      {request.adminReason && (
        <div className="renter-admin-response">
          <strong>Admin Response</strong>
          <p>{request.adminReason}</p>
        </div>
      )}
      {admin && (
        <div className="admin-card-actions">
          <button
            className="btn btn-primary"
            onClick={() =>
              admin('APPROVED')
            }
          >
            Approve
          </button>
          <button
            className="btn btn-secondary"
            onClick={() =>
              admin('REJECTED')
            }
          >
            Reject
          </button>
          <button
            className="btn btn-secondary"
            onClick={() =>
              admin('CONTACTED')
            }
          >
            Mark Contacted
          </button>
        </div>
      )}
    </article>
  );
}
function VendorDashboard({ user }: { user: User }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  >('ALL');

  const load = () => {
    api.vendorRooms()
      .then(value => {
        setRooms(value);
        setStatus('');
      })
      .catch(error => {
        setStatus(errorText(error));
      });
  };

  useEffect(() => {
    void load();
  }, []);

  const totalListings = rooms.length;

  const pendingListings = rooms.filter(
    room => (room.status || 'PENDING') === 'PENDING'
  ).length;

  const approvedListings = rooms.filter(
    room => room.status === 'APPROVED'
  ).length;

  const rejectedListings = rooms.filter(
    room => room.status === 'REJECTED'
  ).length;

  const totalImages = rooms.reduce(
    (total, room) =>
      total +
      (room.images?.length ||
        (room.image ? 1 : 0)),
    0
  );

  const filteredRooms =
    filter === 'ALL'
      ? rooms
      : rooms.filter(
          room =>
            (room.status || 'PENDING') === filter
        );

  const statusClass = (roomStatus?: string) =>
    `vendor-status ${
      (roomStatus || 'PENDING').toLowerCase()
    }`;

  return (
    <div className="vendor-workspace">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="vendor-sidebar">

        <div className="vendor-sidebar-brand">
          <img
            src="/assets/images/logo3.jpeg"
            alt="SetHome"
          />

          <div>
            <strong>SetHome</strong>
            <span>List · Rent · Grow</span>
          </div>
        </div>

        <nav className="vendor-sidebar-nav">

          <a
            href="#/vendor-dashboard"
            className="active"
          >
            <span>⌂</span>
            Dashboard
          </a>

          <a
            href="#my-listings"
          >
            <span>▣</span>
            My Listings
          </a>

          <a
            href="#/list-room"
          >
            <span>＋</span>
            Add New Listing
          </a>

          <button
            type="button"
            className="vendor-sidebar-disabled"
            onClick={() =>
              setStatus(
                'Messages will be available soon.'
              )
            }
          >
            <span>✉</span>
            Messages
          </button>

          <button
            type="button"
            className="vendor-sidebar-disabled"
            onClick={() =>
              setStatus(
                'Profile management will be available soon.'
              )
            }
          >
            <span>◎</span>
            Profile
          </button>

        </nav>

        <button
          type="button"
          className="vendor-sidebar-logout"
          onClick={async () => {
            await api.logout().catch(
              () => undefined
            );

            navigate('/');
          }}
        >
          <span>↪</span>
          Logout
        </button>

      </aside>

      {/* =========================================
          MAIN
      ========================================= */}

      <main className="vendor-main">

        {/* TOP BAR */}

        <div className="vendor-topbar">

          <div>
            <span className="vendor-location">
              📍 Lohegaon, Pune
            </span>

            <h1>
              Welcome back, {user.name} 👋
            </h1>

            <p>
              Here's what's happening with
              your listings.
            </p>
          </div>

          <div className="vendor-profile">

            <div className="vendor-avatar">
              {user.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user.name}
              </strong>

              <span>
                Vendor
              </span>
            </div>

          </div>

        </div>

        {/* =========================================
            KPI CARDS
        ========================================= */}

        <section className="vendor-kpi-grid">

          <article className="vendor-kpi-card blue">
            <span className="vendor-kpi-icon">
              ▣
            </span>

            <div>
              <small>
                Total Listings
              </small>

              <strong>
                {totalListings}
              </strong>

              <p>
                {pendingListings} pending approval
              </p>
            </div>
          </article>

          <article className="vendor-kpi-card yellow">
            <span className="vendor-kpi-icon">
              ◷
            </span>

            <div>
              <small>
                Pending
              </small>

              <strong>
                {pendingListings}
              </strong>

              <p>
                Needs your attention
              </p>
            </div>
          </article>

          <article className="vendor-kpi-card green">
            <span className="vendor-kpi-icon">
              ✓
            </span>

            <div>
              <small>
                Approved
              </small>

              <strong>
                {approvedListings}
              </strong>

              <p>
                Live on platform
              </p>
            </div>
          </article>

          <article className="vendor-kpi-card red">
            <span className="vendor-kpi-icon">
              ×
            </span>

            <div>
              <small>
                Rejected
              </small>

              <strong>
                {rejectedListings}
              </strong>

              <p>
                Check reason and rework
              </p>
            </div>
          </article>

          <article className="vendor-kpi-card purple">
            <span className="vendor-kpi-icon">
              ▧
            </span>

            <div>
              <small>
                Total Images
              </small>

              <strong>
                {totalImages}
              </strong>

              <p>
                Across all listings
              </p>
            </div>
          </article>

        </section>

        {/* =========================================
            MY LISTINGS
        ========================================= */}

        <section
          className="vendor-listings-section"
          id="my-listings"
        >

          <div className="vendor-listings-header">

            <div>
              <h2>
                My Listings
                <span>
                  {totalListings} total
                </span>
              </h2>

              <p>
                Manage and monitor your submitted
                properties.
              </p>
            </div>

            <div className="vendor-listings-actions">

              <button
                type="button"
                className="vendor-refresh-btn"
                onClick={load}
              >
                ↻ Refresh
              </button>

              <a
                href="#/list-room"
                className="vendor-add-btn"
              >
                ＋ Add New Listing
              </a>

            </div>

          </div>

          {/* FILTERS */}

          <div className="vendor-filter-tabs">

            {[
              ['ALL', `All (${totalListings})`],
              [
                'PENDING',
                `Pending (${pendingListings})`
              ],
              [
                'APPROVED',
                `Approved (${approvedListings})`
              ],
              [
                'REJECTED',
                `Rejected (${rejectedListings})`
              ]
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={
                    filter === value
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setFilter(
                      value as
                        | 'ALL'
                        | 'PENDING'
                        | 'APPROVED'
                        | 'REJECTED'
                    )
                  }
                >
                  {label}
                </button>
              )
            )}

          </div>

          <Status
            message={status}
            kind="error"
          />

          {/* LISTINGS */}

          {filteredRooms.length ? (

            <div className="vendor-listings-grid">

              {filteredRooms.map(
                room => {

                  const roomStatus =
                    room.status ||
                    'PENDING';

                  const imageCount =
                    room.images?.length ||
                    (room.image ? 1 : 0);

                  return (
                    <article
                      className="vendor-listing-card"
                      key={room.id}
                    >

                      {/* IMAGE */}

                      <div className="vendor-listing-image">

                        <img
                          src={image(
                            room.images?.[0]?.url ||
                            room.image
                          )}
                          alt={room.title}
                        />

                        <span
                          className={statusClass(
                            roomStatus
                          )}
                        >
                          {roomStatus}
                        </span>

                        <span className="vendor-image-count">
                          ▧ {imageCount}
                        </span>

                      </div>

                      {/* CONTENT */}

                      <div className="vendor-listing-body">

                        <div className="vendor-listing-title-row">

                          <div>
                            <h3>
                              {room.title}
                            </h3>

                            <p>
                              📍 {room.location}
                            </p>
                          </div>

                        </div>

                        <div className="vendor-listing-price">
                          {room.price}
                          <span>
                            / month
                          </span>
                        </div>

                        <div className="vendor-listing-meta">

                          <span>
                            ⌂ {room.type}
                          </span>

                          <span>
                            ▧ {imageCount} images
                          </span>

                        </div>

                        <p className="vendor-listing-description">
                          {room.description}
                        </p>

                        {roomStatus ===
                          'REJECTED' &&
                          room.rejectionReason && (
                            <div className="vendor-rejection-box">

                              <strong>
                                Rejection reason
                              </strong>

                              <p>
                                {
                                  room.rejectionReason
                                }
                              </p>

                              <a
                                href="#/list-room"
                              >
                                Create a corrected listing →
                              </a>

                            </div>
                          )}

                        {roomStatus ===
                          'PENDING' && (
                            <div className="vendor-pending-box">
                              <span>
                                ◷
                              </span>

                              <div>
                                <strong>
                                  Waiting for approval
                                </strong>

                                <p>
                                  Admin is reviewing
                                  your listing.
                                </p>
                              </div>
                            </div>
                          )}

                        {roomStatus ===
                          'APPROVED' && (
                            <div className="vendor-approved-box">
                              <span>
                                ✓
                              </span>

                              <div>
                                <strong>
                                  Live on SetHome
                                </strong>

                                <p>
                                  Your listing is
                                  visible to renters.
                                </p>
                              </div>
                            </div>
                          )}

                        <div className="vendor-listing-footer">

                          <button
                            type="button"
                            onClick={() =>
                              setStatus(
                                'Listing details view will be connected next.'
                              )
                            }
                          >
                            View Details
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setStatus(
                                'Editing will use an admin-approved change request workflow.'
                              )
                            }
                          >
                            Request Edit
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          ) : (

            <div className="vendor-empty-state">

              <div>
                ▣
              </div>

              <h3>
                No listings found
              </h3>

              <p>
                {filter === 'ALL'
                  ? 'You have not submitted any listings yet.'
                  : `You do not have any ${filter.toLowerCase()} listings.`}
              </p>

              <a
                href="#/list-room"
                className="vendor-add-btn"
              >
                ＋ Add New Listing
              </a>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}
function AdminDashboard() {
  const [rooms, setRooms] =
    useState<Room[]>([]);
  const [requests, setRequests] =
    useState<HomeRequest[]>([]);
  const [status, setStatus] =
    useState('');
  const load = () =>
    Promise.all([
      api.pendingRooms(),
      api.adminRequests()
    ])
      .then(
        ([pending, submitted]) => {
          setRooms(pending);
          setRequests(submitted);
          setStatus(
            'Dashboard refreshed.'
          );
        }
      )
      .catch(error =>
        setStatus(errorText(error))
      );
  useEffect(() => {
    void load();
  }, []);
  const roomAction = async (
    room: Room,
    action: 'approve' | 'reject'
  ) => {
    try {
      if (action === 'approve') {
        await api.approveRoom(room.id);
      } else {
        await api.rejectRoom(
          room.id,
          window.prompt(
            'Optional rejection reason:'
          ) || ''
        );
      }
      load();
    } catch (error) {
      setStatus(errorText(error));
    }
  };
  const requestAction = async (
    request: HomeRequest,
    nextStatus: string
  ) => {
    try {
      await api.updateRequest(
        request.requestId,
        nextStatus,
        window.prompt(
          'Optional admin response:'
        ) || ''
      );
      load();
    } catch (error) {
      setStatus(errorText(error));
    }
  };
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">
            ADMINISTRATION
          </span>
          <h1>Admin Dashboard</h1>
          <p>
            Review and manage submitted room
            listings and renter requests.
          </p>
        </div>
      </section>
      <section className="section section-muted">
        <div className="container">
          <div className="admin-welcome">
            <div>
              <span className="eyebrow blue">
                ROOM MANAGEMENT
              </span>
              <h2>Pending Listings</h2>
              <p>
                Review vendor submissions
                before they become public.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={load}
            >
              Refresh
            </button>
          </div>
          <Status
            message={status}
            kind={
              status ===
              'Dashboard refreshed.'
                ? 'success'
                : 'error'
            }
          />
          <div className="admin-room-grid">
            {rooms.map(room => (
              <article
                className="admin-room-card"
                key={room.id}
              >
                <img
                  src={image(room.image)}
                  alt={room.title}
                />
                <h3>{room.title}</h3>
                <p>{room.location}</p>
                <p>{room.price}</p>
                <p>{room.description}</p>
                <div className="admin-card-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      roomAction(
                        room,
                        'approve'
                      )
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      roomAction(
                        room,
                        'reject'
                      )
                    }
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!rooms.length && (
            <div className="empty-state">
              <p>
                No pending listings.
              </p>
            </div>
          )}
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="form-heading">
            <span className="eyebrow">
              Renter Requests
            </span>
            <h2>Home Requests</h2>
            <p>
              Review and manage requests
              submitted by renters.
            </p>
          </div>
          {requests.map(request => (
            <RequestCard
              key={request.requestId}
              request={request}
              admin={nextStatus =>
                requestAction(
                  request,
                  nextStatus
                )
              }
            />
          ))}
          {!requests.length && (
            <div className="empty-state">
              <p>
                No renter requests yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
function About() {
  return (
    <>
      <section className="about-hero">
        <div className="about-hero-image">
          <img
            src="/assets/images/aboutus3.png"
            alt=""
          />
        </div>
        <div className="about-hero-overlay" />
        <div className="container about-hero-content">
          <div className="about-eyebrow">
            <span>ABOUT</span>
            <span>SETHOME</span>
          </div>
          <br />
          <br />
          <h1>
            Making Room Hunting Simple
          </h1>
          <p>
            <b>
              <br />
              <br />
              We connect people looking for a
              place to live with property owners
              in Lohegaon, Pune.
            </b>
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container two-column">
          <div className="about-image">
            <img
              src="/assets/images/about-room.svg"
              alt="A room"
            />
          </div>
          <div className="about-copy">
            <span className="eyebrow blue">
              OUR MISSION
            </span>
            <h2>
              Find a place that feels like home.
            </h2>
            <p>
              SetHome makes local rental
              discovery clearer, faster and more
              direct for renters and property
              owners.
            </p>
            <a
              className="btn btn-primary"
              href="#/"
            >
              Explore Rooms
            </a>
          </div>
        </div>
      </section>
      <section className="section section-muted">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow blue">
              WHY SETHOME
            </span>
            <h2>Why Choose Us</h2>
          </div>
          <div className="feature-grid">
            {[
              ['✓', 'Verified Listings'],
              ['⌕', 'Local Focus'],
              ['☎', 'Direct Contact'],
              ['↗', 'Easy Discovery'],
              ['◷', 'Save Time'],
              ['★', 'User Friendly']
            ].map(([icon, title]) => (
              <article
                className="feature"
                key={title}
              >
                <div className="feature-icon">
                  {icon}
                </div>
                <h3>{title}</h3>
                <p>
                  Simple tools focused on local
                  rental discovery.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
export function App() {
  const route = useRoute();
  const session = useSession();
  const content = useMemo(() => {
    switch (route.path) {
      case '/about':
        return <About />;
      case '/login':
        return (
          <AuthPage
            mode="login"
            route={route}
            setUser={session.setUser}
          />
        );
      case '/register':
        return (
          <AuthPage
            mode="register"
            route={route}
            setUser={session.setUser}
          />
        );
      case '/list-room':
        return (
          <Guard
            user={session.user}
            role="VENDOR"
          >
            <ListRoom />
          </Guard>
        );
      case '/request-home':
        return (
          <Guard
            user={session.user}
            role="USER"
          >
            <RequestHome route={route} />
          </Guard>
        );
      case '/renter-dashboard':
        return session.user?.role === 'USER' ? (
          <RenterDashboard
            user={session.user}
          />
        ) : (
          <Guard
            user={session.user}
            role="USER"
          >
            <></>
          </Guard>
        );
      case '/vendor-dashboard':
        return session.user?.role === 'VENDOR' ? (
          <VendorDashboard
            user={session.user}
          />
        ) : (
          <Guard
            user={session.user}
            role="VENDOR"
          >
            <></>
          </Guard>
        );
      case '/admin':
        return (
          <Guard
            user={session.user}
            role="ADMIN"
          >
            <AdminDashboard />
          </Guard>
        );
      default:
        return (
          <Home user={session.user} />
        );
    }
  }, [
    route,
    session.user
  ]);
  return (
    <Layout
      user={session.user}
      logout={session.logout}
    >
      {session.loading ? (
        <section className="section">
          <div className="container">
            Loading SetHome…
          </div>
        </section>
      ) : (
        content
      )}
    </Layout>
  );
}