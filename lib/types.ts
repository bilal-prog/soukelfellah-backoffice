export type UserRole = "user" | "admin";

export type LocationReference = {
  _id: string;
  name: string;
  type: "region" | "province" | "commune" | "village";
  parentId?: string | LocationReference;
  isActive: boolean;
  coordinates?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt?: string;
  updatedAt?: string;
};

export type UserLocation = {
  address: string;
  region?: string;
  province?: string;
  commune?: string;
  village?: string;
  coordinates?: {
    type: "Point";
    coordinates: [number, number];
  };
};

export type User = {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsappNumber?: string;
  avatarFileId?: string;
  role: UserRole;
  isActive: boolean;
  isPhoneVerified: boolean;
  location?: UserLocation;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message?: string;
  data: T[];
  meta: {
    total: number;
    limit: number;
    page: number;
    pages: number;
  };
};

export type UsersResponse = PaginatedResponse<User>;

export type Category = {
  _id: string;
  name: string;
  slug: string;
  icon?: string | { _id: string; url: string };
  isActive: boolean;
};

export type ProductType = {
  _id: string;
  categoryId: string | Category;
  name: string;
  slug: string;
  allowedUnits: string[] | any[];
  isActive?: boolean;
};

export type MeasurementUnit = {
  _id: string;
  name: string;
  darijaName: string;
  isActive: boolean;
};

export type FileUpload = {
  _id: string;
  url: string;
  publicId: string;
  mimeType: string;
  size: number;
};

export type ListingStatus = "draft" | "active" | "paused" | "sold" | "expired" | "rejected";

export type Listing = {
  _id: string;
  title: string;
  description: string;
  sellerId: User | string;
  categoryId: Category | string;
  productTypeId: ProductType | string;
  productVariantId?: { _id: string; name: string } | string;
  listingType: "PRODUCT" | "EQUIPMENT";
  listingDirection: "SELL" | "BUY";
  priceType: "FIXED" | "NEGOTIABLE" | "CONTACT";
  price?: number;
  currency: string;
  quantity: number;
  unitId: MeasurementUnit | string;
  condition?: "NEW" | "USED";
  purpose?: "SELL" | "RENT";
  modelYear?: string;
  hours?: string;
  images: FileUpload[] | string[];
  location: UserLocation;
  status: ListingStatus;
  viewsCount?: number;
  callsCount?: number;
  messagesCount?: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListingsResponse = PaginatedResponse<Listing>;

export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

export type Report = {
  _id: string;
  reporterId: User;
  listingId: Listing;
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
};

export type ReportsResponse = PaginatedResponse<Report>;

export type NotificationType = "view" | "like" | "system" | "marketing";

export type Notification = {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  isDeleted: boolean;
  metadata?: Record<string, any>;
  createdBy?: string | User;
  recipientCount?: number;
  createdAt: string;
};

export type NotificationsResponse = PaginatedResponse<Notification>;

export type MarketingPayload = {
  target: "all" | "specific";
  userIds?: string[];
  title: string;
  message: string;
  imageUrl?: string;
};

export type AdminStats = {
  totalUsers: number;
  totalListings: number;
  totalReports: number;
  totalActiveListings: number;
  totalViews?: number;
  totalCalls?: number;
  totalMessages?: number;
};

export type AppVersion = {
  _id: string;
  platform: "ios" | "android";
  versionNumber: string;
  buildNumber: number;
  isForceUpdate: boolean;
  isInMaintenance: boolean;
  releaseNotes: string;
  downloadUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuditLog = {
  _id: string;
  userId?: User;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
};

export type AuditLogsResponse = PaginatedResponse<AuditLog>;

export type Setting = {
  _id?: string;
  phone: string;
  contactEmail: string;
  supportEmail: string;
  createdAt?: string;
  updatedAt?: string;
};

